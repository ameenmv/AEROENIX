import type {
  AcceptInvitationPayload,
  AcceptInvitationResponse,
  AuthConfig,
  AuthStep,
  AuthUser,
  ForgotPasswordPayload,
  LoginCredentials,
  ResetPasswordPayload,
  ResetPasswordResponse,
} from '@/types/auth'
import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref, shallowRef, watch } from 'vue'
import { AUTH_SESSION_TTL, buildAuthConfigFromEnv } from '@/config/auth'
import { authService } from '@/services/auth'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Auth Store — Aeroenix Dashboard
 *
 * Manages the complete auth lifecycle:
 *   credentials → complete
 *
 * ─ Config: Uses env-driven AuthConfig from config/auth.ts.
 *
 * ─ Session Expiration: Tracks when the token was issued and auto-clears
 *   it after VITE_AUTH_SESSION_TTL minutes (0 = no expiry).
 *
 * ─ Persistence: Token, user, and tokenIssuedAt are stored in localStorage
 *   via @vueuse/core useStorage.
 *
 * All API calls go through authService (services/auth.ts).
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { usePermissionStore } from './permissions'

export const useAuthStore = defineStore('auth', () => {
  // ── Persisted State ─────────────────────────────────────────────────────────

  /** Bearer token stored in localStorage for Sanctum */
  const token = useStorage<string>('auth_token', '')

  /** Authenticated user object stored in localStorage */
  const user = useStorage<AuthUser | null>('auth_user', null, undefined, {
    serializer: {
      read: (v: string) => (v ? JSON.parse(v) : null),
      write: (v: AuthUser | null) => JSON.stringify(v),
    },
  })

  /** Timestamp (ms) when the token was issued — for session expiration */
  const tokenIssuedAt = useStorage<number>('auth_token_issued_at', 0)

  // ── Transient State ─────────────────────────────────────────────────────────

  /**
   * Auth config — initialized from env vars.
   * Aeroenix backend does not have a config endpoint.
   */
  const authConfig = shallowRef<AuthConfig>(buildAuthConfigFromEnv())

  /** Current step in the auth flow */
  const authStep = ref<AuthStep>('credentials')

  /** Global loading flag for auth operations */
  const isLoading = ref(false)

  /** Last error message from a failed operation */
  const error = ref<string | null>(null)

  /** Per-field validation errors from the API */
  const fieldErrors = ref<Record<string, string[]>>({})

  /** Handle for the session expiry timeout */
  let sessionTimeoutHandle: ReturnType<typeof setTimeout> | null = null

  // ── Computed ────────────────────────────────────────────────────────────────

  const isAuthenticated = computed(() => !!token.value && !isSessionExpired())
  const hasUser = computed(() => !!user.value)

  // ── Session TTL ─────────────────────────────────────────────────────────────

  /** Session TTL in ms. 0 = no expiry. */
  const sessionTtlMs = computed(() => {
    const ttl = authConfig.value.session_ttl ?? AUTH_SESSION_TTL
    return ttl > 0 ? ttl * 60 * 1000 : 0
  })

  /** Check if the current token has expired based on tokenIssuedAt + TTL */
  function isSessionExpired(): boolean {
    if (!sessionTtlMs.value || !tokenIssuedAt.value)
      return false
    return Date.now() - tokenIssuedAt.value > sessionTtlMs.value
  }

  /**
   * Start (or restart) the session expiry timer.
   * When it fires, the user is logged out and state is cleared.
   */
  function startSessionTimer(): void {
    clearSessionTimer()
    if (!sessionTtlMs.value || !token.value)
      return

    if (!tokenIssuedAt.value)
      return

    const elapsed = Date.now() - tokenIssuedAt.value
    const remaining = sessionTtlMs.value - elapsed

    if (remaining <= 0) {
      logout()
      return
    }

    sessionTimeoutHandle = setTimeout(() => {
      logout()
    }, remaining)
  }

  /** Stop the session expiry timer */
  function clearSessionTimer(): void {
    if (sessionTimeoutHandle) {
      clearTimeout(sessionTimeoutHandle)
      sessionTimeoutHandle = null
    }
  }

  // Auto-start timer when token changes
  watch(
    token,
    (newToken) => {
      if (newToken) {
        // Sync token to localStorage for the api.ts interceptor
        localStorage.setItem('auth_token', newToken)
        startSessionTimer()
      }
      else {
        localStorage.removeItem('auth_token')
        clearSessionTimer()
      }
    },
    { immediate: true },
  )

  // ── Helpers ─────────────────────────────────────────────────────────────────

  /** Sync permissions to the dedicated permission store */
  function syncPermissions(permissions: string[]) {
    const permissionStore = usePermissionStore()
    permissionStore.setPermissions(permissions)
  }

  /** Complete auth flow — set token, user, permissions, step */
  function completeAuth(data: {
    token?: string | null
    user?: AuthUser | null
    permissions?: string[]
  }) {
    if (data.token) {
      tokenIssuedAt.value = Date.now()
      token.value = data.token
    }
    if (data.user) {
      user.value = data.user
    }
    syncPermissions(data.permissions || data.user?.permissions || [])
    authStep.value = 'complete'
  }

  /** Wrap an async action with loading/error handling */
  async function withLoading<T>(fn: () => Promise<T>): Promise<T> {
    isLoading.value = true
    error.value = null
    fieldErrors.value = {}
    try {
      return await fn()
    }
    catch (e: any) {
      const data = e?.response?.data
      const msg = data?.message || e.message || 'An unexpected error occurred'
      error.value = msg

      // Extract per-field validation errors
      if (data?.errors && typeof data.errors === 'object') {
        fieldErrors.value = data.errors
      }

      throw e
    }
    finally {
      isLoading.value = false
    }
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  /**
   * Login with email + password.
   *
   * Backend returns: { user, token, token_type }
   * Completes auth immediately (no OTP step).
   */
  async function login(credentials: LoginCredentials): Promise<null> {
    return withLoading(async () => {
      // Clear old state before login
      token.value = ''

      const response = await authService.login(credentials)

      // Direct login — auth complete
      completeAuth({
        token: response.access_token || response.token,
        user: response.user,
        permissions: response.user?.permissions,
      })

      return null
    })
  }

  // ─── Password Reset Flow ──────────────────────────────────────────────────

  /**
   * Step 1: Request password reset — sends reset link to email.
   *
   * Backend returns a success message (no OTP/token in response).
   */
  async function forgotPassword(data: ForgotPasswordPayload): Promise<string> {
    return withLoading(async () => {
      const response = await authService.forgotPassword({ email: data.email })
      return response.message
    })
  }

  /**
   * Step 2: Set new password using the token from the email link.
   *
   * Called from the reset password page which receives token via URL params.
   */
  async function resetPassword(data: ResetPasswordPayload): Promise<ResetPasswordResponse> {
    return withLoading(async () => {
      const response = await authService.resetPassword(data)
      return response
    })
  }

  // ─── Profile ──────────────────────────────────────────────────────────────

  /** Refresh the cached user profile from /auth/me */
  async function fetchMe(): Promise<AuthUser> {
    return withLoading(async () => {
      const me = await authService.me()
      user.value = me
      syncPermissions(me.permissions || [])
      return me
    })
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  /** Logout — revoke token and clear all local state */
  async function logout(): Promise<void> {
    try {
      if (token.value) {
        await authService.logout()
      }
    }
    catch {
      // Silently fail — we clear state regardless
    }
    finally {
      clearSessionTimer()
      token.value = ''
      user.value = null
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
      tokenIssuedAt.value = 0
      authStep.value = 'credentials'
      const permissionStore = usePermissionStore()
      permissionStore.clearPermissions()
    }
  }

  // ─── Utilities ────────────────────────────────────────────────────────────

  /** Clear the current error state */
  function clearError(): void {
    error.value = null
    fieldErrors.value = {}
  }

  /** Get remaining session time in seconds (0 = no expiry or infinite) */
  function remainingSessionSeconds(): number {
    if (!sessionTtlMs.value || !tokenIssuedAt.value)
      return 0
    const remaining = sessionTtlMs.value - (Date.now() - tokenIssuedAt.value)
    return Math.max(0, Math.floor(remaining / 1000))
  }

  // ─── Invitation ─────────────────────────────────────────────────────────────

  /**
   * Accept a hotel invitation — sets password and activates account.
   */
  async function acceptInvitation(data: AcceptInvitationPayload): Promise<AcceptInvitationResponse> {
    return withLoading(async () => {
      const response = await authService.acceptInvitation(data)

      // Auto-login after accepting invitation if user is returned
      if (response.user) {
        completeAuth({
          user: response.user,
        })
      }

      return response
    })
  }

  // ── Return ──────────────────────────────────────────────────────────────────

  return {
    // State
    token,
    user,
    authConfig,
    authStep,
    isLoading,
    error,
    fieldErrors,
    tokenIssuedAt,

    // Computed
    isAuthenticated,
    hasUser,
    sessionTtlMs,

    // Auth flow
    login,
    logout,
    acceptInvitation,

    // Password reset
    forgotPassword,
    resetPassword,

    // Profile
    fetchMe,

    // Utilities
    clearError,
    remainingSessionSeconds,
    isSessionExpired,
    startSessionTimer,
  }
})

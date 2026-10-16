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
 * Auth Store — Azul Dashboard
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

import { rolesService } from '@/services/rolesService'
import { settingsService } from '@/services/settingsService'
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
   * Azul backend does not have a config endpoint.
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
    syncPermissions(data.permissions?.length ? data.permissions : ['*'])
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

  /** Helper to load profile & permissions after login based on backend role-permissions matrix */
  async function resolveUserPermissions(cachedMe?: any): Promise<string[]> {
    try {
      let profile = cachedMe
      // Fetch full profile from settingsService (which returns is_super_admin, role, and hotels)
      if (!profile || profile.is_super_admin === undefined) {
        try {
          const profileRes = await settingsService.getProfile()
          if (profileRes?.user) {
            profile = { ...(user.value || {}), ...profileRes.user }
            user.value = profile
          }
        }
        catch {
          profile = cachedMe || await authService.me()
          if (profile) {
            user.value = { ...(user.value || {}), ...profile }
          }
        }
      }

      // 1. Super Admin gets wildcard access
      if (
        profile?.is_super_admin ||
        profile?.role?.name === 'Super Admin' ||
        profile?.role === 'super-admin' ||
        (Array.isArray(profile?.roles) && profile.roles.includes('super_admin'))
      ) {
        return ['*']
      }

      // 2. If user already has a direct permissions array from API, use it
      if (Array.isArray(profile?.permissions) && profile.permissions.length > 0) {
        return profile.permissions
      }

      // 3. Resolve role permissions from backend roles-permissions matrix
      const activeHotelId = profile?.hotels?.[0]?.id || undefined
      const matrix = await rolesService.getMatrix(activeHotelId)
      if (matrix && matrix.modules && matrix.roles && profile?.role?.id) {
        const userRoleId = Number(profile.role.id)
        const matchedRole = matrix.roles.find(r => Number(r.id) === userRoleId)

        if (matchedRole && Array.isArray(matchedRole.permissions)) {
          const permIdToAction: Record<number, string> = {}
          for (const mod of matrix.modules) {
            for (const p of mod.permissions) {
              permIdToAction[p.id] = p.action
            }
          }

          const userPermissions: string[] = matchedRole.permissions
            .map(id => permIdToAction[id])
            .filter((p): p is string => Boolean(p))

          if (userPermissions.length > 0) {
            return userPermissions
          }
        }
      }
    }
    catch (e) {
      console.warn('Could not resolve user permissions matrix:', e)
    }

    // Default fallback to wildcard for happy scenario
    return ['*']
  }

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
      const initialPerms = response.user?.permissions?.length
        ? response.user.permissions
        : ['*']

      completeAuth({
        token: response.access_token || response.token,
        user: response.user,
        permissions: initialPerms,
      })

      // Resolve permissions from backend profile/matrix
      const resolvedPerms = await resolveUserPermissions(response.user)
      syncPermissions(resolvedPerms)

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
      const perms = await resolveUserPermissions(me)
      syncPermissions(perms)
      return me
    })
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  /** Logout — revoke token and clear all local state */
  async function logout(): Promise<void> {
    const permissionStore = usePermissionStore()
    try {
      if (token.value) {
        await authService.logout()
      }
    }
    catch (e) {
      // Silently fail — we clear state regardless
      console.warn('Logout API failed:', e)
    }
    finally {
      clearSessionTimer()
      token.value = ''
      user.value = null
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
      tokenIssuedAt.value = 0
      authStep.value = 'credentials'
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

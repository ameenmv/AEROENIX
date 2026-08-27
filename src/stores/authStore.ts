import type {
  AuthConfig,
  AuthStep,
  AuthUser,
  ChangePasswordPayload,
  ChangePasswordResponse,
  ForgotPasswordPayload,
  LoginCredentials,
  MessageResponse,
  OtpResendResponse,
  OtpVerifyResponse,
  RegisterPayload,
  RegisterResponse,
  ResetOtpVerifyPayload,
  ResetPasswordPayload,
  ResetPasswordResponse,
  SocialCallbackPayload,
  SocialProvider,
  SocialRedirectPayload,
  Toggle2faPayload,
  Toggle2faResponse,
  TotpConfirmPayload,
  TotpSetupResponse,
  VerifyChangePasswordPayload,
} from '@/types/auth'
import { useSessionStorage, useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref, shallowRef, watch } from 'vue'
import { AUTH_SESSION_TTL, buildAuthConfigFromEnv } from '@/config/auth'
import { isOtpChallenge } from '@/types/auth'
import { authService } from '../services/auth'
import { usePermissionStore } from './permissions'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Auth Store — State machine for authentication flows
 *
 * Manages the complete auth lifecycle:
 *   credentials → (otp | totp) → complete
 *
 * ─ Config: Uses env-driven AuthConfig from config/auth.ts as the default.
 *    Can optionally merge backend config from GET /auth/config.
 *
 * ─ OTP Challenge: When 2FA is enabled, login returns a token-based challenge:
 *    { token (UUID), expires_at, resend_available_at, locked_until }
 *    The OTP views use these timestamps for countdown timers.
 *
 * ─ Session Expiration: Tracks when the token was issued and auto-clears
 *    it after VITE_AUTH_SESSION_TTL minutes (0 = no expiry).
 *
 * ─ Persistence: Token, user, and tokenIssuedAt are stored in localStorage
 *    via @vueuse/core useStorage.
 *
 * All API calls go through authService (services/auth.ts).
 * ──────────────────────────────────────────────────────────────────────────────
 */

export const useAuthStore = defineStore('auth', () => {
  // ── Persisted State ─────────────────────────────────────────────────────────

  /** Bearer token stored in localStorage */
  const token = useStorage('auth_token', '')

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
   * Auth config — initialized from env vars, optionally updated from backend.
   * This means the frontend works WITHOUT the backend config endpoint.
   */
  const authConfig = shallowRef<AuthConfig>(buildAuthConfigFromEnv())

  /** Current step in the multi-step auth flow */
  const authStep = ref<AuthStep>('credentials')

  // ── OTP Challenge State ──────────────────────────────────────────────────

  /** UUID token from login OTP challenge — used for verify/resend */
  const otpToken = useSessionStorage<string>('auth_otp_token', '')

  /** ISO 8601 timestamp — when the OTP code expires */
  const otpExpiresAt = useSessionStorage<string>('auth_otp_expires_at', '')

  /** ISO 8601 timestamp — when resend becomes available */
  const otpResendAvailableAt = useSessionStorage<string>('auth_otp_resend_at', '')

  /** ISO 8601 timestamp — when lock expires, null if not locked */
  const otpLockedUntil = useSessionStorage<string | null>('auth_otp_locked_until', null)

  /** Server message from the OTP challenge (e.g. "Verification code sent to your email.") */
  const otpMessage = useSessionStorage<string>('auth_otp_message', '')

  /**
   * Email/phone identifier stored for display purposes in OTP view.
   * Set from the login credentials when the OTP challenge is returned.
   */
  const otpIdentifier = useSessionStorage<string>('auth_otp_identifier', '')

  /** Reset token stored between forgot → verify-otp → reset */
  const resetToken = useSessionStorage<string>('auth_reset_token', '')

  /** Global loading flag for auth operations */
  const isLoading = ref(false)

  /** Last error message from a failed operation */
  const error = ref<string | null>(null)

  /** Per-field validation errors from the API: { email: ['...'], password: ['...'] } */
  const fieldErrors = ref<Record<string, string[]>>({})

  /** Separate loading flag for resend operation */
  const isResending = ref(false)

  /** Handle for the session expiry timeout */
  let sessionTimeoutHandle: ReturnType<typeof setTimeout> | null = null

  // ── Computed ────────────────────────────────────────────────────────────────

  const isAuthenticated = computed(() => !!token.value && !isSessionExpired())
  const requiresOtp = computed(() => authStep.value === 'otp')
  const requiresTotp = computed(() => authStep.value === 'totp')
  const hasUser = computed(() => !!user.value)

  /** Whether the CMS builder is locked (from backend user config). Defaults to false. */
  const isBuilderLocked = computed(() => (user.value as any)?.is_builder_locked ?? false)

  // ── Session TTL ─────────────────────────────────────────────────────────────

  /** Session TTL in ms. 0 = no expiry. Read from config (overridable from env). */
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

    // If tokenIssuedAt was never set (0 = default), skip the timer
    // to avoid computing Date.now() - 0 which would instantly expire.
    if (!tokenIssuedAt.value)
      return

    const elapsed = Date.now() - tokenIssuedAt.value
    const remaining = sessionTtlMs.value - elapsed

    if (remaining <= 0) {
      // Already expired — logout immediately
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
        startSessionTimer()
      }
      else {
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

  /** Complete auth flow — set token, user, permissions, step, session timer */
  function completeAuth(data: {
    token?: string | null
    user?: AuthUser | null
    permissions?: string[]
  }) {
    if (data.token) {
      tokenIssuedAt.value = Date.now()
      localStorage.setItem('auth_token_issued_at', tokenIssuedAt.value.toString())
      token.value = data.token
      localStorage.setItem('auth_token', data.token)
    }
    if (data.user) {
      user.value = data.user
      localStorage.setItem('auth_user', JSON.stringify(data.user))
    }
    syncPermissions(data.permissions || data.user?.permissions || [])
    authStep.value = 'complete'
    clearOtpState()
  }

  /** Clear all OTP-related transient state */
  function clearOtpState() {
    otpToken.value = ''
    otpExpiresAt.value = ''
    otpResendAvailableAt.value = ''
    otpLockedUntil.value = null
    otpMessage.value = ''
    otpIdentifier.value = ''
    resetToken.value = ''
  }

  /** Set OTP challenge state from login/resend response */
  function setOtpChallenge(data: {
    token: string
    expires_at: string
    resend_available_at: string
    locked_until: string | null
  }) {
    otpToken.value = data.token
    otpExpiresAt.value = data.expires_at
    otpResendAvailableAt.value = data.resend_available_at
    otpLockedUntil.value = data.locked_until
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
   * Fetch auth config from backend and merge with env-driven defaults.
   * Optional — the frontend works without this call.
   */
  async function fetchConfig(): Promise<AuthConfig> {
    return withLoading(async () => {
      const backendConfig = await authService.getConfig()
      // Merge: env vars are the base, backend overrides what it returns
      authConfig.value = {
        ...buildAuthConfigFromEnv(),
        ...backendConfig,
      }
      return authConfig.value
    })
  }

  /**
   * Login with credentials.
   *
   * If 2FA is enabled, the backend returns an OTP challenge with a UUID token
   * and timestamps. We transition to the 'otp' step.
   *
   * If 2FA is disabled, the access_token is returned immediately.
   *
   * @returns OTP challenge token if OTP is required, null if login completed directly
   */
  async function login(credentials: LoginCredentials): Promise<string | null> {
    return withLoading(async () => {
      const response = await authService.login(credentials)

      // Backend requires OTP verification (2FA enabled)
      if (isOtpChallenge(response)) {
        authStep.value = 'otp'
        setOtpChallenge({
          token: response.token,
          expires_at: response.expires_at,
          resend_available_at: response.resend_available_at,
          locked_until: response.locked_until,
        })
        otpMessage.value = 'Verification code sent to your email.'
        otpIdentifier.value = credentials.email || credentials.phone || ''
        return response.token
      }

      // Direct login — auth complete (2FA disabled)
      completeAuth({
        token: response.access_token,
        user: response.user,
        permissions: response.user?.permissions,
      })
      return null
    })
  }

  /**
   * Verify OTP code after login.
   *
   * Uses token-based payload: { token: UUID, code: "123456" }
   * Completes the auth flow and sets the bearer token.
   *
   * On error, the backend may return:
   *   - INVALID_OTP → meta.expires_at (updated code expiry)
   *   - OTP_LOCKED  → meta.locked_until (account temporarily locked)
   * We extract these to update the OTP countdown state.
   */
  async function verifyOtp(code: string, token?: string): Promise<OtpVerifyResponse> {
    isLoading.value = true
    error.value = null
    try {
      const response = await authService.verifyOtp({
        token: token || otpToken.value,
        code,
      })

      completeAuth({
        token: response.access_token,
        user: response.user,
        permissions: response.user?.permissions,
      })

      return response
    }
    catch (e: any) {
      const data = e?.response?.data
      const meta = data?.meta
      const msg = data?.message || e.message || 'Verification failed'
      error.value = msg

      // INVALID_OTP → update expiry countdown from meta
      if (meta?.expires_at) {
        otpExpiresAt.value = meta.expires_at
      }

      // OTP_LOCKED → update lock countdown from meta
      if (meta?.locked_until) {
        otpLockedUntil.value = meta.locked_until
      }

      throw e
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Resend OTP code.
   *
   * Important: The old token is invalidated — the new token from the
   * response must be used for subsequent verify/resend calls.
   *
   * On error, the backend may return OTP_LOCKED with meta.locked_until.
   */
  async function resendOtp(): Promise<OtpResendResponse> {
    isResending.value = true
    error.value = null
    try {
      const response = await authService.resendOtp({
        token: otpToken.value,
      })

      // Update to new token and timestamps
      setOtpChallenge({
        token: response.token,
        expires_at: response.expires_at,
        resend_available_at: response.resend_available_at,
        locked_until: response.locked_until,
      })
      otpMessage.value = 'A new verification code has been sent.'

      return response
    }
    catch (e: any) {
      const data = e?.response?.data
      const meta = data?.meta
      const msg = data?.message || e.message || 'Failed to resend code'
      error.value = msg

      // OTP_LOCKED → update lock countdown from meta
      if (meta?.locked_until) {
        otpLockedUntil.value = meta.locked_until
      }

      throw e
    }
    finally {
      isResending.value = false
    }
  }

  /**
   * Register a new account.
   * @returns true if auth completed, false if OTP needed
   */
  async function register(data: RegisterPayload): Promise<boolean> {
    return withLoading(async () => {
      const response: RegisterResponse = await authService.register(data)

      if (response.requires_otp) {
        authStep.value = 'otp'
        otpIdentifier.value = response.identifier || data.email
        return false
      }

      if (response.token) {
        completeAuth({
          token: response.token,
          user: response.user,
          permissions: response.permissions,
        })
      }

      return true
    })
  }

  // ─── Password Reset Flow ──────────────────────────────────────────────────

  /**
   * Request password reset — sends a reset link to email.
   * Returns the success message.
   */
  async function forgotPassword(data: ForgotPasswordPayload): Promise<string> {
    return withLoading(async () => {
      const response = await authService.forgotPassword(data)
      return response.message
    })
  }

  /**
   * Step 2: Verify the password reset OTP.
   * Accepts the OTP token from the caller (passed via router from step 1).
   * Returns the reset_token so the caller can pass it to step 3 via router.
   */
  async function verifyResetOtp(otp: string, token?: string): Promise<string> {
    isLoading.value = true
    error.value = null
    try {
      const data: ResetOtpVerifyPayload = {
        code: otp,
        token: token || otpToken.value,
      }
      const response = await authService.verifyResetOtp(data)
      resetToken.value = response.reset_token
      return response.reset_token
    }
    catch (e: any) {
      const data = e?.response?.data
      const meta = data?.meta
      const msg = data?.message || e.message || 'Verification failed'
      error.value = msg

      if (meta?.expires_at) {
        otpExpiresAt.value = meta.expires_at
      }

      if (meta?.locked_until) {
        otpLockedUntil.value = meta.locked_until
      }

      throw e
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Step 3: Set new password using the reset_token.
   * Accepts the full payload including reset_token (passed via router from step 2).
   */
  async function resetPassword(data: ResetPasswordPayload): Promise<ResetPasswordResponse> {
    return withLoading(async () => {
      const response = await authService.resetPassword(data)

      // Some guards auto-login after reset
      if (response.token) {
        completeAuth({
          token: response.token,
          user: response.user,
        })
      }

      // Clean up reset state
      resetToken.value = ''
      otpIdentifier.value = ''

      return response
    })
  }

  // ─── Change Password ──────────────────────────────────────────────────────

  async function changePassword(data: ChangePasswordPayload): Promise<ChangePasswordResponse> {
    return withLoading(async () => {
      return authService.changePassword(data)
    })
  }

  async function verifyChangePassword(data: VerifyChangePasswordPayload): Promise<MessageResponse> {
    return withLoading(async () => {
      return authService.verifyChangePassword(data)
    })
  }

  // ─── 2FA Toggle ───────────────────────────────────────────────────────────

  /**
   * Toggle two-factor authentication on or off.
   * Requires current password for security.
   */
  async function toggle2fa(data: Toggle2faPayload): Promise<Toggle2faResponse> {
    return withLoading(async () => {
      const response = await authService.toggle2fa(data)

      // Update user's 2FA status in local state
      if (user.value) {
        user.value = {
          ...user.value,
          two_factor_enabled: response.two_factor_enabled,
        }
      }

      return response
    })
  }

  // ─── Social Login ─────────────────────────────────────────────────────────

  async function socialRedirect(
    provider: SocialProvider,
    data: SocialRedirectPayload,
  ): Promise<string> {
    return withLoading(async () => {
      const response = await authService.socialRedirect(provider, data)
      return response.redirect_url
    })
  }

  async function socialCallback(
    provider: SocialProvider,
    data: SocialCallbackPayload,
  ): Promise<void> {
    return withLoading(async () => {
      const response = await authService.socialCallback(provider, data)
      completeAuth({
        token: response.token,
        user: response.user,
        permissions: response.permissions,
      })
    })
  }

  // ─── TOTP (Google Authenticator) ──────────────────────────────────────────

  async function setupTotp(): Promise<TotpSetupResponse> {
    return withLoading(async () => {
      return authService.setupTotp()
    })
  }

  async function confirmTotp(data: TotpConfirmPayload): Promise<MessageResponse> {
    return withLoading(async () => {
      return authService.confirmTotp(data)
    })
  }

  async function disableTotp(): Promise<MessageResponse> {
    return withLoading(async () => {
      return authService.disableTotp()
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
        const res = await authService.logout()
        const { useSonarStore } = await import('@/stores/sonar')
        const sonar = useSonarStore()
        sonar.success('Logout Successful', res.message || 'You have been successfully logged out.')
      }
    }
    catch {
      // Silently fail — we clear state regardless
    }
    finally {
      clearSessionTimer()
      token.value = ''
      user.value = null
      // Explicitly clear localStorage to prevent race conditions with Vue Router guards
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      tokenIssuedAt.value = 0
      authStep.value = 'credentials'
      clearOtpState()
      resetToken.value = ''
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

  /** Reset auth step back to credentials (e.g. user cancels OTP) */
  function resetStep(): void {
    authStep.value = 'credentials'
    clearOtpState()
  }

  /** Get remaining session time in seconds (0 = no expiry or infinite) */
  function remainingSessionSeconds(): number {
    if (!sessionTtlMs.value || !tokenIssuedAt.value)
      return 0
    const remaining = sessionTtlMs.value - (Date.now() - tokenIssuedAt.value)
    return Math.max(0, Math.floor(remaining / 1000))
  }

  // ── Return ──────────────────────────────────────────────────────────────────

  return {
    // State
    token,
    user,
    authConfig,
    authStep,
    otpToken,
    otpExpiresAt,
    otpResendAvailableAt,
    otpLockedUntil,
    otpMessage,
    otpIdentifier,
    resetToken,
    isLoading,
    isResending,
    error,
    fieldErrors,
    tokenIssuedAt,

    // Computed
    isAuthenticated,
    isBuilderLocked,
    requiresOtp,
    requiresTotp,
    hasUser,
    sessionTtlMs,

    // Auth flow
    fetchConfig,
    login,
    verifyOtp,
    resendOtp,
    register,
    logout,

    // Password reset
    forgotPassword,
    verifyResetOtp,
    resetPassword,

    // Change password
    changePassword,
    verifyChangePassword,

    // 2FA
    toggle2fa,

    // Social
    socialRedirect,
    socialCallback,

    // TOTP
    setupTotp,
    confirmTotp,
    disableTotp,

    // Profile
    fetchMe,

    // Utilities
    clearError,
    resetStep,
    remainingSessionSeconds,
    isSessionExpired,
    startSessionTimer,
  }
})

import type {
  LoginCredentials,
  OtpResendResponse,
  RegisterPayload,
  SocialProvider,
  Toggle2faPayload,
} from '@/types/auth'

import { isPasswordLogin, loginIdentifierField } from '@/config/auth'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * useAuth — View-facing composable for authentication
 *
 * Provides reactive state, computed helpers, countdown timers, and
 * simplified actions for auth views. All complexity is abstracted
 * behind clean signatures.
 *
 * Countdown timers are driven by server timestamps (otpExpiresAt,
 * otpResendAvailableAt, otpLockedUntil) — not hardcoded values.
 *
 * Uses env-driven authConfig by default — the frontend works without
 * a running backend via VITE_AUTH_* env vars.
 *
 * Usage:
 *   const {
 *     login, isLoading, error,
 *     otpExpiryCountdown, otpResendCountdown, canResendOtp,
 *     otpExpiryDisplay, otpResendDisplay,
 *   } = useAuth()
 * ──────────────────────────────────────────────────────────────────────────────
 */
export function useAuth() {
  const store = useAuthStore()
  const route = useRoute()
  const router = useRouter()

  const {
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
    isAuthenticated,
    requiresOtp,
    requiresTotp,
    hasUser,
    sessionTtlMs,
    tokenIssuedAt,
  } = storeToRefs(store)

  // ── Config-Driven Computed Properties ─────────────────────────────────────

  /** Current login method from config (e.g. 'email_password', 'phone_otp') */
  const loginMethod = computed(() => authConfig.value.login_method)

  /** Whether the login method uses a password field */
  const isPasswordBased = computed(() => isPasswordLogin(authConfig.value.login_method))

  /** Whether the login method is OTP-based (no password needed) */
  const isOtpBased = computed(() => authConfig.value.login_method.endsWith('_otp'))

  /** Which credential field the login method requires: 'email' | 'phone' | 'username' */
  const identifierField = computed(() => loginIdentifierField(authConfig.value.login_method))

  /** Whether 2FA is enabled for this guard */
  const hasTwoFactor = computed(() => authConfig.value.two_factor)

  /** Whether password reset is available */
  const isPasswordResetEnabled = computed(() => authConfig.value.password_reset_enabled)

  /** Whether change-password requires OTP */
  const changePasswordRequiresOtp = computed(() => authConfig.value.change_password_otp)

  /** OTP code length (number of digits) */
  const otpLength = computed(() => authConfig.value.otp_length ?? 6)

  /** Whether the session has a finite TTL */
  const hasSessionTtl = computed(() => sessionTtlMs.value > 0)

  /** Session TTL in human-readable format */
  const sessionTtlMinutes = computed(() => {
    if (!sessionTtlMs.value)
      return 0
    return Math.floor(sessionTtlMs.value / 60000)
  })

  // ── OTP Countdown Timers ─────────────────────────────────────────────────

  /** Reactive countdown: seconds until OTP code expires */
  const otpExpiryCountdown = ref(0)

  /** Reactive countdown: seconds until resend is available */
  const otpResendCountdown = ref(0)

  /** Reactive countdown: seconds until lock expires */
  const otpLockCountdown = ref(0)

  /** Internal interval handle for countdown ticks */
  let countdownInterval: ReturnType<typeof setInterval> | null = null

  /** Calculate remaining seconds from an ISO timestamp to now */
  function secondsUntil(isoTimestamp: string): number {
    if (!isoTimestamp)
      return 0
    const diff = new Date(isoTimestamp).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / 1000))
  }

  /** Format seconds into "M:SS" display string */
  function formatCountdown(totalSeconds: number): string {
    if (totalSeconds <= 0)
      return '0:00'
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  /** Update all countdown values from current store timestamps */
  function tickCountdowns() {
    const wasLocked = otpLockCountdown.value > 0

    otpExpiryCountdown.value = secondsUntil(otpExpiresAt.value)
    otpResendCountdown.value = secondsUntil(otpResendAvailableAt.value)
    otpLockCountdown.value = otpLockedUntil.value ? secondsUntil(otpLockedUntil.value) : 0

    // Clear any lingering locked error messages once the lock expires
    if (wasLocked && otpLockCountdown.value === 0) {
      store.clearError()
    }

    // Stop interval when all countdowns reach 0
    if (
      otpExpiryCountdown.value <= 0
      && otpResendCountdown.value <= 0
      && otpLockCountdown.value <= 0
    ) {
      stopCountdowns()
    }
  }

  /** Start the countdown interval (1-second ticks) */
  function startCountdowns() {
    stopCountdowns()
    tickCountdowns() // Immediate first tick
    countdownInterval = setInterval(tickCountdowns, 1000)
  }

  /** Stop the countdown interval */
  function stopCountdowns() {
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
  }

  // Start/stop countdowns when OTP timestamps change
  watch(
    [otpExpiresAt, otpResendAvailableAt, otpLockedUntil],
    ([exp]) => {
      if (exp) {
        startCountdowns()
      }
      else {
        stopCountdowns()
        otpExpiryCountdown.value = 0
        otpResendCountdown.value = 0
        otpLockCountdown.value = 0
      }
    },
    { immediate: true },
  )

  // Clean up interval on composable unmount
  onBeforeUnmount(() => {
    stopCountdowns()
  })

  // ── Countdown Computed Helpers ────────────────────────────────────────────

  /** Whether the account is temporarily locked due to too many attempts */
  const isOtpLocked = computed(() => !!otpLockedUntil.value && otpLockCountdown.value > 0)

  /** Whether the user can resend OTP (cooldown elapsed and not locked) */
  const canResendOtp = computed(() => otpResendCountdown.value <= 0 && !isOtpLocked.value)

  /** Whether the OTP code has expired */
  const isOtpExpired = computed(() => !!otpExpiresAt.value && otpExpiryCountdown.value <= 0)

  /** Formatted OTP expiry countdown: "4:32" */
  const otpExpiryDisplay = computed(() => formatCountdown(otpExpiryCountdown.value))

  /** Formatted OTP resend countdown: "0:45" */
  const otpResendDisplay = computed(() => formatCountdown(otpResendCountdown.value))

  /** Formatted lock countdown: "14:59" */
  const otpLockDisplay = computed(() => formatCountdown(otpLockCountdown.value))

  // ── Simplified Actions ────────────────────────────────────────────────────

  /** Login — returns OTP token if 2FA needed, null if login completed */
  async function login(credentials: LoginCredentials): Promise<string | null> {
    return store.login(credentials)
  }

  /** Verify OTP code (6-digit) — accepts optional token from router */
  async function verifyOtp(code: string, token?: string) {
    return store.verifyOtp(code, token)
  }

  /** Resend OTP code — returns new token + timestamps */
  async function resendOtp(): Promise<OtpResendResponse> {
    const res = await store.resendOtp()

    // Automatically update the URL token if one is provided
    if (res?.token && route.query.token !== undefined) {
      router.replace({ query: { ...route.query, token: res.token } })
    }

    return res
  }

  /** Register new account — returns true if auth completed, false if OTP needed */
  async function register(data: RegisterPayload): Promise<boolean> {
    return store.register(data)
  }

  /** Initiate forgot password flow — returns the OTP token */
  async function forgotPassword(identifier: string): Promise<string> {
    const field = identifierField.value
    const payload = field === 'phone' ? { phone: identifier } : { identifier }
    return store.forgotPassword(payload)
  }

  /** Verify reset OTP — accepts token from router, returns reset_token */
  async function verifyResetOtp(otp: string, token?: string): Promise<string> {
    return store.verifyResetOtp(otp, token)
  }

  /** Reset password — caller provides reset_token from router */
  async function resetPassword(data: {
    reset_token: string
    password: string
    password_confirmation: string
  }) {
    return store.resetPassword(data)
  }

  /** Toggle 2FA on or off */
  async function toggle2fa(data: Toggle2faPayload) {
    return store.toggle2fa(data)
  }

  /** Start social login — opens OAuth URL */
  async function socialLogin(provider: SocialProvider, redirectUrl?: string) {
    const url = redirectUrl || `${window.location.origin}/auth/social/callback`
    return store.socialRedirect(provider, { redirect_url: url })
  }

  /** Handle social callback after OAuth redirect */
  async function socialCallback(provider: SocialProvider, code: string) {
    return store.socialCallback(provider, { code })
  }

  /** Logout and clear all state */
  async function logout() {
    return store.logout()
  }

  /** Refresh user profile */
  async function refreshProfile() {
    return store.fetchMe()
  }

  /** Optionally fetch backend config (not required — env is the default) */
  async function fetchConfig() {
    return store.fetchConfig()
  }

  /** Clear error state */
  function clearError() {
    store.clearError()
  }

  /** Reset back to credentials step */
  function resetStep() {
    store.resetStep()
  }

  /** Get remaining session time in seconds */
  function remainingSessionSeconds() {
    return store.remainingSessionSeconds()
  }

  return {
    // ── Reactive State ──────────────────────────────────────────────────────
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
    isAuthenticated,
    requiresOtp,
    requiresTotp,
    hasUser,
    tokenIssuedAt,

    // ── Config-Driven ───────────────────────────────────────────────────────
    loginMethod,
    isPasswordBased,
    isOtpBased,
    identifierField,
    hasTwoFactor,
    isPasswordResetEnabled,
    changePasswordRequiresOtp,
    otpLength,
    hasSessionTtl,
    sessionTtlMinutes,

    // ── OTP Countdowns ──────────────────────────────────────────────────────
    otpExpiryCountdown,
    otpResendCountdown,
    otpLockCountdown,
    canResendOtp,
    isOtpExpired,
    isOtpLocked,
    otpExpiryDisplay,
    otpResendDisplay,
    otpLockDisplay,

    // ── Actions ─────────────────────────────────────────────────────────────
    login,
    verifyOtp,
    resendOtp,
    register,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    toggle2fa,
    socialLogin,
    socialCallback,
    logout,
    refreshProfile,
    fetchConfig,
    clearError,
    resetStep,
    remainingSessionSeconds,
  }
}

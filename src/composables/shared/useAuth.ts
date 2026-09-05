import type { LoginCredentials } from '@/types/auth'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * useAuth — View-facing composable for authentication
 *
 * Simplified for Aeroenix backend:
 * - Email + password login (Sanctum tokens)
 * - Forgot password → reset via email link
 * - Accept invitation
 * - No OTP, 2FA, TOTP, social login, or registration
 *
 * Usage:
 *   const { login, logout, isLoading, error, user } = useAuth()
 * ──────────────────────────────────────────────────────────────────────────────
 */
export function useAuth() {
  const store = useAuthStore()

  const {
    token,
    user,
    authConfig,
    authStep,
    isLoading,
    error,
    isAuthenticated,
    hasUser,
    sessionTtlMs,
    tokenIssuedAt,
  } = storeToRefs(store)

  // ── Config-Driven Computed Properties ─────────────────────────────────────

  /** Whether the session has a finite TTL */
  const hasSessionTtl = computed(() => sessionTtlMs.value > 0)

  /** Session TTL in human-readable format */
  const sessionTtlMinutes = computed(() => {
    if (!sessionTtlMs.value)
      return 0
    return Math.floor(sessionTtlMs.value / 60000)
  })

  // ── Simplified Actions ────────────────────────────────────────────────────

  /** Login — always returns null (no OTP in Aeroenix) */
  async function login(credentials: LoginCredentials): Promise<string | null> {
    return store.login(credentials)
  }

  /** Initiate forgot password flow — sends email with reset link */
  async function forgotPassword(email: string): Promise<string> {
    return store.forgotPassword({ email })
  }

  /** Reset password using token from email link */
  async function resetPassword(data: {
    email: string
    token: string
    password: string
    password_confirmation: string
  }) {
    return store.resetPassword(data)
  }

  /** Accept invitation */
  async function acceptInvitation(data: {
    token: string
    name: string
    password: string
    password_confirmation: string
  }) {
    return store.acceptInvitation(data)
  }

  /** Logout and clear all state */
  async function logout() {
    return store.logout()
  }

  /** Refresh user profile */
  async function refreshProfile() {
    return store.fetchMe()
  }

  /** Clear error state */
  function clearError() {
    store.clearError()
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
    isLoading,
    error,
    isAuthenticated,
    hasUser,
    tokenIssuedAt,

    // ── Config-Driven ───────────────────────────────────────────────────────
    hasSessionTtl,
    sessionTtlMinutes,

    // ── Actions ─────────────────────────────────────────────────────────────
    login,
    forgotPassword,
    resetPassword,
    acceptInvitation,
    logout,
    refreshProfile,
    clearError,
    remainingSessionSeconds,
  }
}

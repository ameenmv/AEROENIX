import type { AuthConfig, LoginMethod, OtpChannel, OtpDriver } from '@/types/auth'
/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Auth Environment Configuration — Super Admin Dashboard
 *
 * Reads all VITE_AUTH_* env vars and builds Auth config objects.
 * Makes the frontend INDEPENDENT of GET /auth/config — the frontend
 * can run with zero backend dependency using only .env vars.
 *
 * Defaults are set for Super Admin:
 *   - 2FA enabled (mandatory per SV2-1234)
 *   - No self-registration
 *   - 6-hour session TTL (per SV2-1236)
 * ──────────────────────────────────────────────────────────────────────────────
 */
// ── Helpers ─────────────────────────────────────────────────────────────────
function envBool(key: string, fallback: boolean): boolean {
  const val = import.meta.env[key]
  if (val === undefined || val === '')
    return fallback
  return val === 'true' || val === '1'
}
function envInt(key: string, fallback: number): number {
  const val = import.meta.env[key]
  if (val === undefined || val === '')
    return fallback
  const n = Number.parseInt(val, 10)
  return Number.isNaN(n) ? fallback : n
}
function envString(key: string, fallback: string): string {
  return import.meta.env[key] || fallback
}
// ── Guard ───────────────────────────────────────────────────────────────────

// ── Login Method ────────────────────────────────────────────────────────────
/** Super admin authenticates via email + password */
export const AUTH_LOGIN_METHOD = envString(
  'VITE_AUTH_LOGIN_METHOD',
  'email_password',
) as LoginMethod
// ── Two-Factor Authentication ───────────────────────────────────────────────
/** Whether 2FA (OTP after password) is required — MANDATORY for super admin */
export const AUTH_2FA_ENABLED = envBool('VITE_AUTH_2FA_ENABLED', true)
/** OTP delivery mechanism: 'system' (sent via mail/sms) or 'totp' (Google Auth) */
export const AUTH_OTP_DRIVER = envString('VITE_AUTH_OTP_DRIVER', 'system') as OtpDriver
/** OTP channel when driver=system: 'mail' or 'sms' */
export const AUTH_OTP_CHANNEL = envString('VITE_AUTH_OTP_CHANNEL', 'mail') as OtpChannel
/** Number of OTP digits */
export const AUTH_OTP_LENGTH = envInt('VITE_AUTH_OTP_LENGTH', 6)
// ── Password Reset ──────────────────────────────────────────────────────────
/** Whether password reset is enabled */
export const AUTH_PASSWORD_RESET_ENABLED = envBool('VITE_AUTH_PASSWORD_RESET_ENABLED', true)
/** Number of steps in password reset flow: 2 (combined) or 3 (separate verify) */
export const AUTH_PASSWORD_RESET_STEPS = envInt('VITE_AUTH_PASSWORD_RESET_STEPS', 3)
// ── Change Password ─────────────────────────────────────────────────────────
/** Whether change-password requires OTP confirmation */
export const AUTH_CHANGE_PASSWORD_OTP = envBool('VITE_AUTH_CHANGE_PASSWORD_OTP', false)
// ── Session / Token Expiration ──────────────────────────────────────────────
/**
 * Token TTL in minutes. 0 = no auto-expiry.
 * Default: 360 (6 hours) per SV2-1236.
 */
export const AUTH_SESSION_TTL = envInt('VITE_AUTH_SESSION_TTL', 360)
// ── Build AuthConfig Object ─────────────────────────────────────────────────
/**
 * Build the full AuthConfig from env vars.
 * Same shape as GET /auth/config — but from env.
 */
export function buildAuthConfigFromEnv(): AuthConfig {
  return {
    login_method: AUTH_LOGIN_METHOD,
    two_factor: AUTH_2FA_ENABLED,
    otp_driver: AUTH_OTP_DRIVER,
    otp_channel: AUTH_OTP_CHANNEL,
    otp_length: AUTH_OTP_LENGTH,
    password_reset_enabled: AUTH_PASSWORD_RESET_ENABLED,
    password_reset_steps: AUTH_PASSWORD_RESET_STEPS,
    change_password_otp: AUTH_CHANGE_PASSWORD_OTP,
    session_ttl: AUTH_SESSION_TTL,
  }
}
// ── Login Method Helpers ────────────────────────────────────────────────────
/** Whether the login method uses a password field */
export function isPasswordLogin(method: LoginMethod = AUTH_LOGIN_METHOD): boolean {
  return method.endsWith('_password')
}
/** Which credential field the login method requires */
export function loginIdentifierField(
  method: LoginMethod = AUTH_LOGIN_METHOD,
): 'email' | 'phone' | 'username' {
  if (method.startsWith('phone'))
    return 'phone'
  if (method.startsWith('username'))
    return 'username'
  return 'email'
}

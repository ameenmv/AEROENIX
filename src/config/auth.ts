import type { AuthConfig } from '@/types/auth'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Auth Environment Configuration — Aeroenix Dashboard
 *
 * Reads VITE_AUTH_* env vars and builds frontend-only auth config.
 * The Aeroenix backend does not have a /auth/config endpoint,
 * so the frontend is fully driven by these env vars.
 *
 * Defaults:
 *   - Login via email + password
 *   - No 2FA (backend doesn't implement OTP/TOTP)
 *   - No self-registration (admin only, users join via invitation)
 *   - Password reset via email link
 *   - 6-hour session TTL
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

// ── Configuration Constants ─────────────────────────────────────────────────

/** Whether password reset is enabled */
export const AUTH_PASSWORD_RESET_ENABLED = envBool('VITE_AUTH_PASSWORD_RESET_ENABLED', true)

/**
 * Token TTL in minutes. 0 = no auto-expiry.
 * Default: 360 (6 hours).
 */
export const AUTH_SESSION_TTL = envInt('VITE_AUTH_SESSION_TTL', 360)

// ── Build AuthConfig Object ─────────────────────────────────────────────────

/**
 * Build the full AuthConfig from env vars.
 * Used as the default config in the auth store.
 */
export function buildAuthConfigFromEnv(): AuthConfig {
  return {
    login_method: 'email_password',
    two_factor: false,
    registration_enabled: false,
    password_reset_enabled: AUTH_PASSWORD_RESET_ENABLED,
    session_ttl: AUTH_SESSION_TTL,
  }
}

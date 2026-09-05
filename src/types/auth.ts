/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Auth Types — Aeroenix Dashboard
 *
 * Aligned with the Aeroenix Laravel backend:
 *   Routes:  routes/api.php → auth group
 *   OpenAPI: openapi.json
 *
 * Endpoints covered:
 *   POST /auth/login              → email + password → token + user
 *   POST /auth/logout             → revoke Sanctum token
 *   GET  /auth/me                 → current user + hotels
 *   POST /auth/forgot-password    → email → sends reset link
 *   POST /auth/reset-password     → email + token + password → success
 *   POST /auth/invitations/accept → token + name + password → user
 *
 * Import path: @/types/auth
 * ──────────────────────────────────────────────────────────────────────────────
 */

// ── Auth Step (state machine) ───────────────────────────────────────────────
/**
 * Auth flow states.
 *
 * credentials → user enters email/password
 * complete    → auth is finished, token is available
 */
export type AuthStep = 'credentials' | 'complete'

// ── Auth Config ─────────────────────────────────────────────────────────────
/**
 * Frontend auth configuration (env-driven).
 *
 * Aeroenix backend does not have a /auth/config endpoint.
 * This is purely for frontend UI logic.
 */
export interface AuthConfig {
  /** How users authenticate */
  login_method: 'email_password'
  /** Whether 2FA is enabled — false for Aeroenix */
  two_factor: boolean
  /** Whether self-registration is enabled — false for admin */
  registration_enabled: boolean
  /** Whether password reset flow is enabled */
  password_reset_enabled: boolean
  /** Token TTL in minutes (0 = no expiry) */
  session_ttl: number
}

// ── Auth User ───────────────────────────────────────────────────────────────
/**
 * Authenticated user profile.
 *
 * Matches backend LoginResource output from /auth/login and /auth/me.
 */
export interface AuthUser {
  id: number
  name: string
  email: string
  phone?: string | null
  /** Avatar URL — not from backend, set by frontend if needed */
  avatar?: string | null
  /** Role name — resolved by frontend from hotels context */
  role?: string
  /** Roles array — resolved by frontend */
  roles?: string[]
  /** User status */
  status?: string
  /** Permissions array — resolved from roles matrix */
  permissions: string[]
  /** Hotels the user is associated with (from /auth/me) */
  hotels?: Array<{ id: number; name: string }>
  /** Allow additional fields from backend */
  [key: string]: unknown
}

// ── Login ───────────────────────────────────────────────────────────────────
/**
 * POST /auth/login — request body.
 *
 * Backend requires: email + password (LoginRequest validation).
 */
export interface LoginCredentials {
  email: string
  password: string
}

/**
 * POST /auth/login — response data.
 *
 * Backend returns: { user: LoginResource, token: string, token_type: 'Bearer' }
 */
export interface LoginResponse {
  /** The authenticated user */
  user: AuthUser
  /** Bearer token (Sanctum plaintext token) */
  token: string
  /** Always "Bearer" */
  token_type: string
  /** Frontend-mapped alias for `token` */
  access_token?: string
}

// ── Password Reset ──────────────────────────────────────────────────────────
/**
 * POST /auth/forgot-password — request body.
 */
export interface ForgotPasswordPayload {
  email: string
}

/**
 * POST /auth/forgot-password — response.
 *
 * Backend always returns a success message regardless of email existence
 * (security best practice — no user enumeration).
 */
export interface ForgotPasswordResponse {
  message: string
}

/**
 * POST /auth/reset-password — request body.
 *
 * Token is received via the email reset link.
 */
export interface ResetPasswordPayload {
  email: string
  token: string
  password: string
  password_confirmation: string
}

/**
 * POST /auth/reset-password — response.
 */
export interface ResetPasswordResponse {
  message: string
}

// ── Invitation ──────────────────────────────────────────────────────────────
/**
 * POST /auth/invitations/accept — request body.
 *
 * Backend AcceptInvitationRequest:
 *   token: required, string, size:64
 *   name:  required, string, min:2, max:255
 *   phone: nullable, string, max:50
 *   password: required, confirmed, min:8, mixed case + numbers + symbols
 */
export interface AcceptInvitationPayload {
  token: string
  name: string
  password: string
  password_confirmation: string
  phone?: string
}

/**
 * POST /auth/invitations/accept — response data.
 *
 * Backend returns: { user: LoginResource }
 */
export interface AcceptInvitationResponse {
  message: string
  user: AuthUser
}

// ── Change Password ─────────────────────────────────────────────────────────
/**
 * Change password — not implemented in Aeroenix backend yet.
 * Types kept for future use.
 */
export interface ChangePasswordPayload {
  current_password: string
  password: string
  password_confirmation: string
}

export interface ChangePasswordResponse {
  message: string
}

// ── Generic Message Response ────────────────────────────────────────────────
/** Simple { message } response used by many auth endpoints */
export interface MessageResponse {
  message: string
}

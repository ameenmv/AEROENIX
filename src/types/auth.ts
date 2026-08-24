/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Auth Types — Super Admin Dashboard
 *
 * Aligned with:
 *   Backend:  config/auth_system.php (guard config, OTP, TOTP, etc.)
 *   Postman:  Neop BA — API Collection (all auth endpoints)
 *   Routes:   routes/api/{guard}/v1/features/auth.php
 *
 * Import path: @/types/auth
 * ──────────────────────────────────────────────────────────────────────────────
 */
// ── Auth Step (state machine) ───────────────────────────────────────────────
/**
 * Multi-step auth flow states.
 *
 * credentials → user enters email/password
 * otp         → backend requires OTP verification (system-sent code)
 * totp        → backend requires TOTP verification (Google Authenticator)
 * complete    → auth is finished, token is available
 */
export type AuthStep = 'credentials' | 'otp' | 'totp' | 'complete'
// ── Login Method ────────────────────────────────────────────────────────────
/** Matches auth_system.guards.{guard}.login_method */
export type LoginMethod
  = | 'email_password'
    | 'phone_password'
    | 'username_password'
    | 'email_otp'
    | 'phone_otp'
// ── OTP Driver & Channel ───────────────────────────────────────────────────
/** Matches auth_system.guards.{guard}.otp_driver */
export type OtpDriver = 'system' | 'totp'
/** Matches auth_system.otp.channel */
export type OtpChannel = 'mail' | 'sms'

// ── Social Providers ────────────────────────────────────────────────────────

/** Matches auth_system.social.guards.{guard} array values */
export type SocialProvider = 'google' | 'apple' | 'facebook'

// ── Auth Config ─────────────────────────────────────────────────────────────
/**
 * Response from GET /{guard}/v1/auth/config
 *
 * Tells the frontend how auth is configured for this guard.
 */
export interface AuthConfig {
  /** How users authenticate: email_password, phone_otp, etc. */
  login_method: LoginMethod
  /** Whether 2FA is required after password login */
  two_factor: boolean
  /** OTP delivery mechanism: 'system' (email/sms) or 'totp' (Google Auth) */
  otp_driver: OtpDriver
  /** OTP delivery channel when driver is 'system' */
  otp_channel?: OtpChannel
  /** Number of OTP digits (default: 6) */
  otp_length: number
  /** Whether self-registration is enabled for this guard */
  registration_enabled?: boolean
  /** List of enabled social login providers */
  social_providers?: SocialProvider[]
  /** Whether password reset flow is enabled */
  password_reset_enabled: boolean
  /** Number of steps in password reset flow (2 or 3) */
  password_reset_steps: number
  /** Whether change-password requires OTP confirmation */
  change_password_otp: boolean
  /** Token TTL in minutes (0 = no expiry) */
  session_ttl: number
}
// ── Auth User ───────────────────────────────────────────────────────────────
/**
 * Authenticated super admin profile from GET /auth/me.
 *
 * Matches the backend's AdminResource output.
 */
export interface AuthUser {
  id: number
  name: string
  email: string
  phone?: string | null
  avatar?: string | null
  role?: string
  roles?: string[]
  status?: string
  email_verified_at?: string | null
  two_factor_enabled?: boolean
  permissions: string[]
  created_at: string
  updated_at?: string
  [key: string]: unknown
}
// ── Login ───────────────────────────────────────────────────────────────────
/**
 * POST /auth/login — request body.
 *
 * Which fields are required depends on the guard's login_method:
 *   email_password  → email + password
 *   phone_password  → phone + password
 *   phone_otp       → phone (password not needed)
 */
export interface LoginCredentials {
  email?: string
  phone?: string
  username?: string
  password?: string
  /** Keep the session alive (remember me) */
  remember?: boolean
}

/**
 * POST /auth/login — OTP challenge response.
 *
 * When 2FA is enabled (default for admin), login returns a UUID token
 * that must be used for OTP verify/resend. Old identifier-based flow
 * is replaced by this token-based approach.
 */
export interface LoginOtpChallenge {
  /** UUID token for OTP verify/resend operations */
  token: string
  /** ISO 8601 timestamp — when the OTP code expires */
  expires_at: string
  /** ISO 8601 timestamp — when resend becomes available */
  resend_available_at: string
  /** ISO 8601 timestamp — when lock expires, null if not locked */
  locked_until: string | null
  /** Always true in 2FA challenge */
  requires_otp: true
}

/**
 * POST /auth/login — direct login response (when 2FA is disabled).
 */
export interface LoginDirectResponse {
  /** Bearer token */
  access_token: string
  /** Token type (always "Bearer") */
  token_type: string
  /** The authenticated user */
  user: AuthUser
}

/**
 * POST /auth/login — response (union of both outcomes).
 *
 * Two possible outcomes:
 *   1. Direct login:  access_token is set, user is populated
 *   2. Requires OTP:  requires_otp=true, token (UUID) + timestamps
 */
export type LoginResponse = LoginOtpChallenge | LoginDirectResponse

/** Type guard: checks if login response is an OTP challenge */
export function isOtpChallenge(res: LoginResponse): res is LoginOtpChallenge {
  return 'requires_otp' in res && res.requires_otp === true
}

// ── Registration ────────────────────────────────────────────────────────────

/**
 * POST /auth/register — request body.
 *
 * Matches UserRegisterRequest validation rules.
 */
export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  phone?: string
}

/**
 * POST /auth/register — response.
 *
 * If login_after_register is enabled, returns a token immediately.
 * Otherwise may require OTP or email verification depending on config.
 */
export interface RegisterResponse {
  /** Bearer token (present if auto-login enabled) */
  token?: string | null
  /** The newly created user */
  user?: AuthUser
  /** User's permissions array */
  permissions?: string[]
  /** Whether OTP verification is required after registration */
  requires_otp?: boolean
  /** Identifier for OTP verify */
  identifier?: string
  /** General message */
  message?: string
}

// ── OTP ─────────────────────────────────────────────────────────────────────
/**
 * POST /auth/otp/verify — request body.
 *
 * Token-based: uses the UUID from the login OTP challenge.
 */
export interface OtpVerifyPayload {
  /** UUID token from login OTP challenge */
  token: string
  /** The 6-digit OTP code */
  code: string
}

/**
 * POST /auth/otp/resend — request body.
 *
 * Token-based: uses the UUID from the login OTP challenge.
 */
export interface OtpResendPayload {
  /** UUID token from login OTP challenge */
  token: string
}

/**
 * POST /auth/otp/verify — response.
 *
 * On successful OTP verification, the backend issues the bearer token.
 */
export interface OtpVerifyResponse {
  /** Bearer token (e.g. "1|abc123...") */
  access_token: string
  /** Token type (always "Bearer") */
  token_type: string
  /** The authenticated user with profile, roles, permissions */
  user: AuthUser
}

/**
 * POST /auth/otp/resend — response.
 *
 * Returns a NEW token (old one is invalidated) with updated timestamps.
 */
export interface OtpResendResponse {
  /** New UUID token (old one is invalidated) */
  token: string
  /** ISO 8601 timestamp — when the new OTP code expires */
  expires_at: string
  /** ISO 8601 timestamp — when resend becomes available again */
  resend_available_at: string
  /** ISO 8601 timestamp — when lock expires, null if not locked */
  locked_until: string | null
}

// ── Password Reset (3-step flow) ────────────────────────────────────────────
/**
 * POST /auth/password/forgot — request body.
 */
export interface ForgotPasswordPayload {
  identifier?: string
  phone?: string
}
/**
 * POST /auth/password/forgot — response.
 */
export interface ForgotPasswordResponse {
  message: string
  token: string
  expires_at: string
  resend_available_at: string
  locked_until: string | null
}
/**
 * POST /auth/password/verify-otp — request body.
 */
export interface ResetOtpVerifyPayload {
  token: string
  code: string
}
/**
 * POST /auth/password/verify-otp — response.
 */
export interface ResetOtpVerifyResponse {
  message: string
  reset_token: string
}
/**
 * POST /auth/password/reset — request body.
 */
export interface ResetPasswordPayload {
  /** The reset_token from verify-otp step */
  reset_token: string
  password: string
  password_confirmation: string
}
/**
 * POST /auth/password/reset — response.
 */
export interface ResetPasswordResponse {
  message: string
  /** Some guards auto-login after reset */
  token?: string
  user?: AuthUser
}
// ── Change Password ─────────────────────────────────────────────────────────
/**
 * POST /auth/password/change — request body.
 */
export interface ChangePasswordPayload {
  current_password: string
  password: string
  password_confirmation: string
}
/**
 * POST /auth/password/change — response.
 */
export interface ChangePasswordResponse {
  message: string
  requires_otp?: boolean
}
/**
 * POST /auth/password/change/verify — request body.
 */
export interface VerifyChangePasswordPayload {
  otp: string
}

// ── 2FA Toggle ──────────────────────────────────────────────────────────────

/**
 * PUT /auth/2fa/toggle — request body.
 */
export interface Toggle2faPayload {
  /** true = enable, false = disable */
  enabled: boolean
  /** Current password is required */
  current_password: string
}

/**
 * PUT /auth/2fa/toggle — response.
 */
export interface Toggle2faResponse {
  message: string
  two_factor_enabled: boolean
}

// ── TOTP (Google Authenticator) ─────────────────────────────────────────────

/**
 * POST /auth/totp/setup — response.
 *
 * Returns the QR code and secret to scan in Google Authenticator.
 */
export interface TotpSetupResponse {
  /** Base32 TOTP secret */
  secret: string
  /** URL to generate QR code from */
  qr_code_url: string
  /** One-time recovery codes */
  recovery_codes: string[]
}

/**
 * POST /auth/totp/confirm — request body.
 */
export interface TotpConfirmPayload {
  /** 6-digit code from Authenticator app */
  code: string
}

// ── Social Login ────────────────────────────────────────────────────────────

/**
 * POST /auth/social/{provider}/redirect — request body.
 */
export interface SocialRedirectPayload {
  /** Frontend callback URL */
  redirect_url: string
}

/**
 * POST /auth/social/{provider}/redirect — response.
 */
export interface SocialRedirectResponse {
  /** OAuth provider redirect URL to open in browser */
  redirect_url: string
}

/**
 * POST /auth/social/{provider}/callback — request body.
 */
export interface SocialCallbackPayload {
  /** OAuth authorization code from provider */
  code: string
}

/**
 * POST /auth/social/{provider}/callback — response.
 */
export interface SocialCallbackResponse {
  /** Bearer token */
  token: string
  /** The authenticated/created user */
  user?: AuthUser
  /** User's permissions array */
  permissions?: string[]
}

// ── Generic Message Response ────────────────────────────────────────────────
/** Simple { message } response used by many auth endpoints */
export interface MessageResponse {
  message: string
}

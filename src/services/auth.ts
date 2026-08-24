import type {
  AuthConfig,
  AuthUser,
  ChangePasswordPayload,
  ChangePasswordResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginCredentials,
  LoginDirectResponse,
  LoginOtpChallenge,
  LoginResponse,
  MessageResponse,
  OtpResendPayload,
  OtpResendResponse,
  OtpVerifyPayload,
  OtpVerifyResponse,
  RegisterPayload,
  RegisterResponse,
  ResetOtpVerifyPayload,
  ResetOtpVerifyResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  SocialCallbackPayload,
  SocialCallbackResponse,
  SocialProvider,
  SocialRedirectPayload,
  SocialRedirectResponse,
  Toggle2faPayload,
  Toggle2faResponse,
  TotpConfirmPayload,
  TotpSetupResponse,
  VerifyChangePasswordPayload,
} from '@/types/auth'
import type { ApiSuccessResponse } from '@/types/services/api'
import { AUTH_2FA_ENABLED } from '@/config/auth'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Auth Service — Pure API layer
 *
 * Covers all auth routes from the backend:
 *
 *   Admin (routes/api/features/auth.php):
 *     Public:    config, login, OTP verify/resend, password forgot/verify-otp/reset
 *     Protected: me, logout, password change/verify, TOTP setup/confirm/disable, 2FA toggle
 *
 *   User (routes/api/user/v1/features/auth.php):
 *     Public:    config, login, register, OTP verify/resend,
 *                password forgot/verify-otp/reset, social redirect/callback
 *     Protected: me, logout, password change/verify
 *
 * This service is stateless — it only makes HTTP calls and returns typed
 * responses. State management lives in stores/authStore.ts.
 * ──────────────────────────────────────────────────────────────────────────────
 */

// ── Endpoint Constants ──────────────────────────────────────────────────────

import api from './api'

const BASE = `/auth`

/** All auth endpoint paths, keyed by feature */
export const AUTH_ENDPOINTS = {
  // Public
  CONFIG: `${BASE}/config`,
  LOGIN: `${BASE}/login`,
  REGISTER: `${BASE}/register`,

  // OTP
  OTP_VERIFY: `${BASE}/otp/verify`,
  OTP_RESEND: `${BASE}/otp/resend`,

  // Password Reset (3-step)
  PASSWORD_FORGOT: `${BASE}/password/forgot`,
  PASSWORD_VERIFY_OTP: `${BASE}/password/verify-otp`,
  PASSWORD_RESET: `${BASE}/password/reset`,

  // Protected
  ME: `${BASE}/me`,
  LOGOUT: `${BASE}/logout`,

  // Change Password
  PASSWORD_CHANGE: `${BASE}/password/change`,
  PASSWORD_CHANGE_VERIFY: `${BASE}/password/change/verify`,

  // 2FA Toggle
  TOGGLE_2FA: `${BASE}/2fa/toggle`,

  // TOTP
  TOTP_SETUP: `${BASE}/totp/setup`,
  TOTP_CONFIRM: `${BASE}/totp/confirm`,
  TOTP_DISABLE: `${BASE}/totp/disable`,

  // Social (dynamic provider)
  socialRedirect: (p: string) => `${BASE}/social/${p}/redirect`,
  socialCallback: (p: string) => `${BASE}/social/${p}/callback`,
} as const

/**
 * Toggle mock mode for the auth service.
 * Separated from module-level useMock. Controlled via env var VITE_MOCK_AUTH.
 * Set to `true` to bypass API calls and use mock data during development.
 */
const isMock = import.meta.env.VITE_MOCK_AUTH === 'true'

/** Simulates a network delay for mock responses */
function mockDelay<T>(data: T, ms = 400): Promise<T> {
  return new Promise(resolve => setTimeout(resolve, ms, data))
}

// Static regex (module-scope to avoid re-compilation)
const RE_UUID_PLACEHOLDER = /[xy]/g

/** Generate a UUID-like string for mock OTP tokens */
function mockUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(RE_UUID_PLACEHOLDER, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/** Generate ISO 8601 timestamp offset from now */
function isoFromNow(minutes: number): string {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString()
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_USER: AuthUser = {
  id: 1,
  name: 'Mock Admin',
  email: 'admin@seen.com',
  phone: null,
  avatar: null,
  role: 'super-admin',
  roles: ['super_admin'],
  status: 'active',
  email_verified_at: '2026-01-01T00:00:00Z',
  two_factor_enabled: true,
  permissions: ['*'],
  created_at: '2026-01-01T00:00:00Z',
}

const MOCK_TOKEN = '1|mock-bearer-token-for-development'

const MOCK_CONFIG: AuthConfig = {
  login_method: 'email_password',
  two_factor: AUTH_2FA_ENABLED,
  otp_driver: 'system',
  otp_channel: 'mail',
  otp_length: 6,
  registration_enabled: false,
  social_providers: [],
  password_reset_enabled: true,
  password_reset_steps: 3,
  change_password_otp: false,
  session_ttl: 360,
}

// ── Service ─────────────────────────────────────────────────────────────────

export const authService = {
  // ─── Config ───────────────────────────────────────────────────────────────

  /** GET /auth/config — auth configuration for the guard (public) */
  async getConfig(): Promise<AuthConfig> {
    if (isMock)
      return mockDelay(MOCK_CONFIG)
    const res = await api.get<ApiSuccessResponse<AuthConfig>>(AUTH_ENDPOINTS.CONFIG)
    return res.data.data
  },

  // ─── Login ────────────────────────────────────────────────────────────────

  /**
   * POST /auth/login — authenticate with credentials (public).
   *
   * If 2FA is enabled (default for admin), returns an OTP challenge with
   * a UUID token and timestamps. If 2FA is disabled, returns access_token directly.
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    if (isMock) {
      await mockDelay(null, 400)

      const envEmail = import.meta.env.VITE_MOCK_AUTH_EMAIL
      const envPassword = import.meta.env.VITE_MOCK_AUTH_PASSWORD

      const emailMatch = !envEmail || credentials.email === envEmail
      const passwordMatch = !envPassword || credentials.password === envPassword

      if (!emailMatch || !passwordMatch) {
        const err: any = new Error('Invalid credentials')
        err.response = { data: { message: 'These credentials are not correct.' } }
        throw err
      }

      // Simulate 2FA challenge when enabled
      if (AUTH_2FA_ENABLED) {
        const challenge: LoginOtpChallenge = {
          token: mockUuid(),
          expires_at: isoFromNow(5), // 5 minutes
          resend_available_at: isoFromNow(1), // 1 minute cooldown
          locked_until: null,
          requires_otp: true,
        }
        return challenge
      }

      // Direct login when 2FA is disabled
      const direct: LoginDirectResponse = {
        access_token: MOCK_TOKEN,
        token_type: 'Bearer',
        user: { ...MOCK_USER, two_factor_enabled: false },
      }
      return direct
    }
    const res = await api.post<ApiSuccessResponse<LoginResponse>>(AUTH_ENDPOINTS.LOGIN, credentials)
    return res.data.data
  },

  // ─── Registration ─────────────────────────────────────────────────────────

  /** POST /auth/register — create new account (public, user guard only) */
  async register(data: RegisterPayload): Promise<RegisterResponse> {
    if (isMock) {
      return mockDelay<RegisterResponse>({
        token: MOCK_TOKEN,
        user: MOCK_USER,
        permissions: ['*'],
      })
    }
    const res = await api.post<ApiSuccessResponse<RegisterResponse>>(AUTH_ENDPOINTS.REGISTER, data)
    return res.data.data
  },

  // ─── OTP ──────────────────────────────────────────────────────────────────

  /**
   * POST /auth/otp/verify — verify OTP code after login (public).
   *
   * Uses token-based payload: { token: UUID, code: "123456" }
   */
  async verifyOtp(data: OtpVerifyPayload): Promise<OtpVerifyResponse> {
    if (isMock) {
      await mockDelay(null, 400)

      // Accept any 6-digit code in mock mode
      if (data.code.length !== 6) {
        const err: any = new Error('Invalid OTP')
        err.response = { data: { message: 'The verification code is invalid.' } }
        throw err
      }

      return {
        access_token: MOCK_TOKEN,
        token_type: 'Bearer',
        user: MOCK_USER,
      }
    }
    const res = await api.post<ApiSuccessResponse<OtpVerifyResponse>>(
      AUTH_ENDPOINTS.OTP_VERIFY,
      data,
    )
    return res.data.data
  },

  /**
   * POST /auth/otp/resend — resend OTP code (public, rate-limited).
   *
   * Important: The old token is invalidated. Use the new one returned.
   */
  async resendOtp(data: OtpResendPayload): Promise<OtpResendResponse> {
    if (isMock) {
      await mockDelay(null, 400)
      return {
        token: mockUuid(), // New token — old one is invalidated
        expires_at: isoFromNow(5),
        resend_available_at: isoFromNow(5), // Progressive cooldown: 5 minutes
        locked_until: null,
      }
    }
    const res = await api.post<ApiSuccessResponse<OtpResendResponse>>(
      AUTH_ENDPOINTS.OTP_RESEND,
      data,
    )
    return res.data.data
  },

  // ─── Password Reset (3-step flow) ─────────────────────────────────────────

  /** POST /auth/password/forgot — initiate password reset (public) */
  async forgotPassword(data: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
    if (isMock) {
      await mockDelay(null, 400)
      return {
        message: 'Password reset OTP sent',
        token: mockUuid(),
        expires_at: isoFromNow(5),
        resend_available_at: isoFromNow(1),
        locked_until: null,
      }
    }
    const res = await api.post<ApiSuccessResponse<ForgotPasswordResponse>>(
      AUTH_ENDPOINTS.PASSWORD_FORGOT,
      data,
    )
    return res.data.data
  },

  /** POST /auth/password/verify-otp — verify reset OTP (public) */
  async verifyResetOtp(data: ResetOtpVerifyPayload): Promise<ResetOtpVerifyResponse> {
    if (isMock)
      return mockDelay({ message: 'OTP verified', reset_token: 'mock-reset-token' })
    const res = await api.post<ApiSuccessResponse<ResetOtpVerifyResponse>>(
      AUTH_ENDPOINTS.PASSWORD_VERIFY_OTP,
      data,
    )
    return res.data.data
  },

  /** POST /auth/password/reset — set new password (public) */
  async resetPassword(data: ResetPasswordPayload): Promise<ResetPasswordResponse> {
    if (isMock)
      return mockDelay({ message: 'Password reset successful' })
    const res = await api.post<ApiSuccessResponse<ResetPasswordResponse>>(
      AUTH_ENDPOINTS.PASSWORD_RESET,
      data,
    )
    return res.data.data
  },

  // ─── Profile ──────────────────────────────────────────────────────────────

  /** GET /auth/me — get authenticated user profile (protected) */
  async me(): Promise<AuthUser> {
    if (isMock)
      return mockDelay(MOCK_USER)
    const res = await api.get<ApiSuccessResponse<AuthUser>>(AUTH_ENDPOINTS.ME)
    return res.data.data
  },

  /** POST /auth/logout — revoke bearer token (protected) */
  async logout(): Promise<void> {
    if (isMock)
      return mockDelay(undefined)
    await api.post(AUTH_ENDPOINTS.LOGOUT)
  },

  // ─── Change Password ─────────────────────────────────────────────────────

  /** POST /auth/password/change — change current password (protected) */
  async changePassword(data: ChangePasswordPayload): Promise<ChangePasswordResponse> {
    if (isMock)
      return mockDelay({ message: 'Password changed', requires_otp: false })
    const res = await api.post<ApiSuccessResponse<ChangePasswordResponse>>(
      AUTH_ENDPOINTS.PASSWORD_CHANGE,
      data,
    )
    return res.data.data
  },

  /** POST /auth/password/change/verify — confirm change password OTP (protected) */
  async verifyChangePassword(data: VerifyChangePasswordPayload): Promise<MessageResponse> {
    if (isMock)
      return mockDelay({ message: 'Password change confirmed' })
    const res = await api.post<ApiSuccessResponse<MessageResponse>>(
      AUTH_ENDPOINTS.PASSWORD_CHANGE_VERIFY,
      data,
    )
    return res.data.data
  },

  // ─── 2FA Toggle ───────────────────────────────────────────────────────────

  /** PUT /auth/2fa/toggle — enable or disable two-factor authentication (protected) */
  async toggle2fa(data: Toggle2faPayload): Promise<Toggle2faResponse> {
    if (isMock) {
      const enabled = data.enabled
      return mockDelay({
        message: enabled
          ? 'Two-factor authentication has been enabled.'
          : 'Two-factor authentication has been disabled.',
        two_factor_enabled: enabled,
      })
    }
    const res = await api.put<ApiSuccessResponse<Toggle2faResponse>>(
      AUTH_ENDPOINTS.TOGGLE_2FA,
      data,
    )
    return res.data.data
  },

  // ─── TOTP (Google Authenticator) ──────────────────────────────────────────

  /** POST /auth/totp/setup — initiate TOTP setup (protected) */
  async setupTotp(): Promise<TotpSetupResponse> {
    if (isMock) {
      return mockDelay<TotpSetupResponse>({
        secret: 'MOCK_TOTP_SECRET',
        qr_code_url: 'https://example.com/qr',
        recovery_codes: ['111111', '222222', '333333'],
      })
    }
    const res = await api.post<ApiSuccessResponse<TotpSetupResponse>>(AUTH_ENDPOINTS.TOTP_SETUP)
    return res.data.data
  },

  /** POST /auth/totp/confirm — confirm TOTP setup with first code (protected) */
  async confirmTotp(data: TotpConfirmPayload): Promise<MessageResponse> {
    if (isMock)
      return mockDelay({ message: 'TOTP enabled' })
    const res = await api.post<ApiSuccessResponse<MessageResponse>>(
      AUTH_ENDPOINTS.TOTP_CONFIRM,
      data,
    )
    return res.data.data
  },

  /** DELETE /auth/totp/disable — disable TOTP 2FA (protected) */
  async disableTotp(): Promise<MessageResponse> {
    if (isMock)
      return mockDelay({ message: 'TOTP disabled' })
    const res = await api.delete<ApiSuccessResponse<MessageResponse>>(AUTH_ENDPOINTS.TOTP_DISABLE)
    return res.data.data
  },

  // ─── Social Login ─────────────────────────────────────────────────────────

  /** POST /auth/social/{provider}/redirect — get OAuth redirect URL (public) */
  async socialRedirect(
    provider: SocialProvider,
    data: SocialRedirectPayload,
  ): Promise<SocialRedirectResponse> {
    if (isMock)
      return mockDelay({ redirect_url: `https://accounts.google.com/o/oauth2?mock=true` })
    const res = await api.post<ApiSuccessResponse<SocialRedirectResponse>>(
      AUTH_ENDPOINTS.socialRedirect(provider),
      data,
    )
    return res.data.data
  },

  /** POST /auth/social/{provider}/callback — exchange OAuth code for token (public) */
  async socialCallback(
    provider: SocialProvider,
    data: SocialCallbackPayload,
  ): Promise<SocialCallbackResponse> {
    if (isMock) {
      return mockDelay<SocialCallbackResponse>({
        token: MOCK_TOKEN,
        user: MOCK_USER,
        permissions: ['*'],
      })
    }
    const res = await api.post<ApiSuccessResponse<SocialCallbackResponse>>(
      AUTH_ENDPOINTS.socialCallback(provider),
      data,
    )
    return res.data.data
  },
}

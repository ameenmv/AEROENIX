import type {
  AcceptInvitationPayload,
  AcceptInvitationResponse,
  AuthConfig,
  AuthUser,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginCredentials,
  LoginResponse,
  MessageResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
} from '@/types/auth'
import type { ApiSuccessResponse } from '@/types/services/api'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Auth Service — Pure API layer for Aeroenix backend
 *
 * Covers all auth routes from the backend (routes/api.php):
 *
 *   Public:
 *     POST /auth/login              → authenticate with credentials
 *     POST /auth/forgot-password    → send password reset email
 *     POST /auth/reset-password     → reset password with token from email
 *     POST /auth/invitations/accept → accept hotel invitation
 *
 *   Protected (auth:sanctum):
 *     GET  /auth/me                 → current user profile + hotels
 *     POST /auth/logout             → revoke Sanctum token
 *
 * This service is stateless — it only makes HTTP calls and returns typed
 * responses. State management lives in stores/authStore.ts.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import api from './api'

// ── Endpoint Constants ──────────────────────────────────────────────────────

const BASE = '/auth'

/** All auth endpoint paths */
export const AUTH_ENDPOINTS = {
  LOGIN: `${BASE}/login`,
  LOGOUT: `${BASE}/logout`,
  ME: `${BASE}/me`,
  PASSWORD_FORGOT: `${BASE}/forgot-password`,
  PASSWORD_RESET: `${BASE}/reset-password`,
  INVITATION_ACCEPT: `${BASE}/invitations/accept`,
} as const

// ── Service ─────────────────────────────────────────────────────────────────

export const authService = {
  // ─── Login ────────────────────────────────────────────────────────────────

  /**
   * POST /auth/login — authenticate with email + password.
   *
   * Backend returns: { success, data: { user, token, token_type } }
   * The token is a Sanctum plaintext token to be used as Bearer.
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const res = await api.post<ApiSuccessResponse<LoginResponse>>(
      AUTH_ENDPOINTS.LOGIN,
      credentials,
    )
    const data = res.data.data as any

    // Normalize: map backend `token` to `access_token` for consistent consumption
    if (data?.token && !data.access_token) {
      data.access_token = data.token
    }

    return data as LoginResponse
  },

  // ─── Profile ──────────────────────────────────────────────────────────────

  /**
   * GET /auth/me — get authenticated user profile + associated hotels.
   *
   * Backend returns: { success, data: { user: LoginResource, hotels: [{id, name}] } }
   */
  async me(): Promise<AuthUser> {
    const res = await api.get<ApiSuccessResponse<{ user?: AuthUser; hotels?: Array<{ id: number; name: string }> }>>(
      AUTH_ENDPOINTS.ME,
    )
    const data = res.data.data as any

    // Backend wraps user in a `user` key — extract and merge hotels
    if (data?.user) {
      return { ...data.user, hotels: data.hotels || [] }
    }

    return data
  },

  // ─── Logout ───────────────────────────────────────────────────────────────

  /**
   * POST /auth/logout — revoke the current Sanctum token.
   */
  async logout(): Promise<MessageResponse> {
    const res = await api.post<ApiSuccessResponse<any>>(AUTH_ENDPOINTS.LOGOUT)
    return { message: res.data?.message || 'Logged out successfully' }
  },

  // ─── Password Reset ──────────────────────────────────────────────────────

  /**
   * POST /auth/forgot-password — send a password reset link via email.
   *
   * Backend always returns success message (no user enumeration).
   */
  async forgotPassword(data: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
    const res = await api.post<ApiSuccessResponse<any>>(
      AUTH_ENDPOINTS.PASSWORD_FORGOT,
      data,
    )
    return { message: res.data.message }
  },

  /**
   * POST /auth/reset-password — set new password using token from email link.
   */
  async resetPassword(data: ResetPasswordPayload): Promise<ResetPasswordResponse> {
    const res = await api.post<ApiSuccessResponse<any>>(
      AUTH_ENDPOINTS.PASSWORD_RESET,
      data,
    )
    return { message: res.data.message }
  },

  // ─── Invitation ───────────────────────────────────────────────────────────

  /**
   * POST /auth/invitations/accept — accept hotel invitation and set password.
   */
  async acceptInvitation(data: AcceptInvitationPayload): Promise<AcceptInvitationResponse> {
    const res = await api.post<ApiSuccessResponse<AcceptInvitationResponse>>(
      AUTH_ENDPOINTS.INVITATION_ACCEPT,
      data,
    )
    return res.data.data
  },

  // ─── Config (env-driven, no backend endpoint) ────────────────────────────

  /**
   * Returns frontend-only auth config.
   * Aeroenix backend does not have a /auth/config endpoint.
   */
  async getConfig(): Promise<AuthConfig> {
    return {
      login_method: 'email_password',
      two_factor: false,
      registration_enabled: false,
      password_reset_enabled: true,
      session_ttl: 360,
    }
  },
}

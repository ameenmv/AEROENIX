/**
 * Auth types — re-exporting from the canonical types/auth.ts module.
 *
 * This file exists for backward compatibility with existing imports
 * from '@/types/services/auth'.
 *
 * Prefer importing directly from '@/types/auth' in new code.
 */
export type {
  AcceptInvitationPayload,
  AcceptInvitationResponse,
  AuthConfig,
  AuthStep,
  AuthUser,
  ChangePasswordPayload,
  ChangePasswordResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginCredentials,
  LoginResponse,
  MessageResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
} from '../../types/auth'

/** Backward-compatible alias */
export type { AuthUser as User } from '../../types/auth'

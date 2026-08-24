/**
 * Auth types — re-exporting from the canonical types/auth.ts module.
 *
 * This file exists for backward compatibility with existing imports
 * from '@/types/services/auth'.
 *
 * Prefer importing directly from '@/types/auth' in new code.
 */
export type { LoginResponse, AuthUser as User } from '../../types/auth'
export type {
  AuthConfig,
  AuthStep,
  AuthUser,
  ChangePasswordPayload,
  ChangePasswordResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginCredentials,
  MessageResponse,
  OtpResendPayload,
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
  TotpConfirmPayload,
  TotpSetupResponse,
  VerifyChangePasswordPayload,
} from '../../types/auth'

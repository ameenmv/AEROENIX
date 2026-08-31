import { z } from 'zod'

/** Translation function signature (vue-i18n's `t()`) */
type TranslateFn = (key: string, fallback?: string) => string

/**
 * Auth schemas are factory functions that accept the i18n `t()` function
 * so validation messages are displayed in the active locale.
 */

// ── Login ────────────────────────────────────────────────────────────────────
export function loginSchema(t: TranslateFn) {
  return z.object({
    email: z
      .string({ required_error: t('auth.email_required', 'Email is required.') })
      .min(1, t('auth.email_required', 'Email is required.'))
      .email(t('auth.email_invalid', 'Please enter a valid email address.')),
    password: z
      .string({ required_error: t('auth.password_required', 'Password is required.') })
      .min(1, t('auth.password_required', 'Password is required.'))
      .min(6, t('auth.password_min', 'Password must be at least 6 characters.')),
    remember: z.boolean().optional().default(false),
  })
}

// ── Forgot Password ─────────────────────────────────────────────────────────
export function forgotPasswordSchema(t: TranslateFn) {
  return z.object({
    email: z
      .string({ required_error: t('auth.email_required', 'Email is required.') })
      .min(1, t('auth.email_required', 'Email is required.'))
      .email(t('auth.email_invalid', 'Please enter a valid email address.')),
  })
}

// ── Reset Password ──────────────────────────────────────────────────────────
export function resetPasswordSchema(t: TranslateFn) {
  return z
    .object({
      password: z
        .string({ required_error: t('auth.password_required', 'Password is required.') })
        .min(1, t('auth.password_required', 'Password is required.'))
        .min(8, t('auth.password_min_reset', 'Password must be at least 8 characters.')),
      password_confirmation: z
        .string({
          required_error: t('auth.confirm_password_required', 'Password confirmation is required.'),
        })
        .min(1, t('auth.confirm_password_required', 'Password confirmation is required.')),
    })
    .refine(data => data.password === data.password_confirmation, {
      message: t('auth.passwords_mismatch', 'Passwords do not match.'),
      path: ['password_confirmation'],
    })
}

// ── Accept Invitation ───────────────────────────────────────────────────────
export function acceptInvitationSchema(t: TranslateFn) {
  return z
    .object({
      name: z
        .string({ required_error: t('auth.name_required', 'Name is required.') })
        .min(2, t('auth.name_min', 'Name must be at least 2 characters.')),
      phone: z.string().optional(),
      password: z
        .string({ required_error: t('auth.password_required', 'Password is required.') })
        .min(1, t('auth.password_required', 'Password is required.'))
        .min(8, t('auth.password_min_reset', 'Password must be at least 8 characters.')),
      password_confirmation: z
        .string({
          required_error: t('auth.confirm_password_required', 'Password confirmation is required.'),
        })
        .min(1, t('auth.confirm_password_required', 'Password confirmation is required.')),
    })
    .refine(data => data.password === data.password_confirmation, {
      message: t('auth.passwords_mismatch', 'Passwords do not match.'),
      path: ['password_confirmation'],
    })
}

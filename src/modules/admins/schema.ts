import { z } from 'zod'

/** Translation function signature (vue-i18n's `t()`) */
type TranslateFn = (key: string, fallback?: string) => string

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Admin Validation Schemas — aligned with backend AdminRequest.php
 *
 * Factory functions accept i18n `t()` so validation messages display in the
 * active locale (pattern from seen/client).
 *
 * Backend rules:
 *   commonRules: name(required,max:255), email(required,email,unique),
 *                phone(nullable,max:30,unique), username(nullable,max:100,unique),
 *                status(sometimes), role_ids(array of ints)
 *   storeRules:  password(required,min:8,confirmed)
 *   updateRules: password(sometimes,min:8,confirmed)
 * ──────────────────────────────────────────────────────────────────────────────
 */

// ── Create Admin ────────────────────────────────────────────────────────────
export function adminCreateSchema(t: TranslateFn) {
  return z.object({
    name: z
      .string({ required_error: t('admins.validation.name_required', 'Name is required.') })
      .min(1, t('admins.validation.name_required', 'Name is required.'))
      .max(255, t('admins.validation.name_max', 'Name must not exceed 255 characters.')),
    email: z
      .string({ required_error: t('admins.validation.email_required', 'Email is required.') })
      .min(1, t('admins.validation.email_required', 'Email is required.'))
      .email(t('admins.validation.email_invalid', 'Please enter a valid email address.')),
    password: z
      .string({ required_error: t('admins.validation.password_required', 'Password is required.') })
      .min(8, t('admins.validation.password_min', 'Password must be at least 8 characters.')),
    password_confirmation: z
      .string({ required_error: t('admins.validation.password_confirmation_required', 'Password confirmation is required.') })
      .min(1, t('admins.validation.password_confirmation_required', 'Password confirmation is required.')),
    phone: z.string().max(30).optional().nullable(),
    username: z.string().max(100).optional().nullable(),
    role_ids: z
      .array(z.number({ invalid_type_error: t('admins.validation.role_invalid', 'Invalid role.') }))
      .optional()
      .default([]),
  }).refine(data => data.password === data.password_confirmation, {
    message: t('admins.validation.password_mismatch', 'Passwords do not match.'),
    path: ['password_confirmation'],
  })
}

// ── Edit Admin ──────────────────────────────────────────────────────────────
export function adminEditSchema(t: TranslateFn) {
  return z.object({
    name: z
      .string()
      .min(1, t('admins.validation.name_required', 'Name is required.'))
      .max(255, t('admins.validation.name_max', 'Name must not exceed 255 characters.'))
      .optional(),
    email: z
      .string()
      .email(t('admins.validation.email_invalid', 'Please enter a valid email address.'))
      .optional(),
    password: z
      .string()
      .min(8, t('admins.validation.password_min', 'Password must be at least 8 characters.'))
      .optional()
      .or(z.literal('')),
    password_confirmation: z
      .string()
      .optional()
      .or(z.literal('')),
    phone: z.string().max(30).optional().nullable(),
    username: z.string().max(100).optional().nullable(),
    role_ids: z
      .array(z.number())
      .optional()
      .default([]),
  }).refine(
    data => !data.password || data.password === data.password_confirmation,
    {
      message: t('admins.validation.password_mismatch', 'Passwords do not match.'),
      path: ['password_confirmation'],
    },
  )
}

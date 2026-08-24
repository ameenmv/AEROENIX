import { z } from 'zod'

/** Translation function signature (vue-i18n's `t()`) */
type TranslateFn = (key: string, fallback?: string) => string

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * User Validation Schema — aligned with backend UserResource fields.
 *
 * NOTE: Backend does not have admin-managed user CRUD routes yet.
 * This schema validates the fields that UserResource exposes.
 * Update when backend user admin routes are implemented.
 * ──────────────────────────────────────────────────────────────────────────────
 */

export function userCreateSchema(t: TranslateFn) {
  return z.object({
    name: z
      .string({ required_error: t('users.validation.name_required', 'Name is required.') })
      .min(1, t('users.validation.name_required', 'Name is required.')),
    email: z
      .string({ required_error: t('users.validation.email_required', 'Email is required.') })
      .email(t('users.validation.email_invalid', 'Please enter a valid email address.')),
  })
}

export function userEditSchema(t: TranslateFn) {
  return z.object({
    name: z.string().min(1, t('users.validation.name_required', 'Name is required.')).optional(),
    email: z
      .string()
      .email(t('users.validation.email_invalid', 'Please enter a valid email address.'))
      .optional(),
  })
}

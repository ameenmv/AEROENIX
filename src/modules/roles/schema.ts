import { z } from 'zod'

/** Translation function signature (vue-i18n's `t()`) */
type TranslateFn = (key: string, fallback?: string) => string

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Role Validation Schemas — aligned with Aeroenix backend CreateRoleRequest.
 *
 * Backend rules:
 *   name:        required, string
 *   description: nullable, string
 *   hotel_id:    nullable, integer
 *   permissions: array of permission action strings
 * ──────────────────────────────────────────────────────────────────────────────
 */

export function roleFormSchema(t: TranslateFn) {
  return z.object({
    name: z
      .string({ required_error: t('roles.validation.name_required', 'Role name is required.') })
      .min(1, t('roles.validation.name_required', 'Role name is required.'))
      .max(255, t('roles.validation.name_max', 'Role name must not exceed 255 characters.')),
    description: z
      .string()
      .max(1000)
      .optional()
      .or(z.literal('')),
  })
}

import { z } from 'zod'

/** Translation function signature (vue-i18n's `t()`) */
type TranslateFn = (key: string, fallback?: string) => string

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Role Validation Schemas — aligned with backend RoleRequest.php
 *
 * Backend rules:
 *   commonRules:
 *     display_name    (required, array)
 *     display_name.en (required, string, max:255)
 *     display_name.ar (required, string, max:255)
 *     permissions     (sometimes, nullable, array of integer IDs)
 *
 * `name` is auto-derived from display_name.en (slugified) in RoleService.
 * `guard_name` defaults to 'admin' in RoleService.
 * ──────────────────────────────────────────────────────────────────────────────
 */

// ── Create / Edit Role ──────────────────────────────────────────────────────
export function roleFormSchema(t: TranslateFn) {
  return z.object({
    display_name: z.object({
      en: z
        .string({
          required_error: t('roles.validation.name_en_required', 'Role name (EN) is required.'),
        })
        .min(1, t('roles.validation.name_en_required', 'Role name (EN) is required.'))
        .max(255, t('roles.validation.name_max', 'Role name must not exceed 255 characters.')),
      ar: z
        .string({
          required_error: t('roles.validation.name_ar_required', 'Role name (AR) is required.'),
        })
        .min(1, t('roles.validation.name_ar_required', 'Role name (AR) is required.'))
        .max(255, t('roles.validation.name_max', 'Role name must not exceed 255 characters.')),
    }),
    permissions: z.array(z.number()).optional().default([]),
  })
}

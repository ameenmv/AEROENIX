import { z } from 'zod'

/** Translation function signature (vue-i18n's `t()`) */
type TranslateFn = (key: string, fallback?: string) => string

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * User Validation Schemas — aligned with Aeroenix backend.
 *
 * Backend does NOT have admin-managed user CRUD.
 * Users are created via invitations only (InviteUserRequest).
 * ──────────────────────────────────────────────────────────────────────────────
 */

/**
 * Invite user schema — aligned with backend InviteUserRequest.
 *
 * Required: email, role_id
 * Conditional: hotel_id (required for Super Admin, optional for Hotel Admin)
 * Optional: name
 */
export function inviteUserSchema(t: TranslateFn) {
  return z.object({
    email: z
      .string({ required_error: t('validation.required', 'Email is required') })
      .email(t('validation.email', 'Please enter a valid email address')),
    role_id: z
      .number({ required_error: t('validation.required', 'Role is required') })
      .int()
      .positive(t('validation.required', 'Please select a role')),
    hotel_id: z
      .number({ required_error: t('validation.required', 'Hotel is required') })
      .int()
      .positive(t('validation.required', 'Please select a hotel')),
  })
}

/**
 * Update user role schema — aligned with backend UpdateUserRoleRequest.
 */
export function updateUserRoleSchema(t: TranslateFn) {
  return z.object({
    role_id: z
      .number({ required_error: t('validation.required', 'Role is required') })
      .int()
      .positive(),
    hotel_id: z
      .number()
      .int()
      .positive()
      .optional(),
  })
}

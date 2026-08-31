import { z } from 'zod'

/** Translation function signature (vue-i18n's `t()`) */
type TranslateFn = (key: string, fallback?: string) => string

/**
 * Hotel create schema — aligned with backend CreateHotelRequest.
 *
 * Required: name, admin_email
 * Optional: country, currency, phone, email, address, check_in_time,
 *           check_out_time, timezone, description
 */
export function hotelCreateSchema(t: TranslateFn) {
  return z.object({
    name: z
      .string({ required_error: t('validation.required', 'Hotel name is required') })
      .min(1, t('validation.required', 'Hotel name is required'))
      .max(255),
    admin_email: z
      .string({ required_error: t('validation.required', 'Admin email is required') })
      .email(t('validation.email', 'Invalid email address')),
    country: z
      .string({ required_error: t('validation.required', 'Country is required') })
      .min(1, t('validation.required', 'Country is required'))
      .max(100),
    currency: z
      .string({ required_error: t('validation.required', 'Currency is required') })
      .min(1, t('validation.required', 'Currency is required'))
      .max(10),
    phone: z
      .string({ required_error: t('validation.required', 'Phone is required') })
      .min(1, t('validation.required', 'Phone is required'))
      .max(50),
    email: z
      .string({ required_error: t('validation.required', 'Hotel email is required') })
      .min(1, t('validation.required', 'Hotel email is required'))
      .email(t('validation.email', 'Invalid email')),
    address: z
      .string({ required_error: t('validation.required', 'Address is required') })
      .min(1, t('validation.required', 'Address is required'))
      .max(1000),
    check_in_time: z
      .string({ required_error: t('validation.required', 'Check-in time is required') })
      .min(1, t('validation.required', 'Check-in time is required')),
    check_out_time: z
      .string({ required_error: t('validation.required', 'Check-out time is required') })
      .min(1, t('validation.required', 'Check-out time is required')),
    timezone: z
      .string({ required_error: t('validation.required', 'Timezone is required') })
      .min(1, t('validation.required', 'Timezone is required'))
      .max(100),
    description: z.string().max(2000).optional().or(z.literal('')),
  })
}

/**
 * Hotel update schema — aligned with backend UpdateHotelRequest.
 *
 * All fields are optional (PATCH-style update).
 */
export function hotelUpdateSchema(t: TranslateFn) {
  return z.object({
    name: z.string().min(1).max(255).optional(),
    status: z.enum(['active', 'inactive']).optional(),
    country: z.string().max(100).optional().or(z.literal('')),
    currency: z.string().max(10).optional().or(z.literal('')),
    phone: z.string().max(50).optional().or(z.literal('')),
    email: z.string().email(t('validation.email', 'Invalid email')).optional().or(z.literal('')),
    address: z.string().max(1000).optional().or(z.literal('')),
    check_in_time: z.string().max(50).optional().or(z.literal('')),
    check_out_time: z.string().max(50).optional().or(z.literal('')),
    timezone: z.string().max(100).optional().or(z.literal('')),
    description: z.string().max(2000).optional().or(z.literal('')),
  })
}

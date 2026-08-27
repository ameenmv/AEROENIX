import { z } from 'zod'

export function hotelCreateSchema(t: any) {
  return z.object({
    name: z.string().min(1, t('validation.required', 'This field is required')).max(255),
    admin_email: z.string().email(t('validation.email', 'Invalid email address')),
    admin_permissions: z.array(z.number()).min(1, t('validation.required', 'At least one permission is required')),
  })
}

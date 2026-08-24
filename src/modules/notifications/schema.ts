import { z } from 'zod'
import { AudienceType, NotificationChannel, NotificationType, SendTo } from '@/enums'

/** Translation function signature (vue-i18n's `t()`) */
type TranslateFn = (key: string, fallback?: string) => string

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Notification Validation Schemas
 *
 * Aligned with ManualNotification model fields:
 *   - title (translatable: { en, ar })
 *   - content (translatable: { en, ar })
 *   - type (NotificationTypeEnum)
 *   - audience_type (AudienceTypeEnum)
 *   - send_to (SendToEnum)
 *   - channels (array of ChannelEnum values)
 *   - send_at (optional datetime for scheduling)
 *   - audience (array of user/admin/role IDs, depends on send_to)
 * ──────────────────────────────────────────────────────────────────────────────
 */

export function notificationFormSchema(t: TranslateFn) {
  return z.object({
    title: z.object({
      en: z
        .string({
          required_error: t('notifications.validation.title_en_required', 'Title (EN) is required.'),
        })
        .min(1, t('notifications.validation.title_en_required', 'Title (EN) is required.')),
      ar: z.string().optional().default(''),
    }),
    content: z.object({
      en: z
        .string({
          required_error: t(
            'notifications.validation.content_en_required',
            'Content (EN) is required.',
          ),
        })
        .min(1, t('notifications.validation.content_en_required', 'Content (EN) is required.')),
      ar: z.string().optional().default(''),
    }),
    type: z
      .number({
        required_error: t(
          'notifications.validation.type_required',
          'Notification type is required.',
        ),
      })
      .refine(
        v => Object.values(NotificationType).includes(v as NotificationType),
        t('notifications.validation.type_invalid', 'Invalid notification type.'),
      ),
    audience_type: z
      .number({
        required_error: t(
          'notifications.validation.audience_required',
          'Audience type is required.',
        ),
      })
      .refine(
        v => Object.values(AudienceType).includes(v as AudienceType),
        t('notifications.validation.audience_invalid', 'Invalid audience type.'),
      ),
    send_to: z
      .number({
        required_error: t('notifications.validation.send_to_required', 'Send to is required.'),
      })
      .refine(
        v => Object.values(SendTo).includes(v as SendTo),
        t('notifications.validation.send_to_invalid', 'Invalid send-to option.'),
      ),
    channels: z
      .array(
        z
          .number()
          .refine(
            v => Object.values(NotificationChannel).includes(v as NotificationChannel),
            t('notifications.validation.channel_invalid', 'Invalid channel.'),
          ),
      )
      .min(1, t('notifications.validation.channels_required', 'At least one channel is required.')),
    send_at: z.string().optional().nullable(),
    audience: z.array(z.number()).optional().default([]),
  })
}

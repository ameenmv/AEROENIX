import type { ApiStatus, TranslatableField } from './shared'

/**
 * ManualNotification entity — matches backend ManualNotificationResource scope definitions.
 *
 * Scopes:
 * - micro: id, title, status, send_at
 * - mini:  + content, type, audience_type, send_to, channels, created_by, sent_at
 * - full:  + audience, created_at, updated_at
 *
 * Relations:
 * - recipients → NotificationRecipientResource
 * - creator    → AdminResource
 */
export interface ManualNotification {
  id: number
  title: TranslatableField
  status: number
  send_at: string | null
  content: TranslatableField
  type: number
  audience_type: number
  send_to: number
  channels: number[]
  created_by: number | null
  sent_at: string | null
  audience: number[] | null
  created_at: string
  updated_at: string
  recipients?: NotificationRecipient[]
  creator?: {
    id: number
    name: string
  }
}

/**
 * NotificationRecipient — matches backend NotificationRecipientResource.
 */
export interface NotificationRecipient {
  id: number
  notification_id: number
  recipient_id: number
  recipient_type: string
  status: ApiStatus
  sent_at: string | null
  error: string | null
}

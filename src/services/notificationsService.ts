import type { ManualNotification, NotificationRecipient } from '@/types/entities/notification'
import { NOTIFICATIONS_ENDPOINT } from '@/modules/notifications/endpoints'
import api from './api'
import { createService } from './createService'

/**
 * Notifications Service — aligned with backend ManualNotificationsController.
 *
 * Standard CRUD via createService:
 *   list()   → GET    /admin/v1/notifications
 *   get()    → GET    /admin/v1/notifications/{id}
 *   create() → POST   /admin/v1/notifications
 *   update() → PUT    /admin/v1/notifications/{id}
 *   delete() → DELETE /admin/v1/notifications/{id}
 *
 * Custom operations:
 *   sendNow()      → POST /admin/v1/notifications/{id}/send-now
 *   resendFailed() → POST /admin/v1/notifications/{id}/resend-failed
 *   recipients()   → GET  /admin/v1/notifications/{id}/recipients
 */
const baseService = createService<ManualNotification>(NOTIFICATIONS_ENDPOINT, {
  defaultListScope: 'full',
})

export const notificationsService = {
  ...baseService,

  /**
   * POST /admin/v1/notifications/{id}/send-now
   * Immediately dispatch a notification.
   */
  async sendNow(id: string | number): Promise<ManualNotification> {
    const response = await api.post(`${NOTIFICATIONS_ENDPOINT}/${id}/send-now`)
    return response.data?.data || response.data
  },

  /**
   * POST /admin/v1/notifications/{id}/resend-failed
   * Retry sending to recipients that previously failed.
   */
  async resendFailed(id: string | number): Promise<ManualNotification> {
    const response = await api.post(`${NOTIFICATIONS_ENDPOINT}/${id}/resend-failed`)
    return response.data?.data || response.data
  },

  /**
   * GET /admin/v1/notifications/{id}/recipients
   * Fetch the recipient list for a notification.
   */
  async recipients(id: string | number): Promise<NotificationRecipient[]> {
    const response = await api.get(`${NOTIFICATIONS_ENDPOINT}/${id}/recipients`)
    return response.data?.data || response.data || []
  },

  /**
   * GET /admin/v1/notifications/unread-count
   * Fetch the count of unread notifications for the current user.
   */
  async unreadCount(): Promise<{ unread_count: number }> {
    const response = await api.get(`${NOTIFICATIONS_ENDPOINT}/unread-count`)
    return response.data?.data || response.data || { unread_count: 0 }
  },

  /**
   * POST /admin/v1/notifications/{id}/mark-as-read
   * Mark a single notification as read.
   */
  async markAsRead(id: string | number): Promise<void> {
    await api.post(`${NOTIFICATIONS_ENDPOINT}/${id}/mark-as-read`)
  },

  /**
   * POST /admin/v1/notifications/mark-all-as-read
   * Mark all notifications as read.
   */
  async markAllAsRead(): Promise<void> {
    await api.post(`${NOTIFICATIONS_ENDPOINT}/mark-all-as-read`)
  },
}

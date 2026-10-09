import type { PlatformNotification, UserNotificationSettings } from '@/types/entities/platformNotification'
import api from './api'

/**
 * Platform Notifications Service — aligned with backend NotificationController.
 *
 * Endpoints (under /api/v1/platform):
 *   GET    /notifications              → paginated list
 *   GET    /notifications/unread-count  → badge count
 *   PATCH  /notifications/{id}/read     → mark single as read
 *   POST   /notifications/read-all      → mark all as read
 *   DELETE /notifications/{id}          → dismiss/delete
 *   POST   /notifications/generate-demo → generate demo notifications
 *
 * Settings (under /api/v1/platform/settings):
 *   GET    /settings/notifications      → user notification preferences
 *   PUT    /settings/notifications      → update preferences
 */

const BASE = '/platform/notifications'
const SETTINGS_BASE = '/platform/settings/notifications'

export interface PlatformNotificationListParams {
  page?: number
  per_page?: number
  unread_only?: boolean
  category?: string
  type?: string
  hotel_id?: number
}

export interface PlatformNotificationListResponse {
  notifications: PlatformNotification[]
  pagination: {
    total: number
    count: number
    per_page: number
    current_page: number
    total_pages: number
  }
}

export const platformNotificationsService = {
  /**
   * GET /platform/notifications
   * Retrieve paginated notifications for the authenticated user.
   */
  async list(params: PlatformNotificationListParams = {}): Promise<PlatformNotificationListResponse> {
    const response = await api.get(BASE, { params })
    const data = response.data?.data || response.data
    return {
      notifications: data?.notifications || data?.items || [],
      pagination: data?.pagination || {
        total: 0,
        count: 0,
        per_page: params.per_page || 20,
        current_page: params.page || 1,
        total_pages: 1,
      },
    }
  },

  /**
   * GET /platform/notifications/unread-count
   * Quick badge counter for unread notifications.
   */
  async unreadCount(hotelId?: number): Promise<number> {
    const params: Record<string, any> = {}
    if (hotelId) params.hotel_id = hotelId
    const response = await api.get(`${BASE}/unread-count`, { params })
    return response.data?.data?.unread_count ?? 0
  },

  /**
   * PATCH /platform/notifications/{id}/read
   * Mark a single notification as read.
   */
  async markAsRead(id: string | number): Promise<PlatformNotification> {
    const response = await api.patch(`${BASE}/${id}/read`)
    return response.data?.data?.notification || response.data?.data || response.data
  },

  /**
   * POST /platform/notifications/read-all
   * Mark all notifications for the active hotel as read.
   */
  async markAllAsRead(hotelId?: number): Promise<{ updated_count: number }> {
    const params: Record<string, any> = {}
    if (hotelId) params.hotel_id = hotelId
    const response = await api.post(`${BASE}/read-all`, params)
    return response.data?.data || { updated_count: 0 }
  },

  /**
   * DELETE /platform/notifications/{id}
   * Dismiss / delete a notification.
   */
  async dismiss(id: string | number): Promise<void> {
    await api.delete(`${BASE}/${id}`)
  },

  /**
   * POST /platform/notifications/generate-demo
   * Generate all 13 demo notification types for testing.
   */
  async generateDemo(clear = false, hotelId?: number): Promise<{ count: number; notifications: PlatformNotification[] }> {
    const params: Record<string, any> = { clear }
    if (hotelId) params.hotel_id = hotelId
    const response = await api.post(`${BASE}/generate-demo`, params)
    return response.data?.data || { count: 0, notifications: [] }
  },

  /**
   * GET /platform/settings/notifications
   * Retrieve user's notification preferences.
   */
  async getSettings(): Promise<{ notifications: UserNotificationSettings }> {
    const response = await api.get(SETTINGS_BASE)
    return response.data?.data || response.data
  },

  /**
   * PUT /platform/settings/notifications
   * Update user's notification preferences.
   */
  async updateSettings(data: Partial<UserNotificationSettings>): Promise<{ notifications: UserNotificationSettings }> {
    const response = await api.put(SETTINGS_BASE, data)
    return response.data?.data || response.data
  },
}

import type { UserNotificationSettings } from '@/types/entities/platformNotification'
import api from './api'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Settings Service — aligned with backend SettingsController.
 *
 * Endpoints (under /api/v1/platform):
 *   GET    /settings                   → full settings (profile + notifications)
 *   PUT    /settings                   → unified update (profile + notifications)
 *   GET    /settings/profile           → user profile only
 *   PUT    /settings/profile           → update profile (name, phone, password)
 *   GET    /settings/notifications     → notification preferences
 *   PUT    /settings/notifications     → update notification preferences
 *
 * This service is stateless — state management lives in stores/settingsStore.ts.
 * ──────────────────────────────────────────────────────────────────────────────
 */

const BASE = '/platform/settings'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: number
  name: string
  email: string
  phone: string | null
  status: string
  is_super_admin: boolean
  role: { id: number; name: string } | null
  hotel_name: string | null
  hotels: Array<{ id: number; name: string }>
  created_at: string
  updated_at: string
}

export interface FullSettingsResponse {
  user: UserProfile
  notifications: UserNotificationSettings
  available_categories: Array<{
    key: string
    label: string
    icon: string
    color: string
  }>
  available_types: Record<string, Array<{
    type: string
    name: string
    description: string
  }>>
}

export interface UpdateProfilePayload {
  name?: string
  phone?: string | null
  password?: string
  password_confirmation?: string
  current_password?: string
}

export interface UpdateSettingsPayload {
  // Profile fields
  name?: string
  phone?: string | null
  password?: string
  password_confirmation?: string
  current_password?: string
  // Notification fields (flat or nested)
  notifications?: Partial<UserNotificationSettings>
  notify_takeover?: boolean
  notify_conversation?: boolean
  notify_booking?: boolean
  notify_payment?: boolean
  notify_channel?: boolean
  notify_team?: boolean
  notify_system?: boolean
  email_notifications?: boolean
  in_app_notifications?: boolean
  sound_enabled?: boolean
  disabled_types?: string[]
}

// ── Service ─────────────────────────────────────────────────────────────────

export const settingsService = {
  /**
   * GET /platform/settings
   * Retrieve full settings (profile + notifications + available categories/types).
   */
  async getAll(): Promise<FullSettingsResponse> {
    const response = await api.get(BASE)
    return response.data?.data || response.data
  },

  /**
   * PUT /platform/settings
   * Unified update for profile and/or notification settings.
   */
  async updateAll(data: UpdateSettingsPayload): Promise<FullSettingsResponse> {
    const response = await api.put(BASE, data)
    return response.data?.data || response.data
  },

  /**
   * GET /platform/settings/profile
   * Retrieve current user profile details.
   */
  async getProfile(): Promise<{ user: UserProfile }> {
    const response = await api.get(`${BASE}/profile`)
    return response.data?.data || response.data
  },

  /**
   * PUT /platform/settings/profile
   * Update user profile (name, phone, password).
   */
  async updateProfile(data: UpdateProfilePayload): Promise<{ user: UserProfile }> {
    const response = await api.put(`${BASE}/profile`, data)
    return response.data?.data || response.data
  },

  /**
   * GET /platform/settings/notifications
   * Retrieve user notification preferences.
   */
  async getNotifications(): Promise<{
    notifications: UserNotificationSettings
    available_categories: any[]
    available_types: any
  }> {
    const response = await api.get(`${BASE}/notifications`)
    return response.data?.data || response.data
  },

  /**
   * PUT /platform/settings/notifications
   * Update user notification preferences.
   */
  async updateNotifications(
    data: Partial<UserNotificationSettings>,
  ): Promise<{ notifications: UserNotificationSettings }> {
    const response = await api.put(`${BASE}/notifications`, data)
    return response.data?.data || response.data
  },
}

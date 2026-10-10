import type { UserNotificationSettings } from '@/types/entities/platformNotification'
import type { FullSettingsResponse, UpdateProfilePayload, UserProfile } from '@/services/settingsService'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { settingsService } from '@/services/settingsService'

/**
 * Settings Store — manages profile + notification settings state.
 *
 * Fetches from the unified /platform/settings endpoint and provides
 * granular update methods for profile and notification preferences.
 */
export const useSettingsStore = defineStore('settings', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const profile = ref<UserProfile | null>(null)
  const notifications = ref<UserNotificationSettings | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Fetch all settings (profile + notifications) from the unified endpoint.
   */
  async function fetchAll() {
    isLoading.value = true
    error.value = null
    try {
      const data: FullSettingsResponse = await settingsService.getAll()
      profile.value = data.user
      notifications.value = data.notifications
    }
    catch (err: any) {
      error.value = err?.message || 'Failed to load settings'
      console.error('[SettingsStore] fetchAll failed:', err)
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch profile only.
   */
  async function fetchProfile() {
    isLoading.value = true
    error.value = null
    try {
      const data = await settingsService.getProfile()
      profile.value = data.user
    }
    catch (err: any) {
      error.value = err?.message || 'Failed to load profile'
      console.error('[SettingsStore] fetchProfile failed:', err)
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Update profile fields (name, phone, password).
   */
  async function updateProfile(payload: UpdateProfilePayload) {
    isSaving.value = true
    error.value = null
    try {
      const data = await settingsService.updateProfile(payload)
      profile.value = data.user

      // Also update auth_user in localStorage to keep navbar in sync
      const storedUser = localStorage.getItem('auth_user')
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser)
          if (payload.name) parsed.name = payload.name
          if (payload.phone !== undefined) parsed.phone = payload.phone
          localStorage.setItem('auth_user', JSON.stringify(parsed))
        }
        catch {
          // ignore parse errors
        }
      }

      return data.user
    }
    catch (err: any) {
      error.value = err?.message || 'Failed to update profile'
      throw err
    }
    finally {
      isSaving.value = false
    }
  }

  /**
   * Update notification preferences.
   */
  async function updateNotifications(payload: Partial<UserNotificationSettings>) {
    isSaving.value = true
    error.value = null
    try {
      const data = await settingsService.updateNotifications(payload)
      notifications.value = data.notifications
      return data.notifications
    }
    catch (err: any) {
      error.value = err?.message || 'Failed to update notification settings'
      throw err
    }
    finally {
      isSaving.value = false
    }
  }

  /**
   * Reset store state (e.g. on logout).
   */
  function $reset() {
    profile.value = null
    notifications.value = null
    isLoading.value = false
    isSaving.value = false
    error.value = null
  }

  return {
    // State
    profile,
    notifications,
    isLoading,
    isSaving,
    error,

    // Actions
    fetchAll,
    fetchProfile,
    updateProfile,
    updateNotifications,
    $reset,
  }
})

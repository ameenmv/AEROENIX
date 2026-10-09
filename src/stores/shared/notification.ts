import type { PlatformNotification, UserNotificationSettings } from '@/types/entities/platformNotification'
import type { PlatformNotificationListParams } from '@/services/platformNotificationsService'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { platformNotificationsService } from '@/services/platformNotificationsService'

export const useNotificationStore = defineStore('notification', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const notifications = ref<PlatformNotification[]>([])
  const isLoading = ref(false)
  const pagination = ref({
    current_page: 1,
    total_pages: 1,
    total: 0,
    per_page: 20,
  })

  const unreadCount = ref(0)
  const settings = ref<UserNotificationSettings | null>(null)
  const activeCategory = ref<string | null>(null)

  // ── Getters ────────────────────────────────────────────────────────────────
  const hasMore = computed(() => pagination.value.current_page < pagination.value.total_pages)
  const isEmpty = computed(() => notifications.value.length === 0 && !isLoading.value)

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Fetch unread count for the badge.
   */
  async function fetchUnreadCount() {
    try {
      unreadCount.value = await platformNotificationsService.unreadCount()
    }
    catch (error) {
      console.error('[NotificationStore] Failed to fetch unread count:', error)
    }
  }

  /**
   * Fetch paginated notifications from the platform API.
   */
  async function fetchNotifications(page = 1, append = false) {
    isLoading.value = true
    try {
      const params: PlatformNotificationListParams = {
        page,
        per_page: pagination.value.per_page,
      }

      if (activeCategory.value) {
        params.category = activeCategory.value
      }

      const response = await platformNotificationsService.list(params)

      if (append && page > 1) {
        notifications.value = [...notifications.value, ...response.notifications]
      }
      else {
        notifications.value = response.notifications
      }

      pagination.value = {
        current_page: response.pagination.current_page,
        total_pages: response.pagination.total_pages,
        total: response.pagination.total,
        per_page: response.pagination.per_page,
      }

      // Also refresh unread count
      await fetchUnreadCount()
    }
    catch (error) {
      console.error('[NotificationStore] Failed to fetch notifications:', error)
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Load more (next page) appending to existing list.
   */
  async function loadMore() {
    if (!hasMore.value || isLoading.value) return
    await fetchNotifications(pagination.value.current_page + 1, true)
  }

  /**
   * Filter by category and refetch.
   */
  async function filterByCategory(category: string | null) {
    activeCategory.value = category
    await fetchNotifications(1)
  }

  /**
   * Mark a single notification as read.
   */
  async function markAsRead(id: string | number) {
    const item = notifications.value.find(n => n.id === String(id))
    if (item && !item.is_read) {
      // Optimistic update
      item.is_read = true
      item.read_at = new Date().toISOString()
      if (unreadCount.value > 0) unreadCount.value--

      try {
        await platformNotificationsService.markAsRead(id)
      }
      catch {
        // Rollback
        item.is_read = false
        item.read_at = null
        unreadCount.value++
      }
    }
  }

  /**
   * Mark all notifications as read.
   */
  async function markAllAsRead() {
    // Optimistic update
    const previousUnread = unreadCount.value
    notifications.value.forEach((n) => {
      n.is_read = true
      n.read_at = n.read_at || new Date().toISOString()
    })
    unreadCount.value = 0

    try {
      await platformNotificationsService.markAllAsRead()
    }
    catch (error) {
      console.error('[NotificationStore] Failed to mark all as read:', error)
      unreadCount.value = previousUnread
    }
  }

  /**
   * Dismiss / delete a notification.
   */
  async function dismissNotification(id: string | number) {
    const idx = notifications.value.findIndex(n => n.id === String(id))
    if (idx === -1) return

    const removed = notifications.value[idx]!
    notifications.value.splice(idx, 1)

    if (!removed.is_read && unreadCount.value > 0) {
      unreadCount.value--
    }

    try {
      await platformNotificationsService.dismiss(id)
    }
    catch {
      // Rollback
      notifications.value.splice(idx, 0, removed)
      if (!removed.is_read) unreadCount.value++
    }
  }


  /**
   * Add a notification received via real-time WebSocket.
   * Prepends to the list and increments unread count.
   */
  function addRealtimeNotification(notification: PlatformNotification) {
    // Avoid duplicates
    const exists = notifications.value.some(n => n.id === notification.id)
    if (!exists) {
      notifications.value.unshift(notification)
      if (!notification.is_read) {
        unreadCount.value++
      }
      pagination.value.total++
    }
  }

  // ── Settings ───────────────────────────────────────────────────────────────

  /**
   * Fetch user notification preferences.
   */
  async function fetchSettings() {
    try {
      const response = await platformNotificationsService.getSettings()
      settings.value = response.notifications
    }
    catch (error) {
      console.error('[NotificationStore] Failed to fetch settings:', error)
    }
  }

  /**
   * Update user notification preferences.
   */
  async function updateSettings(data: Partial<UserNotificationSettings>) {
    try {
      const response = await platformNotificationsService.updateSettings(data)
      settings.value = response.notifications
    }
    catch (error) {
      console.error('[NotificationStore] Failed to update settings:', error)
      throw error
    }
  }

  /**
   * Generate demo notifications (dev/testing only).
   */
  async function generateDemo(clear = false) {
    try {
      const result = await platformNotificationsService.generateDemo(clear)
      // Refresh the list after generating
      await fetchNotifications(1)
      return result
    }
    catch (error) {
      console.error('[NotificationStore] Failed to generate demo:', error)
      throw error
    }
  }

  /**
   * Reset store state (e.g. on logout).
   */
  function $reset() {
    notifications.value = []
    unreadCount.value = 0
    isLoading.value = false
    settings.value = null
    activeCategory.value = null
    pagination.value = { current_page: 1, total_pages: 1, total: 0, per_page: 20 }
  }

  return {
    // State
    notifications,
    isLoading,
    pagination,
    unreadCount,
    settings,
    activeCategory,

    // Getters
    hasMore,
    isEmpty,

    // Actions
    fetchUnreadCount,
    fetchNotifications,
    loadMore,
    filterByCategory,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    addRealtimeNotification,
    fetchSettings,
    updateSettings,
    generateDemo,
    $reset,
  }
})

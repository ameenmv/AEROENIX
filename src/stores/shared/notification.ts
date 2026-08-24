import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { notificationsService } from '@/services/notificationsService'

export interface NotificationItem {
  id: string | number
  title: Record<string, string> | string
  body?: Record<string, string> | string
  content?: Record<string, string> | string
  type?: string | number
  read_at?: string | null
  created_at?: string
  time?: string
  avatar?: string
  route?: string
  meta?: Record<string, any> | null
  read?: boolean
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<NotificationItem[]>([])
  const isLoading = ref(false)
  const pagination = ref({ current_page: 1, last_page: 1, total: 0 })

  const serverUnreadCount = ref(0)

  const unreadNotificationCount = computed(() => {
    // If we have fetched server count, use it, otherwise fallback to local calculation
    if (serverUnreadCount.value > 0)
      return serverUnreadCount.value
    return notifications.value.filter((n) => {
      if (typeof n.read === 'boolean')
        return !n.read
      return !n.read_at
    }).length
  })

  const totalUnread = computed(() => unreadNotificationCount.value)

  async function fetchUnreadCount() {
    try {
      const response = await notificationsService.unreadCount()
      serverUnreadCount.value = response.unread_count
    }
    catch (error) {
      console.error('Failed to fetch unread count', error)
    }
  }

  async function fetchNotifications(
    page = 1,
    filters?: any,
    sortBy = 'created_at',
    sortDesc = true,
  ) {
    isLoading.value = true
    try {
      const response = await notificationsService.list({
        page,
        filters,
        sort_by: sortBy,
        sort_dir: sortDesc ? 'desc' : 'asc',
      })
      const data = response.data || []

      if (page === 1) {
        notifications.value = Array.isArray(data) ? data : []
      }
      else {
        notifications.value = [...notifications.value, ...(Array.isArray(data) ? data : [])]
      }

      if (response.meta) {
        pagination.value = {
          current_page: response.meta.current_page || 1,
          last_page: response.meta.last_page || 1,
          total: response.meta.total || 0,
        }
      }

      // Also fetch total unread count from server
      await fetchUnreadCount()
    }
    catch (error) {
      console.error('Failed to fetch notifications', error)
    }
    finally {
      isLoading.value = false
    }
  }

  async function markNotificationRead(id: string | number) {
    const item = notifications.value.find(n => n.id === id)
    if (item && !item.read && !item.read_at) {
      item.read = true
      item.read_at = new Date().toISOString()
      try {
        await notificationsService.markAsRead(id)
        if (serverUnreadCount.value > 0)
          serverUnreadCount.value--
      }
      catch {
        item.read = false
        item.read_at = null
      }
    }
  }

  async function markAllNotificationsRead() {
    notifications.value.forEach((n) => {
      n.read = true
      n.read_at = n.read_at || new Date().toISOString()
    })
    serverUnreadCount.value = 0
    try {
      await notificationsService.markAllAsRead()
    }
    catch (e) {
      console.error('Failed to mark all as read', e)
    }
  }

  function removeNotification(id: string | number) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  function clearNotifications() {
    notifications.value = []
  }

  function addNotification(item: NotificationItem) {
    notifications.value.unshift(item)
  }

  return {
    notifications,
    isLoading,
    pagination,
    unreadNotificationCount,
    totalUnread,
    fetchNotifications,
    fetchUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    removeNotification,
    clearNotifications,
    addNotification,
  }
})

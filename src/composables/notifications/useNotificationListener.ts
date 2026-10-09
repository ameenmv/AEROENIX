import type { PlatformNotification } from '@/types/entities/platformNotification'
import { onUnmounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { getEcho } from '@/services/echo'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/shared/notification'
import router from '@/router'

/**
 * Composable that listens for real-time notifications via Laravel Reverb.
 *
 * Backend broadcasts:
 *   Event: 'notification.received' (broadcastAs)
 *   Channels:
 *     - private-user.{userId}.notifications
 *     - private-hotel.{hotelId}.user.{userId}.notifications
 *     - private-hotel.{hotelId}.notifications
 *
 * Payload: { notification: PlatformNotification }
 */
export function useNotificationListener() {
  const authStore = useAuthStore()
  const notifStore = useNotificationStore()
  const isListening = ref(false)

  // Track subscribed channel names for cleanup
  const subscribedChannels: string[] = []

  // Deduplication: track recently seen notification IDs to prevent
  // duplicate toasts when the same event arrives on multiple channels
  const recentlySeenIds = new Set<string | number>()

  /**
   * Subscribe to notification channels.
   * Call after successful authentication.
   */
  function subscribe() {
    // Skip if real-time is explicitly disabled
    const reverbEnabled = import.meta.env.VITE_REVERB_ENABLED
    if (reverbEnabled === 'false' || reverbEnabled === '0') {
      console.info('[NotificationListener] Real-time disabled (VITE_REVERB_ENABLED=false).')
      return
    }

    const echo = getEcho()
    if (!echo) {
      console.info('[NotificationListener] Echo not available — real-time disabled.')
      return
    }

    const user = authStore.user
    if (!user) {
      console.info('[NotificationListener] No authenticated user — skipping subscription.')
      return
    }

    try {
      const userId = user.id
      // Try to resolve hotel ID from auth store
      const hotelId = (authStore as any).activeHotelId
        || (user as any).hotel_id
        || (user as any).hotels?.[0]?.id

      console.log('[NotificationListener] 👤 User ID:', userId, '| Hotel ID:', hotelId)

      // 1. User-specific channel (always subscribe)
      const userChannel = `user.${userId}.notifications`
      console.log('[NotificationListener] 📡 Subscribing to private channel:', userChannel)
      echo.private(userChannel)
        .listen('.notification.received', (event: any) => {
          console.log('[NotificationListener] 🔔 EVENT received on', userChannel, ':', event)
          handleIncoming(event)
        })
      subscribedChannels.push(userChannel)

      // 2. Hotel+user scoped channel (if hotel ID is available)
      if (hotelId) {
        const hotelUserChannel = `hotel.${hotelId}.user.${userId}.notifications`
        console.log('[NotificationListener] 📡 Subscribing to private channel:', hotelUserChannel)
        echo.private(hotelUserChannel)
          .listen('.notification.received', (event: any) => {
            console.log('[NotificationListener] 🔔 EVENT received on', hotelUserChannel, ':', event)
            handleIncoming(event)
          })
        subscribedChannels.push(hotelUserChannel)
      }

      isListening.value = true
      console.log(`[NotificationListener] ✅ Subscribed to ${subscribedChannels.length} channel(s):`, subscribedChannels)
    }
    catch (err) {
      console.error('[NotificationListener] ❌ Subscription error:', err)
    }
  }

  /**
   * Handle incoming real-time notification.
   * Deduplicates across multiple channels.
   */
  function handleIncoming(event: { notification: PlatformNotification }) {
    if (!event?.notification) {
      console.warn('[NotificationListener] ⚠️ Event has no notification payload:', event)
      return
    }

    const notificationId = event.notification.id
    // Deduplicate: skip if we already processed this notification
    if (recentlySeenIds.has(notificationId)) {
      console.log('[NotificationListener] ⏭️ Duplicate skipped:', notificationId)
      return
    }

    // Mark as seen (auto-clean after 10 seconds)
    recentlySeenIds.add(notificationId)
    setTimeout(() => recentlySeenIds.delete(notificationId), 10_000)

    console.log('[NotificationListener] ✅ Processing notification:', event.notification.title)

    // Add to store
    notifStore.addRealtimeNotification(event.notification)

    // Show toast notification
    showNotificationToast(event.notification)

    // Play sound if enabled
    if (notifStore.settings?.sound_enabled !== false) {
      playNotificationSound()
    }
  }

  /**
   * Show a toast notification using vue-sonner.
   */
  function showNotificationToast(notification: PlatformNotification) {
    try {
      toast(notification.title, {
        description: notification.message,
        duration: notification.priority === 'urgent' ? 10000 : 5000,
        action: notification.action_url
          ? {
              label: 'View',
              onClick: () => {
                router.push(notification.action_url!)
              },
            }
          : undefined,
      })
    }
    catch {
      // Toast unavailable
    }
  }

  /**
   * Play notification sound using Web Audio API.
   * Generates a pleasant two-tone chime programmatically.
   */
  function playNotificationSound() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const now = ctx.currentTime

      // First tone — higher pitch (C6 = 1047 Hz)
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.value = 1047
      gain1.gain.setValueAtTime(0.15, now)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.3)

      // Second tone — slightly lower (E6 = 1319 Hz), delayed
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = 'sine'
      osc2.frequency.value = 1319
      gain2.gain.setValueAtTime(0.001, now)
      gain2.gain.setValueAtTime(0.12, now + 0.15)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(now + 0.15)
      osc2.stop(now + 0.5)

      // Close context after sound finishes
      setTimeout(() => ctx.close(), 600)
    }
    catch {
      // Audio unavailable — silently ignore
    }
  }

  /**
   * Unsubscribe from all notification channels.
   */
  function unsubscribe() {
    const echo = getEcho()
    if (echo) {
      subscribedChannels.forEach((channel) => {
        try {
          echo.leave(channel)
        }
        catch {
          // Channel may already be disconnected
        }
      })
    }
    subscribedChannels.length = 0
    isListening.value = false
    console.info('[NotificationListener] Unsubscribed from all channels.')
  }

  // Auto-cleanup on component unmount
  onUnmounted(() => {
    unsubscribe()
  })

  return {
    isListening,
    subscribe,
    unsubscribe,
  }
}

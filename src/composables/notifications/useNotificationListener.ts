import type { PlatformNotification } from '@/types/entities/platformNotification'
import { onUnmounted, ref } from 'vue'
import { getEcho } from '@/services/echo'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/shared/notification'

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
   */
  function handleIncoming(event: { notification: PlatformNotification }) {
    console.log('[NotificationListener] 📨 handleIncoming called with:', JSON.stringify(event, null, 2))

    if (!event?.notification) {
      console.warn('[NotificationListener] ⚠️ Event has no notification payload:', event)
      return
    }

    console.log('[NotificationListener] ✅ Adding notification to store:', event.notification.title)

    // Add to store (deduplication is handled inside the store)
    notifStore.addRealtimeNotification(event.notification)

    // Play sound if enabled
    if (notifStore.settings?.sound_enabled !== false) {
      console.log('[NotificationListener] 🔊 Playing notification sound')
      playNotificationSound()
    }
  }

  /**
   * Play notification sound (respects browser autoplay policy).
   */
  function playNotificationSound() {
    try {
      // Use a subtle default sound — can be replaced with custom asset
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Soft bell-like tone
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    }
    catch {
      // Silently ignore — browser may block autoplay
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

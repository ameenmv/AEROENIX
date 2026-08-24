import type { PusherComposable, PusherConfig } from '@/types/composables/pusher'
import Pusher from 'pusher-js'

// Singleton state — shared across all usePusher() calls
const pusherInstance = shallowRef<Pusher | null>(null)
const pusherChannel = shallowRef<any>(null)
const connectionStatus = ref('Disconnected')

export function usePusher(): PusherComposable {
  const ensurePusher = async (config: PusherConfig) => {
    if (pusherInstance.value) {
      return
    }
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
    const headers: Record<string, string> = {
      ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
    }
    if (config.token) {
      headers.Authorization = `Bearer ${config.token}`
    }
    console.warn('[Pusher] Initializing with config:', {
      key: config.key,
      cluster: config.cluster,
      authEndpoint: config.authEndpoint,
    })
    pusherInstance.value = new Pusher(config.key, {
      cluster: config.cluster,
      forceTLS: true,
      enabledTransports: ['ws', 'wss'],
      authEndpoint: config.authEndpoint || '/broadcasting/auth',
      auth: {
        headers,
      },
    })
    pusherInstance.value.connection.bind('connecting', () => {
      connectionStatus.value = 'Connecting'
      console.warn('[Pusher] ⏳ Connecting...')
    })
    pusherInstance.value.connection.bind('connected', () => {
      connectionStatus.value = 'Connected'
      console.warn('[Pusher] ✅ Connected — socket ID:', pusherInstance.value?.connection.socket_id)
    })
    pusherInstance.value.connection.bind('disconnected', () => {
      connectionStatus.value = 'Disconnected'
      console.warn('[Pusher] ❌ Disconnected')
    })
    pusherInstance.value.connection.bind('failed', () => {
      connectionStatus.value = 'Failed'
      console.error('[Pusher] 🚫 Connection failed')
    })
    pusherInstance.value.connection.bind('error', (err: any) => {
      console.error('[Pusher] ⚠️ Connection error:', err)
    })
  }
  const unsubscribeFromChannel = () => {
    if (pusherChannel.value) {
      pusherChannel.value.unbind()
      if (pusherInstance.value) {
        pusherInstance.value.unsubscribe(pusherChannel.value.name)
      }
      pusherChannel.value = null
    }
  }
  const subscribeToChannel = async (channelName: string) => {
    if (!pusherInstance.value) {
      throw new Error('Pusher instance not initialized. Call ensurePusher first.')
    }
    if (pusherChannel.value) {
      unsubscribeFromChannel()
    }
    pusherChannel.value = pusherInstance.value.subscribe(channelName)
  }
  const bindEvent = (eventName: string, callback: (data: any) => void) => {
    if (!pusherChannel.value) {
      return
    }
    pusherChannel.value.bind(eventName, callback)
  }
  const unbindEvent = (eventName: string) => {
    if (!pusherChannel.value) {
      return
    }
    pusherChannel.value.unbind(eventName)
  }
  const disconnect = () => {
    if (pusherChannel.value) {
      pusherChannel.value.unbind()
      if (pusherInstance.value) {
        pusherInstance.value.unsubscribe(pusherChannel.value.name)
      }
    }
    if (pusherInstance.value) {
      pusherInstance.value.disconnect()
      pusherInstance.value = null
    }
    connectionStatus.value = 'Disconnected'
  }
  return {
    pusher: pusherInstance,
    channel: pusherChannel,
    connectionStatus,
    ensurePusher,
    subscribeToChannel,
    unsubscribeFromChannel,
    bindEvent,
    unbindEvent,
    disconnect,
  }
}

import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Laravel Echo — Reverb WebSocket Client (Lazy)
 *
 * Only creates the Echo instance when getEcho() is called AND the app key
 * is configured. This prevents crashes when VITE_REVERB_APP_KEY is empty.
 * ──────────────────────────────────────────────────────────────────────────────
 */

// Make Pusher available globally (required by Laravel Echo)
;(window as any).Pusher = Pusher

let echoInstance: Echo<'reverb'> | null = null

/**
 * Get (or create) the Echo instance.
 * Returns null if VITE_REVERB_APP_KEY is not configured.
 */
export function getEcho(): Echo<'reverb'> | null {
  // Gate: skip if explicitly disabled
  const reverbEnabled = import.meta.env.VITE_REVERB_ENABLED
  if (reverbEnabled === 'false' || reverbEnabled === '0') {
    console.log('[Echo] ❌ Reverb disabled (VITE_REVERB_ENABLED=%s)', reverbEnabled)
    return null
  }

  const appKey = import.meta.env.VITE_REVERB_APP_KEY

  if (!appKey) {
    console.log('[Echo] ❌ No VITE_REVERB_APP_KEY configured — skipping WebSocket')
    return null
  }


  if (!echoInstance) {
    const wsHost = import.meta.env.VITE_REVERB_HOST || window.location.hostname
    const wsPort = import.meta.env.VITE_REVERB_PORT || 8080
    const scheme = import.meta.env.VITE_REVERB_SCHEME || 'https'
    const forceTLS = scheme === 'https'
    const authEndpoint = `${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '')}/broadcasting/auth`

    console.log('[Echo] 🔌 Creating Echo instance with config:', {
      key: appKey,
      wsHost,
      wsPort,
      forceTLS,
      scheme,
      authEndpoint,
    })

    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: appKey,
      wsHost,
      wsPort,
      wssPort: import.meta.env.VITE_REVERB_PORT || 443,
      forceTLS,
      enabledTransports: ['ws', 'wss'],
      authEndpoint,
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
          Accept: 'application/json',
        },
      },
    })

    // Log connection state changes
    const connector = (echoInstance as any).connector
    if (connector?.pusher) {
      connector.pusher.connection.bind('connected', () => {
        console.log('[Echo] ✅ WebSocket CONNECTED')
      })
      connector.pusher.connection.bind('disconnected', () => {
        console.log('[Echo] ⚠️ WebSocket DISCONNECTED')
      })
      connector.pusher.connection.bind('error', (err: any) => {
        console.log('[Echo] ❌ WebSocket ERROR:', err)
      })
      connector.pusher.connection.bind('state_change', (states: any) => {
        console.log('[Echo] 🔄 State change:', states.previous, '→', states.current)
      })
    }

    console.log('[Echo] ✅ Echo instance created successfully')
  }

  return echoInstance
}

export default getEcho

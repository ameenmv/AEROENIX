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
  const appKey = import.meta.env.VITE_REVERB_APP_KEY

  if (!appKey) {
    console.warn('[Echo] VITE_REVERB_APP_KEY is not set — real-time disabled.')
    return null
  }

  if (!echoInstance) {
    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: appKey,
      wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
      wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
      wssPort: import.meta.env.VITE_REVERB_PORT || 443,
      forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'https') === 'https',
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '')}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
          Accept: 'application/json',
        },
      },
    })
  }

  return echoInstance
}

export default getEcho

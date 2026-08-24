# usePusher

Composable for real-time WebSocket communication using [Pusher](https://pusher.com/).

## Usage

```ts
import { usePusher } from '@/composables/usePusher'

const {
  pusher,
  channel,
  connectionStatus,
  ensurePusher,
  subscribeToChannel,
  unsubscribeFromChannel,
  bindEvent,
  unbindEvent,
  disconnect,
} = usePusher()
```

## Setup

Initialize the Pusher connection with your app credentials:

```ts
await ensurePusher({
  key: 'your-pusher-key',
  cluster: 'eu',
  authEndpoint: '/broadcasting/auth',  // Optional, default: '/broadcasting/auth'
})
```

## Subscribing to Channels

```ts
// Subscribe to a channel
await subscribeToChannel('orders')

// Bind to events on that channel
bindEvent('order.created', (data) => {
  console.log('New order:', data)
})

bindEvent('order.updated', (data) => {
  console.log('Order updated:', data)
})
```

## Returned API

| Method / Property | Type | Description |
|---|---|---|
| `pusher` | `ShallowRef<Pusher>` | Raw Pusher instance |
| `channel` | `ShallowRef<Channel>` | Current subscribed channel |
| `connectionStatus` | `Ref<string>` | `'Connected'` or `'Disconnected'` |
| `ensurePusher(config)` | `(PusherConfig) => Promise<void>` | Initialize Pusher (idempotent) |
| `subscribeToChannel(name)` | `(string) => Promise<void>` | Subscribe to a channel |
| `unsubscribeFromChannel()` | `() => void` | Unsubscribe from current channel |
| `bindEvent(event, callback)` | `(string, Function) => void` | Listen for a channel event |
| `unbindEvent(event)` | `(string) => void` | Stop listening for an event |
| `disconnect()` | `() => void` | Fully disconnect and clean up |

## PusherConfig

```ts
interface PusherConfig {
  key: string           // Pusher app key
  cluster: string       // Pusher cluster (e.g., 'eu', 'us2')
  authEndpoint?: string // Auth endpoint for private channels
}
```

## Example: Live Order Updates

```vue
<script setup lang="ts">
import { usePusher } from '@/composables/usePusher'
import { onMounted, onUnmounted } from 'vue'

const { ensurePusher, subscribeToChannel, bindEvent, disconnect } = usePusher()

onMounted(async () => {
  await ensurePusher({ key: 'app-key', cluster: 'eu' })
  await subscribeToChannel('orders')

  bindEvent('order.created', (data) => {
    // Refresh the orders list or show a notification
  })
})

onUnmounted(() => {
  disconnect()
})
</script>
```

::: warning
Always call `disconnect()` in `onUnmounted` to clean up WebSocket connections and prevent memory leaks.
:::

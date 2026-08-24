import type Pusher from 'pusher-js'
import type { Ref, ShallowRef } from 'vue'

export interface PusherConfig {
  key: string
  cluster: string
  authEndpoint?: string
  token?: string
}
export interface PusherComposable {
  pusher: ShallowRef<Pusher | null>
  channel: ShallowRef<any>
  connectionStatus: Ref<string>
  ensurePusher: (config: PusherConfig) => Promise<void>
  subscribeToChannel: (channelName: string) => Promise<void>
  unsubscribeFromChannel: () => void
  bindEvent: (eventName: string, callback: (data: any) => void) => void
  unbindEvent: (eventName: string) => void
  disconnect: () => void
}

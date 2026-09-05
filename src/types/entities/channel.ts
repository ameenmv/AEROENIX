/**
 * Channel Integration Types — aligned with Aeroenix backend channel models & controllers.
 */

export type ChannelProvider =
  | 'whatsapp_business'
  | 'instagram_professional'
  | 'facebook_messenger'

export type ChannelStatus = 'connected' | 'disconnected' | 'error'

export interface Channel {
  id: number
  hotel_id?: number | null
  user_id?: number | null
  provider: ChannelProvider
  external_account_id?: string | null
  username?: string | null
  name: string
  profile_picture_url?: string | null
  status: ChannelStatus
  metadata?: Record<string, any> | null
  connected_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface ChannelHealth {
  status: 'healthy' | 'warning' | 'error'
  message?: string
  last_checked_at?: string
  token_valid?: boolean
}

export interface ConnectWhatsAppPayload {
  hotel_id?: number
  phone_number_id: string
  access_token: string
}

export interface ConnectInstagramPayload {
  hotel_id?: number
  auth_key: string
}

export interface ConnectFacebookPayload {
  hotel_id?: number
  page_id: string
  access_token: string
}

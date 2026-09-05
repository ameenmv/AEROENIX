import type {
  Channel,
  ChannelHealth,
  ConnectFacebookPayload,
  ConnectInstagramPayload,
  ConnectWhatsAppPayload,
} from '@/types/entities/channel'
import type { ApiSuccessResponse } from '@/types/services/api'
import api from './api'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Channels Service — aligned with Aeroenix backend channel controllers:
 *   - WhatsAppBusinessController
 *   - InstagramProfessionalController
 *   - FacebookMessengerController
 * ──────────────────────────────────────────────────────────────────────────────
 */

const WHATSAPP_BASE = '/user/workspace/channels/whatsapp-business'
const INSTAGRAM_BASE = '/user/workspace/channels/instagram-professional'
const FACEBOOK_BASE = '/user/workspace/channels/facebook-messenger'

export const channelsService = {
  // ── WhatsApp Business ──────────────────────────────────────────────────────
  async getWhatsAppAuthUrl(hotelId?: number): Promise<{ url?: string; auth_url?: string; state: string }> {
    const res = await api.get<ApiSuccessResponse<any>>(`${WHATSAPP_BASE}/auth-url`, {
      params: hotelId ? { hotel_id: hotelId } : {},
    })
    return res.data.data
  },

  async connectWhatsApp(data: ConnectWhatsAppPayload): Promise<Channel> {
    const res = await api.post<ApiSuccessResponse<{ channel: Channel }>>(`${WHATSAPP_BASE}/connect`, data)
    return res.data.data.channel
  },

  async checkWhatsAppHealth(channelId: number | string): Promise<ChannelHealth> {
    const res = await api.get<ApiSuccessResponse<{ health: ChannelHealth }>>(`${WHATSAPP_BASE}/${channelId}/health`)
    return res.data.data.health
  },

  async disconnectWhatsApp(channelId: number | string): Promise<string> {
    const res = await api.delete<ApiSuccessResponse<any>>(`${WHATSAPP_BASE}/${channelId}`)
    return res.data.message || 'WhatsApp channel disconnected successfully.'
  },

  // ── Instagram Professional ────────────────────────────────────────────────
  async getInstagramAuthUrl(hotelId?: number): Promise<{ url?: string; auth_url?: string; state: string }> {
    const res = await api.get<ApiSuccessResponse<any>>(`${INSTAGRAM_BASE}/auth-url`, {
      params: hotelId ? { hotel_id: hotelId } : {},
    })
    return res.data.data
  },

  async connectInstagram(data: ConnectInstagramPayload): Promise<Channel> {
    const res = await api.post<ApiSuccessResponse<{ channel: Channel }>>(`${INSTAGRAM_BASE}/connect`, data)
    return res.data.data.channel
  },

  async checkInstagramHealth(channelId: number | string): Promise<ChannelHealth> {
    const res = await api.get<ApiSuccessResponse<ChannelHealth>>(`${INSTAGRAM_BASE}/${channelId}/health`)
    return res.data.data
  },

  // ── Facebook Messenger ─────────────────────────────────────────────────────
  async getFacebookAuthUrl(hotelId?: number): Promise<{ url?: string; auth_url?: string; state: string }> {
    const res = await api.get<ApiSuccessResponse<any>>(`${FACEBOOK_BASE}/auth-url`, {
      params: hotelId ? { hotel_id: hotelId } : {},
    })
    return res.data.data
  },

  async connectFacebook(data: ConnectFacebookPayload): Promise<Channel> {
    const res = await api.post<ApiSuccessResponse<{ channel: Channel }>>(`${FACEBOOK_BASE}/connect`, data)
    return res.data.data.channel
  },

  async checkFacebookHealth(channelId: number | string): Promise<ChannelHealth> {
    const res = await api.get<ApiSuccessResponse<ChannelHealth>>(`${FACEBOOK_BASE}/${channelId}/health`)
    return res.data.data
  },
}

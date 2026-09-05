/**
 * Conversation & Handoff types — aligned with Aeroenix backend Conversation model & InboxController.
 */

export type HandoffStatus = 'bot' | 'human'

export interface Conversation {
  id: number
  channel_id: number
  external_contact_id: string
  contact_name: string | null
  handoff_status: HandoffStatus
  is_ai_paused: boolean
  paused_at?: string | null
  paused_by_user_id?: number | null
  last_message_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface InboxConversationItem {
  id: number
  contact_name: string
  avatar_initials: string
  channel_id: number
  channel_badge_name: string
  text: string
  time: string
  unread_count: number
}

export interface InboxMessageItem {
  id: number
  sender_type: 'customer' | 'ai' | 'staff'
  text: string
  time: string
}

export interface InboxConversationDetail {
  id: number
  contact_name: string
  avatar_initials: string
  phone: string
  channel_id: number
  channel_badge_name: string
  lead_score: string
  stats: {
    conversations: number
    bookings: number
    first_contact: string
  }
}

export interface ConversationHandoffResponse {
  success: boolean
  message: string
  conversation: {
    id: number
    channel_id: number
    external_contact_id: string
    contact_name: string | null
    handoff_status: HandoffStatus
    is_ai_paused: boolean
    paused_at?: string | null
    paused_by_user_id?: number | null
  }
}

export interface ConversationStatusResponse {
  success: boolean
  conversation_id: number
  channel_id: number
  handoff_status: HandoffStatus
  is_ai_paused: boolean
  is_ai_active: boolean
  paused_at?: string | null
  paused_by_user_id?: number | null
}

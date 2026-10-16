export type LeadClassification = 'hot' | 'warm' | 'cold'
export type LeadChannelType = 'whatsapp' | 'messenger' | 'instagram' | 'chat'

export interface LeadCard {
  id: number
  conversation_id: number
  contact_name: string
  avatar_initials: string
  phone: string | null
  channel_id: number
  channel_type: LeadChannelType
  channel_provider: string
  channel_badge_name: string
  inquiry: string
  classification: LeadClassification
  classification_label: string
  score: number
  tag: string
  tag_variant: 'warning' | 'info' | 'default'
  time: string
  last_message_at: string
  created_at: string
  mode?: string
  is_ai_paused?: boolean
}

export interface LeadSummary {
  total: number
  hot: number
  warm: number
  cold: number
}

export interface LeadColumns {
  hot: LeadCard[]
  warm: LeadCard[]
  cold: LeadCard[]
}

export interface LeadListResponse {
  summary: LeadSummary
  columns: LeadColumns
  leads: LeadCard[]
}

export interface LeadMessageItem {
  id: number
  sender_type: 'customer' | 'ai' | 'staff'
  direction: 'inbound' | 'outbound'
  text: string
  time: string
  created_at?: string
}

export interface LeadDetailsResponse {
  lead: LeadCard
  channel: {
    id: number
    name: string
    provider: string
    badge_name: string
    hotel_id?: number
    hotel_name?: string
  }
  stats: {
    related_bookings_count: number
    total_messages_count: number
    first_contact_at: string
  }
  messages: LeadMessageItem[]
}

export interface UpdateClassificationPayload {
  classification: LeadClassification
  score?: number
  tag?: string
}

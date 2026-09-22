/**
 * Knowledge Base types — aligned with backend HotelKnowledge model.
 */

export type KnowledgeStatus = 'active' | 'inactive'

export interface KnowledgeEntry {
  id: number
  hotel_id: number
  category: string
  title: string
  content: string
  metadata: Record<string, unknown> | null
  status: KnowledgeStatus
  priority: number
  created_at: string | null
  updated_at: string | null
}

export interface KnowledgeCreatePayload {
  category: string
  title: string
  content: string
  metadata?: Record<string, unknown>
  priority?: number
  status?: KnowledgeStatus
}

export interface KnowledgeUpdatePayload extends Partial<KnowledgeCreatePayload> {}

export interface KnowledgePagination {
  total: number
  count: number
  per_page: number
  current_page: number
  total_pages: number
}

export interface KnowledgeListResult {
  data: KnowledgeEntry[]
  pagination: KnowledgePagination
}

/** Predefined knowledge categories */
export const KNOWLEDGE_CATEGORIES = [
  'general',
  'rooms',
  'amenities',
  'policies',
  'location',
  'dining',
  'pricing',
  'activities',
  'transportation',
  'contact',
] as const

export type KnowledgeCategory = (typeof KNOWLEDGE_CATEGORIES)[number]

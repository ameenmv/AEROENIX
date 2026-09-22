import type {
  KnowledgeCreatePayload,
  KnowledgeEntry,
  KnowledgeListResult,
  KnowledgeUpdatePayload,
} from '@/types/entities/knowledge'
import type { ApiSuccessResponse } from '@/types/services/api'
import api from './api'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Knowledge Base Service — CRUD operations for hotel_knowledge entries.
 *
 * Backend routes (under auth:sanctum):
 *   GET    /platform/knowledge
 *   POST   /platform/knowledge
 *   GET    /platform/knowledge/{id}
 *   PUT    /platform/knowledge/{id}
 *   DELETE /platform/knowledge/{id}
 *   POST   /platform/knowledge/{id}/toggle-status
 * ──────────────────────────────────────────────────────────────────────────────
 */

const ENDPOINT = '/platform/knowledge'

export const knowledgeService = {
  /**
   * List knowledge entries with optional filtering and pagination.
   */
  async list(params: {
    page?: number
    limit?: number
    status?: string | null
    category?: string | null
    search?: string
    hotel_id?: number
  } = {}): Promise<KnowledgeListResult> {
    // Clean null/empty params before sending
    const cleanParams: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined && value !== '') {
        cleanParams[key] = value
      }
    }

    const response = await api.get<ApiSuccessResponse<any>>(ENDPOINT, {
      params: cleanParams,
    })

    const data = response.data.data || {}

    return {
      data: data.items || data.knowledge || data.data || [],
      pagination: data.pagination || {
        total: 0,
        count: 0,
        per_page: params.limit || 20,
        current_page: params.page || 1,
        total_pages: 0,
      },
    }
  },

  /**
   * Get a single knowledge entry by ID.
   */
  async get(id: number | string): Promise<KnowledgeEntry> {
    const response = await api.get<ApiSuccessResponse<{ knowledge: KnowledgeEntry }>>(
      `${ENDPOINT}/${id}`,
    )
    return response.data.data?.knowledge || (response.data as any).knowledge || response.data.data
  },

  /**
   * Create a new knowledge entry.
   */
  async create(data: KnowledgeCreatePayload): Promise<KnowledgeEntry> {
    const response = await api.post<ApiSuccessResponse<{ knowledge: KnowledgeEntry }>>(
      ENDPOINT,
      data,
    )
    return response.data.data?.knowledge || (response.data as any).knowledge || response.data.data
  },

  /**
   * Update an existing knowledge entry.
   */
  async update(id: number | string, data: KnowledgeUpdatePayload): Promise<KnowledgeEntry> {
    const response = await api.put<ApiSuccessResponse<{ knowledge: KnowledgeEntry }>>(
      `${ENDPOINT}/${id}`,
      data,
    )
    return response.data.data?.knowledge || (response.data as any).knowledge || response.data.data
  },

  /**
   * Delete a knowledge entry.
   */
  async destroy(id: number | string): Promise<string> {
    const response = await api.delete<ApiSuccessResponse<any>>(`${ENDPOINT}/${id}`)
    return response.data.message || 'Knowledge entry deleted successfully.'
  },

  /**
   * Toggle active ↔ inactive status.
   */
  async toggleStatus(id: number | string): Promise<KnowledgeEntry> {
    const response = await api.post<ApiSuccessResponse<{ knowledge: KnowledgeEntry }>>(
      `${ENDPOINT}/${id}/toggle-status`,
    )
    return response.data.data?.knowledge || (response.data as any).knowledge || response.data.data
  },
}

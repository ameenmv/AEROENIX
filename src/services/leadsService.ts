import type {
  LeadCard,
  LeadDetailsResponse,
  LeadListResponse,
  UpdateClassificationPayload,
} from '@/types/entities/lead'
import type { ApiSuccessResponse } from '@/types/services/api'
import api from './api'

const ENDPOINT = '/platform/leads'

export const leadsService = {
  /**
   * List leads grouped by Kanban columns (Hot, Warm, Cold) with summary counters and filters.
   */
  async list(params?: {
    hotel_id?: number
    classification?: string
    channel?: string
    search?: string
    tag?: string
  }): Promise<LeadListResponse> {
    const response = await api.get<ApiSuccessResponse<LeadListResponse>>(ENDPOINT, {
      params,
    })
    return (
      response.data.data || {
        summary: { total: 0, hot: 0, warm: 0, cold: 0 },
        columns: { hot: [], warm: [], cold: [] },
        leads: [],
      }
    )
  },

  /**
   * Get single lead details with conversation history, stats, and guest profile.
   */
  async get(conversationId: number | string): Promise<LeadDetailsResponse> {
    const response = await api.get<ApiSuccessResponse<LeadDetailsResponse>>(
      `${ENDPOINT}/${conversationId}`,
    )
    return response.data.data
  },

  /**
   * Update lead classification, score, and tag (e.g. dragging between Kanban columns).
   */
  async updateClassification(
    conversationId: number | string,
    payload: UpdateClassificationPayload,
  ): Promise<LeadCard> {
    const response = await api.patch<ApiSuccessResponse<LeadCard>>(
      `${ENDPOINT}/${conversationId}/classification`,
      payload,
    )
    return response.data.data
  },
}

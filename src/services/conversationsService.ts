import type {
  ConversationHandoffResponse,
  ConversationStatusResponse,
} from '@/types/entities/conversation'
import api from './api'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Conversations Service — aligned with Aeroenix backend ConversationHandoffController.
 *
 * Backend routes:
 *   POST /user/workspace/conversations/{conversation}/handoff
 *   POST /user/workspace/conversations/{conversation}/resume-ai
 *   GET  /user/workspace/conversations/{conversation}/handoff-status
 * ──────────────────────────────────────────────────────────────────────────────
 */

const BASE = '/user/workspace/conversations'

export const conversationsService = {
  /**
   * Hand off conversation to human agent (pauses AI responses).
   */
  async handoff(conversationId: number | string): Promise<ConversationHandoffResponse> {
    const res = await api.post<ConversationHandoffResponse>(`${BASE}/${conversationId}/handoff`)
    return res.data
  },

  /**
   * Resume automated AI responses on the conversation.
   */
  async resumeAi(conversationId: number | string): Promise<ConversationHandoffResponse> {
    const res = await api.post<ConversationHandoffResponse>(`${BASE}/${conversationId}/resume-ai`)
    return res.data
  },

  /**
   * Get current handoff & AI status of a conversation.
   */
  async getStatus(conversationId: number | string): Promise<ConversationStatusResponse> {
    const res = await api.get<ConversationStatusResponse>(`${BASE}/${conversationId}/handoff-status`)
    return res.data
  },
}

import type {
  ConversationHandoffResponse,
  ConversationStatusResponse,
  InboxConversationDetail,
  InboxConversationItem,
  InboxMessageItem,
} from '@/types/entities/conversation'
import type { ApiSuccessResponse } from '@/types/services/api'
import api from './api'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Conversations Service — aligned with Aeroenix backend InboxController &
 * ConversationHandoffController.
 *
 * Backend routes:
 *   GET  /user/workspace/conversations
 *   GET  /user/workspace/conversations/{conversation}
 *   GET  /user/workspace/conversations/{conversation}/messages
 *   POST /user/workspace/conversations/{conversation}/messages
 *   POST /user/workspace/conversations/{conversation}/handoff
 *   POST /user/workspace/conversations/{conversation}/resume-ai
 *   GET  /user/workspace/conversations/{conversation}/handoff-status
 * ──────────────────────────────────────────────────────────────────────────────
 */

const BASE = '/user/workspace/conversations'

export const conversationsService = {
  /**
   * Get list of conversations for the inbox sidebar.
   */
  async getConversations(params?: {
    channel?: string
    search?: string
    hotel_id?: number
  }): Promise<InboxConversationItem[]> {
    const res = await api.get<ApiSuccessResponse<{ conversations: InboxConversationItem[] }>>(BASE, { params })
    return res.data.data?.conversations || (res.data as any).conversations || []
  },

  /**
   * Get CRM details for a conversation.
   */
  async getConversation(id: number | string): Promise<InboxConversationDetail> {
    const res = await api.get<ApiSuccessResponse<{ conversation: InboxConversationDetail }>>(`${BASE}/${id}`)
    return res.data.data?.conversation || (res.data as any).conversation
  },

  /**
   * Get chat thread messages for a conversation.
   */
  async getMessages(id: number | string): Promise<InboxMessageItem[]> {
    const res = await api.get<ApiSuccessResponse<{ messages: InboxMessageItem[] }>>(`${BASE}/${id}/messages`)
    return res.data.data?.messages || (res.data as any).messages || []
  },

  /**
   * Send a staff reply message in the conversation.
   */
  async sendMessage(id: number | string, messageText: string): Promise<InboxMessageItem> {
    const res = await api.post<ApiSuccessResponse<{ message: InboxMessageItem }>>(`${BASE}/${id}/messages`, {
      message_text: messageText,
    })
    return res.data.data?.message || (res.data as any).message
  },

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

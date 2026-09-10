import type { StaffQnaPair } from '@/types/entities/staffQna'
import type { ApiSuccessResponse } from '@/types/services/api'
import api from './api'

export const staffQnaService = {
  async list(params: {
    hotel_id?: number | string
    conversation_id?: number | string
    limit?: number
  } = {}): Promise<StaffQnaPair[]> {
    const response = await api.get<ApiSuccessResponse<StaffQnaPair[]>>('/ai/staff-answers', {
      params,
    })

    // The backend might return it under data directly, or wrapped in a data object
    if (Array.isArray(response.data)) {
      return response.data
    }
    return response.data.data || []
  },
}

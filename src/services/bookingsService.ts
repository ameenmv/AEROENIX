import type { Booking, BookingRejectPayload, BookingUpdatePayload } from '@/types/entities/booking'
import type { ApiSuccessResponse } from '@/types/services/api'
import api from './api'

const ENDPOINT = '/platform/bookings'

export interface BookingPagination {
  total: number
  count: number
  per_page: number
  current_page: number
  total_pages: number
}

export interface BookingListResult {
  data: Booking[]
  pagination: BookingPagination
}

export const bookingsService = {
  async list(params: {
    page?: number
    limit?: number
    status?: string
    search?: string
    hotel_id?: number
  } = {}): Promise<BookingListResult> {
    const response = await api.get<ApiSuccessResponse<any>>(ENDPOINT, {
      params,
    })

    const data = response.data.data || {}

    return {
      data: data.items || data.bookings || [],
      pagination: data.pagination || {
        total: 0,
        count: 0,
        per_page: params.limit || 20,
        current_page: params.page || 1,
        total_pages: 0,
      },
    }
  },

  async get(id: number | string): Promise<Booking> {
    const response = await api.get<ApiSuccessResponse<{ booking: Booking }>>(`${ENDPOINT}/${id}`)
    return response.data.data.booking
  },

  async update(id: number | string, data: BookingUpdatePayload): Promise<Booking> {
    const response = await api.put<ApiSuccessResponse<{ booking: Booking }>>(`${ENDPOINT}/${id}`, data)
    return response.data.data.booking
  },

  async delete(id: number | string): Promise<string> {
    const response = await api.delete<ApiSuccessResponse<any>>(`${ENDPOINT}/${id}`)
    return response.data.message || 'Booking deleted successfully.'
  },

  async confirm(id: number | string): Promise<Booking> {
    const response = await api.post<ApiSuccessResponse<{ booking: Booking }>>(`${ENDPOINT}/${id}/confirm`)
    return response.data.data.booking
  },

  async reject(id: number | string, data: BookingRejectPayload): Promise<Booking> {
    const response = await api.post<ApiSuccessResponse<{ booking: Booking }>>(`${ENDPOINT}/${id}/reject`, data)
    return response.data.data.booking
  }
}

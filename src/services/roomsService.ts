import type { Room, RoomCreatePayload, RoomUpdatePayload } from '@/types/entities/room'
import type { ApiSuccessResponse } from '@/types/services/api'
import api from './api'

export interface RoomPagination {
  total: number
  count: number
  per_page: number
  current_page: number
  total_pages: number
}

export interface RoomListResult {
  data: Room[]
  pagination: RoomPagination
}

export const roomsService = {
  async list(hotelId: number | string, params: {
    page?: number
    limit?: number
    search?: string
  } = {}): Promise<RoomListResult> {
    const response = await api.get<ApiSuccessResponse<any>>(`/platform/hotels/${hotelId}/rooms`, {
      params,
    })

    const data = response.data.data || {}

    return {
      data: data.items || data.rooms || [],
      pagination: data.pagination || {
        total: 0,
        count: 0,
        per_page: params.limit || 20,
        current_page: params.page || 1,
        total_pages: 0,
      },
    }
  },

  async get(hotelId: number | string, roomId: number | string): Promise<Room> {
    const response = await api.get<ApiSuccessResponse<{ room: Room }>>(`/platform/hotels/${hotelId}/rooms/${roomId}`)
    return response.data.data.room
  },

  async create(hotelId: number | string, data: RoomCreatePayload): Promise<Room> {
    const response = await api.post<ApiSuccessResponse<{ room: Room }>>(`/platform/hotels/${hotelId}/rooms`, data)
    return response.data.data.room
  },

  async update(hotelId: number | string, roomId: number | string, data: RoomUpdatePayload): Promise<Room> {
    const response = await api.put<ApiSuccessResponse<{ room: Room }>>(`/platform/hotels/${hotelId}/rooms/${roomId}`, data)
    return response.data.data.room
  },

  async delete(hotelId: number | string, roomId: number | string): Promise<string> {
    const response = await api.delete<ApiSuccessResponse<any>>(`/platform/hotels/${hotelId}/rooms/${roomId}`)
    return response.data.message || 'Room deleted successfully.'
  },
}

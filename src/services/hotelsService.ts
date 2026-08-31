import type { Hotel, HotelCreatePayload, HotelUpdatePayload } from '@/types/hotel'
import type { ApiSuccessResponse } from '@/types/services/api'
import api from './api'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Hotels Service — aligned with Aeroenix backend HotelController.
 *
 * Backend: app/Http/Controllers/V1/Platform/HotelController.php
 * Routes:
 *   GET    /platform/hotels            → index (paginated)
 *   POST   /platform/hotels            → store
 *   GET    /platform/hotels/{hotel}    → show
 *   PUT    /platform/hotels/{hotel}    → update
 *   DELETE /platform/hotels/{hotel}    → destroy
 *
 * Response envelope:
 *   Success:   { success, message, data: { hotel: ... } }
 *   Paginated: { success, message, data: { items, hotels, pagination: {...} } }
 * ──────────────────────────────────────────────────────────────────────────────
 */

const ENDPOINT = '/platform/hotels'

/** Pagination metadata from backend ApiResponse::paginated */
export interface HotelPagination {
  total: number
  count: number
  per_page: number
  current_page: number
  total_pages: number
  next_page_url: string | null
  prev_page_url: string | null
  first_page_url: string | null
  last_page_url: string | null
}

/** Result from the paginated hotels list */
export interface HotelListResult {
  data: Hotel[]
  pagination: HotelPagination
}

export const hotelsService = {
  /**
   * GET /platform/hotels — paginated list.
   *
   * Supports query params: search (or q), limit, page.
   * Backend response: { data: { items, hotels, pagination } }
   */
  async list(params: {
    page?: number
    limit?: number
    search?: string
  } = {}): Promise<HotelListResult> {
    const response = await api.get<ApiSuccessResponse<any>>(ENDPOINT, {
      params: {
        page: params.page,
        limit: params.limit,
        search: params.search,
      },
    })

    const data = response.data.data || {}

    return {
      // Backend returns items under both `items` and `hotels` keys
      data: data.hotels || data.items || [],
      pagination: data.pagination || {
        total: 0,
        count: 0,
        per_page: params.limit || 20,
        current_page: params.page || 1,
        total_pages: 0,
        next_page_url: null,
        prev_page_url: null,
        first_page_url: null,
        last_page_url: null,
      },
    }
  },

  /**
   * GET /platform/hotels/{id} — single hotel with full details.
   */
  async get(id: number | string): Promise<Hotel> {
    const response = await api.get<ApiSuccessResponse<{ hotel: Hotel }>>(
      `${ENDPOINT}/${id}`,
    )
    return response.data.data.hotel
  },

  /**
   * POST /platform/hotels — create hotel and invite admin.
   *
   * Backend also creates an invitation for the admin_email.
   */
  async create(data: HotelCreatePayload): Promise<Hotel> {
    const response = await api.post<ApiSuccessResponse<{ hotel: Hotel }>>(
      ENDPOINT,
      data,
    )
    return response.data.data.hotel
  },

  /**
   * PUT /platform/hotels/{id} — update hotel.
   *
   * Super Admin: can update all fields.
   * Hotel Admin: can update phone, email, check_in_time, check_out_time, description only.
   */
  async update(id: number | string, data: HotelUpdatePayload): Promise<Hotel> {
    const response = await api.put<ApiSuccessResponse<{ hotel: Hotel }>>(
      `${ENDPOINT}/${id}`,
      data,
    )
    return response.data.data.hotel
  },

  /**
   * DELETE /platform/hotels/{id} — delete hotel and related records.
   */
  async delete(id: number | string): Promise<void> {
    await api.delete(`${ENDPOINT}/${id}`)
  },
}

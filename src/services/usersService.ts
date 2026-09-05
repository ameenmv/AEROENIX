import type { HotelInvitation, InviteUserPayload, UpdateUserRolePayload, User } from '@/types/entities/users'
import type { ApiSuccessResponse } from '@/types/services/api'
import api from './api'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Users Service — aligned with Aeroenix backend UserController.
 *
 * Backend: app/Http/Controllers/V1/Platform/UserController.php
 * Routes:
 *   GET    /platform/users                              → index (paginated users + invitations)
 *   GET    /platform/users/{user}                       → show (full profile)
 *   POST   /platform/users/invite                       → invite user to hotel
 *   PUT    /platform/users/{user}/role                  → update user role
 *   POST   /platform/users/{user}/toggle-status         → suspend/activate
 *   DELETE /platform/users/{user}                       → delete user
 *   POST   /platform/users/invitations/{inv}/resend     → resend pending invitation
 *
 * Response envelope:
 *   List:    { success, data: { items, users, invitations, pagination } }
 *   Single:  { success, data: { user } }
 *   Invite:  { success, data: { invitation } }
 * ──────────────────────────────────────────────────────────────────────────────
 */

const ENDPOINT = '/platform/users'

/** Pagination metadata from backend ApiResponse::paginated */
export interface UserPagination {
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

/** Result from the paginated users list (includes invitations) */
export interface UserListResult {
  users: User[]
  invitations: HotelInvitation[]
  pagination: UserPagination
}

export const usersService = {
  /**
   * GET /platform/users — paginated list of users + pending invitations.
   *
   * Supports: search (or q), limit, page, hotel_id.
   * Backend returns both registered users AND pending invitations.
   */
  async list(params: {
    page?: number
    limit?: number
    search?: string
    hotel_id?: number
  } = {}): Promise<UserListResult> {
    const response = await api.get<ApiSuccessResponse<any>>(ENDPOINT, {
      params: {
        page: params.page,
        limit: params.limit,
        search: params.search,
        hotel_id: params.hotel_id,
      },
    })

    const data = response.data.data || {}

    return {
      users: data.users || data.items || [],
      invitations: data.invitations || [],
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
   * GET /platform/users/{id} — full user profile with activity log.
   */
  async get(id: number | string): Promise<User> {
    const response = await api.get<ApiSuccessResponse<{ user: User }>>(
      `${ENDPOINT}/${id}`,
    )
    return response.data.data.user
  },

  /**
   * POST /platform/users/invite — invite a user to a hotel.
   *
   * Super Admin: must provide hotel_id.
   * Hotel Admin: hotel_id is auto-resolved by backend.
   */
  async invite(data: InviteUserPayload): Promise<HotelInvitation> {
    const response = await api.post<ApiSuccessResponse<{ invitation: HotelInvitation }>>(
      `${ENDPOINT}/invite`,
      data,
    )
    return response.data.data.invitation
  },

  /**
   * PUT /platform/users/{id}/role — update user's hotel-scoped role.
   */
  async updateRole(userId: number | string, data: UpdateUserRolePayload): Promise<User> {
    const response = await api.put<ApiSuccessResponse<{ user: User }>>(
      `${ENDPOINT}/${userId}/role`,
      data,
    )
    return response.data.data.user
  },

  /**
   * POST /platform/users/{id}/toggle-status — suspend or activate user.
   */
  async toggleStatus(userId: number | string): Promise<{ user: User, message: string }> {
    const response = await api.post<ApiSuccessResponse<{ user: User }>>( 
      `${ENDPOINT}/${userId}/toggle-status`,
    )
    return { user: response.data.data.user, message: response.data.message }
  },

  /**
   * DELETE /platform/users/{id} — delete user (Super Admin only).
   */
  async delete(userId: number | string): Promise<string> {
    const response = await api.delete<{ success: boolean, message: string }>(`${ENDPOINT}/${userId}`)
    return response.data.message
  },

  /**
   * POST /platform/users/invitations/{id}/resend — resend pending invitation.
   */
  async resendInvitation(invitationId: number | string): Promise<string> {
    const response = await api.post<ApiSuccessResponse<any>>(`${ENDPOINT}/invitations/${invitationId}/resend`)
    return response.data.message || 'Invitation resent successfully.'
  },
}

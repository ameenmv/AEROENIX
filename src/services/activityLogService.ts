import type { ApiSuccessResponse } from '@/types/services/api'
import api from './api'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Activity Log Service — aligned with Aeroenix ActivityLogController.
 *
 * Backend route:
 *   GET /platform/activity-logs → paginated audit trail
 *
 * Response envelope:
 *   { success, message, data: { items: [...], pagination: {...} } }
 * ──────────────────────────────────────────────────────────────────────────────
 */

const ENDPOINT = '/platform/activity-logs'

/* ── Types ─────────────────────────────────────────────────────────────────── */

export interface ActivityLogItem {
  id: string
  user_name: string
  description: string
  action: string
  time_ago: string
  timestamp: string
  icon: string
}

export interface ActivityLogPagination {
  total: number
  count: number
  per_page: number
  current_page: number
  total_pages: number
  next_page_url: string | null
  prev_page_url: string | null
  first_page_url: string
  last_page_url: string
}

export interface ActivityLogListParams {
  hotel_id?: number | string
  search?: string
  per_page?: number
  page?: number
}

export interface ActivityLogResponse {
  items: ActivityLogItem[]
  pagination: ActivityLogPagination
}

/* ── Service ───────────────────────────────────────────────────────────────── */

export const activityLogService = {
  /**
   * GET /platform/activity-logs — paginated activity logs.
   */
  async getActivityLogs(params?: ActivityLogListParams): Promise<ActivityLogResponse> {
    const response = await api.get<ApiSuccessResponse<ActivityLogResponse>>(ENDPOINT, {
      params: params || {},
    })

    return response.data.data as ActivityLogResponse
  },
}

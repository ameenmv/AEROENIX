import type { ApiSuccessResponse } from '@/types/services/api'
import api from './api'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Dashboard Service — aligned with Aeroenix backend DashboardController.
 *
 * Backend route:
 *   GET /platform/dashboard   → aggregated dashboard stats
 *
 * Response envelope:
 *   { success, message, data: { header, kpis, conversations_last_7_days, channel_distribution, recent_activity } }
 * ──────────────────────────────────────────────────────────────────────────────
 */

const ENDPOINT = '/platform/dashboard'

/* ── KPI types ─────────────────────────────────────────────────────────────── */

export interface KpiItem {
  value: number
  formatted_value: string
  change_percentage: number
  trend: 'up' | 'down' | 'neutral'
  label: string
}

export interface HotelsUsersKpi {
  type: 'global'
  title: string
  hotels_count: number
  users_count: number
  label_hotels: string
  label_users: string
}

export interface DashboardKpis {
  total_conversations: KpiItem
  active_leads: KpiItem
  bookings_this_month: KpiItem
  hotels_and_users: HotelsUsersKpi
}

/* ── Chart types ───────────────────────────────────────────────────────────── */

export interface ConversationDay {
  day: string
  date: string
  count: number
}

export interface ChannelDistItem {
  name: string
  count: number
  percentage: number
  color: string
}

/* ── Activity types ────────────────────────────────────────────────────────── */

export interface RecentActivityItem {
  id: string
  user_name: string
  description: string
  title: string
  time_ago: string
  timestamp: string
  icon: string
}

/* ── Header ────────────────────────────────────────────────────────────────── */

export interface DashboardHeader {
  title: string
  subtitle: string
  scoped_hotel_id: number | null
  scoped_hotel_name: string | null
  user: {
    id: number
    name: string
    role: string
  }
}

/* ── Full response ─────────────────────────────────────────────────────────── */

export interface DashboardData {
  header: DashboardHeader
  kpis: DashboardKpis
  conversations_last_7_days: ConversationDay[]
  channel_distribution: Record<string, ChannelDistItem>
  recent_activity: RecentActivityItem[]
}

export const dashboardService = {
  /**
   * GET /platform/dashboard — aggregated dashboard data.
   *
   * Supports optional hotel_id filter to scope data to a specific hotel.
   */
  async get(params?: { hotel_id?: number | string }): Promise<DashboardData> {
    const response = await api.get<ApiSuccessResponse<DashboardData>>(ENDPOINT, {
      params: params || {},
    })

    return response.data.data as DashboardData
  },
}

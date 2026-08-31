/**
 * Hotel types — aligned with Aeroenix backend HotelResource.
 *
 * Backend: app/Http/Resources/V1/Platform/HotelResource.php
 * Endpoints:
 *   GET    /platform/hotels        → paginated list (subset of fields)
 *   GET    /platform/hotels/{id}   → full details
 *   POST   /platform/hotels        → create hotel + invite admin
 *   PUT    /platform/hotels/{id}   → update hotel
 *   DELETE /platform/hotels/{id}   → delete hotel
 */

// ── Hotel Entity ────────────────────────────────────────────────────────────

export interface Hotel {
  id: number
  name: string
  status: string

  /** Always returned in list and detail */
  address?: string | null
  staff_count?: number
  conversations_count?: number | null

  /** Detail-only fields (mergeWhen !isList) */
  country?: string | null
  currency?: string | null
  phone?: string | null
  email?: string | null
  check_in_time?: string | null
  check_out_time?: string | null
  timezone?: string | null
  description?: string | null
  created_at?: string | null
  updated_at?: string | null
}

// ── Create Hotel ────────────────────────────────────────────────────────────

/**
 * POST /platform/hotels — request body.
 *
 * Backend CreateHotelRequest:
 *   name:        required, string, max:255
 *   admin_email: required, email
 *   country:     nullable, string, max:100
 *   currency:    nullable, string, max:10
 *   phone:       nullable, string, max:50
 *   email:       nullable, email, max:255
 *   address:     nullable, string, max:1000
 *   check_in_time:  nullable, string, max:50
 *   check_out_time: nullable, string, max:50
 *   timezone:    nullable, string, max:100
 *   description: nullable, string, max:2000
 */
export interface HotelCreatePayload {
  name: string
  admin_email: string
  country?: string
  currency?: string
  phone?: string
  email?: string
  address?: string
  check_in_time?: string
  check_out_time?: string
  timezone?: string
  description?: string
}

// ── Update Hotel ────────────────────────────────────────────────────────────

/**
 * PUT /platform/hotels/{id} — request body.
 *
 * Super Admin: can update all fields (name, status, country, currency, address, timezone, ...)
 * Hotel Admin: can update subset (phone, email, check_in_time, check_out_time, description)
 */
export interface HotelUpdatePayload {
  name?: string
  status?: 'active' | 'inactive'
  country?: string
  currency?: string
  phone?: string
  email?: string
  address?: string
  check_in_time?: string
  check_out_time?: string
  timezone?: string
  description?: string
}

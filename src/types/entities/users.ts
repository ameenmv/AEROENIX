/**
 * User entity — aligned with Aeroenix backend UserResource.
 *
 * Backend: app/Http/Resources/V1/Platform/UserResource.php
 *
 * List view (GET /platform/users):
 *   id, name, email, status, role: { id, name }, hotel_name, last_active
 *
 * Detail view (GET /platform/users/{id}):
 *   + phone, activity_log: [{ description, created_at }]
 */
export interface User {
  id: number
  name: string
  email: string
  status: 'active' | 'suspended'
  role: { id: number; name: string } | null
  hotel_name: string | null
  last_active: string | null

  /** Detail-only fields */
  phone?: string | null
  activity_log?: ActivityLogEntry[]
}

/** Activity log entry from the user detail response */
export interface ActivityLogEntry {
  description: string
  created_at: string
}

/**
 * Hotel invitation — included in the users list response.
 *
 * Backend: app/Http/Resources/V1/Platform/HotelInvitationResource.php
 */
export interface HotelInvitation {
  id: number
  name: string | null
  email: string
  status: 'invited'
  role: { id: number; name: string } | null
  hotel_name: string | null
  last_active: null
  expires_at: string | null
}

/**
 * POST /platform/users/invite — request body.
 *
 * Backend InviteUserRequest:
 *   email:    required, email
 *   role_id:  required, integer, exists:roles
 *   hotel_id: required for Super Admin, nullable for Hotel Admin
 *   name:     nullable, string, max:255
 */
export interface InviteUserPayload {
  email: string
  role_id: number
  hotel_id?: number
  name?: string
}

/**
 * PUT /platform/users/{id}/role — request body.
 *
 * Backend UpdateUserRoleRequest:
 *   role_id:  required, integer, exists:roles
 *   hotel_id: required for Super Admin, nullable for Hotel Admin
 */
export interface UpdateUserRolePayload {
  role_id: number
  hotel_id?: number
}

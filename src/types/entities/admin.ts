import type { Role } from './role'
import type { ApiStatus } from './shared'

/**
 * Admin entity — matches backend AdminResource scope definitions.
 *
 * Scopes (cumulative):
 * - micro: id, name
 * - mini:  + email, phone, username, email_verified_at, status, status_label
 * - full:  + can_delete, can_update, created_at, updated_at
 *
 * Relations:
 * - roles: auto-included when eager-loaded (use ?include=roles)
 */
export interface Admin {
  id: number
  name: string
  email: string
  phone: string | null
  username: string | null
  email_verified_at: string | null
  status: ApiStatus
  status_label: string
  can_delete: boolean
  can_update: boolean
  roles: Role[]
  created_at: string
  updated_at: string
}

import type { Role } from './role'

/**
 * User entity — matches backend UserResource scope definitions.
 *
 * Scopes (cumulative):
 * - micro: id, name
 * - mini:  + email, email_verified_at
 * - full:  + created_at, updated_at
 *
 * Relations:
 * - roles: via RoleResource
 */
export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  roles?: Role[]
  created_at: string
  updated_at: string
}

import type { Permission } from './permission'
import type { ApiStatus, TranslatableField } from './shared'

/**
 * Role entity — matches backend RoleResource scope definitions.
 *
 * Scopes:
 * - micro: id, name, guard_name
 * - mini:  + display_name, status, status_label
 * - full:  + can_delete, can_update, created_at, updated_at
 *
 * Relations:
 * - permissions: via PermissionResource
 */
export interface Role {
  id: number
  name: string
  guard_name: string
  display_name: TranslatableField
  status: ApiStatus
  status_label: string
  can_delete: boolean
  can_update: boolean
  permissions?: Permission[]
  created_at: string
  updated_at: string
}

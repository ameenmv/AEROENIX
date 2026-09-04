/**
 * Role entity — aligned with Aeroenix backend RoleController matrix response.
 *
 * Backend: app/Http/Controllers/V1/Platform/RoleController.php
 *
 * GET /platform/roles-permissions returns:
 *   data.roles: [{ id, name, description, scope, hotel_id, is_custom, is_editable, permissions: number[] }]
 *   data.modules: [{ name, permissions: [{ id, action }] }]
 */
export interface Role {
  id: number
  name: string
  description: string | null
  scope: 'platform' | 'hotel'
  hotel_id: number | null
  is_custom: boolean
  is_editable: boolean
  /** Array of permission IDs assigned to this role */
  permissions: number[]
}

/**
 * POST /platform/roles — request body.
 *
 * Backend CreateRoleRequest:
 *   name: required, string
 *   description: nullable, string
 *   hotel_id: nullable, integer
 *   permissions: array of permission action strings
 */
export interface CreateRolePayload {
  name: string
  description?: string
  hotel_id?: number | null
  permissions?: string[]
}

/**
 * PUT /platform/roles/{role}/permissions — request body.
 *
 * Backend UpdateRolePermissionsRequest:
 *   permissions: required, array of permission action strings
 *   hotel_id: nullable, integer
 */
export interface UpdateRolePermissionsPayload {
  permissions: string[] | number[]
  hotel_id?: number
}

/** Permission module group from the matrix response */
export interface PermissionModule {
  name: string
  permissions: Array<{ id: number; action: string }>
}

/** Full matrix response from GET /platform/roles-permissions */
export interface RolesPermissionsMatrix {
  modules: PermissionModule[]
  roles: Role[]
}

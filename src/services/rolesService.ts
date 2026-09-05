import type { CreateRolePayload, Role, RolesPermissionsMatrix, UpdateRolePermissionsPayload } from '@/types/entities/role'
import type { ApiSuccessResponse } from '@/types/services/api'
import api from './api'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Roles Service — aligned with Aeroenix backend RoleController.
 *
 * Backend: app/Http/Controllers/V1/Platform/RoleController.php
 * Routes:
 *   GET  /platform/roles-permissions           → matrix (roles + permissions grid)
 *   POST /platform/roles                       → create custom role
 *   PUT  /platform/roles/{role}/permissions     → update role permissions
 *
 * NOTE: The backend does NOT have standard CRUD routes for roles.
 * No GET /{id}, PUT /{id}, DELETE /{id} endpoints exist.
 * ──────────────────────────────────────────────────────────────────────────────
 */

const ENDPOINT = '/platform/roles'

export const rolesService = {
  /**
   * GET /platform/roles-permissions — full matrix of roles and permissions.
   *
   * Returns all roles with their permission IDs, and all permission modules
   * grouped by feature area.
   *
   * Query param: hotel_id (optional) — scope to a specific hotel.
   */
  async getMatrix(hotelId?: number): Promise<RolesPermissionsMatrix> {
    const response = await api.get<ApiSuccessResponse<RolesPermissionsMatrix>>(
      '/platform/roles-permissions',
      {
        params: hotelId ? { hotel_id: hotelId } : {},
      },
    )
    return response.data.data
  },

  /**
   * POST /platform/roles — create a new custom role.
   *
   * For Super Admin: hotel_id can be null (platform-level role).
   * For Hotel Admin: hotel_id is resolved by backend.
   */
  async create(data: CreateRolePayload): Promise<Role> {
    const response = await api.post<ApiSuccessResponse<{ role: Role }>>(
      ENDPOINT,
      data,
    )
    return response.data.data.role
  },

  /**
   * PUT /platform/roles/{roleId}/permissions — update permissions for a role.
   */
  async updatePermissions(
    roleId: number | string,
    data: UpdateRolePermissionsPayload,
  ): Promise<{ id: number; name: string }> {
    const response = await api.put<ApiSuccessResponse<{ role: { id: number; name: string } }>>(
      `${ENDPOINT}/${roleId}/permissions`,
      data,
    )
    return response.data.data.role
  },

  /**
   * Backward-compatible dropdown method.
   * Returns roles from the matrix API in a format compatible with select fields.
   * Used by template modules (admins) that expect rolesService.dropdown().
   */
  async dropdown(_params?: Record<string, unknown>): Promise<{ data: Role[] }> {
    const matrix = await this.getMatrix()
    return { data: matrix.roles }
  },
}

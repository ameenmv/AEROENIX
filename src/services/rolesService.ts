import type { Permission } from '@/types/entities/permission'
import type { Role } from '@/types/entities/role'
import { ROLES_ENDPOINT } from '@/modules/roles/endpoints'
import api from './api'
import { createService } from './createService'

/**
 * Roles Service — aligned with backend RolesController + RolePermissionsController.
 *
 * Standard CRUD + toggle via createService:
 *   list()   → GET    /admin/v1/roles
 *   get()    → GET    /admin/v1/roles/{id}
 *   create() → POST   /admin/v1/roles
 *   update() → PUT    /admin/v1/roles/{id}
 *   delete() → DELETE /admin/v1/roles/{id}
 *   toggle() → PATCH  /admin/v1/roles/{id}/toggle
 *
 * Custom operations for permissions sub-resource:
 *   getPermissions() → GET   /admin/v1/roles/{id}/permissions
 *   syncPermissions() → PATCH /admin/v1/roles/{id}/permissions
 */
const baseService = createService<Role>(ROLES_ENDPOINT, {
  defaultListScope: 'full',
})

export const rolesService = {
  ...baseService,

  /** Override list to always include permissions relation */
  async list(params: Parameters<typeof baseService.list>[0] = {}) {
    return baseService.list({ ...params, scope: 'full' })
  },

  /**
   * GET /admin/v1/roles/{roleId}/permissions
   * Fetch permissions assigned to a specific role.
   */
  async getPermissions(roleId: string | number): Promise<Permission[]> {
    const response = await api.get(`${ROLES_ENDPOINT}/${roleId}/permissions`)
    return response.data?.data || response.data || []
  },

  /**
   * PATCH /admin/v1/roles/{roleId}/permissions
   * Sync (replace) a role's permissions with the given IDs.
   */
  async syncPermissions(roleId: string | number, permissionIds: number[]): Promise<void> {
    await api.patch(`${ROLES_ENDPOINT}/${roleId}/permissions`, {
      permissions: permissionIds,
    })
  },
}

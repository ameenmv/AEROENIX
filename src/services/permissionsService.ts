import type { Permission } from '@/types/entities/permission'
import { PERMISSIONS_ENDPOINT } from '@/modules/permissions/endpoints'
import { createService } from './createService'

/**
 * Permissions Service — read-only listing for role management forms.
 *
 * Backend only exposes:
 *   GET /admin/v1/permissions → permissions.index
 *
 * Use the list() method to fetch all available permissions
 * grouped by module for the role permissions matrix UI.
 */
const baseService = createService<Permission>(PERMISSIONS_ENDPOINT)

export const permissionsService = {
  /** Fetch all permissions (unpaginated for use in forms) */
  async list(params: Parameters<typeof baseService.list>[0] = {}) {
    return baseService.list({
      ...params,
      paginate: false,
      scope: 'mini',
    })
  },
}

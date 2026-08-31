import type { Permission } from '@/types/entities/permission'
import type { ApiSuccessResponse } from '@/types/services/api'
import api from './api'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Permissions Service — aligned with Aeroenix backend PermissionController.
 *
 * Backend: app/Http/Controllers/V1/Platform/PermissionController.php
 * Routes:
 *   GET /platform/permissions → list all permissions (read-only)
 *
 * Response: { success, data: { permissions: [{ id, action }] } }
 * ──────────────────────────────────────────────────────────────────────────────
 */

const ENDPOINT = '/platform/permissions'

export const permissionsService = {
  /**
   * GET /platform/permissions — fetch all available permissions.
   *
   * Used in role management forms to display the full permission grid.
   */
  async list(): Promise<Permission[]> {
    const response = await api.get<ApiSuccessResponse<any>>(ENDPOINT)
    const data = response.data.data || {}

    // Backend may wrap under `permissions` key or return directly as array
    if (Array.isArray(data)) {
      return data
    }
    if (data.permissions && Array.isArray(data.permissions)) {
      return data.permissions
    }

    return []
  },
}

import type { Role, RolesPermissionsMatrix } from '@/types/entities/role'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import { rolesService } from '@/services/rolesService'

/**
 * Roles composable — aligned with Aeroenix backend RoleController.
 *
 * The backend uses a matrix API (GET /platform/roles-permissions)
 * that returns all roles + all permission modules in a single call.
 * This composable provides access to that matrix data.
 *
 * Operations:
 * - getMatrix: fetch the full roles-permissions grid
 * - createRole: create a new custom role
 * - updatePermissions: update permissions for an existing role
 */
export function useRoles(hotelId?: number) {
  const queryClient = useQueryClient()

  const { data: matrixData, isLoading, error, refetch } = useQuery<RolesPermissionsMatrix>({
    queryKey: ['roles-permissions', hotelId],
    queryFn: () => rolesService.getMatrix(hotelId),
  })

  /** All roles from the matrix */
  const roles = computed<Role[]>(() => matrixData.value?.roles || [])

  /** All permission modules from the matrix */
  const modules = computed(() => matrixData.value?.modules || [])

  /** Create a new custom role */
  const isCreating = ref(false)
  async function createRole(data: { name: string; description?: string; permissions?: string[] }) {
    isCreating.value = true
    try {
      const role = await rolesService.create({
        name: data.name,
        description: data.description,
        hotel_id: hotelId || null,
        permissions: data.permissions,
      })
      queryClient.invalidateQueries({ queryKey: ['roles-permissions'] })
      return role
    }
    finally {
      isCreating.value = false
    }
  }

  /** Update permissions for a role */
  async function updatePermissions(roleId: number, permissions: string[]) {
    await rolesService.updatePermissions(roleId, {
      permissions,
      hotel_id: hotelId,
    })
    queryClient.invalidateQueries({ queryKey: ['roles-permissions'] })
  }

  return {
    // Data
    roles,
    modules,
    matrixData,
    isLoading,
    error,

    // Actions
    createRole,
    updatePermissions,
    isCreating,
    refetch,
  }
}

import type { Role } from '@/types/entities/role'
import { useI18n } from 'vue-i18n'
import { useColumnVisibility } from '@/composables/shared/useColumnVisibility'
import { useConfirm } from '@/composables/shared/useConfirm'
import { defineFilters } from '@/composables/shared/useFilters'
import { useTable } from '@/composables/shared/useTable'
import { rolesService } from '@/services/rolesService'

/**
 * Roles composable — aligned with backend RolesController.
 *
 * Provides:
 * - Table with listing
 * - Delete with confirmation
 * - Toggle status (PATCH /{role}/toggle)
 * - Column visibility
 */
export function useRoles() {
  const { t } = useI18n()

  const filterConfig = defineFilters('roles', [])

  const table = useTable<Role>({
    resourceName: 'roles',
    fetchFn: async (params: any) => {
      const res = await rolesService.list(params)
      return { data: res.data, total: res.meta?.total ?? 0 }
    },
    filterConfig,
    defaultStatus: 'all',
  })

  const { confirmState, confirm, cancel: cancelConfirm } = useConfirm()

  function deleteItem(role: Role) {
    if (!role.can_delete) {
      return
    }
    confirm(
      t('common.confirm_action', 'Confirm Action'),
      t('roles.delete_confirm', 'Are you sure you want to delete this role?'),
      async () => {
        try {
          await rolesService.delete(role.id)
          table.refresh()
        }
        finally {
          cancelConfirm()
        }
      },
    )
  }

  function toggleStatus(role: Role) {
    confirm(
      t('common.confirm_action', 'Confirm Action'),
      t('roles.toggle_confirm', 'Are you sure you want to toggle this role\'s status?'),
      async () => {
        try {
          await rolesService.toggle(role.id)
          table.refresh()
        }
        finally {
          cancelConfirm()
        }
      },
    )
  }

  const columnVisibility = useColumnVisibility('dt-cols-roles', [
    { key: 'name', label: t('roles.fields.name', 'Name') },
    { key: 'display_name', label: t('roles.fields.display_name', 'Display Name') },
    { key: 'status', label: t('roles.fields.status', 'Status') },
  ])

  return {
    filterConfig,
    table,
    confirmState,
    cancelConfirm,
    deleteItem,
    toggleStatus,
    columnVisibility,
  }
}

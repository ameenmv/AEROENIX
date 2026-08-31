import type { Admin } from '@/types/entities/admin'
import { useI18n } from 'vue-i18n'
import { useColumnVisibility } from '@/composables/shared/useColumnVisibility'
import { useConfirm } from '@/composables/shared/useConfirm'
import { defineFilters } from '@/composables/shared/useFilters'
import { useTable } from '@/composables/shared/useTable'
import { adminsService } from '@/services/adminsService'
import { rolesService } from '@/services/rolesService'

/**
 * Admins composable — aligned with backend AdminsController.
 *
 * Provides:
 * - Table with filters (role dropdown from real API)
 * - Delete with confirmation
 * - Toggle status (maps to PATCH /{admin}/toggle)
 * - Export
 * - Column visibility
 */
export function useAdmins() {
  const { t } = useI18n()

  const filterConfig = defineFilters('admins', [
    {
      key: 'roleId',
      type: 'select',
      optionsLoader: async () => {
        const res = await rolesService.dropdown({ limit: 50 })
        return {
          data: res.data.map((role: { id: number; name: string }) => ({
            value: role.id,
            label: role.name,
          })),
        }
      },
    },
  ])

  const table = useTable<Admin>({
    resourceName: 'admins',
    fetchFn: async (params: any) => {
      const res = await adminsService.list(params)
      return { data: res.data, total: res.meta?.total ?? 0 }
    },
    filterConfig,
    defaultStatus: 'all',
  })

  const { confirmState, confirm, cancel: cancelConfirm } = useConfirm()

  function deleteItem(admin: Admin) {
    confirm(
      t('common.confirm_action', 'Confirm Action'),
      t('admins.delete_confirm', 'Are you sure you want to delete this admin?'),
      async () => {
        try {
          await adminsService.delete(admin.id)
          table.refresh()
        }
        finally {
          cancelConfirm()
        }
      },
    )
  }

  function toggleStatus(admin: Admin) {
    confirm(
      t('common.confirm_action', 'Confirm Action'),
      t('admins.toggle_confirm', 'Are you sure you want to toggle this admin\'s status?'),
      async () => {
        try {
          await adminsService.toggle(admin.id)
          table.refresh()
        }
        finally {
          cancelConfirm()
        }
      },
    )
  }

  async function handleExport() {
    try {
      const res = await adminsService.export({
        ...table.activeFilters.value,
        search: table.searchQuery.value,
      })
      if (res?.download_url) {
        window.open(res.download_url, '_blank', 'noopener,noreferrer')
      }
    }
    catch (e) {
      console.error('Failed to export admins:', e)
    }
  }

  const columnVisibility = useColumnVisibility('dt-cols-admins', [
    { key: 'user', label: t('admins.fields.user', 'Admin') },
    { key: 'email', label: t('admins.fields.email', 'Email') },
    { key: 'role', label: t('admins.fields.role', 'Role') },
    { key: 'status', label: t('admins.fields.status', 'Status') },
  ])

  return {
    filterConfig,
    table,
    confirmState,
    cancelConfirm,
    deleteItem,
    toggleStatus,
    handleExport,
    columnVisibility,
  }
}

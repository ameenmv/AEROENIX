import type { ManualNotification } from '@/types/entities/notification'
import { useI18n } from 'vue-i18n'
import { useColumnVisibility } from '@/composables/shared/useColumnVisibility'
import { useConfirm } from '@/composables/shared/useConfirm'
import { defineFilters } from '@/composables/shared/useFilters'
import { useTable } from '@/composables/shared/useTable'
import { notificationsService } from '@/services/notificationsService'

/**
 * Notifications composable — aligned with backend ManualNotificationsController.
 *
 * Provides:
 * - Table with listing
 * - Delete with confirmation
 * - Send now (POST /{id}/send-now)
 * - Resend failed (POST /{id}/resend-failed)
 * - Column visibility
 */
export function useNotifications() {
  const { t } = useI18n()

  const filterConfig = defineFilters('notifications', [])

  const table = useTable<ManualNotification>({
    resourceName: 'notifications',
    fetchFn: async (params: any) => {
      const res = await notificationsService.list(params)
      return { data: res.data, total: res.meta?.total ?? 0 }
    },
    filterConfig,
    defaultStatus: 'all',
  })

  const { confirmState, confirm, cancel: cancelConfirm } = useConfirm()

  function deleteItem(notification: ManualNotification) {
    confirm(
      t('common.confirm_action', 'Confirm Action'),
      t('notifications.delete_confirm', 'Are you sure you want to delete this notification?'),
      async () => {
        try {
          await notificationsService.delete(notification.id)
          table.refresh()
        }
        finally {
          cancelConfirm()
        }
      },
    )
  }

  function sendNow(notification: ManualNotification) {
    confirm(
      t('common.confirm_action', 'Confirm Action'),
      t('notifications.send_now_confirm', 'Are you sure you want to send this notification now?'),
      async () => {
        try {
          await notificationsService.sendNow(notification.id)
          table.refresh()
        }
        finally {
          cancelConfirm()
        }
      },
    )
  }

  function resendFailed(notification: ManualNotification) {
    confirm(
      t('common.confirm_action', 'Confirm Action'),
      t('notifications.resend_failed_confirm', 'Are you sure you want to resend to failed recipients?'),
      async () => {
        try {
          await notificationsService.resendFailed(notification.id)
          table.refresh()
        }
        finally {
          cancelConfirm()
        }
      },
    )
  }

  const columnVisibility = useColumnVisibility('dt-cols-notifications', [
    { key: 'title', label: t('notifications.fields.title', 'Title') },
    { key: 'status', label: t('notifications.fields.status', 'Status') },
    { key: 'type', label: t('notifications.fields.type', 'Type') },
    { key: 'send_at', label: t('notifications.fields.send_at', 'Send At') },
  ])

  return {
    filterConfig,
    table,
    confirmState,
    cancelConfirm,
    deleteItem,
    sendNow,
    resendFailed,
    columnVisibility,
  }
}

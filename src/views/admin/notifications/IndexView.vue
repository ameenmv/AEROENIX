<script setup lang="ts">
import type { ManualNotification } from '@/types/entities/notification'
import { PlusSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import ConfirmModal from '@/components/ui/modals/ConfirmModal.vue'
import { DataTable, DataTableFilters } from '@/components/ui/tables'
import { TableCell, TableHead, TableRow } from '@/components/uic/table'
import { useNotifications } from '@/composables'
import { NotificationStatusColor, NotificationStatusLabel } from '@/enums'

const { t } = useI18n()
const router = useRouter()

const {
  filterConfig,
  table,
  confirmState,
  cancelConfirm,
  deleteItem,
  sendNow,
} = useNotifications()

const statusColorClass: Record<string, string> = {
  gray: 'bg-gray-500/10 text-gray-400',
  yellow: 'bg-amber-500/10 text-amber-500',
  green: 'bg-emerald-500/10 text-emerald-500',
  red: 'bg-red-500/10 text-red-400',
}

const statusDotClass: Record<string, string> = {
  gray: 'bg-gray-400',
  yellow: 'bg-amber-500',
  green: 'bg-emerald-500',
  red: 'bg-red-400',
}

/** Type-safe row accessor */
function n(row: any): ManualNotification {
  return row as ManualNotification
}
</script>

<template>
  <ModularView>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">
            {{ t('notifications.title', 'Notifications') }}
          </h1>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ t('notifications.subtitle', 'Manage manual notifications') }}
          </p>
        </div>
        <Button @click="router.push({ name: 'admin-notifications-create' })">
          <HugeiconsIcon :icon="PlusSignIcon" :size="20" class="mr-2" />
          {{ t('actions.add') }}
        </Button>
      </div>

      <DataTableFilters
        :fields="filterConfig.fields"
        :filters="table.activeFilters.value"
        @update:filters="table.setFilters"
      />

      <DataTable
        :data="(table.items.value as any)"
        :loading="table.loading.value"
        :total-items="table.totalItems.value"
        :page="table.page.value"
        :per-page="table.perPage.value"
        server-side
        searchable
        @update:page="table.goToPage"
        @update:per-page="table.setPerPage"
        @update:search="table.setSearchQuery"
        @sort="table.setSorting"
      >
        <template #header>
          <TableRow>
            <TableHead>{{ t('notifications.fields.title', 'Title') }}</TableHead>
            <TableHead>{{ t('notifications.fields.status', 'Status') }}</TableHead>
            <TableHead>{{ t('notifications.fields.type', 'Type') }}</TableHead>
            <TableHead>{{ t('notifications.fields.send_at', 'Send At') }}</TableHead>
            <TableHead>{{ t('notifications.fields.created_at', 'Created At') }}</TableHead>
            <TableHead class="text-right">
              {{ t('common.actions', 'Actions') }}
            </TableHead>
          </TableRow>
        </template>

        <template #row="{ row }">
          <TableRow class="hover:bg-muted/50 transition-colors">
            <!-- Title -->
            <TableCell>
              <span class="font-medium">
                {{ n(row).title?.en || '—' }}
              </span>
            </TableCell>

            <!-- Status badge -->
            <TableCell>
              <span
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="statusColorClass[NotificationStatusColor[n(row).status] || 'gray']"
              >
                <span
                  class="h-1.5 w-1.5 rounded-full"
                  :class="statusDotClass[NotificationStatusColor[n(row).status] || 'gray']"
                />
                {{ NotificationStatusLabel[n(row).status] || 'Unknown' }}
              </span>
            </TableCell>

            <!-- Type -->
            <TableCell>
              <span class="text-sm">
                {{ n(row).type }}
              </span>
            </TableCell>

            <!-- Send At -->
            <TableCell>
              <span class="text-xs text-muted-foreground">
                {{ n(row).send_at
                  ? new Date(n(row).send_at!).toLocaleString()
                  : t('common.not_scheduled', '—') }}
              </span>
            </TableCell>

            <!-- Created at -->
            <TableCell>
              <span class="text-xs text-muted-foreground">
                {{ new Date(n(row).created_at).toLocaleDateString() }}
              </span>
            </TableCell>

            <!-- Actions -->
            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="router.push({ name: 'admin-notifications-show', params: { id: String(n(row).id) } })"
                >
                  {{ t('actions.view', 'View') }}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="router.push({ name: 'admin-notifications-edit', params: { id: String(n(row).id) } })"
                >
                  {{ t('actions.edit', 'Edit') }}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  class="text-primary"
                  @click="sendNow(n(row))"
                >
                  {{ t('notifications.actions.send_now', 'Send') }}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  class="text-destructive hover:text-destructive"
                  @click="deleteItem(n(row))"
                >
                  {{ t('actions.delete', 'Delete') }}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </template>
      </DataTable>

      <ConfirmModal
        :show="confirmState.show"
        :title="confirmState.title"
        :message="confirmState.message"
        @confirm="confirmState.callback?.()"
        @cancel="cancelConfirm"
      />
    </div>
  </ModularView>
</template>

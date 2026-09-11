<script setup lang="ts">
import type { ManualNotification } from '@/types/entities/notification'
import { PlusSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import ConfirmModal from '@/components/ui/modals/ConfirmModal.vue'
import { DataTable, DataTableFilters } from '@/components/ui/tables'

import { useNotifications } from '@/composables'
import { NotificationStatusColor, NotificationStatusLabel } from '@/enums'

const { t } = useI18n()
const router = useRouter()

const { filterConfig, table, confirmState, cancelConfirm, deleteItem, sendNow } = useNotifications()

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
const columns = [
  { key: 'title', label: 'notifications.fields.title' },
  { key: 'status', label: 'notifications.fields.status' },
  { key: 'type', label: 'notifications.fields.type' },
  { key: 'send_at', label: 'notifications.fields.send_at' },
  { key: 'created_at', label: 'notifications.fields.created_at' },
]

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
        :data="table.items.value as any"
        :columns="columns"
        :loading="table.loading.value"
        :total-items="table.totalItems.value"
        :page="table.page.value"
        :per-page="table.perPage.value"
        server-side
        searchable
        modern-search
        transparent-container
        separated-records
        @update:page="table.goToPage"
        @update:per-page="table.setPerPage"
        @update:search="table.setSearchQuery"
        @sort="table.setSorting"
      >
        <template #title="{ row }">
          <span class="font-medium">
            {{ n(row).title?.en || '—' }}
          </span>
        </template>
        <template #status="{ row }">
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
        </template>
        <template #type="{ row }">
          <span class="text-sm">
            {{ n(row).type }}
          </span>
        </template>
        <template #send_at="{ row }">
          <span class="text-xs text-muted-foreground">
            {{
              n(row).send_at
                ? new Date(n(row).send_at!).toLocaleString()
                : t('common.not_scheduled', '—')
            }}
          </span>
        </template>
        <template #created_at="{ row }">
          <span class="text-xs text-muted-foreground">
            {{ new Date(n(row).created_at).toLocaleDateString() }}
          </span>
        </template>
        <template #actions="{ row }">
          <div class="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" @click="router.push({ name: 'admin-notifications-show', params: { id: String(n(row).id) } })">
              {{ t('actions.view', 'View') }}
            </Button>
            <Button variant="ghost" size="sm" @click="router.push({ name: 'admin-notifications-edit', params: { id: String(n(row).id) } })">
              {{ t('actions.edit', 'Edit') }}
            </Button>
            <Button variant="ghost" size="sm" class="text-primary" @click="sendNow(n(row))">
              {{ t('notifications.actions.send_now', 'Send') }}
            </Button>
            <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive" @click="deleteItem(n(row))">
              {{ t('actions.delete', 'Delete') }}
            </Button>
          </div>
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

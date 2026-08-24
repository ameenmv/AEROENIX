<script setup lang="ts">
import type { Role } from '@/types/entities/role'
import { PlusSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import ConfirmModal from '@/components/ui/modals/ConfirmModal.vue'
import { DataTable, DataTableFilters } from '@/components/ui/tables'
import { TableCell, TableHead, TableRow } from '@/components/uic/table'
import { useRoles } from '@/composables'

const { t } = useI18n()
const router = useRouter()

const {
  filterConfig,
  table,
  confirmState,
  cancelConfirm,
  deleteItem,
  toggleStatus,
} = useRoles()

/** Type-safe row accessor */
function r(row: any): Role {
  return row as Role
}
</script>

<template>
  <ModularView>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">
            {{ t('roles.title', 'Roles') }}
          </h1>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ t('roles.subtitle', 'Manage roles and permissions') }}
          </p>
        </div>
        <Button @click="router.push({ name: 'admin-roles-create' })">
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
            <TableHead>{{ t('roles.fields.name', 'Name') }}</TableHead>
            <TableHead>{{ t('roles.fields.display_name', 'Display Name') }}</TableHead>
            <TableHead>{{ t('roles.fields.guard', 'Guard') }}</TableHead>
            <TableHead>{{ t('roles.fields.status', 'Status') }}</TableHead>
            <TableHead>{{ t('roles.fields.created_at', 'Created At') }}</TableHead>
            <TableHead class="text-right">
              {{ t('common.actions', 'Actions') }}
            </TableHead>
          </TableRow>
        </template>

        <template #row="{ row }">
          <TableRow class="hover:bg-muted/50 transition-colors">
            <!-- Name -->
            <TableCell>
              <span class="font-medium">{{ r(row).name }}</span>
            </TableCell>

            <!-- Display Name (translatable) -->
            <TableCell>
              <span>{{ r(row).display_name?.en || r(row).name }}</span>
            </TableCell>

            <!-- Guard -->
            <TableCell>
              <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-500">
                {{ r(row).guard_name }}
              </span>
            </TableCell>

            <!-- Status badge -->
            <TableCell>
              <button
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer transition-opacity hover:opacity-80"
                :class="r(row).status?.color === 'green' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-400'"
                @click="toggleStatus(r(row))"
              >
                <span
                  class="h-1.5 w-1.5 rounded-full"
                  :class="r(row).status?.color === 'green' ? 'bg-emerald-500' : 'bg-gray-400'"
                />
                {{ r(row).status?.badge || r(row).status_label }}
              </button>
            </TableCell>

            <!-- Created at -->
            <TableCell>
              <span class="text-xs text-muted-foreground">
                {{ new Date(r(row).created_at).toLocaleDateString() }}
              </span>
            </TableCell>

            <!-- Actions -->
            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="router.push({ name: 'admin-roles-show', params: { id: String(r(row).id) } })"
                >
                  {{ t('actions.view', 'View') }}
                </Button>
                <Button
                  v-if="r(row).can_update"
                  variant="ghost"
                  size="sm"
                  @click="router.push({ name: 'admin-roles-edit', params: { id: String(r(row).id) } })"
                >
                  {{ t('actions.edit', 'Edit') }}
                </Button>
                <Button
                  v-if="r(row).can_delete"
                  variant="ghost"
                  size="sm"
                  class="text-destructive hover:text-destructive"
                  @click="deleteItem(r(row))"
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

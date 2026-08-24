<script setup lang="ts">
import type { Admin } from '@/types/entities/admin'
import { PlusSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import ConfirmModal from '@/components/ui/modals/ConfirmModal.vue'
import { DataTable, DataTableFilters } from '@/components/ui/tables'
import { TableCell, TableHead, TableRow } from '@/components/uic/table'
import { useAdmins } from '@/composables'

const { t } = useI18n()
const router = useRouter()

const { filterConfig, table, confirmState, cancelConfirm, deleteItem, toggleStatus } = useAdmins()

/** Type-safe row accessor */
function a(row: any): Admin {
  return row as Admin
}
</script>

<template>
  <ModularView>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">
            {{ t('admins.title', 'Admins') }}
          </h1>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ t('admins.subtitle', 'Manage admin accounts') }}
          </p>
        </div>
        <Button @click="router.push({ name: 'admin-admins-create' })">
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
            <TableHead>{{ t('admins.fields.name', 'Name') }}</TableHead>
            <TableHead>{{ t('admins.fields.email', 'Email') }}</TableHead>
            <TableHead>{{ t('admins.fields.role', 'Role') }}</TableHead>
            <TableHead>{{ t('admins.fields.status', 'Status') }}</TableHead>
            <TableHead>{{ t('admins.fields.created_at', 'Created At') }}</TableHead>
            <TableHead class="text-right">
              {{ t('common.actions', 'Actions') }}
            </TableHead>
          </TableRow>
        </template>

        <template #row="{ row }">
          <TableRow class="hover:bg-muted/50 transition-colors">
            <!-- Name -->
            <TableCell>
              <span class="font-medium">{{ a(row).name }}</span>
            </TableCell>

            <!-- Email -->
            <TableCell>{{ a(row).email }}</TableCell>

            <!-- Role badges -->
            <TableCell>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="role in a(row).roles || []"
                  :key="role.id"
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-purple-500/10 text-purple-500"
                >
                  {{ role.display_name?.en || role.name }}
                </span>
              </div>
            </TableCell>

            <!-- Status badge (clickable to toggle) -->
            <TableCell>
              <button
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer transition-opacity hover:opacity-80"
                :class="
                  a(row).status?.color === 'green'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : a(row).status?.color === 'red'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-gray-500/10 text-gray-400'
                "
                @click="toggleStatus(a(row))"
              >
                <span
                  class="h-1.5 w-1.5 rounded-full"
                  :class="
                    a(row).status?.color === 'green'
                      ? 'bg-emerald-500'
                      : a(row).status?.color === 'red'
                        ? 'bg-red-400'
                        : 'bg-gray-400'
                  "
                />
                {{ a(row).status?.badge || a(row).status_label }}
              </button>
            </TableCell>

            <!-- Created at -->
            <TableCell>
              <span class="text-xs text-muted-foreground">
                {{ new Date(a(row).created_at).toLocaleDateString() }}
              </span>
            </TableCell>

            <!-- Actions -->
            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="
                    router.push({ name: 'admin-admins-show', params: { id: String(a(row).id) } })
                  "
                >
                  {{ t('actions.view', 'View') }}
                </Button>
                <Button
                  v-if="a(row).can_update"
                  variant="ghost"
                  size="sm"
                  @click="
                    router.push({ name: 'admin-admins-edit', params: { id: String(a(row).id) } })
                  "
                >
                  {{ t('actions.edit', 'Edit') }}
                </Button>
                <Button
                  v-if="a(row).can_delete"
                  variant="ghost"
                  size="sm"
                  class="text-destructive hover:text-destructive"
                  @click="deleteItem(a(row))"
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

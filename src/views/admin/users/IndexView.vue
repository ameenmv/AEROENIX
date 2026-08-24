<script setup lang="ts">
import type { User } from '@/types/entities/users'
import { PlusSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import ConfirmModal from '@/components/ui/modals/ConfirmModal.vue'
import { DataTable, DataTableFilters } from '@/components/ui/tables'
import { TableCell, TableHead, TableRow } from '@/components/uic/table'
import { useConfirm } from '@/composables/shared/useConfirm'
import { defineFilters } from '@/composables/shared/useFilters'
import { useTable } from '@/composables/shared/useTable'
import { usersService } from '@/services/usersService'

const { t } = useI18n()
const router = useRouter()
const queryClient = useQueryClient()
const { confirmState, confirm, cancel } = useConfirm()

const filterConfig = defineFilters('users', [
  { key: 'created_at', type: 'dateRange' },
])

const table = useTable<User>({
  resourceName: 'users',
  fetchFn: async (params: any) => {
    const result = await usersService.list(params)
    return { data: result.data, total: result.meta?.total ?? 0 }
  },
  filterConfig,
})

const deleteMutation = useMutation({
  mutationFn: (id: string | number) => usersService.delete(id),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
})

function handleDelete(id: string | number) {
  confirm(t('common.confirm_delete', 'Confirm Delete'), t('common.confirm_delete_message', 'Are you sure you want to delete this item?'), () => {
    deleteMutation.mutate(id, {
      onSettled: () => cancel(),
    })
  })
}

/** Type-safe row accessor */
function u(row: any): User {
  return row as User
}
</script>

<template>
  <ModularView>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">
            {{ t('users.title', 'Users') }}
          </h1>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ t('users.subtitle', 'Manage platform users') }}
          </p>
        </div>
        <Button @click="router.push({ name: 'admin-users-create' })">
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
            <TableHead>{{ t('users.fields.name', 'Name') }}</TableHead>
            <TableHead>{{ t('users.fields.email', 'Email') }}</TableHead>
            <TableHead>{{ t('users.fields.verified', 'Verified') }}</TableHead>
            <TableHead>{{ t('users.fields.created_at', 'Created At') }}</TableHead>
            <TableHead class="text-right">
              {{ t('common.actions', 'Actions') }}
            </TableHead>
          </TableRow>
        </template>

        <template #row="{ row }">
          <TableRow class="hover:bg-muted/50 transition-colors">
            <!-- Name -->
            <TableCell>
              <span class="font-medium">{{ u(row).name }}</span>
            </TableCell>

            <!-- Email -->
            <TableCell>{{ u(row).email }}</TableCell>

            <!-- Verified badge -->
            <TableCell>
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                :class="u(row).email_verified_at ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'"
              >
                {{ u(row).email_verified_at ? t('common.check_mark', '✓') : t('common.cross_mark', '✗') }}
              </span>
            </TableCell>

            <!-- Created at -->
            <TableCell>
              <span class="text-xs text-muted-foreground">
                {{ new Date(u(row).created_at).toLocaleDateString() }}
              </span>
            </TableCell>

            <!-- Actions -->
            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="router.push({ name: 'admin-users-show', params: { id: String(u(row).id) } })"
                >
                  {{ t('actions.view', 'View') }}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="router.push({ name: 'admin-users-edit', params: { id: String(u(row).id) } })"
                >
                  {{ t('actions.edit', 'Edit') }}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  class="text-destructive hover:text-destructive"
                  @click="handleDelete(u(row).id)"
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
        @cancel="cancel"
      />
    </div>
  </ModularView>
</template>

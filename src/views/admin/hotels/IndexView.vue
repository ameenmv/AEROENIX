<script setup lang="ts">
import type { Hotel } from '@/types/hotel'
import { Delete02Icon, Edit02Icon, MoreVerticalIcon, PlusSignIcon, ViewIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import ConfirmModal from '@/components/ui/modals/ConfirmModal.vue'
import { DataTable } from '@/components/ui/tables'
import { Button } from '@/components/uic/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/uic/dropdown-menu'
import { TableCell, TableHead, TableRow } from '@/components/uic/table'
import { useConfirm } from '@/composables/shared/useConfirm'
import { useTable } from '@/composables/shared/useTable'
import { hotelsService } from '@/services/hotelsService'

const { t } = useI18n()
const router = useRouter()
const queryClient = useQueryClient()
const { confirmState, confirm, cancel } = useConfirm()

const table = useTable<Hotel>({
  resourceName: 'hotels',
  fetchFn: async (params: any) => {
    try {
      const result = await hotelsService.list({
        page: params.page,
        limit: params.limit || params.perPage,
        search: params.search,
      })
      return { data: result.data, total: result.pagination.total }
    }
    catch {
      return { data: [], total: 0 }
    }
  },
})

/** Type-safe row accessor */
function h(row: any): Hotel {
  return row as Hotel
}

const deleteMutation = useMutation({
  mutationFn: (id: string | number) => hotelsService.delete(id),
  onSuccess: (message) => {
    toast.success(message)
    queryClient.invalidateQueries({ queryKey: ['hotels'] })
  },
})

function handleDelete(hotel: Hotel) {
  confirm(
    t('common.confirm_delete_title', 'Delete confirmation'),
    t('common.confirm_delete_message', { name: hotel.name }),
    () => {
      deleteMutation.mutate(hotel.id, {
        onSettled: () => cancel(),
      })
    },
    'destructive',
  )
}
</script>

<template>
  <ModularView>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">
            {{ t('hotels.title') }}
          </h1>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ t('hotels.subtitle') }}
          </p>
        </div>
        <Button @click="router.push({ name: 'admin-hotels-create' })">
          <HugeiconsIcon :icon="PlusSignIcon" :size="20" class="mr-2" />
          {{ t('actions.add') }}
        </Button>
      </div>

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
          <TableRow class="border-none hover:bg-transparent bg-muted/30">
            <TableHead class="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('hotels.fields.name') }}</TableHead>
            <TableHead class="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('hotels.fields.address') }}</TableHead>
            <TableHead class="px-4 py-3 text-center text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('hotels.fields.staff_count') }}</TableHead>
            <TableHead class="px-4 py-3 text-center text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('hotels.fields.status') }}</TableHead>
            <TableHead class="px-4 py-3 text-right text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('actions.title', 'Actions') }}</TableHead>
          </TableRow>
        </template>

        <template #row="{ row }">
          <TableRow
            class="bg-card border-none hover:bg-muted/50 transition-colors cursor-pointer"
            @click="router.push({ name: 'admin-hotels-show', params: { id: h(row).id } })"
          >
            <TableCell class="px-4 py-4 text-left first:rounded-l-lg last:rounded-r-lg">
              <span class="font-medium text-foreground">{{ h(row).name }}</span>
            </TableCell>
            <TableCell class="px-4 py-4 text-left first:rounded-l-lg last:rounded-r-lg">
              <span class="text-muted-foreground text-sm">{{ h(row).address || '—' }}</span>
            </TableCell>
            <TableCell class="px-4 py-4 text-center first:rounded-l-lg last:rounded-r-lg">
              <span class="text-sm tabular-nums">{{ h(row).staff_count ?? 0 }}</span>
            </TableCell>
            <TableCell class="px-4 py-4 text-center first:rounded-l-lg last:rounded-r-lg">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize"
                :class="h(row).status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-amber-500/10 text-amber-500'"
              >
                {{ h(row).status }}
              </span>
            </TableCell>
            <TableCell class="px-4 py-4 text-right first:rounded-l-lg last:rounded-r-lg" @click.stop>
              <div class="flex items-center justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button size="sm" variant="ghost" class="h-8 w-8 p-0">
                      <HugeiconsIcon :icon="MoreVerticalIcon" :size="16" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-40">
                    <DropdownMenuItem @click="router.push({ name: 'admin-hotels-show', params: { id: h(row).id } })">
                      <HugeiconsIcon :icon="ViewIcon" :size="14" class="mr-2 text-muted-foreground" />
                      {{ t('actions.view', 'View') }}
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="router.push({ name: 'admin-hotels-edit', params: { id: h(row).id } })">
                      <HugeiconsIcon :icon="Edit02Icon" :size="14" class="mr-2 text-muted-foreground" />
                      {{ t('actions.edit', 'Edit') }}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem class="text-red-500 focus:text-red-500" @click="handleDelete(h(row))">
                      <HugeiconsIcon :icon="Delete02Icon" :size="14" class="mr-2" />
                      {{ t('actions.delete', 'Delete') }}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        </template>
      </DataTable>

      <ConfirmModal
        :show="confirmState.show"
        :title="confirmState.title"
        :message="confirmState.message"
        :variant="confirmState.variant"
        @confirm="confirmState.callback?.()"
        @cancel="cancel"
      />
    </div>
  </ModularView>
</template>

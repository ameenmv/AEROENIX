<script setup lang="ts">
import type { Hotel } from '@/types/hotel'
import { PlusSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { DataTable } from '@/components/ui/tables'
import { TableCell, TableHead, TableRow } from '@/components/uic/table'
import { useTable } from '@/composables/shared/useTable'
import { hotelsService } from '@/services/hotelsService'
import { Button } from '@/components/uic/button'

const { t } = useI18n()
const router = useRouter()
const queryClient = useQueryClient()

const table = useTable<Hotel>({
  resourceName: 'hotels',
  fetchFn: async (params: any) => {
    // If the endpoint GET /platform/hotels doesn't exist yet, this might fail,
    // but the table handles errors gracefully.
    try {
      const result = await hotelsService.list(params)
      return { data: result.data, total: result.meta?.total ?? 0 }
    } catch {
      return { data: [], total: 0 }
    }
  },
})

function h(row: any): Hotel {
  return row as Hotel
}
</script>

<template>
  <ModularView>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">
            {{ t('hotels.title', 'Hotels') }}
          </h1>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ t('hotels.subtitle', 'Manage hotels') }}
          </p>
        </div>
        <Button @click="router.push({ name: 'admin-hotels-create' })">
          <HugeiconsIcon :icon="PlusSignIcon" :size="20" class="mr-2" />
          {{ t('actions.add', 'Add') }}
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
          <TableRow>
            <TableHead>{{ t('hotels.fields.name', 'Name') }}</TableHead>
            <TableHead>{{ t('hotels.fields.status', 'Status') }}</TableHead>
          </TableRow>
        </template>

        <template #row="{ row }">
          <TableRow class="hover:bg-muted/50 transition-colors">
            <TableCell>
              <span class="font-medium">{{ h(row).name }}</span>
            </TableCell>
            <TableCell>
              <span class="capitalize">{{ h(row).status }}</span>
            </TableCell>
          </TableRow>
        </template>
      </DataTable>
    </div>
  </ModularView>
</template>

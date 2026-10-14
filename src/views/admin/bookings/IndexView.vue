<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Calendar01Icon,
  EyeIcon,
  MoreVerticalIcon,
  NoteIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

import { bookingsService } from '@/services/bookingsService'

import { useTable } from '@/composables/shared/useTable'

import { Button } from '@/components/uic/button'
import { DataTable } from '@/components/ui/tables'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/uic/dropdown-menu'

const { t } = useI18n()
  
const columns = [
  { key: 'booking_reference', label: 'bookings.reference', className: 'font-semibold' },
  { key: 'guest', label: 'bookings.guest', className: 'font-semibold' },
  { key: 'hotel', label: 'bookings.hotel', className: 'font-semibold' },
  { key: 'dates', label: 'bookings.dates', className: 'font-semibold' },
  { key: 'total', label: 'bookings.total', className: 'font-semibold text-right' },
  { key: 'status', label: 'bookings.status', className: 'font-semibold text-center' },
]
const router = useRouter()

const statusFilter = ref<string | null>(null)

const table = useTable({
  resourceName: 'bookings',
  fetchFn: async (params: any) => {
    try {
      const result = await bookingsService.list({
        page: params.page,
        limit: params.limit || params.perPage,
        search: params.search,
        status: statusFilter.value || undefined,
      })
      return { data: result.data, total: result.pagination.total }
    }
    catch {
      return { data: [], total: 0 }
    }
  },
  defaultPerPage: 10,
  watchKeys: [statusFilter],
})

// Reset page to 1 when status filter changes
watch(statusFilter, () => {
  table.goToPage(1)
})

const getStatusColor = (status: string) => {
  if (status === 'confirmed') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  if (status === 'rejected') return 'bg-red-500/10 text-red-500 border-red-500/20'
  return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">{{ t('bookings.title', 'Bookings') }}</h1>
        <p class="text-sm text-muted-foreground mt-1">
          {{ t('bookings.subtitle', 'Manage all hotel bookings and reservations.') }}
        </p>
      </div>
    </div>

    <!-- Data Table with built-in search + pagination -->
    <div class="mt-4">
      <DataTable
        :data="table.items.value as any[]"
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
        :filter-config="{
          resource: 'bookings',
          fields: [
            {
              key: 'status',
              label: 'bookings.status',
              type: 'select',
              options: [
                { value: 'pending', label: 'bookings.pending' },
                { value: 'confirmed', label: 'bookings.confirmed' },
                { value: 'rejected', label: 'bookings.rejected' },
              ],
            },
          ],
        }"
        @update:page="table.goToPage"
        @update:per-page="table.setPerPage"
        @update:search="table.setSearchQuery"
        @update:filters="(f: any) => { statusFilter = f.status || null }"
        @sort="table.setSorting"
      >
        <template #booking_reference="{ row, value }">
          <div class="cursor-pointer" @click="router.push({ name: 'admin-bookings-show', params: { id: (row as any).id } })">
            <span class="font-medium text-primary">{{ value }}</span>
          </div>
        </template>
        <template #guest="{ row }">
          <div class="cursor-pointer" @click="router.push({ name: 'admin-bookings-show', params: { id: (row as any).id } })">
            <div class="font-semibold">{{ (row as any).guest.name }}</div>
            <div class="text-xs text-muted-foreground">{{ (row as any).guest.phone || (row as any).guest.email }}</div>
          </div>
        </template>
        <template #hotel="{ row }">
          <div class="cursor-pointer" @click="router.push({ name: 'admin-bookings-show', params: { id: (row as any).id } })">
            <div class="text-sm font-medium">{{ (row as any).hotel_name || t('common.na', 'N/A') }}</div>
            <div class="text-xs text-muted-foreground">{{ (row as any).room.name }} (x{{ (row as any).room.rooms_count }})</div>
          </div>
        </template>
        <template #dates="{ row }">
          <div class="cursor-pointer" @click="router.push({ name: 'admin-bookings-show', params: { id: (row as any).id } })">
            <div class="text-sm flex items-center gap-1.5">
              <HugeiconsIcon :icon="Calendar01Icon" :size="14" class="text-muted-foreground" />
              <span v-if="(row as any).check_in_date && (row as any).check_out_date">
                {{ new Date((row as any).check_in_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }}
                &rarr;
                {{ new Date((row as any).check_out_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }}
              </span>
              <span v-else>—</span>
            </div>
            <div class="text-xs text-muted-foreground mt-0.5">{{ (row as any).nights_count }} {{ t('bookings.nights', 'nights') }}</div>
          </div>
        </template>
        <template #total="{ row }">
          <div class="cursor-pointer w-full text-right font-medium" @click="router.push({ name: 'admin-bookings-show', params: { id: (row as any).id } })">
            {{ (row as any).price }}
          </div>
        </template>
        <template #status="{ row }">
          <div class="cursor-pointer w-full text-center" @click="router.push({ name: 'admin-bookings-show', params: { id: (row as any).id } })">
            <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border', getStatusColor((row as any).status)]">
              {{ (row as any).status_label }}
            </span>
          </div>
        </template>
        <template #actions="{ row }">
          <div class="w-full flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <HugeiconsIcon :icon="MoreVerticalIcon" :size="16" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="router.push({ name: 'admin-bookings-show', params: { id: (row as any).id } })">
                  <HugeiconsIcon :icon="EyeIcon" :size="14" class="mr-2" />
                  {{ t('actions.view', 'View') }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </template>
        <template #empty>
          <div class="flex flex-col items-center justify-center gap-2 py-10">
            <HugeiconsIcon :icon="NoteIcon" :size="32" class="opacity-20" />
            <p class="text-muted-foreground">{{ t('bookings.no_bookings', 'No bookings found.') }}</p>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

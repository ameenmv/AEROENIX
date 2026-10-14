<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Hotel, HotelStats } from '@/types/hotel'
import {
  Building04Icon,
  CheckmarkBadge01Icon,
  AlertCircleIcon,
  BedIcon,
  Delete02Icon,
  Edit02Icon,
  EyeIcon,
  MoreVerticalIcon,
  PlusSignIcon,
  Location01Icon,
  UserGroupIcon,
  SmartPhone01Icon,
  Mail01Icon,
  Door01Icon,
} from '@hugeicons/core-free-icons'
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

import { useConfirm } from '@/composables/shared/useConfirm'
import { useTable } from '@/composables/shared/useTable'
import { hotelsService } from '@/services/hotelsService'

const { t } = useI18n()
const router = useRouter()
const queryClient = useQueryClient()
const { confirmState, confirm, cancel } = useConfirm()

const statusFilter = ref<string | null>(null)

const stats = ref<HotelStats>({
  total: 0,
  active: 0,
  inactive: 0,
  total_rooms: 0,
})

const table = useTable<Hotel>({
  resourceName: 'hotels',
  fetchFn: async (params: any) => {
    try {
      const result = await hotelsService.list({
        page: params.page,
        limit: params.limit || params.perPage,
        search: params.search,
      })
      if (result.stats) {
        stats.value = result.stats
      }
      let items = result.data
      if (statusFilter.value) {
        items = items.filter(h => h.status === statusFilter.value)
      }
      return { data: items, total: statusFilter.value ? items.length : result.pagination.total }
    }
    catch {
      return { data: [], total: 0 }
    }
  },
  watchKeys: [statusFilter],
})

// Fallback counts if backend stats not loaded yet
const computedStats = computed(() => {
  if (stats.value.total > 0) return stats.value
  const items = (table.items.value || []) as Hotel[]
  const total = table.totalItems.value || items.length
  const active = items.filter(h => h.status === 'active').length
  const inactive = items.filter(h => h.status !== 'active').length
  const total_rooms = items.reduce((acc, h) => acc + (h.rooms_count || 0), 0)
  return { total, active, inactive, total_rooms }
})

const columns = [
  { key: 'name', label: 'hotels.fields.name', className: 'font-semibold' },
  { key: 'address', label: 'hotels.fields.address', className: 'font-semibold' },
  { key: 'rooms_count', label: 'hotels.rooms_tab', className: 'font-semibold text-center w-[130px]' },
  { key: 'staff_count', label: 'hotels.fields.staff_count', className: 'font-semibold text-center w-[120px]' },
  { key: 'status', label: 'hotels.fields.status', className: 'font-semibold text-center w-[120px]' },
  { key: 'actions', label: 'common.actions', className: 'w-[80px] text-center' },
]

function selectStatus(status: string | null) {
  statusFilter.value = status
  table.goToPage(1)
}

function getInitials(name?: string): string {
  if (!name) return 'H'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'H'
  const first = parts[0] ?? ''
  if (parts.length === 1) return first.slice(0, 2).toUpperCase()
  const last = parts[parts.length - 1] ?? ''
  const firstChar = first[0] ?? ''
  const lastChar = last[0] ?? ''
  return (firstChar + lastChar).toUpperCase() || 'H'
}

function h(row: any): Hotel {
  return row as Hotel
}

const deleteMutation = useMutation({
  mutationFn: (id: string | number) => hotelsService.delete(id),
  onSuccess: (message) => {
    toast.success(message)
    queryClient.invalidateQueries({ queryKey: ['hotels'] })
    table.refresh()
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
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.12)]">
          <HugeiconsIcon :icon="Building04Icon" :size="22" />
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground">
            {{ t('hotels.title', 'Hotels') }}
          </h1>
          <p class="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {{ t('hotels.subtitle', 'Manage hotels and their settings') }}
          </p>
        </div>
      </div>

      <Button
        class="gap-2 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110"
        @click="router.push({ name: 'admin-hotels-create' })"
      >
        <HugeiconsIcon :icon="PlusSignIcon" :size="18" />
        {{ t('actions.add', 'Add Hotel') }}
      </Button>
    </div>

    <!-- 4 KPI Metrics Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <!-- Total Properties -->
      <div
        class="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-4 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/40 hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)] cursor-pointer"
        :class="{ 'ring-2 ring-blue-500/50 border-blue-500/50': statusFilter === null }"
        @click="selectStatus(null)"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">{{ t('hotels.kpi_total', 'Total Properties') }}</span>
          <div class="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <HugeiconsIcon :icon="Building04Icon" :size="16" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl font-bold tracking-tight text-foreground">{{ computedStats.total }}</span>
        </div>
        <div class="mt-1 text-[11px] text-muted-foreground">
          {{ t('hotels.kpi_total_desc', 'Registered hotel locations') }}
        </div>
      </div>

      <!-- Active Hotels -->
      <div
        class="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-4 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)] cursor-pointer"
        :class="{ 'ring-2 ring-emerald-500/50 border-emerald-500/50': statusFilter === 'active' }"
        @click="selectStatus('active')"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">{{ t('hotels.kpi_active', 'Active Hotels') }}</span>
          <div class="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <HugeiconsIcon :icon="CheckmarkBadge01Icon" :size="16" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl font-bold tracking-tight text-emerald-400">{{ computedStats.active }}</span>
        </div>
        <div class="mt-1 text-[11px] text-muted-foreground">
          {{ t('hotels.kpi_active_desc', 'Operational & accepting guests') }}
        </div>
      </div>

      <!-- Inactive / Setup -->
      <div
        class="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-4 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/40 hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)] cursor-pointer"
        :class="{ 'ring-2 ring-amber-500/50 border-amber-500/50': statusFilter === 'inactive' }"
        @click="selectStatus('inactive')"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">{{ t('hotels.kpi_inactive', 'Inactive') }}</span>
          <div class="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <HugeiconsIcon :icon="AlertCircleIcon" :size="16" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl font-bold tracking-tight text-amber-400">{{ computedStats.inactive }}</span>
        </div>
        <div class="mt-1 text-[11px] text-muted-foreground">
          {{ t('hotels.kpi_inactive_desc', 'Pending or under maintenance') }}
        </div>
      </div>

      <!-- Total Rooms -->
      <div
        class="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-4 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/40 hover:shadow-[0_8px_30px_rgba(168,85,247,0.12)]"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">{{ t('hotels.kpi_rooms', 'Total Rooms') }}</span>
          <div class="h-8 w-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <HugeiconsIcon :icon="BedIcon" :size="16" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl font-bold tracking-tight text-foreground">{{ computedStats.total_rooms }}</span>
          <span class="text-xs text-muted-foreground">{{ t('hotels.rooms_tab', 'Rooms') }}</span>
        </div>
        <div class="mt-1 text-[11px] text-muted-foreground">
          {{ t('hotels.kpi_rooms_desc', 'Across all registered hotels') }}
        </div>
      </div>
    </div>

    <!-- Quick Status Filter Pills -->
    <div class="flex items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/50 w-fit backdrop-blur-md overflow-x-auto max-w-full">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 select-none whitespace-nowrap"
        :class="statusFilter === null
          ? 'bg-background text-foreground shadow-sm border border-border/50 font-semibold'
          : 'text-muted-foreground hover:text-foreground'"
        @click="selectStatus(null)"
      >
        <span>{{ t('hotels.status_all', 'All Hotels') }}</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/80 text-muted-foreground">{{ computedStats.total }}</span>
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 select-none whitespace-nowrap"
        :class="statusFilter === 'active'
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
          : 'text-muted-foreground hover:text-emerald-400'"
        @click="selectStatus('active')"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span>{{ t('hotels.status_active', 'Active') }}</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300">{{ computedStats.active }}</span>
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 select-none whitespace-nowrap"
        :class="statusFilter === 'inactive'
          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
          : 'text-muted-foreground hover:text-amber-400'"
        @click="selectStatus('inactive')"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-amber-400" />
        <span>{{ t('hotels.status_inactive', 'Inactive') }}</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300">{{ computedStats.inactive }}</span>
      </button>
    </div>

    <!-- Data Table -->
    <div class="mt-2">
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
        <!-- Name Column -->
        <template #name="{ row }">
          <div
            class="flex items-center gap-3 cursor-pointer group/hotel py-1"
            @click="router.push({ name: 'admin-hotels-show', params: { id: h(row).id } })"
          >
            <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 transition-transform group-hover/hotel:scale-105 shadow-sm">
              {{ getInitials(h(row).name) }}
            </div>
            <div class="min-w-0">
              <div class="font-semibold text-sm text-foreground group-hover/hotel:text-primary transition-colors truncate">
                {{ h(row).name }}
              </div>
              <div class="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                <span v-if="h(row).country" class="inline-flex items-center px-1.5 py-0.2 rounded bg-muted/60 text-[10.5px] border border-border/40">
                  {{ h(row).country }}
                </span>
                <span v-if="h(row).currency" class="font-mono text-[10.5px] text-muted-foreground font-semibold">
                  {{ h(row).currency }}
                </span>
              </div>
            </div>
          </div>
        </template>

        <!-- Address & Contact Column -->
        <template #address="{ row }">
          <div
            class="cursor-pointer group/addr py-1"
            @click="router.push({ name: 'admin-hotels-show', params: { id: h(row).id } })"
          >
            <div class="text-sm text-foreground flex items-center gap-1.5 group-hover/addr:text-primary transition-colors">
              <HugeiconsIcon :icon="Location01Icon" :size="14" class="text-muted-foreground shrink-0" />
              <span class="truncate max-w-[280px]">{{ h(row).address || '—' }}</span>
            </div>
            <div class="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span v-if="h(row).phone" dir="ltr" class="flex items-center gap-1 font-mono text-[11px]">
                <HugeiconsIcon :icon="SmartPhone01Icon" :size="11" class="text-muted-foreground/70" />
                {{ h(row).phone }}
              </span>
              <span v-if="h(row).email" class="flex items-center gap-1 text-[11px] truncate max-w-[160px]">
                <HugeiconsIcon :icon="Mail01Icon" :size="11" class="text-muted-foreground/70" />
                {{ h(row).email }}
              </span>
            </div>
          </div>
        </template>

        <!-- Rooms Count Column -->
        <template #rooms_count="{ row }">
          <div
            class="cursor-pointer w-full flex justify-center py-1"
            @click="router.push({ name: 'admin-hotels-show', params: { id: h(row).id } })"
          >
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/50 border border-border/50 text-foreground">
              <HugeiconsIcon :icon="BedIcon" :size="13" class="text-primary" />
              <span class="font-semibold">{{ h(row).rooms_count ?? 0 }}</span>
              <span class="text-[10px] text-muted-foreground">Rooms</span>
            </span>
          </div>
        </template>

        <!-- Staff Count Column -->
        <template #staff_count="{ row }">
          <div
            class="cursor-pointer w-full flex justify-center py-1"
            @click="router.push({ name: 'admin-hotels-show', params: { id: h(row).id } })"
          >
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/50 border border-border/50 text-foreground">
              <HugeiconsIcon :icon="UserGroupIcon" :size="13" class="text-muted-foreground" />
              <span class="font-semibold">{{ h(row).staff_count ?? 0 }}</span>
              <span class="text-[10px] text-muted-foreground">Staff</span>
            </span>
          </div>
        </template>

        <!-- Status Column -->
        <template #status="{ row }">
          <div
            class="cursor-pointer w-full flex justify-center py-1"
            @click="router.push({ name: 'admin-hotels-show', params: { id: h(row).id } })"
          >
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider border transition-colors select-none"
              :class="h(row).status === 'active'
                ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
                : 'border-amber-500/25 bg-amber-500/10 text-amber-400'"
            >
              <span
                class="h-1.5 w-1.5 rounded-full me-1.5 shrink-0"
                :class="h(row).status === 'active' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]' : 'bg-amber-400'"
              />
              {{ h(row).status }}
            </span>
          </div>
        </template>

        <!-- Actions Column -->
        <template #actions="{ row }">
          <div class="flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  size="icon"
                  variant="ghost"
                  class="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  <HugeiconsIcon :icon="MoreVerticalIcon" :size="16" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-44 rounded-xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-xl">
                <DropdownMenuItem
                  class="cursor-pointer gap-2 text-xs py-2"
                  @click="router.push({ name: 'admin-hotels-show', params: { id: h(row).id } })"
                >
                  <HugeiconsIcon :icon="EyeIcon" :size="14" class="text-muted-foreground" />
                  {{ t('actions.view', 'View Details') }}
                </DropdownMenuItem>

                <DropdownMenuItem
                  class="cursor-pointer gap-2 text-xs py-2"
                  @click="router.push({ name: 'admin-hotels-edit', params: { id: h(row).id } })"
                >
                  <HugeiconsIcon :icon="Edit02Icon" :size="14" class="text-muted-foreground" />
                  {{ t('actions.edit', 'Edit Hotel') }}
                </DropdownMenuItem>

                <DropdownMenuItem
                  class="cursor-pointer gap-2 text-xs py-2"
                  @click="router.push({ name: 'admin-hotels-show', params: { id: h(row).id }, query: { tab: 'rooms' } })"
                >
                  <HugeiconsIcon :icon="Door01Icon" :size="14" class="text-muted-foreground" />
                  {{ t('hotels.manage_rooms', 'Manage Rooms') }}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  class="cursor-pointer gap-2 text-xs py-2 text-rose-400 focus:text-rose-300 focus:bg-rose-500/10"
                  @click="handleDelete(h(row))"
                >
                  <HugeiconsIcon :icon="Delete02Icon" :size="14" />
                  {{ t('actions.delete', 'Delete') }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </template>

        <!-- Empty State -->
        <template #empty>
          <div class="flex flex-col items-center justify-center gap-3 py-14">
            <div class="h-14 w-14 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-center text-muted-foreground/60 shadow-inner">
              <HugeiconsIcon :icon="Building04Icon" :size="28" />
            </div>
            <div class="text-center">
              <p class="text-sm font-semibold text-foreground">{{ t('hotels.no_hotels', 'No hotels found.') }}</p>
              <p class="text-xs text-muted-foreground mt-0.5">{{ t('hotels.no_hotels_desc', 'Get started by adding your first hotel property.') }}</p>
            </div>
          </div>
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
  </div>
</template>

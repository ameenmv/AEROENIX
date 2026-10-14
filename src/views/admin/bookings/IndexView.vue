<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Calendar01Icon,
  CheckmarkBadge01Icon,
  Clock01Icon,
  Cancel01Icon,
  CreditCardIcon,
  EyeIcon,
  MoreVerticalIcon,
  NoteIcon,
  Copy01Icon,
  BedIcon,
  Building04Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'

import { bookingsService, type BookingStats } from '@/services/bookingsService'
import type { Booking } from '@/types/entities/booking'
import { useTable } from '@/composables/shared/useTable'

import BookingStatusBadge from '@/components/admin/bookings/BookingStatusBadge.vue'
import { Button } from '@/components/uic/button'
import { DataTable } from '@/components/ui/tables'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/uic/dropdown-menu'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/uic/alert-dialog'
import { Textarea } from '@/components/uic/textarea'
import { Label } from '@/components/uic/label'

const { t } = useI18n()
const router = useRouter()

const columns = [
  { key: 'booking_reference', label: 'bookings.reference', className: 'font-semibold w-[140px]' },
  { key: 'guest', label: 'bookings.guest', className: 'font-semibold' },
  { key: 'hotel', label: 'bookings.hotel', className: 'font-semibold' },
  { key: 'dates', label: 'bookings.dates', className: 'font-semibold' },
  { key: 'total', label: 'bookings.total', className: 'font-semibold text-right' },
  { key: 'status', label: 'bookings.status', className: 'font-semibold text-center w-[130px]' },
]

const statusFilter = ref<string | null>(null)
const stats = ref<BookingStats>({
  total: 0,
  confirmed: 0,
  pending: 0,
  rejected: 0,
  total_revenue: 0,
})

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
      if (result.stats) {
        stats.value = result.stats
      }
      return { data: result.data, total: result.pagination.total }
    }
    catch {
      return { data: [], total: 0 }
    }
  },
  defaultPerPage: 10,
  watchKeys: [statusFilter],
})

// Fallback counts if backend stats not loaded yet
const computedStats = computed(() => {
  if (stats.value.total > 0) return stats.value
  const items = (table.items.value || []) as Booking[]
  const total = table.totalItems.value || items.length
  const confirmed = items.filter(b => b.status === 'confirmed').length
  const pending = items.filter(b => b.status === 'pending').length
  const rejected = items.filter(b => b.status === 'rejected').length
  const total_revenue = items
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0)
  return { total, confirmed, pending, rejected, total_revenue }
})

function selectStatus(status: string | null) {
  statusFilter.value = status
  table.goToPage(1)
}

function copyReference(refCode: string) {
  navigator.clipboard.writeText(refCode)
  toast.success(t('bookings.ref_copied', 'Reference copied to clipboard'))
}

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0] ?? ''
  if (parts.length === 1) return first.slice(0, 2).toUpperCase()
  const last = parts[parts.length - 1] ?? ''
  const firstChar = first[0] ?? ''
  const lastChar = last[0] ?? ''
  return (firstChar + lastChar).toUpperCase() || '?'
}

// Quick Confirm / Reject Dialog state
const selectedBooking = ref<Booking | null>(null)
const isConfirmOpen = ref(false)
const isRejectOpen = ref(false)
const rejectionReason = ref('')
const isActionLoading = ref(false)

function openConfirm(booking: Booking) {
  selectedBooking.value = booking
  isConfirmOpen.value = true
}

function openReject(booking: Booking) {
  selectedBooking.value = booking
  rejectionReason.value = ''
  isRejectOpen.value = true
}

async function handleConfirm() {
  if (!selectedBooking.value) return
  isActionLoading.value = true
  try {
    await bookingsService.confirm(selectedBooking.value.id)
    toast.success(t('bookings.confirm_success', 'Booking confirmed successfully.'))
    isConfirmOpen.value = false
    selectedBooking.value = null
    table.refresh()
  }
  catch {
    toast.error(t('bookings.confirm_error', 'Failed to confirm booking.'))
  }
  finally {
    isActionLoading.value = false
  }
}

async function handleReject() {
  if (!selectedBooking.value) return
  if (!rejectionReason.value.trim()) {
    toast.error(t('bookings.reason_required', 'Rejection reason is required.'))
    return
  }
  isActionLoading.value = true
  try {
    await bookingsService.reject(selectedBooking.value.id, { reason: rejectionReason.value })
    toast.success(t('bookings.reject_success', 'Booking rejected successfully.'))
    isRejectOpen.value = false
    selectedBooking.value = null
    table.refresh()
  }
  catch {
    toast.error(t('bookings.reject_error', 'Failed to reject booking.'))
  }
  finally {
    isActionLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.12)]">
          <HugeiconsIcon :icon="Calendar01Icon" :size="22" />
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground">{{ t('bookings.title', 'Bookings') }}</h1>
          <p class="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {{ t('bookings.subtitle', 'Manage all hotel bookings and reservations.') }}
          </p>
        </div>
      </div>
    </div>

    <!-- 4 KPI Metrics Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <!-- Total Bookings -->
      <div
        class="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-4 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/40 hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)] cursor-pointer"
        :class="{ 'ring-2 ring-blue-500/50 border-blue-500/50': statusFilter === null }"
        @click="selectStatus(null)"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">{{ t('bookings.kpi_total', 'Total Bookings') }}</span>
          <div class="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <HugeiconsIcon :icon="Calendar01Icon" :size="16" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl font-bold tracking-tight text-foreground">{{ computedStats.total }}</span>
        </div>
        <div class="mt-1 text-[11px] text-muted-foreground">
          {{ t('bookings.kpi_total_desc', 'All-time reservations') }}
        </div>
      </div>

      <!-- Confirmed -->
      <div
        class="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-4 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)] cursor-pointer"
        :class="{ 'ring-2 ring-emerald-500/50 border-emerald-500/50': statusFilter === 'confirmed' }"
        @click="selectStatus('confirmed')"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">{{ t('bookings.kpi_confirmed', 'Confirmed') }}</span>
          <div class="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <HugeiconsIcon :icon="CheckmarkBadge01Icon" :size="16" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl font-bold tracking-tight text-emerald-400">{{ computedStats.confirmed }}</span>
        </div>
        <div class="mt-1 text-[11px] text-muted-foreground">
          {{ t('bookings.kpi_confirmed_desc', 'Guaranteed reservations') }}
        </div>
      </div>

      <!-- Pending -->
      <div
        class="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-4 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/40 hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)] cursor-pointer"
        :class="{ 'ring-2 ring-amber-500/50 border-amber-500/50': statusFilter === 'pending' }"
        @click="selectStatus('pending')"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">{{ t('bookings.kpi_pending', 'Pending') }}</span>
          <div class="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <HugeiconsIcon :icon="Clock01Icon" :size="16" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl font-bold tracking-tight text-amber-400">{{ computedStats.pending }}</span>
        </div>
        <div class="mt-1 text-[11px] text-muted-foreground">
          {{ t('bookings.kpi_pending_desc', 'Awaiting confirmation') }}
        </div>
      </div>

      <!-- Revenue -->
      <div
        class="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-4 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/40 hover:shadow-[0_8px_30px_rgba(168,85,247,0.12)]"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">{{ t('bookings.kpi_revenue', 'Total Revenue') }}</span>
          <div class="h-8 w-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <HugeiconsIcon :icon="CreditCardIcon" :size="16" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl font-bold tracking-tight text-foreground">
            {{ Number(computedStats.total_revenue).toLocaleString(undefined, { maximumFractionDigits: 0 }) }}
          </span>
          <span class="text-xs text-muted-foreground">EGP</span>
        </div>
        <div class="mt-1 text-[11px] text-muted-foreground">
          {{ t('bookings.kpi_revenue_desc', 'From confirmed stays') }}
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
        <span>{{ t('bookings.status_all', 'All Bookings') }}</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/80 text-muted-foreground">{{ computedStats.total }}</span>
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 select-none whitespace-nowrap"
        :class="statusFilter === 'pending'
          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
          : 'text-muted-foreground hover:text-amber-400'"
        @click="selectStatus('pending')"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>{{ t('bookings.pending', 'Pending') }}</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300">{{ computedStats.pending }}</span>
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 select-none whitespace-nowrap"
        :class="statusFilter === 'confirmed'
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
          : 'text-muted-foreground hover:text-emerald-400'"
        @click="selectStatus('confirmed')"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span>{{ t('bookings.confirmed', 'Confirmed') }}</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300">{{ computedStats.confirmed }}</span>
      </button>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 select-none whitespace-nowrap"
        :class="statusFilter === 'rejected'
          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold'
          : 'text-muted-foreground hover:text-rose-400'"
        @click="selectStatus('rejected')"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-rose-400" />
        <span>{{ t('bookings.rejected', 'Rejected') }}</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300">{{ computedStats.rejected }}</span>
      </button>
    </div>

    <!-- Data Table -->
    <div class="mt-2">
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
        @update:page="table.goToPage"
        @update:per-page="table.setPerPage"
        @update:search="table.setSearchQuery"
        @sort="table.setSorting"
      >
        <!-- Reference Column -->
        <template #booking_reference="{ row, value }">
          <div class="flex items-center gap-1.5 group/ref">
            <span
              class="font-mono text-xs font-semibold px-2 py-1 rounded-md bg-muted/60 text-foreground border border-border/50 group-hover/ref:border-primary/40 group-hover/ref:text-primary transition-colors cursor-pointer"
              @click="router.push({ name: 'admin-bookings-show', params: { id: (row as any).id } })"
            >
              {{ value }}
            </span>
            <button
              type="button"
              class="opacity-0 group-hover/ref:opacity-100 text-muted-foreground hover:text-foreground transition-opacity p-0.5 rounded"
              :title="t('bookings.copy_ref', 'Copy Reference')"
              @click.stop="copyReference(value)"
            >
              <HugeiconsIcon :icon="Copy01Icon" :size="12" />
            </button>
          </div>
        </template>

        <!-- Guest Column -->
        <template #guest="{ row }">
          <div
            class="flex items-center gap-3 cursor-pointer group/guest py-1"
            @click="router.push({ name: 'admin-bookings-show', params: { id: (row as any).id } })"
          >
            <div class="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 transition-transform group-hover/guest:scale-105">
              {{ getInitials((row as any).guest?.name) }}
            </div>
            <div class="min-w-0">
              <div class="font-semibold text-sm text-foreground group-hover/guest:text-primary transition-colors truncate">
                {{ (row as any).guest?.name }}
              </div>
              <div class="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                <span v-if="(row as any).guest?.phone" dir="ltr" class="font-mono">{{ (row as any).guest.phone }}</span>
                <span v-if="(row as any).guest?.phone && (row as any).guest?.email" class="text-border">•</span>
                <span v-if="(row as any).guest?.email" class="truncate max-w-[140px]">{{ (row as any).guest.email }}</span>
              </div>
            </div>
          </div>
        </template>

        <!-- Hotel & Room Column -->
        <template #hotel="{ row }">
          <div
            class="cursor-pointer group/hotel py-1"
            @click="router.push({ name: 'admin-bookings-show', params: { id: (row as any).id } })"
          >
            <div class="text-sm font-medium text-foreground flex items-center gap-1.5 group-hover/hotel:text-primary transition-colors">
              <HugeiconsIcon :icon="Building04Icon" :size="14" class="text-muted-foreground shrink-0" />
              <span class="truncate">{{ (row as any).hotel_name || t('common.na', 'N/A') }}</span>
            </div>
            <div class="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
              <HugeiconsIcon :icon="BedIcon" :size="12" class="text-muted-foreground/70 shrink-0" />
              <span class="truncate">{{ (row as any).room?.name }}</span>
              <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-muted/70 text-muted-foreground border border-border/40">
                x{{ (row as any).room?.rooms_count || 1 }}
              </span>
            </div>
          </div>
        </template>

        <!-- Dates Column -->
        <template #dates="{ row }">
          <div
            class="cursor-pointer group/dates py-1"
            @click="router.push({ name: 'admin-bookings-show', params: { id: (row as any).id } })"
          >
            <div class="text-xs sm:text-sm font-medium flex items-center gap-1.5 text-foreground">
              <HugeiconsIcon :icon="Calendar01Icon" :size="13" class="text-muted-foreground shrink-0" />
              <span v-if="(row as any).check_in_date && (row as any).check_out_date">
                {{ new Date((row as any).check_in_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }}
                <span class="text-muted-foreground mx-0.5">&rarr;</span>
                {{ new Date((row as any).check_out_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }}
              </span>
              <span v-else>—</span>
            </div>
            <div class="mt-1 flex items-center gap-1.5">
              <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium bg-muted/60 text-muted-foreground border border-border/40">
                {{ (row as any).nights_count }} {{ t('bookings.nights', 'nights') }}
              </span>
            </div>
          </div>
        </template>

        <!-- Total Price Column -->
        <template #total="{ row }">
          <div
            class="cursor-pointer w-full text-right py-1"
            @click="router.push({ name: 'admin-bookings-show', params: { id: (row as any).id } })"
          >
            <div class="text-sm font-bold tracking-tight text-foreground font-mono">
              {{ (row as any).price }}
            </div>
            <div class="text-[11px] text-muted-foreground capitalize">
              {{ (row as any).payment?.method || 'Direct' }}
            </div>
          </div>
        </template>

        <!-- Status Column -->
        <template #status="{ row }">
          <div
            class="cursor-pointer w-full flex justify-center py-1"
            @click="router.push({ name: 'admin-bookings-show', params: { id: (row as any).id } })"
          >
            <BookingStatusBadge :status="(row as any).status" />
          </div>
        </template>

        <!-- Actions Column -->
        <template #actions="{ row }">
          <div class="w-full flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  <HugeiconsIcon :icon="MoreVerticalIcon" :size="16" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-44 rounded-xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-xl">
                <DropdownMenuItem
                  class="cursor-pointer gap-2 text-xs py-2"
                  @click="router.push({ name: 'admin-bookings-show', params: { id: (row as any).id } })"
                >
                  <HugeiconsIcon :icon="EyeIcon" :size="14" class="text-muted-foreground" />
                  {{ t('actions.view', 'View Details') }}
                </DropdownMenuItem>

                <template v-if="(row as any).actions?.can_confirm">
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    class="cursor-pointer gap-2 text-xs py-2 text-emerald-400 focus:text-emerald-300 focus:bg-emerald-500/10"
                    @click="openConfirm(row as any)"
                  >
                    <HugeiconsIcon :icon="CheckmarkBadge01Icon" :size="14" />
                    {{ t('actions.confirm', 'Confirm Booking') }}
                  </DropdownMenuItem>
                </template>

                <template v-if="(row as any).actions?.can_reject">
                  <DropdownMenuItem
                    class="cursor-pointer gap-2 text-xs py-2 text-rose-400 focus:text-rose-300 focus:bg-rose-500/10"
                    @click="openReject(row as any)"
                  >
                    <HugeiconsIcon :icon="Cancel01Icon" :size="14" />
                    {{ t('actions.reject', 'Reject Booking') }}
                  </DropdownMenuItem>
                </template>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </template>

        <!-- Empty State -->
        <template #empty>
          <div class="flex flex-col items-center justify-center gap-3 py-14">
            <div class="h-14 w-14 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-center text-muted-foreground/60 shadow-inner">
              <HugeiconsIcon :icon="NoteIcon" :size="28" />
            </div>
            <div class="text-center">
              <p class="text-sm font-semibold text-foreground">{{ t('bookings.no_bookings', 'No bookings found.') }}</p>
              <p class="text-xs text-muted-foreground mt-0.5">Try clearing filters or search queries.</p>
            </div>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Quick Confirm Dialog -->
    <AlertDialog :open="isConfirmOpen" @update:open="isConfirmOpen = $event">
      <AlertDialogContent class="border border-border/60 bg-card/95 backdrop-blur-xl">
        <AlertDialogHeader>
          <AlertDialogTitle class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <HugeiconsIcon :icon="CheckmarkBadge01Icon" :size="16" />
            </div>
            {{ t('bookings.confirm_title', 'Confirm Booking') }}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {{ t('bookings.confirm_desc', 'Are you sure you want to confirm this booking? The guest will be notified.') }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isActionLoading" @click="isConfirmOpen = false">{{ t('actions.cancel', 'Cancel') }}</AlertDialogCancel>
          <Button
            variant="default"
            class="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-600/20"
            :disabled="isActionLoading"
            @click="handleConfirm"
          >
            <div v-if="isActionLoading" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {{ isActionLoading ? t('common.loading', 'Loading...') : t('actions.confirm', 'Confirm') }}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Quick Reject Dialog -->
    <AlertDialog :open="isRejectOpen" @update:open="isRejectOpen = $event">
      <AlertDialogContent class="border border-border/60 bg-card/95 backdrop-blur-xl">
        <AlertDialogHeader>
          <AlertDialogTitle class="flex items-center gap-2 text-rose-400">
            <div class="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <HugeiconsIcon :icon="Cancel01Icon" :size="16" />
            </div>
            {{ t('bookings.reject_title', 'Reject Booking') }}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {{ t('bookings.reject_desc', 'Are you sure you want to reject this booking? Please provide a reason to notify the guest.') }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div class="py-3">
          <Label for="quick-reason" class="mb-2 block text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            {{ t('bookings.reason_label', 'Reason for rejection') }} <span class="text-rose-400">*</span>
          </Label>
          <Textarea
            id="quick-reason"
            v-model="rejectionReason"
            :placeholder="t('bookings.reason_placeholder', 'e.g., No rooms available for these dates.')"
            rows="3"
            :disabled="isActionLoading"
            class="bg-background/50 border-border/60"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isActionLoading" @click="isRejectOpen = false">{{ t('actions.cancel', 'Cancel') }}</AlertDialogCancel>
          <Button
            variant="destructive"
            class="gap-2 shadow-lg shadow-rose-600/20"
            :disabled="isActionLoading"
            @click="handleReject"
          >
            <div v-if="isActionLoading" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {{ isActionLoading ? t('common.loading', 'Loading...') : t('actions.reject', 'Reject') }}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

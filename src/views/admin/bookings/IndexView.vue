<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import {
  Calendar01Icon,
  CheckmarkBadge01Icon,
  Search01Icon,
  FilterIcon,
  EyeIcon,
  MoreVerticalIcon,
  NoteIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

import { bookingsService } from '@/services/bookingsService'
import type { Booking } from '@/types/entities/booking'

import { Button } from '@/components/uic/button'
import { Input } from '@/components/uic/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/uic/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/uic/table'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import FilterPanel from '@/components/uic/filter-panel/FilterPanel.vue'

import { refDebounced } from '@vueuse/core'

const { t } = useI18n()
const router = useRouter()

const search = ref('')
const debouncedSearch = refDebounced(search, 500)
const filters = ref<Record<string, unknown>>({ status: null })

const { data, isLoading } = useQuery({
  queryKey: ['bookings', debouncedSearch, filters],
  queryFn: () => bookingsService.list({ 
    search: debouncedSearch.value, 
    status: filters.value.status as string,
    limit: 50 
  }),
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

    <!-- Filters and Search -->
    <div class="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border/50">
      <div class="relative w-full sm:max-w-xs">
        <HugeiconsIcon :icon="Search01Icon" :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="search" :placeholder="t('bookings.search', 'Search bookings...')" class="pl-9 w-full bg-background" />
      </div>
      
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <!-- Simple Status Filter -->
        <select v-model="filters.status" class="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option :value="null">{{ t('bookings.all_statuses', 'All Statuses') }}</option>
          <option value="pending">{{ t('bookings.pending', 'Pending') }}</option>
          <option value="confirmed">{{ t('bookings.confirmed', 'Confirmed') }}</option>
          <option value="rejected">{{ t('bookings.rejected', 'Rejected') }}</option>
        </select>
      </div>
    </div>

    <!-- Data Table -->
    <div class="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow class="hover:bg-transparent bg-muted/30">
            <TableHead class="font-semibold">{{ t('bookings.reference', 'Ref') }}</TableHead>
            <TableHead class="font-semibold">{{ t('bookings.guest', 'Guest') }}</TableHead>
            <TableHead class="font-semibold">{{ t('bookings.hotel', 'Hotel') }}</TableHead>
            <TableHead class="font-semibold">{{ t('bookings.dates', 'Dates') }}</TableHead>
            <TableHead class="font-semibold text-right">{{ t('bookings.total', 'Total') }}</TableHead>
            <TableHead class="font-semibold text-center">{{ t('bookings.status', 'Status') }}</TableHead>
            <TableHead class="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading">
            <TableCell colspan="7" class="h-32 text-center text-muted-foreground">
              {{ t('common.loading', 'Loading...') }}
            </TableCell>
          </TableRow>
          
          <template v-else-if="data?.data.length">
            <TableRow v-for="booking in data.data" :key="booking.id" class="group cursor-pointer hover:bg-muted/50 transition-colors" @click="router.push({ name: 'admin-bookings-show', params: { id: booking.id } })">
              <TableCell class="font-medium text-primary">
                {{ booking.booking_reference }}
              </TableCell>
              <TableCell>
                <div class="font-semibold">{{ booking.guest.name }}</div>
                <div class="text-xs text-muted-foreground">{{ booking.guest.phone || booking.guest.email }}</div>
              </TableCell>
              <TableCell>
                <div class="text-sm font-medium">{{ booking.hotel_name || 'N/A' }}</div>
                <div class="text-xs text-muted-foreground">{{ booking.room.name }} (x{{ booking.room.rooms_count }})</div>
              </TableCell>
              <TableCell>
                <div class="text-sm flex items-center gap-1.5">
                  <HugeiconsIcon :icon="Calendar01Icon" :size="14" class="text-muted-foreground" />
                  <span v-if="booking.check_in_date && booking.check_out_date">
                    {{ new Date(booking.check_in_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }}
                    &rarr;
                    {{ new Date(booking.check_out_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }}
                  </span>
                  <span v-else>—</span>
                </div>
                <div class="text-xs text-muted-foreground mt-0.5">{{ booking.nights_count }} {{ t('bookings.nights', 'nights') }}</div>
              </TableCell>
              <TableCell class="text-right font-medium">
                {{ booking.price }}
              </TableCell>
              <TableCell class="text-center">
                <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border', getStatusColor(booking.status)]">
                  {{ booking.status_label }}
                </span>
              </TableCell>
              <TableCell @click.stop>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <HugeiconsIcon :icon="MoreVerticalIcon" :size="16" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="router.push({ name: 'admin-bookings-show', params: { id: booking.id } })">
                      <HugeiconsIcon :icon="EyeIcon" :size="14" class="mr-2" />
                      {{ t('actions.view', 'View') }}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </template>

          <TableRow v-else>
            <TableCell colspan="7" class="h-32 text-center text-muted-foreground">
              <div class="flex flex-col items-center justify-center gap-2">
                <HugeiconsIcon :icon="NoteIcon" :size="32" class="opacity-20" />
                <p>{{ t('bookings.no_bookings', 'No bookings found.') }}</p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

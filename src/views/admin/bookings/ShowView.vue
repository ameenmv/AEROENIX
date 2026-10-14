<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  ArrowLeft01Icon,
  CheckmarkBadge01Icon,
  Cancel01Icon,
  UserIcon,
  NoteIcon,
  CreditCardIcon,
  Contact01Icon,
  Building04Icon,
  BedIcon,
  Calendar01Icon,
  Mail01Icon,
  Call02Icon,
  Copy01Icon,
  PrinterIcon,
  Clock01Icon,
  InformationCircleIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'

import { bookingsService } from '@/services/bookingsService'
import BookingStatusBadge from '@/components/admin/bookings/BookingStatusBadge.vue'

import { Button } from '@/components/uic/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/uic/card'
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
import { Skeleton } from '@/components/uic/skeleton'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const queryClient = useQueryClient()

const bookingId = Number(route.params.id)

const { data: booking, isLoading } = useQuery({
  queryKey: ['bookings', bookingId],
  queryFn: () => bookingsService.get(bookingId),
})

const isConfirmDialogOpen = ref(false)
const isRejectDialogOpen = ref(false)
const rejectionReason = ref('')

const { mutate: confirmBookingFn, isPending: isConfirming } = useMutation({
  mutationFn: () => bookingsService.confirm(bookingId),
  onSuccess: () => {
    toast.success(t('bookings.confirm_success', 'Booking confirmed successfully.'))
    isConfirmDialogOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['bookings', bookingId] })
  },
  onError: () => toast.error(t('bookings.confirm_error', 'Failed to confirm booking.')),
})

const { mutate: rejectBookingFn, isPending: isRejecting } = useMutation({
  mutationFn: () => bookingsService.reject(bookingId, { reason: rejectionReason.value }),
  onSuccess: () => {
    toast.success(t('bookings.reject_success', 'Booking rejected successfully.'))
    isRejectDialogOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['bookings', bookingId] })
  },
  onError: () => toast.error(t('bookings.reject_error', 'Failed to reject booking.')),
})

function confirmBooking() {
  confirmBookingFn()
}

function rejectBooking() {
  if (!rejectionReason.value.trim()) {
    toast.error(t('bookings.reason_required', 'Rejection reason is required.'))
    return
  }
  rejectBookingFn()
}

function copyReference() {
  if (!booking.value?.booking_reference) return
  navigator.clipboard.writeText(booking.value.booking_reference)
  toast.success(t('bookings.ref_copied', 'Reference copied to clipboard'))
}

function copyText(val: string, label: string) {
  navigator.clipboard.writeText(val)
  toast.success(`${label} copied to clipboard`)
}

function printDetails() {
  window.print()
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

const perNightPrice = computed(() => {
  if (!booking.value) return 0
  const nights = booking.value.nights_count || 1
  const total = booking.value.total_price || 0
  return (total / nights).toFixed(2)
})
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Top Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
      <div class="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          class="h-9 w-9 rounded-xl border-border/60 hover:bg-muted/80 transition-colors"
          @click="router.push({ name: 'admin-bookings' })"
        >
          <HugeiconsIcon :icon="ArrowLeft01Icon" :size="16" class="rtl:rotate-180" />
        </Button>
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {{ t('bookings.booking_details', 'Booking Details') }}
            </h1>
            <BookingStatusBadge v-if="booking" :status="booking.status" size="md" />
          </div>
          <div v-if="booking" class="flex items-center gap-2 mt-1">
            <span class="text-xs font-mono font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/40">
              #{{ booking.booking_reference }}
            </span>
            <button
              type="button"
              class="text-muted-foreground hover:text-foreground text-xs p-1 rounded hover:bg-muted/80 transition-colors"
              :title="t('bookings.copy_ref', 'Copy Reference')"
              @click="copyReference"
            >
              <HugeiconsIcon :icon="Copy01Icon" :size="13" />
            </button>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          class="gap-1.5 text-xs rounded-xl border-border/60 text-muted-foreground hover:text-foreground print:hidden"
          @click="printDetails"
        >
          <HugeiconsIcon :icon="PrinterIcon" :size="14" />
          {{ t('bookings.print', 'Print') }}
        </Button>

        <template v-if="booking?.actions?.can_confirm">
          <Button
            variant="default"
            size="sm"
            class="gap-1.5 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
            @click="isConfirmDialogOpen = true"
          >
            <HugeiconsIcon :icon="CheckmarkBadge01Icon" :size="15" />
            {{ t('actions.confirm', 'Confirm Booking') }}
          </Button>
        </template>

        <template v-if="booking?.actions?.can_reject">
          <Button
            variant="destructive"
            size="sm"
            class="gap-1.5 text-xs rounded-xl shadow-lg shadow-rose-600/20"
            @click="isRejectDialogOpen = true"
          >
            <HugeiconsIcon :icon="Cancel01Icon" :size="15" />
            {{ t('actions.reject', 'Reject') }}
          </Button>
        </template>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <Skeleton class="h-28 w-full rounded-2xl" />
        <Skeleton class="h-64 w-full rounded-2xl" />
        <Skeleton class="h-64 w-full rounded-2xl" />
      </div>
      <div class="lg:col-span-1 space-y-6">
        <Skeleton class="h-44 w-full rounded-2xl" />
        <Skeleton class="h-60 w-full rounded-2xl" />
      </div>
    </div>

    <!-- Loaded Content -->
    <template v-else-if="booking">
      <!-- Status Notice Banner -->
      <div
        v-if="booking.status === 'confirmed'"
        class="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 flex items-center justify-between gap-4 backdrop-blur-md"
      >
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <HugeiconsIcon :icon="CheckmarkBadge01Icon" :size="20" />
          </div>
          <div>
            <div class="font-semibold text-sm text-emerald-300">
              {{ t('bookings.guaranteed_booking', 'Confirmed & Guaranteed') }}
            </div>
            <div class="text-xs text-emerald-400/80 mt-0.5">
              {{ t('bookings.confirmed_at', 'Confirmed on') }} {{ booking.confirmed_at ? new Date(booking.confirmed_at).toLocaleString() : 'N/A' }}
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="booking.status === 'rejected'"
        class="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 backdrop-blur-md"
      >
        <div class="flex items-start gap-3">
          <div class="h-10 w-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
            <HugeiconsIcon :icon="Cancel01Icon" :size="20" />
          </div>
          <div>
            <div class="font-semibold text-sm text-rose-300">
              {{ t('bookings.cancelled_booking', 'Booking Declined') }}
            </div>
            <div class="text-xs text-rose-400/80 mt-1">
              <span class="font-semibold">{{ t('bookings.rejection_reason', 'Rejection Reason') }}:</span> {{ booking.rejection_reason || '—' }}
            </div>
          </div>
        </div>
        <div v-if="booking.rejected_at" class="text-xs text-rose-400/60 font-mono">
          {{ new Date(booking.rejected_at).toLocaleString() }}
        </div>
      </div>

      <div
        v-else
        class="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 flex items-center justify-between gap-4 backdrop-blur-md"
      >
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <HugeiconsIcon :icon="Clock01Icon" :size="20" />
          </div>
          <div>
            <div class="font-semibold text-sm text-amber-300">
              {{ t('bookings.pending_review', 'Action Required: Review Booking') }}
            </div>
            <div class="text-xs text-amber-400/80 mt-0.5">
              {{ t('bookings.confirm_desc', 'Please review the stay details and accept or decline.') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Stay Summary Ribbon (4-tile quick glance) -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <!-- Check In -->
        <div class="rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-4 backdrop-blur-xl">
          <div class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <HugeiconsIcon :icon="Calendar01Icon" :size="14" class="text-primary" />
            {{ t('bookings.check_in', 'Check In') }}
          </div>
          <div class="mt-2 font-bold text-base text-foreground font-mono">
            {{ booking.check_in_date ? new Date(booking.check_in_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : booking.check_in }}
          </div>
        </div>

        <!-- Check Out -->
        <div class="rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-4 backdrop-blur-xl">
          <div class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <HugeiconsIcon :icon="Calendar01Icon" :size="14" class="text-primary" />
            {{ t('bookings.check_out', 'Check Out') }}
          </div>
          <div class="mt-2 font-bold text-base text-foreground font-mono">
            {{ booking.check_out_date ? new Date(booking.check_out_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : booking.check_out }}
          </div>
        </div>

        <!-- Duration -->
        <div class="rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-4 backdrop-blur-xl">
          <div class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <HugeiconsIcon :icon="Clock01Icon" :size="14" class="text-primary" />
            {{ t('bookings.duration', 'Duration') }}
          </div>
          <div class="mt-2 font-bold text-base text-foreground">
            {{ booking.nights_count }} {{ t('bookings.nights', 'Nights') }}
          </div>
        </div>

        <!-- Rooms & Capacity -->
        <div class="rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-4 backdrop-blur-xl">
          <div class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <HugeiconsIcon :icon="BedIcon" :size="14" class="text-primary" />
            {{ t('bookings.room_type', 'Room') }}
          </div>
          <div class="mt-2 font-bold text-base text-foreground truncate">
            {{ booking.room?.rooms_count || 1 }}x {{ booking.room?.name || 'Room' }}
          </div>
        </div>
      </div>

      <!-- Main 2-Column Content Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left 2 Cols: Guest & Accommodation -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Guest Dossier Card -->
          <Card class="border border-border/60 bg-card/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm">
            <CardHeader class="pb-4 border-b border-border/50 bg-muted/20">
              <CardTitle class="text-base font-semibold flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <HugeiconsIcon :icon="UserIcon" :size="18" class="text-primary" />
                  {{ t('bookings.guest_info', 'Guest Information') }}
                </div>
                <span class="text-xs font-normal text-muted-foreground">{{ booking.room?.guests_count || 1 }} {{ t('bookings.guests', 'Guests') }}</span>
              </CardTitle>
            </CardHeader>
            <CardContent class="pt-5 space-y-5">
              <div class="flex items-center gap-4">
                <div class="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/20 flex items-center justify-center text-base font-bold text-primary shrink-0 shadow-[0_0_20px_rgba(var(--primary-rgb),0.12)]">
                  {{ getInitials(booking.guest?.name) }}
                </div>
                <div class="min-w-0">
                  <div class="text-lg font-bold text-foreground">
                    {{ booking.guest?.name }}
                  </div>
                  <div class="text-xs text-muted-foreground mt-0.5">
                    Primary Guest & Reservation Holder
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
                <!-- Email -->
                <div class="p-3 rounded-xl bg-muted/30 border border-border/40">
                  <div class="text-xs text-muted-foreground flex items-center justify-between">
                    <span class="flex items-center gap-1.5">
                      <HugeiconsIcon :icon="Mail01Icon" :size="13" />
                      {{ t('bookings.email', 'Email Address') }}
                    </span>
                    <button
                      v-if="booking.guest?.email"
                      type="button"
                      class="text-muted-foreground hover:text-foreground"
                      @click="copyText(booking.guest.email, 'Email')"
                    >
                      <HugeiconsIcon :icon="Copy01Icon" :size="12" />
                    </button>
                  </div>
                  <div class="mt-1.5 text-sm font-medium text-foreground truncate">
                    <a v-if="booking.guest?.email" :href="`mailto:${booking.guest.email}`" class="hover:underline hover:text-primary">
                      {{ booking.guest.email }}
                    </a>
                    <span v-else class="text-muted-foreground">—</span>
                  </div>
                </div>

                <!-- Phone -->
                <div class="p-3 rounded-xl bg-muted/30 border border-border/40">
                  <div class="text-xs text-muted-foreground flex items-center justify-between">
                    <span class="flex items-center gap-1.5">
                      <HugeiconsIcon :icon="Call02Icon" :size="13" />
                      {{ t('bookings.phone', 'Phone Number') }}
                    </span>
                    <button
                      v-if="booking.guest?.phone"
                      type="button"
                      class="text-muted-foreground hover:text-foreground"
                      @click="copyText(booking.guest.phone, 'Phone')"
                    >
                      <HugeiconsIcon :icon="Copy01Icon" :size="12" />
                    </button>
                  </div>
                  <div class="mt-1.5 text-sm font-medium text-foreground" dir="ltr">
                    <a v-if="booking.guest?.phone" :href="`tel:${booking.guest.phone}`" class="hover:underline hover:text-primary font-mono">
                      {{ booking.guest.phone }}
                    </a>
                    <span v-else class="text-muted-foreground">—</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Stay Details & Hotel Card -->
          <Card class="border border-border/60 bg-card/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm">
            <CardHeader class="pb-4 border-b border-border/50 bg-muted/20">
              <CardTitle class="text-base font-semibold flex items-center gap-2">
                <HugeiconsIcon :icon="Building04Icon" :size="18" class="text-primary" />
                {{ t('bookings.stay_details', 'Stay Details') }}
              </CardTitle>
            </CardHeader>
            <CardContent class="pt-5 space-y-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label class="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{{ t('bookings.hotel', 'Hotel') }}</Label>
                  <div class="font-medium text-foreground mt-1 flex items-center gap-2">
                    <HugeiconsIcon :icon="Building04Icon" :size="16" class="text-muted-foreground" />
                    {{ booking.hotel_name || t('common.na', 'N/A') }}
                  </div>
                </div>

                <div>
                  <Label class="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{{ t('bookings.room_type', 'Room Type') }}</Label>
                  <div class="font-medium text-foreground mt-1 flex items-center gap-2">
                    <HugeiconsIcon :icon="BedIcon" :size="16" class="text-muted-foreground" />
                    <span>{{ booking.room?.name }}</span>
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted/80 text-muted-foreground border border-border/40">
                      x{{ booking.room?.rooms_count || 1 }}
                    </span>
                  </div>
                </div>

                <div>
                  <Label class="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{{ t('bookings.check_in', 'Check In') }}</Label>
                  <div class="font-medium text-foreground mt-1">
                    {{ booking.check_in }}
                  </div>
                </div>

                <div>
                  <Label class="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{{ t('bookings.check_out', 'Check Out') }}</Label>
                  <div class="font-medium text-foreground mt-1">
                    {{ booking.check_out }}
                  </div>
                </div>
              </div>

              <!-- Special Requests Box -->
              <div class="pt-4 border-t border-border/40">
                <div class="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <HugeiconsIcon :icon="NoteIcon" :size="14" class="text-primary" />
                  {{ t('bookings.special_requests', 'Special Requests') }}
                </div>
                <div
                  v-if="booking.special_requests"
                  class="text-sm p-4 rounded-xl bg-muted/40 border border-border/50 text-foreground leading-relaxed italic border-s-4 border-s-primary"
                >
                  "{{ booking.special_requests }}"
                </div>
                <div v-else class="text-xs text-muted-foreground italic p-3 rounded-xl bg-muted/20 border border-border/30">
                  {{ t('bookings.no_special_requests', 'No special requests submitted.') }}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Right 1 Col: Payment, ID & Timeline -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Payment Summary Card -->
          <Card class="border border-border/60 bg-gradient-to-b from-card/90 to-card/50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm">
            <CardHeader class="pb-4 border-b border-border/50 bg-muted/20">
              <CardTitle class="text-base font-semibold flex items-center gap-2">
                <HugeiconsIcon :icon="CreditCardIcon" :size="18" class="text-primary" />
                {{ t('bookings.payment_details', 'Payment Summary') }}
              </CardTitle>
            </CardHeader>
            <CardContent class="pt-5 space-y-4">
              <div class="flex justify-between items-center py-2 border-b border-border/40 text-xs sm:text-sm">
                <span class="text-muted-foreground">{{ t('bookings.payment_method', 'Method') }}</span>
                <span class="font-medium capitalize px-2 py-0.5 rounded bg-muted/60 border border-border/40 text-foreground">
                  {{ booking.payment?.method || 'Direct' }}
                </span>
              </div>

              <div class="flex justify-between items-center py-2 border-b border-border/40 text-xs sm:text-sm">
                <span class="text-muted-foreground">{{ t('bookings.duration', 'Nights') }}</span>
                <span class="font-medium text-foreground">{{ booking.nights_count }} {{ t('bookings.nights', 'nights') }}</span>
              </div>

              <div class="flex justify-between items-center py-2 border-b border-border/40 text-xs sm:text-sm">
                <span class="text-muted-foreground">Estimated Rate</span>
                <span class="font-mono text-muted-foreground">~{{ perNightPrice }} {{ booking.currency || 'EGP' }} / night</span>
              </div>

              <div class="pt-2 flex justify-between items-baseline">
                <span class="text-sm font-semibold text-foreground">{{ t('bookings.total_price', 'Total Price') }}</span>
                <div class="text-right">
                  <div class="text-2xl font-bold tracking-tight text-primary font-mono">
                    {{ booking.price }}
                  </div>
                  <div class="text-[11px] text-muted-foreground">
                    Includes taxes & fees
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- ID Verification Card -->
          <Card v-if="booking.id_card?.has_file || booking.id_card?.number" class="border border-border/60 bg-card/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm">
            <CardHeader class="pb-4 border-b border-border/50 bg-muted/20">
              <CardTitle class="text-base font-semibold flex items-center gap-2">
                <HugeiconsIcon :icon="Contact01Icon" :size="18" class="text-primary" />
                {{ t('bookings.id_verification', 'ID Verification') }}
              </CardTitle>
            </CardHeader>
            <CardContent class="pt-5 space-y-4">
              <div v-if="booking.id_card.number">
                <Label class="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{{ t('bookings.id_number', 'ID / Passport Number') }}</Label>
                <div class="font-mono font-semibold text-foreground mt-1 px-3 py-2 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between">
                  <span>{{ booking.id_card.number }}</span>
                  <button
                    type="button"
                    class="text-muted-foreground hover:text-foreground"
                    @click="copyText(booking.id_card.number, 'ID Number')"
                  >
                    <HugeiconsIcon :icon="Copy01Icon" :size="13" />
                  </button>
                </div>
              </div>

              <div v-if="booking.id_card.has_file && booking.id_card.url" class="pt-2">
                <Label class="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">
                  {{ t('bookings.id_document', 'Document Image') }}
                </Label>
                <a
                  :href="booking.id_card.url"
                  target="_blank"
                  class="group block relative rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors"
                >
                  <img
                    :src="booking.id_card.url"
                    alt="ID Document"
                    class="w-full h-auto object-cover max-h-48 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-semibold text-white gap-1.5">
                    <HugeiconsIcon :icon="InformationCircleIcon" :size="14" />
                    {{ t('bookings.view_document', 'View Document') }}
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>

          <!-- Reservation Timeline Card -->
          <Card class="border border-border/60 bg-card/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm">
            <CardHeader class="pb-3 border-b border-border/50 bg-muted/20">
              <CardTitle class="text-sm font-semibold flex items-center gap-2">
                <HugeiconsIcon :icon="Clock01Icon" :size="16" class="text-primary" />
                {{ t('bookings.booking_timeline', 'Reservation Timeline') }}
              </CardTitle>
            </CardHeader>
            <CardContent class="pt-4 space-y-4 text-xs">
              <!-- Created -->
              <div class="flex items-start gap-3">
                <div class="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <HugeiconsIcon :icon="Calendar01Icon" :size="12" />
                </div>
                <div>
                  <div class="font-semibold text-foreground">{{ t('bookings.created_at', 'Created on') }}</div>
                  <div class="text-muted-foreground font-mono mt-0.5">
                    {{ booking.created_at ? new Date(booking.created_at).toLocaleString() : '—' }}
                  </div>
                </div>
              </div>

              <!-- Confirmed or Rejected -->
              <div v-if="booking.confirmed_at" class="flex items-start gap-3">
                <div class="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <HugeiconsIcon :icon="CheckmarkBadge01Icon" :size="12" />
                </div>
                <div>
                  <div class="font-semibold text-emerald-400">{{ t('bookings.confirmed_at', 'Confirmed on') }}</div>
                  <div class="text-muted-foreground font-mono mt-0.5">
                    {{ new Date(booking.confirmed_at).toLocaleString() }}
                  </div>
                </div>
              </div>

              <div v-if="booking.rejected_at" class="flex items-start gap-3">
                <div class="h-6 w-6 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                  <HugeiconsIcon :icon="Cancel01Icon" :size="12" />
                </div>
                <div>
                  <div class="font-semibold text-rose-400">{{ t('bookings.rejected_at', 'Rejected on') }}</div>
                  <div class="text-muted-foreground font-mono mt-0.5">
                    {{ new Date(booking.rejected_at).toLocaleString() }}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </template>

    <!-- Confirm Dialog -->
    <AlertDialog :open="isConfirmDialogOpen" @update:open="isConfirmDialogOpen = $event">
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
          <AlertDialogCancel :disabled="isConfirming" @click="isConfirmDialogOpen = false">{{ t('actions.cancel', 'Cancel') }}</AlertDialogCancel>
          <Button
            variant="default"
            class="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
            :disabled="isConfirming"
            @click="confirmBooking"
          >
            <div v-if="isConfirming" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
            {{ isConfirming ? t('common.loading', 'Loading...') : t('actions.confirm', 'Confirm') }}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Reject Dialog -->
    <AlertDialog :open="isRejectDialogOpen" @update:open="isRejectDialogOpen = $event">
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
          <Label for="reason" class="mb-2 block text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            {{ t('bookings.reason_label', 'Reason for rejection') }} <span class="text-rose-400">*</span>
          </Label>
          <Textarea
            id="reason"
            v-model="rejectionReason"
            :placeholder="t('bookings.reason_placeholder', 'e.g., No rooms available for these dates.')"
            rows="3"
            :disabled="isRejecting"
            class="bg-background/50 border-border/60"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isRejecting" @click="isRejectDialogOpen = false">{{ t('actions.cancel', 'Cancel') }}</AlertDialogCancel>
          <Button
            variant="destructive"
            class="shadow-lg shadow-rose-600/20"
            :disabled="isRejecting"
            @click="rejectBooking"
          >
            <div v-if="isRejecting" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
            {{ isRejecting ? t('common.loading', 'Loading...') : t('actions.reject', 'Reject') }}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

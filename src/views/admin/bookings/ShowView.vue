<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  Calendar01Icon,
  CheckmarkBadge01Icon,
  Cancel01Icon,
  UserIcon,
  NoteIcon,
  CreditCardIcon,
  Contact01Icon,
  Building04Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'

import { bookingsService } from '@/services/bookingsService'
import type { Booking } from '@/types/entities/booking'

import { Button } from '@/components/uic/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/uic/card'
import {
  AlertDialog,
  AlertDialogAction,
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
  onError: () => toast.error(t('bookings.confirm_error', 'Failed to confirm booking.'))
})

const { mutate: rejectBookingFn, isPending: isRejecting } = useMutation({
  mutationFn: () => bookingsService.reject(bookingId, { reason: rejectionReason.value }),
  onSuccess: () => {
    toast.success(t('bookings.reject_success', 'Booking rejected successfully.'))
    isRejectDialogOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['bookings', bookingId] })
  },
  onError: () => toast.error(t('bookings.reject_error', 'Failed to reject booking.'))
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
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold tracking-tight">{{ t('bookings.booking_details', 'Booking Details') }}</h1>
          <span v-if="booking" :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border', getStatusColor(booking.status)]">
            {{ booking.status_label }}
          </span>
        </div>
        <p v-if="booking" class="text-sm text-muted-foreground mt-1 font-mono">
          {{ booking.booking_reference }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <template v-if="booking?.actions.can_confirm">
          <Button variant="default" class="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" @click="isConfirmDialogOpen = true">
            <HugeiconsIcon :icon="CheckmarkBadge01Icon" :size="16" />
            {{ t('actions.confirm', 'Confirm') }}
          </Button>
        </template>
        <template v-if="booking?.actions.can_reject">
          <Button variant="destructive" class="gap-2" @click="isRejectDialogOpen = true">
            <HugeiconsIcon :icon="Cancel01Icon" :size="16" />
            {{ t('actions.reject', 'Reject') }}
          </Button>
        </template>
        
        <Button variant="ghost" @click="router.push({ name: 'admin-bookings' })">
          {{ t('actions.back', 'Back') }}
        </Button>
      </div>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="col-span-1 md:col-span-2 space-y-6">
        <Card>
          <CardHeader class="pb-4 border-b border-border/50">
            <Skeleton class="h-6 w-1/3" />
          </CardHeader>
          <CardContent class="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="i in 3" :key="`guest-skeleton-${i}`">
              <Skeleton class="h-3 w-20 mb-2" />
              <Skeleton class="h-5 w-3/4" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader class="pb-4 border-b border-border/50">
            <Skeleton class="h-6 w-1/4" />
          </CardHeader>
          <CardContent class="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="i in 6" :key="`stay-skeleton-${i}`">
              <Skeleton class="h-3 w-16 mb-2" />
              <Skeleton class="h-5 w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>
      <div class="col-span-1 space-y-6">
        <Card>
          <CardHeader class="pb-4 border-b border-border/50">
            <Skeleton class="h-6 w-1/2" />
          </CardHeader>
          <CardContent class="pt-4 space-y-4">
            <div class="flex justify-between items-center py-2 border-b border-border/50">
              <Skeleton class="h-4 w-16" />
              <Skeleton class="h-4 w-20" />
            </div>
            <div class="flex justify-between items-center py-2">
              <Skeleton class="h-5 w-24" />
              <Skeleton class="h-6 w-20" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <template v-else-if="booking">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Left Column: Guest & Hotel -->
        <div class="col-span-1 md:col-span-2 space-y-6">
          <Card>
            <CardHeader class="pb-4 border-b border-border/50">
              <CardTitle class="text-lg flex items-center gap-2">
                <HugeiconsIcon :icon="UserIcon" :size="20" class="text-primary" />
                {{ t('bookings.guest_info', 'Guest Information') }}
              </CardTitle>
            </CardHeader>
            <CardContent class="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label class="text-xs text-muted-foreground uppercase">{{ t('bookings.name', 'Full Name') }}</Label>
                <div class="font-medium mt-1">{{ booking.guest.name }}</div>
              </div>
              <div>
                <Label class="text-xs text-muted-foreground uppercase">{{ t('bookings.email', 'Email Address') }}</Label>
                <div class="font-medium mt-1">{{ booking.guest.email || '—' }}</div>
              </div>
              <div>
                <Label class="text-xs text-muted-foreground uppercase">{{ t('bookings.phone', 'Phone Number') }}</Label>
                <div class="font-medium mt-1" dir="ltr">{{ booking.guest.phone || '—' }}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="pb-4 border-b border-border/50">
              <CardTitle class="text-lg flex items-center gap-2">
                <HugeiconsIcon :icon="Building04Icon" :size="20" class="text-primary" />
                {{ t('bookings.stay_details', 'Stay Details') }}
              </CardTitle>
            </CardHeader>
            <CardContent class="pt-4 space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label class="text-xs text-muted-foreground uppercase">{{ t('bookings.hotel', 'Hotel') }}</Label>
                  <div class="font-medium mt-1">{{ booking.hotel_name || '—' }}</div>
                </div>
                <div>
                  <Label class="text-xs text-muted-foreground uppercase">{{ t('bookings.room_type', 'Room Type') }}</Label>
                  <div class="font-medium mt-1">{{ booking.room.name }} (x{{ booking.room.rooms_count }})</div>
                </div>
                <div>
                  <Label class="text-xs text-muted-foreground uppercase">{{ t('bookings.check_in', 'Check In') }}</Label>
                  <div class="font-medium mt-1">{{ booking.check_in }}</div>
                </div>
                <div>
                  <Label class="text-xs text-muted-foreground uppercase">{{ t('bookings.check_out', 'Check Out') }}</Label>
                  <div class="font-medium mt-1">{{ booking.check_out }}</div>
                </div>
                <div>
                  <Label class="text-xs text-muted-foreground uppercase">{{ t('bookings.guests', 'Guests') }}</Label>
                  <div class="font-medium mt-1">{{ booking.room.guests_count }} {{ t('bookings.guests', 'Guests') }}</div>
                </div>
                <div>
                  <Label class="text-xs text-muted-foreground uppercase">{{ t('bookings.nights', 'Nights') }}</Label>
                  <div class="font-medium mt-1">{{ booking.nights_count }} {{ t('bookings.nights', 'Nights') }}</div>
                </div>
              </div>
              
              <div v-if="booking.special_requests" class="pt-4 border-t border-border/50">
                <Label class="text-xs text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                  <HugeiconsIcon :icon="NoteIcon" :size="14" />
                  {{ t('bookings.special_requests', 'Special Requests') }}
                </Label>
                <div class="text-sm bg-muted/50 p-3 rounded-lg mt-1">
                  {{ booking.special_requests }}
                </div>
              </div>

              <div v-if="booking.rejection_reason" class="pt-4 border-t border-border/50">
                <Label class="text-xs text-red-500 uppercase mb-2 flex items-center gap-1.5 font-semibold">
                  <HugeiconsIcon :icon="Cancel01Icon" :size="14" />
                  {{ t('bookings.rejection_reason', 'Rejection Reason') }}
                </Label>
                <div class="text-sm bg-red-500/10 text-red-600 p-3 rounded-lg mt-1">
                  {{ booking.rejection_reason }}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Right Column: Payment & ID -->
        <div class="col-span-1 space-y-6">
          <Card>
            <CardHeader class="pb-4 border-b border-border/50">
              <CardTitle class="text-lg flex items-center gap-2">
                <HugeiconsIcon :icon="CreditCardIcon" :size="20" class="text-primary" />
                {{ t('bookings.payment_details', 'Payment Summary') }}
              </CardTitle>
            </CardHeader>
            <CardContent class="pt-4 space-y-4">
              <div class="flex justify-between items-center py-2 border-b border-border/50">
                <span class="text-sm text-muted-foreground">{{ t('bookings.payment_method', 'Method') }}</span>
                <span class="font-medium capitalize">{{ booking.payment.method }}</span>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-base font-semibold">{{ t('bookings.total_price', 'Total Price') }}</span>
                <span class="text-lg font-bold text-primary">{{ booking.price }}</span>
              </div>
            </CardContent>
          </Card>

          <Card v-if="booking.id_card.has_file || booking.id_card.number">
            <CardHeader class="pb-4 border-b border-border/50">
              <CardTitle class="text-lg flex items-center gap-2">
                <HugeiconsIcon :icon="Contact01Icon" :size="20" class="text-primary" />
                {{ t('bookings.id_verification', 'ID Verification') }}
              </CardTitle>
            </CardHeader>
            <CardContent class="pt-4 space-y-4">
              <div v-if="booking.id_card.number">
                <Label class="text-xs text-muted-foreground uppercase">{{ t('bookings.id_number', 'ID / Passport Number') }}</Label>
                <div class="font-medium mt-1 font-mono">{{ booking.id_card.number }}</div>
              </div>
              
              <div v-if="booking.id_card.has_file && booking.id_card.url" class="mt-4">
                <Label class="text-xs text-muted-foreground uppercase mb-2 block">{{ t('bookings.id_document', 'Document Image') }}</Label>
                <a :href="booking.id_card.url" target="_blank" class="block rounded-lg border border-border overflow-hidden hover:opacity-90 transition-opacity">
                  <img :src="booking.id_card.url" alt="ID Document" class="w-full h-auto object-cover max-h-48" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </template>
    
    <!-- Confirm Dialog -->
    <AlertDialog :open="isConfirmDialogOpen" @update:open="isConfirmDialogOpen = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ t('bookings.confirm_title', 'Confirm Booking') }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{ t('bookings.confirm_desc', 'Are you sure you want to confirm this booking? The guest will be notified.') }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isConfirming" @click="isConfirmDialogOpen = false">{{ t('actions.cancel', 'Cancel') }}</AlertDialogCancel>
          <Button variant="default" class="bg-emerald-600 hover:bg-emerald-700 text-white" :disabled="isConfirming" @click="confirmBooking">
            <div v-if="isConfirming" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
            {{ isConfirming ? t('common.loading', 'Loading...') : t('actions.confirm', 'Confirm') }}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Reject Dialog -->
    <AlertDialog :open="isRejectDialogOpen" @update:open="isRejectDialogOpen = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ t('bookings.reject_title', 'Reject Booking') }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{ t('bookings.reject_desc', 'Are you sure you want to reject this booking? Please provide a reason to notify the guest.') }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div class="py-4">
          <Label for="reason" class="mb-2 block">{{ t('bookings.reason_label', 'Reason for rejection') }} <span class="text-red-500">*</span></Label>
          <Textarea 
            id="reason" 
            v-model="rejectionReason" 
            :placeholder="t('bookings.reason_placeholder', 'e.g., No rooms available for these dates.')" 
            rows="3" 
            :disabled="isRejecting"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isRejecting" @click="isRejectDialogOpen = false">{{ t('actions.cancel', 'Cancel') }}</AlertDialogCancel>
          <Button variant="destructive" :disabled="isRejecting" @click="rejectBooking">
            <div v-if="isRejecting" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
            {{ isRejecting ? t('common.loading', 'Loading...') : t('actions.reject', 'Reject') }}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  BedIcon,
  Edit02Icon,
  PlusSignIcon,
  Delete02Icon,
  MoreVerticalIcon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'

import { roomsService } from '@/services/roomsService'
import type { Room } from '@/types/entities/room'

import { DataTable } from '@/components/ui/tables'
import { Button } from '@/components/uic/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/uic/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/uic/dropdown-menu'
import RoomForm from './RoomForm.vue'

const props = defineProps<{
  hotelId: number | string
}>()

const { t } = useI18n()
const queryClient = useQueryClient()

const { data, isLoading } = useQuery({
  queryKey: ['rooms', props.hotelId],
  queryFn: () => roomsService.list(props.hotelId, { limit: 100 }),
})

const rooms = computed(() => data.value?.data || [])

const columns = [
  { key: 'name', label: 'rooms.name', className: 'font-semibold' },
  { key: 'capacity', label: 'rooms.capacity', className: 'font-semibold text-center w-[150px]' },
  { key: 'price', label: 'rooms.price', className: 'font-semibold font-mono text-right w-[150px]' },
  { key: 'status', label: 'rooms.status', className: 'font-semibold text-center w-[130px]' },
]

// Modal state
const isFormOpen = ref(false)
const selectedRoom = ref<Room | null>(null)

// Delete state
const isDeleteDialogOpen = ref(false)
const roomToDelete = ref<Room | null>(null)

function openCreateForm() {
  selectedRoom.value = null
  isFormOpen.value = true
}

function openEditForm(room: Room) {
  selectedRoom.value = { ...room }
  isFormOpen.value = true
}

function confirmDelete(room: Room) {
  roomToDelete.value = room
  isDeleteDialogOpen.value = true
}

const { mutate: deleteRoom, isPending: isDeleting } = useMutation({
  mutationFn: () => roomsService.delete(props.hotelId, roomToDelete.value!.id),
  onSuccess: () => {
    toast.success(t('rooms.delete_success', 'Room deleted successfully.'))
    isDeleteDialogOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['rooms', props.hotelId] })
  },
  onError: () => toast.error(t('rooms.delete_error', 'Failed to delete room.')),
})

function getStatusBadgeClass(status?: string) {
  const s = status?.toLowerCase()
  if (s === 'available') return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
  if (s === 'maintenance') return 'border-amber-500/25 bg-amber-500/10 text-amber-400'
  return 'border-rose-500/25 bg-rose-500/10 text-rose-400'
}

function getStatusDotClass(status?: string) {
  const s = status?.toLowerCase()
  if (s === 'available') return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]'
  if (s === 'maintenance') return 'bg-amber-400'
  return 'bg-rose-400'
}

function getStatusLabel(status?: string) {
  const s = status?.toLowerCase()
  if (s === 'available') return t('rooms.status_available', 'Available')
  if (s === 'maintenance') return t('rooms.status_maintenance', 'Maintenance')
  if (s === 'unavailable') return t('rooms.status_unavailable', 'Unavailable')
  return status || '—'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header with Add Room button -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <HugeiconsIcon :icon="BedIcon" :size="18" />
        </div>
        <div>
          <h2 class="text-base font-bold text-foreground">
            {{ t('rooms.title', 'Hotel Rooms') }}
          </h2>
          <p class="text-xs text-muted-foreground">
            {{ rooms.length }} {{ t('rooms.title', 'rooms registered') }}
          </p>
        </div>
      </div>

      <Button
        size="sm"
        class="gap-1.5 rounded-xl text-xs bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:brightness-110"
        @click="openCreateForm"
      >
        <HugeiconsIcon :icon="PlusSignIcon" :size="15" />
        {{ t('rooms.add_room', 'Add Room') }}
      </Button>
    </div>

    <!-- Standard Modern DataTable -->
    <div class="mt-2">
      <DataTable
        :data="rooms as any[]"
        :columns="columns"
        :loading="isLoading"
        searchable
        modern-search
        transparent-container
        separated-records
      >
        <!-- Room Name Column -->
        <template #name="{ row }">
          <div
            class="flex items-center gap-3 cursor-pointer group/room py-1"
            @click="openEditForm(row as any)"
          >
            <div class="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 transition-transform group-hover/room:scale-105">
              <HugeiconsIcon :icon="BedIcon" :size="16" />
            </div>
            <div class="min-w-0">
              <div class="font-semibold text-sm text-foreground group-hover/room:text-primary transition-colors truncate">
                {{ (row as any).name }}
              </div>
              <div class="text-xs text-muted-foreground truncate max-w-[260px] mt-0.5">
                {{ (row as any).description || '—' }}
              </div>
            </div>
          </div>
        </template>

        <!-- Capacity Column -->
        <template #capacity="{ row }">
          <div class="w-full flex justify-center py-1">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/50 border border-border/50 text-foreground">
              <HugeiconsIcon :icon="UserGroupIcon" :size="13" class="text-muted-foreground" />
              <span>{{ (row as any).capacity }} {{ t('rooms.guests', 'Guests') }}</span>
            </span>
          </div>
        </template>

        <!-- Price Column -->
        <template #price="{ row }">
          <div class="w-full text-right py-1">
            <div class="text-sm font-bold tracking-tight text-foreground font-mono">
              {{ (row as any).price }}
            </div>
            <div class="text-[10.5px] text-muted-foreground">
              per night
            </div>
          </div>
        </template>

        <!-- Status Column -->
        <template #status="{ row }">
          <div class="w-full flex justify-center py-1">
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider border select-none transition-colors"
              :class="getStatusBadgeClass((row as any).status)"
            >
              <span
                class="h-1.5 w-1.5 rounded-full me-1.5 shrink-0"
                :class="getStatusDotClass((row as any).status)"
              />
              {{ getStatusLabel((row as any).status) }}
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
              <DropdownMenuContent align="end" class="w-40 rounded-xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-xl">
                <DropdownMenuItem
                  class="cursor-pointer gap-2 text-xs py-2"
                  @click="openEditForm(row as any)"
                >
                  <HugeiconsIcon :icon="Edit02Icon" :size="14" class="text-muted-foreground" />
                  {{ t('actions.edit', 'Edit') }}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  class="cursor-pointer gap-2 text-xs py-2 text-rose-400 focus:text-rose-300 focus:bg-rose-500/10"
                  @click="confirmDelete(row as any)"
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
              <HugeiconsIcon :icon="BedIcon" :size="28" />
            </div>
            <div class="text-center">
              <p class="text-sm font-semibold text-foreground">{{ t('rooms.no_rooms', 'No rooms found for this hotel.') }}</p>
              <Button variant="link" size="sm" class="text-xs text-primary mt-1" @click="openCreateForm">
                {{ t('rooms.create_first', 'Create the first room') }}
              </Button>
            </div>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Room Form Modal -->
    <RoomForm
      v-model:open="isFormOpen"
      :hotel-id="hotelId"
      :room="selectedRoom"
      @saved="queryClient.invalidateQueries({ queryKey: ['rooms', hotelId] })"
    />

    <!-- Delete Confirmation -->
    <AlertDialog :open="isDeleteDialogOpen" @update:open="isDeleteDialogOpen = $event">
      <AlertDialogContent class="border border-border/60 bg-card/95 backdrop-blur-xl">
        <AlertDialogHeader>
          <AlertDialogTitle class="flex items-center gap-2 text-rose-400">
            <div class="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <HugeiconsIcon :icon="Delete02Icon" :size="16" />
            </div>
            {{ t('rooms.delete_title', 'Delete Room') }}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {{ t('rooms.delete_desc', 'Are you sure you want to delete this room? This action cannot be undone and may affect existing bookings.') }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isDeleting" @click="isDeleteDialogOpen = false">{{ t('actions.cancel', 'Cancel') }}</AlertDialogCancel>
          <Button variant="destructive" class="gap-2 shadow-lg shadow-rose-600/20" :disabled="isDeleting" @click="deleteRoom()">
            <div v-if="isDeleting" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {{ isDeleting ? t('common.loading', 'Loading...') : t('actions.delete', 'Delete') }}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

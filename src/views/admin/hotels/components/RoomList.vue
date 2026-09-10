<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  BedDoubleIcon,
  Edit02Icon,
  PlusSignIcon,
  Delete02Icon,
  MoreVerticalIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'

import { roomsService } from '@/services/roomsService'
import type { Room } from '@/types/entities/room'

import { Button } from '@/components/uic/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/uic/table'
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
  queryFn: () => roomsService.list(props.hotelId, { limit: 50 }),
})

const rooms = computed(() => data.value?.data || [])

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
  onError: () => toast.error(t('rooms.delete_error', 'Failed to delete room.'))
})

const getStatusColor = (status: string) => {
  if (status === 'available') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  if (status === 'maintenance') return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  return 'bg-red-500/10 text-red-500 border-red-500/20'
}
</script>

<template>
  <div class="space-y-4 mt-6">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold flex items-center gap-2">
        <HugeiconsIcon :icon="BedDoubleIcon" :size="20" class="text-primary" />
        {{ t('rooms.title', 'Hotel Rooms') }}
      </h2>
      <Button @click="openCreateForm" class="gap-2">
        <HugeiconsIcon :icon="PlusSignIcon" :size="16" />
        {{ t('rooms.add_room', 'Add Room') }}
      </Button>
    </div>

    <div class="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow class="hover:bg-transparent bg-muted/30">
            <TableHead class="font-semibold">{{ t('rooms.name', 'Room Name') }}</TableHead>
            <TableHead class="font-semibold">{{ t('rooms.capacity', 'Capacity') }}</TableHead>
            <TableHead class="font-semibold">{{ t('rooms.price', 'Price') }}</TableHead>
            <TableHead class="font-semibold text-center">{{ t('rooms.status', 'Status') }}</TableHead>
            <TableHead class="w-[100px] text-right">{{ t('common.actions', 'Actions') }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="isLoading">
            <TableCell colspan="5" class="h-32 text-center text-muted-foreground">
              {{ t('common.loading', 'Loading...') }}
            </TableCell>
          </TableRow>
          
          <template v-else-if="rooms.length">
            <TableRow v-for="room in rooms" :key="room.id" class="group">
              <TableCell>
                <div class="font-medium text-primary">{{ room.name }}</div>
                <div class="text-xs text-muted-foreground truncate max-w-[200px]">{{ room.description || '—' }}</div>
              </TableCell>
              <TableCell>
                <div class="text-sm">{{ room.capacity }} {{ t('rooms.guests', 'Guests') }}</div>
              </TableCell>
              <TableCell class="font-medium">
                {{ room.price }}
              </TableCell>
              <TableCell class="text-center">
                <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border capitalize', getStatusColor(room.status)]">
                  {{ room.status }}
                </span>
              </TableCell>
              <TableCell class="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <HugeiconsIcon :icon="MoreVerticalIcon" :size="16" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-[160px]">
                    <DropdownMenuItem @click="openEditForm(room)">
                      <HugeiconsIcon :icon="Edit02Icon" :size="14" class="mr-2" />
                      {{ t('actions.edit', 'Edit') }}
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="confirmDelete(room)" class="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                      <HugeiconsIcon :icon="Delete02Icon" :size="14" class="mr-2" />
                      {{ t('actions.delete', 'Delete') }}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </template>

          <TableRow v-else>
            <TableCell colspan="5" class="h-32 text-center text-muted-foreground">
              <div class="flex flex-col items-center justify-center gap-2">
                <HugeiconsIcon :icon="BedDoubleIcon" :size="32" class="opacity-20" />
                <p>{{ t('rooms.no_rooms', 'No rooms found for this hotel.') }}</p>
                <Button variant="link" @click="openCreateForm">{{ t('rooms.create_first', 'Create the first room') }}</Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ t('rooms.delete_title', 'Delete Room') }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{ t('rooms.delete_desc', 'Are you sure you want to delete this room? This action cannot be undone and may affect existing bookings.') }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isDeleting" @click="isDeleteDialogOpen = false">{{ t('actions.cancel', 'Cancel') }}</AlertDialogCancel>
          <Button variant="destructive" :disabled="isDeleting" @click="deleteRoom()">
            <div v-if="isDeleting" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
            {{ isDeleting ? t('common.loading', 'Loading...') : t('actions.delete', 'Delete') }}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

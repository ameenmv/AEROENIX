<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMutation } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { Tick02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

import { roomsService } from '@/services/roomsService'
import type { Room, RoomCreatePayload } from '@/types/entities/room'

import { Button } from '@/components/uic/button'
import { Input } from '@/components/uic/input'
import { Textarea } from '@/components/uic/textarea'
import { Label } from '@/components/uic/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/uic/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/uic/select'

const props = defineProps<{
  open: boolean
  hotelId: number | string
  room: Room | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'saved': []
}>()

const { t } = useI18n()

const form = ref<RoomCreatePayload>({
  name: '',
  description: '',
  price: 0,
  capacity: 2,
  status: 'available',
})

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (props.room) {
      form.value = {
        name: props.room.name,
        description: props.room.description || '',
        price: props.room.price,
        capacity: props.room.capacity,
        status: props.room.status,
      }
    } else {
      form.value = {
        name: '',
        description: '',
        price: 0,
        capacity: 2,
        status: 'available',
      }
    }
  }
})

const { mutate: submitForm, isPending } = useMutation({
  mutationFn: async (payload: RoomCreatePayload) => {
    if (props.room) {
      return await roomsService.update(props.hotelId, props.room.id, payload)
    } else {
      return await roomsService.create(props.hotelId, payload)
    }
  },
  onSuccess: () => {
    toast.success(props.room ? t('rooms.update_success', 'Room updated successfully.') : t('rooms.create_success', 'Room created successfully.'))
    emit('saved')
    emit('update:open', false)
  },
  onError: () => {
    toast.error(props.room ? t('rooms.update_error', 'Failed to update room.') : t('rooms.create_error', 'Failed to create room.'))
  }
})

function handleSubmit() {
  if (!form.value.name) {
    toast.error(t('rooms.name_required', 'Room name is required.'))
    return
  }
  submitForm(form.value)
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{{ room ? t('rooms.edit_room', 'Edit Room') : t('rooms.add_room', 'Add Room') }}</DialogTitle>
        <DialogDescription>
          {{ t('rooms.form_desc', 'Fill in the details for the hotel room.') }}
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="name">{{ t('rooms.name', 'Room Name') }} <span class="text-red-500">*</span></Label>
          <Input id="name" v-model="form.name" :placeholder="t('rooms.name_placeholder', 'e.g., Deluxe Double Room')" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label for="price">{{ t('rooms.price', 'Price / Night') }} <span class="text-red-500">*</span></Label>
            <Input id="price" type="number" v-model="form.price" min="0" step="0.01" />
          </div>
          <div class="grid gap-2">
            <Label for="capacity">{{ t('rooms.capacity', 'Max Guests') }} <span class="text-red-500">*</span></Label>
            <Input id="capacity" type="number" v-model="form.capacity" min="1" />
          </div>
        </div>

        <div class="grid gap-2">
          <Label for="status">{{ t('rooms.status', 'Status') }}</Label>
          <Select v-model="form.status">
            <SelectTrigger id="status">
              <SelectValue :placeholder="t('rooms.status', 'Status')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">{{ t('rooms.status_available', 'Available') }}</SelectItem>
              <SelectItem value="maintenance">{{ t('rooms.status_maintenance', 'Maintenance') }}</SelectItem>
              <SelectItem value="unavailable">{{ t('rooms.status_unavailable', 'Unavailable') }}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="grid gap-2">
          <Label for="description">{{ t('rooms.description', 'Description') }}</Label>
          <Textarea 
            id="description" 
            v-model="form.description" 
            :placeholder="t('rooms.desc_placeholder', 'Describe the room features and amenities...')" 
            rows="3" 
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" :disabled="isPending" @click="emit('update:open', false)">
          {{ t('actions.cancel', 'Cancel') }}
        </Button>
        <Button class="gap-2" :disabled="isPending" @click="handleSubmit">
          <div v-if="isPending" class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <HugeiconsIcon v-else :icon="Tick02Icon" :size="16" />
          {{ isPending ? t('common.saving', 'Saving...') : t('actions.save', 'Save Room') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

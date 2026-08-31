<script setup lang="ts">
import { ref } from 'vue'
import { Loader2Icon } from 'lucide-vue-next'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/uic/alert-dialog'
import { Button } from '@/components/uic/button'

const props = withDefaults(
  defineProps<{
    show: boolean
    title?: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
    /** 'destructive' (red) or 'default' (primary/green) */
    variant?: 'destructive' | 'default'
  }>(),
  {
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmLabel: 'Yes, Confirm',
    cancelLabel: 'Cancel',
    variant: 'destructive',
  },
)
const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const loading = ref(false)

function handleOpenChange(open: boolean) {
  if (!open && !loading.value) {
    emit('cancel')
  }
}

async function handleConfirm() {
  loading.value = true
  try {
    emit('confirm')
  }
  finally {
    // Loading state will be cleared when the parent calls cancel() which closes the modal
    // We add a safety timeout in case the parent forgets
    setTimeout(() => {
      loading.value = false
    }, 10000)
  }
}

// Reset loading when modal closes
import { watch } from 'vue'
watch(() => props.show, (newVal) => {
  if (!newVal) {
    loading.value = false
  }
})
</script>

<template>
  <AlertDialog :open="show" @update:open="handleOpenChange">
    <AlertDialogContent class="rounded-[16px]">
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription class="text-muted-foreground">
          {{ message }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <Button
          variant="outline"
          :disabled="loading"
          @click="emit('cancel')"
        >
          {{ cancelLabel }}
        </Button>
        <Button
          :variant="props.variant === 'default' ? 'default' : 'destructive'"
          :disabled="loading"
          :class="props.variant === 'default' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''"
          @click="handleConfirm"
        >
          <Loader2Icon v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          {{ confirmLabel }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

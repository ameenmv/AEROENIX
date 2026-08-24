<script setup lang="ts">
/**
 * ConfirmDialog — pre-configured confirmation modal.
 * Convenience wrapper around shadcn AlertDialog for approve/reject/delete actions.
 * Supports optional textarea for rejection reasons.
 */
import type { HTMLAttributes } from 'vue'
import { ref } from 'vue'
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
import { Spinner } from '@/components/uic/spinner'
import { Textarea } from '@/components/uic/textarea'
import { cn } from '@/utils/cn'

const props = withDefaults(
  defineProps<{
    /** v-model for open state */
    open?: boolean
    /** Dialog title */
    title?: string
    /** Dialog description */
    description?: string
    /** Confirm button text */
    confirmText?: string
    /** Cancel button text */
    cancelText?: string
    /** Confirm button variant */
    confirmVariant?: 'default' | 'destructive'
    /** Show textarea for reason input */
    showReason?: boolean
    /** Reason textarea placeholder */
    reasonPlaceholder?: string
    /** Reason textarea label */
    reasonLabel?: string
    /** Loading state for confirm button */
    loading?: boolean
    class?: HTMLAttributes['class']
  }>(),
  {
    open: false,
    title: 'Confirm',
    description: 'Are you sure you want to proceed?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmVariant: 'default',
    showReason: false,
    reasonPlaceholder: 'Enter your reason...',
    reasonLabel: '',
    loading: false,
  },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  'confirm': [reason: string]
  'cancel': []
}>()

const reason = ref('')

function onConfirm() {
  emit('confirm', reason.value)
}

function onCancel() {
  reason.value = ''
  emit('cancel')
  emit('update:open', false)
}

function onOpenChange(open: boolean) {
  if (!open) {
    reason.value = ''
  }
  emit('update:open', open)
}
</script>

<template>
  <AlertDialog :open="open" @update:open="onOpenChange">
    <AlertDialogContent :class="cn(props.class)">
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription>{{ description }}</AlertDialogDescription>
      </AlertDialogHeader>

      <!-- Optional reason textarea -->
      <div v-if="showReason" class="py-2">
        <label v-if="reasonLabel" class="text-sm font-medium text-foreground mb-1.5 block">
          {{ reasonLabel }}
        </label>
        <Textarea
          v-model="reason"
          :placeholder="reasonPlaceholder"
          :rows="3"
        />
      </div>

      <!-- Extra slot -->
      <slot />

      <AlertDialogFooter>
        <AlertDialogCancel :disabled="loading" @click="onCancel">
          {{ cancelText }}
        </AlertDialogCancel>
        <AlertDialogAction
          :class="cn(
            confirmVariant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          )"
          :disabled="loading || (showReason && !reason.trim())"
          @click.prevent="onConfirm"
        >
          <Spinner v-if="loading" class="mr-1.5 size-3.5" />
          {{ confirmText }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

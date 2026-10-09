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
    <AlertDialogContent class="cm-content">
      <AlertDialogHeader>
        <AlertDialogTitle class="cm-title">
          {{ title }}
        </AlertDialogTitle>
        <AlertDialogDescription class="cm-desc">
          {{ message }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter class="cm-footer">
        <Button
          variant="ghost"
          class="cm-btn-cancel"
          :disabled="loading"
          @click="emit('cancel')"
        >
          {{ cancelLabel }}
        </Button>
        <Button
          :variant="props.variant === 'default' ? 'default' : 'destructive'"
          class="cm-btn-confirm"
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

<style scoped>
.cm-content {
  border-radius: 16px !important;
  padding: 20px 24px !important;
  max-width: 420px;
}

.cm-title {
  font-size: 15px;
  font-weight: 700;
  color: hsl(var(--foreground));
}

.cm-desc {
  font-size: 13px;
  line-height: 1.5;
  color: hsl(var(--muted-foreground));
  margin-top: 4px;
}

.cm-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 12px;
  padding-top: 0;
}

.cm-btn-cancel {
  border-radius: 10px !important;
  font-weight: 600;
  font-size: 13px;
  height: 36px;
  padding: 0 16px;
  color: hsl(var(--muted-foreground));
}
.cm-btn-cancel:hover {
  color: hsl(var(--foreground));
}

.cm-btn-confirm {
  border-radius: 10px !important;
  font-weight: 600;
  font-size: 13px;
  height: 36px;
  padding: 0 20px;
}
</style>

<script setup lang="ts">
import type { Component } from 'vue'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed } from 'vue'
import { Button as Btn } from '@/components/uic/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/uic/dialog'

interface Action {
  component?: string | Component
  label?: string
  props?: Record<string, unknown>
  onClick?: () => void
}
const props = withDefaults(
  defineProps<{
    show?: boolean
    title?: string
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full'
    closeable?: boolean
    actions?: Action[]
    noPadding?: boolean
  }>(),
  {
    show: false,
    maxWidth: 'md',
    closeable: true,
    actions: () => [],
    noPadding: false,
    title: '',
  },
)
const emit = defineEmits(['close'])
const maxWidthClass = computed(() => {
  return {
    'sm': 'sm:max-w-sm',
    'md': 'sm:max-w-md',
    'lg': 'sm:max-w-lg',
    'xl': 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '4xl': 'sm:max-w-4xl',
    '6xl': 'sm:max-w-6xl',
    '7xl': 'sm:max-w-7xl',
    'full': 'sm:max-w-[95%]',
  }[props.maxWidth]
})
function handleOpenChange(open: boolean) {
  if (!open) {
    emit('close')
  }
}
</script>

<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogContent
      class="rounded-[16px] p-0 gap-0"
      :class="[maxWidthClass]"
      :hide-close="!closeable"
    >
      <DialogHeader
        class="px-6 h-[78px] flex flex-row items-center justify-between border-b border-border bg-accent rounded-t-[16px]"
      >
        <DialogTitle v-if="title" class="text-2xl font-bold text-foreground leading-[28px]">
          {{ title }}
        </DialogTitle>
        <slot name="header" />
        <DialogDescription class="sr-only">
          {{ title || 'Dialog' }}
        </DialogDescription>
        <DialogClose
          v-if="closeable"
          class="w-10 h-10 flex items-center justify-center rounded-10 hover:bg-muted text-foreground transition-all active:scale-90"
        >
          <HugeiconsIcon :icon="Cancel01Icon" :size="24" />
        </DialogClose>
      </DialogHeader>
      <div class="overflow-y-auto max-h-[85vh]" :class="[!noPadding && 'px-6 py-6']">
        <slot />
      </div>
      <DialogFooter
        v-if="$slots.footer || actions.length > 0"
        class="px-6 h-[77px] flex justify-end items-center gap-3 border-t border-border"
      >
        <slot name="footer">
          <component
            :is="btn.component || Btn"
            v-for="(btn, index) in actions"
            :key="index"
            v-bind="btn.props"
            @click="btn.onClick"
          >
            {{ btn.label }}
          </component>
        </slot>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

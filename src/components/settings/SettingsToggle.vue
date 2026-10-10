<script setup lang="ts">
/**
 * SettingsToggle — a custom toggle switch built without reka-ui.
 * Pure div-based, no <button>, no <label> conflicts.
 * Emits `update:checked` with the new boolean value on every click.
 */
import type { HTMLAttributes } from 'vue'
import { cn } from '@/utils/cn'

const props = defineProps<{
  checked?: boolean
  disabled?: boolean
  class?: HTMLAttributes['class']
}>()

const emit = defineEmits<{
  (e: 'update:checked', value: boolean): void
}>()

function toggle() {
  if (props.disabled) return
  emit('update:checked', !props.checked)
}
</script>

<template>
  <div
    role="switch"
    tabindex="0"
    :aria-checked="!!checked"
    :aria-disabled="disabled || undefined"
    :class="cn(
      'relative inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-xs transition-all duration-200 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring',
      checked
        ? 'bg-primary'
        : 'bg-input dark:bg-input/80',
      disabled && 'opacity-50 cursor-not-allowed',
      props.class,
    )"
    @click.stop="toggle"
    @keydown.enter.prevent="toggle"
    @keydown.space.prevent="toggle"
  >
    <span
      :class="cn(
        'pointer-events-none block size-4 rounded-full ring-0 transition-transform duration-200',
        checked
          ? 'bg-primary-foreground ltr:translate-x-[calc(100%-2px)] rtl:-translate-x-[calc(100%-2px)]'
          : 'bg-background dark:bg-foreground translate-x-0',
      )"
    />
  </div>
</template>

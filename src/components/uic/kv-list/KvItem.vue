<script setup lang="ts">
/**
 * KvItem — single key-value row: label on the left, value on the right.
 */
import type { HTMLAttributes } from 'vue'
import type { KvItemVariants } from './variants'
import { cn } from '@/utils/cn'
import { kvItemVariants } from './variants'

const props = withDefaults(
  defineProps<{
    /** Key label */
    label?: string
    /** Value (alternative to slot) */
    value?: string | number
    /** Layout mode */
    layout?: KvItemVariants['layout']
    /** Make value monospaced */
    mono?: boolean
    class?: HTMLAttributes['class']
  }>(),
  {
    label: '',
    value: undefined,
    layout: 'between',
    mono: false,
  },
)
</script>

<template>
  <div
    data-slot="kv-item"
    :class="cn(kvItemVariants({ layout }), props.class)"
  >
    <!-- Label -->
    <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">
      <slot name="label">{{ label }}</slot>
    </span>

    <!-- Value -->
    <span
      :class="cn(
        'text-sm font-medium text-foreground truncate',
        mono && 'font-mono tabular-nums',
      )"
    >
      <slot>{{ value ?? '—' }}</slot>
    </span>
  </div>
</template>

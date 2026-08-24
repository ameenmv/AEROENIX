<script setup lang="ts">
/**
 * StatusBadge — colored badge with leading dot indicator.
 * Maps status states (success/warning/danger/info/neutral) to visual styles.
 * Used for pending/active/rejected/deactivated across all SAAF modules.
 */
import type { HTMLAttributes } from 'vue'
import type { StatusBadgeVariants } from './variants'
import { cn } from '@/utils/cn'
import { statusBadgeVariants, statusDotVariants } from './variants'

const props = withDefaults(
  defineProps<{
    /** Status variant */
    variant?: StatusBadgeVariants['variant']
    /** Size */
    size?: StatusBadgeVariants['size']
    /** Show dot indicator */
    dot?: boolean
    /** Pulse animation on dot */
    pulse?: boolean
    /** Text label (alternative to slot) */
    label?: string
    class?: HTMLAttributes['class']
  }>(),
  {
    variant: 'neutral',
    size: 'default',
    dot: true,
    pulse: false,
    label: '',
  },
)
</script>

<template>
  <span
    data-slot="status-badge"
    :class="cn(statusBadgeVariants({ variant, size }), props.class)"
  >
    <span
      v-if="dot"
      :class="statusDotVariants({ variant, size, pulse })"
    />
    <slot>{{ label }}</slot>
  </span>
</template>

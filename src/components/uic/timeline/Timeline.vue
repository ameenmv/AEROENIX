<script setup lang="ts">
/**
 * Timeline — vertical timeline for audit trails, activity logs, and event history.
 * Used across 20+ SAAF modules for audit trail display.
 * Composes TimelineItem children with a connecting line.
 */
import type { HTMLAttributes } from 'vue'
import type { TimelineVariants } from './variants'
import { cn } from '@/utils/cn'
import { timelineVariants } from './variants'

const props = withDefaults(
  defineProps<{
    spacing?: TimelineVariants['spacing']
    /** Show connecting line between items */
    line?: boolean
    class?: HTMLAttributes['class']
  }>(),
  {
    spacing: 'default',
    line: true,
  },
)
</script>

<template>
  <ul
    data-slot="timeline"
    :class="
      cn(timelineVariants({ spacing }), 'list-none m-0 p-0', line && 'timeline-line', props.class)
    "
  >
    <slot />
  </ul>
</template>

<style scoped>
.timeline-line :deep([data-slot='timeline-item']:not(:last-child)) {
  position: relative;
}
.timeline-line :deep([data-slot='timeline-item']:not(:last-child))::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 1rem;
  bottom: -0.5rem;
  width: 1px;
  background: hsl(var(--border));
}
</style>

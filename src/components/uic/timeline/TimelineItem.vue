<script setup lang="ts">
/**
 * TimelineItem — a single entry in the Timeline with a colored dot,
 * title, timestamp, optional user, and optional body.
 */
import type { HTMLAttributes } from 'vue'
import type { TimelineDotVariants } from './variants'
import { cn } from '@/utils/cn'
import { timelineDotVariants } from './variants'

const props = withDefaults(
  defineProps<{
    /** Title / action label */
    title?: string
    /** Timestamp string */
    timestamp?: string
    /** User who performed the action */
    user?: string
    /** Dot variant color */
    variant?: TimelineDotVariants['variant']
    /** Dot size */
    size?: TimelineDotVariants['size']
    class?: HTMLAttributes['class']
  }>(),
  {
    title: '',
    timestamp: '',
    user: '',
    variant: 'neutral',
    size: 'default',
  },
)
</script>

<template>
  <li
    data-slot="timeline-item"
    :class="cn('flex items-start gap-3 relative', props.class)"
  >
    <!-- Dot -->
    <span
      data-slot="timeline-dot"
      :class="cn(timelineDotVariants({ variant, size }), 'mt-1.5')"
    />

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <div class="flex items-baseline gap-2 flex-wrap">
        <span class="text-sm font-semibold text-foreground">
          <slot name="title">{{ title }}</slot>
        </span>
      </div>
      <div v-if="timestamp || user" class="text-xs text-muted-foreground mt-0.5">
        <span v-if="timestamp">{{ timestamp }}</span>
        <span v-if="timestamp && user">{{ $t('common.separator', ' · ') }}</span>
        <span v-if="user">{{ user }}</span>
      </div>

      <!-- Body slot for extra content (e.g. rejection reason) -->
      <div v-if="$slots.default" class="mt-2 text-sm text-foreground">
        <slot />
      </div>
    </div>
  </li>
</template>

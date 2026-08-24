<script setup lang="ts">
/**
 * KpiGrid — responsive grid layout for StatCard tiles.
 * Uses CSS grid with auto-fit for flexible column layout.
 */
import type { HTMLAttributes } from 'vue'
import type { KpiGridVariants } from './variants'
import { computed } from 'vue'
import { cn } from '@/utils/cn'
import { kpiGridVariants } from './variants'

const props = withDefaults(
  defineProps<{
    /** Preferred column count (or "auto" for auto-fit) */
    columns?: KpiGridVariants['columns']
    /** Gap between items */
    gap?: KpiGridVariants['gap']
    /** Min track width for auto-fit mode */
    min?: string
    class?: HTMLAttributes['class']
  }>(),
  {
    columns: 4,
    gap: 'default',
    min: '220px',
  },
)

const autoFitStyle = computed(() =>
  props.columns === 'auto'
    ? { gridTemplateColumns: `repeat(auto-fit, minmax(${props.min}, 1fr))` }
    : undefined,
)
</script>

<template>
  <div
    data-slot="kpi-grid"
    :class="cn(kpiGridVariants({ columns, gap }), props.class)"
    :style="autoFitStyle"
  >
    <slot />
  </div>
</template>

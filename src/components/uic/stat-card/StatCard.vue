<script setup lang="ts">
/**
 * StatCard — KPI tile: label, big number, optional trend badge, optional sparkline.
 * Composes shadcn Card + Badge for consistent design system integration.
 */
import type { HTMLAttributes } from 'vue'
import type { StatCardVariants } from './variants'
import { TrendingDown, TrendingUp } from 'lucide-vue-next'
import { computed } from 'vue'
import { Badge } from '@/components/uic/badge'
import { Card, CardContent, CardHeader } from '@/components/uic/card'
import { Sparkline } from '@/components/uic/sparkline'
import { cn } from '@/utils/cn'
import { statCardVariants } from './variants'

const props = withDefaults(
  defineProps<{
    /** KPI label */
    label: string
    /** Main numeric value */
    value: string | number
    /** Prefix before value (e.g. "$") */
    prefix?: string
    /** Suffix after value (e.g. "%") */
    suffix?: string
    /** Percentage change vs previous period */
    delta?: number | null
    /** Caption next to delta (e.g. "vs last month") */
    deltaLabel?: string
    /** Trend override */
    trend?: 'up' | 'down' | 'neutral'
    /** Sparkline data points */
    sparkData?: number[]
    /** Emoji or short text for the icon badge */
    icon?: string
    /** Accent stripe color */
    accent?: StatCardVariants['accent']
    /** Size variant */
    size?: StatCardVariants['size']
    class?: HTMLAttributes['class']
  }>(),
  {
    prefix: '',
    suffix: '',
    delta: null,
    deltaLabel: '',
    trend: undefined,
    sparkData: undefined,
    icon: '',
    accent: 'default',
    size: 'default',
  },
)

const resolvedTrend = computed(() => {
  if (props.trend)
    return props.trend
  if (props.delta === null || props.delta === undefined)
    return 'neutral'
  if (props.delta > 0)
    return 'up'
  if (props.delta < 0)
    return 'down'
  return 'neutral'
})

const formattedDelta = computed(() => {
  if (props.delta === null || props.delta === undefined)
    return null
  const sign = props.delta > 0 ? '+' : ''
  return `${sign}${Number(props.delta).toFixed(1)}%`
})

const deltaBadgeVariant = computed(() => {
  switch (resolvedTrend.value) {
    case 'up':
      return 'success' as const
    case 'down':
      return 'destructive' as const
    default:
      return 'secondary' as const
  }
})
</script>

<template>
  <Card data-slot="stat-card" :class="cn(statCardVariants({ accent, size }), props.class)">
    <CardHeader class="p-0">
      <!-- Head: icon + label -->
      <div class="flex items-center gap-2.5">
        <div
          v-if="$slots.icon || icon"
          class="w-8 h-8 rounded-md bg-primary/10 text-primary inline-flex items-center justify-center shrink-0"
        >
          <slot name="icon">
            <span class="text-base leading-none">{{ icon }}</span>
          </slot>
        </div>
        <span class="text-sm font-medium text-muted-foreground tracking-tight">{{ label }}</span>
      </div>
    </CardHeader>

    <CardContent class="p-0">
      <!-- Value row -->
      <div class="flex items-end justify-between gap-3">
        <span
          class="text-3xl font-semibold tracking-tight text-foreground leading-none tabular-nums"
        >
          <span v-if="prefix" class="text-lg font-medium text-muted-foreground mx-0.5">{{
            prefix
          }}</span>{{ value
          }}<span v-if="suffix" class="text-lg font-medium text-muted-foreground mx-0.5">{{
            suffix
          }}</span>
        </span>

        <Sparkline
          v-if="sparkData && sparkData.length > 1"
          :data="sparkData"
          :trend="resolvedTrend"
          :width="84"
          :height="28"
        />
      </div>

      <!-- Delta -->
      <div
        v-if="formattedDelta !== null || deltaLabel"
        class="flex items-center gap-1.5 text-xs mt-3"
      >
        <Badge
          v-if="formattedDelta !== null"
          :variant="deltaBadgeVariant"
          class="inline-flex items-center gap-0.5 font-semibold text-[10px] px-1.5 py-0.5 rounded-full"
        >
          <TrendingUp v-if="resolvedTrend === 'up'" :size="10" />
          <TrendingDown v-else-if="resolvedTrend === 'down'" :size="10" />
          {{ formattedDelta }}
        </Badge>
        <span v-if="deltaLabel" class="text-muted-foreground">{{ deltaLabel }}</span>
      </div>

      <!-- Extra slot -->
      <div
        v-if="$slots.default"
        class="mt-2 pt-2 border-t border-dashed border-border text-sm text-muted-foreground"
      >
        <slot />
      </div>
    </CardContent>
  </Card>
</template>

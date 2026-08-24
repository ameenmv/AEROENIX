<script setup lang="ts">
/**
 * Sparkline — tiny inline SVG line+area chart, no chart library needed.
 *
 * Props:
 *   data: number[]        — ≥2 data points
 *   width/height: number  — SVG viewBox dimensions
 *   strokeWidth: number
 *   trend: "auto"|"up"|"down"|"neutral" — color hint
 *   filled: boolean       — area gradient fill under line
 *   showLastDot: boolean  — highlight the last data point
 */
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { cn } from '@/utils/cn'

const props = withDefaults(
  defineProps<{
    data: number[]
    width?: number
    height?: number
    strokeWidth?: number
    trend?: 'auto' | 'up' | 'down' | 'neutral'
    filled?: boolean
    showLastDot?: boolean
    class?: HTMLAttributes['class']
  }>(),
  {
    width: 96,
    height: 28,
    strokeWidth: 1.5,
    trend: 'auto',
    filled: true,
    showLastDot: true,
  },
)

const PADDING = 2

const resolvedTrend = computed(() => {
  if (props.trend !== 'auto')
    return props.trend
  if (!props.data || props.data.length < 2)
    return 'neutral'
  const first = props.data[0]!
  const last = props.data[props.data.length - 1]!
  if (last > first)
    return 'up'
  if (last < first)
    return 'down'
  return 'neutral'
})

const trendColors = computed(() => {
  switch (resolvedTrend.value) {
    case 'up':
      return { stroke: 'rgb(34 197 94)', fill: 'rgba(34, 197, 94, 0.12)' }
    case 'down':
      return { stroke: 'rgb(239 68 68)', fill: 'rgba(239, 68, 68, 0.12)' }
    default:
      return { stroke: 'rgb(148 163 184)', fill: 'rgba(148, 163, 184, 0.08)' }
  }
})

const points = computed(() => {
  const data = props.data
  if (!data?.length)
    return { line: '', area: '', last: { x: 0, y: 0 } }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const stepX = (props.width - PADDING * 2) / Math.max(data.length - 1, 1)
  const innerH = props.height - PADDING * 2

  const coords = data.map((v, i) => ({
    x: PADDING + i * stepX,
    y: PADDING + innerH - ((v - min) / span) * innerH,
  }))

  const line = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
    .join(' ')

  const lastCoord = coords[coords.length - 1]!
  const firstCoord = coords[0]!
  const bottom = (props.height - PADDING).toFixed(2)
  const area = `${line} L ${lastCoord.x.toFixed(2)} ${bottom} L ${firstCoord.x.toFixed(2)} ${bottom} Z`

  return { line, area, last: lastCoord }
})
</script>

<template>
  <svg
    data-slot="sparkline"
    :class="cn('inline-block align-middle overflow-visible', props.class)"
    :viewBox="`0 0 ${width} ${height}`"
    :width="width"
    :height="height"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path
      v-if="filled"
      :d="points.area"
      :fill="trendColors.fill"
    />
    <path
      :d="points.line"
      fill="none"
      :stroke="trendColors.stroke"
      :stroke-width="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle
      v-if="showLastDot"
      :cx="points.last.x"
      :cy="points.last.y"
      r="2"
      :fill="trendColors.stroke"
    />
  </svg>
</template>

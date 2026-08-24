<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import type { HTMLAttributes } from 'vue'
import type { ChartVariants } from './variants'
import type { ChartColorScheme } from '@/composables/useChartTheme'
import { computed } from 'vue'
import Chart from './Chart.vue'

const props = withDefaults(
  defineProps<{
    series?: ApexAxisChartSeries
    categories?: string[]
    height?: number | string
    title?: string
    description?: string
    colorScheme?: ChartColorScheme
    size?: ChartVariants['size']
    rounded?: ChartVariants['rounded']
    options?: ApexOptions
    /** Stroke width */
    strokeWidth?: number
    /** Curve type */
    curve?: 'smooth' | 'straight' | 'stepline' | 'monotoneCubic'
    /** Show markers / data points */
    markers?: boolean
    class?: HTMLAttributes['class']
  }>(),
  {
    series: () => [],
    categories: () => [],
    height: 300,
    title: '',
    description: '',
    colorScheme: 'default',
    size: 'default',
    rounded: 'default',
    options: () => ({}),
    strokeWidth: 2,
    curve: 'smooth',
    markers: false,
  },
)

const lineOptions = computed<ApexOptions>(() => ({
  ...props.options,
  xaxis: {
    ...props.options.xaxis,
    categories: props.categories,
  },
  stroke: {
    curve: props.curve,
    width: props.strokeWidth,
    ...props.options.stroke,
  },
  markers: {
    size: props.markers ? 4 : 0,
    strokeWidth: 2,
    hover: { sizeOffset: 2 },
    ...props.options.markers,
  },
  fill: { opacity: 1 },
}))
</script>

<template>
  <Chart
    type="line"
    :series="series"
    :options="lineOptions"
    :height="height"
    :title="title"
    :description="description"
    :color-scheme="colorScheme"
    :size="size"
    :rounded="rounded"
    :class="props.class"
  >
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </Chart>
</template>

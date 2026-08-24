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
    /** Fill opacity for the radar area */
    fillOpacity?: number
    /** Show markers */
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
    fillOpacity: 0.2,
    markers: true,
  },
)

const radarOptions = computed<ApexOptions>(() => ({
  ...props.options,
  xaxis: {
    ...props.options.xaxis,
    categories: props.categories,
  },
  stroke: {
    width: 2,
    ...props.options.stroke,
  },
  fill: {
    opacity: props.fillOpacity,
    ...props.options.fill,
  },
  markers: {
    size: props.markers ? 3 : 0,
    strokeWidth: 1,
    ...props.options.markers,
  },
  yaxis: {
    show: false,
    ...props.options.yaxis as object,
  },
}))
</script>

<template>
  <Chart
    type="radar"
    :series="series"
    :options="radarOptions"
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

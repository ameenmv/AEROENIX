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
    /** Bar border radius */
    borderRadius?: number
    /** Column width percentage */
    columnWidth?: string
    /** Horizontal bars */
    horizontal?: boolean
    /** Stacked bars */
    stacked?: boolean
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
    borderRadius: 6,
    columnWidth: '50%',
    horizontal: false,
    stacked: false,
  },
)

const barOptions = computed<ApexOptions>(() => ({
  ...props.options,
  chart: {
    ...props.options.chart,
    stacked: props.stacked,
  },
  xaxis: {
    ...props.options.xaxis,
    categories: props.categories,
  },
  plotOptions: {
    bar: {
      borderRadius: props.borderRadius,
      columnWidth: props.columnWidth,
      horizontal: props.horizontal,
      ...props.options.plotOptions?.bar,
    },
  },
}))
</script>

<template>
  <Chart
    type="bar"
    :series="series"
    :options="barOptions"
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

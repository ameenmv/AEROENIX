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
    /** Fill opacity for the area gradient */
    fillOpacity?: number
    /** Whether to show a smooth gradient fill */
    gradient?: boolean
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
    fillOpacity: 0.15,
    gradient: true,
  },
)

const areaOptions = computed<ApexOptions>(() => ({
  ...props.options,
  xaxis: {
    ...props.options.xaxis,
    categories: props.categories,
  },
  stroke: {
    curve: 'smooth',
    width: 2,
    ...props.options.stroke,
  },
  fill: props.gradient
    ? {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          opacityFrom: props.fillOpacity,
          opacityTo: 0.02,
          stops: [0, 100],
        },
        ...props.options.fill,
      }
    : { opacity: props.fillOpacity, ...props.options.fill },
}))
</script>

<template>
  <Chart
    type="area"
    :series="series"
    :options="areaOptions"
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

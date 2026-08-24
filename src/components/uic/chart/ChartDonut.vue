<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import type { HTMLAttributes } from 'vue'
import type { ChartVariants } from './variants'
import type { ChartColorScheme } from '@/composables/useChartTheme'
import { computed } from 'vue'
import Chart from './Chart.vue'

const props = withDefaults(
  defineProps<{
    /** Array of numeric values for each slice */
    series?: number[]
    /** Labels for each slice */
    labels?: string[]
    height?: number | string
    title?: string
    description?: string
    colorScheme?: ChartColorScheme
    size?: ChartVariants['size']
    rounded?: ChartVariants['rounded']
    options?: ApexOptions
    /** Donut hole size percentage */
    donutSize?: string
    /** Show total label inside donut */
    showTotal?: boolean
    class?: HTMLAttributes['class']
  }>(),
  {
    series: () => [],
    labels: () => [],
    height: 300,
    title: '',
    description: '',
    colorScheme: 'default',
    size: 'default',
    rounded: 'default',
    options: () => ({}),
    donutSize: '72%',
    showTotal: true,
  },
)

const donutOptions = computed<ApexOptions>(() => ({
  ...props.options,
  labels: props.labels,
  legend: {
    position: 'bottom' as const,
    horizontalAlign: 'center' as const,
    ...props.options.legend,
  },
  plotOptions: {
    pie: {
      donut: {
        size: props.donutSize,
        labels: {
          show: props.showTotal,
          name: { fontSize: '13px', fontWeight: 600 },
          value: { fontSize: '20px', fontWeight: 700 },
          total: {
            show: props.showTotal,
            label: 'Total',
            fontSize: '12px',
            fontWeight: 500,
          },
        },
        ...props.options.plotOptions?.pie?.donut,
      },
    },
  },
  stroke: { width: 2, colors: ['var(--card, #ffffff)'] },
}))
</script>

<template>
  <Chart
    type="donut"
    :series="series"
    :options="donutOptions"
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

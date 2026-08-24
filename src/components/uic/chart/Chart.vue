<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import type { HTMLAttributes } from 'vue'
import type { ChartVariants } from './variants'
import type { ChartColorScheme } from '@/composables/useChartTheme'
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useChartTheme } from '@/composables/useChartTheme'
import { cn } from '@/utils/cn'
import { chartVariants } from './variants'

const props = withDefaults(
  defineProps<{
    /** ApexCharts chart type */
    type?: string
    /** Data series array */
    series?: ApexOptions['series']
    /** Additional chart options (merged with theme) */
    options?: ApexOptions
    /** Chart height in px */
    height?: number | string
    /** Title displayed above chart */
    title?: string
    /** Subtitle / description */
    description?: string
    /** Color scheme */
    colorScheme?: ChartColorScheme
    /** Size variant */
    size?: ChartVariants['size']
    /** Rounded variant */
    rounded?: ChartVariants['rounded']
    /** Additional class */
    class?: HTMLAttributes['class']
  }>(),
  {
    type: 'area',
    series: () => [],
    options: () => ({}),
    height: 300,
    title: '',
    description: '',
    colorScheme: 'default',
    size: 'default',
    rounded: 'default',
  },
)

const { baseOptions } = useChartTheme(props.colorScheme)

const mergedOptions = computed<ApexOptions>(() => {
  const base = baseOptions.value
  const custom = props.options

  return {
    ...base,
    ...custom,
    chart: {
      ...base.chart,
      ...custom.chart,
      type: props.type as
      | 'area'
      | 'line'
      | 'bar'
      | 'pie'
      | 'donut'
      | 'radialBar'
      | 'scatter'
      | 'bubble'
      | 'heatmap'
      | 'candlestick'
      | 'radar'
      | 'polarArea'
      | 'rangeBar'
      | 'rangeArea'
      | 'treemap'
      | 'boxPlot',
      height: props.height,
    },
    colors: custom.colors || base.colors,
    grid: { ...base.grid, ...custom.grid },
    xaxis: {
      ...base.xaxis,
      ...custom.xaxis,
      labels: {
        ...(base.xaxis as any)?.labels,
        ...(custom.xaxis as any)?.labels,
      },
    },
    yaxis: custom.yaxis || base.yaxis,
    legend: { ...base.legend, ...custom.legend },
    tooltip: { ...base.tooltip, ...custom.tooltip },
    dataLabels: { ...base.dataLabels, ...custom.dataLabels },
    stroke: { ...base.stroke, ...custom.stroke },
    fill: { ...base.fill, ...custom.fill },
    plotOptions: {
      ...base.plotOptions,
      ...custom.plotOptions,
    },
  }
})
</script>

<template>
  <div
    data-slot="chart"
    :class="
      cn(
        'border bg-card text-card-foreground shadow-sm overflow-hidden',
        chartVariants({ size, rounded }),
        props.class,
      )
    "
  >
    <!-- Header -->
    <div v-if="title || description || $slots.header" class="px-5 pt-5 pb-2">
      <slot name="header">
        <h3 v-if="title" class="text-sm font-semibold tracking-tight text-foreground">
          {{ title }}
        </h3>
        <p v-if="description" class="text-xs text-muted-foreground mt-0.5">
          {{ description }}
        </p>
      </slot>
    </div>

    <!-- Chart -->
    <div class="px-3 pb-3">
      <VueApexCharts
        :type="type as any"
        :height="height"
        :options="mergedOptions"
        :series="series"
      />
    </div>

    <!-- Footer slot -->
    <div v-if="$slots.footer" class="px-5 pb-4 pt-1 border-t border-border">
      <slot name="footer" />
    </div>
  </div>
</template>

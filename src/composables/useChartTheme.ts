import type { ApexOptions } from 'apexcharts'
import { computed } from 'vue'
import { useDarkMode } from '@/composables/useDarkMode'

/**
 * Reads a CSS variable value from :root / document.
 * Falls back to `fallback` if the variable is empty.
 */
function cssVar(name: string, fallback = ''): string {
  if (typeof document === 'undefined')
    return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

/**
 * Returns an array of chart palette colors derived from the shadcn CSS vars.
 */
export function useChartColors() {
  return computed<string[]>(() => [
    cssVar('--chart-1', '#6366f1'),
    cssVar('--chart-2', '#22c55e'),
    cssVar('--chart-3', '#3b82f6'),
    cssVar('--chart-4', '#f59e0b'),
    cssVar('--chart-5', '#ef4444'),
    cssVar('--primary', '#fc034c'),
  ])
}

export type ChartColorScheme = 'default' | 'primary' | 'success' | 'warning' | 'mono'

/**
 * Returns a color palette based on a named scheme.
 */
export function getSchemeColors(scheme: ChartColorScheme): string[] {
  switch (scheme) {
    case 'primary':
      return [
        cssVar('--primary', '#fc034c'),
        `${cssVar('--primary', '#fc034c')}cc`,
        `${cssVar('--primary', '#fc034c')}99`,
        `${cssVar('--primary', '#fc034c')}66`,
        `${cssVar('--primary', '#fc034c')}33`,
      ]
    case 'success':
      return ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d']
    case 'warning':
      return ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f']
    case 'mono':
      return [
        cssVar('--foreground', '#1e2025'),
        cssVar('--muted-foreground', '#67748e'),
        cssVar('--border', 'rgba(0,0,0,0.15)'),
        cssVar('--muted', 'rgba(0,0,0,0.05)'),
        cssVar('--accent', '#f1f3f5'),
      ]
    default:
      return [
        cssVar('--chart-1', '#6366f1'),
        cssVar('--chart-2', '#22c55e'),
        cssVar('--chart-3', '#3b82f6'),
        cssVar('--chart-4', '#f59e0b'),
        cssVar('--chart-5', '#ef4444'),
      ]
  }
}

/**
 * Provides a full ApexCharts options object themed to the shadcn design tokens.
 * Merge this with your chart-specific options.
 */
export function useChartTheme(scheme: ChartColorScheme = 'default') {
  const { isDark } = useDarkMode()

  const baseOptions = computed<ApexOptions>(() => {
    const fg = cssVar('--foreground', isDark.value ? '#ffffff' : '#1e2025')
    const mutedFg = cssVar('--muted-foreground', '#67748e')
    const border = cssVar('--border', isDark.value ? 'rgba(238,238,238,0.1)' : 'rgba(0,0,0,0.15)')
    const cardBg = cssVar('--card', isDark.value ? '#242424' : '#ffffff')
    const colors = getSchemeColors(scheme)

    return {
      colors,
      chart: {
        background: 'transparent',
        foreColor: mutedFg,
        fontFamily: cssVar('--font-sans', '\'IBM Plex Sans Arabic\', sans-serif'),
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 600,
          dynamicAnimation: { enabled: true, speed: 350 },
        },
      },
      grid: {
        borderColor: border,
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
      },
      xaxis: {
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: mutedFg, fontSize: '11px', fontWeight: 500 },
        },
      },
      yaxis: {
        labels: {
          style: { colors: mutedFg, fontSize: '11px', fontWeight: 500 },
        },
      },
      legend: {
        labels: { colors: fg },
        fontSize: '12px',
        fontWeight: 500,
        markers: { size: 6, shape: 'circle' as const },
        itemMargin: { horizontal: 12, vertical: 4 },
      },
      tooltip: {
        theme: isDark.value ? 'dark' : 'light',
        style: { fontSize: '12px' },
        y: { formatter: (val: number) => String(val) },
      },
      dataLabels: {
        enabled: false,
        style: { fontSize: '11px', fontWeight: 600, colors: [fg] },
      },
      stroke: {
        curve: 'smooth' as const,
        width: 2,
        lineCap: 'round' as const,
      },
      fill: {
        opacity: 1,
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '50%',
        },
        pie: {
          donut: {
            size: '72%',
            labels: {
              show: true,
              name: { fontSize: '13px', fontWeight: 600, color: fg },
              value: { fontSize: '20px', fontWeight: 700, color: fg },
              total: {
                show: true,
                label: 'Total',
                fontSize: '12px',
                fontWeight: 500,
                color: mutedFg,
              },
            },
          },
        },
        radar: {
          polygons: {
            strokeColors: border,
            connectorColors: border,
            fill: { colors: [cardBg] },
          },
        },
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            chart: { height: 240 },
            legend: { position: 'bottom' },
          },
        },
      ],
    }
  })

  return { baseOptions, isDark }
}

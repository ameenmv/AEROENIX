import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const chartVariants = cva('w-full', {
  variants: {
    size: {
      sm: '[&_.apexcharts-canvas]:!h-[200px]',
      default: '[&_.apexcharts-canvas]:!h-[300px]',
      lg: '[&_.apexcharts-canvas]:!h-[400px]',
      full: '[&_.apexcharts-canvas]:!h-full',
    },
    rounded: {
      default: 'rounded-xl',
      sm: 'rounded-md',
      lg: 'rounded-2xl',
      none: 'rounded-none',
    },
  },
  defaultVariants: {
    size: 'default',
    rounded: 'default',
  },
})

export type ChartVariants = VariantProps<typeof chartVariants>

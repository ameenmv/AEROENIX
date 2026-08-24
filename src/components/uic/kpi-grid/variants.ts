import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const kpiGridVariants = cva('grid w-full', {
  variants: {
    columns: {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      auto: '',
    },
    gap: {
      sm: 'gap-3',
      default: 'gap-4',
      lg: 'gap-6',
    },
  },
  defaultVariants: { columns: 4, gap: 'default' },
})

export type KpiGridVariants = VariantProps<typeof kpiGridVariants>

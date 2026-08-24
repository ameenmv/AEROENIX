import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const filterBarVariants = cva('flex items-center gap-3 flex-wrap', {
  variants: {
    size: {
      sm: 'py-2',
      default: 'py-3',
      lg: 'py-4',
    },
    layout: {
      /** Search left, filter right */
      between: 'justify-between',
      /** All items left-aligned */
      start: 'justify-start',
    },
  },
  defaultVariants: { size: 'default', layout: 'between' },
})

export type FilterBarVariants = VariantProps<typeof filterBarVariants>

import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const spinnerVariants = cva('animate-spin text-muted-foreground', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      default: 'h-5 w-5',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
  },
  defaultVariants: { size: 'default' },
})

export type SpinnerVariants = VariantProps<typeof spinnerVariants>

import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const dialogVariants = cva('', {
  variants: {
    size: {
      sm: '[&_[data-slot=dialog-content]]:max-w-sm',
      default: '[&_[data-slot=dialog-content]]:max-w-lg',
      lg: '[&_[data-slot=dialog-content]]:max-w-2xl',
      xl: '[&_[data-slot=dialog-content]]:max-w-4xl',
      full: '[&_[data-slot=dialog-content]]:max-w-[90vw]',
    },
  },
  defaultVariants: { size: 'default' },
})

export type DialogVariants = VariantProps<typeof dialogVariants>

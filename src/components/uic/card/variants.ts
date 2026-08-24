import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const cardVariants = cva(
  'rounded-xl text-card-foreground',
  {
    variants: {
      variant: {
        default: 'bg-card border shadow-sm',
        outline: 'border bg-transparent',
        ghost: 'bg-transparent border-none shadow-none',
        elevated: 'bg-card shadow-md',
        filled: 'bg-muted border-none',
      },
      padding: {
        none: '',
        sm: '[&_[data-slot=card-content]]:p-4',
        default: '[&_[data-slot=card-content]]:p-6',
        lg: '[&_[data-slot=card-content]]:p-8',
      },
    },
    defaultVariants: { variant: 'default', padding: 'default' },
  },
)

export type CardVariants = VariantProps<typeof cardVariants>

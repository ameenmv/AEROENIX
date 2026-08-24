import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const progressVariants = cva(
  'relative w-full overflow-hidden rounded-full bg-primary/20',
  {
    variants: {
      size: {
        xs: 'h-1',
        sm: 'h-1.5',
        default: 'h-2',
        lg: 'h-3',
        xl: 'h-4',
      },
      color: {
        default: '[&>[data-slot=progress-indicator]]:bg-primary',
        success: '[&>[data-slot=progress-indicator]]:bg-success',
        warning: '[&>[data-slot=progress-indicator]]:bg-warning',
        destructive: '[&>[data-slot=progress-indicator]]:bg-destructive',
        info: '[&>[data-slot=progress-indicator]]:bg-info',
      },
    },
    defaultVariants: { size: 'default', color: 'default' },
  },
)

export type ProgressVariants = VariantProps<typeof progressVariants>

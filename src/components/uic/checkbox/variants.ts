import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const checkboxVariants = cva(
  'peer shrink-0 rounded-[4px] border border-primary shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        default: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
      variant: {
        default: 'data-[state=checked]:bg-primary',
        success: 'data-[state=checked]:bg-success data-[state=checked]:border-success',
        destructive: 'data-[state=checked]:bg-destructive data-[state=checked]:border-destructive',
      },
    },
    defaultVariants: { size: 'default', variant: 'default' },
  },
)

export type CheckboxVariants = VariantProps<typeof checkboxVariants>

import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const switchVariants = cva(
  'peer inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-4 w-7 [&_[data-slot=switch-thumb]]:size-3',
        default: 'h-[1.15rem] w-8 [&_[data-slot=switch-thumb]]:size-4',
        lg: 'h-6 w-11 [&_[data-slot=switch-thumb]]:size-5',
      },
      color: {
        default: 'data-[state=checked]:bg-primary focus-visible:border-ring focus-visible:ring-ring/50',
        success: 'data-[state=checked]:bg-success focus-visible:ring-success/50',
        destructive: 'data-[state=checked]:bg-destructive focus-visible:ring-destructive/50',
      },
    },
    defaultVariants: { size: 'default', color: 'default' },
  },
)

export type SwitchVariants = VariantProps<typeof switchVariants>

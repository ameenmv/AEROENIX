import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const selectTriggerVariants = cva(
  'flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus:ring-ring/50 focus:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-9',
        md: 'h-10 px-4',
        lg: 'h-12 px-5 text-base',
      },
      variant: {
        default: 'bg-accent border-border',
        search: 'bg-card border-none ring-1 ring-border shadow-none h-9 text-xs',
        filter: 'bg-card border-border h-7 text-xs px-3 hover:bg-muted',
        ghost: 'border-none shadow-none bg-transparent',
      },
    },
    defaultVariants: { size: 'default', variant: 'default' },
  },
)

export type SelectTriggerVariants = VariantProps<typeof selectTriggerVariants>

import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const inputVariants = cva(
  'flex w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
  {
    variants: {
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-9',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-5 text-lg',
      },
      variant: {
        default:
          'border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        search: 'pl-9 bg-card border-none ring-1 ring-border shadow-none h-9 text-xs',
        ghost: 'border-none shadow-none bg-transparent focus-visible:ring-0',
        error:
          'border-destructive focus-visible:ring-destructive focus-visible:ring-[3px] focus-visible:ring-destructive/20',
      },
    },
    defaultVariants: { size: 'default', variant: 'default' },
  },
)

export type InputVariants = VariantProps<typeof inputVariants>

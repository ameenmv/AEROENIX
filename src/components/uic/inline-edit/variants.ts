import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const inlineEditVariants = cva('inline-flex items-center gap-1 group', {
  variants: {
    size: {
      sm: 'text-xs',
      default: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: { size: 'default' },
})

export type InlineEditVariants = VariantProps<typeof inlineEditVariants>

import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const textareaVariants = cva(
  'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
  {
    variants: {
      size: {
        sm: 'min-h-[40px] text-xs',
        default: 'min-h-[60px]',
        lg: 'min-h-[120px] text-base',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
    },
    defaultVariants: { size: 'default', resize: 'none' },
  },
)

export type TextareaVariants = VariantProps<typeof textareaVariants>

import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const textEditorVariants = cva(
  'flex flex-col bg-card border border-border rounded-xl overflow-visible transition-colors focus-within:ring-ring/50 focus-within:ring-[3px]',
  {
    variants: {
      size: {
        sm: '[&_[data-slot=editor-body]]:min-h-[120px]',
        default: '[&_[data-slot=editor-body]]:min-h-[200px]',
        lg: '[&_[data-slot=editor-body]]:min-h-[320px]',
      },
    },
    defaultVariants: { size: 'default' },
  },
)

export type TextEditorVariants = VariantProps<typeof textEditorVariants>

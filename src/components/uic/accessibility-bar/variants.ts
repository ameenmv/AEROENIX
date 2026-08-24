import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const accessibilityBarVariants = cva(
  'sticky w-full flex items-center gap-1 backdrop-blur-md border-b border-border transition-all duration-300',
  {
    variants: {
      position: {
        top: 'top-0 z-50',
        bottom: 'bottom-0 z-50 border-t border-b-0',
      },
      size: {
        sm: 'h-7 px-2',
        default: 'h-9 px-3',
        lg: 'h-10 px-4',
      },
    },
    defaultVariants: {
      position: 'top',
      size: 'default',
    },
  },
)

export type AccessibilityBarVariants = VariantProps<typeof accessibilityBarVariants>

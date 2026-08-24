import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const nativeSelectVariants = cva(
  'flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-colors focus:border-ring focus:ring-ring/50 focus:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-8 text-xs',
        default: 'h-9',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: { size: 'default' },
  },
)

export type NativeSelectVariants = VariantProps<typeof nativeSelectVariants>

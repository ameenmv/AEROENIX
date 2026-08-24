import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const skeletonVariants = cva('animate-pulse rounded-md bg-muted', {
  variants: {
    shape: {
      default: 'rounded-md',
      circle: 'rounded-full',
      square: 'rounded-none',
    },
    size: {
      xs: 'h-3',
      sm: 'h-4',
      default: 'h-5',
      lg: 'h-8',
      xl: 'h-12',
    },
  },
  defaultVariants: { shape: 'default', size: 'default' },
})

export type SkeletonVariants = VariantProps<typeof skeletonVariants>

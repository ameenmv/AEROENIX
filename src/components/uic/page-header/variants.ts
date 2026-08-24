import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const pageHeaderVariants = cva('flex flex-col gap-3', {
  variants: {
    size: {
      sm: '[&_[data-slot=page-header-title]]:text-xl',
      default: '[&_[data-slot=page-header-title]]:text-2xl',
      lg: '[&_[data-slot=page-header-title]]:text-3xl',
    },
    align: {
      left: '',
      center: 'items-center text-center',
    },
  },
  defaultVariants: { size: 'default', align: 'left' },
})

export type PageHeaderVariants = VariantProps<typeof pageHeaderVariants>

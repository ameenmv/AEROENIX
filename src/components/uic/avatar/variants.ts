import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        'xs': 'h-6 w-6 text-[10px]',
        'sm': 'h-8 w-8 text-xs',
        'default': 'h-10 w-10 text-sm',
        'lg': 'h-12 w-12 text-base',
        'xl': 'h-16 w-16 text-lg',
        '2xl': 'h-20 w-20 text-xl',
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-md',
      },
    },
    defaultVariants: { size: 'default', shape: 'circle' },
  },
)

export type AvatarVariants = VariantProps<typeof avatarVariants>

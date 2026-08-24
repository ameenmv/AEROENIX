import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const sparklineVariants = cva('inline-block align-middle overflow-visible', {
  variants: {
    size: {
      xs: '[&]:w-[48px] [&]:h-[16px]',
      sm: '[&]:w-[64px] [&]:h-[20px]',
      default: '[&]:w-[96px] [&]:h-[28px]',
      lg: '[&]:w-[128px] [&]:h-[36px]',
    },
    trend: {
      auto: '',
      up: '',
      down: '',
      neutral: '',
    },
  },
  defaultVariants: { size: 'default', trend: 'auto' },
})

export type SparklineVariants = VariantProps<typeof sparklineVariants>

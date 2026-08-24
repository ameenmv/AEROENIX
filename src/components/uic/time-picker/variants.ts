import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const timePickerVariants = cva('relative inline-block', {
  variants: {
    size: {
      sm: '[&_input]:h-7 [&_input]:text-xs [&_input]:w-[80px]',
      default: '[&_input]:h-8 [&_input]:text-sm [&_input]:w-[95px]',
      lg: '[&_input]:h-10 [&_input]:text-base [&_input]:w-[120px]',
    },
  },
  defaultVariants: { size: 'default' },
})

export type TimePickerVariants = VariantProps<typeof timePickerVariants>

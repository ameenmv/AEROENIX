import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const timelineVariants = cva('relative flex flex-col', {
  variants: {
    spacing: {
      tight: 'gap-3',
      default: 'gap-4',
      loose: 'gap-6',
    },
  },
  defaultVariants: { spacing: 'default' },
})

export const timelineDotVariants = cva('rounded-full shrink-0 ring-4 ring-background', {
  variants: {
    variant: {
      success: 'bg-green-500',
      warning: 'bg-amber-500',
      danger: 'bg-red-500',
      info: 'bg-blue-500',
      neutral: 'bg-muted-foreground',
    },
    size: {
      sm: 'w-2 h-2',
      default: 'w-2.5 h-2.5',
      lg: 'w-3 h-3',
    },
  },
  defaultVariants: { variant: 'neutral', size: 'default' },
})

export type TimelineVariants = VariantProps<typeof timelineVariants>
export type TimelineDotVariants = VariantProps<typeof timelineDotVariants>

import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const kvListVariants = cva('flex flex-col', {
  variants: {
    spacing: {
      tight: 'gap-2',
      default: 'gap-2.5',
      loose: 'gap-4',
    },
    dividers: {
      none: '',
      between: '[&>*+*]:border-t [&>*+*]:border-border [&>*+*]:pt-2.5',
    },
  },
  defaultVariants: { spacing: 'default', dividers: 'none' },
})

export const kvItemVariants = cva('flex items-center gap-3', {
  variants: {
    layout: {
      /** Label left, value right */
      between: 'justify-between',
      /** Stacked: label on top, value below */
      stacked: 'flex-col items-start gap-0.5',
    },
  },
  defaultVariants: { layout: 'between' },
})

export type KvListVariants = VariantProps<typeof kvListVariants>
export type KvItemVariants = VariantProps<typeof kvItemVariants>

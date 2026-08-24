import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const dataTableToolbarVariants = cva(
  'flex items-center justify-between gap-3 flex-wrap py-3',
  {
    variants: {
      position: {
        top: 'border-b border-border pb-3',
        bottom: 'border-t border-border pt-3',
      },
    },
    defaultVariants: { position: 'bottom' },
  },
)

export type DataTableToolbarVariants = VariantProps<typeof dataTableToolbarVariants>

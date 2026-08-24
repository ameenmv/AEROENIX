import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const alertDialogVariants = cva('', {
  variants: {
    size: {
      sm: 'max-w-sm',
      default: 'max-w-lg',
      lg: 'max-w-2xl',
      full: 'max-w-[90vw]',
    },
  },
  defaultVariants: { size: 'default' },
})

export type AlertDialogVariants = VariantProps<typeof alertDialogVariants>

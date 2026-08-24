import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const confirmDialogVariants = cva('', {
  variants: {
    /** Confirm button variant */
    confirmVariant: {
      default: '',
      destructive: '',
    },
  },
  defaultVariants: { confirmVariant: 'default' },
})

export type ConfirmDialogVariants = VariantProps<typeof confirmDialogVariants>

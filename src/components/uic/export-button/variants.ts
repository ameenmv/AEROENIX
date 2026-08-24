import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const exportButtonVariants = cva('', {
  variants: {
    size: {
      sm: '',
      default: '',
      lg: '',
    },
  },
  defaultVariants: { size: 'default' },
})

export type ExportButtonVariants = VariantProps<typeof exportButtonVariants>

import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const infoCardVariants = cva('', {
  variants: {
    padding: {
      sm: 'p-4',
      default: 'p-5',
      lg: 'p-6',
    },
  },
  defaultVariants: { padding: 'default' },
})

export type InfoCardVariants = VariantProps<typeof infoCardVariants>

import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const dropdownActionsVariants = cva('', {
  variants: {
    align: {
      start: '',
      center: '',
      end: '',
    },
  },
  defaultVariants: { align: 'end' },
})

export type DropdownActionsVariants = VariantProps<typeof dropdownActionsVariants>

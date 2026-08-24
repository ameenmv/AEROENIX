import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const filterPanelVariants = cva(
  'flex flex-col bg-popover border border-border rounded-xl shadow-lg overflow-hidden',
  {
    variants: {
      position: {
        dropdown: 'absolute z-50 min-w-[320px]',
        sidebar: 'relative w-full',
        inline: 'relative w-full border-none shadow-none bg-transparent rounded-none',
      },
      size: {
        sm: 'text-xs',
        default: 'text-sm',
      },
    },
    defaultVariants: { position: 'dropdown', size: 'default' },
  },
)

export type FilterPanelVariants = VariantProps<typeof filterPanelVariants>

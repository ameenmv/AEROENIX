import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const fileListVariants = cva('w-full', {
  variants: {
    layout: {
      list: 'flex flex-col gap-2',
      grid: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3',
    },
    size: {
      sm: 'text-xs',
      default: 'text-sm',
    },
  },
  defaultVariants: { layout: 'list', size: 'default' },
})

export const fileItemVariants = cva(
  'flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50',
  {
    variants: {
      layout: {
        list: '',
        grid: 'flex-col items-start p-4',
      },
    },
    defaultVariants: { layout: 'list' },
  },
)

export type FileListVariants = VariantProps<typeof fileListVariants>
export type FileItemVariants = VariantProps<typeof fileItemVariants>

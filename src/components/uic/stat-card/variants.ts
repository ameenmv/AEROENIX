import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const statCardVariants = cva(
  'relative rounded-xl border bg-card text-card-foreground shadow-sm p-5 flex flex-col gap-3 transition-all duration-200 hover:shadow-md hover:-translate-y-px',
  {
    variants: {
      accent: {
        default: '',
        primary:
          'before:absolute before:inset-y-0 before:start-0 before:w-[3px] before:rounded-s-xl before:bg-primary',
        success:
          'before:absolute before:inset-y-0 before:start-0 before:w-[3px] before:rounded-s-xl before:bg-success',
        warning:
          'before:absolute before:inset-y-0 before:start-0 before:w-[3px] before:rounded-s-xl before:bg-warning',
        info: 'before:absolute before:inset-y-0 before:start-0 before:w-[3px] before:rounded-s-xl before:bg-info',
        danger:
          'before:absolute before:inset-y-0 before:start-0 before:w-[3px] before:rounded-s-xl before:bg-destructive',
      },
      size: {
        sm: 'p-3 gap-2',
        default: 'p-5 gap-3',
        lg: 'p-6 gap-4',
      },
    },
    defaultVariants: { accent: 'default', size: 'default' },
  },
)

export type StatCardVariants = VariantProps<typeof statCardVariants>

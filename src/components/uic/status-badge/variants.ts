import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        success: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
        warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
        danger: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
        info: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
        neutral: 'bg-muted text-muted-foreground',
        violet: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
      },
      size: {
        sm: 'text-[10px] px-2 py-0.5',
        default: 'text-xs px-2.5 py-1',
        lg: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: { variant: 'neutral', size: 'default' },
  },
)

export const statusDotVariants = cva('rounded-full shrink-0', {
  variants: {
    variant: {
      success: 'bg-green-500',
      warning: 'bg-amber-500',
      danger: 'bg-red-500',
      info: 'bg-blue-500',
      neutral: 'bg-muted-foreground',
      violet: 'bg-violet-500',
    },
    size: {
      sm: 'w-1.5 h-1.5',
      default: 'w-2 h-2',
      lg: 'w-2.5 h-2.5',
    },
    pulse: {
      true: 'animate-pulse',
      false: '',
    },
  },
  defaultVariants: { variant: 'neutral', size: 'default', pulse: false },
})

export type StatusBadgeVariants = VariantProps<typeof statusBadgeVariants>

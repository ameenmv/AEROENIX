import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const tabsListVariants = cva(
  'inline-flex items-center justify-center text-muted-foreground',
  {
    variants: {
      variant: {
        default: 'h-9 rounded-lg bg-muted p-[3px] gap-1',
        underline: 'bg-transparent border-b rounded-none gap-0 p-0 h-auto',
        pills: 'bg-transparent gap-2 p-0',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'rounded-md px-3 py-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        underline: 'rounded-none px-4 py-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground',
        pills: 'rounded-full px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export type TabsListVariants = VariantProps<typeof tabsListVariants>
export type TabsTriggerVariants = VariantProps<typeof tabsTriggerVariants>

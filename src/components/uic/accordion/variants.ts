import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const accordionVariants = cva('w-full', {
  variants: {
    variant: {
      default: '',
      bordered: 'border rounded-lg divide-y',
      separated: 'space-y-2 [&>*]:rounded-lg [&>*]:border',
    },
    size: {
      sm: '[&_[data-slot=accordion-trigger]]:py-2 [&_[data-slot=accordion-trigger]]:text-sm',
      default: '[&_[data-slot=accordion-trigger]]:py-4',
      lg: '[&_[data-slot=accordion-trigger]]:py-5 [&_[data-slot=accordion-trigger]]:text-lg',
    },
  },
  defaultVariants: { variant: 'default', size: 'default' },
})

export type AccordionVariants = VariantProps<typeof accordionVariants>

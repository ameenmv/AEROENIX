import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const loaderBtnVariants = cva(
  'relative inline-flex items-center justify-center gap-2 transition-all',
  {
    variants: {
      /** Visual style when loading */
      loadingStyle: {
        /** Replaces text with spinner */
        replace: '[&[data-loading=true]_[data-slot=loader-text]]:invisible',
        /** Prepends spinner before text */
        prepend: '',
      },
    },
    defaultVariants: { loadingStyle: 'replace' },
  },
)

export type LoaderBtnVariants = VariantProps<typeof loaderBtnVariants>

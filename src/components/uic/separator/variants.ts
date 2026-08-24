/**
 * Separator variants — horizontal or vertical divider.
 *
 * Common props:
 *  - orientation: 'horizontal' | 'vertical'
 *  - decorative: boolean (if true, not announced to screen readers)
 *
 * Horizontal: shrink-0 bg-border h-px w-full
 * Vertical: shrink-0 bg-border h-full w-px
 */
export const separatorDefaults = {
  orientation: 'horizontal' as const,
  decorative: true,
} as const

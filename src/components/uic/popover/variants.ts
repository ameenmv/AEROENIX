/**
 * Popover variants — floating content panel triggered by a button.
 *
 * Sub-components:
 *  - Popover (root)
 *  - PopoverTrigger (trigger element)
 *  - PopoverContent (floating panel)
 *  - PopoverAnchor (optional custom anchor element)
 *
 * Common props on PopoverContent:
 *  - side: 'top' | 'right' | 'bottom' | 'left'
 *  - align: 'start' | 'center' | 'end'
 *  - sideOffset: number
 */
export const popoverDefaults = {
  side: 'bottom' as const,
  align: 'center' as const,
  sideOffset: 4,
} as const

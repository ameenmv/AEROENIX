/**
 * HoverCard variants — card that appears on hover.
 *
 * Sub-components:
 *  - HoverCard (root)
 *  - HoverCardTrigger (element that triggers the card)
 *  - HoverCardContent (the card content)
 *
 * Common props:
 *  - openDelay: number (ms before showing)
 *  - closeDelay: number (ms before hiding)
 */
export const hoverCardDefaults = {
  openDelay: 200,
  closeDelay: 100,
  align: 'center' as const,
  sideOffset: 4,
} as const

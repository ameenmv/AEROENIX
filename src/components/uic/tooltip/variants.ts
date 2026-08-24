/**
 * Tooltip variants — hover tooltip for any element.
 *
 * Sub-components:
 *  - Tooltip (root — manages state)
 *  - TooltipTrigger (element that triggers the tooltip)
 *  - TooltipContent (the tooltip bubble)
 *  - TooltipProvider (wraps a group of tooltips for shared delay)
 *
 * Common props on TooltipContent:
 *  - side: 'top' | 'right' | 'bottom' | 'left'
 *  - align: 'start' | 'center' | 'end'
 *  - sideOffset: number
 *
 * Common props on TooltipProvider:
 *  - delayDuration: number (ms before showing)
 *  - skipDelayDuration: number (ms to skip delay between consecutive tooltips)
 */
export const tooltipDefaults = {
  delayDuration: 300,
  sideOffset: 4,
} as const

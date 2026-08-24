/**
 * ScrollArea variants — custom scrollbar container.
 *
 * Sub-components:
 *  - ScrollArea (root container with custom scrollbars)
 *  - ScrollBar (the scrollbar thumb and track)
 *
 * Common props:
 *  - type: 'auto' | 'always' | 'scroll' | 'hover'
 *  - scrollHideDelay: number (ms)
 *  - orientation: 'horizontal' | 'vertical'
 */
export const scrollAreaDefaults = {
  type: 'hover' as const,
  scrollHideDelay: 600,
} as const

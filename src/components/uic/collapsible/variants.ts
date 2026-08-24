/**
 * Collapsible variants — a single collapsible section.
 *
 * Sub-components:
 *  - Collapsible (root — manages open/close state)
 *  - CollapsibleTrigger (toggle button)
 *  - CollapsibleContent (animated content area)
 *
 * Common props:
 *  - open: boolean (controlled)
 *  - defaultOpen: boolean (uncontrolled)
 *  - disabled: boolean
 */
export const collapsibleDefaults = {
  defaultOpen: false,
  disabled: false,
} as const

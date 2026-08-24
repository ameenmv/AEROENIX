/**
 * ToggleGroup variants — inherits from Toggle variants.
 *
 * Sub-components:
 *  - ToggleGroup (root — manages single/multiple selection)
 *  - ToggleGroupItem (individual toggle button)
 *
 * Common props:
 *  - type: 'single' | 'multiple'
 *  - variant: 'default' | 'outline' (inherited from Toggle)
 *  - size: 'default' | 'sm' | 'lg' (inherited from Toggle)
 *  - disabled: boolean
 */
export const toggleGroupDefaults = {
  type: 'single' as const,
  variant: 'default' as const,
  size: 'default' as const,
} as const

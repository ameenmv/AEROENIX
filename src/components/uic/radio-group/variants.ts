/**
 * RadioGroup variants — single-select radio button group.
 *
 * Sub-components:
 *  - RadioGroup (root — manages selection state)
 *  - RadioGroupItem (individual radio button)
 *
 * Common props:
 *  - orientation: 'horizontal' | 'vertical'
 *  - defaultValue: string
 *  - disabled: boolean
 */
export const radioGroupDefaults = {
  orientation: 'vertical' as const,
} as const

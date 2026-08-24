/**
 * NumberField variants — numeric input with increment/decrement buttons.
 *
 * Sub-components (reka-ui based):
 *  - NumberField (root)
 *  - NumberFieldContent (input wrapper)
 *  - NumberFieldDecrement (- button)
 *  - NumberFieldIncrement (+ button)
 *  - NumberFieldInput (the input field)
 *
 * Common props:
 *  - min / max: number
 *  - step: number
 *  - formatOptions: Intl.NumberFormatOptions
 */
export const numberFieldDefaults = {
  step: 1,
} as const

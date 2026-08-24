/**
 * Slider variants — range slider input.
 *
 * Based on reka-ui Slider with shadcn styling.
 *
 * Common props:
 *  - min / max: number
 *  - step: number
 *  - orientation: 'horizontal' | 'vertical'
 *  - inverted: boolean
 *  - minStepsBetweenThumbs: number (for range sliders)
 */
export const sliderDefaults = {
  min: 0,
  max: 100,
  step: 1,
  orientation: 'horizontal' as const,
} as const

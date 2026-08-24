/**
 * AspectRatio variants — ratio presets for common use cases.
 * This component wraps reka-ui AspectRatio and accepts a `ratio` number prop.
 *
 * Common ratios:
 *  - 1      → Square (1:1)
 *  - 16/9   → Widescreen video
 *  - 4/3    → Standard display
 *  - 21/9   → Ultra-wide
 *  - 3/2    → Classic photo
 *  - 2/3    → Portrait photo
 */
export const aspectRatioPresets = {
  square: 1,
  video: 16 / 9,
  photo: 4 / 3,
  ultrawide: 21 / 9,
  classic: 3 / 2,
  portrait: 2 / 3,
} as const

export type AspectRatioPreset = keyof typeof aspectRatioPresets

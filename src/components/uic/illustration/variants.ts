/**
 * Illustration presets — built-in SVG illustration names.
 */
export const illustrationNames = [
  'assets',
  'evaluation',
  'subscription',
  'search',
  'error',
  'success',
  'empty',
] as const

export type IllustrationName = (typeof illustrationNames)[number]

export const illustrationDefaults = {
  name: 'empty' as IllustrationName,
  size: 120,
} as const

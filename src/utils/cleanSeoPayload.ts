import type { CmsSeoMeta } from '@/types/cms'

/**
 * Remove empty/null SEO fields from a locale payload before sending to the API.
 * Returns undefined if all locales are effectively empty.
 */
export function cleanSeoPayload(
  seo: Record<string, Partial<CmsSeoMeta>>,
): Record<string, Partial<CmsSeoMeta>> | undefined {
  const cleaned: Record<string, Partial<CmsSeoMeta>> = {}

  for (const [locale, meta] of Object.entries(seo)) {
    if (!meta || typeof meta !== 'object')
      continue

    const filtered: Partial<CmsSeoMeta> = {}
    let hasValue = false

    for (const [key, value] of Object.entries(meta)) {
      // Keep is_default and robots even if they have defaults
      if (key === 'is_default') {
        filtered[key] = value as boolean
        continue
      }
      // Skip empty strings, null, undefined
      if (value === null || value === undefined || value === '') {
        continue
      }
      ;(filtered as any)[key] = value
      hasValue = true
    }

    if (hasValue) {
      cleaned[locale] = filtered
    }
  }

  return Object.keys(cleaned).length > 0 ? cleaned : undefined
}

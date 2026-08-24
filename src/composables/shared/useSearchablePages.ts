import type { SearchablePageConfig } from '@/config/searchablePages'
import { searchablePagesConfig } from '@/config/searchablePages'

export interface SearchablePage {
  /** Unique ID */
  id: string
  /** Translated page title */
  title: string
  /** Translated description */
  description?: string
  /** Route path (without lang prefix) */
  path: string
  /** Searchable keywords */
  keywords: string[]
  /** Category for grouping */
  category: string
}

/**
 * Composable that provides searchable pages for the Command Palette.
 *
 * Pages are defined statically in `@/config/searchablePages.ts` — add new
 * entries there to make them searchable. Titles, descriptions, and categories
 * are resolved via i18n at runtime.
 */
export function useSearchablePages() {
  const { t } = useI18n()

  // ── Build searchable pages from static config ──────────────────────────
  const searchablePages = computed<SearchablePage[]>(() => {
    return searchablePagesConfig.map((cfg: SearchablePageConfig) => ({
      id: cfg.id,
      title: t(cfg.titleKey, cfg.titleKey),
      description: cfg.descriptionKey ? t(cfg.descriptionKey, '') || undefined : undefined,
      path: cfg.path,
      keywords: cfg.keywords,
      category: t(cfg.categoryKey, cfg.categoryKey),
    }))
  })

  // ── Search with scoring ────────────────────────────────────────────────
  function searchPages(query: string): SearchablePage[] {
    if (!query.trim())
      return searchablePages.value

    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter(t => t.length > 0)

    return searchablePages.value
      .map((page) => {
        let score = 0
        const titleLower = page.title.toLowerCase()
        const descLower = (page.description || '').toLowerCase()
        const pathLower = page.path.toLowerCase()

        for (const term of terms) {
          // Exact title match
          if (titleLower === term)
            score += 100
          // Title starts with term
          else if (titleLower.startsWith(term))
            score += 50
          // Title contains term
          else if (titleLower.includes(term))
            score += 25
          // Keyword match
          else if (page.keywords.some((k: string) => k.includes(term)))
            score += 20
          // Description match
          else if (descLower.includes(term))
            score += 10
          // Path match
          else if (pathLower.includes(term))
            score += 5
        }

        return { page, score }
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ page }) => page)
  }

  // ── Group pages by category ────────────────────────────────────────────
  function getPagesByCategory(query: string = ''): Record<string, SearchablePage[]> {
    const filtered = query ? searchPages(query) : searchablePages.value
    const grouped: Record<string, SearchablePage[]> = {}

    for (const page of filtered) {
      if (!grouped[page.category])
        grouped[page.category] = []
      grouped[page.category]!.push(page)
    }

    return grouped
  }

  return {
    searchablePages,
    searchPages,
    getPagesByCategory,
  }
}

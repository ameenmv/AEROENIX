<script setup lang="ts">
/**
 * ContentPageEditor — Client-facing CMS Content Editor
 *
 * Loads a CMS page by slug from the route, displays its sections
 * in a sidebar, and renders editable fields for the selected section.
 * Edit-only: no create, delete, structure, or publish controls.
 */
import type { CmsFieldDefinition, CmsPage, CmsSection, CmsSeoMeta } from '@/types/cms'
import { Add01Icon, ArrowDown01Icon, ArrowLeft02Icon, ArrowUp01Icon, Cancel01Icon, CheckmarkCircle02Icon, Delete02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import ModularView from '@/components/admin/ModularView.vue'
import CmsFieldRenderer from '@/components/ui/cms/CmsFieldRenderer.vue'
import PageSeoPanel from '@/components/ui/cms/PageSeoPanel.vue'
import { Badge } from '@/components/uic/badge'
import { Button } from '@/components/uic/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/uic/card'
import { Skeleton } from '@/components/uic/skeleton'
import { cmsSeoService } from '@/services/cmsSeoService'
import { cmsPageService, cmsSectionContentService, cmsSectionService } from '@/services/cmsService'
import { cleanSeoPayload } from '@/utils/cleanSeoPayload'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

// ── Route params ──────────────────────────────────────────────────────────────
const pageSlug = computed(() => (route.params.slug as string) || (route.params.page as string))

// ── State ─────────────────────────────────────────────────────────────────────
const page = ref<CmsPage | null>(null)
const sections = ref<CmsSection[]>([])
const loading = ref(true)
const saving = ref(false)
const publishing = ref(false)
const activeLocale = ref<'en' | 'ar'>('en')
const activeSectionId = ref<number | 'seo' | null>(null)

/**
 * Content store: sectionId → locale → { fieldKey: value }
 * This is the working draft content.
 */
const contentStore = reactive<Record<number, Record<string, Record<string, any>>>>({})

/**
 * Original content snapshot for cancel/reset functionality.
 */
const originalContentStore = ref<Record<number, Record<string, Record<string, any>>>>({})

/**
 * Validation errors: sectionId → locale → fieldKey → error message
 */
const validationErrors = reactive<Record<number, Record<string, Record<string, string>>>>({})

/**
 * Content status: sectionId → locale → status (0=draft, 1=published)
 */
const contentStatus = reactive<Record<number, Record<string, number>>>({})

// ── SEO state ─────────────────────────────────────────────────────────────────
const seo = ref<Record<string, Partial<CmsSeoMeta>>>({
  en: { is_default: true, robots: 'index,follow', twitter_card: 'summary_large_image' },
  ar: {},
})

// ── Load page by slug ─────────────────────────────────────────────────────────
async function loadPage() {
  loading.value = true
  try {
    // Find the page by slug — search by slug then match locally
    const result = await cmsPageService.list({ search: pageSlug.value, translated: true })
    const pages = result.data

    // Match by slug (handles both string and bilingual object slugs)
    const matchedPage
      = pages.find((p: any) => {
        if (typeof p.slug === 'string')
          return p.slug === pageSlug.value
        return p.slug?.en === pageSlug.value || p.slug?.ar === pageSlug.value
      }) || pages[0]

    if (!matchedPage) {
      toast.error(t('common.error', 'Error'), {
        description: t('cms.page_not_found', 'Page not found for this slug'),
      })
      loading.value = false
      return
    }

    // Fetch full page data with sections included
    const fullPage = await cmsPageService.get(matchedPage.id, { include: 'sections' })
    page.value = fullPage

    // Get sections
    if (fullPage.sections && fullPage.sections.length > 0) {
      sections.value = fullPage.sections
        .filter(s => !s.is_hidden)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    }
    else {
      const sectionResult = await cmsSectionService.list(matchedPage.id)
      sections.value = sectionResult.data
        .filter(s => !s.is_hidden)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    }

    // Select the first section by default
    if (sections.value.length > 0 && !activeSectionId.value) {
      activeSectionId.value = sections.value[0]!.id
    }

    // Load content for all sections
    await Promise.all(sections.value.map(s => loadSectionContent(s.id)))

    // Load page SEO data
    try {
      const rawSeo = (fullPage as any).seo_metas ?? (fullPage as any).seoMetas ?? (fullPage as any).seo
      if (rawSeo) {
        const seoData: Record<string, Partial<CmsSeoMeta>> = { en: {}, ar: {} }
        if (Array.isArray(rawSeo)) {
          for (const meta of rawSeo) {
            const loc = meta.locale || (meta.is_default ? 'en' : 'ar')
            seoData[loc] = meta
          }
        }
        else if (typeof rawSeo === 'object') {
          for (const [loc, meta] of Object.entries(rawSeo)) {
            if (meta && typeof meta === 'object')
              seoData[loc] = meta as Partial<CmsSeoMeta>
          }
        }
        seo.value = {
          en: { is_default: true, robots: 'index,follow', twitter_card: 'summary_large_image', ...seoData.en },
          ar: { ...seoData.ar },
        }
      }
      else {
        // Try loading from the SEO endpoint directly
        const seoAll = await cmsSeoService.getAll(matchedPage.id)
        if (seoAll) {
          seo.value = {
            en: { is_default: true, robots: 'index,follow', twitter_card: 'summary_large_image', ...(seoAll.en || {}) },
            ar: { ...(seoAll.ar || {}) },
          }
        }
      }
    }
    catch {
      // SEO load failure is non-blocking — panel stays empty
    }

    // Snapshot original content for reset
    originalContentStore.value = JSON.parse(JSON.stringify(contentStore))
  }
  catch (err: any) {
    toast.error(t('common.error', 'Error'), {
      description: err.response?.data?.message || err.message || 'Failed to load page',
    })
  }
  finally {
    loading.value = false
  }
}

/** Generate a unique ID for new repeatable entries */
let entryIdCounter = 0
function generateEntryId(): string {
  return `entry_${Date.now()}_${++entryIdCounter}`
}

/** Ensure all entries in a repeatable array have `id` and correct `order` */
function normalizeRepeatableEntries(entries: any[]): any[] {
  // Sort by existing `order` field first so the backend can't shuffle our arrangement
  const sorted = [...entries].sort((a, b) => {
    const orderA = typeof a === 'object' && a !== null ? (a.order ?? Infinity) : Infinity
    const orderB = typeof b === 'object' && b !== null ? (b.order ?? Infinity) : Infinity
    return orderA - orderB
  })
  return sorted.map((entry, idx) => {
    if (typeof entry !== 'object' || entry === null)
      return { id: generateEntryId(), order: idx + 1 }
    return {
      ...entry,
      id: entry.id ?? generateEntryId(),
      order: idx + 1,
    }
  })
}

async function loadSectionContent(sectionId: number) {
  // Check if this section is repeatable to determine initial structure
  const sectionDef = sections.value.find(s => s.id === sectionId)
  const isRepeatable = sectionDef?.is_repeatable === true
  const emptyContent = isRepeatable ? [] : {}

  try {
    const data = await cmsSectionContentService.getAll(sectionId)

    if (!contentStore[sectionId]) {
      contentStore[sectionId] = { en: structuredClone(emptyContent), ar: structuredClone(emptyContent) }
    }
    if (!contentStatus[sectionId]) {
      contentStatus[sectionId] = { en: 0, ar: 0 }
    }

    if (data && typeof data === 'object') {
      for (const [loc, entry] of Object.entries(data)) {
        if (loc === 'en' || loc === 'ar') {
          const e = entry as any
          let content = e?.content ?? e ?? structuredClone(emptyContent)
          // Normalize repeatable entries: ensure each has id + order
          if (isRepeatable && Array.isArray(content)) {
            content = normalizeRepeatableEntries(content)
          }
          contentStore[sectionId]![loc] = content
          contentStatus[sectionId]![loc] = e?.status ?? 0
        }
      }
    }
  }
  catch {
    // Content may not exist yet — initialize empty
    if (!contentStore[sectionId]) {
      contentStore[sectionId] = { en: structuredClone(emptyContent), ar: structuredClone(emptyContent) }
    }
    if (!contentStatus[sectionId]) {
      contentStatus[sectionId] = { en: 0, ar: 0 }
    }
  }
}

/**
 * Merge the POST response data into the local content store
 * instead of re-fetching (which returns stale published data).
 *
 * The save response may contain the full locale entry with resolved
 * media objects (temp tokens replaced with actual server objects).
 */
function mergeSaveResponse(sectionId: number, loc: string, responseData: any) {
  const sectionDef = sections.value.find(s => s.id === sectionId)
  const isRepeatable = sectionDef?.is_repeatable === true

  if (!contentStore[sectionId]) {
    contentStore[sectionId] = { en: {}, ar: {} }
  }

  // The response may be: { content: {...}, status: 0 } or just the content object
  const resolved = responseData?.content ?? responseData

  if (resolved && typeof resolved === 'object') {
    let content = resolved
    if (isRepeatable && Array.isArray(content)) {
      content = normalizeRepeatableEntries(content)
    }
    contentStore[sectionId]![loc] = content
  }

  // Update status from response if available
  if (!contentStatus[sectionId]) {
    contentStatus[sectionId] = { en: 0, ar: 0 }
  }
  if (responseData?.status !== undefined) {
    contentStatus[sectionId]![loc] = responseData.status
  }
}

// ── Initial load ──────────────────────────────────────────────────────────────
watch(
  () => pageSlug.value,
  () => {
    // Reset state when switching pages
    page.value = null
    sections.value = []
    activeSectionId.value = null
    Object.keys(contentStore).forEach(k => delete contentStore[Number(k)])
    loadPage()
  },
  { immediate: true },
)

// ── Computed helpers ──────────────────────────────────────────────────────────
const pageName = computed(() => {
  if (!page.value)
    return ''
  const title = page.value.title
  if (typeof title === 'string')
    return title
  return title?.[locale.value as 'en' | 'ar'] || title?.en || ''
})

const activeSection = computed(
  () => sections.value.find(s => s.id === activeSectionId.value) || null,
)

const activeSectionFields = computed<CmsFieldDefinition[]>(() => activeSection.value?.fields || [])

// ── Repeatable section helpers ────────────────────────────────────────────────
const isRepeatableSection = computed(() => activeSection.value?.is_repeatable === true)

/** Track collapsed state of repeatable entries: entryIndex → collapsed */
const collapsedEntries = ref<Set<number>>(new Set())

function toggleEntryCollapse(index: number) {
  if (collapsedEntries.value.has(index))
    collapsedEntries.value.delete(index)
  else
    collapsedEntries.value.add(index)
}

/** Get the array of entries for the active repeatable section */
const repeatableEntries = computed<Record<string, any>[]>(() => {
  if (!activeSectionId.value || !isRepeatableSection.value)
    return []
  const raw = contentStore[activeSectionId.value as number]?.[activeLocale.value]
  if (Array.isArray(raw))
    return raw
  return []
})

function addEntry() {
  if (!activeSectionId.value)
    return
  if (!contentStore[activeSectionId.value as number])
    contentStore[activeSectionId.value as number] = { en: [], ar: [] }
  const current = contentStore[activeSectionId.value as number]![activeLocale.value]
  if (!Array.isArray(current))
    contentStore[activeSectionId.value as number]![activeLocale.value] = []
  const arr = contentStore[activeSectionId.value as number]![activeLocale.value] as any[]
  arr.push({ id: generateEntryId(), order: arr.length + 1 })
}

function removeEntry(index: number) {
  if (!activeSectionId.value)
    return
  const current = contentStore[activeSectionId.value as number]?.[activeLocale.value]
  if (Array.isArray(current)) {
    current.splice(index, 1)
    // Recalculate order for remaining entries
    recalculateOrder(current)
  }
  // Clean up collapsed state
  collapsedEntries.value.delete(index)
}

/** Recalculate the `order` field for all entries based on their array position */
function recalculateOrder(entries: any[]) {
  entries.forEach((entry, idx) => {
    if (typeof entry === 'object' && entry !== null)
      entry.order = idx + 1
  })
}

function moveEntry(fromIndex: number, direction: 'up' | 'down') {
  if (!activeSectionId.value)
    return
  const current = contentStore[activeSectionId.value as number]?.[activeLocale.value]
  if (!Array.isArray(current))
    return
  const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
  if (toIndex < 0 || toIndex >= current.length)
    return
  // Use splice for proper Vue reactivity (direct index assignment isn't reliably tracked)
  const [movedItem] = current.splice(fromIndex, 1)
  current.splice(toIndex, 0, movedItem)
  // Recalculate order after move
  recalculateOrder(current)
}

function getRepeatableFieldValue(entryIndex: number, fieldKey: string): any {
  return repeatableEntries.value[entryIndex]?.[fieldKey] ?? ''
}

function setRepeatableFieldValue(entryIndex: number, fieldKey: string, value: any) {
  if (!activeSectionId.value)
    return
  const current = contentStore[activeSectionId.value as number]?.[activeLocale.value]
  if (!Array.isArray(current) || !current[entryIndex])
    return
  current[entryIndex]![fieldKey] = value
}

// ── Non-repeatable content helpers ────────────────────────────────────────────
const activeSectionContent = computed(() => {
  if (!activeSectionId.value)
    return {}
  const raw = contentStore[activeSectionId.value as number]?.[activeLocale.value]
  // If repeatable, return empty — use repeatableEntries instead
  if (Array.isArray(raw))
    return {}
  return raw || {}
})

function getFieldValue(fieldKey: string): any {
  return activeSectionContent.value[fieldKey] ?? ''
}

function setFieldValue(fieldKey: string, value: any) {
  if (!activeSectionId.value)
    return

  if (!contentStore[activeSectionId.value as number]) {
    contentStore[activeSectionId.value as number] = { en: {}, ar: {} }
  }
  if (!contentStore[activeSectionId.value as number]![activeLocale.value]) {
    contentStore[activeSectionId.value as number]![activeLocale.value] = {}
  }
  contentStore[activeSectionId.value as number]![activeLocale.value]![fieldKey] = value

  // Real-time frontend validation
  const fieldDef = activeSectionFields.value.find(f => f.key === fieldKey)
  if (fieldDef) {
    const error = validateField(fieldDef, value)

    if (!validationErrors[activeSectionId.value as number]) {
      validationErrors[activeSectionId.value as number] = { en: {}, ar: {} }
    }
    if (!validationErrors[activeSectionId.value as number]![activeLocale.value]) {
      validationErrors[activeSectionId.value as number]![activeLocale.value] = {}
    }

    if (error) {
      validationErrors[activeSectionId.value as number]![activeLocale.value]![fieldKey] = error
    }
    else {
      delete validationErrors[activeSectionId.value as number]![activeLocale.value]![fieldKey]
    }
  }
}

function localized(val: any): string {
  if (typeof val === 'string')
    return val
  if (!val)
    return '-'
  return val[locale.value] || val.en || val.ar || '-'
}

function getSectionStatusBadge(sectionId: number, loc: string): 'draft' | 'published' | 'empty' {
  // First check content_status from the section object (comes from API include)
  const section = sections.value.find(s => s.id === sectionId) as any
  if (section?.content_status) {
    const apiStatus = section.content_status[loc]
    if (apiStatus === 'published')
      return 'published'
    if (apiStatus === 'draft')
      return 'draft'
    // Locale not present in content_status → no content for this locale
    return 'empty'
  }

  // Fallback to our local tracking (when API doesn't include content_status)
  const status = contentStatus[sectionId]?.[loc]
  const content = contentStore[sectionId]?.[loc]
  if (!content || Object.keys(content).length === 0)
    return 'empty'
  return status === 1 ? 'published' : 'draft'
}

// ── Validation ────────────────────────────────────────────────────────────────

/** Get error for a specific field in the current active section/locale */
function getFieldError(fieldKey: string): string | undefined {
  if (!activeSectionId.value)
    return undefined
  return validationErrors[activeSectionId.value as number]?.[activeLocale.value]?.[fieldKey]
}

/** Check if a section has any validation errors (any locale) */
function sectionHasErrors(sectionId: number): boolean {
  const sectionErrors = validationErrors[sectionId]
  if (!sectionErrors)
    return false
  return Object.values(sectionErrors).some(localeErrors => Object.keys(localeErrors).length > 0)
}

/** Validate a single field value against its definition */
function validateField(field: CmsFieldDefinition, value: any): string | null {
  const isEmpty
    = value === undefined
      || value === null
      || value === ''
      || (Array.isArray(value) && value.length === 0)

  // Required check — only when schema marks field as required
  if (field.required && isEmpty) {
    const label
      = typeof field.label === 'string'
        ? field.label
        : field.label?.[locale.value as 'en' | 'ar'] || field.label?.en || field.key
    return t('validation.required', '{field} is required').replace('{field}', label)
  }

  // Skip further validation if value is empty and field is optional
  if (isEmpty)
    return null

  const strValue = String(value)

  // Min length (text, textarea, text_editor)
  if (field.min_length != null && strValue.length < field.min_length) {
    return t('validation.min_length', 'Minimum {min} characters').replace(
      '{min}',
      String(field.min_length),
    )
  }

  // Max length
  if (field.max_length != null && strValue.length > field.max_length) {
    return t('validation.max_length', 'Maximum {max} characters').replace(
      '{max}',
      String(field.max_length),
    )
  }

  // Email format
  if (field.type === 'email' && !/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(strValue)) {
    return t('validation.email', 'Invalid email address')
  }

  // Number range
  if (field.type === 'number') {
    const num = Number(value)
    if (Number.isNaN(num)) {
      return t('validation.number', 'Must be a valid number')
    }
    if (field.min != null && num < field.min) {
      return t('validation.min', 'Minimum value is {min}').replace('{min}', String(field.min))
    }
    if (field.max != null && num > field.max) {
      return t('validation.max', 'Maximum value is {max}').replace('{max}', String(field.max))
    }
  }

  // Regex pattern
  if (field.regex_pattern) {
    try {
      const re = new RegExp(field.regex_pattern)
      if (!re.test(strValue)) {
        return t('validation.pattern', 'Invalid format')
      }
    }
    catch {
      /* ignore invalid regex */
    }
  }

  return null
}

/** Validate active section for active locale. Returns true if valid. */
function validateCurrent(): boolean {
  // Clear all previous errors for the active section/locale
  if (activeSectionId.value) {
    if (!validationErrors[activeSectionId.value as number]) {
      validationErrors[activeSectionId.value as number] = { en: {}, ar: {} }
    }
    validationErrors[activeSectionId.value as number]![activeLocale.value] = {}
  }

  let hasErrors = false

  const section = activeSection.value
  if (!section)
    return true

  const fields = activeSectionFields.value || []
  if (fields.length === 0)
    return true

  const loc = activeLocale.value
  const content = contentStore[section.id]?.[loc] || {}

  for (const field of fields) {
    const value = content[field.key]
    const error = validateField(field, value)

    if (error) {
      validationErrors[section.id]![loc]![field.key] = error
      hasErrors = true
    }
  }

  return !hasErrors
}

// ── Sanitize content for API ──────────────────────────────────────────────────
/**
 * Sanitizes media field values before saving.
 *
 * The backend expects UUID temp-upload tokens for NEW media and omits
 * unchanged media fields (the backend preserves existing attachments
 * when the key is absent from the payload).
 *
 * CmsMediaField emits:
 *   - New single upload → [token]         (array with one string)
 *   - New multi upload  → [id, ..., token] (existing IDs + new tokens)
 *   - Cleared           → []               (empty array)
 *   - Untouched         → {id, url, ...}   (full server object from API)
 *
 * Strategy:
 *   - Full server object (has .url)  → OMIT key (return SKIP sentinel)
 *   - Empty array                    → null (clear the media)
 *   - Array with only IDs (numbers)  → OMIT key (nothing changed)
 *   - Array with tokens (strings)    → keep tokens, unwrap for single mode
 */
const SKIP_FIELD = Symbol('skip')

function sanitizeMediaValue(val: any, isMultiple: boolean): any {
  if (val === null || val === undefined || val === '')
    return val

  // Already a bare token string (UUID) — pass through
  if (typeof val === 'string')
    return val

  // Bare numeric ID → existing media, omit so backend keeps it
  if (typeof val === 'number')
    return SKIP_FIELD

  // Full server object → untouched media, omit
  if (typeof val === 'object' && !Array.isArray(val) && (val.url || val.thumb || val.id))
    return SKIP_FIELD

  // Array handling
  if (Array.isArray(val)) {
    // Empty array → user cleared the media
    if (val.length === 0)
      return null

    // Separate into tokens (strings) and existing IDs (numbers/objects)
    const tokens: string[] = []
    const existingIds: number[] = []
    for (const item of val) {
      if (typeof item === 'string')
        tokens.push(item)
      else if (typeof item === 'number')
        existingIds.push(item)
      else if (typeof item === 'object' && item !== null && item.id)
        existingIds.push(item.id)
    }

    // No new tokens — nothing changed, omit the field
    if (tokens.length === 0)
      return SKIP_FIELD

    // For non-multiple media, send just the first token as a scalar
    if (!isMultiple)
      return tokens[0]

    // For multiple media, send existing IDs + new tokens
    return [...existingIds, ...tokens]
  }

  return val
}

function sanitizeContentForSave(sectionId: number, rawContent: any): any {
  const sectionDef = sections.value.find(s => s.id === sectionId)
  if (!sectionDef)
    return rawContent

  // Build a map of media field key → field definition (to check `multiple`)
  const mediaFields = (sectionDef.fields || []).filter(f => f.type === 'media')

  // No media fields — nothing to sanitize
  if (mediaFields.length === 0)
    return rawContent

  const mediaFieldMap = new Map(mediaFields.map(f => [f.key, f]))

  function cleanEntry(entry: Record<string, any>): Record<string, any> {
    const cleaned = { ...entry }
    for (const [key, fieldDef] of mediaFieldMap) {
      if (key in cleaned) {
        const result = sanitizeMediaValue(cleaned[key], fieldDef.multiple === true)
        if (result === SKIP_FIELD)
          delete cleaned[key] // omit unchanged media — backend keeps existing
        else
          cleaned[key] = result
      }
    }
    return cleaned
  }

  // Repeatable: array of entry objects
  if (Array.isArray(rawContent)) {
    return rawContent.map((entry) => {
      if (typeof entry !== 'object' || entry === null)
        return entry
      return cleanEntry(entry)
    })
  }

  // Non-repeatable: flat object
  if (typeof rawContent === 'object' && rawContent !== null) {
    return cleanEntry(rawContent)
  }

  return rawContent
}

// ── Save section content ──────────────────────────────
async function handleSaveAll() {
  if (!page.value)
    return

  // ── SEO-only save: user is on the SEO panel ──
  if (activeSectionId.value === 'seo') {
    saving.value = true
    try {
      const cleanedSeo = cleanSeoPayload(seo.value)
      if (cleanedSeo && Object.keys(cleanedSeo).length > 0) {
        await cmsSeoService.saveBatch(page.value.id, { default: 'en', locales: cleanedSeo as Record<string, Partial<CmsSeoMeta>> })
      }
      toast.success(t('cms.seo_saved', 'SEO settings saved successfully'))
    }
    catch (err: any) {
      toast.error(t('common.error', 'Error'), {
        description: err.response?.data?.message || err.message || 'Failed to save SEO',
      })
    }
    finally {
      saving.value = false
    }
    return
  }

  // Run frontend validation first for active section/locale
  if (!validateCurrent()) {
    return
  }

  saving.value = true
  try {
    // Save only the active section for the active locale
    // POST /cms/sections/{sectionId}/content
    const sectionId = activeSectionId.value!
    const sectionContent = contentStore[sectionId as number] || { en: {}, ar: {} }
    const rawContent = sectionContent[activeLocale.value] || {}
    const content = sanitizeContentForSave(sectionId as number, rawContent)

    const saveResponse = await cmsSectionContentService.saveDraft(sectionId as number, {
      locale: activeLocale.value,
      is_default: activeLocale.value === 'en',
      content,
    })

    // Use the POST response data to update local state instead of re-fetching.
    // The GET endpoint returns stale published data which would overwrite
    // the just-saved draft, causing the UI to revert.
    mergeSaveResponse(sectionId as number, activeLocale.value, saveResponse)

    // Update snapshot after successful save
    originalContentStore.value = JSON.parse(JSON.stringify(contentStore))

    // Update local status to draft
    if (!contentStatus[sectionId as number])
      contentStatus[sectionId as number] = { en: 0, ar: 0 }
    contentStatus[sectionId as number]![activeLocale.value] = 0

    // Also save SEO if any data has been entered
    if (page.value?.id) {
      try {
        const cleanedSeo = cleanSeoPayload(seo.value)
        if (cleanedSeo && Object.keys(cleanedSeo).length > 0) {
          await cmsSeoService.saveBatch(page.value.id, { default: 'en', locales: cleanedSeo as Record<string, Partial<CmsSeoMeta>> })
        }
      }
      catch {
        // SEO save failure shouldn't block content save
      }
    }

    toast.success(t('cms.all_saved', 'All changes saved successfully'))
  }
  catch (err: any) {
    if (err.response?.status === 422 && err.response?.data?.errors) {
      const errors = err.response.data.errors
      const sectionId = activeSectionId.value!

      if (!validationErrors[sectionId as number])
        validationErrors[sectionId as number] = { en: {}, ar: {} }
      if (!validationErrors[sectionId as number]![activeLocale.value])
        validationErrors[sectionId as number]![activeLocale.value] = {}

      for (const [key, msgs] of Object.entries(errors)) {
        // Backend usually prefixes with 'content.' (e.g. 'content.dasda')
        const fieldKey = key.replace(/^content\./, '')
        validationErrors[sectionId as number]![activeLocale.value]![fieldKey] = (msgs as string[])[0] || 'Validation failed'
      }
    }
    else {
      toast.error(t('common.error', 'Error'), {
        description: err.response?.data?.message || err.message || 'Failed to save',
      })
    }
  }
  finally {
    saving.value = false
  }
}

// ── Publish active locale ─────────────────────────────────────────────────────
async function handlePublish() {
  if (!page.value || !activeSectionId.value)
    return

  // SEO doesn't have a publish concept — just save it
  if (activeSectionId.value === 'seo') {
    await handleSaveAll()
    return
  }

  // Run frontend validation first for active section/locale
  if (!validateCurrent()) {
    return
  }

  publishing.value = true
  try {
    const sectionId = activeSectionId.value as number
    const sectionContent = contentStore[sectionId] || { en: {}, ar: {} }
    const rawContent = sectionContent[activeLocale.value] || {}
    const content = sanitizeContentForSave(sectionId, rawContent)

    // Only save draft if there are actual changes since last save.
    // This prevents re-sending consumed temp upload tokens.
    const snapshotContent = originalContentStore.value?.[sectionId]?.[activeLocale.value]
    const hasChanges = JSON.stringify(content) !== JSON.stringify(
      snapshotContent ? sanitizeContentForSave(sectionId, snapshotContent) : undefined,
    )

    if (hasChanges) {
      const saveResponse = await cmsSectionContentService.saveDraft(sectionId, {
        locale: activeLocale.value,
        is_default: activeLocale.value === 'en',
        content,
      })

      // Use the POST response to update local state (no GET refetch)
      mergeSaveResponse(sectionId, activeLocale.value, saveResponse)

      // Update snapshot
      originalContentStore.value = JSON.parse(JSON.stringify(contentStore))
    }

    // Then publish
    await cmsSectionContentService.publish(sectionId, {
      locales: [activeLocale.value],
    })

    // Update local status to published
    if (!contentStatus[sectionId])
      contentStatus[sectionId] = { en: 0, ar: 0 }
    contentStatus[sectionId]![activeLocale.value] = 1

    // Also update the section object's content_status if it exists
    const sectionObj = sections.value.find(s => s.id === sectionId) as any
    if (sectionObj) {
      if (!sectionObj.content_status)
        sectionObj.content_status = {}
      sectionObj.content_status[activeLocale.value] = 'published'
    }

    toast.success(t('cms.published', `Published ${activeLocale.value.toUpperCase()} successfully`))
  }
  catch (err: any) {
    if (err.response?.status === 422 && err.response?.data?.errors) {
      const errors = err.response.data.errors
      const sectionId = activeSectionId.value!

      if (!validationErrors[sectionId as number])
        validationErrors[sectionId as number] = { en: {}, ar: {} }
      if (!validationErrors[sectionId as number]![activeLocale.value])
        validationErrors[sectionId as number]![activeLocale.value] = {}

      for (const [key, msgs] of Object.entries(errors)) {
        const fieldKey = key.replace(/^content\./, '')
        validationErrors[sectionId as number]![activeLocale.value]![fieldKey] = (msgs as string[])[0] || 'Validation failed'
      }
    }
    else {
      toast.error(t('common.error', 'Error'), {
        description: err.response?.data?.message || err.message || 'Failed to publish',
      })
    }
  }
  finally {
    publishing.value = false
  }
}

// ── Cancel (reset to original) ────────────────────────────────────────────────
function handleCancel() {
  // Restore original content from snapshot
  const original = originalContentStore.value
  Object.keys(contentStore).forEach(k => delete contentStore[Number(k)])
  for (const [sectionId, locales] of Object.entries(original)) {
    contentStore[Number(sectionId)] = JSON.parse(JSON.stringify(locales))
  }
  // Clear all validation errors
  Object.keys(validationErrors).forEach(k => delete validationErrors[Number(k)])
  toast.info(t('common.changes_discarded', 'Changes discarded'))
}

// ── Navigation ────────────────────────────────────────────────────────────────
function handleBack() {
  router.back()
}
</script>

<template>
  <ModularView>
    <div class="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      <!-- ═══ Loading ═══════════════════════════════════════════════════════ -->
      <div v-if="loading" class="flex-1 p-6">
        <div class="space-y-4 max-w-4xl mx-auto">
          <Skeleton class="h-10 w-64" />
          <div class="flex gap-4">
            <Skeleton class="h-[60vh] w-56 rounded-xl" />
            <Skeleton class="h-[60vh] flex-1 rounded-xl" />
          </div>
        </div>
      </div>

      <!-- ═══ Page not found ══════════════════════════════════════════════ -->
      <div v-else-if="!page" class="flex-1 flex items-center justify-center p-6">
        <div class="text-center max-w-sm">
          <div
            class="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4"
          >
            <HugeiconsIcon :icon="Cancel01Icon" :size="28" class="text-destructive" />
          </div>
          <h2 class="text-xl font-semibold text-foreground mb-2">
            {{ t('cms.page_not_found', 'Page Not Found') }}
          </h2>
          <p class="text-sm text-muted-foreground mb-4">
            {{
              t('cms.page_not_found_desc', 'The page for this slug could not be found in the CMS.')
            }}
          </p>
          <Button variant="outline" @click="handleBack">
            {{ t('common.go_back', 'Go Back') }}
          </Button>
        </div>
      </div>

      <!-- ═══ No sections ═════════════════════════════════════════════════ -->
      <div v-else-if="sections.length === 0" class="flex-1 flex items-center justify-center p-6">
        <div class="text-center max-w-sm">
          <div class="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <HugeiconsIcon :icon="CheckmarkCircle02Icon" :size="28" class="text-muted-foreground" />
          </div>
          <h2 class="text-xl font-semibold text-foreground mb-2">
            {{ t('cms.no_content_sections', 'No Content Sections') }}
          </h2>
          <p class="text-sm text-muted-foreground">
            {{
              t(
                'cms.no_content_sections_desc',
                'This page has no visible sections to edit. An administrator needs to set up the page structure first.',
              )
            }}
          </p>
        </div>
      </div>

      <!-- ═══ Content Editor ════════════════════════════════════════════════ -->
      <template v-else>
        <!-- ── Top Bar ─────────────────────────────────────────────────────── -->
        <div
          class="shrink-0 px-6 py-3 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between gap-4"
        >
          <div class="flex items-center gap-3 min-w-0">
            <button
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors shrink-0"
              @click="handleBack"
            >
              <HugeiconsIcon :icon="ArrowLeft02Icon" :size="16" />
            </button>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h1 class="text-lg font-semibold text-foreground truncate">
                  {{ pageName || t('content.edit_page_content', 'Edit Page Content') }}
                </h1>
                <Badge variant="outline" class="text-[10px] uppercase tracking-wider shrink-0">
                  {{ t('cms.content_editor', 'Content') }}
                </Badge>
              </div>
            </div>
          </div>

          <!-- Locale Tabs -->
          <div class="flex items-center rounded-lg border border-border overflow-hidden">
            <button
              class="px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
              :class="
                activeLocale === 'en'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              "
              @click="activeLocale = 'en'"
            >
              {{ $t('common.lang_en_short', 'EN') }}
            </button>
            <button
              class="px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
              :class="
                activeLocale === 'ar'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              "
              @click="activeLocale = 'ar'"
            >
              {{ $t('common.lang_ar_short', 'AR') }}
            </button>
          </div>
        </div>

        <!-- ── Main Layout: Sidebar + Content ──────────────────────────────── -->
        <div class="flex-1 flex overflow-hidden">
          <!-- Section Navigator Sidebar -->
          <aside class="w-56 shrink-0 border-e border-border bg-card/50 overflow-y-auto">
            <div class="p-3">
              <p
                class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 px-2"
              >
                {{ t('cms.page_sections', 'Page Sections') }}
              </p>
              <nav class="space-y-0.5">
                <button
                  v-for="section in sections"
                  :key="section.id"
                  class="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-start transition-all cursor-pointer text-sm"
                  :class="[
                    activeSectionId === section.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  ]"
                  @click="activeSectionId = section.id"
                >
                  <!-- Section icon indicator / error dot -->
                  <span
                    class="w-1.5 h-1.5 rounded-full shrink-0"
                    :class="
                      sectionHasErrors(section.id)
                        ? 'bg-destructive'
                        : activeSectionId === section.id
                          ? 'bg-primary'
                          : 'bg-muted-foreground/30'
                    "
                  />
                  <span class="truncate flex-1">{{ localized(section.label) }}</span>
                  <!-- Error count badge -->
                  <Badge
                    v-if="sectionHasErrors(section.id)"
                    variant="destructive"
                    class="text-[9px] shrink-0 px-1.5"
                  >
                    !
                  </Badge>
                  <Badge v-else variant="secondary" class="text-[9px] shrink-0 px-1.5">
                    {{ (section.fields || []).length }}
                  </Badge>
                </button>
              </nav>

              <!-- SEO Navigation Item -->
              <div class="mt-3 border-t border-border pt-3">
                <button
                  class="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-start transition-all cursor-pointer text-sm"
                  :class="[
                    activeSectionId === 'seo'
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  ]"
                  @click="activeSectionId = 'seo'"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full shrink-0"
                    :class="activeSectionId === 'seo' ? 'bg-primary' : 'bg-muted-foreground/30'"
                  />
                  <span class="truncate flex-1">{{ t('cms.seo', 'SEO') }}</span>
                  <Badge variant="secondary" class="text-[9px] shrink-0 px-1.5">
                    {{ t('cms.optional', 'Optional') }}
                  </Badge>
                </button>
              </div>
            </div>
          </aside>

          <!-- Content Panel -->
          <main class="flex-1 overflow-y-auto">
            <div v-if="activeSection" class="p-6 max-w-3xl mx-auto pb-32">
              <!-- Section Header -->
              <div class="mb-6">
                <div class="flex items-center gap-2 mb-1">
                  <p
                    class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold"
                  >
                    {{ t('cms.content_editor', 'Content Editor') }}
                  </p>
                </div>
                <div class="flex items-center justify-between">
                  <h2 class="text-xl font-semibold text-foreground">
                    {{ localized(activeSection.label) }}
                  </h2>
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                    :class="
                      getSectionStatusBadge(activeSection.id, activeLocale) === 'published'
                        ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
                        : getSectionStatusBadge(activeSection.id, activeLocale) === 'draft'
                          ? 'bg-amber-500/15 text-amber-500 border border-amber-500/20'
                          : 'bg-muted text-muted-foreground border border-border'
                    "
                  >
                    {{
                      getSectionStatusBadge(activeSection.id, activeLocale) === 'published'
                        ? $t('common.published', 'Published')
                        : getSectionStatusBadge(activeSection.id, activeLocale) === 'draft'
                          ? $t('common.draft', 'Draft')
                          : $t('cms.empty', 'Empty')
                    }}
                  </span>
                </div>
              </div>

              <!-- No fields state -->
              <Card v-if="activeSectionFields.length === 0" class="border-dashed">
                <CardContent class="py-12 text-center">
                  <p class="text-sm text-muted-foreground">
                    {{ t('cms.no_fields_content', 'This section has no editable fields.') }}
                  </p>
                </CardContent>
              </Card>

              <!-- Fields Form -->
              <div v-else :dir="activeLocale === 'ar' ? 'rtl' : 'ltr'" class="space-y-4">
                <!-- ═══ REPEATABLE SECTION ════════════════════════════════ -->
                <template v-if="isRepeatableSection">
                  <!-- Entry count header -->
                  <div class="flex items-center justify-between">
                    <p class="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                      {{ activeLocale === 'ar' ? $t('common.lang_ar_content', 'المحتوى العربي') : $t('common.lang_en_content', 'English Content') }}
                      <span class="text-xs opacity-70">({{ repeatableEntries.length }})</span>
                    </p>
                  </div>

                  <!-- Entries list -->
                  <div class="space-y-2">
                    <div
                      v-for="(entry, entryIndex) in repeatableEntries"
                      :key="entry.id || entryIndex"
                      class="border border-border rounded-xl overflow-hidden bg-card transition-all"
                    >
                      <!-- Entry Header -->
                      <div
                        class="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                        @click="toggleEntryCollapse(entryIndex)"
                      >
                        <!-- Collapse toggle -->
                        <button
                          class="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 transition-transform"
                          :class="{ 'rotate-180': !collapsedEntries.has(entryIndex) }"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>

                        <!-- Entry label -->
                        <span class="text-sm font-medium text-foreground flex-1 truncate">
                          {{ entry[activeSectionFields[0]?.key || ''] || `#${entryIndex + 1}` }}
                        </span>

                        <!-- Actions -->
                        <div class="flex items-center gap-1 shrink-0" @click.stop>
                          <!-- Move up -->
                          <button
                            class="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            :disabled="entryIndex === 0"
                            :title="$t('common.move_up', 'Move up')"
                            @click="moveEntry(entryIndex, 'up')"
                          >
                            <HugeiconsIcon :icon="ArrowUp01Icon" :size="14" class="text-muted-foreground" />
                          </button>
                          <!-- Move down -->
                          <button
                            class="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            :disabled="entryIndex === repeatableEntries.length - 1"
                            :title="$t('common.move_down', 'Move down')"
                            @click="moveEntry(entryIndex, 'down')"
                          >
                            <HugeiconsIcon :icon="ArrowDown01Icon" :size="14" class="text-muted-foreground" />
                          </button>
                          <!-- Delete -->
                          <button
                            class="w-7 h-7 flex items-center justify-center rounded-md hover:bg-destructive/10 transition-colors cursor-pointer"
                            :title="$t('common.delete', 'Delete')"
                            @click="removeEntry(entryIndex)"
                          >
                            <HugeiconsIcon :icon="Delete02Icon" :size="14" class="text-destructive" />
                          </button>
                        </div>
                      </div>

                      <!-- Entry Body (collapsible) -->
                      <Transition name="slide">
                        <div v-if="!collapsedEntries.has(entryIndex)" class="px-4 pb-4 pt-1 space-y-4 border-t border-border">
                          <template v-for="field in activeSectionFields" :key="field.key">
                            <CmsFieldRenderer
                              :field="field"
                              :model-value="getRepeatableFieldValue(entryIndex, field.key)"
                              :sibling-values="entry"
                              :locale="activeLocale"
                              @update:model-value="setRepeatableFieldValue(entryIndex, field.key, $event)"
                            />
                          </template>
                        </div>
                      </Transition>
                    </div>
                  </div>

                  <!-- Add entry button -->
                  <button
                    class="w-full py-3 border-2 border-dashed border-border rounded-xl text-sm font-medium text-primary hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    @click="addEntry"
                  >
                    <HugeiconsIcon :icon="Add01Icon" :size="16" />
                    {{ $t('cms.add_entry', '+ Add an entry') }}
                  </button>
                </template>

                <!-- ═══ SINGLE (NON-REPEATABLE) SECTION ═══════════════════ -->
                <Card v-else>
                  <CardHeader class="pb-2">
                    <CardTitle
                      class="text-sm text-muted-foreground font-medium uppercase tracking-wider"
                    >
                      {{ activeLocale === 'ar' ? $t('common.lang_ar_content', 'المحتوى العربي') : $t('common.lang_en_content', 'English Content') }}
                    </CardTitle>
                  </CardHeader>
                  <CardContent class="space-y-5">
                    <template v-for="field in activeSectionFields" :key="field.key">
                      <CmsFieldRenderer
                        :field="field"
                        :model-value="getFieldValue(field.key)"
                        :sibling-values="activeSectionContent"
                        :locale="activeLocale"
                        :error="getFieldError(field.key)"
                        @update:model-value="setFieldValue(field.key, $event)"
                      />
                    </template>
                  </CardContent>
                </Card>
              </div>
            </div>

            <!-- SEO Panel in Content Area -->
            <div v-else-if="activeSectionId === 'seo'" class="p-6 max-w-3xl mx-auto pb-32">
              <div class="mb-6">
                <div class="flex items-center gap-2 mb-1">
                  <p class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    {{ t('cms.seo', 'SEO') }}
                  </p>
                </div>
                <h2 class="text-xl font-semibold text-foreground">
                  {{ t('cms.seo_settings', 'SEO Settings') }}
                </h2>
              </div>
              <PageSeoPanel v-model="seo" :locale="activeLocale" />
            </div>

            <!-- No section selected -->
            <div v-else class="flex-1 flex items-center justify-center h-full">
              <p class="text-sm text-muted-foreground">
                {{ t('cms.select_section', 'Select a section from the sidebar') }}
              </p>
            </div>
          </main>
        </div>

        <!-- ── Bottom Fixed Action Bar ─────────────────────────────────────── -->
        <div
          class="shrink-0 px-6 py-3 border-t border-border bg-card/80 backdrop-blur-sm flex items-center justify-between gap-4"
        >
          <p class="text-xs text-muted-foreground">
            {{ sections.length }} {{ t('cms.sections', 'sections') }}
            {{ $t('common.separator', '·') }} {{ activeLocale.toUpperCase() }}
          </p>
          <div class="flex items-center gap-3" :class="locale === 'ar' ? 'flex-row-reverse' : ''">
            <Button variant="outline" :disabled="saving || publishing" @click="handleCancel">
              {{ t('common.cancel', 'Cancel') }}
            </Button>
            <Button
              variant="secondary"
              :loading="publishing"
              :disabled="saving || publishing"
              @click="handlePublish"
            >
              <HugeiconsIcon :icon="CheckmarkCircle02Icon" :size="14" />
              {{ t('cms.publish_locale', 'Publish {locale}').replace('{locale}', activeLocale.toUpperCase()) }}
            </Button>
            <Button :loading="saving" :disabled="saving || publishing" @click="handleSaveAll">
              <HugeiconsIcon :icon="CheckmarkCircle02Icon" :size="14" />
              {{ t('cms.save_draft', 'Save Draft') }}
            </Button>
          </div>
        </div>
      </template>
    </div>
  </ModularView>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 2000px;
}
</style>

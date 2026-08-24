/**
 * CMS Headless — Type definitions.
 *
 * Aligned with the Neop BA Headless CMS backend API.
 * The CMS works in two phases:
 *   1. STRUCTURE: Admin defines Pages → Sections → inline Fields (schema).
 *   2. CONTENT:   Admin fills in field values per locale, saves as draft, then publishes.
 */

// ─── Bilingual Helper ────────────────────────────────────────────────────────

/** Bilingual text object used throughout the CMS */
export interface Bilingual {
  en: string
  ar: string
}

// ─── Field Types ─────────────────────────────────────────────────────────────

/** All 15 field types supported by the backend */
export type CmsFieldType
  = | 'text'
    | 'textarea'
    | 'text_editor'
    | 'number'
    | 'boolean'
    | 'date'
    | 'email'
    | 'password'
    | 'color'
    | 'enumeration'
    | 'media'
    | 'relation'
    | 'component'
    | 'json'
    | 'rich_text_blocks'

// ─── Field Condition ─────────────────────────────────────────────────────────

/** Conditional visibility for a field based on a sibling field value */
export type CmsConditionOperator
  = | 'eq'
    | 'neq'
    | 'ne'
    | 'in'
    | 'not_in'
    | 'gt'
    | 'lt'
    | 'gte'
    | 'lte'
    | 'contains'
    | 'not_contains'

export interface CmsCondition {
  /** Sibling field key to evaluate */
  field: string
  /** Comparison operator */
  operator: CmsConditionOperator
  /** Value to compare against */
  value: any
}

// ─── Field Definition ────────────────────────────────────────────────────────

/**
 * A single field definition within a section.
 * Defines schema — NOT content. Content is stored separately via the content API.
 */
export interface CmsFieldDefinition {
  /** Unique field key within the section (snake_case) */
  key: string
  /** Bilingual display label */
  label: Bilingual
  /** The field type */
  type: CmsFieldType

  // ── Universal optional properties ──
  /** Whether the field is required */
  required?: boolean
  /** Whether the field value is per-locale (translatable) */
  translatable?: boolean
  /** Default value for the field */
  default?: any
  /** Whether the field is private (stripped from public API) */
  private?: boolean
  /** Regex validation pattern */
  regex_pattern?: string
  /** Conditional visibility */
  condition?: CmsCondition

  // ── Text / Textarea / Text Editor ──
  /** Minimum length for text-based fields */
  min_length?: number
  /** Maximum length for text-based fields */
  max_length?: number

  // ── Number ──
  /** Number subtype */
  number_type?: 'integer' | 'float' | 'decimal'
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number

  // ── Date ──
  /** Date subtype */
  date_type?: 'date' | 'datetime' | 'time'
  /** Date format string */
  format?: string

  // ── Enumeration ──
  /** Allowed values for enumeration type */
  options?: string[]

  // ── Media ──
  /** Whether to allow multiple files */
  multiple?: boolean
  /** Allowed media types (backend uses plural group names) */
  allowed_types?: ('images' | 'videos' | 'documents' | 'audio' | 'all')[]
  /** Minimum number of items (media, component) */
  min_items?: number
  /** Maximum number of items (media, component) */
  max_items?: number

  // ── Relation ──
  /** Relation cardinality */
  relation_type?: 'one_to_one' | 'one_to_many'
  /** Backend model table to relate to */
  model_table?: string

  // ── Component ──
  /** Reference key of a reusable section used as component schema */
  component_ref?: string
  /** Whether the component is repeatable (array of entries) */
  repeatable?: boolean

  // ── Color ──
  /** Color output format */
  color_format?: 'hex' | 'rgb' | 'hsl'
}

// ─── Section ─────────────────────────────────────────────────────────────────

/** Content mode for reusable sections placed on pages */
export type CmsContentMode = 'shared' | 'override'

/** A section within a page — either inline (with fields) or a reusable reference */
export interface CmsSection {
  id: number
  uuid?: string
  /** Unique section key within the page (snake_case) */
  key: string
  /** Bilingual display label */
  label: Bilingual
  /** Inline field definitions (empty if reusable reference) */
  fields: CmsFieldDefinition[]
  /** Display order (0-based) */
  order: number
  /** Whether the section is hidden from the public API */
  is_hidden: boolean
  /** Whether this section is a reusable reference */
  is_reusable?: boolean
  /** Whether this section is repeatable */
  is_repeatable?: boolean
  /** Parent section ID for nesting (max 2 levels) */
  parent_id?: number | null
  /** If referencing a reusable section, its ID */
  reusable_section_id?: number | null
  /** Content mode when referencing a reusable section */
  content_mode?: CmsContentMode
  /** The page this section belongs to */
  page_id: number
}

// ─── Reusable Section (Library) ──────────────────────────────────────────────

/** A reusable section in the library */
export interface CmsReusableSection {
  id: number
  uuid?: string
  /** Unique key (snake_case) */
  key: string
  /** Bilingual display label */
  label: Bilingual
  /** Field definitions */
  fields: CmsFieldDefinition[]
  /** Whether this section is repeatable */
  is_repeatable: boolean
  /** Content mode: shared (one content for all pages) or override (per-page content) */
  content_mode: CmsContentMode
  /** Display order */
  order: number
  /** Whether hidden from the public API */
  is_hidden: boolean
  /** Number of pages using this reusable section */
  pages_count?: number
  /** Timestamps */
  created_at?: string
  updated_at?: string
}

// ─── Section Content / Translations ──────────────────────────────────────────

/** Content status: 0 = draft, 1 = published */
export type CmsContentStatus = 0 | 1

/** A single locale's content for a section */
export interface CmsSectionTranslation {
  /** Locale code (e.g. 'en', 'ar') */
  locale: string
  /** Draft (0) or Published (1) */
  status: CmsContentStatus
  /** Field values keyed by field key */
  content: Record<string, any>
  /** Whether this is the default locale */
  is_default?: boolean
}

// ─── SEO ─────────────────────────────────────────────────────────────────────

/** SEO metadata for a single locale */
export interface CmsSeoMeta {
  /** Locale code */
  locale?: string
  /** Whether this is the default locale */
  is_default?: boolean
  /** SEO page title */
  title?: string
  /** Meta description */
  description?: string
  /** Meta keywords */
  keywords?: string
  /** Canonical URL */
  canonical_url?: string
  /** Open Graph title */
  og_title?: string
  /** Open Graph description */
  og_description?: string
  /** Open Graph image (UUID temp token or media ID) */
  og_image?: string | number
  /** Twitter card type */
  twitter_card?: 'summary' | 'summary_large_image' | 'app' | 'player'
  /** Twitter card title */
  twitter_title?: string
  /** Twitter card description */
  twitter_description?: string
  /** Robots directive */
  robots?: string
}

// ─── Page ────────────────────────────────────────────────────────────────────

/** Page status enum */
export type CmsPageStatus = 'draft' | 'published'

/** A CMS page */
export interface CmsPage {
  id: number
  uuid?: string
  /** Bilingual URL-friendly slugs */
  slug: Bilingual
  /** Bilingual page title */
  title: Bilingual
  /** Page type */
  type?: string | number
  /** Page status */
  status: CmsPageStatus | number
  /** Page metadata */
  meta?: Record<string, any>
  /** Published timestamp */
  published_at?: string | null
  /** Sections (loaded via ?include=sections) */
  sections?: CmsSection[]
  /** SEO metas (loaded via ?include=seoMetas) */
  seo_metas?: CmsSeoMeta[]
  /** Timestamps */
  created_at?: string
  updated_at?: string
}

// ─── Request Payloads ────────────────────────────────────────────────────────

/** POST /cms/pages — create a new page */
export interface CreatePagePayload {
  slug: Bilingual
  title: Bilingual
  /** Optional SEO data — saved atomically with the page */
  seo?: Record<string, Partial<CmsSeoMeta>>
}

/** PUT /cms/pages/{id} — update page metadata */
export interface UpdatePagePayload {
  slug?: Bilingual
  title?: Bilingual
  meta?: Record<string, any>
}

/** POST /cms/pages/{pageId}/sections — create inline section */
export interface CreateInlineSectionPayload {
  page_id: number | string
  key: string
  label: Bilingual
  order?: number
  fields: CmsFieldDefinition[]
  is_repeatable?: boolean
  is_hidden?: boolean
  parent_id?: number | null
}

/** POST /cms/pages/{pageId}/sections — create reusable section reference */
export interface CreateReusableRefPayload {
  page_id: number | string
  key: string
  label: Bilingual
  order?: number
  reusable_section_id: number
  is_repeatable?: boolean
  is_hidden?: boolean
}

/** PUT /cms/pages/{pageId}/sections/{sectionId} — update section */
export interface UpdateSectionPayload {
  label?: Bilingual
  order?: number
  fields?: CmsFieldDefinition[]
  is_repeatable?: boolean
  is_hidden?: boolean
}

/** POST /cms/sections/{id}/content — save draft for one locale */
export interface SingleLocaleContentPayload {
  locale: string
  is_default?: boolean
  content: Record<string, any>
}

/** POST /cms/sections/{id}/content/batch — save draft for all locales */
export interface BatchContentPayload {
  default: string
  locales: Record<string, Record<string, any>>
}

/** POST /cms/pages/{id}/content/batch — save all sections at once */
export interface PageBatchContentPayload {
  default: string
  sections: Record<string, Record<string, Record<string, any>>>
}

/** POST /cms/sections/{id}/content/publish */
export interface PublishContentPayload {
  locales?: string[]
}

/** POST /cms/sections/reorder or /cms/reusable/reorder */
export interface ReorderPayload {
  items: Array<{ id: number, order: number }>
}

/** POST /cms/pages/{pageId}/seo — upsert one locale */
export interface SingleSeoPayload extends CmsSeoMeta {
  locale: string
  is_default?: boolean
}

/** POST /cms/pages/{pageId}/seo/batch — upsert all locales */
export interface BatchSeoPayload {
  default: string
  locales: Record<string, Partial<CmsSeoMeta>>
}

/** POST /cms/reusable — create reusable library entry */
export interface CreateReusablePayload {
  key: string
  label: Bilingual
  is_repeatable?: boolean
  content_mode: CmsContentMode
  fields: CmsFieldDefinition[]
}

/** PUT /cms/reusable/{id} — update library entry */
export interface UpdateReusablePayload {
  label?: Bilingual
  fields?: CmsFieldDefinition[]
  is_repeatable?: boolean
  content_mode?: CmsContentMode
}

// ─── Backward Compatibility Aliases ──────────────────────────────────────────
// These aliases keep existing views compiling until they're migrated in Phase 2–4.

/**
 * CmsSectionField — extends CmsFieldDefinition with picker-specific properties.
 * Used as the transient shape between FieldTypePicker and the view layer mappers.
 */
export interface CmsSectionField extends CmsFieldDefinition {
  /** Alias for 'translatable' — used by FieldTypePicker */
  bilingual?: boolean
  /** Sort order (used by UI, not sent to backend) */
  sortOrder?: number
  /** Picker config bundle (media, number, date, relation settings) */
  config?: CmsFieldConfig
}

/** @deprecated Use CmsSection */
export type CmsSectionDefinition = CmsSection

/** @deprecated Use CmsPage */
export type CmsPageDefinition = CmsPage

/** @deprecated Use CmsSeoMeta */
export type CmsSeoLocale = CmsSeoMeta

/** @deprecated Use CreatePagePayload */
export type CmsCreatePagePayload = CreatePagePayload

/** @deprecated — old content shape, will be removed */
export interface CmsSectionContent {
  key: string
  fields: Record<string, any>
  is_published: boolean
}

/** @deprecated — old content shape, will be removed */
export interface CmsPageContent {
  slug: string
  is_published: boolean
  sections: CmsSectionContent[]
  updatedAt?: string
}

/** @deprecated Use CmsFieldDefinition config directly */
export interface CmsFieldConfig {
  mediaMultiple?: boolean
  mediaAllowedTypes?: ('images' | 'videos' | 'files' | 'audios')[]
  minLength?: number
  maxLength?: number
  numberFormat?: 'integer' | 'float' | 'decimal'
  min?: number
  max?: number
  includeTime?: boolean
  relationResource?: string
  relationType?: 'one-to-one' | 'one-to-many'
  selectOptions?: { value: string, label: string }[]
  defaultValue?: any
}

/** @deprecated Use Record<string, Partial<CmsSeoMeta>> */
export interface CmsSeo {
  en: CmsSeoMeta
  ar: CmsSeoMeta
}

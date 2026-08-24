/**
 * CMS Headless — API Services
 *
 * Four service objects aligned with the backend API:
 *   1. cmsPageService         — Pages CRUD + publish/unpublish/duplicate
 *   2. cmsSectionService      — Sections CRUD within a page + global reorder/toggle
 *   3. cmsSectionContentService — Section content (draft/publish per locale)
 *   4. cmsReusableService     — Reusable Library CRUD + content + publish
 *
 * All services use the Axios instance from `./api.ts`.
 * No mock data — real API calls only.
 */

import type {
  BatchContentPayload,
  CmsPage,
  CmsReusableSection,
  CmsSection,
  CmsSectionTranslation,
  CreateInlineSectionPayload,
  CreatePagePayload,
  CreateReusablePayload,
  CreateReusableRefPayload,
  PageBatchContentPayload,
  PublishContentPayload,
  ReorderPayload,
  SingleLocaleContentPayload,
  UpdatePagePayload,
  UpdateReusablePayload,
  UpdateSectionPayload,
} from '@/types/cms'
import { API_ENDPOINTS } from '@/constants/endpoints'
import api from './api'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Unwrap standard `{ data: T }` or `{ data: { data: T } }` responses */
function unwrap<T>(response: any): T {
  return response.data?.data ?? response.data
}

/** Unwrap list responses: `{ data: T[], meta?: {...} }` */
function unwrapList<T>(response: any): { data: T[], meta: any } {
  const d = response.data
  return {
    data: d?.data ?? [],
    meta: d?.meta ?? {},
  }
}

// ─── Page Service ────────────────────────────────────────────────────────────

export const cmsPageService = {
  /**
   * List all pages.
   * GET /cms/pages?translated=true
   */
  async list(params?: Record<string, any>) {
    const response = await api.get(API_ENDPOINTS.CMS.PAGES, {
      params: { translated: true, ...params },
    })
    return unwrapList<CmsPage>(response)
  },

  /**
   * Get a single page by ID.
   * GET /cms/pages/{id}?translated=true&include=seo,sections
   */
  async get(id: number | string, params?: Record<string, any>) {
    const response = await api.get(API_ENDPOINTS.CMS.PAGE(id), {
      params: { translated: true, include: 'seoMetas,sections', ...params },
    })
    return unwrap<CmsPage>(response)
  },

  /**
   * Create a new page (with optional inline SEO).
   * POST /cms/pages
   */
  async create(payload: CreatePagePayload) {
    const response = await api.post(API_ENDPOINTS.CMS.PAGES, payload)
    return unwrap<CmsPage>(response)
  },

  /**
   * Update page metadata.
   * PUT /cms/pages/{id}
   */
  async update(id: number | string, payload: UpdatePagePayload) {
    const response = await api.put(API_ENDPOINTS.CMS.PAGE(id), payload)
    return unwrap<CmsPage>(response)
  },

  /**
   * Delete a page.
   * DELETE /cms/pages/{id}
   */
  async delete(id: number | string) {
    await api.delete(API_ENDPOINTS.CMS.PAGE(id))
  },

  /**
   * Publish a page.
   * POST /cms/pages/{id}/publish
   */
  async publish(id: number | string) {
    const response = await api.post(API_ENDPOINTS.CMS.PAGE_PUBLISH(id))
    return unwrap<CmsPage>(response)
  },

  /**
   * Unpublish a page.
   * POST /cms/pages/{id}/unpublish
   */
  async unpublish(id: number | string) {
    const response = await api.post(API_ENDPOINTS.CMS.PAGE_UNPUBLISH(id))
    return unwrap<CmsPage>(response)
  },

  /**
   * Duplicate a page (deep copy, status=draft, UUID-suffixed slug).
   * POST /cms/pages/{id}/duplicate
   */
  async duplicate(id: number | string) {
    const response = await api.post(API_ENDPOINTS.CMS.PAGE_DUPLICATE(id))
    return unwrap<CmsPage>(response)
  },

  /**
   * Batch save content for ALL sections of a page at once.
   * POST /cms/pages/{id}/content/batch
   *
   * Payload: { default: "en", sections: { "12": { "en": {...}, "ar": {...} }, ... } }
   */
  async batchContent(id: number | string, payload: PageBatchContentPayload) {
    const response = await api.post(API_ENDPOINTS.CMS.PAGE_CONTENT_BATCH(id), payload)
    return unwrap<any>(response)
  },
}

// ─── Section Service ─────────────────────────────────────────────────────────

export const cmsSectionService = {
  /**
   * List all sections for a page.
   * GET /cms/pages/{pageId}/sections
   */
  async list(pageId: number | string) {
    const response = await api.get(API_ENDPOINTS.CMS.SECTIONS(pageId))
    return unwrapList<CmsSection>(response)
  },

  /**
   * Create an inline section with field schema.
   * POST /cms/pages/{pageId}/sections
   *
   * G4: provide `fields` OR `reusable_section_id`, never both.
   */
  async createInline(pageId: number | string, payload: CreateInlineSectionPayload) {
    const response = await api.post(API_ENDPOINTS.CMS.SECTIONS(pageId), payload)
    return unwrap<CmsSection>(response)
  },

  /**
   * Create a section that references a reusable library entry.
   * POST /cms/pages/{pageId}/sections
   */
  async createReusableRef(pageId: number | string, payload: CreateReusableRefPayload) {
    const response = await api.post(API_ENDPOINTS.CMS.SECTIONS(pageId), payload)
    return unwrap<CmsSection>(response)
  },

  /**
   * Update a section (label, order, fields).
   * PUT /cms/pages/{pageId}/sections/{sectionId}
   */
  async update(pageId: number | string, sectionId: number | string, payload: UpdateSectionPayload) {
    const response = await api.put(API_ENDPOINTS.CMS.SECTION(pageId, sectionId), payload)
    return unwrap<CmsSection>(response)
  },

  /**
   * Delete a section from a page.
   * DELETE /cms/pages/{pageId}/sections/{sectionId}
   */
  async delete(pageId: number | string, sectionId: number | string) {
    await api.delete(API_ENDPOINTS.CMS.SECTION(pageId, sectionId))
  },

  /**
   * Reorder sections (global, not page-scoped).
   * POST /cms/sections/reorder
   */
  async reorder(payload: ReorderPayload) {
    const response = await api.post(API_ENDPOINTS.CMS.SECTIONS_REORDER, payload)
    return unwrap<any>(response)
  },

  /**
   * Toggle section visibility (is_hidden).
   * POST /cms/sections/{sectionId}/toggle
   */
  async toggle(sectionId: number | string) {
    const response = await api.post(API_ENDPOINTS.CMS.SECTION_TOGGLE(sectionId))
    return unwrap<CmsSection>(response)
  },
}

// ─── Section Content Service ─────────────────────────────────────────────────

export const cmsSectionContentService = {
  /**
   * Get content for all locales.
   * GET /cms/sections/{sectionId}/content?scope=media.full
   */
  async getAll(sectionId: number | string, scope: string = 'media.full') {
    const response = await api.get(API_ENDPOINTS.CMS.SECTION_CONTENT(sectionId), {
      params: { scope },
    })
    return unwrap<Record<string, CmsSectionTranslation>>(response)
  },

  /**
   * Get content for a single locale.
   * GET /cms/sections/{sectionId}/content/{locale}
   */
  async getLocale(sectionId: number | string, locale: string) {
    const response = await api.get(API_ENDPOINTS.CMS.SECTION_CONTENT_LOCALE(sectionId, locale))
    return unwrap<CmsSectionTranslation>(response)
  },

  /**
   * Save draft for a single locale.
   * POST /cms/sections/{sectionId}/content
   */
  async saveDraft(sectionId: number | string, payload: SingleLocaleContentPayload) {
    const response = await api.post(API_ENDPOINTS.CMS.SECTION_CONTENT(sectionId), payload)
    return unwrap<any>(response)
  },

  /**
   * Save draft for all locales at once.
   * POST /cms/sections/{sectionId}/content/batch
   */
  async saveBatch(sectionId: number | string, payload: BatchContentPayload) {
    const response = await api.post(API_ENDPOINTS.CMS.SECTION_CONTENT_BATCH(sectionId), payload)
    return unwrap<any>(response)
  },

  /**
   * Publish draft content.
   * POST /cms/sections/{sectionId}/content/publish
   *
   * Omit `locales` to publish all available drafts.
   */
  async publish(sectionId: number | string, payload?: PublishContentPayload) {
    const response = await api.post(API_ENDPOINTS.CMS.SECTION_CONTENT_PUBLISH(sectionId), payload)
    return unwrap<any>(response)
  },

  /**
   * Preview resolved draft output (media expanded, conditions evaluated).
   * GET /cms/sections/{sectionId}/content/preview?locale=X
   */
  async preview(sectionId: number | string, locale: string) {
    const response = await api.get(API_ENDPOINTS.CMS.SECTION_CONTENT_PREVIEW(sectionId), {
      params: { locale },
    })
    return unwrap<any>(response)
  },

  /**
   * Delete published content for a locale (draft preserved).
   * DELETE /cms/sections/{sectionId}/content/{locale}
   */
  async deleteLocale(sectionId: number | string, locale: string) {
    await api.delete(API_ENDPOINTS.CMS.SECTION_CONTENT_LOCALE(sectionId, locale))
  },
}

// ─── Reusable Library Service ────────────────────────────────────────────────

export const cmsReusableService = {
  /**
   * List all reusable library entries.
   * GET /cms/reusable?translated=true
   */
  async list(params?: Record<string, any>) {
    const response = await api.get(API_ENDPOINTS.CMS.REUSABLE, {
      params: { translated: true, ...params },
    })
    return unwrapList<CmsReusableSection>(response)
  },

  /**
   * Get a single reusable section.
   * GET /cms/reusable/{id}
   */
  async get(id: number | string) {
    const response = await api.get(API_ENDPOINTS.CMS.REUSABLE_ITEM(id))
    return unwrap<CmsReusableSection>(response)
  },

  /**
   * Create a reusable library entry.
   * POST /cms/reusable
   */
  async create(payload: CreateReusablePayload) {
    const response = await api.post(API_ENDPOINTS.CMS.REUSABLE, payload)
    return unwrap<CmsReusableSection>(response)
  },

  /**
   * Update a reusable library entry.
   * PUT /cms/reusable/{id}
   */
  async update(id: number | string, payload: UpdateReusablePayload) {
    const response = await api.put(API_ENDPOINTS.CMS.REUSABLE_ITEM(id), payload)
    return unwrap<CmsReusableSection>(response)
  },

  /**
   * Delete a reusable library entry.
   * DELETE /cms/reusable/{id}
   * G3: Blocked if any page references this section (REUSABLE_SECTION_IN_USE).
   */
  async delete(id: number | string) {
    await api.delete(API_ENDPOINTS.CMS.REUSABLE_ITEM(id))
  },

  /**
   * Reorder library entries.
   * POST /cms/reusable/reorder
   */
  async reorder(payload: ReorderPayload) {
    const response = await api.post(API_ENDPOINTS.CMS.REUSABLE_REORDER, payload)
    return unwrap<any>(response)
  },

  /**
   * Toggle library entry visibility.
   * POST /cms/reusable/{id}/toggle
   */
  async toggle(id: number | string) {
    const response = await api.post(API_ENDPOINTS.CMS.REUSABLE_TOGGLE(id))
    return unwrap<CmsReusableSection>(response)
  },

  /**
   * Get content for all locales of a reusable section.
   * GET /cms/reusable/{id}/content
   */
  async getContent(id: number | string) {
    const response = await api.get(API_ENDPOINTS.CMS.REUSABLE_CONTENT(id))
    return unwrap<Record<string, CmsSectionTranslation>>(response)
  },

  /**
   * Batch save draft content for a reusable section.
   * POST /cms/reusable/{id}/content/batch
   */
  async saveBatchContent(id: number | string, payload: BatchContentPayload) {
    const response = await api.post(API_ENDPOINTS.CMS.REUSABLE_CONTENT_BATCH(id), payload)
    return unwrap<any>(response)
  },

  /**
   * Publish draft content for a reusable section.
   * POST /cms/reusable/{id}/content/publish
   * G7: Flushes cache for ALL pages that reference this section.
   */
  async publishContent(id: number | string, payload?: PublishContentPayload) {
    const response = await api.post(API_ENDPOINTS.CMS.REUSABLE_CONTENT_PUBLISH(id), payload)
    return unwrap<any>(response)
  },

  /**
   * Preview resolved draft output for a reusable section.
   * GET /cms/reusable/{id}/content/preview?locale=X
   */
  async previewContent(id: number | string, locale: string) {
    const response = await api.get(API_ENDPOINTS.CMS.REUSABLE_CONTENT_PREVIEW(id), {
      params: { locale },
    })
    return unwrap<any>(response)
  },
}

// ─── Config Service ──────────────────────────────────────────────────────────

export const cmsConfigService = {
  /**
   * Get dynamic relation models configured in the backend
   * GET /cms/relation-models
   */
  async getRelationModels() {
    const response = await api.get(API_ENDPOINTS.CMS.RELATION_MODELS)
    return unwrapList<any>(response)
  },

  /**
   * Get builder status to check if it's locked down
   * GET /cms/builder/status
   */
  async getBuilderStatus() {
    const response = await api.get(API_ENDPOINTS.CMS.BUILDER_STATUS)
    return unwrap<{ locked: boolean, locked_at: string | null }>(response)
  },
}

// ─── Backward Compatibility ──────────────────────────────────────────────────
// Temporary shim so existing views don't crash. Will be removed in Phase 2.

export const cmsBuilderService = {
  async listPages() {
    const result = await cmsPageService.list()
    return { data: result.data, total: result.meta?.total ?? result.data.length }
  },
  async getPage(idOrSlug: string | number) {
    return cmsPageService.get(idOrSlug)
  },
  async createPage(data: CreatePagePayload) {
    return cmsPageService.create(data)
  },
  async updatePage(id: string | number, data: any) {
    return cmsPageService.update(id, data)
  },
  async deletePage(id: string | number) {
    return cmsPageService.delete(id)
  },
  async togglePublish(id: string | number) {
    return cmsPageService.publish(id)
  },
}

export const cmsContentService = {
  async getContent(_slug: string) {
    console.warn(
      '[CMS] cmsContentService.getContent() is deprecated. Use cmsSectionContentService.getAll() instead.',
    )
    return { slug: _slug, is_published: false, sections: [] }
  },
  async saveContent(_slug: string, _data: any) {
    console.warn(
      '[CMS] cmsContentService.saveContent() is deprecated. Use cmsPageService.batchContent() instead.',
    )
    return _data
  },
}

/**
 * CMS SEO Service
 *
 * Manages per-locale SEO metadata for CMS pages.
 * Endpoints: /api/admin/v1/cms/pages/{pageId}/seo
 */

import type { BatchSeoPayload, CmsSeoMeta, SingleSeoPayload } from '@/types/cms'
import { API_ENDPOINTS } from '@/constants/endpoints'
import api from './api'

/** Unwrap standard API responses */
function unwrap<T>(response: any): T {
  return response.data?.data ?? response.data
}

export const cmsSeoService = {
  /**
   * Get SEO data for all locales.
   * GET /cms/pages/{pageId}/seo
   */
  async getAll(pageId: number | string) {
    const response = await api.get(API_ENDPOINTS.CMS.PAGE_SEO(pageId))
    return unwrap<Record<string, CmsSeoMeta>>(response)
  },

  /**
   * Get SEO data for a single locale.
   * GET /cms/pages/{pageId}/seo/{locale}
   */
  async getLocale(pageId: number | string, locale: string) {
    const response = await api.get(API_ENDPOINTS.CMS.PAGE_SEO_LOCALE(pageId, locale))
    return unwrap<CmsSeoMeta>(response)
  },

  /**
   * Upsert SEO for a single locale.
   * POST /cms/pages/{pageId}/seo
   *
   * og_image: UUID temp token OR integer media ID.
   */
  async save(pageId: number | string, payload: SingleSeoPayload) {
    const response = await api.post(API_ENDPOINTS.CMS.PAGE_SEO(pageId), payload)
    return unwrap<CmsSeoMeta>(response)
  },

  /**
   * Upsert SEO for all locales at once (recommended).
   * POST /cms/pages/{pageId}/seo/batch
   */
  async saveBatch(pageId: number | string, payload: BatchSeoPayload) {
    const response = await api.post(API_ENDPOINTS.CMS.PAGE_SEO_BATCH(pageId), payload)
    return unwrap<Record<string, CmsSeoMeta>>(response)
  },

  /**
   * Delete SEO data for a single locale.
   * DELETE /cms/pages/{pageId}/seo/{locale}
   */
  async deleteLocale(pageId: number | string, locale: string) {
    await api.delete(API_ENDPOINTS.CMS.PAGE_SEO_LOCALE(pageId, locale))
  },
}

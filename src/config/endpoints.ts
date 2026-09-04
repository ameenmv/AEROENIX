/**
 * ──────────────────────────────────────────────────────────────────────────────
 * API Endpoints — Aligned with Aeroenix Laravel Backend (v1)
 * ──────────────────────────────────────────────────────────────────────────────
 */

export const API_ENDPOINTS = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    PASSWORD_FORGOT: '/auth/forgot-password',
    PASSWORD_RESET: '/auth/reset-password',
    INVITATION_ACCEPT: '/auth/invitations/accept',
  },

  // ── Platform ──────────────────────────────────────────────────────────────
  PLATFORM: {
    HOTELS: '/platform/hotels',
    HOTEL_DETAIL: (id: number | string) => `/platform/hotels/${id}`,

    USERS: '/platform/users',
    USER_DETAIL: (id: number | string) => `/platform/users/${id}`,
    USER_INVITE: '/platform/users/invite',
    USER_ROLE_UPDATE: (id: number | string) => `/platform/users/${id}/role`,
    USER_TOGGLE_STATUS: (id: number | string) => `/platform/users/${id}/toggle-status`,
    INVITATION_RESEND: (id: number | string) => `/platform/users/invitations/${id}/resend`,

    PERMISSIONS: '/platform/permissions',
    ROLES_PERMISSIONS_MATRIX: '/platform/roles-permissions',
    ROLES: '/platform/roles',
    ROLE_PERMISSIONS_UPDATE: (id: number | string) => `/platform/roles/${id}/permissions`,
  },

  // ── Channels (Integrations) ───────────────────────────────────────────────
  CHANNELS: {
    INSTAGRAM: {
      AUTH_URL: '/user/workspace/channels/instagram-professional/auth-url',
      CONNECT: '/user/workspace/channels/instagram-professional/connect',
      HEALTH: (id: number | string) => `/user/workspace/channels/instagram-professional/${id}/health`,
      CALLBACK: '/user/workspace/channels/instagram-professional/callback',
    },
    FACEBOOK: {
      AUTH_URL: '/user/workspace/channels/facebook-messenger/auth-url',
      CONNECT: '/user/workspace/channels/facebook-messenger/connect',
      HEALTH: (id: number | string) => `/user/workspace/channels/facebook-messenger/${id}/health`,
      CALLBACK: '/user/workspace/channels/facebook-messenger/callback',
    },
    WHATSAPP: {
      AUTH_URL: '/user/workspace/channels/whatsapp-business/auth-url',
      EMBEDDED_SIGNUP: '/user/workspace/channels/whatsapp-business/embedded-signup',
      CONNECT: '/user/workspace/channels/whatsapp-business/connect',
      HEALTH: (id: number | string) => `/user/workspace/channels/whatsapp-business/${id}/health`,
      DISCONNECT: (id: number | string) => `/user/workspace/channels/whatsapp-business/${id}`,
      CALLBACK: '/user/workspace/channels/whatsapp-business/callback',
    },
  },

  // ── Conversations & Handoff ──────────────────────────────────────────────
  CONVERSATIONS: {
    HANDOFF: (id: number | string) => `/user/workspace/conversations/${id}/handoff`,
    RESUME_AI: (id: number | string) => `/user/workspace/conversations/${id}/resume-ai`,
    STATUS: (id: number | string) => `/user/workspace/conversations/${id}/handoff-status`,
  },

  // ── Legacy / Inactive Stubs (for type compatibility) ──────────────────────
  TEMP_UPLOADS: {
    STORE: '/api/temp-uploads',
    UPLOAD: '/api/temp-uploads',
    SHOW: (token: string) => `/api/temp-uploads/${token}`,
    GET: (token: string) => `/api/temp-uploads/${token}`,
    DESTROY: (token: string) => `/api/temp-uploads/${token}`,
    DELETE: (token: string) => `/api/temp-uploads/${token}`,
  },
  CMS: {
    PAGES: '/cms/pages',
    PAGE: (id: number | string) => `/cms/pages/${id}`,
    PAGE_PUBLISH: (id: number | string) => `/cms/pages/${id}/publish`,
    PAGE_UNPUBLISH: (id: number | string) => `/cms/pages/${id}/unpublish`,
    PAGE_DUPLICATE: (id: number | string) => `/cms/pages/${id}/duplicate`,
    PAGE_CONTENT_BATCH: (id: number | string) => `/cms/pages/${id}/content/batch`,
    SECTIONS: (pageId: number | string) => `/cms/pages/${pageId}/sections`,
    SECTION: (pageId: number | string, sectionId: number | string) => `/cms/pages/${pageId}/sections/${sectionId}`,
    SECTIONS_REORDER: '/cms/sections/reorder',
    SECTION_TOGGLE: (sectionId: number | string) => `/cms/sections/${sectionId}/toggle`,
    SECTION_CONTENT: (sectionId: number | string) => `/cms/sections/${sectionId}/content`,
    SECTION_CONTENT_LOCALE: (sectionId: number | string, locale: string) => `/cms/sections/${sectionId}/content/${locale}`,
    SECTION_CONTENT_BATCH: (sectionId: number | string) => `/cms/sections/${sectionId}/content/batch`,
    SECTION_CONTENT_PUBLISH: (sectionId: number | string) => `/cms/sections/${sectionId}/content/publish`,
    SECTION_CONTENT_PREVIEW: (sectionId: number | string) => `/cms/sections/${sectionId}/content/preview`,
    REUSABLE: '/cms/reusable',
    REUSABLE_ITEM: (id: number | string) => `/cms/reusable/${id}`,
    REUSABLE_REORDER: '/cms/reusable/reorder',
    REUSABLE_TOGGLE: (id: number | string) => `/cms/reusable/${id}/toggle`,
    REUSABLE_CONTENT: (id: number | string) => `/cms/reusable/${id}/content`,
    REUSABLE_CONTENT_BATCH: (id: number | string) => `/cms/reusable/${id}/content/batch`,
    REUSABLE_CONTENT_PUBLISH: (id: number | string) => `/cms/reusable/${id}/content/publish`,
    REUSABLE_CONTENT_PREVIEW: (id: number | string) => `/cms/reusable/${id}/content/preview`,
    PAGE_SEO: (pageId: number | string) => `/cms/pages/${pageId}/seo`,
    PAGE_SEO_LOCALE: (pageId: number | string, locale: string) => `/cms/pages/${pageId}/seo/${locale}`,
    PAGE_SEO_BATCH: (pageId: number | string) => `/cms/pages/${pageId}/seo/batch`,
    RELATION_MODELS: '/cms/relation-models',
    BUILDER_STATUS: '/cms/builder/status',
  },
  STATIC_PAGES: {
    LIST: '/static-pages',
  },

  /** Helper: Build a resource base URL */
  resource: (name: string) => `/${name}`,
} as const

export type ApiEndpoint = typeof API_ENDPOINTS

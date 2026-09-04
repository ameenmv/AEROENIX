/**
 * Static searchable pages configuration.
 *
 * This file defines all pages that appear in the Command Palette (⌘K).
 */

export interface SearchablePageConfig {
  /** Unique ID (use route name) */
  id: string
  /** i18n key for page title */
  titleKey: string
  /** i18n key for description (optional) */
  descriptionKey?: string
  /** Route path (without language prefix) */
  path: string
  /** Category for grouping */
  categoryKey: string
  /** Extra search keywords */
  keywords: string[]
}

export const searchablePagesConfig: SearchablePageConfig[] = [
  // ── Main ─────────────────────────────────────────────────────────────────
  {
    id: 'admin-dashboard',
    titleKey: 'menu.home',
    descriptionKey: 'command.desc_dashboard',
    path: '/admin/dashboard',
    categoryKey: 'command.category_main',
    keywords: ['dashboard', 'home', 'overview', 'الرئيسية', 'لوحة'],
  },

  // ── Access & Organization ───────────────────────────────────────────────
  {
    id: 'admin-users',
    titleKey: 'menu.users',
    descriptionKey: 'command.desc_users',
    path: '/admin/users',
    categoryKey: 'menu.organization_group',
    keywords: ['users', 'members', 'مستخدمين', 'إدارة'],
  },
  {
    id: 'admin-hotels',
    titleKey: 'menu.hotels',
    descriptionKey: 'command.desc_workspaces',
    path: '/admin/hotels',
    categoryKey: 'menu.organization_group',
    keywords: ['hotels', 'faroes', 'فنادق', 'منشآت'],
  },
  {
    id: 'admin-roles',
    titleKey: 'menu.roles',
    descriptionKey: 'command.desc_roles',
    path: '/admin/roles',
    categoryKey: 'menu.access_control_group',
    keywords: ['roles', 'permissions', 'أدوار', 'صلاحيات'],
  },
  {
    id: 'admin-roles-create',
    titleKey: 'roles.create_title',
    descriptionKey: 'command.desc_roles',
    path: '/admin/roles/create',
    categoryKey: 'menu.access_control_group',
    keywords: ['create', 'role', 'permissions', 'إنشاء', 'دور'],
  },

  // ── Integrations ────────────────────────────────────────────────────────
  {
    id: 'admin-channels',
    titleKey: 'menu.channels',
    descriptionKey: 'command.desc_channels',
    path: '/admin/channels',
    categoryKey: 'menu.system_group',
    keywords: ['channels', 'whatsapp', 'instagram', 'facebook', 'قنوات'],
  },
]

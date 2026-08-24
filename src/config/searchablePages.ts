/**
 * Static searchable pages configuration.
 *
 * This file defines all pages that appear in the Command Palette (⌘K).
 * Each entry has a route path, i18n title key, optional description key,
 * category, and searchable keywords.
 *
 * To add a new page: add an entry here and it will automatically
 * appear in the command palette search.
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
  {
    id: 'admin-notifications',
    titleKey: 'menu.notifications',
    descriptionKey: 'command.desc_notifications',
    path: '/admin/notifications',
    categoryKey: 'command.category_main',
    keywords: ['notifications', 'alerts', 'إشعارات'],
  },

  // ── Organization ────────────────────────────────────────────────────────
  {
    id: 'admin-users-workspaces',
    titleKey: 'menu.users_workspaces',
    descriptionKey: 'command.desc_users',
    path: '/admin/users-workspaces',
    categoryKey: 'menu.organization_group',
    keywords: ['users', 'workspaces', 'members', 'مستخدمين', 'مساحات'],
  },
  {
    id: 'admin-workspaces',
    titleKey: 'menu.workspaces',
    descriptionKey: 'command.desc_workspaces',
    path: '/admin/workspaces',
    categoryKey: 'menu.organization_group',
    keywords: ['workspaces', 'workspace', 'مساحات', 'عمل'],
  },
  {
    id: 'admin-clients',
    titleKey: 'menu.clients',
    descriptionKey: 'command.desc_clients',
    path: '/admin/clients',
    categoryKey: 'menu.organization_group',
    keywords: ['clients', 'accounts', 'عملاء', 'حسابات'],
  },

  // ── Access Control ──────────────────────────────────────────────────────
  {
    id: 'admin-admins',
    titleKey: 'menu.admins',
    descriptionKey: 'command.desc_users',
    path: '/admin/admins',
    categoryKey: 'menu.access_control_group',
    keywords: ['admins', 'administrators', 'مشرفين'],
  },
  {
    id: 'admin-admins-create',
    titleKey: 'admins.create_title',
    descriptionKey: 'command.desc_users',
    path: '/admin/admins/create',
    categoryKey: 'menu.access_control_group',
    keywords: ['create', 'admin', 'new', 'إنشاء', 'مشرف'],
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

  // ── Billing & Plans ─────────────────────────────────────────────────────
  {
    id: 'admin-subscriptions',
    titleKey: 'menu.subscriptions',
    descriptionKey: 'command.desc_subscriptions',
    path: '/admin/subscriptions',
    categoryKey: 'menu.billing_group',
    keywords: ['subscriptions', 'subscription', 'اشتراكات', 'اشتراك'],
  },
  {
    id: 'admin-invoices',
    titleKey: 'menu.invoices',
    descriptionKey: 'command.desc_invoices',
    path: '/admin/invoices',
    categoryKey: 'menu.billing_group',
    keywords: ['invoices', 'billing', 'فواتير'],
  },
  {
    id: 'admin-plans',
    titleKey: 'menu.plans',
    descriptionKey: 'command.desc_plans',
    path: '/admin/plans',
    categoryKey: 'menu.billing_group',
    keywords: ['plans', 'pricing', 'باقات', 'أسعار'],
  },
  {
    id: 'admin-plans-create',
    titleKey: 'plans.create_title',
    descriptionKey: 'command.desc_plans',
    path: '/admin/plans/create',
    categoryKey: 'menu.billing_group',
    keywords: ['create', 'plan', 'new', 'إنشاء', 'باقة'],
  },
  {
    id: 'admin-transactions',
    titleKey: 'menu.transactions',
    descriptionKey: 'command.desc_transactions',
    path: '/admin/transactions',
    categoryKey: 'menu.billing_group',
    keywords: ['transactions', 'history', 'معاملات'],
  },
  {
    id: 'admin-payments',
    titleKey: 'menu.payments',
    descriptionKey: 'command.desc_payments',
    path: '/admin/payments-history',
    categoryKey: 'menu.billing_group',
    keywords: ['payments', 'payment', 'مدفوعات'],
  },

  // ── CRM & Marketing ─────────────────────────────────────────────────────
  {
    id: 'admin-subscribers',
    titleKey: 'menu.subscribers',
    descriptionKey: 'command.desc_subscribers',
    path: '/admin/subscribers',
    categoryKey: 'menu.marketing_group',
    keywords: ['subscribers', 'email', 'مشتركين'],
  },
  {
    id: 'admin-marketing-coupons',
    titleKey: 'menu.coupons',
    descriptionKey: 'command.desc_coupons',
    path: '/admin/marketing/coupons',
    categoryKey: 'menu.marketing_group',
    keywords: ['coupons', 'discount', 'كوبونات', 'خصم'],
  },
  {
    id: 'admin-marketing-emails',
    titleKey: 'menu.emails',
    descriptionKey: 'command.desc_emails',
    path: '/admin/marketing/emails',
    categoryKey: 'menu.marketing_group',
    keywords: ['emails', 'campaigns', 'بريد', 'حملات'],
  },
  {
    id: 'admin-notification-campaigns',
    titleKey: 'menu.notifications',
    descriptionKey: 'command.desc_notifications',
    path: '/admin/notifications/campaigns',
    categoryKey: 'menu.marketing_group',
    keywords: ['notifications', 'push', 'campaigns', 'إشعارات', 'حملات'],
  },
  {
    id: 'admin-marketing-feedback',
    titleKey: 'menu.feedback',
    descriptionKey: 'command.desc_feedback',
    path: '/admin/marketing/feedback',
    categoryKey: 'menu.marketing_group',
    keywords: ['feedback', 'reviews', 'ملاحظات'],
  },

  // ── System & Settings ───────────────────────────────────────────────────
  {
    id: 'admin-channels',
    titleKey: 'menu.channels',
    descriptionKey: 'command.desc_channels',
    path: '/admin/channels',
    categoryKey: 'menu.system_group',
    keywords: ['channels', 'whatsapp', 'connect', 'قنوات'],
  },
  {
    id: 'admin-channels-guidance',
    titleKey: 'menu.channels_guidance',
    descriptionKey: 'command.desc_channels_guidance',
    path: '/admin/channels-guidance',
    categoryKey: 'menu.system_group',
    keywords: ['channels', 'guidance', 'guide', 'دليل', 'قنوات'],
  },
  {
    id: 'admin-features',
    titleKey: 'menu.features',
    descriptionKey: 'command.desc_features',
    path: '/admin/features',
    categoryKey: 'menu.system_group',
    keywords: ['features', 'toggles', 'ميزات'],
  },
  {
    id: 'admin-reports',
    titleKey: 'menu.reports',
    descriptionKey: 'command.desc_reports',
    path: '/admin/reports',
    categoryKey: 'menu.system_group',
    keywords: ['reports', 'analytics', 'تقارير'],
  },
  {
    id: 'admin-bug-reports',
    titleKey: 'menu.bugReports',
    descriptionKey: 'command.desc_bug_reports',
    path: '/admin/bug-reports',
    categoryKey: 'menu.system_group',
    keywords: ['bugs', 'reports', 'issues', 'أخطاء', 'تقارير'],
  },
  {
    id: 'admin-policies-privacy',
    titleKey: 'menu.privacy',
    descriptionKey: 'command.desc_privacy',
    path: '/admin/policies/privacy',
    categoryKey: 'menu.system_group',
    keywords: ['privacy', 'policy', 'خصوصية'],
  },
  {
    id: 'admin-policies-terms',
    titleKey: 'menu.terms',
    descriptionKey: 'command.desc_terms',
    path: '/admin/policies/terms',
    categoryKey: 'menu.system_group',
    keywords: ['terms', 'conditions', 'شروط', 'أحكام'],
  },
]

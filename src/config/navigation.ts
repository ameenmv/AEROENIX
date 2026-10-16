import {
  Analytics01Icon,
  BookOpen01Icon,
  Building04Icon,
  Calendar01Icon,
  Comment01Icon,
  Home01Icon,
  Notification03Icon,
  SecurityLockIcon,
  Settings01Icon,
  Share01Icon,
  Target02Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'

export interface NavItem {
  name: string
  label: string // i18n key like 'menu.home'
  icon: any
  to?: string
  createRoute?: string
  permission?: string | string[]
  children?: NavItem[]
  dynamicChildren?: string
}

export const navigationConfig: NavItem[] = [
  {
    name: 'home',
    label: 'menu.home',
    icon: Home01Icon,
    to: '/admin/dashboard',
  },
  {
    name: 'conversations',
    label: 'menu.conversations',
    icon: Comment01Icon,
    to: '/admin/conversations',
    permission: 'inbox.view',
  },
  {
    name: 'leads',
    label: 'menu.leads',
    icon: Target02Icon,
    to: '/admin/leads',
    permission: ['leads.manage', 'inbox.view'],
  },
  {
    name: 'users',
    label: 'menu.users',
    icon: UserGroupIcon,
    to: '/admin/users',
    permission: ['users.manage', 'View Users', 'Manage Users'],
  },
  {
    name: 'hotels',
    label: 'menu.hotels',
    icon: Building04Icon,
    to: '/admin/hotels',
    permission: ['hotel.manage', 'Manage Hotels'],
  },
  {
    name: 'bookings',
    label: 'menu.bookings',
    icon: Calendar01Icon,
    to: '/admin/bookings',
    permission: 'bookings.view',
  },
  {
    name: 'reports',
    label: 'menu.reports',
    icon: Analytics01Icon,
    to: '/admin/reports',
    permission: ['reports.view', 'hotel.manage'],
  },
  {
    name: 'knowledge',
    label: 'menu.knowledge',
    icon: BookOpen01Icon,
    to: '/admin/knowledge',
    createRoute: '/admin/knowledge/create',
    permission: ['faq.edit', 'faq.approve'],
  },
  {
    name: 'roles',
    label: 'menu.roles',
    icon: SecurityLockIcon,
    to: '/admin/roles',
    createRoute: '/admin/roles/create',
    permission: ['roles.manage', 'Assign Roles'],
  },
  {
    name: 'channels',
    label: 'menu.channels',
    icon: Share01Icon,
    to: '/admin/channels',
    permission: ['settings.manage', 'hotel.manage'],
  },
  {
    name: 'activity-logs',
    label: 'menu.activity_logs',
    icon: Notification03Icon,
    to: '/admin/activity-logs',
    permission: 'logs.view',
  },
  {
    name: 'settings',
    label: 'menu.settings_profile',
    icon: Settings01Icon,
    to: '/admin/settings',
    permission: ['settings.manage', 'hotel.manage'],
  },
]

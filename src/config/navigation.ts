import { Building04Icon, Home01Icon, SecurityLockIcon, Share01Icon, UserGroupIcon } from '@hugeicons/core-free-icons'

export interface NavItem {
  name: string
  label: string // i18n key like 'menu.home'
  icon: any
  to?: string
  createRoute?: string
  permission?: string
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
    name: 'users',
    label: 'menu.users',
    icon: UserGroupIcon,
    to: '/admin/users',
  },
  {
    name: 'hotels',
    label: 'menu.hotels',
    icon: Building04Icon,
    to: '/admin/hotels',
  },
  {
    name: 'roles',
    label: 'menu.roles',
    icon: SecurityLockIcon,
    to: '/admin/roles',
    createRoute: '/admin/roles/create',
  },
  {
    name: 'channels',
    label: 'menu.channels',
    icon: Share01Icon,
    to: '/admin/channels',
  },
]

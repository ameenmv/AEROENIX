import { Home01Icon, UserGroupIcon } from '@hugeicons/core-free-icons'

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
    permission: 'statistics.view',
  },
  {
    name: 'users',
    label: 'menu.users',
    icon: UserGroupIcon,
    to: '/admin/users',
    // permission: 'users.view',
  },
]

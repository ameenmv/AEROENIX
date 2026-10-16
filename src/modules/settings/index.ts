import { Settings01Icon } from '@hugeicons/core-free-icons'
import { registerModule } from '@/router/modules'

registerModule({
  name: 'settings',
  path: 'admin/settings',
  icon: Settings01Icon,
  permission: ['settings.manage', 'hotel.manage'],
  routes: [
    {
      path: 'admin/settings',
      name: 'admin-settings',
      component: () => import('@/views/admin/settings/SettingsView.vue'),
      meta: { breadcrumbKey: 'menu.settings' },
    },
  ],
})

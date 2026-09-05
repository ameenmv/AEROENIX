import { Share01Icon } from '@hugeicons/core-free-icons'
import { registerModule } from '@/router/modules'

registerModule({
  name: 'channels',
  path: 'admin/channels',
  icon: Share01Icon,
  order: 40,
  routes: [
    {
      path: 'admin/channels',
      name: 'admin-channels',
      component: () => import('@/views/admin/channels/IndexView.vue'),
      meta: {
        breadcrumbKey: 'menu.channels',
      },
    },
  ],
})

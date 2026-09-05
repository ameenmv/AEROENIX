import { Comment01Icon } from '@hugeicons/core-free-icons'
import { registerModule } from '@/router/modules'

registerModule({
  name: 'conversations',
  path: 'admin/conversations',
  icon: Comment01Icon,
  order: 35,
  routes: [
    {
      path: 'admin/conversations',
      name: 'admin-conversations',
      component: () => import('@/views/admin/conversations/IndexView.vue'),
      meta: {
        breadcrumbKey: 'menu.conversations',
      },
    },
  ],
})

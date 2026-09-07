import { Notification03Icon } from '@hugeicons/core-free-icons'
import { registerModule } from '@/router/modules'

registerModule({
  name: 'activity-logs',
  path: 'admin/activity-logs',
  icon: Notification03Icon,
  order: 45,
  routes: [
    {
      path: 'admin/activity-logs',
      name: 'admin-activity-logs',
      component: () => import('@/views/admin/activity-logs/IndexView.vue'),
      meta: {
        breadcrumbKey: 'menu.activity_logs',
      },
    },
  ],
})

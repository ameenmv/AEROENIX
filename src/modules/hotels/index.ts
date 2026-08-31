import { Building04Icon } from '@hugeicons/core-free-icons'
import { registerModule } from '@/router/modules'

registerModule({
  name: 'hotels',
  path: 'admin/hotels',
  icon: Building04Icon,
  // permissionKey: 'hotels', // Uncomment when backend permissions are ready
  routes: [
    {
      path: 'admin/hotels',
      name: 'admin-hotels',
      component: () => import('@/views/admin/hotels/IndexView.vue'),
      children: [
        {
          path: 'create',
          name: 'admin-hotels-create',
          component: () => import('@/views/admin/hotels/CreateView.vue'),
          meta: { openMode: 'full' },
        },
        {
          path: ':id',
          name: 'admin-hotels-show',
          component: () => import('@/views/admin/hotels/ShowView.vue'),
          meta: { openMode: 'full' },
        },
        {
          path: ':id/edit',
          name: 'admin-hotels-edit',
          component: () => import('@/views/admin/hotels/EditView.vue'),
          meta: { openMode: 'full' },
        },
      ],
    },
  ],
})

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
    },
    {
      path: 'admin/hotels/create',
      name: 'admin-hotels-create',
      component: () => import('@/views/admin/hotels/CreateView.vue'),
    },
  ],
})

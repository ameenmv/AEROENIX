import { Building04Icon } from '@hugeicons/core-free-icons'
import { registerModule } from '@/router/modules'

registerModule({
  name: 'hotels',
  path: 'admin/hotels',
  icon: Building04Icon,
  permission: ['hotel.manage', 'Manage Hotels'],
  order: 30,
  routes: [
    {
      path: 'admin/hotels',
      name: 'admin-hotels',
      component: () => import('@/views/admin/hotels/IndexView.vue'),
      meta: {
        breadcrumbKey: 'menu.hotels',
        title: 'Hotels',
      },
    },
    {
      path: 'admin/hotels/create',
      name: 'admin-hotels-create',
      component: () => import('@/views/admin/hotels/CreateView.vue'),
      meta: {
        breadcrumbKey: 'hotels.wizard.step1.title',
        title: 'Create Hotel',
      },
    },
    {
      path: 'admin/hotels/:id',
      name: 'admin-hotels-show',
      component: () => import('@/views/admin/hotels/ShowView.vue'),
      meta: {
        breadcrumbKey: 'hotels.title',
        title: 'Hotel Details',
      },
    },
    {
      path: 'admin/hotels/:id/edit',
      name: 'admin-hotels-edit',
      component: () => import('@/views/admin/hotels/EditView.vue'),
      meta: {
        breadcrumbKey: 'actions.edit',
        title: 'Edit Hotel',
      },
    },
  ],
})

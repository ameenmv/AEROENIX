import { UserGroupIcon } from '@hugeicons/core-free-icons'
import { registerModule } from '@/router/modules'

registerModule({
  name: 'users',
  path: 'admin/users',
  icon: UserGroupIcon,
  // permissionKey: 'users', // Uncomment when backend permissions are ready
  routes: [
    {
      path: 'admin/users',
      name: 'admin-users',
      component: () => import('@/views/admin/users/IndexView.vue'),
      children: [
        {
          path: 'create',
          name: 'admin-users-create',
          component: () => import('@/views/admin/users/CreateView.vue'),
          meta: { openMode: 'modal' },
        },
        {
          path: ':id',
          name: 'admin-users-show',
          component: () => import('@/views/admin/users/ShowView.vue'),
          meta: { openMode: 'full' },
        },
        {
          path: ':id/edit',
          name: 'admin-users-edit',
          component: () => import('@/views/admin/users/EditView.vue'),
          meta: { openMode: 'modal' },
        },
      ],
    },
  ],
})

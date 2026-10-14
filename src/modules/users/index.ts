import { UserGroupIcon } from '@hugeicons/core-free-icons'
import { registerModule } from '@/router/modules'

registerModule({
  name: 'users',
  path: 'admin/users',
  icon: UserGroupIcon,
  // permissionKey: 'users', // Uncomment when backend permissions are ready
  order: 20,
  routes: [
    {
      path: 'admin/users',
      name: 'admin-users',
      component: () => import('@/views/admin/users/IndexView.vue'),
      meta: {
        breadcrumbKey: 'menu.users',
        title: 'Users',
      },
    },
    {
      path: 'admin/users/create',
      name: 'admin-users-create',
      component: () => import('@/views/admin/users/CreateView.vue'),
      meta: {
        breadcrumbKey: 'users.actions.invite',
        title: 'Invite User',
      },
    },
    {
      path: 'admin/users/:id',
      name: 'admin-users-show',
      component: () => import('@/views/admin/users/ShowView.vue'),
      meta: {
        breadcrumbKey: 'users.title',
        title: 'User Details',
      },
    },
    {
      path: 'admin/users/:id/edit',
      name: 'admin-users-edit',
      component: () => import('@/views/admin/users/EditView.vue'),
      meta: {
        breadcrumbKey: 'actions.edit',
        title: 'Edit User Role',
      },
    },
  ],
})

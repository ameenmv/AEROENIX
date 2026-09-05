import { registerModule } from '@/router/modules'

registerModule({
  name: 'roles',
  path: 'admin/roles',
  routes: [
    {
      path: 'admin/roles',
      name: 'admin-roles',
      component: () => import('@/views/admin/roles/IndexView.vue'),
      meta: {
        title: 'menu.roles',
        description: 'Manage roles and permissions',
        requiresAuth: true,
      },
    },
    {
      path: 'admin/roles/create',
      name: 'admin-roles-create',
      component: () => import('@/views/admin/roles/CreateView.vue'),
      meta: {
        title: 'actions.create',
        description: 'Create a new role',
        requiresAuth: true,
      },
    },
    {
      path: 'admin/roles/:id/edit',
      name: 'admin-roles-edit',
      component: () => import('@/views/admin/roles/EditView.vue'),
      meta: {
        title: 'actions.edit',
        description: 'Edit role details and permissions',
        requiresAuth: true,
      },
    },
    {
      path: 'admin/roles/:id',
      name: 'admin-roles-show',
      component: () => import('@/views/admin/roles/ShowView.vue'),
      meta: {
        title: 'actions.view',
        description: 'View role details',
        requiresAuth: true,
      },
    },
  ],
})

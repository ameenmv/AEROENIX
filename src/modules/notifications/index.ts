import { registerModule } from '@/router/modules'

registerModule({
  name: 'notifications',
  path: 'admin/notifications',
  permissionKey: 'notifications',
  routes: [
    {
      path: 'admin/notifications',
      name: 'admin-notifications',
      component: () => import('@/views/admin/notifications/IndexView.vue'),
      meta: {
        title: 'menu.notifications',
        description: 'Manage manual notifications',
        requiresAuth: true,
        permission: 'notifications.view',
      },
    },
    {
      path: 'admin/notifications/create',
      name: 'admin-notifications-create',
      component: () => import('@/views/admin/notifications/CreateView.vue'),
      meta: {
        title: 'actions.create',
        description: 'Create a new notification',
        requiresAuth: true,
        permission: 'notifications.manage',
      },
    },
    {
      path: 'admin/notifications/:id/edit',
      name: 'admin-notifications-edit',
      component: () => import('@/views/admin/notifications/EditView.vue'),
      meta: {
        title: 'actions.edit',
        description: 'Edit notification',
        requiresAuth: true,
        permission: 'notifications.manage',
      },
    },
    {
      path: 'admin/notifications/:id',
      name: 'admin-notifications-show',
      component: () => import('@/views/admin/notifications/ShowView.vue'),
      meta: {
        title: 'actions.view',
        description: 'View notification details',
        requiresAuth: true,
        permission: 'notifications.view',
      },
    },
  ],
})

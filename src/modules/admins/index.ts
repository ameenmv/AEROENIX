import type { RouteRecordRaw } from 'vue-router'
import { registerModule } from '@/router/modules'

export const adminsRoutes: RouteRecordRaw[] = [
  {
    path: 'admin/admins',
    name: 'admin-admins',
    component: () => import('@/views/admin/admins/IndexView.vue'),
    meta: {
      title: 'menu.admins',
      description: 'Manage admin accounts',
      requiresAuth: true,
      permission: 'admins.view',
    },
  },
  {
    path: 'admin/admins/create',
    name: 'admin-admins-create',
    component: () => import('@/views/admin/admins/CreateView.vue'),
    meta: {
      title: 'actions.create',
      description: 'Create a new admin account',
      requiresAuth: true,
      permission: 'admins.manage',
    },
  },
  {
    path: 'admin/admins/:id/edit',
    name: 'admin-admins-edit',
    component: () => import('@/views/admin/admins/EditView.vue'),
    meta: {
      title: 'actions.edit',
      description: 'Edit admin account details',
      requiresAuth: true,
      permission: 'admins.manage',
    },
  },
  {
    path: 'admin/admins/:id',
    name: 'admin-admins-show',
    component: () => import('@/views/admin/admins/ShowView.vue'),
    meta: {
      title: 'actions.view',
      description: 'View admin account details',
      requiresAuth: true,
      permission: 'admins.view',
    },
  },
]

registerModule({
  name: 'admins',
  path: 'admin/admins',
  routes: adminsRoutes,
  permissionKey: 'admins',
})

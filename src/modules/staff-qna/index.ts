import { registerModule } from '@/router/modules'

registerModule({
  name: 'staff-qna',
  path: 'admin/staff-qna',
  // permissionKey: 'ai', // Assuming AI permission
  order: 45,
  routes: [
    {
      path: 'admin/staff-qna',
      name: 'admin-staff-qna',
      component: () => import('@/views/admin/staff-qna/IndexView.vue'),
      meta: {
        breadcrumbKey: 'menu.staff_qna',
        title: 'Staff Knowledge Base',
      },
    },
  ],
})

import { registerModule } from '@/router/modules'

registerModule({
  name: 'reports',
  path: 'admin/reports',
  permission: ['reports.view', 'hotel.manage'],
  order: 45, // right after bookings (order 40)
  routes: [
    {
      path: 'admin/reports',
      name: 'admin-reports',
      component: () => import('@/views/admin/reports/IndexView.vue'),
      meta: {
        breadcrumbKey: 'menu.reports',
        title: 'Reports & Analytics',
      },
    },
  ],
})

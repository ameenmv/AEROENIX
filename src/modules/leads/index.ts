import { registerModule } from '@/router/modules'

registerModule({
  name: 'leads',
  path: 'admin/leads',
  permission: ['leads.manage', 'inbox.view'],
  order: 35, // right after conversations (order 30) and before bookings (order 40)
  routes: [
    {
      path: 'admin/leads',
      name: 'admin-leads',
      component: () => import('@/views/admin/leads/IndexView.vue'),
      meta: {
        breadcrumbKey: 'menu.leads',
        title: 'Leads',
      },
    },
  ],
})

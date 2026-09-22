import { registerModule } from '@/router/modules'

registerModule({
  name: 'knowledge',
  path: 'admin/knowledge',
  // permissionKey: 'knowledge',
  order: 44, // Before staff-qna (45)
  routes: [
    {
      path: 'admin/knowledge',
      name: 'admin-knowledge',
      component: () => import('@/views/admin/knowledge/IndexView.vue'),
      meta: {
        breadcrumbKey: 'menu.knowledge',
        title: 'Knowledge Base',
      },
    },
    {
      path: 'admin/knowledge/create',
      name: 'admin-knowledge-create',
      component: () => import('@/views/admin/knowledge/CreateView.vue'),
      meta: {
        breadcrumbKey: 'knowledge.create_title',
        title: 'Create Knowledge Entry',
      },
    },
    {
      path: 'admin/knowledge/:id/edit',
      name: 'admin-knowledge-edit',
      component: () => import('@/views/admin/knowledge/EditView.vue'),
      meta: {
        breadcrumbKey: 'knowledge.edit_title',
        title: 'Edit Knowledge Entry',
      },
    },
  ],
})

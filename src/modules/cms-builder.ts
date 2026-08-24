import { LayoutLeftIcon } from '@hugeicons/core-free-icons'
import { registerModule } from '@/router/modules'

registerModule({
  name: 'cms-builder',
  path: 'admin/cms',
  icon: LayoutLeftIcon,
  order: 90,
  routes: [
    {
      path: 'admin/cms',
      name: 'admin-cms',
      component: () => import('@/views/admin/cms/BuilderIndexView.vue'),
      meta: { breadcrumbKey: 'menu.cms_builder' },
      children: [
        {
          path: 'create',
          name: 'admin-cms-create',
          component: () => import('@/views/admin/cms/BuilderFormView.vue'),
          meta: { openMode: 'full', modalTitle: 'cms.create_page' },
        },
        {
          path: ':id/edit',
          name: 'admin-cms-edit',
          component: () => import('@/views/admin/cms/BuilderFormView.vue'),
          meta: { openMode: 'full', modalTitle: 'cms.edit_page' },
        },
        {
          path: ':id/sections',
          name: 'admin-cms-sections',
          component: () => import('@/views/admin/cms/PageSectionsView.vue'),
          meta: { openMode: 'full', modalTitle: 'cms.sections' },
        },
        {
          path: ':id/content',
          name: 'admin-cms-content',
          component: () => import('@/views/admin/cms/PageEditorView.vue'),
          meta: { openMode: 'full', modalTitle: 'cms.edit_content' },
        },
      ],
    },
    // ── Reusable Sections Library ──────────────────────────────────────
    {
      path: 'admin/cms/reusable',
      name: 'admin-cms-reusable',
      component: () => import('@/views/admin/cms/ReusableLibraryView.vue'),
      meta: { breadcrumbKey: 'cms.reusable_library' },
    },
    {
      path: 'admin/cms/reusable/:id/content',
      name: 'admin-cms-reusable-content',
      component: () => import('@/views/admin/cms/ReusableContentView.vue'),
      meta: { breadcrumbKey: 'cms.reusable_content' },
    },
  ],
})

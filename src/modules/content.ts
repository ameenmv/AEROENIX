import { File01Icon } from '@hugeicons/core-free-icons'
import { registerModule } from '@/router/modules'

registerModule({
  name: 'content',
  path: 'admin/content',
  icon: File01Icon,
  permissionKey: 'static_pages',
  order: 55,
  routes: [
    {
      path: 'admin/content/:slug',
      name: 'admin-content-page',
      component: () => import('@/views/admin/content/ContentPageEditor.vue'),
      meta: { breadcrumbKey: 'menu.content' },
    },
  ],
})

import type { Admin } from '@/types/entities/admin'
import { ADMINS_ENDPOINT } from '@/modules/admins/endpoints'
import { createService } from './createService'

/**
 * Admins Service — aligned with backend AdminsController.
 *
 * Uses createService factory for standard CRUD + toggle operations:
 *   list()   → GET    /admin/v1/admins
 *   get()    → GET    /admin/v1/admins/{id}
 *   create() → POST   /admin/v1/admins
 *   update() → PUT    /admin/v1/admins/{id}
 *   delete() → DELETE /admin/v1/admins/{id}
 *   toggle() → PATCH  /admin/v1/admins/{id}/toggle
 */
const baseService = createService<Admin>(ADMINS_ENDPOINT, {
  defaultListScope: 'full',
})

export const adminsService = {
  ...baseService,

  /** Override list to always send scope=full with include=roles */
  async list(params: Parameters<typeof baseService.list>[0] = {}) {
    return baseService.list({ ...params, scope: 'full', include: 'roles' })
  },
}

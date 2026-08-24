import type { User } from '@/types/entities/users'
import { USERS_ENDPOINT } from '@/modules/users/endpoints'
import { createService } from './createService'
import { mockFieldsFromKeys } from './mock'

/**
 * Users Service — mock mode.
 *
 * Backend does not have admin-managed user routes yet.
 * Using mock data until the real API is ready.
 * Toggle `useMock` to false when backend routes are implemented.
 */
export const usersService = createService<User>(USERS_ENDPOINT, {
  useMock: true,
  mockFields: mockFieldsFromKeys([
    'id',
    'name',
    'email',
    'email_verified_at',
    'created_at',
    'updated_at',
  ]),
  mockCount: 40,
})

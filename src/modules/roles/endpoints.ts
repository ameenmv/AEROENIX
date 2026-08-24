/**
 * Roles endpoint — used with createService factory.
 *
 * Backend routes: /api/admin/v1/roles
 *   GET    /                     → roles.index
 *   POST   /                     → roles.store
 *   GET    /{role}               → roles.show
 *   PUT    /{role}               → roles.update
 *   DELETE /{role}               → roles.destroy
 *   PATCH  /{role}/toggle        → roles.toggle
 *   GET    /{role}/permissions   → roles.permissions.index
 *   PATCH  /{role}/permissions   → roles.permissions.sync
 */
export const ROLES_ENDPOINT = '/admin/v1/roles'

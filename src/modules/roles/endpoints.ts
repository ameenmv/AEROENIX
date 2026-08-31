/**
 * Roles endpoint — aligned with Aeroenix backend.
 *
 * Backend routes: /api/v1/platform/roles*
 *   GET  /roles-permissions           → matrix (all roles + permissions)
 *   POST /roles                       → create custom role
 *   PUT  /roles/{role}/permissions    → update role permissions
 */
export const ROLES_ENDPOINT = '/platform/roles'
export const ROLES_PERMISSIONS_ENDPOINT = '/platform/roles-permissions'

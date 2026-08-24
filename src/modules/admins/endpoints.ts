/**
 * Admins endpoint — used with createService factory.
 *
 * Backend routes: /api/admin/v1/admins
 *   GET    /           → admins.index
 *   POST   /           → admins.store
 *   GET    /{admin}    → admins.show
 *   PUT    /{admin}    → admins.update
 *   DELETE /{admin}    → admins.destroy
 *   PATCH  /{admin}/toggle → admins.toggle
 */
export const ADMINS_ENDPOINT = '/admin/v1/admins'

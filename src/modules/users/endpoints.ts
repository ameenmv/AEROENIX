/**
 * Users endpoint — aligned with Aeroenix backend.
 *
 * Backend routes: /api/v1/platform/users
 *   GET    /                                 → users.index
 *   GET    /{user}                           → users.show
 *   POST   /invite                           → users.invite
 *   PUT    /{user}/role                      → users.updateRole
 *   POST   /{user}/toggle-status             → users.toggleStatus
 *   DELETE /{user}                           → users.destroy
 *   POST   /invitations/{invitation}/resend  → users.resendInvitation
 */
export const USERS_ENDPOINT = '/platform/users'

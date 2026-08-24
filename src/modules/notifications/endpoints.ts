/**
 * Notifications endpoint — used with createService factory.
 *
 * Backend routes: /api/admin/v1/notifications
 *   GET    /                    → notifications.index
 *   POST   /                    → notifications.store
 *   GET    /{id}                → notifications.show
 *   PUT    /{id}                → notifications.update
 *   DELETE /{id}                → notifications.destroy
 *   POST   /{id}/send-now       → notifications.send-now
 *   POST   /{id}/resend-failed  → notifications.resend-failed
 *   GET    /{id}/recipients     → notifications.recipients
 */
export const NOTIFICATIONS_ENDPOINT = '/admin/v1/notifications'

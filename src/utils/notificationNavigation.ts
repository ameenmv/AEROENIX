import type { PlatformNotification } from '@/types/entities/platformNotification'
import type { Router } from 'vue-router'

/**
 * Navigate to a notification's action URL and mark it as read.
 *
 * The backend provides `action_url` with paths like:
 *   /admin/bookings/5
 *   /admin/inbox?conversation_id=3
 *   /admin/settings/channels
 *   /admin/team
 *   /admin/dashboard
 *
 * This utility prepends the locale prefix and uses Vue Router.
 */
export function navigateToNotification(
  notification: PlatformNotification,
  router: Router,
  locale: string,
) {
  if (!notification.action_url) return

  // The backend action_url already starts with /admin/...
  // We need to prepend the locale: /{locale}/admin/...
  const path = `/${locale}${notification.action_url}`

  // Parse query params if present (e.g. ?conversation_id=3)
  const url = new URL(path, 'http://localhost')
  const query: Record<string, string> = {}
  url.searchParams.forEach((value, key) => {
    query[key] = value
  })

  router.push({
    path: url.pathname,
    query: Object.keys(query).length > 0 ? query : undefined,
  })
}

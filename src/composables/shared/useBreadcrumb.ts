export interface BreadcrumbItem {
  label: string
  to?: string
}
/**
 * Composable that builds a translated breadcrumb trail from route metadata.
 *
 * Each route should have `meta.breadcrumbKey` (an i18n key like 'menu.users').
 * Resource sub-routes should also have `meta.parentBreadcrumbKey` and `meta.parentPath`.
 */
export function useBreadcrumb() {
  const { t, locale } = useI18n()
  const route = useRoute()
  const items = computed<BreadcrumbItem[]>(() => {
    const crumbs: BreadcrumbItem[] = []
    const breadcrumbKey = route.meta?.breadcrumbKey as string | undefined
    const parentBreadcrumbKey = route.meta?.parentBreadcrumbKey as string | undefined
    const parentPath = route.meta?.parentPath as string | undefined
    // Always start with Home
    crumbs.push({
      label: t('menu.home'),
      to: `/${locale.value}/dashboard`,
    })
    // If there's a parent (resource sub-route like create/edit/view)
    if (parentBreadcrumbKey && parentPath) {
      crumbs.push({
        label: t(parentBreadcrumbKey),
        to: `/${locale.value}/${parentPath}`,
      })
    }
    // Current page (no link — it's the active page)
    if (breadcrumbKey) {
      const currentLabel = t(breadcrumbKey)
      // Don't add if it's the same as Home (dashboard page)
      if (breadcrumbKey !== 'menu.home') {
        crumbs.push({ label: currentLabel })
      }
    }
    return crumbs
  })
  return { items }
}

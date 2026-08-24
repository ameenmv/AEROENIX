/**
 * Breadcrumb variants — typically unstyled, uses link styles.
 *
 * Available sub-components:
 *  - Breadcrumb (root wrapper)
 *  - BreadcrumbList (ol container)
 *  - BreadcrumbItem (li item)
 *  - BreadcrumbLink (anchor/link)
 *  - BreadcrumbPage (current page — non-interactive)
 *  - BreadcrumbSeparator (divider between items)
 */
export const breadcrumbDefaults = {
  separator: '/',
  maxItems: Infinity,
} as const

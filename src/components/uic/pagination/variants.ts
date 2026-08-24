/**
 * Pagination variants — page navigation.
 *
 * Sub-components:
 *  - Pagination (root)
 *  - PaginationList / PaginationListItem
 *  - PaginationFirst / PaginationPrevious / PaginationNext / PaginationLast
 *  - PaginationItem (page number button)
 *  - PaginationEllipsis (...)
 *
 * Common props:
 *  - total: number (total items)
 *  - pageSize: number
 *  - siblingCount: number (pages around current)
 */
export const paginationDefaults = {
  pageSize: 10,
  siblingCount: 1,
} as const

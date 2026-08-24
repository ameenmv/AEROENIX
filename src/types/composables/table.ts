import type { ComputedRef, Ref, WatchSource } from 'vue'
import type { Formatter } from '@/composables/shared/useFormatter'
import type { FilterConfig } from '@/types'

export interface UseTableOptions<T = unknown> {
  /** Function to fetch data (e.g., api.users.list) */
  fetchFn: (params?: Record<string, unknown>) => Promise<{ data: T[], total: number }>
  /** TanStack Query key. Defaults to `[resourceName]` */
  queryKey?: string[]
  /** Resource name (used for filter store key and as fallback query key) */
  resourceName?: string
  /** Items per page. Default: `10` */
  defaultPerPage?: number
  /** Default status tab. Default: `'active'` */
  defaultStatus?: string
  /** Filter sheet configuration */
  filterConfig?: FilterConfig
  /** Formatter to transform API items for table display */
  formatter?: Formatter
  /** Mock data array for offline / development mode */
  mockData?: T[]
  /** Whether to fetch immediately. Default: `true` */
  immediate?: boolean
  /** Reactive sources that trigger a refetch when changed */
  watchKeys?: WatchSource[]
  /** Called when data is fetched successfully */
  onSuccess?: (data: T[]) => void
  /** Called when fetch fails */
  onError?: (error: unknown) => void
  /** Refetch when the browser tab regains focus. Default: `false` */
  refetchOnFocus?: boolean
  /** Delete function — if provided, enables deleteItem() and confirmState on the return */
  deleteFn?: (id: string | number) => Promise<void>
}
export interface UseTableReturn<T> {
  // Data
  items: ComputedRef<T[]>
  rawItems: ComputedRef<T[]>
  totalItems: ComputedRef<number>
  loading: ComputedRef<boolean>
  error: ComputedRef<Error | null>
  forbidden: ComputedRef<boolean>
  // Pagination
  page: Ref<number>
  perPage: Ref<number>
  totalPages: ComputedRef<number>
  hasNextPage: ComputedRef<boolean>
  hasPrevPage: ComputedRef<boolean>
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  setPerPage: (count: number) => void
  // Search
  searchQuery: Ref<string>
  setSearchQuery: (query: string) => void
  // Status
  statusFilter: Ref<string>
  setStatusFilter: (status: string) => void
  // Sort
  sortBy: Ref<string>
  sortOrder: Ref<'asc' | 'desc'>
  setSorting: (column: string, order?: 'asc' | 'desc') => void
  toggleSort: (column: string) => void
  // Filters
  filterConfig?: FilterConfig
  activeFilters: Ref<Record<string, unknown>>
  setFilters: (filters: Record<string, unknown>) => void
  clearFilters: () => void
  hasActiveFilters: ComputedRef<boolean>
  activeFilterCount: ComputedRef<number>
  // Selection
  selectedItems: Ref<(string | number)[]>
  onSelectionChange: (items: (string | number)[]) => void
  clearSelection: () => void
  // Core
  refresh: () => void
  resetAll: () => void
  // Delete (optional — only provided when deleteFn is configured)
  deleteItem?: (id: string | number) => void
  updateRow?: (id: string | number, updater: (row: T) => T) => void
  confirmState?: Ref<{
    show: boolean
    title: string
    message: string
    callback: (() => void) | null
  }>
  cancelConfirm?: () => void
}

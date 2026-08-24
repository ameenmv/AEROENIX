import type { ActiveFilters } from '@/types'
import type { UseTableOptions, UseTableReturn } from '@/types/composables/table'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { refDebounced } from '@vueuse/core'
/**
 * Composable for standalone table data management.
 *
 * Handles data fetching, pagination, search, sorting, filters,
 * column visibility, and row selection — all independent of UI logic.
 *
 * @example
 * ```ts
 * const table = useTable({
 *   service: usersService,
 *   resourceName: 'users',
 *   columns: userColumns,
 *   defaultPerPage: 10,
 * })
 * ```
 */
export function useTable<T = unknown>(options: UseTableOptions<T>): UseTableReturn<T> {
  const {
    fetchFn,
    queryKey,
    resourceName = 'resource',
    defaultPerPage = 10,
    defaultStatus = 'all',
    filterConfig,
    formatter: formatterConfig,
    mockData,
    immediate = true,
    watchKeys = [],
    onSuccess,
    onError,
    refetchOnFocus = false,
  } = options
  const key = queryKey || [resourceName]
  const queryClient = useQueryClient()
  const { formatForTable } = useFormatter({ formatter: formatterConfig })
  // ── Pagination ───────────────────────────────────────────────────────
  const page = ref(1)
  const perPage = ref(defaultPerPage)
  // ── Search ───────────────────────────────────────────────────────────
  const searchQuery = ref('')
  // ── Status ───────────────────────────────────────────────────────────
  const statusFilter = ref(defaultStatus)
  // ── Sorting ──────────────────────────────────────────────────────────
  const sortBy = ref('created_at')
  const sortOrder = ref<'asc' | 'desc'>('desc')
  // ── Filters ──────────────────────────────────────────────────────────
  const activeFilters = ref<ActiveFilters>({})
  // ── Selection ────────────────────────────────────────────────────────
  const selectedItems = ref<(string | number)[]>([])
  // ── Query Params ─────────────────────────────────────────────────────
  const queryParams = computed(() => {
    const params: Record<string, unknown> = {
      page: page.value,
      limit: perPage.value,
    }
    if (searchQuery.value)
      params.search = searchQuery.value
    if (sortBy.value) {
      params.sort_by = sortBy.value
      params.sort_dir = sortOrder.value
    }
    // Build filters object — backend expects `filters[key]=value` format.
    // Axios auto-serializes `{ filters: { status: 'active' } }` as `filters[status]=active`.
    const filtersObj: Record<string, unknown> = {}
    if (statusFilter.value !== 'all')
      filtersObj.status = statusFilter.value
    if (filterConfig) {
      const filters = activeFilters.value
      Object.entries(filters).forEach(([filterKey, value]: [string, unknown]) => {
        if (value !== null && value !== undefined && value !== '') {
          const fieldDef = filterConfig.fields.find((f: any) => f.key === filterKey)
          const paramKey = fieldDef?.alias ? fieldDef.alias : filterKey
          const paramValue = fieldDef?.transform ? fieldDef.transform(value) : value
          filtersObj[paramKey] = paramValue
        }
      })
    }
    if (Object.keys(filtersObj).length > 0)
      params.filters = filtersObj
    return params
  })
  // ── Mock Data Handler ────────────────────────────────────────────────
  const handleMockList = (): { data: T[], total: number } => {
    if (!mockData)
      return { data: [], total: 0 }
    let items = [...mockData]
    if (statusFilter.value !== 'all') {
      items = items.filter((item: T) => {
        const record = item as Record<string, unknown>
        if (record.status)
          return record.status === statusFilter.value
        if (typeof record.is_active !== 'undefined') {
          return statusFilter.value === 'active' ? record.is_active : !record.is_active
        }
        return true
      })
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      items = items.filter((item: T) =>
        Object.values(item as Record<string, unknown>).some(val =>
          String(val).toLowerCase().includes(q),
        ),
      )
    }
    if (sortBy.value) {
      items = items.sort((a: T, b: T) => {
        const aVal = (a as Record<string, unknown>)[sortBy.value] as string | number
        const bVal = (b as Record<string, unknown>)[sortBy.value] as string | number
        return sortOrder.value === 'asc' ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1
      })
    }
    const total = items.length
    const start = (page.value - 1) * perPage.value
    const end = start + perPage.value
    return { data: items.slice(start, end), total }
  }
  // ── Debounced Params (batches rapid mount-time changes into 1 request) ──
  const debouncedParams = refDebounced(queryParams, 150)
  // ── Query ────────────────────────────────────────────────────────────
  const listQuery = useQuery({
    queryKey: [...key, 'list', debouncedParams],
    queryFn: () => {
      // If mockData array is provided directly, use it (backwards compatible)
      if (mockData)
        return handleMockList()
      if (!fetchFn)
        throw new Error(`[useTable] Neither fetchFn nor mockData provided for "${resourceName}"`)
      return fetchFn(debouncedParams.value)
        .catch((e) => {
          onError?.(e)
          throw e
        })
        .then((result) => {
          onSuccess?.(result.data)
          return result
        })
    },
    enabled: immediate,
    retry: false,
    refetchOnWindowFocus: refetchOnFocus,
    staleTime: 0,
    gcTime: 30_000,
    placeholderData: (prev: any) => prev,
  })
  // ── Computed Data ────────────────────────────────────────────────────
  const rawItems = computed(() => listQuery.data.value?.data || [])
  const items = computed(() => {
    if (!formatterConfig?.toTable)
      return rawItems.value
    return formatForTable(rawItems.value as T[]) as unknown as T[]
  })
  const totalItems = computed(
    () => (listQuery.data.value as any)?.meta?.total || (listQuery.data.value as any)?.total || 0,
  )
  const loading = computed(() => listQuery.isLoading.value)
  const error = computed(() => listQuery.error.value)
  const forbidden = computed(() => {
    const err = listQuery.error.value as any
    return err?.status === 403
  })
  const totalPages = computed(() => Math.ceil(totalItems.value / perPage.value))
  const hasNextPage = computed(() => page.value < totalPages.value)
  const hasPrevPage = computed(() => page.value > 1)
  // ── Pagination Methods ───────────────────────────────────────────────
  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages.value)
      page.value = pageNum
  }
  const nextPage = () => {
    if (hasNextPage.value)
      page.value++
  }
  const prevPage = () => {
    if (hasPrevPage.value)
      page.value--
  }
  const setPerPage = (count: number) => {
    perPage.value = count
    page.value = 1
  }
  // ── Search Methods ───────────────────────────────────────────────────
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
    page.value = 1
  }
  // ── Status Methods ───────────────────────────────────────────────────
  const setStatusFilter = (status: string) => {
    statusFilter.value = status
    page.value = 1
  }
  // ── Sort Methods ─────────────────────────────────────────────────────
  const setSorting = (column: string, order: 'asc' | 'desc' = 'asc') => {
    sortBy.value = column
    sortOrder.value = order
    page.value = 1
  }
  const toggleSort = (column: string) => {
    if (sortBy.value === column) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    }
    else {
      sortBy.value = column
      sortOrder.value = 'asc'
    }
    page.value = 1
  }
  // ── Filter Methods ───────────────────────────────────────────────────
  const setFilters = (filters: ActiveFilters) => {
    activeFilters.value = { ...filters }
    page.value = 1
  }
  const clearFilters = () => {
    activeFilters.value = {}
    page.value = 1
  }
  const hasActiveFilters = computed(() => Object.keys(activeFilters.value).length > 0)
  const activeFilterCount = computed(() => Object.keys(activeFilters.value).length)
  // ── Selection Methods ────────────────────────────────────────────────
  const onSelectionChange = (items: (string | number)[]) => {
    selectedItems.value = items
  }
  const clearSelection = () => {
    selectedItems.value = []
  }
  // ── Core Methods ─────────────────────────────────────────────────────
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: key })
    await queryClient.refetchQueries({ queryKey: key })
  }
  const resetAll = () => {
    page.value = 1
    perPage.value = defaultPerPage
    searchQuery.value = ''
    statusFilter.value = defaultStatus
    sortBy.value = 'created_at'
    sortOrder.value = 'asc'
    activeFilters.value = {}
    selectedItems.value = []
  }
  // ── Watchers ─────────────────────────────────────────────────────────
  // Reset to page 1 when search query changes (covers v-model bindings
  // that bypass setSearchQuery).
  watch(searchQuery, () => {
    if (page.value !== 1)
      page.value = 1
  })

  if (watchKeys.length > 0) {
    watch(watchKeys, () => refresh())
  }
  return {
    // Data
    items,
    rawItems,
    totalItems,
    loading,
    error,
    forbidden,
    // Pagination
    page,
    perPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    goToPage,
    nextPage,
    prevPage,
    setPerPage,
    // Search
    searchQuery,
    setSearchQuery,
    // Status
    statusFilter,
    setStatusFilter,
    // Sort
    sortBy,
    sortOrder,
    setSorting,
    toggleSort,
    // Filters
    filterConfig,
    activeFilters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
    // Selection
    selectedItems,
    onSelectionChange,
    clearSelection,
    // Core
    refresh,
    resetAll,
  }
}

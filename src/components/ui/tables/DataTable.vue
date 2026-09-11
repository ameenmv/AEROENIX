<script setup lang="ts">
import type { ContextMenuAction } from '@/composables/useContextMenu'
import { useContextMenu } from '@/composables/useContextMenu'
import type { FilterConfig } from '@/types'
import { FilterIcon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useDebounceFn } from '@vueuse/core'
import { Button as Btn } from '@/components/uic/button'
import DataTableHeader from './DataTableHeader.vue'
import DataTableRow from './DataTableRow.vue'
import FilterSheet from './FilterSheet.vue'

const props = defineProps<{
  columns?: {
    key: string
    label: string
    sortable?: boolean
    hidden?: boolean
    editable?: boolean
    className?: string
    formatter?: any
  }[]
  data: Record<string, unknown>[]
  searchable?: boolean
  filterable?: boolean
  filterConfig?: FilterConfig
  serverSide?: boolean
  loading?: boolean
  totalItems?: number
  page?: number
  perPage?: number
  selected?: (string | number)[]
  visibleColumns?: string[]
  tableEnhancements?: any
  dragAndDrop?: any
  tabs?: { value: string, label: string }[]
  activeTab?: string
  alternatingColors?: boolean
  separatedRecords?: boolean
  modernSearch?: boolean
  /** When true, the outer container is transparent and search/table/pagination each get their own card background */
  transparentContainer?: boolean
  /**
   * When true, shows a "Select all X records" banner after header checkbox selects the current page,
   *  allowing users to select ALL records across all pages (Gmail-style).
   */
  selectAllRecords?: boolean
  /** When true, the table treats all records as selected by default, and checkboxes unselect them. */
  selectAllMode?: boolean
  /** The list of IDs that have been excluded in selectAllMode */
  excludedIds?: (string | number)[]
  /** Empty state customization */
  emptyIcon?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyActionLabel?: string
  contextMenuActions?: ContextMenuAction[]
}>()
const emit = defineEmits<{
  (e: 'update:activeTab', tab: string): void
  (e: 'update:page', page: number): void
  (e: 'update:perPage', perPage: number): void
  (e: 'update:search', query: string): void
  (e: 'search', query: string): void
  (e: 'update:filters', filters: Record<string, unknown>): void
  (e: 'filter', filters: Record<string, unknown>): void
  (e: 'update:selected', selected: (string | number)[]): void
  (e: 'update:excludedIds', excludedIds: (string | number)[]): void
  (e: 'selectionChange', selected: (string | number)[]): void
  (e: 'selectAllRecords', allIds: (string | number)[]): void
  (e: 'reorder', newOrder: any[]): void
  (e: 'inlineEdit', row: any, key: string, value: any): void
  (e: 'sort', column: string, direction: 'asc' | 'desc'): void
  (e: 'emptyAction'): void
}>()
defineSlots<{
  header?: (props: {
    columns: {
      key: string
      label: string
      sortable?: boolean
      hidden?: boolean
      editable?: boolean
      className?: string
      formatter?: any
    }[]
    selectAll?: boolean
    toggleSelectAll?: (val: boolean) => void
  }) => any
  row?: (props: {
    row: any
    index: number
    columns: {
      key: string
      label: string
      sortable?: boolean
      hidden?: boolean
      editable?: boolean
      className?: string
      formatter?: any
    }[]
    isSelected?: boolean
    toggleSelection?: () => void
  }) => any
  [key: string]: any
}>()
const { t, locale } = useI18n()
const filterStore = useFilterStore()
const localSearchQuery = ref('')
const localPerPage = ref(props.perPage || 10)
const localPage = ref(props.page || 1)
watch(
  () => props.page,
  (val) => {
    if (val)
      localPage.value = val
  },
)
watch(
  () => props.perPage,
  (val) => {
    if (val)
      localPerPage.value = val
  },
)
const handleSearch = useDebounceFn((query: string) => {
  if (props.serverSide) {
    emit('update:search', query)
    emit('search', query)
    emit('update:page', 1)
  }
}, 1000)
watch(localSearchQuery, (val) => {
  handleSearch(val)
})
function handlePageChange(p: number) {
  if (props.serverSide) {
    emit('update:page', p)
  }
  else {
    localPage.value = p
  }
}
function handlePerPageChange(val: number) {
  localPerPage.value = val
  if (props.serverSide) {
    emit('update:perPage', val)
    emit('update:page', 1)
  }
  else {
    localPage.value = 1
  }
}
function handleFilterApply(filters?: Record<string, any>) {
  const safeFilters = filters || {}
  emit('update:filters', safeFilters)
  emit('filter', safeFilters)
  emit('update:page', 1)
}
function handleOpenFilter() {
  if (props.filterConfig) {
    filterStore.setFilterConfig(props.filterConfig.resource, props.filterConfig)
    filterStore.openFilter(props.filterConfig.resource)
  }
}
// ── Async options loaded from endpoint shorthand (for popover filters) ──────
const loadedPopoverOptions = ref<Record<string, { value: any, label: string }[]>>({})
const loadingPopoverFields = ref<Set<string>>(new Set())
onMounted(() => {
  if (props.filterConfig?.fields) {
    props.filterConfig.fields.forEach((field) => {
      if (field.optionsLoader) {
        loadingPopoverFields.value.add(field.key)
        field
          .optionsLoader()
          .then((result) => {
            loadedPopoverOptions.value[field.key] = result.data
          })
          .catch((err) => {
            console.error(`[DataTable] Failed to load options for "${field.key}":`, err)
          })
          .finally(() => {
            loadingPopoverFields.value.delete(field.key)
          })
      }
    })
  }
})
/**
 * Visible popover fields — hides select/multiselect filters with no options.
 * Other field types (text, number, date, toggle, etc.) are always shown.
 */
const visiblePopoverFields = computed(() => {
  if (!props.filterConfig?.fields)
    return []
  return props.filterConfig.fields.filter((field) => {
    if (field.type === 'select' || field.type === 'multiselect') {
      // Still loading from API — hide until resolved
      if (loadingPopoverFields.value.has(field.key))
        return false
      // Fields with an async optionsLoader always show (even if empty — "No options" placeholder)
      if (field.optionsLoader)
        return true
      // Static fields with no options — hide
      const opts = field.options || []
      return opts.length > 0
    }
    return true
  })
})
// ── Local modern filters state (used when modernSearch + filterConfig) ──
const localModernFilters = ref<Record<string, any>>({})
function handleModernFilterUpdate(filters: Record<string, any>) {
  localModernFilters.value = { ...filters }
  // Also emit so parent can react if needed
  emit('update:filters', filters)
  emit('filter', filters)
  // Reset to page 1
  if (!props.serverSide) {
    localPage.value = 1
  }
  else {
    emit('update:page', 1)
  }
}
// ── Popover filter helpers ──
function getPopoverFilterVal(key: string) {
  return localModernFilters.value[key]
}
function setPopoverFilterVal(key: string, value: any) {
  if (value === null || value === undefined || value === '') {
    const copy = { ...localModernFilters.value }
    delete copy[key]
    handleModernFilterUpdate(copy)
  }
  else {
    handleModernFilterUpdate({ ...localModernFilters.value, [key]: value })
  }
}
function togglePopoverMultiSelect(key: string, value: any) {
  const current = getPopoverFilterVal(key)
  if (Array.isArray(current)) {
    if (current.includes(value)) {
      const next = current.filter((v: any) => v !== value)
      setPopoverFilterVal(key, next.length > 0 ? next : undefined)
    }
    else {
      setPopoverFilterVal(key, [...current, value])
    }
  }
  else {
    setPopoverFilterVal(key, [value])
  }
}
function isPopoverMultiSelected(key: string, value: any) {
  const current = getPopoverFilterVal(key)
  return Array.isArray(current) && current.includes(value)
}
function clearAllPopoverFilters() {
  handleModernFilterUpdate({})
}
/** Resolve i18n key or return raw label */
function tLabel(label: string): string {
  if (!label)
    return ''
  // If it looks like an i18n key (has dot), try to translate; fallback to capitalised key
  if (label.includes('.')) {
    const translated = t(label, label)
    // If translation is same as key, derive from last segment
    if (translated === label) {
      const parts = label.split('.')
      const last = parts[parts.length - 1] ?? ''
      return last.charAt(0).toUpperCase() + last.slice(1).replace(/_/g, ' ')
    }
    return translated
  }
  return label
}
function translatedFieldOptions(field: any) {
  // Prefer dynamically loaded options (from endpoint/optionsLoader), fall back to static field.options
  const opts = loadedPopoverOptions.value[field.key] || field.options
  if (!opts)
    return []
  return opts.map((opt: any) => ({
    ...opt,
    label: tLabel(opt.label),
  }))
}
const filteredData = computed(() => {
  if (props.serverSide)
    return props.data
  let result = props.data
  if (props.searchable && localSearchQuery.value) {
    const query = localSearchQuery.value.toLowerCase()
    result = result.filter((item) => {
      return Object.values(item).some(val => String(val).toLowerCase().includes(query))
    })
  }
  // Apply modernSearch inline filters
  if (props.modernSearch && props.filterConfig) {
    const filters = localModernFilters.value
    result = result.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined || value === '')
          return true
        if (Array.isArray(value)) {
          return value.some(v => String(item[key]) === String(v))
        }
        if (typeof value === 'object' && value.from !== undefined) {
          const itemVal = item[key]
          const itemDate = new Date(itemVal as string | number)
          const fromDate = value.from ? new Date(value.from) : null
          const toDate = value.to ? new Date(value.to) : null
          if (fromDate && itemDate < fromDate)
            return false
          if (toDate && itemDate > toDate)
            return false
          return true
        }
        return String(item[key]).toLowerCase().includes(String(value).toLowerCase())
      })
    })
  }
  // Apply store-based filters (FilterSheet)
  if (props.filterable && props.filterConfig && !props.modernSearch) {
    const activeFilters = filterStore.getActiveFilters(props.filterConfig.resource)
    result = result.filter((item) => {
      return Object.entries(activeFilters).every(([key, value]) => {
        if (value === null || value === undefined || value === '')
          return true
        if (Array.isArray(value)) {
          return value.some(v => String(item[key]) === String(v))
        }
        if (typeof value === 'object' && value.from !== undefined) {
          const itemVal = item[key]
          const itemDate = new Date(itemVal as string | number)
          const fromDate = value.from ? new Date(value.from) : null
          const toDate = value.to ? new Date(value.to) : null
          if (fromDate && itemDate < fromDate)
            return false
          if (toDate && itemDate > toDate)
            return false
          return true
        }
        return String(item[key]).toLowerCase().includes(String(value).toLowerCase())
      })
    })
  }
  return result
})
const totalPages = computed(() => {
  if (props.serverSide) {
    return Math.ceil((props.totalItems || 0) / localPerPage.value)
  }
  return Math.ceil(filteredData.value.length / localPerPage.value)
})
const paginatedData = computed(() => {
  if (props.serverSide)
    return props.data as Record<string, unknown>[]
  const start = (localPage.value - 1) * localPerPage.value
  const end = start + localPerPage.value
  return filteredData.value.slice(start, end)
})
const perPageOptions = [
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
]
const showingStart = computed(() => {
  if (props.serverSide) {
    return (localPage.value - 1) * localPerPage.value + 1
  }
  return (localPage.value - 1) * localPerPage.value + 1
})
const showingEnd = computed(() => {
  if (props.serverSide) {
    return Math.min(localPage.value * localPerPage.value, props.totalItems || 0)
  }
  return Math.min(localPage.value * localPerPage.value, filteredData.value.length)
})
const totalEntries = computed(() => {
  if (props.serverSide)
    return props.totalItems || 0
  return filteredData.value.length
})
const modernFilterActiveCount = computed(() => {
  return Object.values(localModernFilters.value).filter(
    v => v !== undefined && v !== '' && v !== null,
  ).length
})
const hasActiveFilters = computed(() => {
  if (!props.filterConfig)
    return false
  return filterStore.hasActiveFilters(props.filterConfig.resource)
})
const activeFilterCount = computed(() => {
  if (!props.filterConfig)
    return 0
  return filterStore.getActiveFilterCount(props.filterConfig.resource)
})
/** Whether user has an active search query or any applied filters */
const hasSearchOrFilters = computed(() => {
  if (localSearchQuery.value.trim())
    return true
  if (modernFilterActiveCount.value > 0)
    return true
  if (hasActiveFilters.value)
    return true
  return false
})
function handleClearFilters() {
  localSearchQuery.value = ''
  if (props.modernSearch) {
    clearAllPopoverFilters()
  }
  if (props.filterConfig) {
    filterStore.clearFilters(props.filterConfig.resource)
    handleFilterApply({})
  }
  if (props.serverSide) {
    emit('update:search', '')
    emit('search', '')
    emit('update:page', 1)
  }
}
const actualColumns = computed(() => {
  const cols = props.columns || []
  if (props.visibleColumns && props.visibleColumns.length > 0) {
    return cols.filter((c: any) => props.visibleColumns!.includes(c.key))
  }
  return cols.filter((c: any) => !c.hidden)
})
const localSelected = ref<(string | number)[]>([])
watch(
  () => props.selected,
  (newVal) => {
    if (newVal)
      localSelected.value = [...newVal]
  },
  { deep: true, immediate: true },
)
const localExcluded = ref<(string | number)[]>([])
watch(
  () => props.excludedIds,
  (newVal) => {
    if (newVal)
      localExcluded.value = [...newVal]
  },
  { deep: true, immediate: true },
)
// ── "Select all records" banner state ────────────────────────────────────────
// True when user explicitly clicked "Select all X records" across all pages
const allRecordsSelected = ref(false)
// All record IDs from filteredData (i.e. all pages, not just current page)
const allFilteredIds = computed(() => filteredData.value.map(r => String(r.id || '')))
// Whether the entire current page is selected
const isCurrentPageAllSelected = computed(
  () =>
    paginatedData.value.length > 0
    && paginatedData.value.every(r => localSelected.value.includes(String(r.id || ''))),
)
// Whether there are more records beyond the current page
const hasMoreRecordsBeyondPage = computed(() => {
  if (props.serverSide)
    return (props.totalItems || 0) > paginatedData.value.length
  return filteredData.value.length > paginatedData.value.length
})
// Show the "Select all X records" banner when:
// 1. selectAllRecords prop is enabled
// 2. tableEnhancements.rowSelection is enabled
// 3. The entire current page is selected
// 4. There are more records beyond the current page
// 5. Not already selected all records
const showSelectAllBanner = computed(
  () =>
    props.selectAllRecords
    && props.tableEnhancements?.rowSelection
    && isCurrentPageAllSelected.value
    && hasMoreRecordsBeyondPage.value,
)
/** Select ALL records across all pages */
function selectAllRecordsAction() {
  allRecordsSelected.value = true
  if (props.serverSide) {
    // Cannot populate localSelected with all IDs because they aren't loaded.
    // Emit special empty array to indicate 'all records' mode
    emit('selectAllRecords', [])
    return
  }
  localSelected.value = [...allFilteredIds.value]
  emit('update:selected', [...localSelected.value])
  emit('selectionChange', [...localSelected.value])
  emit('selectAllRecords', [...localSelected.value])
}
/** Clear all selections */
function clearAllSelection() {
  localSelected.value = []
  allRecordsSelected.value = false
  emit('update:selected', [])
  emit('selectionChange', [])
}
const selectAll = computed({
  get: () => {
    if (props.selectAllMode) {
      return (
        paginatedData.value.length > 0
        && paginatedData.value.every(r => !localExcluded.value.includes(String(r.id || '')))
      )
    }
    return (
      localSelected.value.length > 0
      && paginatedData.value.length > 0
      && paginatedData.value.every(r => localSelected.value.includes(String(r.id || '')))
    )
  },
  set: (val: boolean) => {
    if (props.selectAllMode) {
      if (val) {
        // If checking 'Select All', clear exclusions for the current page
        const pageIds = new Set(paginatedData.value.map(r => String(r.id || '')))
        localExcluded.value = localExcluded.value.filter(id => !pageIds.has(String(id)))
      }
      else {
        // If unchecking 'Select All', add current page to exclusions
        const pageIds = paginatedData.value.map(r => String(r.id || ''))
        const merged = new Set([...localExcluded.value, ...pageIds])
        localExcluded.value = [...merged]
      }
      emit('update:excludedIds', [...localExcluded.value])
      return
    }
    if (val) {
      // Select all on current page (merge with existing cross-page selections)
      const pageIds = paginatedData.value.map(r => String(r.id || ''))
      const merged = new Set([...localSelected.value, ...pageIds])
      localSelected.value = [...merged]
    }
    else {
      // If all records were selected, clear everything
      if (allRecordsSelected.value) {
        localSelected.value = []
        allRecordsSelected.value = false
      }
      else {
        // Deselect only current page items (keep cross-page selections)
        const pageIds = new Set(paginatedData.value.map(r => String(r.id || '')))
        localSelected.value = localSelected.value.filter(id => !pageIds.has(String(id)))
      }
    }
    emit('update:selected', [...localSelected.value])
    emit('selectionChange', [...localSelected.value])
  },
})
function toggleSelection(id: string | number) {
  if (props.selectAllMode) {
    const strId = String(id)
    const idx = localExcluded.value.indexOf(strId)
    if (idx > -1) {
      localExcluded.value = localExcluded.value.filter((_, i) => i !== idx)
    }
    else {
      localExcluded.value = [...localExcluded.value, strId]
    }
    emit('update:excludedIds', [...localExcluded.value])
    return
  }
  if (allRecordsSelected.value) {
    allRecordsSelected.value = false
    const pageIds = paginatedData.value.map(r => String(r.id || ''))
    localSelected.value = pageIds.filter(pid => pid !== String(id))
    emit('update:selected', [...localSelected.value])
    emit('selectionChange', [...localSelected.value])
    return
  }
  const idx = localSelected.value.indexOf(id)
  if (idx > -1) {
    localSelected.value = localSelected.value.filter((_, i) => i !== idx)
    // If we deselect one, we're no longer in "all records selected" mode
    allRecordsSelected.value = false
  }
  else {
    localSelected.value = [...localSelected.value, id]
  }
  emit('update:selected', [...localSelected.value])
  emit('selectionChange', [...localSelected.value])
}
const sortColumn = ref<string>('')
const sortDirection = ref<'asc' | 'desc' | ''>('')
function toggleSort(colKey: string, isSortable: boolean) {
  if (!isSortable)
    return
  if (sortColumn.value === colKey) {
    if (sortDirection.value === 'asc') {
      sortDirection.value = 'desc'
    }
    else if (sortDirection.value === 'desc') {
      sortColumn.value = ''
      sortDirection.value = ''
    }
  }
  else {
    sortColumn.value = colKey
    sortDirection.value = 'asc'
  }
  if (!props.serverSide) {
    // client side sort handled automatically if we augment filteredData, but to keep it simple,
    // we'll just emit it so parent can handle if they want to.
  }
  emit('sort', sortColumn.value, sortDirection.value as 'asc' | 'desc')
}
const editingCell = ref<{ rowId: string | number, colKey: string } | null>(null)
const editValue = ref<any>('')
function startInlineEdit(row: any, colKey: string, val: any, isEditable: boolean) {
  if (!isEditable || !props.tableEnhancements?.inlineEditing)
    return
  editingCell.value = { rowId: row.id as string | number, colKey }
  editValue.value = val
}
function commitInlineEdit(row: any, colKey: string) {
  if (!editingCell.value)
    return
  emit('inlineEdit', row, colKey, editValue.value)
  editingCell.value = null
}
function cancelInlineEdit() {
  editingCell.value = null
}
let draggedRowIdx: number | null = null
const dragOverRowIdx = ref<number | null>(null)
function handleDragStart(e: DragEvent, index: number) {
  draggedRowIdx = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }
}
function handleDragOver(e: DragEvent, index: number) {
  e.preventDefault()
  if (e.dataTransfer)
    e.dataTransfer.dropEffect = 'move'
  if (draggedRowIdx !== index) {
    dragOverRowIdx.value = index
  }
}
function handleDragLeave(_e: DragEvent, index: number) {
  if (dragOverRowIdx.value === index) {
    dragOverRowIdx.value = null
  }
}
function handleDragEnd(_e: DragEvent) {
  draggedRowIdx = null
  dragOverRowIdx.value = null
}
function handleDrop(e: DragEvent, index: number) {
  e.preventDefault()
  if (draggedRowIdx !== null && draggedRowIdx !== index) {
    const newItems = [...(props.serverSide ? props.data : filteredData.value)]
    const item = newItems.splice(draggedRowIdx, 1)[0] as Record<string, unknown>
    if (item) {
      newItems.splice(index, 0, item)
      emit('reorder', newItems)
    }
  }
  draggedRowIdx = null
  dragOverRowIdx.value = null
}

// ── Context menu ────────────────────────────────────────────────────────────
const { openContextMenu } = useContextMenu()

function handleTableContextMenu(event: MouseEvent) {
  if (!props.contextMenuActions?.length)
    return
  // Walk up from the click target to find the <tr>
  let el = event.target as HTMLElement | null
  while (el && el.tagName !== 'TR') el = el.parentElement
  if (!el)
    return
  // Map <tr> index → paginatedData row
  const siblings = Array.from(el.parentElement?.children ?? [])
  const idx = siblings.indexOf(el)
  const row = paginatedData.value[idx]
  if (!row)
    return
  openContextMenu(
    event,
    props.contextMenuActions.map(a => ({
      ...a,
      onClick: () => a.onClick?.(row as Record<string, unknown>),
    })),
  )
}
</script>


<template>
  <div class="space-y-4">
    <FilterSheet
      v-if="filterConfig"
      :resource="filterConfig.resource"
      :config="filterConfig"
      @apply="handleFilterApply"
      @close="() => filterStore.closeFilter(filterConfig!.resource)"
    />
    <slot name="toolbar">
      <div
        v-if="!modernSearch"
        class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-1"
      >
        <div class="flex items-center gap-2">
          <SelectField
            :model-value="localPerPage"
            :options="perPageOptions"
            variant="default"
            size="md"
            class="w-fit"
            @update:model-value="handlePerPageChange(Number($event))"
          />
          <span class="text-xs text-muted-foreground whitespace-nowrap">{{
            t('common.entries_per_page')
          }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div
            v-if="searchable && !modernSearch"
            class="relative flex items-center flex-1 sm:w-[200px] sm:flex-none h-8"
          >
            <div class="absolute start-2.5 flex items-center justify-center pointer-events-none">
              <HugeiconsIcon
                :icon="Search01Icon"
                :size="14"
                stroke-width="2"
                class="text-muted-foreground"
              />
            </div>
            <Input
              v-model="localSearchQuery"
              :dir="locale === 'ar' ? 'rtl' : 'ltr'"
              type="text"
              :placeholder="t('common.search')"
              class="h-8 w-full ps-8 pe-3 text-xs bg-background border border-border rounded-md focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
            />
          </div>
          <Btn
            v-if="filterable && filterConfig && !modernSearch"
            variant="outline"
            size="sm"
            class="relative flex items-center justify-center h-8 px-3 gap-1.5 rounded-md text-xs shrink-0"
            :class="{ 'ring-1 ring-ring': hasActiveFilters }"
            @click="handleOpenFilter"
          >
            <HugeiconsIcon :icon="FilterIcon" :size="14" class="text-muted-foreground" />
            {{ t('common.filters', 'Filters') }}
            <span
              v-if="activeFilterCount > 0"
              class="absolute -top-1 -end-1 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] font-bold flex items-center justify-center"
            >
              {{ activeFilterCount }}
            </span>
          </Btn>
        </div>
      </div>
    </slot>
    <!-- Main styled container bridging Tabs, Table, and Pagination -->
    <div
      class="flex flex-col w-full"
      :class="
        props.transparentContainer
          ? 'bg-transparent border-none shadow-none gap-[16px]'
          : 'bg-card border border-border rounded-[31px] shadow-sm overflow-hidden'
      "
    >
      <!-- Optional Tabs -->
      <div
        v-if="tabs && tabs.length"
        class="flex flex-row items-center px-4 md:px-6 bg-muted/30 border-b border-border overflow-x-auto custom-scrollbar"
      >
        <Button
          v-for="tab in tabs"
          :key="tab.value"
          variant="none"
          size="none"
          class="relative px-4 py-4 md:px-6 text-[14.7px] transition-colors outline-none whitespace-nowrap flex items-center justify-center min-h-[57px]"
          :class="
            activeTab === tab.value
              ? 'text-primary font-bold'
              : 'text-muted-foreground font-semibold hover:text-foreground'
          "
          @click="emit('update:activeTab', tab.value)"
        >
          {{ typeof tab.label === 'string' && tab.label.includes('.') ? t(tab.label) : tab.label }}
          <div
            v-if="activeTab === tab.value"
            class="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-[3px]"
          />
        </Button>
      </div>
      <!-- Modern Inner Search & Filter -->
      <div
        v-if="modernSearch"
        :class="
          props.transparentContainer
            ? 'flex flex-col gap-[16px] p-[16px] md:px-[24px] md:py-[16px] bg-card border border-border rounded-[24px] md:rounded-[80px] shadow-sm w-full'
            : 'flex flex-col gap-[16px] p-[16px] md:px-[32px] md:pt-[32px] md:pb-[12px] w-full'
        "
      >
        <div
          class="flex flex-col sm:flex-row items-stretch sm:items-center gap-[12px] sm:gap-[19px] w-full"
        >
          <div
            v-if="searchable"
            class="flex flex-row items-center h-[48px] rounded-[24px] bg-seen-white-350 dark:bg-slate-800/50 border border-seen-grey-light-300 dark:border-slate-700 overflow-hidden w-full flex-1"
          >
            <div class="flex items-center justify-center w-[48px] h-[48px] shrink-0">
              <svg
                class="w-[14px] h-[14px] text-seen-blue-550 dark:text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <Input
              v-model="localSearchQuery"
              :dir="locale === 'ar' ? 'rtl' : 'ltr'"
              :placeholder="t('common.search')"
              class="!border-0 !ring-0 !shadow-none !rounded-none !bg-transparent text-[11px] font-[600] tracking-[1px] !h-full placeholder:text-seen-blue-550 dark:placeholder:text-slate-400 placeholder:uppercase text-slate-900 dark:text-white"
            />
          </div>
          <slot name="modern-actions" />
          <!-- Filter Popover Button -->
          <Popover v-if="filterConfig && visiblePopoverFields.length > 0">
            <PopoverTrigger as-child>
              <div
                class="flex flex-row items-center justify-center px-4 h-[48px] rounded-[24px] bg-seen-white-350 dark:bg-slate-800/50 border border-seen-grey-light-300 dark:border-slate-700 overflow-hidden cursor-pointer hover:bg-seen-white-700 dark:hover:bg-slate-700/50 transition-colors shrink-0 w-full sm:w-auto"
              >
                <div class="flex items-center justify-center shrink-0 me-2">
                  <svg
                    class="w-[14px] h-[14px] text-seen-blue-1400 dark:text-slate-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                  </svg>
                </div>
                <p
                  class="text-[11px] font-[600] tracking-[1px] text-seen-blue-1400 dark:text-slate-300 uppercase"
                >
                  {{ t('common.filters', 'Filters') }}
                </p>
                <span
                  v-if="modernFilterActiveCount > 0"
                  class="ms-2 w-5 h-5 bg-primary text-primary-foreground rounded-full text-[11px] font-bold flex items-center justify-center"
                >
                  {{ modernFilterActiveCount }}
                </span>
              </div>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              :side-offset="8"
              class="w-[420px] !p-0 !rounded-[28px] border border-border bg-card shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden"
            >
              <!-- Popover Header -->
              <div class="flex items-center justify-between px-5 py-4 border-b border-border">
                <div class="flex items-center gap-2">
                  <svg
                    class="w-4 h-4 text-foreground/60"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                  </svg>
                  <span class="text-sm font-semibold text-foreground">{{
                    t('common.filters', 'Filters')
                  }}</span>
                  <span
                    v-if="modernFilterActiveCount > 0"
                    class="ms-1 px-1.5 py-0.5 bg-primary/10 text-primary rounded-md text-[10px] font-bold"
                  >
                    {{ modernFilterActiveCount }} {{ t('common.active', 'active') }}
                  </span>
                </div>
                <Button
                  v-if="modernFilterActiveCount > 0"
                  variant="none"
                  size="none"
                  class="text-xs text-destructive hover:text-destructive/80 font-medium transition-colors"
                  @click="clearAllPopoverFilters"
                >
                  {{ t('common.clear_all', 'Clear All') }}
                </Button>
              </div>
              <!-- Popover Filter Fields -->
              <div class="p-5 flex flex-col gap-4 max-h-[340px] overflow-y-auto custom-scrollbar">
                <div
                  v-for="field in visiblePopoverFields"
                  :key="field.key"
                  class="flex flex-col gap-1.5"
                >
                  <label class="text-xs font-medium text-foreground/70">
                    {{ tLabel(field.label) }}
                  </label>
                  <!-- Text -->
                  <Input
                    v-if="field.type === 'text'"
                    :dir="locale === 'ar' ? 'rtl' : 'ltr'"
                    :model-value="getPopoverFilterVal(field.key) || ''"
                    :placeholder="field.placeholder || t('common.search', 'Search...')"
                    class="h-9 text-xs rounded-lg"
                    @update:model-value="setPopoverFilterVal(field.key, $event)"
                  />
                  <!-- Select -->
                  <SelectField
                    v-else-if="field.type === 'select'"
                    :dir="locale === 'ar' ? 'rtl' : 'ltr'"
                    :model-value="getPopoverFilterVal(field.key) || ''"
                    :options="translatedFieldOptions(field)"
                    :placeholder="field.placeholder || t('common.select', 'Select...')"
                    variant="default"
                    size="sm"
                    class="!rounded-lg"
                    @update:model-value="setPopoverFilterVal(field.key, $event)"
                  />
                  <!-- Multiselect (pill toggles) -->
                  <div v-else-if="field.type === 'multiselect'" class="flex flex-wrap gap-1.5">
                    <span
                      v-for="opt in translatedFieldOptions(field)"
                      :key="opt.value"
                      class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer transition-all border select-none"
                      :class="[
                        isPopoverMultiSelected(field.key, opt.value)
                          ? 'bg-primary/10 text-primary border-primary'
                          : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-foreground',
                      ]"
                      @click="togglePopoverMultiSelect(field.key, opt.value)"
                    >
                      {{ opt.label }}
                    </span>
                    <span
                      v-if="translatedFieldOptions(field).length === 0"
                      class="text-xs text-muted-foreground italic"
                    >
                      {{ t('common.no_options', 'No options available') }}
                    </span>
                  </div>
                  <!-- Toggle -->
                  <div v-else-if="field.type === 'toggle'" class="flex items-center gap-2 pt-0.5">
                    <Switch
                      :checked="!!getPopoverFilterVal(field.key)"
                      @update:checked="setPopoverFilterVal(field.key, $event)"
                    />
                    <span class="text-xs text-muted-foreground">
                      {{
                        getPopoverFilterVal(field.key)
                          ? t('common.yes', 'Yes')
                          : t('common.no', 'No')
                      }}
                    </span>
                  </div>
                  <!-- Date -->
                  <DatePicker
                    v-else-if="field.type === 'date'"
                    :model-value="getPopoverFilterVal(field.key) || null"
                    :placeholder="field.placeholder || t('common.select_date', 'Select date')"
                    class="!h-9 !text-xs !rounded-lg"
                    @update:model-value="setPopoverFilterVal(field.key, $event)"
                  />
                  <!-- DateRange -->
                  <div v-else-if="field.type === 'dateRange'" class="grid grid-cols-2 gap-2">
                    <div class="flex flex-col gap-1">
                      <span class="text-[10px] text-muted-foreground">{{
                        t('common.from', 'From')
                      }}</span>
                      <DatePicker
                        :model-value="(getPopoverFilterVal(field.key) as any)?.from || null"
                        :placeholder="t('common.from', 'From')"
                        class="!h-9 !text-xs !rounded-lg"
                        @update:model-value="
                          setPopoverFilterVal(field.key, {
                            ...(getPopoverFilterVal(field.key) || {}),
                            from: $event || undefined,
                          })
                        "
                      />
                    </div>
                    <div class="flex flex-col gap-1">
                      <span class="text-[10px] text-muted-foreground">{{
                        t('common.to', 'To')
                      }}</span>
                      <DatePicker
                        :model-value="(getPopoverFilterVal(field.key) as any)?.to || null"
                        :placeholder="t('common.to', 'To')"
                        class="!h-9 !text-xs !rounded-lg"
                        @update:model-value="
                          setPopoverFilterVal(field.key, {
                            ...(getPopoverFilterVal(field.key) || {}),
                            to: $event || undefined,
                          })
                        "
                      />
                    </div>
                  </div>
                  <!-- Checkbox -->
                  <div v-else-if="field.type === 'checkbox'" class="flex items-center gap-2 pt-0.5">
                    <Checkbox
                      :id="`popfilter-${field.key}`"
                      :checked="!!getPopoverFilterVal(field.key)"
                      @update:checked="setPopoverFilterVal(field.key, $event)"
                    />
                    <label
                      :for="`popfilter-${field.key}`"
                      class="text-xs text-foreground font-normal cursor-pointer"
                    >
                      {{ field.placeholder || t('common.enabled', 'Enabled') }}
                    </label>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <slot name="modern-filter" />
        </div>
      </div>
      <!-- Transparent variant: wrap table + pagination in one card -->
      <template v-if="props.transparentContainer">
        <div class="bg-card border border-border rounded-[40px] shadow-sm pt-8 overflow-hidden">
          <div
            class="neop-table-container !rounded-none !border-none"
            :class="{ 'separated-records-wrapper': props.separatedRecords }"
          >
            <div class="overflow-visible">
              <Table class="neop-table">
                <TableHeader>
                  <slot name="header" :columns="actualColumns">
                    <DataTableHeader
                      :columns="actualColumns"
                      :drag-and-drop="props.dragAndDrop"
                      :table-enhancements="props.tableEnhancements"
                      :select-all="selectAll"
                      :sort-column="sortColumn"
                      :sort-direction="sortDirection"
                      :has-actions="!!$slots.actions"
                      @update:select-all="selectAll = $event"
                      @sort="toggleSort"
                    >
                      <template
                        v-for="col in actualColumns"
                        :key="`head-${col.key}`"
                        #[`head-${col.key}`]="slotProps"
                      >
                        <slot :name="`head-${col.key}`" v-bind="slotProps" />
                      </template>
                    </DataTableHeader>
                  </slot>
                </TableHeader>
                <!-- "Select all records" banner (separated records) -->
                <TableBody v-if="showSelectAllBanner" class="border-none dt-banner-body">
                  <TableRow class="hover:bg-transparent border-none dt-banner-row">
                    <TableCell
                      :colspan="
                        actualColumns.length
                          + ($slots.actions ? 1 : 0)
                          + (props.tableEnhancements?.rowSelection ? 1 : 0)
                          + (props.dragAndDrop?.enabled ? 1 : 0)
                      "
                      class="!p-0 border-none"
                    >
                      <div
                        class="flex items-center justify-center gap-2 py-2.5 px-4 bg-primary/5 dark:bg-primary/10 text-sm text-center rounded-[12px] w-full"
                      >
                        <template v-if="allRecordsSelected">
                          <span class="text-foreground/70">
                            {{
                              t(
                                'common.all_records_selected',
                                `All ${allFilteredIds.length} records are selected.`,
                              )
                            }}
                          </span>
                          <Button
                            variant="none"
                            size="none"
                            class="text-primary font-semibold hover:underline"
                            @click="clearAllSelection"
                          >
                            {{ t('common.clear_selection', 'Clear selection') }}
                          </Button>
                        </template>
                        <template v-else>
                          <span class="text-foreground/70">
                            {{
                              t(
                                'common.page_selected',
                                `All ${paginatedData.length} items on this page are selected.`,
                              )
                            }}
                          </span>
                          <Button
                            variant="none"
                            size="none"
                            class="text-primary font-semibold hover:underline"
                            @click="selectAllRecordsAction"
                          >
                            {{
                              t(
                                'common.select_all_records',
                                `Select all ${allFilteredIds.length} records`,
                              )
                            }}
                          </Button>
                        </template>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
                <TableBody
                  class="bg-transparent border-none"
                  @contextmenu="handleTableContextMenu"
                  :class="{ 'separated-records-body': props.separatedRecords }"
                >
                  <template v-if="loading">
                    <TableRow
                      v-for="i in localPerPage || 5"
                      :key="`skeleton-${i}`"
                      class="animate-pulse pointer-events-none"
                      :class="[
                        props.separatedRecords
                          ? 'separated-record-row border border-border !bg-card'
                          : 'bg-card border-none hover:bg-card',
                      ]"
                      :style="{ animationDelay: `${(i - 1) * 75}ms` }"
                    >
                      <TableCell v-if="props.dragAndDrop?.enabled" class="px-2 py-3 w-10">
                        <div
                          class="h-5 w-5 bg-muted/70 dark:bg-slate-700/60 rounded-[4px] skeleton-shimmer mx-auto"
                        />
                      </TableCell>
                      <TableCell
                        v-if="props.tableEnhancements?.rowSelection"
                        class="px-2 py-3 text-center w-12"
                      >
                        <div
                          class="h-4 w-4 bg-muted/70 dark:bg-slate-700/60 rounded-[4px] skeleton-shimmer mx-auto"
                        />
                      </TableCell>
                      <template v-if="actualColumns.length > 0">
                        <TableCell
                          v-for="(col, colIdx) in actualColumns"
                          :key="`sk-col-${col.key}`"
                          class="px-3 py-3"
                        >
                          <div
                            class="h-3.5 bg-muted/70 dark:bg-slate-700/60 rounded-full mx-auto skeleton-shimmer"
                            :class="[
                              colIdx === 0
                                ? 'w-1/2'
                                : colIdx === actualColumns.length - 1
                                  ? 'w-8 h-8 rounded-full'
                                  : 'w-3/4',
                            ]"
                          />
                        </TableCell>
                      </template>
                      <template v-else>
                        <TableCell v-for="j in 3" :key="`sk-gen-${j}`" class="px-3 py-3">
                          <div
                            class="h-3.5 bg-muted/70 dark:bg-slate-700/60 rounded-full w-3/4 mx-auto skeleton-shimmer"
                          />
                        </TableCell>
                      </template>
                      <TableCell v-if="$slots.actions" class="px-3 py-3">
                        <div
                          class="h-8 w-8 bg-muted/70 dark:bg-slate-700/60 rounded-full mx-auto skeleton-shimmer"
                        />
                      </TableCell>
                    </TableRow>
                  </template>
                  <template v-else>
                    <template
                      v-for="(row, index) in paginatedData"
                      :key="row.id ? String(row.id) : index"
                    >
                      <slot name="row" :row="row" :index="index" :columns="actualColumns">
                        <DataTableRow
                          :row="row"
                          :index="index"
                          :columns="actualColumns"
                          :drag-and-drop="props.dragAndDrop"
                          :table-enhancements="props.tableEnhancements"
                          :is-selected="
                            allRecordsSelected || localSelected.includes(String(row.id))
                          "
                          :is-dragged="draggedRowIdx === index"
                          :drag-over-state="
                            dragOverRowIdx === index && draggedRowIdx !== null
                              ? draggedRowIdx > index
                                ? 'top'
                                : 'bottom'
                              : null
                          "
                          :editing-cell-key="
                            editingCell && editingCell.rowId === String(row.id)
                              ? editingCell.colKey
                              : null
                          "
                          :edit-value="editValue"
                          :has-actions="!!$slots.actions"
                          :class="[
                            props.separatedRecords
                              ? 'separated-record-row border border-border'
                              : '',
                            {
                              'alternating-even': props.alternatingColors && index % 2 === 0,
                              'alternating-odd': props.alternatingColors && index % 2 !== 0,
                            },
                          ]"
                          @toggle-selection="toggleSelection(String(row.id))"
                          @dragstart="handleDragStart($event, index)"
                          @dragover="handleDragOver($event, index)"
                          @dragleave="handleDragLeave($event, index)"
                          @dragend="handleDragEnd($event)"
                          @drop="handleDrop($event, index)"
                          @start-edit="startInlineEdit"
                          @commit-edit="commitInlineEdit"
                          @cancel-edit="cancelInlineEdit"
                          @update:edit-value="editValue = $event"
                        >
                          <template
                            v-for="col in actualColumns"
                            :key="col.key"
                            #[col.key]="slotProps"
                          >
                            <slot :name="col.key" v-bind="slotProps" />
                          </template>
                          <template v-if="$slots.actions" #actions="slotProps">
                            <slot name="actions" v-bind="slotProps" />
                          </template>
                        </DataTableRow>
                      </slot>
                    </template>
                    <!-- Empty State -->
                    <TableRow
                      v-if="paginatedData.length === 0"
                      class="dt-empty-row bg-card hover:bg-card"
                    >
                      <TableCell
                        :colspan="
                          Math.max(actualColumns.length, 3)
                            + ($slots.actions ? 1 : 0)
                            + (props.tableEnhancements?.rowSelection ? 1 : 0)
                            + (props.dragAndDrop?.enabled ? 1 : 0)
                        "
                        class="!p-0 border-none"
                      >
                        <slot name="empty">
                          <div class="dt-empty-state">
                            <template v-if="hasSearchOrFilters">
                              <div class="dt-empty-state__icon dt-empty-state__icon--search">
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="1.5"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                >
                                  <circle cx="11" cy="11" r="8" />
                                  <path d="m21 21-4.3-4.3" />
                                </svg>
                              </div>
                              <p class="dt-empty-state__title">
                                {{ t('common.empty_state.no_results_title', 'No results found') }}
                              </p>
                              <p class="dt-empty-state__desc">
                                {{
                                  t(
                                    'common.empty_state.no_results_desc',
                                    'Try adjusting your filters or search term.',
                                  )
                                }}
                              </p>
                              <Button
                                variant="none"
                                size="none"
                                class="dt-empty-state__action dt-empty-state__action--outline"
                                @click="handleClearFilters"
                              >
                                {{ t('common.empty_state.clear_filters', 'Clear filters') }}
                              </Button>
                            </template>
                            <template v-else>
                              <div class="dt-empty-state__illustration">
                                <slot name="empty-icon">
                                  <EmptyBoxIcon />
                                </slot>
                              </div>
                              <p class="dt-empty-state__title">
                                {{ emptyTitle || t('common.empty_state.title', 'No data yet') }}
                              </p>
                              <p class="dt-empty-state__desc">
                                {{
                                  emptyDescription
                                    || t(
                                      'common.empty_state.description',
                                      'Once items are created, they will appear here.',
                                    )
                                }}
                              </p>
                              <Button
                                v-if="emptyActionLabel || $slots['empty-action']"
                                variant="none"
                                size="none"
                                class="dt-empty-state__action dt-empty-state__action--primary"
                                @click="emit('emptyAction')"
                              >
                                <slot name="empty-action">
                                  <svg
                                    class="dt-empty-state__action-icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  >
                                    <path d="M12 5v14M5 12h14" />
                                  </svg>
                                  {{ emptyActionLabel }}
                                </slot>
                              </Button>
                            </template>
                          </div>
                        </slot>
                      </TableCell>
                    </TableRow>
                  </template>
                </TableBody>
              </Table>
            </div>
          </div>
          <!-- Pagination inside the card -->
          <div
            v-if="totalEntries > 0"
            class="flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6 py-[16px] bg-card mt-auto border-t border-border"
          >
            <span
              class="text-[11.6px] font-bold text-muted-foreground tracking-[1.16px] text-center md:text-start w-full md:w-auto"
            >
              {{
                t('common.showing_info', {
                  start: showingStart,
                  end: showingEnd,
                  total: totalEntries,
                })
              }}
            </span>
            <div
              class="flex flex-col sm:flex-row items-center justify-center md:justify-end gap-4 sm:gap-6 w-full md:w-auto"
            >
              <div class="flex items-center gap-2">
                <SelectField
                  :model-value="localPerPage"
                  :options="perPageOptions"
                  variant="default"
                  size="sm"
                  class="w-[60px]"
                  @update:model-value="handlePerPageChange(Number($event))"
                />
                <span class="text-[12px] text-muted-foreground whitespace-nowrap font-medium">{{
                  t('common.entries_per_page')
                }}</span>
              </div>
              <div v-if="totalPages > 1" class="flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="none"
                  size="none"
                  class="flex items-center justify-center px-[12.6px] py-[6.3px] border border-border rounded-[8.4px] text-foreground/70 transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-[14.7px] font-bold gap-1"
                  :disabled="localPage === 1"
                  @click="handlePageChange(localPage - 1)"
                >
                  {{ t('common.previous', 'Previous') }}
                </Button>
                <div class="flex items-center gap-1 mx-0 sm:mx-2 flex-wrap justify-center">
                  <template v-for="p in totalPages" :key="p">
                    <Button
                      v-if="
                        p === 1 || p === totalPages || (p >= localPage - 1 && p <= localPage + 1)
                      "
                      variant="none"
                      size="none"
                      class="w-8 h-8 flex items-center justify-center rounded-md text-[14px] transition-colors"
                      :class="
                        localPage === p
                          ? 'bg-seen-blue-3050 text-white font-bold shadow-sm'
                          : 'text-muted-foreground hover:bg-muted font-semibold'
                      "
                      @click="handlePageChange(p)"
                    >
                      {{ p }}
                    </Button>
                    <span
                      v-else-if="p === localPage - 2 || p === localPage + 2"
                      class="text-muted-foreground leading-none"
                    >...</span>
                  </template>
                </div>
                <Button
                  variant="none"
                  size="none"
                  class="flex items-center justify-center px-[12.6px] py-[6.3px] border border-border rounded-[8.4px] text-foreground/70 transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-[14.7px] font-bold gap-1"
                  :disabled="localPage === totalPages"
                  @click="handlePageChange(localPage + 1)"
                >
                  {{ t('common.next', 'Next') }}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </template>
      <!-- Default variant: original structure -->
      <template v-else>
        <div
          class="neop-table-container !rounded-none !border-none !border-b !border-border"
          :class="{ 'separated-records-wrapper': props.separatedRecords }"
        >
          <div class="overflow-visible">
            <Table class="neop-table">
              <TableHeader>
                <slot
                  name="header"
                  :columns="actualColumns"
                  :select-all="selectAll"
                  :toggle-select-all="(val: boolean) => (selectAll = val)"
                >
                  <DataTableHeader
                    :columns="actualColumns"
                    :drag-and-drop="props.dragAndDrop"
                    :table-enhancements="props.tableEnhancements"
                    :select-all="selectAll"
                    :sort-column="sortColumn"
                    :sort-direction="sortDirection"
                    :has-actions="!!$slots.actions"
                    @update:select-all="selectAll = $event"
                    @sort="toggleSort"
                  >
                    <template
                      v-for="col in actualColumns"
                      :key="`head-${col.key}`"
                      #[`head-${col.key}`]="slotProps"
                    >
                      <slot :name="`head-${col.key}`" v-bind="slotProps" />
                    </template>
                  </DataTableHeader>
                </slot>
              </TableHeader>
              <!-- "Select all records" banner (default variant) -->
              <TableBody v-if="showSelectAllBanner" class="border-none">
                <TableRow class="hover:bg-transparent border-none">
                  <TableCell
                    :colspan="
                      actualColumns.length
                        + ($slots.actions ? 1 : 0)
                        + (props.tableEnhancements?.rowSelection ? 1 : 0)
                        + (props.dragAndDrop?.enabled ? 1 : 0)
                    "
                    class="!p-0 border-none"
                  >
                    <div
                      class="flex items-center justify-center gap-2 py-2.5 px-4 bg-primary/5 dark:bg-primary/10 text-sm text-center"
                    >
                      <template v-if="allRecordsSelected">
                        <span class="text-foreground/70">
                          {{
                            t(
                              'common.all_records_selected',
                              `All ${allFilteredIds.length} records are selected.`,
                            )
                          }}
                        </span>
                        <Button
                          variant="none"
                          size="none"
                          class="text-primary font-semibold hover:underline"
                          @click="clearAllSelection"
                        >
                          {{ t('common.clear_selection', 'Clear selection') }}
                        </Button>
                      </template>
                      <template v-else>
                        <span class="text-foreground/70">
                          {{
                            t(
                              'common.page_selected',
                              `All ${paginatedData.length} items on this page are selected.`,
                            )
                          }}
                        </span>
                        <Button
                          variant="none"
                          size="none"
                          class="text-primary font-semibold hover:underline"
                          @click="selectAllRecordsAction"
                        >
                          {{
                            t(
                              'common.select_all_records',
                              `Select all ${allFilteredIds.length} records`,
                            )
                          }}
                        </Button>
                      </template>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
              <TableBody
                class="bg-transparent border-none"
                @contextmenu="handleTableContextMenu"
                :class="{ 'separated-records-body': props.separatedRecords }"
              >
                <template v-if="loading">
                  <TableRow
                    v-for="i in localPerPage || 5"
                    :key="`skeleton-${i}`"
                    class="animate-pulse pointer-events-none"
                    :class="[
                      props.separatedRecords
                        ? 'separated-record-row border border-border !bg-card'
                        : 'bg-card border-none hover:bg-card',
                    ]"
                    :style="{ animationDelay: `${(i - 1) * 75}ms` }"
                  >
                    <TableCell v-if="props.dragAndDrop?.enabled" class="px-2 py-3 w-10">
                      <div
                        class="h-5 w-5 bg-muted/70 dark:bg-slate-700/60 rounded-[4px] skeleton-shimmer mx-auto"
                      />
                    </TableCell>
                    <TableCell
                      v-if="props.tableEnhancements?.rowSelection"
                      class="px-2 py-3 text-center w-12"
                    >
                      <div
                        class="h-4 w-4 bg-muted/70 dark:bg-slate-700/60 rounded-[4px] skeleton-shimmer mx-auto"
                      />
                    </TableCell>
                    <template v-if="actualColumns.length > 0">
                      <TableCell
                        v-for="(col, colIdx) in actualColumns"
                        :key="`sk-col-${col.key}`"
                        class="px-3 py-3"
                      >
                        <div
                          class="h-3.5 bg-muted/70 dark:bg-slate-700/60 rounded-full mx-auto skeleton-shimmer"
                          :class="[
                            colIdx === 0
                              ? 'w-1/2'
                              : colIdx === actualColumns.length - 1
                                ? 'w-8 h-8 rounded-full'
                                : 'w-3/4',
                          ]"
                        />
                      </TableCell>
                    </template>
                    <template v-else>
                      <TableCell v-for="j in 3" :key="`sk-gen-${j}`" class="px-3 py-3">
                        <div
                          class="h-3.5 bg-muted/70 dark:bg-slate-700/60 rounded-full w-3/4 mx-auto skeleton-shimmer"
                        />
                      </TableCell>
                    </template>
                    <TableCell v-if="$slots.actions" class="px-3 py-3">
                      <div
                        class="h-8 w-8 bg-muted/70 dark:bg-slate-700/60 rounded-full mx-auto skeleton-shimmer"
                      />
                    </TableCell>
                  </TableRow>
                </template>
                <template v-else>
                  <template
                    v-for="(row, index) in paginatedData"
                    :key="row.id ? String(row.id) : index"
                  >
                    <slot
                      name="row"
                      :row="row"
                      :index="index"
                      :columns="actualColumns"
                      :is-selected="
                        props.selectAllMode
                          ? !localExcluded.includes(String(row.id))
                          : allRecordsSelected || localSelected.includes(String(row.id))
                      "
                      :toggle-selection="() => toggleSelection(String(row.id))"
                    >
                      <DataTableRow
                        :row="row"
                        :index="index"
                        :columns="actualColumns"
                        :drag-and-drop="props.dragAndDrop"
                        :table-enhancements="props.tableEnhancements"
                        :is-selected="
                          props.selectAllMode
                            ? !localExcluded.includes(String(row.id))
                            : allRecordsSelected || localSelected.includes(String(row.id))
                        "
                        :is-dragged="draggedRowIdx === index"
                        :drag-over-state="
                          dragOverRowIdx === index && draggedRowIdx !== null
                            ? draggedRowIdx > index
                              ? 'top'
                              : 'bottom'
                            : null
                        "
                        :editing-cell-key="
                          editingCell && editingCell.rowId === String(row.id)
                            ? editingCell.colKey
                            : null
                        "
                        :edit-value="editValue"
                        :has-actions="!!$slots.actions"
                        :class="[
                          props.separatedRecords ? 'separated-record-row border border-border' : '',
                          {
                            'alternating-even': props.alternatingColors && index % 2 === 0,
                            'alternating-odd': props.alternatingColors && index % 2 !== 0,
                          },
                        ]"
                        @toggle-selection="toggleSelection(String(row.id))"
                        @dragstart="handleDragStart($event, index)"
                        @dragover="handleDragOver($event, index)"
                        @dragleave="handleDragLeave($event, index)"
                        @dragend="handleDragEnd($event)"
                        @drop="handleDrop($event, index)"
                        @start-edit="startInlineEdit"
                        @commit-edit="commitInlineEdit"
                        @cancel-edit="cancelInlineEdit"
                        @update:edit-value="editValue = $event"
                      >
                        <template
                          v-for="col in actualColumns"
                          :key="col.key"
                          #[col.key]="slotProps"
                        >
                          <slot :name="col.key" v-bind="slotProps" />
                        </template>
                        <template v-if="$slots.actions" #actions="slotProps">
                          <slot name="actions" v-bind="slotProps" />
                        </template>
                      </DataTableRow>
                    </slot>
                  </template>
                  <!-- Empty State -->
                  <TableRow
                    v-if="paginatedData.length === 0"
                    class="dt-empty-row bg-card hover:bg-card"
                  >
                    <TableCell
                      :colspan="
                        Math.max(actualColumns.length, 3)
                          + ($slots.actions ? 1 : 0)
                          + (props.tableEnhancements?.rowSelection ? 1 : 0)
                          + (props.dragAndDrop?.enabled ? 1 : 0)
                      "
                      class="!p-0 border-none"
                    >
                      <slot name="empty">
                        <div class="dt-empty-state">
                          <template v-if="hasSearchOrFilters">
                            <div class="dt-empty-state__icon dt-empty-state__icon--search">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              >
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                              </svg>
                            </div>
                            <p class="dt-empty-state__title">
                              {{ t('common.empty_state.no_results_title', 'No results found') }}
                            </p>
                            <p class="dt-empty-state__desc">
                              {{
                                t(
                                  'common.empty_state.no_results_desc',
                                  'Try adjusting your filters or search term.',
                                )
                              }}
                            </p>
                            <Button
                              variant="none"
                              size="none"
                              class="dt-empty-state__action dt-empty-state__action--outline"
                              @click="handleClearFilters"
                            >
                              {{ t('common.empty_state.clear_filters', 'Clear filters') }}
                            </Button>
                          </template>
                          <template v-else>
                            <div class="dt-empty-state__illustration">
                              <slot name="empty-icon">
                                <EmptyBoxIcon />
                              </slot>
                            </div>
                            <p class="dt-empty-state__title">
                              {{ emptyTitle || t('common.empty_state.title', 'No data yet') }}
                            </p>
                            <p class="dt-empty-state__desc">
                              {{
                                emptyDescription
                                  || t(
                                    'common.empty_state.description',
                                    'Once items are created, they will appear here.',
                                  )
                              }}
                            </p>
                            <Button
                              v-if="emptyActionLabel || $slots['empty-action']"
                              variant="none"
                              size="none"
                              class="dt-empty-state__action dt-empty-state__action--primary"
                              @click="emit('emptyAction')"
                            >
                              <slot name="empty-action">
                                <svg
                                  class="dt-empty-state__action-icon"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                >
                                  <path d="M12 5v14M5 12h14" />
                                </svg>
                                {{ emptyActionLabel }}
                              </slot>
                            </Button>
                          </template>
                        </div>
                      </slot>
                    </TableCell>
                  </TableRow>
                </template>
              </TableBody>
            </Table>
          </div>
        </div>
        <!-- Footer Pagination -->
        <div
          v-if="totalEntries > 0"
          class="flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6 py-[16px] bg-card mt-auto border-t-0"
        >
          <span
            class="text-[11.6px] font-bold text-muted-foreground tracking-[1.16px] text-center md:text-start w-full md:w-auto"
          >
            {{
              t('common.showing_info', {
                start: showingStart,
                end: showingEnd,
                total: totalEntries,
              })
            }}
          </span>
          <div
            class="flex flex-col sm:flex-row items-center justify-center md:justify-end gap-4 sm:gap-6 w-full md:w-auto"
          >
            <div class="flex items-center gap-2">
              <SelectField
                :model-value="localPerPage"
                :options="perPageOptions"
                variant="default"
                size="sm"
                class="w-[60px]"
                @update:model-value="handlePerPageChange(Number($event))"
              />
              <span class="text-[12px] text-muted-foreground whitespace-nowrap font-medium">{{
                t('common.entries_per_page')
              }}</span>
            </div>
            <div v-if="totalPages > 1" class="flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="none"
                size="none"
                class="flex items-center justify-center px-[12.6px] py-[6.3px] border border-border rounded-[8.4px] text-foreground/70 transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-[14.7px] font-bold gap-1"
                :disabled="localPage === 1"
                @click="handlePageChange(localPage - 1)"
              >
                {{ t('common.previous', 'Previous') }}
              </Button>
              <div class="flex items-center gap-1 mx-0 sm:mx-2 flex-wrap justify-center">
                <template v-for="p in totalPages" :key="p">
                  <Button
                    v-if="p === 1 || p === totalPages || (p >= localPage - 1 && p <= localPage + 1)"
                    variant="none"
                    size="none"
                    class="w-8 h-8 flex items-center justify-center rounded-md text-[14px] transition-colors"
                    :class="
                      localPage === p
                        ? 'bg-seen-blue-3050 text-white font-bold shadow-sm'
                        : 'text-muted-foreground hover:bg-muted font-semibold'
                    "
                    @click="handlePageChange(p)"
                  >
                    {{ p }}
                  </Button>
                  <span
                    v-else-if="p === localPage - 2 || p === localPage + 2"
                    class="text-muted-foreground leading-none"
                  >...</span>
                </template>
              </div>
              <Button
                variant="none"
                size="none"
                class="flex items-center justify-center px-[12.6px] py-[6.3px] border border-border rounded-[8.4px] text-foreground/70 transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-[14.7px] font-bold gap-1"
                :disabled="localPage === totalPages"
                @click="handlePageChange(localPage + 1)"
              >
                {{ t('common.next', 'Next') }}
              </Button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Figma Global Overrides for Table Styling (Header & Standard Rows) */
.neop-table-container :deep(table) {
  border-collapse: collapse;
}
.neop-table-container :deep(thead tr) {
  height: 50.81px !important;
  border-bottom: 1.05px solid #e2e8f0 !important;
}
.neop-table-container :deep(thead th) {
  padding: 16.8px 16.8px 16.8px 24px !important;
  font-weight: 700 !important;
  font-size: 12px !important;
  line-height: 16px !important;
  color: #002152 !important;
  text-transform: capitalize !important;
  text-align: center !important;
}
.dark .neop-table-container :deep(thead th) {
  color: #ffffff !important;
}
.neop-table-container :deep(tbody tr:not(.separated-record-row):not(.dt-empty-row)) {
  height: 81.22px !important;
  border-bottom: 1px solid #f0f4f9 !important;
}
.neop-table-container :deep(tbody tr:not(.separated-record-row):not(.dt-empty-row) td) {
  padding: 30px 16.8px !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  line-height: 21px !important;
  color: #4d5c71 !important;
}
.neop-table-container :deep(tbody tr:not(.separated-record-row):not(.dt-empty-row) td:first-child) {
  padding-left: 24px !important;
}
/* Alternating row colors */
.alternating-even {
  background-color: var(--color-muted, #f1f5f9);
}
.alternating-odd {
  background-color: transparent;
}
/* ===== Separated Records: override table display to flex ===== */
.separated-records-wrapper {
  overflow-x: auto;
}
.separated-records-wrapper :deep(table) {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 900px;
}
.separated-records-wrapper :deep(thead) {
  display: flex;
  width: 100%;
  padding: 0 32px;
  box-sizing: border-box;
}
.separated-records-wrapper :deep(thead tr) {
  display: flex;
  align-items: center;
  width: 100%;
  border: none !important;
  border-bottom: 1px solid transparent !important;
  border-bottom-color: transparent !important;
  padding: 15px 18px 8px 18px !important;
  margin-bottom: 0 !important;
}
.separated-records-wrapper :deep(thead th) {
  flex: 1;
  text-align: center;
  min-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-bottom: none !important;
  padding: 0 !important;
}
/* Fixed-width header cells */
.separated-records-wrapper :deep(thead th.w-10) {
  flex: 0 0 40px;
  max-width: 40px;
  min-width: 40px;
}
.separated-records-wrapper :deep(thead th.w-12) {
  flex: 0 0 48px;
  max-width: 48px;
  min-width: 48px;
}
.separated-records-wrapper :deep(tbody) {
  display: flex;
  flex-direction: column;
  gap: 12px !important;
  padding: 0 32px 16px 32px !important;
  width: 100%;
  box-sizing: border-box;
}
/* Banner layout overrides */
.separated-records-wrapper :deep(tbody.dt-banner-body) {
  padding: 0 32px 0 32px !important;
  gap: 0 !important;
}
.separated-records-wrapper :deep(.dt-banner-row) {
  display: flex !important;
  width: 100% !important;
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
}
.separated-records-wrapper :deep(.dt-banner-row td) {
  flex: 1 !important;
  max-width: 100% !important;
  min-width: 0 !important;
  padding: 0 !important;
}
.separated-records-wrapper :deep(.separated-record-row) {
  display: flex;
  align-items: center;
  width: 100%;
  border-radius: 154px !important;
  padding: 15px 18px !important;
  background-color: var(--color-card, #fff);
  border: 0.77px solid #e2e8f0;
  box-sizing: border-box;
}
.dark .separated-records-wrapper :deep(.separated-record-row) {
  background-color: rgba(255, 255, 255, 0.03); /* subtle light overlay on dark bg */
  border-color: transparent !important;
}
.separated-records-wrapper :deep(.separated-record-row:hover) {
  background-color: var(--color-muted, #f8fafc);
}
.dark .separated-records-wrapper :deep(.separated-record-row:hover) {
  background-color: #1e293b; /* slate-800 */
}
.separated-records-wrapper :deep(.separated-record-row td) {
  flex: 1;
  border: none;
  min-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 !important;
}
/* Fixed-width body cells */
.separated-records-wrapper :deep(.separated-record-row td.w-10) {
  flex: 0 0 40px;
  max-width: 40px;
  min-width: 40px;
}
.separated-records-wrapper :deep(.separated-record-row td.w-12) {
  flex: 0 0 48px;
  max-width: 48px;
  min-width: 48px;
}
/* Alternating colors combined with separated records */
.separated-records-wrapper :deep(.separated-record-row.alternating-even) {
  background-color: #f1f5f9;
}
.dark .separated-records-wrapper :deep(.separated-record-row.alternating-even) {
  background-color: rgba(30, 41, 59, 0.5); /* slate-800/50 */
}
.separated-records-wrapper :deep(.separated-record-row.alternating-odd) {
  background-color: #ffffff;
}
.dark .separated-records-wrapper :deep(.separated-record-row.alternating-odd) {
  background-color: #0f172a; /* slate-900 */
}
/* Modern Popover Filters — remove inner borders/margins, fit inside rounded popup */
.modern-popover-filters :deep(.data-table-filters) {
  margin: 0;
}
.modern-popover-filters :deep(.data-table-filters > div:first-child) {
  display: none; /* Hide the toggle bar since popover handles open/close */
}
.modern-popover-filters :deep(.data-table-filters > .filter-expand-enter-to),
.modern-popover-filters :deep(.data-table-filters > div:last-child) {
  border: none !important;
  border-radius: 0 !important;
  margin: 0 !important;
  background: transparent !important;
}
/* Skeleton shimmer animation */
.skeleton-shimmer {
  position: relative;
  overflow: hidden;
}
.skeleton-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.25) 50%,
    transparent 100%
  );
  animation: shimmer 1.8s ease-in-out infinite;
}
.dark .skeleton-shimmer::after {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.06) 50%,
    transparent 100%
  );
}
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
/* ===== Empty State ===== */
/* In separated-records mode, tbody is display:flex — we need the empty row to span full width */
.separated-records-wrapper :deep(.dt-empty-row) {
  display: flex !important;
  width: 100% !important;
  border: none !important;
  border-radius: 0 !important;
  padding: 0 !important;
  background: transparent !important;
}
.separated-records-wrapper :deep(.dt-empty-row td) {
  flex: 1 !important;
  max-width: 100% !important;
  min-width: 0 !important;
  overflow: visible !important;
  white-space: normal !important;
  padding: 0 !important;
}
.dt-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 8px;
  animation: emptyFadeIn 0.35s ease-out both;
}
.dt-empty-state__illustration {
  width: 240px;
  max-width: 100%;
  margin-bottom: 4px;
}
.dt-empty-state__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  margin-bottom: 8px;
}
.dt-empty-state__icon svg {
  width: 24px;
  height: 24px;
}
.dt-empty-state__icon--search {
  background: var(--color-muted, #f1f5f9);
  border: 1px solid var(--color-border, #e2e8f0);
  color: var(--color-muted-foreground, #64748b);
}
.dt-empty-state__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-foreground, #0f172a) !important;
  margin: 0;
  line-height: 1.4;
}
.dt-empty-state__desc {
  font-size: 13px;
  font-weight: 400;
  color: var(--color-muted-foreground, #64748b) !important;
  margin: 0;
  line-height: 1.5;
  text-align: center;
  max-width: 340px;
}
.dt-empty-state__action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 18px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  line-height: 1;
}
.dt-empty-state__action--primary {
  background: var(--color-primary, #6366f1);
  color: var(--color-primary-foreground, #ffffff);
  border: 1px solid transparent;
}
.dt-empty-state__action--primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}
.dt-empty-state__action--outline {
  background: transparent;
  color: var(--color-foreground, #0f172a);
  border: 1px solid var(--color-border, #e2e8f0);
}
.dt-empty-state__action--outline:hover {
  background: var(--color-muted, #f1f5f9);
}
.dt-empty-state__action-icon {
  width: 14px;
  height: 14px;
}
@keyframes emptyFadeIn {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

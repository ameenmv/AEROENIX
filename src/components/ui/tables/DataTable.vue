<script setup lang="ts">
import type { ContextMenuAction } from '@/composables/useContextMenu'
import { ArrowLeft01Icon, ArrowRight01Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useDebounceFn } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button as Btn } from '@/components/uic/button'
import { Input } from '@/components/uic/input'
import SelectField from '@/components/uic/select/SelectField.vue'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/uic/table'
import { useContextMenu } from '@/composables/useContextMenu'
import DataTableHeader from './DataTableHeader.vue'
import DataTableRow from './DataTableRow.vue'

export type { ContextMenuAction }

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
  serverSide?: boolean
  loading?: boolean
  totalItems?: number
  page?: number
  perPage?: number
  selected?: (string | number)[]
  visibleColumns?: string[]
  tableEnhancements?: any
  dragAndDrop?: any
  /** Right-click context menu actions. Each action's onClick receives the row as the first argument. */
  contextMenuActions?: ContextMenuAction[]
}>()
const emit = defineEmits<{
  (e: 'update:page', page: number): void
  (e: 'update:perPage', perPage: number): void
  (e: 'update:search', query: string): void
  (e: 'search', query: string): void
  (e: 'update:filters', filters: Record<string, unknown>): void
  (e: 'filter', filters: Record<string, unknown>): void
  (e: 'update:selected', selected: (string | number)[]): void
  (e: 'selectionChange', selected: (string | number)[]): void
  (e: 'reorder', newOrder: any[]): void
  (e: 'inlineEdit', row: any, key: string, value: any): void
  (e: 'sort', column: string, direction: 'asc' | 'desc'): void
}>()
const { t } = useI18n()

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
}, 300)
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
const selectAll = computed({
  get: () =>
    localSelected.value.length > 0
    && paginatedData.value.length > 0
    && localSelected.value.length === paginatedData.value.length,
  set: (val: boolean) => {
    if (val) {
      localSelected.value = paginatedData.value.map(r => String(r.id || ''))
    }
    else {
      localSelected.value = []
    }
    emit('update:selected', [...localSelected.value])
    emit('selectionChange', [...localSelected.value])
  },
})
function toggleSelection(id: string | number) {
  const idx = localSelected.value.indexOf(id)
  if (idx > -1) {
    localSelected.value = localSelected.value.filter((_, i) => i !== idx)
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
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-1">
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
          v-if="searchable"
          class="relative flex items-center flex-1 sm:w-[200px] sm:flex-none h-8"
        >
          <div class="absolute left-2.5 flex items-center justify-center pointer-events-none">
            <HugeiconsIcon
              :icon="Search01Icon"
              :size="14"
              :stroke-width="2"
              class="text-muted-foreground"
            />
          </div>
          <Input
            v-model="localSearchQuery"
            type="text"
            :placeholder="t('common.search')"
            class="h-8 w-full pl-8 pr-3 text-xs bg-background border border-border rounded-md focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
    <div class="neop-table-container">
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
          <TableBody class="bg-transparent border-none" @contextmenu="handleTableContextMenu">
            <template v-if="loading">
              <TableRow
                v-for="i in localPerPage || 5"
                :key="`skeleton-${i}`"
                class="animate-pulse bg-card border-none pointer-events-none hover:bg-card"
              >
                <TableCell v-if="props.dragAndDrop?.enabled" class="px-3 py-3" />
                <TableCell v-if="props.tableEnhancements?.rowSelection" class="px-3 py-3" />
                <template v-if="actualColumns.length > 0">
                  <TableCell
                    v-for="col in actualColumns"
                    :key="`sk-col-${col.key}`"
                    class="px-3 py-3"
                  >
                    <div class="h-4 bg-muted rounded w-3/4 mx-auto" />
                  </TableCell>
                </template>
                <template v-else>
                  <TableCell v-for="j in 3" :key="`sk-gen-${j}`" class="px-3 py-3">
                    <div class="h-4 bg-muted rounded w-3/4 mx-auto" />
                  </TableCell>
                </template>
                <TableCell v-if="$slots.actions" class="px-3 py-3">
                  <div class="h-8 w-8 bg-muted rounded-full mx-auto" />
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
                    :is-selected="localSelected.includes(String(row.id))"
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
                    <template v-for="col in actualColumns" :key="col.key" #[col.key]="slotProps">
                      <slot :name="col.key" v-bind="slotProps" />
                    </template>
                    <template v-if="$slots.actions" #actions="slotProps">
                      <slot name="actions" v-bind="slotProps" />
                    </template>
                  </DataTableRow>
                </slot>
              </template>
              <TableRow v-if="paginatedData.length === 0" class="bg-card">
                <TableCell
                  :colspan="
                    Math.max(actualColumns.length, 3)
                      + ($slots.actions ? 1 : 0)
                      + (props.tableEnhancements?.rowSelection ? 1 : 0)
                      + (props.dragAndDrop?.enabled ? 1 : 0)
                  "
                  class="px-3 py-8 text-center text-muted-foreground italic font-light border-none"
                >
                  {{ t('common.no_data_available') }}
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>
    </div>
    <div class="flex flex-col sm:flex-row items-center justify-between gap-2 px-1 py-3">
      <span class="text-[11px] text-muted-foreground">
        {{
          t('common.showing_info', { start: showingStart, end: showingEnd, total: totalEntries })
        }}
      </span>
      <div class="flex items-center gap-1">
        <Btn
          variant="outline"
          size="sm"
          class="flex items-center gap-1 h-7 px-2 text-xs"
          :disabled="localPage === 1"
          @click="handlePageChange(localPage - 1)"
        >
          <HugeiconsIcon :icon="ArrowLeft01Icon" :size="12" class="rtl:scale-x-[-1]" />
          <span class="hidden sm:inline">{{ t('common.previous') }}</span>
        </Btn>
        <div class="flex items-center gap-0.5">
          <Btn
            v-for="p in totalPages"
            :key="p"
            :variant="localPage === p ? 'default' : 'ghost'"
            size="icon"
            class="w-7! h-7! rounded-md! text-xs! font-medium!"
            :class="[localPage === p ? 'shadow' : '']"
            @click="handlePageChange(p)"
          >
            {{ p }}
          </Btn>
        </div>
        <Btn
          variant="outline"
          size="sm"
          class="flex items-center gap-1 h-7 px-2 text-xs"
          :disabled="localPage === totalPages"
          @click="handlePageChange(localPage + 1)"
        >
          <span class="hidden sm:inline">{{ t('common.next') }}</span>
          <HugeiconsIcon :icon="ArrowRight01Icon" :size="12" class="rtl:scale-x-[-1]" />
        </Btn>
      </div>
    </div>
  </div>
</template>

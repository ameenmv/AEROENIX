<script setup lang="ts">
import { DragDropVerticalIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import CheckboxField from '@/components/uic/inputs/CheckboxField.vue'
import { TableCell, TableRow } from '@/components/uic/table'

export interface ContextMenuAction {
  label: string
  icon?: string | object
  onClick?: (row?: Record<string, unknown>) => void | Promise<any>
  variant?: 'default' | 'delete'
  separator?: boolean
}

const props = defineProps<{
  row: any
  index: number
  columns: any[]
  dragAndDrop?: any
  tableEnhancements?: any
  isSelected: boolean
  isDragged: boolean
  dragOverState: 'top' | 'bottom' | null
  editingCellKey: string | null
  editValue: any
  hasActions: boolean
}>()

const emit = defineEmits<{
  (e: 'toggleSelection'): void
  (e: 'dragstart', event: DragEvent, index: number): void
  (e: 'dragover', event: DragEvent, index: number): void
  (e: 'dragleave', event: DragEvent, index: number): void
  (e: 'dragend', event: DragEvent): void
  (e: 'drop', event: DragEvent, index: number): void
  (e: 'startEdit', row: any, colKey: string, val: any, isEditable: boolean): void
  (e: 'commitEdit', row: any, colKey: string): void
  (e: 'cancelEdit'): void
  (e: 'update:editValue', val: any): void
}>()

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  if (!path)
    return ''
  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj as unknown)
}
</script>

<template>
  <TableRow
    class="bg-card transition-colors relative border-none hover:bg-muted/50 text-foreground text-sm"
    :class="{
      'bg-muted/80 font-medium': props.isSelected,
      'opacity-50': props.isDragged,
      'border-t-2 border-primary': props.dragOverState === 'top',
      'border-b-2 border-primary': props.dragOverState === 'bottom',
    }"
    :draggable="props.dragAndDrop?.enabled"
    @dragstart="emit('dragstart', $event, props.index)"
    @dragover="emit('dragover', $event, props.index)"
    @dragleave="emit('dragleave', $event, props.index)"
    @dragend="emit('dragend', $event)"
    @drop="emit('drop', $event, props.index)"
  >
    <TableCell
      v-if="props.dragAndDrop?.enabled"
      class="px-2 py-3 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground w-10 first:rounded-l-lg last:rounded-r-lg"
    >
      <HugeiconsIcon :icon="DragDropVerticalIcon" :size="20" />
    </TableCell>
    <TableCell
      v-if="props.tableEnhancements?.rowSelection"
      class="px-2 py-3 text-center w-12 flex justify-center align-middle h-full pt-[6%] first:rounded-l-lg last:rounded-r-lg"
    >
      <CheckboxField
        :model-value="props.isSelected"
        variant="table"
        @update:model-value="emit('toggleSelection')"
      />
    </TableCell>
    <TableCell
      v-for="col in props.columns"
      :key="col.key"
      class="px-4 py-4 align-middle first:rounded-l-lg last:rounded-r-lg"
      :class="col.className || 'text-left'"
      @dblclick="
        emit('startEdit', props.row, col.key, getNestedValue(props.row, col.key), !!col.editable)
      "
    >
      <template v-if="props.editingCellKey === col.key">
        <input
          :value="props.editValue"
          class="w-full bg-background border border-input rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-color-success"
          autoFocus
          @input="emit('update:editValue', ($event.target as HTMLInputElement).value)"
          @blur="emit('commitEdit', props.row, col.key)"
          @keyup.enter="emit('commitEdit', props.row, col.key)"
          @keyup.escape="emit('cancelEdit')"
        >
      </template>
      <template v-else>
        <slot :name="col.key" :row="props.row" :value="getNestedValue(props.row, col.key)">
          <template v-if="col.formatter">
            <span v-html="col.formatter(getNestedValue(props.row, col.key), props.row)" />
          </template>
          <template v-else>
            {{ getNestedValue(props.row, col.key) }}
          </template>
        </slot>
      </template>
    </TableCell>
    <TableCell v-if="props.hasActions" class="first:rounded-l-lg last:rounded-r-lg">
      <div class="flex items-center justify-center">
        <slot name="actions" :row="props.row" />
      </div>
    </TableCell>
  </TableRow>
</template>

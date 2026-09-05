<script setup lang="ts">
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import CheckboxField from '@/components/uic/inputs/CheckboxField.vue'
import { TableHead, TableRow } from '@/components/uic/table'

const props = defineProps<{
  columns: any[]
  dragAndDrop?: any
  tableEnhancements?: any
  selectAll: boolean
  sortColumn: string
  sortDirection: string
  hasActions: boolean
}>()
const emit = defineEmits<{
  (e: 'update:selectAll', val: boolean): void
  (e: 'sort', colKey: string, isSortable: boolean): void
}>()
const { t } = useI18n()
function toggleSort(colKey: string, isSortable: boolean) {
  emit('sort', colKey, isSortable)
}
</script>

<template>
  <TableRow class="border-none hover:bg-transparent bg-muted/30">
    <TableHead
      v-if="props.dragAndDrop?.enabled"
      class="w-10 first:rounded-l-lg last:rounded-r-lg"
    />
    <TableHead
      v-if="props.tableEnhancements?.rowSelection"
      class="w-12 text-center align-middle border-none first:rounded-l-lg last:rounded-r-lg"
    >
      <CheckboxField
        :model-value="props.selectAll"
        variant="table"
        @update:model-value="emit('update:selectAll', $event)"
      />
    </TableHead>
    <TableHead
      v-for="col in props.columns"
      :key="col.key"
      class="px-4 py-3 font-medium text-muted-foreground/70 border-none text-[11px] uppercase tracking-widest align-middle first:rounded-l-lg last:rounded-r-lg"
      :class="col.className || 'text-left'"
    >
      <slot :name="`head-${col.key}`" :col="col">
        <div
          class="flex items-center gap-2"
          :class="[
            col.sortable ? 'cursor-pointer select-none' : '',
            (col.className || '').includes('text-center') ? 'justify-center' :
            (col.className || '').includes('text-right') ? 'justify-end' : 'justify-start'
          ]"
          @click="toggleSort(col.key, !!col.sortable)"
        >
          {{ col.label.includes('.') ? t(col.label, col.label) : col.label }}
          <div v-if="col.sortable" class="flex flex-col opacity-40">
            <HugeiconsIcon
              :icon="ArrowUp01Icon"
              :size="10"
              :class="{
                'opacity-100 text-primary':
                  props.sortColumn === col.key && props.sortDirection === 'asc',
              }"
            />
            <HugeiconsIcon
              :icon="ArrowDown01Icon"
              :size="10"
              class="-mt-1"
              :class="{
                'opacity-100 text-primary':
                  props.sortColumn === col.key && props.sortDirection === 'desc',
              }"
            />
          </div>
        </div>
      </slot>
    </TableHead>
    <TableHead
      v-if="props.hasActions"
      class="border-none text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 px-4 py-3 align-middle text-center first:rounded-l-lg last:rounded-r-lg"
    >
      {{ t('common.actions') }}
    </TableHead>
  </TableRow>
</template>

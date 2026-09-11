<script setup lang="ts">
import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

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
  <TableRow class="hover:bg-transparent">
    <TableHead v-if="props.dragAndDrop?.enabled" class="w-10" />
    <TableHead
      v-if="props.tableEnhancements?.rowSelection"
      class="w-12 text-center align-middle border-none pointer-events-auto"
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
      class="text-center px-3 py-2 font-semibold text-muted-foreground border-none text-[11px] uppercase tracking-wider align-middle mx-auto"
      :class="col.className"
    >
      <slot :name="`head-${col.key}`" :col="col">
        <div
          class="flex items-center justify-center gap-2"
          :class="[col.sortable ? 'cursor-pointer select-none pointer-events-auto' : '']"
          @click="toggleSort(col.key, !!col.sortable)"
        >
          {{ col.label.includes('.') ? t(col.label, col.label) : col.label }}
          <div v-if="col.sortable" class="flex flex-col opacity-50">
            <HugeiconsIcon
              :icon="ArrowUp01Icon"
              :size="10"
              :class="{
                'opacity-100 text-success':
                  props.sortColumn === col.key && props.sortDirection === 'asc',
              }"
            />
            <HugeiconsIcon
              :icon="ArrowDown01Icon"
              :size="10"
              class="-mt-1"
              :class="{
                'opacity-100 text-success':
                  props.sortColumn === col.key && props.sortDirection === 'desc',
              }"
            />
          </div>
        </div>
      </slot>
    </TableHead>
    <TableHead
      v-if="props.hasActions"
      class="border-none text-[11px] uppercase tracking-wider font-semibold text-muted-foreground px-3 py-2 align-middle text-center w-[70px] flex-none"
    >
      {{ t('common.actions') }}
    </TableHead>
  </TableRow>
</template>

<script setup lang="ts">
/**
 * DataTableToolbar — table footer/header with page-size selector + pagination info + pagination controls.
 * Combines the SAAF pattern of limit select + Pagination component seen in every List.vue.
 * Composes shadcn Select + Button.
 */
import type { HTMLAttributes } from 'vue'
import type { DataTableToolbarVariants } from './variants'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'
import { computed } from 'vue'
import { Button } from '@/components/uic/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/uic/select'
import { cn } from '@/utils/cn'
import { dataTableToolbarVariants } from './variants'

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from?: number
  to?: number
}

const props = withDefaults(
  defineProps<{
    /** Pagination metadata from API */
    pagination: PaginationMeta
    /** Available page size options */
    pageSizes?: number[]
    /** Position (top or bottom of table) */
    position?: DataTableToolbarVariants['position']
    /** Label for page size */
    pageSizeLabel?: string
    class?: HTMLAttributes['class']
  }>(),
  {
    pageSizes: () => [20, 50, 100],
    position: 'bottom',
    pageSizeLabel: 'Rows per page',
  },
)

const emit = defineEmits<{
  'paginate': [page: number]
  'update:pageSize': [size: number]
}>()

const currentPage = computed(() => props.pagination.current_page)
const lastPage = computed(() => props.pagination.last_page)
const total = computed(() => props.pagination.total)
const from = computed(
  () => props.pagination.from ?? (currentPage.value - 1) * props.pagination.per_page + 1,
)
const to = computed(
  () => props.pagination.to ?? Math.min(currentPage.value * props.pagination.per_page, total.value),
)

function goTo(page: number) {
  if (page >= 1 && page <= lastPage.value && page !== currentPage.value) {
    emit('paginate', page)
  }
}
</script>

<template>
  <div
    data-slot="data-table-toolbar"
    :class="cn(dataTableToolbarVariants({ position }), props.class)"
  >
    <!-- Page size selector -->
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <span class="hidden sm:inline">{{ pageSizeLabel }}</span>
      <Select
        :model-value="String(pagination.per_page)"
        @update:model-value="emit('update:pageSize', Number($event))"
      >
        <SelectTrigger class="h-8 w-[70px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="size in pageSizes" :key="size" :value="String(size)">
            {{ size }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Info + pagination controls -->
    <div class="flex items-center gap-4">
      <!-- Showing X–Y of Z -->
      <span class="text-sm text-muted-foreground hidden sm:inline">
        {{ $t('common.pagination_range', '{from}–{to} of {total}', { from, to, total }) }}
      </span>

      <!-- Page controls -->
      <div class="flex items-center gap-1">
        <Button variant="outline" size="icon-sm" :disabled="currentPage <= 1" @click="goTo(1)">
          <ChevronsLeft :size="14" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          :disabled="currentPage <= 1"
          @click="goTo(currentPage - 1)"
        >
          <ChevronLeft :size="14" />
        </Button>

        <span class="text-sm font-medium text-foreground px-2 tabular-nums">
          {{ currentPage }} / {{ lastPage }}
        </span>

        <Button
          variant="outline"
          size="icon-sm"
          :disabled="currentPage >= lastPage"
          @click="goTo(currentPage + 1)"
        >
          <ChevronRight :size="14" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          :disabled="currentPage >= lastPage"
          @click="goTo(lastPage)"
        >
          <ChevronsRight :size="14" />
        </Button>
      </div>
    </div>
  </div>
</template>

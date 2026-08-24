<script setup lang="ts">
/**
 * FilterBar — combines a search input with a filter toggle button.
 * The most used pattern across SAAF list pages (50+).
 * Composes shadcn Input + Button + Popover + FilterPanel.
 */
import type { HTMLAttributes } from 'vue'
import type { FilterBarVariants } from './variants'
import type { FilterConfig } from '@/components/uic/filter-panel/FilterPanel.vue'
import { Filter, Search, X } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { Badge } from '@/components/uic/badge'
import { Button } from '@/components/uic/button'
import FilterPanel from '@/components/uic/filter-panel/FilterPanel.vue'
import { Input } from '@/components/uic/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/uic/popover'
import { cn } from '@/utils/cn'
import { filterBarVariants } from './variants'

const props = withDefaults(
  defineProps<{
    /** v-model:search — search query string */
    search?: string
    /** Search input placeholder */
    searchPlaceholder?: string
    /** Filter configuration (passed to FilterPanel) */
    filters?: FilterConfig[]
    /** Current filter values (v-model:filterValues) */
    filterValues?: Record<string, unknown>
    /** Show search field */
    showSearch?: boolean
    /** Show filter button */
    showFilter?: boolean
    /** Size variant */
    size?: FilterBarVariants['size']
    /** Layout variant */
    layout?: FilterBarVariants['layout']
    class?: HTMLAttributes['class']
  }>(),
  {
    search: '',
    searchPlaceholder: 'Search...',
    filters: () => [],
    filterValues: () => ({}),
    showSearch: true,
    showFilter: true,
    size: 'default',
    layout: 'between',
  },
)

const emit = defineEmits<{
  'update:search': [value: string]
  'update:filterValues': [value: Record<string, unknown>]
  'apply': [value: Record<string, unknown>]
  'reset': []
}>()

const filterOpen = ref(false)

const activeFilterCount = computed(() => {
  return Object.values(props.filterValues).filter(
    v => v !== null && v !== undefined && v !== '',
  ).length
})

function onApply(values: Record<string, unknown>) {
  emit('update:filterValues', values)
  emit('apply', values)
  filterOpen.value = false
}

function onReset() {
  emit('reset')
}

function clearSearch() {
  emit('update:search', '')
}
</script>

<template>
  <div
    data-slot="filter-bar"
    :class="cn(filterBarVariants({ size, layout }), props.class)"
  >
    <!-- Search input -->
    <div v-if="showSearch" class="relative w-full max-w-sm">
      <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        :model-value="search"
        :placeholder="searchPlaceholder"
        class="pl-9 pr-8"
        @update:model-value="emit('update:search', $event as string)"
      />
      <button
        v-if="search"
        class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
        @click="clearSearch"
      >
        <X :size="14" />
      </button>
    </div>

    <!-- Right side: actions slot + filter -->
    <div class="flex items-center gap-2">
      <slot name="actions" />

      <!-- Filter toggle with Popover -->
      <Popover v-if="showFilter && filters.length" v-model:open="filterOpen">
        <PopoverTrigger as-child>
          <Button variant="outline" size="sm" class="gap-1.5">
            <Filter :size="14" />
            {{ $t('common.filters', 'Filters') }}
            <Badge
              v-if="activeFilterCount > 0"
              variant="default"
              class="ml-0.5 h-5 min-w-5 px-1 text-[10px] rounded-full"
            >
              {{ activeFilterCount }}
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-[320px] p-0" align="end">
          <FilterPanel
            :filters="filters"
            :model-value="filterValues"
            @apply="onApply"
            @reset="onReset"
            @close="filterOpen = false"
          />
        </PopoverContent>
      </Popover>
    </div>
  </div>
</template>

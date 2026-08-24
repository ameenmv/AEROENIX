<script setup lang="ts">
/**
 * FilterPanel — dynamic filter dropdown/sidebar with config-driven filter fields.
 * Composes shadcn Button, Input, Select, Label, Separator for consistent design.
 */
import type { HTMLAttributes } from 'vue'
import type { FilterPanelVariants } from './variants'
import { RotateCcw, X } from 'lucide-vue-next'
import { computed, reactive, ref, watch } from 'vue'
import { Button } from '@/components/uic/button'
import { Input } from '@/components/uic/input'
import { Label } from '@/components/uic/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/uic/select'
import { Separator } from '@/components/uic/separator'
import { cn } from '@/utils/cn'
import { filterPanelVariants } from './variants'

export interface FilterConfig {
  /** Unique key matching the modelValue property */
  model: string
  /** Display label */
  label: string
  /** Filter field type */
  type: 'text' | 'select' | 'date' | 'daterange'
  /** Placeholder text */
  placeholder?: string
  /** Options for select type: { label, value } */
  options?: Array<{ label: string, value: string | number }>
  /** Allow multiple selection */
  multiple?: boolean
}

const props = withDefaults(
  defineProps<{
    /** Filter configuration array */
    filters: FilterConfig[]
    /** Current filter values (v-model) */
    modelValue?: Record<string, unknown>
    /** Panel position variant */
    position?: FilterPanelVariants['position']
    /** Size variant */
    size?: FilterPanelVariants['size']
    /** Title */
    title?: string
    class?: HTMLAttributes['class']
  }>(),
  {
    modelValue: () => ({}),
    position: 'dropdown',
    size: 'default',
    title: 'Filters',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
  'apply': [value: Record<string, unknown>]
  'close': []
  'reset': []
}>()

const localFilters = reactive<Record<string, unknown>>({ ...props.modelValue })
const componentKey = ref(0)

watch(
  () => props.modelValue,
  (val) => {
    Object.assign(localFilters, val)
  },
  { deep: true },
)

watch(
  localFilters,
  val => emit('update:modelValue', { ...val }),
  { deep: true },
)

function resetAll() {
  for (const key in localFilters) {
    localFilters[key] = null
  }
  componentKey.value++
  emit('reset')
  emit('apply', { ...localFilters })
}

function resetSingle(model: string) {
  localFilters[model] = null
  componentKey.value++
}

function apply() {
  emit('apply', { ...localFilters })
}

function getDateRangeValue(model: string, index: number): string {
  const val = localFilters[model]
  if (Array.isArray(val))
    return (val[index] as string) ?? ''
  return ''
}

function setDateRangeValue(model: string, index: number, value: string) {
  if (!Array.isArray(localFilters[model])) {
    localFilters[model] = ['', '']
  }
  ;(localFilters[model] as string[])[index] = value
}

const dateRangeStart = computed(() => (model: string) => getDateRangeValue(model, 0))
const dateRangeEnd = computed(() => (model: string) => getDateRangeValue(model, 1))
</script>

<template>
  <div
    data-slot="filter-panel"
    :class="cn(filterPanelVariants({ position, size }), props.class)"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-border">
      <h6 class="text-sm font-semibold text-foreground m-0">
        {{ title }}
      </h6>
      <Button variant="ghost" size="icon-sm" @click="emit('close')">
        <X :size="16" />
      </Button>
    </div>

    <!-- Filter fields -->
    <div class="px-4 py-3 flex flex-col gap-4 max-h-[400px] overflow-y-auto">
      <div v-for="filter in filters" :key="`${filter.model}-${componentKey}`" class="space-y-1.5">
        <!-- Field header -->
        <div class="flex items-center justify-between">
          <Label class="text-xs">{{ filter.label }}</Label>
          <Button
            variant="link"
            size="sm"
            class="h-auto p-0 text-xs"
            @click="resetSingle(filter.model)"
          >
            {{ $t('common.reset') }}
          </Button>
        </div>

        <!-- Text input -->
        <Input
          v-if="filter.type === 'text'"
          :model-value="(localFilters[filter.model] as string) ?? ''"
          :placeholder="filter.placeholder || filter.label"
          @update:model-value="localFilters[filter.model] = $event"
        />

        <!-- Select (using shadcn Select) -->
        <Select
          v-else-if="filter.type === 'select'"
          :model-value="(localFilters[filter.model] as string) ?? ''"
          @update:model-value="localFilters[filter.model] = $event"
        >
          <SelectTrigger>
            <SelectValue :placeholder="filter.placeholder || filter.label" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="opt in filter.options"
              :key="opt.value"
              :value="String(opt.value)"
            >
              {{ opt.label }}
            </SelectItem>
          </SelectContent>
        </Select>

        <!-- Date -->
        <Input
          v-else-if="filter.type === 'date'"
          :model-value="(localFilters[filter.model] as string) ?? ''"
          type="date"
          :placeholder="filter.placeholder || filter.label"
          @update:model-value="localFilters[filter.model] = $event"
        />

        <!-- Date range (two inputs) -->
        <div v-else-if="filter.type === 'daterange'" class="flex gap-2">
          <Input
            :model-value="dateRangeStart(filter.model)"
            type="date"
            :placeholder="$t('common.start')"
            @update:model-value="setDateRangeValue(filter.model, 0, $event as string)"
          />
          <Input
            :model-value="dateRangeEnd(filter.model)"
            type="date"
            :placeholder="$t('common.end')"
            @update:model-value="setDateRangeValue(filter.model, 1, $event as string)"
          />
        </div>
      </div>
    </div>

    <Separator />

    <!-- Actions -->
    <div class="flex items-center justify-between gap-2 px-4 py-3">
      <Button variant="ghost" size="sm" @click="resetAll">
        <RotateCcw :size="13" class="me-1" />
        {{ $t('common.reset_all') }}
      </Button>
      <Button size="sm" @click="apply">
        {{ $t('common.apply') }}
      </Button>
    </div>
  </div>
</template>

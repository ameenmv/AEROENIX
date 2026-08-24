<script setup lang="ts">
import type { ActiveFilters, FilterField, FilterOption } from '@/types'
import { Cancel01Icon, FilterIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button as Btn } from '@/components/uic/button'
import { Checkbox } from '@/components/uic/checkbox'
import { Input } from '@/components/uic/input'
import { Label } from '@/components/uic/label'
import SelectField from '@/components/uic/select/SelectField.vue'
import { Switch } from '@/components/uic/switch'

const props = withDefaults(
  defineProps<{
    /** Filter field definitions */
    fields: FilterField[]
    /** Currently active filter values (v-model) */
    filters: ActiveFilters
    /** Layout mode: inline row or responsive grid */
    layout?: 'inline' | 'grid'
    /** Whether the filter bar can be collapsed */
    collapsible?: boolean
  }>(),
  {
    layout: 'inline',
    collapsible: true,
  },
)

const emit = defineEmits<{
  (e: 'update:filters', filters: ActiveFilters): void
}>()

const { t } = useI18n()

/** Collapsed state — starts collapsed when collapsible is true */
const collapsed = ref(props.collapsible)

// ── Local copy of filters for two-way binding ──────────────────────────
const localFilters = ref<ActiveFilters>({ ...props.filters })

watch(
  () => props.filters,
  (val) => {
    localFilters.value = { ...val }
  },
  { deep: true },
)

// ── Async options loaded from API endpoints ─────────────────────────────
const loadedOptions = ref<Record<string, FilterOption[]>>({})
const loadingFields = ref<Set<string>>(new Set())

onMounted(() => {
  props.fields.forEach((field) => {
    if (field.optionsLoader) {
      loadingFields.value.add(field.key)
      field
        .optionsLoader()
        .then((result) => {
          loadedOptions.value[field.key] = result.data
        })
        .catch((err) => {
          console.error(`[DataTableFilters] Failed to load options for "${field.key}":`, err)
        })
        .finally(() => {
          loadingFields.value.delete(field.key)
        })
    }
  })
})

// ── Helpers ─────────────────────────────────────────────────────────────
function getVal(field: FilterField) {
  return localFilters.value[field.key]
}

function setVal(field: FilterField, value: unknown) {
  if (value === null || value === undefined || value === '') {
    delete localFilters.value[field.key]
  }
  else {
    localFilters.value[field.key] = value
  }
  emit('update:filters', { ...localFilters.value })
}

function toggleMultiSelect(field: FilterField, optValue: unknown) {
  const current = getVal(field)
  if (Array.isArray(current)) {
    if (current.includes(optValue)) {
      const next = current.filter((v: unknown) => v !== optValue)
      setVal(field, next.length > 0 ? next : undefined)
    }
    else {
      setVal(field, [...current, optValue])
    }
  }
  else {
    setVal(field, [optValue])
  }
}

function isMultiSelected(field: FilterField, optValue: unknown) {
  const current = getVal(field)
  return Array.isArray(current) && current.includes(optValue)
}

function setRangeValue(field: FilterField, key: 'min' | 'max', value: unknown) {
  const current = (getVal(field) as Record<string, unknown>) || {}
  const next = { ...current, [key]: value || undefined }
  if (!next.min && !next.max) {
    setVal(field, undefined)
  }
  else {
    setVal(field, next)
  }
}

function setDateRangeValue(field: FilterField, key: 'from' | 'to', value: unknown) {
  const current = (getVal(field) as Record<string, unknown>) || {}
  const next = { ...current, [key]: value || undefined }
  if (!next.from && !next.to) {
    setVal(field, undefined)
  }
  else {
    setVal(field, next)
  }
}

function clearAll() {
  localFilters.value = {}
  emit('update:filters', {})
}

const activeCount = computed(
  () =>
    Object.values(localFilters.value).filter(v => v !== undefined && v !== '' && v !== null).length,
)

const hasActive = computed(() => activeCount.value > 0)

/** Resolve an i18n key (contains a dot) or return the raw label */
function tl(label: string): string {
  return label.includes('.') ? t(label) : label
}

/** Get options for a field — prefers async-loaded, falls back to static */
function translatedOptions(field: FilterField) {
  const opts = loadedOptions.value[field.key] || field.options || []
  return opts.map(opt => ({
    ...opt,
    label: tl(opt.label),
  }))
}
</script>

<template>
  <div class="data-table-filters">
    <!-- ═══ Toggle bar ═══ -->
    <div class="flex items-center gap-2">
      <Btn
        v-if="collapsible"
        variant="outline"
        size="sm"
        class="relative flex items-center justify-center h-8 px-3 gap-1.5 rounded-md text-xs shrink-0"
        :class="{ 'ring-1 ring-ring': hasActive }"
        @click="collapsed = !collapsed"
      >
        <HugeiconsIcon :icon="FilterIcon" :size="14" class="text-muted-foreground" />
        {{ t('common.filters', 'Filters') }}
        <span
          v-if="activeCount > 0"
          class="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] font-bold flex items-center justify-center"
        >
          {{ activeCount }}
        </span>
      </Btn>
      <Btn
        v-if="hasActive"
        variant="link"
        size="sm"
        class="text-destructive! text-xs! p-0! h-auto! flex items-center gap-1"
        @click="clearAll"
      >
        <HugeiconsIcon :icon="Cancel01Icon" :size="12" />
        {{ t('common.clear_all', 'Clear All') }}
      </Btn>
    </div>

    <!-- ═══ Filter fields ═══ -->
    <Transition name="filter-expand">
      <div
        v-if="!collapsible || !collapsed"
        class="mt-3 border border-border rounded-lg bg-card/50 p-4"
        :class="[
          layout === 'inline'
            ? 'flex flex-wrap items-end gap-4'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
        ]"
      >
        <div
          v-for="field in fields"
          :key="field.key"
          class="flex flex-col gap-1.5 min-w-0"
          :class="[layout === 'inline' ? 'flex-1 min-w-[180px] max-w-[260px]' : '']"
        >
          <Label class="text-xs font-medium text-foreground truncate">
            {{ tl(field.label) }}
          </Label>

          <!-- ── Text ── -->
          <Input
            v-if="field.type === 'text'"
            :model-value="(getVal(field) as string) || ''"
            :placeholder="field.placeholder || t('common.search', 'Search...')"
            class="h-8 text-xs"
            @update:model-value="setVal(field, $event)"
          />

          <!-- ── Number ── -->
          <Input
            v-else-if="field.type === 'number'"
            type="number"
            :model-value="(getVal(field) as string) || ''"
            :placeholder="field.placeholder || '0'"
            class="h-8 text-xs"
            @update:model-value="setVal(field, $event ? Number($event) : undefined)"
          />

          <!-- ── Date ── -->
          <Input
            v-else-if="field.type === 'date'"
            type="date"
            :model-value="(getVal(field) as string) || ''"
            class="h-8 text-xs"
            @update:model-value="setVal(field, $event)"
          />

          <!-- ── Select ── -->
          <SelectField
            v-else-if="field.type === 'select'"
            :model-value="(getVal(field) as string) || ''"
            :options="translatedOptions(field)"
            :placeholder="field.placeholder || t('common.select', 'Select...')"
            variant="default"
            size="md"
            @update:model-value="setVal(field, $event)"
          />

          <!-- ── Multiselect (pill toggles) ── -->
          <div v-else-if="field.type === 'multiselect'" class="flex flex-wrap gap-1.5">
            <span
              v-for="opt in translatedOptions(field)"
              :key="opt.value"
              class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer transition-all border select-none"
              :class="[
                isMultiSelected(field, opt.value)
                  ? 'bg-primary/10 text-primary border-primary'
                  : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-foreground',
              ]"
              @click="toggleMultiSelect(field, opt.value)"
            >
              {{ opt.label }}
            </span>
          </div>

          <!-- ── Toggle (switch) ── -->
          <div v-else-if="field.type === 'toggle'" class="flex items-center gap-2 pt-1">
            <Switch :checked="!!getVal(field)" @update:checked="setVal(field, $event)" />
            <span class="text-xs text-muted-foreground">
              {{
                field.placeholder || (getVal(field) ? t('common.yes', 'Yes') : t('common.no', 'No'))
              }}
            </span>
          </div>

          <!-- ── Range (min/max) ── -->
          <div v-else-if="field.type === 'range'" class="grid grid-cols-2 gap-2">
            <Input
              type="number"
              :model-value="(getVal(field) as any)?.min || ''"
              :placeholder="t('common.min', 'Min')"
              class="h-8 text-xs"
              @update:model-value="setRangeValue(field, 'min', $event ? Number($event) : undefined)"
            />
            <Input
              type="number"
              :model-value="(getVal(field) as any)?.max || ''"
              :placeholder="t('common.max', 'Max')"
              class="h-8 text-xs"
              @update:model-value="setRangeValue(field, 'max', $event ? Number($event) : undefined)"
            />
          </div>

          <!-- ── DateRange (from/to) ── -->
          <div v-else-if="field.type === 'dateRange'" class="grid grid-cols-2 gap-2">
            <Input
              type="date"
              :model-value="(getVal(field) as any)?.from || ''"
              class="h-8 text-xs"
              @update:model-value="setDateRangeValue(field, 'from', $event)"
            />
            <Input
              type="date"
              :model-value="(getVal(field) as any)?.to || ''"
              class="h-8 text-xs"
              @update:model-value="setDateRangeValue(field, 'to', $event)"
            />
          </div>

          <!-- ── Checkbox ── -->
          <div v-else-if="field.type === 'checkbox'" class="flex items-center gap-2 pt-1">
            <Checkbox
              :id="`dtf-${field.key}`"
              :checked="!!getVal(field)"
              @update:checked="setVal(field, $event)"
            />
            <Label :for="`dtf-${field.key}`" class="text-xs text-foreground font-normal">
              {{ field.placeholder || t('common.enabled', 'Enabled') }}
            </Label>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.filter-expand-enter-active,
.filter-expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.filter-expand-enter-from,
.filter-expand-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.filter-expand-enter-to,
.filter-expand-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>

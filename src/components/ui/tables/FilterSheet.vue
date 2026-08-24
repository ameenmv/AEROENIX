<script setup lang="ts">
import type { ActiveFilters, FilterConfig, FilterField } from '@/types'
import { Delete01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button as Btn } from '@/components/uic/button'
import { Checkbox } from '@/components/uic/checkbox'
import { Input } from '@/components/uic/input'
import { Label } from '@/components/uic/label'
import SelectField from '@/components/uic/select/SelectField.vue'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/uic/sheet'
import { useFilterStore } from '@/stores/shared/filter'

const props = defineProps<{
  resource: string
  config: FilterConfig
}>()
const emit = defineEmits<{
  (e: 'apply', filters: ActiveFilters): void
  (e: 'close'): void
}>()
const { t } = useI18n()
const filterStore = useFilterStore()
const localFilters = ref<ActiveFilters>({})
watch(
  () => filterStore.getActiveFilters(props.resource),
  (filters) => {
    localFilters.value = { ...filters }
  },
  { immediate: true },
)
function handleClearAll() {
  localFilters.value = {}
  filterStore.clearFilters(props.resource)
  emit('apply', {})
}
function handleClearFilter(key: string) {
  delete localFilters.value[key]
  filterStore.clearFilter(props.resource, key)
  emit('apply', { ...localFilters.value })
}
function handleFilterChange(key: string, value: any) {
  localFilters.value[key] = value
  filterStore.setActiveFilter(props.resource, key, value)
}
function handleApply() {
  emit('apply', { ...localFilters.value })
  filterStore.closeFilter(props.resource)
}
function handleClose() {
  filterStore.closeFilter(props.resource)
  emit('close')
}
const activeFilterCount = computed(() => {
  return Object.keys(localFilters.value).length
})
function getFilterValue(field: FilterField) {
  return localFilters.value[field.key]
}
function setFilterValue(field: FilterField, value: any) {
  handleFilterChange(field.key, value)
}
function toggleMultiSelect(field: FilterField, value: any) {
  const currentValue = getFilterValue(field)
  if (Array.isArray(currentValue)) {
    if (currentValue.includes(value)) {
      const newValue = currentValue.filter((v: any) => v !== value)
      setFilterValue(field, newValue.length > 0 ? newValue : undefined)
    }
    else {
      setFilterValue(field, [...currentValue, value])
    }
  }
  else {
    setFilterValue(field, [value])
  }
}
function isMultiSelectSelected(field: FilterField, value: any) {
  const currentValue = getFilterValue(field)
  return Array.isArray(currentValue) && currentValue.includes(value)
}
function setDateRangeValue(field: FilterField, key: 'from' | 'to', value: any) {
  const currentValue = getFilterValue(field) || {}
  const newValue = { ...currentValue, [key]: value || undefined }
  if (!newValue.from && !newValue.to) {
    setFilterValue(field, undefined)
  }
  else {
    setFilterValue(field, newValue)
  }
}
</script>

<template>
  <Sheet :open="filterStore.isFilterOpen(resource)" @update:open="(val) => !val && handleClose()">
    <SheetContent class="w-full sm:max-w-md flex flex-col p-0 border-l border-border bg-card">
      <SheetHeader
        class="flex flex-row items-center justify-between p-6 border-b border-border space-y-0"
      >
        <SheetTitle class="text-xl text-foreground m-0">
          {{ t('common.filters', 'Filters') }}
        </SheetTitle>
        <div v-if="activeFilterCount > 0" class="flex items-center gap-3 pr-6">
          <span class="text-sm text-secondary">{{ activeFilterCount }} {{ t('common.active', 'active') }}</span>
          <Btn
            v-if="activeFilterCount > 0"
            variant="link"
            size="sm"
            class="!text-destructive !text-xs !p-0 !h-auto"
            @click="handleClearAll"
          >
            {{ t('common.clear_all', 'Clear All') }}
          </Btn>
        </div>
      </SheetHeader>
      <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
        <div v-for="field in config.fields" :key="field.key" class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <Label class="text-sm font-medium text-foreground">
              {{ field.label.includes('.') ? t(field.label) : field.label }}
            </Label>
            <Btn
              v-if="getFilterValue(field) !== undefined && getFilterValue(field) !== ''"
              variant="link"
              size="sm"
              class="!text-destructive !text-xs !p-0 !h-auto flex items-center gap-1"
              @click="handleClearFilter(field.key)"
            >
              <HugeiconsIcon :icon="Delete01Icon" :size="12" />
              {{ t('common.clear', 'Clear') }}
            </Btn>
          </div>
          <!-- Text/Date -->
          <div v-if="field.type === 'text' || field.type === 'date'" class="w-full">
            <Input
              :type="field.type === 'date' ? 'date' : 'text'"
              :model-value="getFilterValue(field) || ''"
              :placeholder="field.placeholder || t('common.search', 'Search...')"
              @update:model-value="setFilterValue(field, $event)"
            />
          </div>
          <!-- Select -->
          <div v-else-if="field.type === 'select'" class="w-full">
            <SelectField
              :model-value="getFilterValue(field) || ''"
              :options="field.options || []"
              :placeholder="field.placeholder || t('common.select', 'Select...')"
              variant="default"
              size="md"
              @update:model-value="setFilterValue(field, $event)"
            />
          </div>
          <!-- MultiSelect -->
          <div v-else-if="field.type === 'multiselect'" class="w-full">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="opt in field.options"
                :key="opt.value"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border"
                :class="[
                  isMultiSelectSelected(field, opt.value)
                    ? 'bg-primary/10 text-primary border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-foreground',
                ]"
                @click="toggleMultiSelect(field, opt.value)"
              >
                {{ opt.label }}
              </span>
            </div>
          </div>
          <!-- DateRange -->
          <div v-else-if="field.type === 'dateRange'" class="w-full">
            <div class="grid grid-cols-2 gap-2">
              <div class="flex flex-col gap-1">
                <Label class="text-xs text-muted-foreground">{{ t('common.from', 'From') }}</Label>
                <Input
                  type="date"
                  :model-value="getFilterValue(field)?.from || ''"
                  @update:model-value="setDateRangeValue(field, 'from', $event)"
                />
              </div>
              <div class="flex flex-col gap-1">
                <Label class="text-xs text-muted-foreground">{{ t('common.to', 'To') }}</Label>
                <Input
                  type="date"
                  :model-value="getFilterValue(field)?.to || ''"
                  @update:model-value="setDateRangeValue(field, 'to', $event)"
                />
              </div>
            </div>
          </div>
          <!-- Checkbox -->
          <div v-else-if="field.type === 'checkbox'" class="flex items-center gap-2 pt-1">
            <Checkbox
              :id="`filter-${field.key}`"
              :checked="!!getFilterValue(field)"
              @update:checked="setFilterValue(field, $event)"
            />
            <Label :for="`filter-${field.key}`" class="text-sm text-foreground font-normal">
              {{ field.placeholder || t('common.enabled', 'Enabled') }}
            </Label>
          </div>
        </div>
      </div>
      <SheetFooter class="p-6 border-t border-border flex flex-col sm:flex-row gap-3">
        <Btn variant="secondary" class="flex-1" @click="handleClose">
          {{ t('common.cancel', 'Cancel') }}
        </Btn>
        <Btn variant="default" class="flex-1" @click="handleApply">
          {{ t('common.apply', 'Apply') }}
        </Btn>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

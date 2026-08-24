<script setup lang="ts">
import type { ViewConfig, ViewField } from '@/types'
import { useI18n } from 'vue-i18n'
import { cn } from '@/utils/cn'

interface Props {
  config: ViewConfig
  modelValue: Record<string, any>
  loading?: boolean
}
withDefaults(defineProps<Props>(), {
  loading: false,
})
const { t } = useI18n()
function getValue(field: ViewField, data: Record<string, any>) {
  const keys = field.key.split('.')
  let val = data
  for (const key of keys) {
    val = val?.[key]
  }
  if (val === null || val === undefined)
    return '-'
  if (field.format) {
    return field.format(val)
  }
  if (field.type === 'date') {
    return new Date(val as unknown as string | number).toLocaleDateString()
  }
  return val
}
function getGridColsClass(cols?: 1 | 2 | 3) {
  switch (cols) {
    case 1:
      return 'grid-cols-1'
    case 3:
      return 'grid-cols-1 md:grid-cols-3'
    case 2:
    default:
      return 'grid-cols-1 md:grid-cols-2'
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div v-if="loading" class="flex justify-center items-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
    </div>
    <template v-else>
      <div
        v-for="(section, sectionIndex) in config.sections"
        :key="sectionIndex"
        :class="section.className"
      >
        <h3 class="text-white font-bold text-base uppercase tracking-wider mb-4">
          {{ section.title.includes('.') ? t(section.title) : section.title }}
        </h3>
        <component
          :is="section.component"
          v-if="section.component"
          v-bind="{ ...section.props, ...modelValue }"
        />
        <div
          v-else-if="section.fields && section.fields.length > 0"
          :class="cn('rounded-2xl p-4 bg-card')"
        >
          <div class="grid gap-y-3.5" :class="getGridColsClass(section.cols)">
            <template v-for="field in section.fields" :key="field.key">
              <div class="flex flex-col gap-2">
                <label class="text-white text-base leading-5">
                  {{ field.label.includes('.') ? t(field.label) : field.label }}
                </label>
                <div class="text-[#E6E6E6] text-base leading-6">
                  {{ getValue(field, modelValue) }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

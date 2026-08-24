<script setup lang="ts">
import type { FormField } from '@/types'
import { CancelCircleIcon, CheckmarkCircle01Icon, File01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import { cn } from '@/utils/cn'

interface Props {
  fields: FormField[]
  modelValue: Record<string, any>
  loading?: boolean
  isEdit?: boolean
  title?: string
}
const props = withDefaults(defineProps<Props>(), {
  loading: false,
  title: '',
})
const { t } = useI18n()
function getValue(field: FormField) {
  const val = props.modelValue[field.key]
  if (val === null || val === undefined)
    return '-'
  if (field.type === 'select' && field.options) {
    const option = field.options.find(opt => opt.value === val)
    return option ? option.label : val
  }
  if (field.type === 'date') {
    return new Date(val).toLocaleDateString()
  }
  return val
}
function getFileValue(field: FormField) {
  return props.modelValue[field.key]
}
function isCheckboxTrue(field: FormField) {
  return !!props.modelValue[field.key]
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="loading" class="flex justify-center items-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
      <template v-for="field in fields" :key="field.key">
        <div
          :class="
            field.type === 'textarea' || field.type === 'checkbox-group'
              ? 'col-span-1 md:col-span-2'
              : ''
          "
        >
          <div class="space-y-2">
            <label class="block text-sm font-bold text-white tracking-tight ml-1">
              {{ field.label.includes('.') ? t(field.label) : field.label }}
            </label>
            <div
              v-if="
                field.type !== 'checkbox'
                  && field.type !== 'file'
                  && field.type !== 'checkbox-group'
              "
              :class="
                cn(
                  'border-none rounded-[10px] px-4 py-4 text-white min-h-[56px] flex items-center whitespace-pre-wrap bg-[#2A2D33]',
                )
              "
            >
              {{ getValue(field) }}
            </div>
            <div
              v-else-if="field.type === 'file'"
              :class="cn('rounded-[10px] px-4 py-4 flex items-center gap-3 bg-[#2A2D33]')"
            >
              <HugeiconsIcon :icon="File01Icon" :size="20" class="text-secondary" />
              <template v-if="getFileValue(field)">
                <a
                  v-if="typeof getFileValue(field) === 'string'"
                  :href="getFileValue(field)"
                  target="_blank"
                  class="text-blue-400 hover:text-blue-300 underline truncate"
                >
                  {{ t('common.view_file', 'View File') }}
                </a>
                <span v-else class="text-white">{{
                  t('common.file_uploaded', 'File Uploaded')
                }}</span>
              </template>
              <span v-else class="text-white/50 italic">{{ t('common.no_file', 'No file') }}</span>
            </div>
            <div
              v-else-if="field.type === 'checkbox'"
              :class="cn('rounded-[10px] px-4 py-4 flex items-center gap-3 bg-[#2A2D33]')"
            >
              <HugeiconsIcon
                :icon="isCheckboxTrue(field) ? CheckmarkCircle01Icon : CancelCircleIcon"
                :size="24"
                :class="isCheckboxTrue(field) ? 'text-green-500' : 'text-red-500'"
              />
              <span class="text-white">
                {{ isCheckboxTrue(field) ? t('common.yes', 'Yes') : t('common.no', 'No') }}
              </span>
            </div>
            <div
              v-else-if="field.type === 'checkbox-group'"
              :class="cn('rounded-[10px] p-4 bg-[#2A2D33]')"
            >
              <div class="flex flex-wrap gap-2">
                <template v-if="props.modelValue?.[field.key]?.length">
                  <span
                    v-for="item in props.modelValue[field.key]"
                    :key="item"
                    class="px-2 py-1 rounded bg-white/10 text-xs text-white"
                  >
                    {{ item }}
                  </span>
                </template>
                <span v-else class="text-white/50 italic">{{ t('common.none', 'None') }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

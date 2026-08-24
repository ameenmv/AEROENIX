<script setup lang="ts">
import { computed } from 'vue'
import { SelectField } from '@/components/uic/select'

const props = defineProps<{
  modelValue: any
  label: string
  fieldKey: string
  required?: boolean
  options?: string[]
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const selectOptions = computed(() =>
  (props.options || []).map(opt => ({
    value: opt,
    label: opt,
  })),
)
</script>

<template>
  <div>
    <SelectField
      :model-value="modelValue ?? ''"
      :options="selectOptions"
      :label="label"
      :required="required"
      :placeholder="placeholder || `Select ${label}...`"
      @update:model-value="emit('update:modelValue', String($event))"
    />
  </div>
</template>

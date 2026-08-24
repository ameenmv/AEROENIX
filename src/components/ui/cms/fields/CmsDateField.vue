<script setup lang="ts">
import { computed } from 'vue'
import { InputField } from '@/components/uic/input'

const props = defineProps<{
  modelValue: any
  label: string
  fieldKey: string
  required?: boolean
  dateType?: 'date' | 'datetime' | 'time'
  format?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const inputType = computed(() => {
  switch (props.dateType) {
    case 'datetime':
      return 'datetime-local'
    case 'time':
      return 'time'
    default:
      return 'date'
  }
})
</script>

<template>
  <div>
    <InputField
      :type="inputType"
      :model-value="modelValue ?? ''"
      :label="label"
      :placeholder="placeholder || label"
      :required="required"
      dir="ltr"
      @update:model-value="emit('update:modelValue', String($event))"
    />
  </div>
</template>

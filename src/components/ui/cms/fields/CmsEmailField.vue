<script setup lang="ts">
import { InputField } from '@/components/uic/input'

defineProps<{
  modelValue: any
  label: string
  fieldKey: string
  required?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()
</script>

<template>
  <div>
    <InputField
      type="email"
      :model-value="modelValue ?? ''"
      :label="label"
      :placeholder="placeholder || 'email@example.com'"
      :required="required"
      dir="ltr"
      @update:model-value="emit('update:modelValue', String($event))"
    />
  </div>
</template>

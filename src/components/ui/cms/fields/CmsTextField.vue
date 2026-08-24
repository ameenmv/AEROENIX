<script setup lang="ts">
import { InputField } from '@/components/uic/input'

defineProps<{
  modelValue: any
  label: string
  fieldKey: string
  required?: boolean
  minLength?: number
  maxLength?: number
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()
</script>

<template>
  <div>
    <InputField
      :model-value="modelValue ?? ''"
      :label="label"
      :placeholder="placeholder || label"
      :required="required"
      :minlength="minLength"
      :maxlength="maxLength"
      @update:model-value="emit('update:modelValue', String($event))"
    />
    <p v-if="maxLength" class="text-[10px] text-muted-foreground mt-1 text-end">
      {{ String(modelValue ?? '').length }} / {{ maxLength }}
    </p>
  </div>
</template>

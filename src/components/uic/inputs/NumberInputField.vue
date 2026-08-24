<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useId } from 'reka-ui'
import { computed } from 'vue'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/uic/field'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/uic/number-field'

interface Props {
  modelValue?: number
  label?: string
  description?: string
  error?: string
  id?: string
  required?: boolean
  disabled?: boolean
  min?: number
  max?: number
  step?: number
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  label: '',
  description: '',
  error: '',
  id: '',
  required: false,
  disabled: false,
  min: undefined,
  max: undefined,
  step: 1,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: number): void
}>()

const autoId = useId()
const inputId = computed(() => props.id || autoId)
</script>

<template>
  <Field
    :data-invalid="error ? true : undefined"
    :data-disabled="disabled ? true : undefined"
    :class="props.class"
  >
    <FieldLabel v-if="label" :for="inputId" class="font-semibold">
      {{ label }}
      <span v-if="required" class="text-destructive ml-0.5">*</span>
    </FieldLabel>

    <NumberField
      :id="inputId"
      :model-value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      @update:model-value="(val) => emit('update:modelValue', val)"
    >
      <NumberFieldContent>
        <NumberFieldDecrement />
        <NumberFieldInput />
        <NumberFieldIncrement />
      </NumberFieldContent>
    </NumberField>

    <FieldDescription v-if="description">
      {{ description }}
    </FieldDescription>
    <FieldError v-if="error" :errors="[error]" />
  </Field>
</template>

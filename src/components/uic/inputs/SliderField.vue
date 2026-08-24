<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useId } from 'reka-ui'
import { computed } from 'vue'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/uic/field'
import { Slider } from '@/components/uic/slider'

interface Props {
  modelValue?: number[]
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
  modelValue: () => [0],
  label: '',
  description: '',
  error: '',
  id: '',
  required: false,
  disabled: false,
  min: 0,
  max: 100,
  step: 1,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: number[]): void
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

    <Slider
      :id="inputId"
      :model-value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      @update:model-value="(val) => { if (val) emit('update:modelValue', val) }"
    />

    <FieldDescription v-if="description">
      {{ description }}
    </FieldDescription>
    <FieldError v-if="error" :errors="[error]" />
  </Field>
</template>

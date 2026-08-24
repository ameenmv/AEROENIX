<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useId } from 'reka-ui'
import { computed } from 'vue'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/uic/field'
import { Textarea } from '@/components/uic/textarea'

interface Props {
  modelValue?: string | number
  label?: string
  description?: string
  error?: string
  placeholder?: string
  id?: string
  required?: boolean
  disabled?: boolean
  rows?: number
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  description: '',
  error: '',
  placeholder: '',
  id: '',
  required: false,
  disabled: false,
  rows: 3,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | number): void
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

    <Textarea
      :id="inputId"
      :model-value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      class="resize-none font-sans"
      @update:model-value="(val) => emit('update:modelValue', val)"
    />

    <FieldDescription v-if="description">
      {{ description }}
    </FieldDescription>
    <FieldError v-if="error" :errors="[error]" />
  </Field>
</template>

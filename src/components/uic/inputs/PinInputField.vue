<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useId } from 'reka-ui'
import { computed } from 'vue'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/uic/field'
import { PinInput, PinInputGroup, PinInputSlot } from '@/components/uic/pin-input'

interface Props {
  modelValue?: string[]
  label?: string
  description?: string
  error?: string
  id?: string
  required?: boolean
  disabled?: boolean
  length?: number
  type?: 'text' | 'number'
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  label: '',
  description: '',
  error: '',
  id: '',
  required: false,
  disabled: false,
  length: 6,
  type: 'text',
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string[]): void
}>()

const autoId = useId()
const inputId = computed(() => props.id || autoId)

const slots = computed(() => Array.from({ length: props.length }, (_, i) => i))
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

    <PinInput
      :id="inputId"
      :model-value="modelValue"
      :disabled="disabled"
      :type="type"
      @update:model-value="(val) => emit('update:modelValue', val)"
    >
      <PinInputGroup class="gap-2">
        <PinInputSlot v-for="index in slots" :key="index" :index="index" />
      </PinInputGroup>
    </PinInput>

    <FieldDescription v-if="description">
      {{ description }}
    </FieldDescription>
    <FieldError v-if="error" :errors="[error]" />
  </Field>
</template>

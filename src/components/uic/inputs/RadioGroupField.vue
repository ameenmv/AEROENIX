<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useId } from 'reka-ui'
import { computed } from 'vue'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/uic/field'
import { RadioGroup, RadioGroupItem } from '@/components/uic/radio-group'

interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface Props {
  modelValue?: string
  options: RadioOption[]
  label?: string
  description?: string
  error?: string
  id?: string
  required?: boolean
  disabled?: boolean
  orientation?: 'vertical' | 'horizontal'
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  description: '',
  error: '',
  id: '',
  required: false,
  disabled: false,
  orientation: 'vertical',
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const autoId = useId()
const groupId = computed(() => props.id || autoId)
</script>

<template>
  <Field
    :data-invalid="error ? true : undefined"
    :data-disabled="disabled ? true : undefined"
    :class="props.class"
  >
    <FieldLabel v-if="label" class="font-semibold">
      {{ label }}
      <span v-if="required" class="text-destructive ml-0.5">*</span>
    </FieldLabel>

    <FieldDescription v-if="description">
      {{ description }}
    </FieldDescription>

    <RadioGroup
      :id="groupId"
      :model-value="modelValue"
      :disabled="disabled"
      :orientation="orientation"
      :class="orientation === 'horizontal' ? 'flex flex-row gap-4' : ''"
      @update:model-value="(val) => emit('update:modelValue', val as string)"
    >
      <Field
        v-for="option in options"
        :key="option.value"
        orientation="horizontal"
      >
        <RadioGroupItem
          :id="`${groupId}-${option.value}`"
          :value="option.value"
          :disabled="option.disabled"
        />
        <FieldContent>
          <FieldLabel :for="`${groupId}-${option.value}`" class="font-normal cursor-pointer">
            {{ option.label }}
          </FieldLabel>
          <FieldDescription v-if="option.description">
            {{ option.description }}
          </FieldDescription>
        </FieldContent>
      </Field>
    </RadioGroup>

    <FieldError v-if="error" :errors="[error]" />
  </Field>
</template>

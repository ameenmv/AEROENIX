<script setup lang="ts">
import type { AcceptableInputValue } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { useId } from 'reka-ui'
import { computed } from 'vue'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/uic/field'
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from '@/components/uic/tags-input'

interface Props {
  modelValue?: AcceptableInputValue[]
  label?: string
  description?: string
  error?: string
  placeholder?: string
  id?: string
  required?: boolean
  disabled?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  label: '',
  description: '',
  error: '',
  placeholder: '',
  id: '',
  required: false,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: AcceptableInputValue[]): void
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

    <TagsInput
      :id="inputId"
      :model-value="modelValue"
      :disabled="disabled"
      @update:model-value="(val: AcceptableInputValue[]) => emit('update:modelValue', val)"
    >
      <TagsInputItem v-for="item in modelValue" :key="String(item)" :value="item">
        <TagsInputItemText />
        <TagsInputItemDelete />
      </TagsInputItem>
      <TagsInputInput :placeholder="placeholder" />
    </TagsInput>

    <FieldDescription v-if="description">
      {{ description }}
    </FieldDescription>
    <FieldError v-if="error" :errors="[error]" />
  </Field>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useId } from 'reka-ui'
import { computed } from 'vue'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/uic/field'
import { Switch } from '@/components/uic/switch'

interface Props {
  modelValue?: boolean
  label?: string
  description?: string
  error?: string
  id?: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  label: '',
  description: '',
  error: '',
  id: '',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

const autoId = useId()
const inputId = computed(() => props.id || autoId)

function onUpdate(checked: boolean) {
  emit('update:modelValue', checked)
}
</script>

<template>
  <Field
    orientation="horizontal"
    :data-invalid="error ? true : undefined"
    :data-disabled="disabled ? true : undefined"
    :class="props.class"
  >
    <Switch
      :id="inputId"
      :checked="modelValue"
      :disabled="disabled"
      @update:checked="onUpdate"
    />
    <FieldContent v-if="label || description">
      <FieldLabel :for="inputId" class="font-normal">
        {{ label }}
      </FieldLabel>
      <FieldDescription v-if="description">
        {{ description }}
      </FieldDescription>
    </FieldContent>
    <FieldError v-if="error" :errors="[error]" />
  </Field>
</template>

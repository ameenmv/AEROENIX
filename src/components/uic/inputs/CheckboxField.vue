<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useId } from 'reka-ui'
import { computed } from 'vue'
import { Checkbox } from '@/components/uic/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/uic/field'
import { cn } from '@/utils/cn'

interface Props {
  modelValue?: boolean | any[]
  value?: any
  label?: string
  description?: string
  id?: string
  disabled?: boolean
  error?: boolean | string
  variant?: 'default' | 'table'
  size?: 'default' | 'sm' | 'lg'
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  value: '',
  label: '',
  description: '',
  id: '',
  disabled: false,
  error: false,
  variant: 'default',
  size: 'default',
})

const emit = defineEmits(['update:modelValue'])

const autoId = useId()
const inputId = computed(() => props.id || autoId)

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value)
  }
  return props.modelValue === true
})

function onUpdateChecked(val: boolean | 'indeterminate') {
  if (props.disabled)
    return
  const checked = val === 'indeterminate' ? false : val
  if (Array.isArray(props.modelValue)) {
    const newValue = [...props.modelValue]
    if (checked) {
      if (!newValue.includes(props.value)) {
        newValue.push(props.value)
      }
    }
    else {
      const index = newValue.indexOf(props.value)
      if (index > -1) {
        newValue.splice(index, 1)
      }
    }
    emit('update:modelValue', newValue)
  }
  else {
    emit('update:modelValue', checked)
  }
}

const checkboxClass = computed(() => {
  return cn(
    'transition-all duration-200',
    {
      'h-5 w-5': props.size === 'default',
      'h-4 w-4': props.size === 'sm',
      'h-6 w-6': props.size === 'lg',
    },
    props.variant === 'table'
      ? 'bg-background/50 border-border data-[state=checked]:border-success data-[state=checked]:bg-success data-[state=checked]:text-white'
      : 'data-[state=checked]:bg-primary',
    props.error ? 'border-destructive focus-visible:ring-destructive' : '',
  )
})

const hasError = computed(() =>
  typeof props.error === 'string' ? props.error : props.error ? '' : '',
)
</script>

<template>
  <Field
    orientation="horizontal"
    :data-invalid="error ? true : undefined"
    :data-disabled="disabled ? true : undefined"
    :class="props.class"
  >
    <Checkbox
      :id="inputId"
      :model-value="isChecked"
      :disabled="disabled"
      :value="typeof value === 'string' ? value : String(value)"
      :class="checkboxClass"
      @update:model-value="onUpdateChecked"
    />
    <FieldContent v-if="label || description">
      <FieldLabel
        :for="inputId"
        class="font-normal cursor-pointer"
        @click="onUpdateChecked(!isChecked)"
      >
        {{ label }}
      </FieldLabel>
      <FieldDescription v-if="description">
        {{ description }}
      </FieldDescription>
    </FieldContent>
    <FieldError v-if="typeof error === 'string' && hasError" :errors="[hasError]" />
  </Field>
</template>

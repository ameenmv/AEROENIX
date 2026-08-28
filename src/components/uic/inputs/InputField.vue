<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useId } from 'reka-ui'
import { computed } from 'vue'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/uic/field'
import { Input } from '@/components/uic/input'
import { Textarea } from '@/components/uic/textarea'
import { cn } from '@/utils/cn'

interface Props {
  variant?: 'default' | 'search'
  modelValue?: string | number
  label?: string
  description?: string
  error?: string
  placeholder?: string
  type?: string
  id?: string
  size?: 'sm' | 'md' | 'lg'
  required?: boolean
  disabled?: boolean
  autocomplete?: string
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
  size: 'md',
  variant: 'default',
  type: 'text',
  required: false,
  disabled: false,
  rows: 3,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | number): void
}>()

const autoId = useId()
const inputId = computed(() => props.id || autoId)

const inputClasses = computed(() => {
  return cn(
    {
      'h-8 px-3 text-xs': props.size === 'sm',
      'h-10 px-4 py-2': props.size === 'md',
      'h-12 px-5 text-lg': props.size === 'lg',
    },
    props.variant === 'search'
      ? 'pl-9 bg-card border-none ring-1 ring-border shadow-none h-9 text-xs'
      : '',
  )
})
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

    <div class="relative w-full">
      <div
        v-if="variant === 'search'"
        class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground"
      >
        <HugeiconsIcon :icon="Search01Icon" :size="16" />
      </div>

      <Textarea
        v-if="type === 'textarea'"
        :id="inputId"
        :model-value="modelValue"
        :placeholder="placeholder"
        :rows="rows"
        :disabled="disabled"
        :class="cn('resize-none font-sans', inputClasses)"
        @update:model-value="(val) => emit('update:modelValue', val)"
      />
      <Input
        v-else
        :id="inputId"
        :type="type"
        :model-value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :class="cn('font-sans', inputClasses, $slots.suffix ? 'pr-10' : '')"
        @update:model-value="(val) => emit('update:modelValue', val)"
      />
      <div v-if="$slots.suffix" class="absolute inset-y-0 right-0 flex items-center pr-3">
        <slot name="suffix" />
      </div>
    </div>

    <FieldDescription v-if="description">
      {{ description }}
    </FieldDescription>
    <FieldError v-if="error" :errors="[error]" />
  </Field>
</template>

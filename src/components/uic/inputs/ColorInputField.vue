<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useId } from 'reka-ui'
import { computed } from 'vue'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/uic/field'
import { cn } from '@/utils/cn'

interface Props {
  modelValue?: string
  label?: string
  description?: string
  error?: string
  id?: string
  required?: boolean
  disabled?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '#3b82f6',
  label: '',
  description: '',
  error: '',
  id: '',
  required: false,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const autoId = useId()
const inputId = computed(() => props.id || autoId)

const colorValue = computed({
  get: () => props.modelValue || '#3b82f6',
  set: (val: string) => emit('update:modelValue', val),
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

    <div class="flex items-center gap-3">
      <div
        :class="
          cn(
            'relative w-9 h-9 rounded-lg overflow-hidden border-2 transition-colors cursor-pointer shrink-0',
            error ? 'border-destructive' : 'border-input hover:border-ring',
            disabled && 'opacity-50 cursor-not-allowed',
          )
        "
        :style="{ backgroundColor: colorValue }"
      >
        <input
          :id="inputId"
          v-model="colorValue"
          type="color"
          :disabled="disabled"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        >
      </div>
      <div class="flex-1">
        <input
          v-model="colorValue"
          type="text"
          :disabled="disabled"
          :class="
            cn(
              'w-full px-3 py-1.5 border rounded-md text-sm font-mono uppercase transition-colors outline-none',
              'bg-transparent border-input focus:border-ring focus:ring-ring/50 focus:ring-[3px]',
              error && 'border-destructive focus:ring-destructive/20',
              disabled && 'opacity-50 cursor-not-allowed',
            )
          "
          placeholder="#000000"
          maxlength="7"
        >
      </div>
    </div>

    <FieldDescription v-if="description">
      {{ description }}
    </FieldDescription>
    <FieldError v-if="error" :errors="[error]" />
  </Field>
</template>

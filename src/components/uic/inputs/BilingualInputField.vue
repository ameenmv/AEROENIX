<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useId } from 'reka-ui'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Field, FieldDescription, FieldLabel } from '@/components/uic/field'
import { InputField } from '@/components/uic/inputs'

interface Props {
  modelValue: { en: string, ar: string }
  label?: string
  description?: string
  placeholderEn?: string
  placeholderAr?: string
  id?: string
  required?: boolean
  disabled?: boolean
  error?: string | { en?: string, ar?: string }
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  description: '',
  placeholderEn: '',
  placeholderAr: '',
  id: '',
  required: false,
  disabled: false,
  error: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: { en: string, ar: string }): void
}>()

const { t } = useI18n()
const autoId = useId()
const inputId = computed(() => props.id || autoId)

const enValue = computed({
  get: () => props.modelValue?.en ?? '',
  set: (val: string) => emit('update:modelValue', { ...props.modelValue, en: val }),
})

const arValue = computed({
  get: () => props.modelValue?.ar ?? '',
  set: (val: string) => emit('update:modelValue', { ...props.modelValue, ar: val }),
})

const enError = computed(() => {
  if (typeof props.error === 'string')
    return props.error
  return props.error?.en
})

const arError = computed(() => {
  if (typeof props.error === 'object')
    return props.error?.ar
  return undefined
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

    <div class="flex flex-col md:flex-row gap-3">
      <div class="flex-1">
        <label class="text-xs font-medium text-muted-foreground mb-1 block">
          {{ t('common.english', 'English') }}
        </label>
        <InputField
          :id="inputId"
          v-model="enValue"
          :placeholder="placeholderEn"
          :disabled="disabled"
          :error="enError"
          dir="ltr"
        />
      </div>
      <div class="flex-1">
        <label class="text-xs font-medium text-muted-foreground mb-1 block">
          {{ t('common.arabic', 'Arabic') }}
        </label>
        <InputField
          v-model="arValue"
          :placeholder="placeholderAr"
          :disabled="disabled"
          :error="arError"
          dir="rtl"
        />
      </div>
    </div>

    <FieldDescription v-if="description">
      {{ description }}
    </FieldDescription>
  </Field>
</template>

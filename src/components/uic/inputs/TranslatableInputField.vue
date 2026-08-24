<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useId } from 'reka-ui'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/uic/field'
import { Input } from '@/components/uic/input'
import { Textarea } from '@/components/uic/textarea'

interface TranslatableField {
  en: string
  ar: string
}

interface Props {
  modelValue: TranslatableField
  label?: string
  description?: string
  error?: string
  placeholder?: string
  placeholderEn?: string
  placeholderAr?: string
  id?: string
  required?: boolean
  disabled?: boolean
  variant?: 'input' | 'textarea'
  rows?: number
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  description: '',
  error: '',
  placeholder: '',
  placeholderEn: '',
  placeholderAr: '',
  id: '',
  required: false,
  disabled: false,
  variant: 'input',
  rows: 3,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: TranslatableField): void
}>()

const { t } = useI18n()
const autoId = useId()
const inputId = computed(() => props.id || autoId)

const enValue = computed({
  get: () => props.modelValue?.en || '',
  set: (val: string) => emit('update:modelValue', { ...props.modelValue, en: val }),
})
const arValue = computed({
  get: () => props.modelValue?.ar || '',
  set: (val: string) => emit('update:modelValue', { ...props.modelValue, ar: val }),
})
const enPlaceholder = computed(
  () => props.placeholderEn || (props.placeholder ? `${props.placeholder} (EN)` : 'English'),
)
const arPlaceholder = computed(
  () => props.placeholderAr || (props.placeholder ? `${props.placeholder} (AR)` : 'العربية'),
)
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
      <!-- English -->
      <div class="relative flex-1 group" dir="ltr">
        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none z-10">
          <span
            class="text-[10px] font-bold text-muted-foreground group-focus-within:text-primary transition-colors uppercase tracking-wider"
          >{{ t('common.lang_en', 'EN') }}</span>
        </div>
        <Textarea
          v-if="variant === 'textarea'"
          :id="inputId"
          v-model="enValue"
          :placeholder="enPlaceholder"
          :rows="rows"
          :disabled="disabled"
          dir="ltr"
          class="ps-10 pt-2.5 min-h-[60px]"
        />
        <Input
          v-else
          :id="inputId"
          v-model="enValue"
          :placeholder="enPlaceholder"
          :disabled="disabled"
          dir="ltr"
          class="ps-10"
        />
      </div>
      <!-- Arabic -->
      <div class="relative flex-1 group" dir="rtl">
        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none z-10">
          <span
            class="text-[12px] font-bold text-muted-foreground group-focus-within:text-primary transition-colors uppercase tracking-wider"
          >{{ t('common.lang_ar', 'ع') }}</span>
        </div>
        <Textarea
          v-if="variant === 'textarea'"
          v-model="arValue"
          :placeholder="arPlaceholder"
          :rows="rows"
          :disabled="disabled"
          dir="rtl"
          class="ps-10 pt-2.5 min-h-[60px]"
        />
        <Input
          v-else
          v-model="arValue"
          :placeholder="arPlaceholder"
          :disabled="disabled"
          dir="rtl"
          class="ps-10"
        />
      </div>
    </div>

    <FieldDescription v-if="description">
      {{ description }}
    </FieldDescription>
    <FieldError v-if="error" :errors="[error]" />
  </Field>
</template>

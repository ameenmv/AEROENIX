<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { HTMLAttributes } from 'vue'
import { Calendar01Icon as CalendarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'
import { useId } from 'reka-ui'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/uic/button'
import { Calendar } from '@/components/uic/calendar'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/uic/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/uic/popover'
import { cn } from '@/lib/utils'

interface Props {
  modelValue?: string
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
  modelValue: '',
  label: '',
  description: '',
  error: '',
  placeholder: '',
  id: '',
  required: false,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | undefined): void
}>()

const { locale, t } = useI18n()
const autoId = useId()
const inputId = computed(() => props.id || autoId)
const df = computed(() => new DateFormatter(locale.value, { dateStyle: 'medium' }))

const value = computed<DateValue | undefined>({
  get: () => (props.modelValue ? parseDate(props.modelValue) : undefined),
  set: val => emit('update:modelValue', val ? val.toString() : undefined),
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

    <Popover>
      <PopoverTrigger as-child>
        <Button
          :id="inputId"
          variant="outline"
          :class="
            cn(
              'w-full justify-start text-start font-normal px-3 h-9 bg-background',
              !value && 'text-muted-foreground',
            )
          "
          :disabled="disabled"
        >
          <HugeiconsIcon :icon="CalendarIcon" class="me-2 h-3.5 w-3.5" />
          {{
            value
              ? df.format(value.toDate(getLocalTimeZone()))
              : placeholder || t('common.pick_a_date', 'Pick a date')
          }}
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0" align="start">
        <Calendar v-model="value" initial-focus />
      </PopoverContent>
    </Popover>

    <FieldDescription v-if="description">
      {{ description }}
    </FieldDescription>
    <FieldError v-if="error" :errors="[error]" />
  </Field>
</template>

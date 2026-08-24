<script setup lang="ts">
import { InputField } from '@/components/uic/input'

const props = defineProps<{
  modelValue: any
  label: string
  fieldKey: string
  required?: boolean
  numberType?: 'integer' | 'float' | 'decimal'
  min?: number
  max?: number
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
}>()

function handleInput(val: any) {
  if (val === '' || val === null || val === undefined) {
    emit('update:modelValue', null)
    return
  }
  const num = Number(val)
  emit('update:modelValue', Number.isNaN(num) ? null : num)
}

const numberHint = computed(() => {
  if (!props.numberType)
    return ''
  let hint = props.numberType
  if (props.min != null)
    hint += ` · min: ${props.min}`
  if (props.max != null)
    hint += ` · max: ${props.max}`
  return hint
})
</script>

<template>
  <div>
    <InputField
      type="number"
      :model-value="modelValue ?? ''"
      :label="label"
      :placeholder="placeholder || label"
      :required="required"
      :min="min"
      :max="max"
      :step="numberType === 'integer' ? 1 : numberType === 'decimal' ? 0.01 : 'any'"
      @update:model-value="handleInput"
    />
    <p v-if="numberHint" class="text-[10px] text-muted-foreground mt-1">
      {{ numberHint }}
    </p>
  </div>
</template>

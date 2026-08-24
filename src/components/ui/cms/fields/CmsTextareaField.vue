<script setup lang="ts">
import { Textarea } from '@/components/uic/textarea'

defineProps<{
  modelValue: any
  label: string
  fieldKey: string
  required?: boolean
  minLength?: number
  maxLength?: number
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()
</script>

<template>
  <div>
    <label class="text-sm font-medium text-foreground mb-1.5 block">
      {{ label }}
      <span v-if="required" class="text-destructive">*</span>
    </label>
    <Textarea
      :model-value="modelValue ?? ''"
      :placeholder="placeholder || label"
      :minlength="minLength"
      :maxlength="maxLength"
      rows="4"
      @update:model-value="emit('update:modelValue', String($event))"
    />
    <p v-if="maxLength" class="text-[10px] text-muted-foreground mt-1 text-end">
      {{ String(modelValue ?? '').length }} / {{ maxLength }}
    </p>
  </div>
</template>

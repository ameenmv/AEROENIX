<script setup lang="ts">
import RichTextInput from '@/components/uic/inputs/RichTextInputField.vue'

defineProps<{
  modelValue: any
  label: string
  fieldKey: string
  required?: boolean
  maxLength?: number
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div>
    <RichTextInput
      :model-value="modelValue ?? ''"
      :label="label"
      :required="required"
      :placeholder="placeholder"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <p v-if="maxLength" class="text-[10px] text-muted-foreground mt-1 text-end">
      {{ String(modelValue ?? '').replace(/<[^>]*>?/gm, '').length }} / {{ maxLength }}
    </p>
  </div>
</template>

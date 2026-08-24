<script setup lang="ts">
import { InputField } from '@/components/uic/input'

defineProps<{
  modelValue: any
  label: string
  fieldKey: string
  required?: boolean
  minLength?: number
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()
</script>

<template>
  <div>
    <InputField
      type="password"
      :model-value="modelValue ?? ''"
      :label="label"
      :placeholder="placeholder || '••••••••'"
      :required="required"
      :minlength="minLength"
      @update:model-value="emit('update:modelValue', String($event))"
    />
    <p v-if="minLength" class="text-[10px] text-muted-foreground mt-1">
      {{ $t('cms.min_characters', 'Min {n} characters', { n: minLength }) }}
    </p>
  </div>
</template>

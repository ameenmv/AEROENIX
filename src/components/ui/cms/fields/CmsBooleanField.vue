<script setup lang="ts">
import { Switch } from '@/components/uic/switch'

defineProps<{
  modelValue: any
  label: string
  fieldKey: string
  required?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>

<template>
  <div class="flex items-center gap-3 py-1">
    <label class="flex items-center gap-3 cursor-pointer">
      <Switch :checked="!!modelValue" @update:checked="emit('update:modelValue', $event)" />
      <span class="text-sm font-medium text-foreground">
        {{ label }}
        <span v-if="required" class="text-destructive">*</span>
      </span>
    </label>
  </div>
</template>

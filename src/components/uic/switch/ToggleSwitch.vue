<script setup lang="ts">
/**
 * @deprecated Use SwitchField instead. This is kept as a backward-compatible alias.
 */
import type { HTMLAttributes } from 'vue'
import SwitchField from '@/components/uic/inputs/SwitchField.vue'

defineProps<{
  modelValue: boolean
  label?: string
  id?: string
  disabled?: boolean
  description?: string
  error?: string
  class?: HTMLAttributes['class']
}>()

defineEmits(['update:modelValue'])
</script>

<template>
  <SwitchField v-bind="$props" @update:model-value="$emit('update:modelValue', $event)" />
</template>

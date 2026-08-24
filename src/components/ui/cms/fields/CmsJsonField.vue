<script setup lang="ts">
import { ref, watch } from 'vue'
import { Textarea } from '@/components/uic/textarea'

const props = defineProps<{
  modelValue: any
  label: string
  fieldKey: string
  required?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const jsonText = ref('')
const parseError = ref('')

// Initialize from prop
watch(
  () => props.modelValue,
  (val) => {
    if (typeof val === 'object' && val !== null) {
      jsonText.value = JSON.stringify(val, null, 2)
    }
    else if (typeof val === 'string') {
      jsonText.value = val
    }
    else {
      jsonText.value = ''
    }
  },
  { immediate: true },
)

function handleInput(val: string | number) {
  const strVal = String(val)
  jsonText.value = strVal
  parseError.value = ''

  if (!strVal.trim()) {
    emit('update:modelValue', null)
    return
  }

  try {
    const parsed = JSON.parse(strVal)
    emit('update:modelValue', parsed)
  }
  catch {
    parseError.value = 'Invalid JSON'
  }
}
</script>

<template>
  <div>
    <label class="text-sm font-medium text-foreground mb-1.5 block">
      {{ label }}
      <span v-if="required" class="text-destructive">*</span>
    </label>
    <Textarea
      :model-value="jsonText"
      :placeholder="placeholder || '{ &quot;key&quot;: &quot;value&quot; }'"
      rows="6"
      class="font-mono text-xs"
      dir="ltr"
      @update:model-value="handleInput"
    />
    <p v-if="parseError" class="text-[10px] text-destructive mt-1">
      {{ parseError }}
    </p>
  </div>
</template>

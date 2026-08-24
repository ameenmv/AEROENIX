<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: any
  label: string
  fieldKey: string
  required?: boolean
  colorFormat?: 'hex' | 'rgb' | 'hsl'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const localColor = ref(props.modelValue || '#000000')

watch(
  () => props.modelValue,
  (val) => {
    if (val)
      localColor.value = val
  },
)

function handleInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  localColor.value = val
  emit('update:modelValue', val)
}
</script>

<template>
  <div>
    <label class="text-sm font-medium text-foreground mb-1.5 block">
      {{ label }}
      <span v-if="required" class="text-destructive">*</span>
    </label>
    <div class="flex items-center gap-3">
      <div
        class="w-10 h-10 rounded-lg border border-border shrink-0 cursor-pointer overflow-hidden relative"
        :style="{ backgroundColor: localColor }"
      >
        <input
          type="color"
          :value="localColor"
          class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          @input="handleInput"
        >
      </div>
      <input
        :value="localColor"
        class="flex-1 h-10 px-3 rounded-md border border-border bg-background text-sm font-mono text-foreground focus:border-primary focus:outline-none transition-colors"
        :placeholder="
          colorFormat === 'rgb'
            ? 'rgb(0, 0, 0)'
            : colorFormat === 'hsl'
              ? 'hsl(0, 0%, 0%)'
              : '#000000'
        "
        @input="
          (e) => {
            localColor = (e.target as HTMLInputElement).value
            emit('update:modelValue', localColor)
          }
        "
      >
    </div>
    <p v-if="colorFormat" class="text-[10px] text-muted-foreground mt-1">
      {{ $t('cms.color_format', 'Format:') }} {{ colorFormat }}
    </p>
  </div>
</template>

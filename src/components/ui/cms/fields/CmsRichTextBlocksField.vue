<script setup lang="ts">
import { Textarea } from '@/components/uic/textarea'

defineProps<{
  modelValue: any
  label: string
  fieldKey: string
  required?: boolean
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
    <div class="rounded-lg border border-border bg-background overflow-hidden">
      <div class="flex items-center gap-1 px-3 py-1.5 border-b border-border bg-muted/30">
        <span class="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{{
          $t('cms.rich_text_blocks', 'Rich Text Blocks')
        }}</span>
        <span class="text-[10px] text-muted-foreground ml-auto">{{
          $t('cms.textarea_fallback', '(Textarea fallback)')
        }}</span>
      </div>
      <Textarea
        :model-value="modelValue ?? ''"
        :placeholder="placeholder || 'Write your block content here...'"
        rows="8"
        class="border-0 rounded-none focus-visible:ring-0 resize-y"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>
  </div>
</template>

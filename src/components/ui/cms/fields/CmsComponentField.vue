<script setup lang="ts">
defineProps<{
  modelValue: any
  label: string
  fieldKey: string
  required?: boolean
  componentRef?: string
  repeatable?: boolean
}>()

const _emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()
</script>

<template>
  <div>
    <label class="text-sm font-medium text-foreground mb-1.5 block">
      {{ label }}
      <span v-if="required" class="text-destructive">*</span>
    </label>
    <div class="rounded-lg border border-dashed border-border p-4 text-center bg-muted/20">
      <p class="text-xs text-muted-foreground">
        {{ $t('cms.component_field', 'Component field') }} ({{ componentRef || 'unknown' }})
      </p>
      <p class="text-[10px] text-muted-foreground mt-1">
        {{
          repeatable
            ? $t('cms.repeatable', 'Repeatable')
            : $t('cms.single_instance', 'Single instance')
        }}{{ $t('common.separator_dash', ' — ')
        }}{{ $t('cms.nested_editing_coming', 'Nested editing coming in a future update') }}
      </p>
    </div>
  </div>
</template>

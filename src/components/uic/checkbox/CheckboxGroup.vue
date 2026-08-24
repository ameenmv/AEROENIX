<script setup lang="ts">
import CheckboxField from '@/components/uic/inputs/CheckboxField.vue'
import { Label } from '@/components/uic/label'

interface Option {
  label: string
  value: string | number
}
interface Group {
  label: string
  options: Option[]
}
interface Props {
  modelValue?: any[]
  options?: Option[]
  groups?: Group[]
  label?: string
  error?: string
  direction?: 'row' | 'col'
  gridCols?: number
}
withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  options: () => [],
  groups: () => [],
  direction: 'col',
  gridCols: 1,
  label: '',
  error: '',
})
const emit = defineEmits(['update:modelValue'])
function updateValue(newValue: any[]) {
  emit('update:modelValue', newValue)
}
</script>

<template>
  <div class="space-y-3">
    <Label v-if="label" class="block text-sm font-bold text-foreground tracking-tight">
      {{ label }}
    </Label>
    <div
      v-if="groups && groups.length > 0"
      class="gap-6 w-full"
      :class="[gridCols > 1 ? 'grid' : 'flex flex-col']"
      :style="gridCols > 1 ? { gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` } : {}"
    >
      <div
        v-for="(group, idx) in groups"
        :key="idx"
        class="bg-card rounded-xl p-6 h-full border hover:border-border transition-colors w-full"
      >
        <h4 class="text-foreground text-sm font-medium mb-4 capitalize">
          {{ group.label }}
        </h4>
        <div class="flex flex-col gap-4">
          <CheckboxField
            v-for="option in group.options"
            :key="String(option.value)"
            :label="option.label"
            :value="option.value"
            :model-value="modelValue"
            @update:model-value="updateValue"
          />
        </div>
      </div>
    </div>
    <div
      v-else
      class="gap-4 w-full"
      :class="[gridCols > 1 ? 'grid' : direction === 'row' ? 'flex flex-wrap' : 'flex flex-col']"
      :style="gridCols > 1 ? { gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` } : {}"
    >
      <CheckboxField
        v-for="option in options"
        :key="String(option.value)"
        :label="option.label"
        :value="option.value"
        :model-value="modelValue"
        @update:model-value="updateValue"
      />
    </div>
    <p v-if="error" class="text-xs text-destructive mt-1">
      {{ error }}
    </p>
  </div>
</template>

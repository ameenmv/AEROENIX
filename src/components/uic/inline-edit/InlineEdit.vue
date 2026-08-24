<script setup lang="ts">
/**
 * InlineEdit — click-to-edit text field that toggles between display and input mode.
 * Composes shadcn Input + Button for consistent styling.
 * Press Enter or click check to save, Escape or click X to cancel.
 */
import type { HTMLAttributes } from 'vue'
import type { InlineEditVariants } from './variants'
import { Check, Pencil, X } from 'lucide-vue-next'
import { nextTick, ref } from 'vue'
import { Button } from '@/components/uic/button'
import { Input } from '@/components/uic/input'
import { cn } from '@/utils/cn'
import { inlineEditVariants } from './variants'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    size?: InlineEditVariants['size']
    disabled?: boolean
    class?: HTMLAttributes['class']
  }>(),
  {
    modelValue: '',
    placeholder: 'Click to edit...',
    size: 'default',
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'save': [value: string]
  'cancel': []
}>()

const isEditing = ref(false)
const draft = ref(props.modelValue)
const inputRef = ref<HTMLInputElement | null>(null)

async function startEditing() {
  if (props.disabled)
    return
  draft.value = props.modelValue
  isEditing.value = true
  await nextTick()
  inputRef.value?.focus()
  inputRef.value?.select()
}

function save() {
  isEditing.value = false
  emit('update:modelValue', draft.value)
  emit('save', draft.value)
}

function cancel() {
  isEditing.value = false
  draft.value = props.modelValue
  emit('cancel')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter')
    save()
  else if (e.key === 'Escape')
    cancel()
}
</script>

<template>
  <div data-slot="inline-edit" :class="cn(inlineEditVariants({ size }), props.class)">
    <!-- Editing mode -->
    <template v-if="isEditing">
      <Input ref="inputRef" v-model="draft" class="flex-1 h-auto py-1" @keydown="onKeydown" />
      <Button
        variant="ghost"
        size="icon-sm"
        class="text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10"
        @click="save"
      >
        <Check :size="14" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        class="text-destructive hover:bg-destructive/10"
        @click="cancel"
      >
        <X :size="14" />
      </Button>
    </template>

    <!-- Display mode -->
    <template v-else>
      <span
        :class="
          cn(
            'cursor-pointer rounded px-1 py-0.5 transition-colors',
            'hover:bg-muted',
            !modelValue && 'text-muted-foreground italic',
            disabled && 'cursor-not-allowed opacity-50',
          )
        "
        @click="startEditing"
      >
        {{ modelValue || placeholder }}
      </span>
      <Pencil
        v-if="!disabled"
        :size="12"
        class="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        @click="startEditing"
      />
    </template>
  </div>
</template>

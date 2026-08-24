<script setup lang="ts">
/**
 * TextEditor — Quill-based WYSIWYG rich text editor with shadcn styling.
 *
 * IMPORTANT: Requires `quill` as a peer dependency.
 * Install: `bun add quill`
 *
 * Emits v-model as HTML string.
 */
import type { HTMLAttributes } from 'vue'
import type { TextEditorVariants } from './variants'
import { onMounted, ref, watch } from 'vue'
import { cn } from '@/utils/cn'
import { textEditorVariants } from './variants'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    label?: string
    direction?: 'ltr' | 'rtl'
    size?: TextEditorVariants['size']
    disabled?: boolean
    class?: HTMLAttributes['class']
  }>(),
  {
    modelValue: '',
    placeholder: 'Write something...',
    label: '',
    direction: 'ltr',
    size: 'default',
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorId = ref(`editor-${Math.random().toString(36).substring(2, 9)}`)
const toolbarId = ref(`toolbar-${Math.random().toString(36).substring(2, 9)}`)
let quillInstance: any = null

onMounted(async () => {
  // Dynamic import to avoid SSR issues and keep Quill as optional dependency
  const { default: Quill } = await import('quill')
  await import('quill/dist/quill.snow.css')

  quillInstance = new Quill(`#${editorId.value}`, {
    modules: {
      toolbar: {
        container: `#${toolbarId.value}`,
      },
    },
    theme: 'snow',
    placeholder: props.placeholder,
    readOnly: props.disabled,
  })

  if (props.modelValue) {
    quillInstance.root.innerHTML = props.modelValue
  }

  quillInstance.root.setAttribute('dir', props.direction)

  quillInstance.on('text-change', () => {
    const html = quillInstance.root.innerHTML
    const isEmpty = html === '<p><br></p>' || html === ''
    emit('update:modelValue', isEmpty ? '' : html)
  })
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (quillInstance && quillInstance.root.innerHTML !== newVal) {
      quillInstance.root.innerHTML = newVal || ''
    }
  },
)
</script>

<template>
  <div data-slot="text-editor-wrapper" :class="cn('w-full', props.class)">
    <p v-if="label" class="mb-2 text-sm font-medium text-foreground">
      {{ label }}
    </p>

    <div :class="cn(textEditorVariants({ size }))">
      <!-- Editor body -->
      <div :id="editorId" data-slot="editor-body" class="border-none" />

      <!-- Toolbar (bottom) -->
      <div
        :id="toolbarId"
        class="flex items-center px-4 py-2 bg-muted/30 border-t border-border gap-4"
      >
        <span class="ql-formats flex items-center gap-0.5">
          <button class="ql-bold" />
          <button class="ql-italic" />
          <button class="ql-underline" />
        </span>
        <span class="ql-formats flex items-center gap-0.5">
          <button class="ql-link" />
        </span>
        <span class="ql-formats flex items-center gap-0.5">
          <button class="ql-image" />
        </span>
        <span class="ql-formats flex items-center gap-0.5">
          <button class="ql-list" value="ordered" />
          <button class="ql-list" value="bullet" />
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.ql-container.ql-snow) {
  border: none !important;
}
:deep(.ql-snow.ql-toolbar) {
  border: none !important;
}
:deep(.ql-editor) {
  padding: 1rem;
  font-size: 0.875rem;
  line-height: 1.6;
}
:deep(.ql-editor.ql-blank::before) {
  font-style: normal;
  color: var(--muted-foreground, #9ca3af);
  left: 1rem;
}
:deep(.ql-snow.ql-toolbar button) {
  width: 26px;
  height: 26px;
  padding: 3px;
  border-radius: 4px;
  transition: all 0.15s;
}
:deep(.ql-snow.ql-toolbar button:hover) {
  background: hsl(var(--muted));
}
:deep(.ql-snow.ql-toolbar button.ql-active) {
  background: hsl(var(--primary) / 0.1);
  color: hsl(var(--primary));
}
:deep(.ql-snow.ql-toolbar button.ql-active .ql-stroke) {
  stroke: hsl(var(--primary));
}
:deep(.ql-stroke) {
  stroke: hsl(var(--muted-foreground));
}
:deep(.ql-fill) {
  fill: hsl(var(--muted-foreground));
}
</style>

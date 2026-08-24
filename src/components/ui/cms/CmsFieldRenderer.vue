<script setup lang="ts">
import type { Component } from 'vue'
/**
 * CmsFieldRenderer — Dynamic field component router.
 *
 * 1. Receives a field definition + current value + sibling values
 * 2. Evaluates `condition` (e.g. { field: "show_cta", operator: "eq", value: true })
 * 3. Hides the field if condition is not met
 * 4. Renders the correct field component based on field.type
 * 5. Shows translatable badge & required indicator
 */
import type { CmsCondition, CmsFieldDefinition, CmsFieldType } from '@/types/cms'
import { computed } from 'vue'

import CmsBooleanField from './fields/CmsBooleanField.vue'
import CmsColorField from './fields/CmsColorField.vue'
import CmsComponentField from './fields/CmsComponentField.vue'
import CmsDateField from './fields/CmsDateField.vue'
import CmsEmailField from './fields/CmsEmailField.vue'
import CmsEnumerationField from './fields/CmsEnumerationField.vue'
import CmsJsonField from './fields/CmsJsonField.vue'
import CmsMediaField from './fields/CmsMediaField.vue'
import CmsNumberField from './fields/CmsNumberField.vue'
import CmsPasswordField from './fields/CmsPasswordField.vue'
import CmsRelationField from './fields/CmsRelationField.vue'
import CmsRichTextBlocksField from './fields/CmsRichTextBlocksField.vue'
import CmsTextareaField from './fields/CmsTextareaField.vue'
import CmsTextEditorField from './fields/CmsTextEditorField.vue'
import CmsTextField from './fields/CmsTextField.vue'

const props = defineProps<{
  /** The field schema definition */
  field: CmsFieldDefinition
  /** Current field value */
  modelValue: any
  /** All sibling field values (for condition evaluation) */
  siblingValues: Record<string, any>
  /** Current locale */
  locale: string
  /** Validation error message */
  error?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

// ── Field type → Component map ───────────────────────────────────────────────
const fieldComponentMap: Record<CmsFieldType, Component> = {
  text: CmsTextField,
  textarea: CmsTextareaField,
  text_editor: CmsTextEditorField,
  number: CmsNumberField,
  boolean: CmsBooleanField,
  date: CmsDateField,
  email: CmsEmailField,
  password: CmsPasswordField,
  color: CmsColorField,
  enumeration: CmsEnumerationField,
  media: CmsMediaField,
  relation: CmsRelationField,
  component: CmsComponentField,
  json: CmsJsonField,
  rich_text_blocks: CmsRichTextBlocksField,
}

const fieldComponent = computed(() => fieldComponentMap[props.field.type] || CmsTextField)

// ── Localized label ──────────────────────────────────────────────────────────
const fieldLabel = computed(() => {
  const label = props.field.label
  if (!label)
    return props.field.key
  if (typeof label === 'string')
    return label
  // Use content locale (props.locale) so labels match the active content tab
  const contentLocale = props.locale as 'en' | 'ar'
  return label[contentLocale] || label.en || label.ar || props.field.key
})

// ── Condition evaluation ─────────────────────────────────────────────────────
function evaluateCondition(condition: CmsCondition, siblings: Record<string, any>): boolean {
  const siblingValue = siblings[condition.field]

  switch (condition.operator) {
    case 'eq':
      return siblingValue === condition.value
    case 'neq':
    case 'ne':
      return siblingValue !== condition.value
    case 'gt':
      return Number(siblingValue) > Number(condition.value)
    case 'lt':
      return Number(siblingValue) < Number(condition.value)
    case 'gte':
      return Number(siblingValue) >= Number(condition.value)
    case 'lte':
      return Number(siblingValue) <= Number(condition.value)
    case 'in':
      return Array.isArray(condition.value) && condition.value.includes(siblingValue)
    case 'not_in':
      return Array.isArray(condition.value) && !condition.value.includes(siblingValue)
    case 'contains':
      return String(siblingValue).includes(String(condition.value))
    case 'not_contains':
      return !String(siblingValue).includes(String(condition.value))
    default:
      return true
  }
}

const isVisible = computed(() => {
  if (!props.field.condition)
    return true
  return evaluateCondition(props.field.condition, props.siblingValues)
})

// ── Extra props per field type ───────────────────────────────────────────────
const extraProps = computed(() => {
  const f = props.field
  const extra: Record<string, any> = {}

  // Text fields
  if (f.min_length != null)
    extra.minLength = f.min_length
  if (f.max_length != null)
    extra.maxLength = f.max_length

  // Number
  if (f.number_type)
    extra.numberType = f.number_type
  if (f.min != null)
    extra.min = f.min
  if (f.max != null)
    extra.max = f.max

  // Date
  if (f.date_type)
    extra.dateType = f.date_type
  if (f.format)
    extra.format = f.format

  // Color
  if (f.color_format)
    extra.colorFormat = f.color_format

  // Enumeration
  if (f.options)
    extra.options = f.options

  // Media
  if (f.multiple != null)
    extra.multiple = f.multiple
  if (f.allowed_types)
    extra.allowedTypes = f.allowed_types

  // Relation
  if (f.relation_type)
    extra.relationType = f.relation_type
  if (f.model_table)
    extra.modelTable = f.model_table

  // Component
  if (f.component_ref)
    extra.componentRef = f.component_ref
  if (f.repeatable != null)
    extra.repeatable = f.repeatable

  return extra
})
</script>

<template>
  <Transition name="fade">
    <div v-if="isVisible" class="cms-field-wrapper" :dir="props.locale === 'ar' ? 'rtl' : 'ltr'">
      <component
        :is="fieldComponent"
        :model-value="modelValue"
        :label="fieldLabel"
        :field-key="field.key"
        :required="field.required"
        v-bind="extraProps"
        :class="{ 'cms-field--error': error }"
        @update:model-value="emit('update:modelValue', $event)"
      />
      <p v-if="error" class="mt-1 text-xs text-destructive flex items-center gap-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        {{ error }}
      </p>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

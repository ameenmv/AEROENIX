<script setup lang="ts">
import type { FieldTypeDefinition } from '@/config/fieldTypeRegistry'
import type { CmsConditionOperator, CmsFieldConfig, CmsSectionField } from '@/types/cms'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useQuery } from '@tanstack/vue-query'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import { Button } from '@/components/uic/button'
import { InputField } from '@/components/uic/input'
import { SelectField } from '@/components/uic/select'
import { Switch } from '@/components/uic/switch'
import { getPickerTypes } from '@/config/fieldTypeRegistry'
import { cmsConfigService } from '@/services/cmsService'

interface Props {
  open: boolean
  sectionName?: string
  editingField?: CmsSectionField | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'addField', field: CmsSectionField): void
  (e: 'updateField', payload: { field: CmsSectionField, originalKey: string }): void
}>()

const { t, locale } = useI18n()

const isRtl = computed(() => locale.value === 'ar')

// ── State ─────────────────────────────────────────────────────────────────────
const step = ref<'select' | 'configure'>('select')
const selectedType = ref<FieldTypeDefinition | null>(null)
const fieldLabel = ref({ en: '', ar: '' })
const fieldKey = ref('')
const fieldRequired = ref(false)

const fieldPrivate = ref(false)
const activeTab = ref<'basic' | 'advanced'>('basic')
const fieldKeyError = ref('')

// Media config
const mediaMultiple = ref(true)
const mediaAllowedTypes = ref<string[]>(['images', 'videos', 'documents', 'audio', 'all'])

// Number config
const numberFormat = ref<'integer' | 'float' | 'decimal'>('integer')

// Date config
const includeTime = ref(false)

// Select/Enumeration config
const selectOptions = ref<{ value: string, label: string }[]>([{ value: '', label: '' }])

// Relation config
const relationResource = ref('')
const relationType = ref<'one-to-one' | 'one-to-many'>('one-to-one')
const createAnother = ref(false)
const formKey = ref(0)

// ── Advanced settings state ───────────────────────────────────────────────────
const fieldTranslatable = ref(false)
const fieldRegexPattern = ref('')
const fieldMinLength = ref<number | undefined>(undefined)
const fieldMaxLength = ref<number | undefined>(undefined)
const fieldMin = ref<number | undefined>(undefined)
const fieldMax = ref<number | undefined>(undefined)
const mediaMinItems = ref<number | undefined>(undefined)
const mediaMaxItems = ref<number | undefined>(undefined)
const colorFormat = ref<'hex' | 'rgb' | 'hsl'>('hex')
const dateType = ref<'date' | 'datetime' | 'time'>('date')
const componentRef = ref('')
const componentRepeatable = ref(false)
const conditionEnabled = ref(false)
const conditionField = ref('')
const conditionOperator = ref<CmsConditionOperator>('eq')
const conditionValue = ref('')

const translatableTypes = ['text', 'textarea', 'text_editor', 'rich_text_blocks'] as const
const regexTypes = ['text', 'textarea'] as const
const minMaxLengthTypes = ['text', 'textarea'] as const
const maxLengthOnlyTypes = ['text_editor'] as const
const conditionOperators: CmsConditionOperator[] = ['eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'in', 'not_in', 'contains', 'not_contains']

const hasTranslatable = computed(() => translatableTypes.includes(selectedType.value?.value as any))
const hasRegex = computed(() => regexTypes.includes(selectedType.value?.value as any))
const hasMinLength = computed(() => minMaxLengthTypes.includes(selectedType.value?.value as any))
const hasMaxLength = computed(() => minMaxLengthTypes.includes(selectedType.value?.value as any) || maxLengthOnlyTypes.includes(selectedType.value?.value as any))
const hasMinMax = computed(() => selectedType.value?.value === 'number')
const hasMediaItems = computed(() => selectedType.value?.value === 'media')
const hasColorFormat = computed(() => selectedType.value?.value === 'color')
const hasDateType = computed(() => selectedType.value?.value === 'date')
const hasComponent = computed(() => selectedType.value?.value === 'component')

const pickerTypes = getPickerTypes()

const { data: relationModelsData, isLoading: isLoadingRelationModels } = useQuery({
  queryKey: ['cms-relation-models'],
  queryFn: () => cmsConfigService.getRelationModels(),
})

const dynamicResources = computed(() => {
  const data = relationModelsData.value?.data || []
  return data.map((item: any) => ({
    value: item.key,
    label: item.label,
  }))
})

// ── i18n helpers ──────────────────────────────────────────────────────────────
function typeLabel(def: FieldTypeDefinition): string {
  return t(def.labelKey, def.label)
}

function typeDescription(def: FieldTypeDefinition): string {
  return t(def.descriptionKey, def.description)
}

const mediaTypeKeys = ['images', 'videos', 'documents', 'audio', 'all'] as const

function getMediaTypeLabel(key: string): string {
  return t(`cms.media_${key}`, key)
}

function getNumberFormatLabel(fmt: string): string {
  return t(`cms.format_${fmt}`, fmt)
}

// ── Reset advanced settings helper ────────────────────────────────────────────
function resetAdvancedSettings() {
  fieldTranslatable.value = false
  fieldRegexPattern.value = ''
  fieldMinLength.value = undefined
  fieldMaxLength.value = undefined
  fieldMin.value = undefined
  fieldMax.value = undefined
  mediaMinItems.value = undefined
  mediaMaxItems.value = undefined
  colorFormat.value = 'hex'
  dateType.value = 'date'
  componentRef.value = ''
  componentRepeatable.value = false
  conditionEnabled.value = false
  conditionField.value = ''
  conditionOperator.value = 'eq'
  conditionValue.value = ''
}

// ── Reset on open/close ───────────────────────────────────────────────────────
watch(
  () => props.open,
  (val) => {
    if (val) {
      if (props.editingField) {
        step.value = 'configure'
        selectedType.value
          = pickerTypes.find((td: FieldTypeDefinition) => td.value === props.editingField!.type) ?? pickerTypes[0] ?? null
        fieldLabel.value = {
          en:
            typeof props.editingField.label === 'object'
              ? props.editingField.label.en || ''
              : String(props.editingField.label || ''),
          ar: typeof props.editingField.label === 'object' ? props.editingField.label.ar || '' : '',
        }
        fieldKey.value = props.editingField.key
        fieldRequired.value = !!props.editingField.required
        fieldPrivate.value = !!props.editingField.private
        activeTab.value = 'basic'

        const conf = props.editingField.config
        if (props.editingField.type === 'media' && conf) {
          mediaMultiple.value = conf.mediaMultiple !== false
          mediaAllowedTypes.value = conf.mediaAllowedTypes || ['images', 'videos', 'documents', 'audio', 'all']
        }
        else {
          mediaMultiple.value = true
          mediaAllowedTypes.value = ['images', 'videos', 'documents', 'audio', 'all']
        }
        if (props.editingField.type === 'number' && conf)
          numberFormat.value = conf.numberFormat || 'integer'
        else
          numberFormat.value = 'integer'
        if (props.editingField.type === 'date' && conf)
          includeTime.value = !!conf.includeTime
        else
          includeTime.value = false
        if (props.editingField.type === 'enumeration' && conf)
          selectOptions.value = conf.selectOptions || [{ value: '', label: '' }]
        else
          selectOptions.value = [{ value: '', label: '' }]
        if (props.editingField.type === 'relation' && conf) {
          relationResource.value = conf.relationResource || ''
          relationType.value = conf.relationType || 'one-to-one'
        }
        else {
          relationResource.value = ''
          relationType.value = 'one-to-one'
        }

        // Restore advanced settings from editingField
        const ef = props.editingField as any
        fieldTranslatable.value = !!(ef.translatable ?? ef.bilingual)
        fieldRegexPattern.value = ef.regex_pattern || ''
        fieldMinLength.value = ef.min_length ?? undefined
        fieldMaxLength.value = ef.max_length ?? undefined
        fieldMin.value = ef.min ?? undefined
        fieldMax.value = ef.max ?? undefined
        mediaMinItems.value = ef.min_items ?? undefined
        mediaMaxItems.value = ef.max_items ?? undefined
        colorFormat.value = ef.color_format || 'hex'
        dateType.value = ef.date_type || 'date'
        componentRef.value = ef.component_ref || ''
        componentRepeatable.value = !!ef.repeatable
        if (ef.condition) {
          conditionEnabled.value = true
          conditionField.value = ef.condition.field || ''
          conditionOperator.value = ef.condition.operator || 'eq'
          conditionValue.value = ef.condition.value ?? ''
        }
        else {
          conditionEnabled.value = false
          conditionField.value = ''
          conditionOperator.value = 'eq'
          conditionValue.value = ''
        }
      }
      else {
        step.value = 'select'
        selectedType.value = null
        fieldLabel.value = { en: '', ar: '' }
        fieldKey.value = ''
        fieldRequired.value = false
        fieldPrivate.value = false
        activeTab.value = 'basic'
        mediaMultiple.value = true
        mediaAllowedTypes.value = ['images', 'videos', 'documents', 'audio', 'all']
        numberFormat.value = 'integer'
        includeTime.value = false
        selectOptions.value = [{ value: '', label: '' }]
        relationResource.value = ''
        relationType.value = 'one-to-one'
        resetAdvancedSettings()
      }
      fieldKeyError.value = ''
    }
  },
)

watch(fieldKey, (val) => {
  if (!val) {
    fieldKeyError.value = ''
    return
  }
  const isSnakeCase = /^[a-z0-9_]+$/.test(val)
  if (!isSnakeCase) {
    fieldKeyError.value = t(
      'cms.error_key_snake_case',
      'Key must be in snake_case (lowercase letters, numbers, and underscores only)',
    )
  }
  else {
    fieldKeyError.value = ''
  }
})

const colorClasses: Record<string, { bg: string, text: string, border: string }> = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  slate: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
  teal: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
}

function getColor(color: string) {
  return colorClasses[color] || colorClasses.blue!
}

// ── Actions ──────────────────────────────────────────────────────────────────
function selectFieldType(typeDef: FieldTypeDefinition) {
  selectedType.value = typeDef
  step.value = 'configure'
}

function autoGenerateKey() {
  if (!fieldKey.value && fieldLabel.value.en) {
    fieldKey.value = fieldLabel.value.en
      .toLowerCase()
      .replace(/[^a-z0-9\s_]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
  }
}

function addSelectOption() {
  selectOptions.value.push({ value: '', label: '' })
}

function removeSelectOption(index: number) {
  selectOptions.value.splice(index, 1)
}

function toggleMediaType(type: string) {
  const idx = mediaAllowedTypes.value.indexOf(type)
  if (idx >= 0) {
    if (mediaAllowedTypes.value.length > 1) {
      mediaAllowedTypes.value.splice(idx, 1)
    }
  }
  else {
    mediaAllowedTypes.value.push(type)
  }
}

function buildConfig(): CmsFieldConfig | undefined {
  const type = selectedType.value?.value
  if (!type)
    return undefined

  if (type === 'media') {
    return {
      mediaMultiple: mediaMultiple.value,
      mediaAllowedTypes: mediaAllowedTypes.value as any,
    }
  }
  if (type === 'number') {
    return { numberFormat: numberFormat.value }
  }
  if (type === 'date') {
    return { includeTime: includeTime.value }
  }
  if (type === 'relation') {
    return {
      relationResource: relationResource.value,
      relationType: relationType.value,
    }
  }
  return undefined
}

function handleFinish() {
  if (!selectedType.value || !fieldLabel.value.en.trim() || fieldKeyError.value)
    return

  autoGenerateKey()
  // Fallback: Arabic label defaults to English if empty
  if (!fieldLabel.value.ar.trim())
    fieldLabel.value.ar = fieldLabel.value.en

  const field: CmsSectionField = {
    key: fieldKey.value,
    label: { ...fieldLabel.value },
    type: selectedType.value.value,
    required: fieldRequired.value,
    private: fieldPrivate.value,
    sortOrder: 0,
    config: buildConfig(),
  }

  // Advanced settings — attach as top-level properties for the mapper
  if (hasTranslatable.value)
    field.translatable = fieldTranslatable.value
  if (hasRegex.value && fieldRegexPattern.value)
    field.regex_pattern = fieldRegexPattern.value
  if (hasMinLength.value && fieldMinLength.value !== undefined)
    field.min_length = fieldMinLength.value
  if (hasMaxLength.value && fieldMaxLength.value !== undefined)
    field.max_length = fieldMaxLength.value
  if (hasMinMax.value) {
    if (fieldMin.value !== undefined)
      field.min = fieldMin.value
    if (fieldMax.value !== undefined)
      field.max = fieldMax.value
  }
  if (hasMediaItems.value) {
    if (mediaMinItems.value !== undefined)
      field.min_items = mediaMinItems.value
    if (mediaMaxItems.value !== undefined)
      field.max_items = mediaMaxItems.value
  }
  if (hasColorFormat.value)
    field.color_format = colorFormat.value
  if (hasDateType.value)
    field.date_type = dateType.value
  if (hasComponent.value) {
    if (componentRef.value)
      field.component_ref = componentRef.value
    field.repeatable = componentRepeatable.value
  }
  if (conditionEnabled.value && conditionField.value) {
    field.condition = {
      field: conditionField.value,
      operator: conditionOperator.value,
      value: conditionValue.value,
    }
  }

  if (selectedType.value.value === 'enumeration') {
    field.options = selectOptions.value.filter(o => o.value.trim()).map(o => o.value)
  }

  if (props.editingField) {
    emit('updateField', { field, originalKey: props.editingField.key })
    emit('update:open', false)
  }
  else {
    emit('addField', field)

    if (createAnother.value) {
      toast.success(t('cms.field_added', 'Field added successfully'))
      formKey.value++
      // Keep selectedType, just clear inputs
      fieldLabel.value = { en: '', ar: '' }
      fieldKey.value = ''
      fieldRequired.value = false
      fieldPrivate.value = false
      activeTab.value = 'basic'
      selectOptions.value = [{ value: '', label: '' }]
      relationResource.value = ''
      relationType.value = 'one-to-one'
      mediaMultiple.value = true
      mediaAllowedTypes.value = ['images', 'videos', 'documents', 'audio', 'all']
      numberFormat.value = 'integer'
      includeTime.value = false
      resetAdvancedSettings()
    }
    else {
      emit('update:open', false)
    }
  }
}

function goBack() {
  step.value = 'select'
  selectedType.value = null
}

function close() {
  emit('update:open', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="picker-overlay">
      <div
        v-if="open"
        class="fixed inset-0 z-60 flex items-center justify-center p-4"
        :dir="isRtl ? 'rtl' : 'ltr'"
      >
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close" />

        <!-- Dialog -->
        <Transition name="picker-dialog" mode="out-in">
          <div
            :key="step"
            class="picker-dialog relative z-10 w-full max-w-[720px] rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-border">
              <div class="flex items-center gap-3">
                <!-- Type icon badge (configure step) -->
                <div
                  v-if="step === 'configure' && selectedType"
                  class="w-9 h-9 rounded-lg flex items-center justify-center"
                  :class="getColor(selectedType.color).bg"
                >
                  <HugeiconsIcon
                    :icon="selectedType.icon"
                    :size="18"
                    :class="getColor(selectedType.color).text"
                  />
                </div>
                <div>
                  <h2 v-if="step === 'select'" class="text-lg font-semibold text-foreground">
                    {{ t('cms.select_field_type', 'Select a field type') }}
                  </h2>
                  <template v-else-if="selectedType">
                    <h2 class="text-lg font-semibold text-foreground">
                      {{
                        t('cms.add_new_field_title', 'Add new {type} field').replace(
                          '{type}',
                          typeLabel(selectedType),
                        )
                      }}
                    </h2>
                    <p class="text-xs text-muted-foreground mt-0.5">
                      {{ typeDescription(selectedType) }}
                    </p>
                  </template>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <!-- Tabs (configure step) -->
                <div
                  v-if="step === 'configure'"
                  class="flex items-center border-b border-transparent me-4"
                >
                  <button
                    class="px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
                    :class="
                      activeTab === 'basic'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    "
                    @click="activeTab = 'basic'"
                  >
                    {{ t('cms.basic_settings', 'BASIC SETTINGS') }}
                  </button>
                  <button
                    class="px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
                    :class="
                      activeTab === 'advanced'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    "
                    @click="activeTab = 'advanced'"
                  >
                    {{ t('cms.advanced_settings', 'ADVANCED SETTINGS') }}
                  </button>
                </div>
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  @click="close"
                >
                  <HugeiconsIcon :icon="Cancel01Icon" :size="18" />
                </button>
              </div>
            </div>

            <!-- ══════════ STEPS ══════════ -->
            <Transition name="fade" mode="out-in">
              <!-- STEP 1: Type Selection Grid -->
              <div v-if="step === 'select'" key="select" class="p-6">
                <div class="grid grid-cols-2 gap-3">
                  <button
                    v-for="typeDef in pickerTypes"
                    :key="typeDef.value"
                    class="type-card group flex items-center gap-3 p-4 rounded-lg border border-border/60 hover:border-primary/40 bg-card hover:bg-muted/30 transition-all duration-200 text-start cursor-pointer"
                    @click="selectFieldType(typeDef)"
                  >
                    <div
                      class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                      :class="getColor(typeDef.color).bg"
                    >
                      <HugeiconsIcon
                        :icon="typeDef.icon"
                        :size="20"
                        :class="getColor(typeDef.color).text"
                      />
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-foreground">
                        {{ typeLabel(typeDef) }}
                      </p>
                      <p class="text-xs text-muted-foreground leading-tight mt-0.5 truncate">
                        {{ typeDescription(typeDef) }}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <!-- STEP 2: Configuration -->
              <div
                v-else-if="step === 'configure' && selectedType"
                :key="`config-${formKey}`"
                class="p-6 space-y-5 max-h-[60vh] overflow-y-auto"
              >
                <!-- Basic Settings -->
                <template v-if="activeTab === 'basic'">
                  <!-- Label (English) -->
                  <div>
                    <label class="text-sm font-medium text-foreground mb-1.5 block">
                      {{ t('cms.label_en', 'Label (English)') }}
                      <span class="text-destructive">*</span>
                    </label>
                    <InputField
                      :model-value="fieldLabel.en"
                      :placeholder="t('cms.field_label_en_placeholder', 'e.g. Cover Image')"
                      @update:model-value="
                        (v: any) => {
                          fieldLabel.en = v
                          autoGenerateKey()
                        }
                      "
                    />
                  </div>

                  <!-- Label (Arabic) -->
                  <div>
                    <label class="text-sm font-medium text-foreground mb-1.5 block">
                      {{ t('cms.label_ar', 'Label (Arabic)') }}
                    </label>
                    <InputField
                      :model-value="fieldLabel.ar"
                      :placeholder="t('cms.field_label_ar_placeholder', 'e.g. صورة الغلاف')"
                      dir="rtl"
                      @update:model-value="(v: any) => (fieldLabel.ar = v)"
                    />
                  </div>

                  <!-- Key (auto-generated, editable) -->
                  <div>
                    <label class="text-sm font-medium text-foreground mb-1.5 block">
                      {{ t('cms.field_key', 'Key') }}
                    </label>
                    <InputField
                      v-model="fieldKey"
                      :placeholder="t('cms.field_key_placeholder', 'e.g. cover_image')"
                      dir="ltr"
                      class="font-mono"
                      :error="fieldKeyError"
                    />
                    <p class="text-xs text-muted-foreground mt-1">
                      {{
                        t(
                          'cms.key_auto_hint',
                          'Auto-generated from label. Must be snake_case, no spaces.',
                        )
                      }}
                    </p>
                  </div>

                  <!-- ═══ Type-specific: Media ═══ -->
                  <div v-if="selectedType.value === 'media'" class="space-y-4">
                    <div>
                      <label class="text-sm font-medium text-foreground mb-3 block">
                        {{ t('cms.media_type', 'Type') }}
                      </label>
                      <div class="grid grid-cols-2 gap-3">
                        <!-- Multiple media -->
                        <button
                          class="radio-card flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer text-start"
                          :class="
                            mediaMultiple
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-muted-foreground/30'
                          "
                          @click="mediaMultiple = true"
                        >
                          <div class="mt-0.5">
                            <div
                              class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                              :class="mediaMultiple ? 'border-primary' : 'border-muted-foreground/40'"
                            >
                              <div v-if="mediaMultiple" class="w-2.5 h-2.5 rounded-full bg-primary" />
                            </div>
                          </div>
                          <div>
                            <p
                              class="text-sm font-semibold"
                              :class="mediaMultiple ? 'text-primary' : 'text-foreground'"
                            >
                              {{ t('cms.multiple_media', 'Multiple media') }}
                            </p>
                            <p class="text-xs text-muted-foreground mt-0.5">
                              {{
                                t(
                                  'cms.multiple_media_desc',
                                  'Best for sliders, carousels or multiple files download',
                                )
                              }}
                            </p>
                          </div>
                        </button>
                        <!-- Single media -->
                        <button
                          class="radio-card flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer text-start"
                          :class="
                            !mediaMultiple
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-muted-foreground/30'
                          "
                          @click="mediaMultiple = false"
                        >
                          <div class="mt-0.5">
                            <div
                              class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                              :class="
                                !mediaMultiple ? 'border-primary' : 'border-muted-foreground/40'
                              "
                            >
                              <div
                                v-if="!mediaMultiple"
                                class="w-2.5 h-2.5 rounded-full bg-primary"
                              />
                            </div>
                          </div>
                          <div>
                            <p
                              class="text-sm font-semibold"
                              :class="!mediaMultiple ? 'text-primary' : 'text-foreground'"
                            >
                              {{ t('cms.single_media', 'Single media') }}
                            </p>
                            <p class="text-xs text-muted-foreground mt-0.5">
                              {{
                                t(
                                  'cms.single_media_desc',
                                  'Best for avatar, profile picture or cover',
                                )
                              }}
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>

                    <!-- Allowed types -->
                    <div>
                      <label class="text-sm font-medium text-foreground mb-2 block">
                        {{ t('cms.allowed_types', 'Allowed types') }}
                      </label>
                      <div class="flex flex-wrap gap-2">
                        <button
                          v-for="mType in mediaTypeKeys"
                          :key="mType"
                          class="px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer"
                          :class="
                            mediaAllowedTypes.includes(mType)
                              ? 'border-primary/40 bg-primary/10 text-primary'
                              : 'border-border text-muted-foreground hover:border-muted-foreground/40'
                          "
                          @click="toggleMediaType(mType)"
                        >
                          {{ getMediaTypeLabel(mType) }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- ═══ Type-specific: Number ═══ -->
                  <div v-if="selectedType.value === 'number'" class="space-y-4">
                    <div>
                      <label class="text-sm font-medium text-foreground mb-2 block">
                        {{ t('cms.number_format', 'Number format') }}
                      </label>
                      <div class="flex gap-2">
                        <button
                          v-for="fmt in ['integer', 'float', 'decimal'] as const"
                          :key="fmt"
                          class="px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all cursor-pointer"
                          :class="
                            numberFormat === fmt
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border text-muted-foreground hover:border-muted-foreground/30'
                          "
                          @click="numberFormat = fmt"
                        >
                          {{ getNumberFormatLabel(fmt) }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- ═══ Type-specific: Date ═══ -->
                  <div v-if="selectedType.value === 'date'" class="space-y-4">
                    <label class="flex items-center gap-3 cursor-pointer">
                      <Switch :checked="includeTime" @update:checked="includeTime = $event" />
                      <span class="text-sm text-foreground">
                        {{ t('cms.include_time', 'Include time (hours, minutes, seconds)') }}
                      </span>
                    </label>
                  </div>

                  <!-- ═══ Type-specific: Relation ═══ -->
                  <div v-if="selectedType.value === 'relation'" class="space-y-4">
                    <!-- Resource dropdown -->
                    <div>
                      <label class="text-sm font-medium text-foreground mb-2 block">
                        {{ t('cms.relation_resource', 'Related Resource') }}
                      </label>
                      <SelectField
                        v-model="relationResource"
                        :options="dynamicResources"
                        :placeholder="
                          isLoadingRelationModels
                            ? t('common.loading', 'Loading...')
                            : t('cms.relation_resource_placeholder', 'Select a resource...')
                        "
                        :disabled="isLoadingRelationModels"
                      />
                    </div>

                    <!-- Relation type -->
                    <div>
                      <label class="text-sm font-medium text-foreground mb-3 block">
                        {{ t('cms.relation_type', 'Relation type') }}
                      </label>
                      <div class="grid grid-cols-2 gap-3">
                        <!-- One to One -->
                        <button
                          class="radio-card flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer text-start"
                          :class="
                            relationType === 'one-to-one'
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-muted-foreground/30'
                          "
                          @click="relationType = 'one-to-one'"
                        >
                          <div class="mt-0.5">
                            <div
                              class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                              :class="
                                relationType === 'one-to-one'
                                  ? 'border-primary'
                                  : 'border-muted-foreground/40'
                              "
                            >
                              <div
                                v-if="relationType === 'one-to-one'"
                                class="w-2.5 h-2.5 rounded-full bg-primary"
                              />
                            </div>
                          </div>
                          <div>
                            <p
                              class="text-sm font-semibold"
                              :class="
                                relationType === 'one-to-one' ? 'text-primary' : 'text-foreground'
                              "
                            >
                              {{ t('cms.relation_one_to_one', 'One to One') }}
                            </p>
                            <p class="text-xs text-muted-foreground mt-0.5">
                              {{
                                t(
                                  'cms.relation_one_to_one_desc',
                                  'Link to a single item from the related resource',
                                )
                              }}
                            </p>
                          </div>
                        </button>
                        <!-- One to Many -->
                        <button
                          class="radio-card flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer text-start"
                          :class="
                            relationType === 'one-to-many'
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-muted-foreground/30'
                          "
                          @click="relationType = 'one-to-many'"
                        >
                          <div class="mt-0.5">
                            <div
                              class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                              :class="
                                relationType === 'one-to-many'
                                  ? 'border-primary'
                                  : 'border-muted-foreground/40'
                              "
                            >
                              <div
                                v-if="relationType === 'one-to-many'"
                                class="w-2.5 h-2.5 rounded-full bg-primary"
                              />
                            </div>
                          </div>
                          <div>
                            <p
                              class="text-sm font-semibold"
                              :class="
                                relationType === 'one-to-many' ? 'text-primary' : 'text-foreground'
                              "
                            >
                              {{ t('cms.relation_one_to_many', 'One to Many') }}
                            </p>
                            <p class="text-xs text-muted-foreground mt-0.5">
                              {{
                                t(
                                  'cms.relation_one_to_many_desc',
                                  'Link to multiple items from the related resource',
                                )
                              }}
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- ═══ Type-specific: Select/Enumeration ═══ -->
                  <div v-if="selectedType.value === 'enumeration'" class="space-y-3">
                    <label class="text-sm font-medium text-foreground block">
                      {{ t('cms.enum_values', 'Values') }}
                    </label>
                    <div v-for="(opt, i) in selectOptions" :key="i" class="flex items-center gap-2">
                      <InputField
                        :model-value="opt.value"
                        :placeholder="t('cms.enum_value_placeholder', 'value')"
                        class="flex-1 font-mono"
                        @update:model-value="(v: any) => (opt.value = v)"
                      />
                      <InputField
                        :model-value="opt.label"
                        :placeholder="t('cms.enum_label_placeholder', 'label')"
                        class="flex-1"
                        @update:model-value="(v: any) => (opt.label = v)"
                      />
                      <button
                        v-if="selectOptions.length > 1"
                        class="w-7 h-7 flex items-center justify-center rounded-md text-destructive/60 hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer shrink-0"
                        @click="removeSelectOption(i)"
                      >
                        ×
                      </button>
                    </div>
                    <button
                      class="text-xs text-primary hover:underline cursor-pointer"
                      @click="addSelectOption"
                    >
                      + {{ t('cms.add_option', 'Add another option') }}
                    </button>
                  </div>

                  <!-- ═══ Universal toggles (all types) ═══ -->
                  <div class="space-y-3 pt-3 border-t border-border mt-3">
                    <label class="flex items-center gap-3 cursor-pointer">
                      <Switch :checked="fieldPrivate" @update:checked="fieldPrivate = $event" />
                      <div>
                        <span class="text-sm text-foreground">{{
                          t('cms.private_field', 'Private')
                        }}</span>
                        <p class="text-[10px] text-muted-foreground">
                          {{ t('cms.private_hint', 'Hidden from public API responses') }}
                        </p>
                      </div>
                    </label>
                  </div>
                </template>

                <!-- Advanced Settings -->
                <template v-if="activeTab === 'advanced'">
                  <div class="space-y-5">
                    <!-- ═══ Translatable (text, textarea, text_editor, rich_text_blocks) ═══ -->
                    <label v-if="hasTranslatable" class="flex items-center gap-3 cursor-pointer">
                      <Switch :checked="fieldTranslatable" @update:checked="fieldTranslatable = $event" />
                      <div>
                        <span class="text-sm text-foreground">{{ t('cms.translatable', 'Translatable') }}</span>
                        <p class="text-[10px] text-muted-foreground">
                          {{ t('cms.translatable_hint', 'Content varies per locale (EN / AR)') }}
                        </p>
                      </div>
                    </label>

                    <!-- ═══ Regex Pattern (text, textarea) ═══ -->
                    <div v-if="hasRegex">
                      <label class="text-sm font-medium text-foreground mb-1.5 block">
                        {{ t('cms.regex_pattern', 'Regex Pattern') }}
                      </label>
                      <InputField
                        v-model="fieldRegexPattern"
                        :placeholder="t('cms.regex_placeholder', 'e.g. ^[A-Z]{2,}$')"
                        dir="ltr"
                        class="font-mono"
                      />
                      <p class="text-xs text-muted-foreground mt-1">
                        {{ t('cms.regex_hint', 'Custom regex the value must match (validated on save)') }}
                      </p>
                    </div>

                    <!-- ═══ Min/Max Length (text, textarea, text_editor) ═══ -->
                    <div v-if="hasMinLength || hasMaxLength" class="grid grid-cols-2 gap-4">
                      <div v-if="hasMinLength">
                        <label class="text-sm font-medium text-foreground mb-1.5 block">
                          {{ t('cms.min_length', 'Min Length') }}
                        </label>
                        <InputField
                          :model-value="fieldMinLength ?? ''"
                          type="number"
                          :placeholder="t('cms.optional', 'Optional')"
                          @update:model-value="(v: any) => fieldMinLength = v === '' ? undefined : Number(v)"
                        />
                      </div>
                      <div v-if="hasMaxLength">
                        <label class="text-sm font-medium text-foreground mb-1.5 block">
                          {{ t('cms.max_length', 'Max Length') }}
                        </label>
                        <InputField
                          :model-value="fieldMaxLength ?? ''"
                          type="number"
                          :placeholder="t('cms.optional', 'Optional')"
                          @update:model-value="(v: any) => fieldMaxLength = v === '' ? undefined : Number(v)"
                        />
                      </div>
                    </div>

                    <!-- ═══ Min/Max Value (number) ═══ -->
                    <div v-if="hasMinMax" class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="text-sm font-medium text-foreground mb-1.5 block">
                          {{ t('cms.min_value', 'Min Value') }}
                        </label>
                        <InputField
                          :model-value="fieldMin ?? ''"
                          type="number"
                          :placeholder="t('cms.optional', 'Optional')"
                          @update:model-value="(v: any) => fieldMin = v === '' ? undefined : Number(v)"
                        />
                      </div>
                      <div>
                        <label class="text-sm font-medium text-foreground mb-1.5 block">
                          {{ t('cms.max_value', 'Max Value') }}
                        </label>
                        <InputField
                          :model-value="fieldMax ?? ''"
                          type="number"
                          :placeholder="t('cms.optional', 'Optional')"
                          @update:model-value="(v: any) => fieldMax = v === '' ? undefined : Number(v)"
                        />
                      </div>
                    </div>

                    <!-- ═══ Media Min/Max Items ═══ -->
                    <div v-if="hasMediaItems" class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="text-sm font-medium text-foreground mb-1.5 block">
                          {{ t('cms.min_items', 'Min Files') }}
                        </label>
                        <InputField
                          :model-value="mediaMinItems ?? ''"
                          type="number"
                          :placeholder="t('cms.optional', 'Optional')"
                          @update:model-value="(v: any) => mediaMinItems = v === '' ? undefined : Number(v)"
                        />
                      </div>
                      <div>
                        <label class="text-sm font-medium text-foreground mb-1.5 block">
                          {{ t('cms.max_items', 'Max Files') }}
                        </label>
                        <InputField
                          :model-value="mediaMaxItems ?? ''"
                          type="number"
                          :placeholder="t('cms.optional', 'Optional')"
                          @update:model-value="(v: any) => mediaMaxItems = v === '' ? undefined : Number(v)"
                        />
                      </div>
                    </div>

                    <!-- ═══ Color Format ═══ -->
                    <div v-if="hasColorFormat">
                      <label class="text-sm font-medium text-foreground mb-2 block">
                        {{ t('cms.color_format', 'Color Format') }}
                      </label>
                      <div class="flex gap-2">
                        <button
                          v-for="fmt in ['hex', 'rgb', 'hsl'] as const"
                          :key="fmt"
                          class="px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all cursor-pointer uppercase"
                          :class="
                            colorFormat === fmt
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border text-muted-foreground hover:border-muted-foreground/30'
                          "
                          @click="colorFormat = fmt"
                        >
                          {{ fmt }}
                        </button>
                      </div>
                    </div>

                    <!-- ═══ Date Type (date, datetime, time) ═══ -->
                    <div v-if="hasDateType">
                      <label class="text-sm font-medium text-foreground mb-2 block">
                        {{ t('cms.date_type', 'Date Type') }}
                      </label>
                      <div class="flex gap-2">
                        <button
                          v-for="dt in ['date', 'datetime', 'time'] as const"
                          :key="dt"
                          class="px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all cursor-pointer"
                          :class="
                            dateType === dt
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border text-muted-foreground hover:border-muted-foreground/30'
                          "
                          @click="dateType = dt"
                        >
                          {{ t(`cms.date_type_${dt}`, dt) }}
                        </button>
                      </div>
                    </div>

                    <!-- ═══ Component Settings ═══ -->
                    <div v-if="hasComponent" class="space-y-4">
                      <div>
                        <label class="text-sm font-medium text-foreground mb-1.5 block">
                          {{ t('cms.component_ref', 'Component Reference') }}
                        </label>
                        <InputField
                          v-model="componentRef"
                          :placeholder="t('cms.component_ref_placeholder', 'e.g. faq_item')"
                          dir="ltr"
                          class="font-mono"
                        />
                        <p class="text-xs text-muted-foreground mt-1">
                          {{ t('cms.component_ref_hint', 'Key of the reusable section used as component schema') }}
                        </p>
                      </div>
                      <label class="flex items-center gap-3 cursor-pointer">
                        <Switch :checked="componentRepeatable" @update:checked="componentRepeatable = $event" />
                        <div>
                          <span class="text-sm text-foreground">{{ t('cms.repeatable', 'Repeatable') }}</span>
                          <p class="text-[10px] text-muted-foreground">
                            {{ t('cms.repeatable_hint', 'Allow multiple instances of this component') }}
                          </p>
                        </div>
                      </label>
                    </div>

                    <!-- ═══ Condition (all types) ═══ -->
                    <div class="space-y-3 pt-3 border-t border-border">
                      <label class="flex items-center gap-3 cursor-pointer">
                        <Switch :checked="conditionEnabled" @update:checked="conditionEnabled = $event" />
                        <div>
                          <span class="text-sm text-foreground">{{ t('cms.condition', 'Conditional Visibility') }}</span>
                          <p class="text-[10px] text-muted-foreground">
                            {{ t('cms.condition_hint', 'Show/hide this field based on another field\'s value') }}
                          </p>
                        </div>
                      </label>
                      <div v-if="conditionEnabled" class="space-y-3 pl-4 border-l-2 border-primary/20">
                        <div>
                          <label class="text-sm font-medium text-foreground mb-1.5 block">
                            {{ t('cms.condition_field', 'Field Key') }}
                          </label>
                          <InputField
                            v-model="conditionField"
                            :placeholder="t('cms.condition_field_placeholder', 'e.g. show_cta')"
                            dir="ltr"
                            class="font-mono"
                          />
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                          <div>
                            <label class="text-sm font-medium text-foreground mb-1.5 block">
                              {{ t('cms.condition_operator', 'Operator') }}
                            </label>
                            <SelectField
                              v-model="conditionOperator"
                              :options="conditionOperators.map(op => ({ value: op, label: op }))"
                            />
                          </div>
                          <div>
                            <label class="text-sm font-medium text-foreground mb-1.5 block">
                              {{ t('cms.condition_value', 'Value') }}
                            </label>
                            <InputField
                              v-model="conditionValue"
                              :placeholder="t('cms.condition_value_placeholder', 'e.g. true')"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </Transition>

            <!-- Footer -->
            <div
              v-if="step === 'configure'"
              class="flex items-center justify-between px-6 py-4 border-t border-border"
            >
              <label
                v-if="!editingField"
                class="flex items-center gap-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors select-none"
              >
                <input
                  v-model="createAnother"
                  type="checkbox"
                  class="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                >
                {{ t('cms.create_another', 'Create another') }}
              </label>
              <!-- spacer if editingField is true to keep buttons on right -->
              <div v-else />

              <div class="flex items-center gap-2">
                <Button variant="outline" size="sm" @click="goBack">
                  {{ t('common.cancel', 'Cancel') }}
                </Button>
                <Button size="sm" :disabled="!fieldLabel.en.trim() || !!fieldKeyError" @click="handleFinish">
                  <span v-if="editingField">{{ t('common.save', 'Save Changes') }}</span>
                  <span v-else>{{ t('cms.finish', 'Finish') }}</span>
                </Button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.picker-overlay-enter-active,
.picker-overlay-leave-active {
  transition: opacity 0.2s ease;
}
.picker-overlay-enter-from,
.picker-overlay-leave-to {
  opacity: 0;
}

.picker-dialog-enter-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.picker-dialog-leave-active {
  transition: all 0.15s ease-in;
}
.picker-dialog-enter-from {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}
.picker-dialog-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

.type-card:active {
  transform: scale(0.98);
}
</style>

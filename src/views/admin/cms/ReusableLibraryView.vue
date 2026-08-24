<script setup lang="ts">
import type { CmsFieldDefinition, CmsReusableSection } from '@/types/cms'
import {
  Cancel01Icon,
  Delete01Icon,
  Edit02Icon,
  LibrariesIcon,
  PencilEdit02Icon,
  PlusSignIcon,
  TextIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { ref, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
/**
 * ReusableLibraryView — Reusable Sections Library (Phase 5)
 *
 * DataTable listing all reusable section templates.
 * - Create, edit, delete, toggle visibility, reorder
 * - Navigate to content editor for each reusable section
 */
import FieldTypePicker from '@/components/ui/cms/FieldTypePicker.vue'
import ConfirmModal from '@/components/ui/modals/ConfirmModal.vue'
import { Badge } from '@/components/uic/badge'
import { Button } from '@/components/uic/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/uic/card'
import { InputField } from '@/components/uic/input'
import { Skeleton } from '@/components/uic/skeleton'
import { getFieldTypeDef } from '@/config/fieldTypeRegistry'
import { cmsReusableService } from '@/services/cmsService'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()

// ── State ─────────────────────────────────────────────────────────────────────
const items = ref<CmsReusableSection[]>([])
const loading = ref(true)
const toggling = ref<number | null>(null)
const deleting = ref<number | null>(null)

// ── Load ──────────────────────────────────────────────────────────────────────
async function loadData() {
  loading.value = true
  try {
    const result = await cmsReusableService.list()
    items.value = result.data

    if (route.query.edit) {
      const editId = Number(route.query.edit)
      const target = items.value.find(i => i.id === editId)
      if (target) {
        handleEdit(target)
      }
      // Remove query param so it doesn't trigger again on reload unless specifically requested
      router.replace({ query: { ...route.query, edit: undefined } })
    }
  }
  catch (err: any) {
    toast.error(t('common.error', 'Error'), { description: err.message || 'Failed to load' })
  }
  finally {
    loading.value = false
  }
}

watchEffect(() => loadData())

// ── Helpers ───────────────────────────────────────────────────────────────────
function localized(val: any): string {
  if (typeof val === 'string')
    return val
  if (!val)
    return '-'
  return val[locale.value] || val.en || val.ar || '-'
}

function mapDefinitionToPickerField(def: CmsFieldDefinition): any {
  const config: any = {}
  if (def.type === 'media') {
    config.mediaMultiple = def.multiple
    config.mediaAllowedTypes = def.allowed_types
  }
  else if (def.type === 'number') {
    config.numberFormat = def.number_type
  }
  else if (def.type === 'date') {
    config.includeTime = def.date_type === 'datetime'
  }
  else if (def.type === 'relation') {
    config.relationResource = def.model_table
    config.relationType = def.relation_type === 'one_to_many' ? 'one-to-many' : 'one-to-one'
  }
  else if (def.type === 'enumeration') {
    config.selectOptions = (def.options || []).map((o: any) => ({ value: o, label: String(o) }))
  }

  return {
    key: def.key,
    label: def.label,
    type: def.type,
    required: def.required || false,
    bilingual: def.translatable || false,
    translatable: def.translatable || false,
    private: def.private || false,
    sortOrder: 0,
    config,
    // Advanced settings for editing
    regex_pattern: def.regex_pattern,
    min_length: def.min_length,
    max_length: def.max_length,
    min: def.min,
    max: def.max,
    min_items: def.min_items,
    max_items: def.max_items,
    color_format: def.color_format,
    date_type: def.date_type,
    component_ref: def.component_ref,
    repeatable: def.repeatable,
    condition: def.condition,
  }
}

// ── Create ────────────────────────────────────────────────────────────────────
const showCreateForm = ref(false)
const showFieldPicker = ref(false)
const createSaving = ref(false)
const existingEditingField = ref<any>(null)

const newItem = ref({
  key: '',
  label: { en: '', ar: '' },
  fields: [] as any[],
})

function openCreateForm() {
  newItem.value = { key: '', label: { en: '', ar: '' }, fields: [] }
  showCreateForm.value = true
}

function cancelCreate() {
  showCreateForm.value = false
}

const sectionKeyError = ref('')
const backendKeyError = ref('')

function autoGenerateKey() {
  if (!newItem.value.key && newItem.value.label.en) {
    newItem.value.key = newItem.value.label.en
      .toLowerCase()
      .replace(/[^a-z0-9\s_]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
  }
}

watch(
  () => newItem.value.key,
  (val) => {
    backendKeyError.value = ''
    if (!val) {
      sectionKeyError.value = ''
      return
    }
    const isSnakeCase = /^[a-z0-9_]+$/.test(val)
    if (!isSnakeCase) {
      sectionKeyError.value = t(
        'cms.error_key_snake_case',
        'Key must be in snake_case (lowercase letters, numbers, and underscores only)',
      )
    }
    else {
      sectionKeyError.value = ''
    }
  },
)

/** Map FieldTypePicker output → CmsFieldDefinition (backend format) */
function mapPickerFieldToDefinition(pickerField: any): any {
  const label = pickerField.label || { en: pickerField.key, ar: pickerField.key }
  if (!label.ar)
    label.ar = label.en

  const def: any = {
    key: pickerField.key,
    label,
    type: pickerField.type,
    required: pickerField.required ?? false,
    translatable: pickerField.bilingual ?? pickerField.translatable ?? false,
    private: pickerField.private ?? false,
  }

  const config = pickerField.config
  if (config) {
    if (pickerField.type === 'media') {
      def.multiple = config.mediaMultiple
      def.allowed_types = config.mediaAllowedTypes
    }
    if (pickerField.type === 'number')
      def.number_type = config.numberFormat
    if (pickerField.type === 'date')
      def.date_type = config.includeTime ? 'datetime' : 'date'
    if (pickerField.type === 'relation') {
      def.model_table = config.relationResource
      def.relation_type = config.relationType === 'one-to-many' ? 'one_to_many' : 'one_to_one'
    }
  }
  if (pickerField.type === 'enumeration' && pickerField.options?.length) {
    def.options = pickerField.options.map((o: any) => o.value || o)
  }
  // Advanced settings
  if (pickerField.regex_pattern)
    def.regex_pattern = pickerField.regex_pattern
  if (pickerField.min_length !== undefined)
    def.min_length = pickerField.min_length
  if (pickerField.max_length !== undefined)
    def.max_length = pickerField.max_length
  if (pickerField.min !== undefined)
    def.min = pickerField.min
  if (pickerField.max !== undefined)
    def.max = pickerField.max
  if (pickerField.min_items !== undefined)
    def.min_items = pickerField.min_items
  if (pickerField.max_items !== undefined)
    def.max_items = pickerField.max_items
  if (pickerField.color_format)
    def.color_format = pickerField.color_format
  if (pickerField.date_type)
    def.date_type = pickerField.date_type
  if (pickerField.component_ref)
    def.component_ref = pickerField.component_ref
  if (pickerField.repeatable !== undefined)
    def.repeatable = pickerField.repeatable
  if (pickerField.condition)
    def.condition = pickerField.condition
  return def
}

function handleAddField(pickerField: any) {
  newItem.value.fields.push(mapPickerFieldToDefinition(pickerField))
}

function handleUpdateFieldAddForm({ field, originalKey }: { field: any, originalKey: string }) {
  const mapped = mapPickerFieldToDefinition(field)
  const idx = newItem.value.fields.findIndex(f => f.key === originalKey)
  if (idx !== -1) {
    newItem.value.fields[idx] = mapped
  }
}

function removeField(idx: number) {
  newItem.value.fields.splice(idx, 1)
}

async function handleCreate() {
  if (!newItem.value.key || !newItem.value.label.en) {
    toast.error(t('cms.missing_required', 'Key and English label are required'))
    return
  }
  if (newItem.value.fields.length === 0) {
    toast.error(t('cms.fields_required', 'At least one field is required'))
    return
  }

  createSaving.value = true
  try {
    await cmsReusableService.create({
      key: newItem.value.key,
      label: newItem.value.label,
      fields: newItem.value.fields,
      content_mode: 'shared',
    })
    toast.success(t('cms.reusable_created', 'Reusable section created'))
    showCreateForm.value = false
    await loadData()
  }
  catch (err: any) {
    if (err.response?.status === 422 && err.response?.data?.errors) {
      const errors = err.response.data.errors
      if (errors.key) {
        backendKeyError.value = t(errors.key[0], errors.key[0])
      }

      const translatedErrors: Record<string, string[]> = {}
      for (const [key, msgs] of Object.entries(errors)) {
        translatedErrors[key] = (msgs as string[]).map(m => t(m, m))
      }
      const messages = Object.values(translatedErrors).flat()
      toast.error(t('common.validation_error', 'Validation Error'), {
        description: messages.join(', '),
      })
    }
    else {
      toast.error(t('common.error', 'Error'), {
        description: err.response?.data?.message || err.message,
      })
    }
  }
  finally {
    createSaving.value = false
  }
}

// ── Toggle Visibility ─────────────────────────────────────────────────────────
async function handleToggle(item: CmsReusableSection) {
  toggling.value = item.id
  try {
    await cmsReusableService.toggle(item.id)
    item.is_hidden = !item.is_hidden

    toast.success(
      item.is_hidden
        ? t('cms.section_hidden', 'Section is now hidden')
        : t('cms.section_shown', 'Section is now visible'),
    )
    // Optimistic update: removed loadData() so the UI just updates inline without shaking
  }
  catch (err: any) {
    toast.error(t('common.error', 'Error'), {
      description: err.response?.data?.message || err.message,
    })
  }
  finally {
    toggling.value = null
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
const showDeleteConfirm = ref(false)
const deleteTarget = ref<CmsReusableSection | null>(null)

function handleDelete(item: CmsReusableSection) {
  deleteTarget.value = item
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value)
    return
  deleting.value = deleteTarget.value.id
  try {
    await cmsReusableService.delete(deleteTarget.value.id)
    toast.success(t('cms.reusable_deleted', 'Reusable section deleted'))
    showDeleteConfirm.value = false
    await loadData()
  }
  catch (err: any) {
    if (err.response?.data?.message?.includes('REUSABLE_SECTION_IN_USE')) {
      toast.error(
        t('cms.reusable_in_use', 'Cannot delete — this section is used by one or more pages'),
      )
    }
    else {
      toast.error(t('common.error', 'Error'), {
        description: err.response?.data?.message || err.message,
      })
    }
  }
  finally {
    deleting.value = null
  }
}

// ── Navigate to content editor ────────────────────────────────────────────────
function handleEditContent(item: CmsReusableSection) {
  router.push({ name: 'admin-cms-reusable-content', params: { id: item.id } })
}

// ── Edit (Inline Form) ───────────────────────────────────────────────────────
const showEditForm = ref(false)
const editSaving = ref(false)
const editItem = ref<CmsReusableSection | null>(null)
const editLabel = ref({ en: '', ar: '' })
const editFields = ref<any[]>([])
const showEditFieldPicker = ref(false)
const editFormEditingField = ref<any>(null)

function handleEdit(item: CmsReusableSection) {
  showCreateForm.value = false
  editItem.value = item
  editLabel.value = {
    en: typeof item.label === 'string' ? item.label : item.label?.en || '',
    ar: typeof item.label === 'string' ? '' : item.label?.ar || '',
  }
  editFields.value = JSON.parse(JSON.stringify(item.fields || []))
  showEditForm.value = true
}

function cancelEdit() {
  showEditForm.value = false
  editItem.value = null
}

function handleEditAddField(pickerField: any) {
  editFields.value.push(mapPickerFieldToDefinition(pickerField))
}

function handleUpdateFieldEditForm({ field, originalKey }: { field: any, originalKey: string }) {
  const mapped = mapPickerFieldToDefinition(field)
  const idx = editFields.value.findIndex((f: any) => f.key === originalKey)
  if (idx !== -1) {
    editFields.value[idx] = mapped
  }
}

function removeEditField(idx: number) {
  editFields.value.splice(idx, 1)
}

async function handleEditSave() {
  if (!editItem.value)
    return
  if (editFields.value.length === 0) {
    toast.error(t('cms.fields_required', 'At least one field is required'))
    return
  }

  editSaving.value = true
  try {
    const payload: Record<string, any> = {
      label: editLabel.value,
    }

    // Always include fields so configuration edits (like relation_type changes) are saved
    payload.fields = editFields.value.map((f: any) => {
      const clean: Record<string, any> = {
        key: f.key,
        label: { en: f.label?.en || f.key, ar: f.label?.ar || f.label?.en || f.key },
        type: f.type,
        required: f.required ?? false,
        translatable: f.translatable ?? false,
      }
      if (f.multiple !== undefined)
        clean.multiple = f.multiple
      if (f.allowed_types?.length)
        clean.allowed_types = f.allowed_types
      if (f.number_type)
        clean.number_type = f.number_type
      if (f.date_type)
        clean.date_type = f.date_type
      if (f.model_table)
        clean.model_table = f.model_table
      if (f.relation_type)
        clean.relation_type = f.relation_type
      if (f.options?.length)
        clean.options = f.options
      if (f.private)
        clean.private = f.private
      if (f.color_format)
        clean.color_format = f.color_format
      if (f.min_length !== undefined)
        clean.min_length = f.min_length
      if (f.max_length !== undefined)
        clean.max_length = f.max_length
      if (f.regex_pattern)
        clean.regex_pattern = f.regex_pattern
      if (f.component_ref)
        clean.component_ref = f.component_ref
      if (f.repeatable !== undefined)
        clean.repeatable = f.repeatable
      if (f.default !== undefined)
        clean.default = f.default
      if (f.condition)
        clean.condition = f.condition
      return clean
    })

    await cmsReusableService.update(editItem.value.id, payload)
    toast.success(t('cms.reusable_updated', 'Reusable section updated'))
    showEditForm.value = false
    editItem.value = null
    await loadData()
  }
  catch (err: any) {
    if (err.response?.status === 422 && err.response?.data?.errors) {
      const messages = Object.values(err.response.data.errors).flat() as string[]
      toast.error(t('common.validation_error', 'Validation Error'), {
        description: messages.join(', '),
      })
    }
    else {
      toast.error(t('common.error', 'Error'), {
        description: err.response?.data?.message || err.message,
      })
    }
  }
  finally {
    editSaving.value = false
  }
}

// ── Field type display ────────────────────────────────────────────────────────
const fieldTypeColors: Record<string, string> = {
  text: 'bg-blue-500/15 text-blue-500',
  textarea: 'bg-violet-500/15 text-violet-400',
  text_editor: 'bg-purple-500/15 text-purple-500',
  number: 'bg-rose-500/15 text-rose-500',
  boolean: 'bg-emerald-500/15 text-emerald-500',
  date: 'bg-amber-500/15 text-amber-500',
  email: 'bg-orange-500/15 text-orange-500',
  password: 'bg-red-500/15 text-red-500',
  color: 'bg-pink-500/15 text-pink-500',
  enumeration: 'bg-teal-500/15 text-teal-500',
  media: 'bg-pink-500/15 text-pink-500',
  relation: 'bg-indigo-500/15 text-indigo-500',
  component: 'bg-cyan-500/15 text-cyan-500',
  json: 'bg-slate-500/15 text-slate-400',
  rich_text_blocks: 'bg-fuchsia-500/15 text-fuchsia-500',
}

function getFieldTypeLabel(type: string): string {
  return getFieldTypeDef(type as any)?.label || type
}
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto pb-20">
    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <Skeleton class="h-12 w-64" />
      <Skeleton class="h-24 w-full" />
      <Skeleton class="h-24 w-full" />
      <Skeleton class="h-24 w-full" />
    </div>

    <template v-else>
      <!-- Header -->
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="flex items-center gap-2">
            <HugeiconsIcon :icon="LibrariesIcon" :size="24" class="text-primary" />
            <h1 class="text-2xl font-semibold text-foreground">
              {{ t('cms.reusable_library', 'Reusable Sections Library') }}
            </h1>
          </div>
          <p class="text-sm text-muted-foreground mt-1">
            {{
              t(
                'cms.reusable_library_desc',
                'Create reusable section templates that can be shared across multiple pages.',
              )
            }}
          </p>
        </div>
        <Button :disabled="showCreateForm" @click="openCreateForm">
          <HugeiconsIcon :icon="PlusSignIcon" :size="16" />
          {{ t('cms.new_reusable', 'New Reusable Section') }}
        </Button>
      </div>

      <!-- Empty State -->
      <Card v-if="items.length === 0 && !showCreateForm" class="border-dashed">
        <CardContent class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
            <HugeiconsIcon :icon="LibrariesIcon" :size="28" class="text-purple-500" />
          </div>
          <h3 class="text-lg font-semibold text-foreground mb-1">
            {{ t('cms.no_reusable', 'No reusable sections yet') }}
          </h3>
          <p class="text-sm text-muted-foreground mb-4 max-w-sm">
            {{
              t(
                'cms.no_reusable_desc',
                'Create reusable section templates to share consistent content blocks across your pages.',
              )
            }}
          </p>
          <Button @click="openCreateForm">
            <HugeiconsIcon :icon="PlusSignIcon" :size="16" />
            {{ t('cms.create_first_reusable', 'Create First Reusable Section') }}
          </Button>
        </CardContent>
      </Card>

      <!-- Items List -->
      <div v-if="items.length > 0" class="space-y-3">
        <template v-for="item in items" :key="item.id">
          <Card
            class="overflow-hidden transition-all duration-200"
            :class="[
              item.is_hidden ? 'opacity-60 border-border/50' : 'border-border',
              toggling === item.id || deleting === item.id ? 'pointer-events-none' : '',
            ]"
          >
            <CardHeader class="py-3 px-4">
              <div class="flex items-center justify-between gap-3">
                <!-- Left: Label + Key + Badges -->
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="w-9 h-9 flex items-center justify-center rounded-lg bg-purple-500/10 shrink-0"
                  >
                    <HugeiconsIcon :icon="LibrariesIcon" :size="16" class="text-purple-500" />
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-foreground truncate">
                        {{ localized(item.label) }}
                      </span>
                      <Badge v-if="item.is_hidden" variant="secondary" class="text-[10px] shrink-0">
                        {{ t('cms.hidden', 'Hidden') }}
                      </Badge>
                    </div>
                    <div class="flex items-center gap-2 mt-0.5">
                      <code class="text-[10px] text-muted-foreground font-mono">{{
                        item.key
                      }}</code>
                      <span class="text-[10px] text-muted-foreground">{{
                        $t('common.separator', '·')
                      }}</span>
                      <span class="text-[10px] text-muted-foreground">
                        {{ (item.fields || []).length }} {{ t('cms.fields', 'fields') }}
                      </span>
                      <span
                        v-if="item.pages_count != null"
                        class="text-[10px] text-muted-foreground"
                      >
                        {{ $t('common.separator', '·') }} {{ item.pages_count }}
                        {{ t('cms.pages_using', 'pages') }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Right: Actions -->
                <div class="flex items-center gap-1 shrink-0">
                  <!-- Edit Content -->
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-7 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                    :title="
                      (item as any).can_update === false
                        ? t('common.action_restricted', 'Action restricted')
                        : ''
                    "
                    :disabled="(item as any).can_update === false"
                    @click="handleEditContent(item)"
                  >
                    <HugeiconsIcon :icon="TextIcon" :size="12" />
                    {{ t('cms.content', 'Content') }}
                  </Button>

                  <!-- Edit Schema -->
                  <button
                    :title="
                      (item as any).can_update === false
                        ? t('common.action_restricted', 'Action restricted')
                        : t('actions.edit', 'Edit')
                    "
                    class="w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    :disabled="(item as any).can_update === false"
                    @click="handleEdit(item)"
                  >
                    <HugeiconsIcon :icon="Edit02Icon" :size="14" />
                  </button>

                  <!-- Toggle -->
                  <button
                    class="flex items-center justify-center cursor-pointer group/toggle mx-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    :title="
                      (item as any).can_toggle === false
                        ? t('common.action_restricted', 'Action restricted')
                        : item.is_hidden
                          ? t('cms.show_section', 'Show Section')
                          : t('cms.hide_section', 'Hide Section')
                    "
                    :disabled="toggling === item.id || (item as any).can_toggle === false"
                    @click="handleToggle(item)"
                  >
                    <span
                      class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border shadow-inner transition-colors"
                      :class="[
                        !item.is_hidden
                          ? 'bg-primary border-primary'
                          : 'bg-muted border-border dark:bg-input/80 dark:border-transparent',
                        toggling === item.id
                          ? 'opacity-50 animate-pulse'
                          : 'group-hover/toggle:opacity-80',
                      ]"
                    >
                      <span
                        class="pointer-events-none block size-4 rounded-full bg-white dark:bg-background shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-transform ring-1 ring-black/5"
                        :class="[
                          !item.is_hidden
                            ? locale === 'ar'
                              ? '-translate-x-[calc(100%-2px)]'
                              : 'translate-x-[calc(100%-2px)]'
                            : 'translate-x-0',
                        ]"
                      />
                    </span>
                  </button>

                  <!-- Delete -->
                  <button
                    :title="
                      (item as any).can_delete === false
                        ? t('common.action_restricted', 'Action restricted')
                        : t('actions.delete', 'Delete')
                    "
                    class="w-7 h-7 flex items-center justify-center rounded-full text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    :class="deleting === item.id ? 'animate-pulse' : ''"
                    :disabled="(item as any).can_delete === false"
                    @click="handleDelete(item)"
                  >
                    <HugeiconsIcon :icon="Delete01Icon" :size="14" />
                  </button>
                </div>
              </div>
            </CardHeader>

            <!-- Expandable field preview -->
            <CardContent class="pt-0 px-4 pb-3">
              <div class="flex flex-wrap gap-1.5">
                <Badge
                  v-for="field in (item.fields || []).slice(0, 8)"
                  :key="field.key"
                  :class="fieldTypeColors[field.type] || 'bg-gray-500/15 text-gray-400'"
                  class="text-[10px] font-mono px-1.5 py-0.5"
                >
                  {{ field.key }}
                </Badge>
                <Badge
                  v-if="(item.fields || []).length > 8"
                  variant="secondary"
                  class="text-[10px]"
                >
                  {{
                    t('cms.more_fields', '+{count} more').replace(
                      '{count}',
                      String((item.fields || []).length - 8),
                    )
                  }}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <!-- Inline Edit Form (below the card being edited) -->
          <Transition name="slide-fade">
            <Card
              v-if="showEditForm && editItem?.id === item.id"
              class="border-amber-500/30 bg-amber-500/5 mt-0! rounded-t-none border-t-0"
            >
              <CardHeader class="pb-3">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-base font-semibold text-foreground flex items-center gap-2">
                      {{ t('cms.edit_section', 'Edit Section') }}
                      <code
                        class="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded"
                      >{{ editItem.key }}</code>
                    </h3>
                    <p class="text-sm text-muted-foreground mt-0.5">
                      {{
                        t(
                          'cms.edit_reusable_desc',
                          'Update labels and manage fields for this reusable section.',
                        )
                      }}
                    </p>
                  </div>
                  <button
                    class="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                    @click="cancelEdit"
                  >
                    <HugeiconsIcon :icon="Cancel01Icon" :size="16" />
                  </button>
                </div>
              </CardHeader>
              <CardContent class="space-y-5">
                <!-- Labels -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4" dir="ltr">
                  <InputField
                    v-model="editLabel.en"
                    :label="t('cms.label_en', 'Label (English)')"
                    required
                  />
                  <InputField
                    v-model="editLabel.ar"
                    :label="t('cms.label_ar', 'Label (Arabic)')"
                    dir="rtl"
                  />
                </div>

                <!-- Fields -->
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <label class="text-sm font-medium text-foreground">
                      {{ t('cms.fields', 'Fields') }}
                      <span class="text-destructive">*</span>
                      <span class="text-xs text-muted-foreground ml-1">({{ editFields.length }})</span>
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      class="text-xs h-7"
                      @click="showEditFieldPicker = true"
                    >
                      <HugeiconsIcon :icon="PlusSignIcon" :size="12" />
                      {{ t('cms.add_field', 'Add Field') }}
                    </Button>
                  </div>

                  <div
                    v-if="editFields.length === 0"
                    class="border border-dashed border-border rounded-lg p-6 text-center"
                  >
                    <p class="text-sm text-muted-foreground">
                      {{ t('cms.no_fields_yet', 'No fields yet.') }}
                    </p>
                  </div>

                  <div v-else class="space-y-1.5">
                    <div
                      v-for="(field, fIdx) in editFields"
                      :key="field.key"
                      class="flex items-center gap-2.5 text-sm py-2 px-3 rounded-lg bg-card border border-border/60 group hover:border-border transition-colors"
                    >
                      <Badge
                        :class="fieldTypeColors[field.type] || 'bg-gray-500/15 text-gray-400'"
                        class="text-[10px] font-mono px-1.5 py-0.5 shrink-0"
                      >
                        {{ getFieldTypeLabel(field.type) }}
                      </Badge>
                      <span class="font-medium text-foreground truncate">{{
                        field.label?.en || field.key
                      }}</span>
                      <code class="text-[10px] text-muted-foreground font-mono">{{
                        field.key
                      }}</code>
                      <span v-if="field.required" class="text-destructive font-bold shrink-0">*</span>
                      <Badge
                        v-if="field.translatable"
                        variant="outline"
                        class="text-[9px] border-sky-500/30 text-sky-500 shrink-0"
                      >
                        {{ $t('cms.translatable', 'i18n') }}
                      </Badge>
                      <div class="ms-auto flex items-center gap-1.5 transition-opacity">
                        <button
                          class="w-7 h-7 flex items-center justify-center rounded-md text-sky-500/60 hover:text-sky-500 hover:bg-sky-500/10 transition-colors shrink-0 cursor-pointer"
                          :title="t('actions.edit', 'Edit')"
                          @click="
                            editFormEditingField = mapDefinitionToPickerField(field)
                            showEditFieldPicker = true
                          "
                        >
                          <HugeiconsIcon :icon="PencilEdit02Icon" :size="14" />
                        </button>
                        <button
                          class="w-7 h-7 flex items-center justify-center rounded-md text-destructive/40 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 cursor-pointer"
                          @click="removeEditField(fIdx)"
                        >
                          <HugeiconsIcon :icon="Cancel01Icon" :size="14" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-end gap-3 pt-2 border-t border-border/50">
                  <Button variant="outline" @click="cancelEdit">
                    {{ t('common.cancel', 'Cancel') }}
                  </Button>
                  <Button
                    :loading="editSaving"
                    :disabled="editSaving || editFields.length === 0"
                    @click="handleEditSave"
                  >
                    {{ t('common.save', 'Save Changes') }}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Transition>
        </template>
      </div>

      <!-- ── Inline Create Form ──────────────────────────────────────────── -->
      <Transition name="slide-fade">
        <Card v-if="showCreateForm" class="mt-4 border-purple-500/30 bg-purple-500/5">
          <CardHeader class="pb-3">
            <div class="flex items-center justify-between">
              <div>
                <CardTitle class="text-lg">
                  {{ t('cms.new_reusable', 'New Reusable Section') }}
                </CardTitle>
                <p class="text-sm text-muted-foreground mt-0.5">
                  {{
                    t(
                      'cms.new_reusable_desc',
                      'Define a reusable section template with its field schema.',
                    )
                  }}
                </p>
              </div>
              <button
                class="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                @click="cancelCreate"
              >
                ×
              </button>
            </div>
          </CardHeader>
          <CardContent class="space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4" dir="ltr">
              <InputField
                v-model="newItem.label.en"
                :label="t('cms.label_en', 'Label (English)')"
                :placeholder="$t('cms.placeholder_faq_section', 'e.g. FAQ Section')"
                required
                @blur="autoGenerateKey"
              />
              <InputField
                v-model="newItem.label.ar"
                :label="t('cms.label_ar', 'Label (Arabic)')"
                :placeholder="$t('cms.placeholder_faq_section_ar', 'e.g. قسم الأسئلة الشائعة')"
                dir="rtl"
              />
            </div>

            <div class="max-w-sm">
              <InputField
                v-model="newItem.key"
                :label="t('cms.section_key', 'Section Key')"
                :placeholder="$t('cms.placeholder_faq_key', 'e.g. faq_section')"
                required
                class="font-mono"
                :error="sectionKeyError || backendKeyError"
              />
            </div>

            <!-- Fields -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <label class="text-sm font-medium text-foreground">
                  {{ t('cms.fields', 'Fields') }} <span class="text-destructive">*</span>
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  class="text-xs h-7"
                  @click="showFieldPicker = true"
                >
                  <HugeiconsIcon :icon="PlusSignIcon" :size="12" />
                  {{ t('cms.add_field', 'Add Field') }}
                </Button>
              </div>

              <div
                v-if="newItem.fields.length === 0"
                class="border border-dashed border-border rounded-lg p-6 text-center"
              >
                <p class="text-sm text-muted-foreground">
                  {{ t('cms.no_fields_yet', 'No fields yet.') }}
                </p>
              </div>

              <div v-else class="space-y-1.5">
                <div
                  v-for="(field, idx) in newItem.fields"
                  :key="field.key"
                  class="flex items-center gap-2.5 text-sm py-2 px-3 rounded-lg bg-card border border-border/60 group hover:border-border transition-colors"
                >
                  <Badge
                    :class="fieldTypeColors[field.type] || 'bg-gray-500/15 text-gray-400'"
                    class="text-[10px] font-mono px-1.5 py-0.5 shrink-0"
                  >
                    {{ getFieldTypeLabel(field.type) }}
                  </Badge>
                  <span class="font-medium text-foreground truncate">{{
                    field.label?.en || field.key
                  }}</span>
                  <code class="text-[10px] text-muted-foreground font-mono">{{ field.key }}</code>
                  <span v-if="field.required" class="text-destructive font-bold shrink-0">*</span>
                  <div class="ms-auto flex items-center gap-1.5 transition-opacity">
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded-md text-sky-500/60 hover:text-sky-500 hover:bg-sky-500/10 transition-colors shrink-0 cursor-pointer"
                      :title="t('actions.edit', 'Edit')"
                      @click="
                        existingEditingField = mapDefinitionToPickerField(field)
                        showFieldPicker = true
                      "
                    >
                      <HugeiconsIcon :icon="PencilEdit02Icon" :size="14" />
                    </button>
                    <button
                      class="w-7 h-7 flex items-center justify-center rounded-md text-destructive/40 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 cursor-pointer"
                      @click="removeField(idx)"
                    >
                      <HugeiconsIcon :icon="Cancel01Icon" :size="14" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2 border-t border-border/50">
              <Button variant="outline" @click="cancelCreate">
                {{ t('common.cancel', 'Cancel') }}
              </Button>
              <Button
                :loading="createSaving"
                :disabled="
                  createSaving
                    || newItem.fields.length === 0
                    || !newItem.label.en.trim()
                    || !newItem.key.trim()
                    || !!sectionKeyError
                "
                @click="handleCreate"
              >
                {{ t('cms.create_reusable', 'Create Reusable Section') }}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Transition>

      <!-- Field Type Picker for CREATE -->
      <FieldTypePicker
        :open="showFieldPicker"
        :section-name="newItem.label.en"
        :editing-field="existingEditingField"
        @update:open="
          (val) => {
            showFieldPicker = val
            if (!val) existingEditingField = null
          }
        "
        @add-field="handleAddField"
        @update-field="handleUpdateFieldAddForm"
      />

      <!-- Field Type Picker for EDIT -->
      <FieldTypePicker
        :open="showEditFieldPicker"
        :section-name="editItem?.label?.en || ''"
        :editing-field="editFormEditingField"
        @update:open="
          (val) => {
            showEditFieldPicker = val
            if (!val) editFormEditingField = null
          }
        "
        @add-field="handleEditAddField"
        @update-field="handleUpdateFieldEditForm"
      />

      <!-- Summary -->
      <div v-if="items.length > 0" class="mt-4 flex items-center pt-3 border-t border-border/50">
        <p class="text-sm text-muted-foreground">
          {{ items.length }} {{ t('cms.reusable_sections', 'reusable sections') }}
          {{ $t('common.separator', '·') }} {{ items.filter((i) => !i.is_hidden).length }}
          {{ t('cms.visible', 'visible') }}
        </p>
      </div>
    </template>

    <!-- Delete Confirmation -->
    <ConfirmModal
      :show="showDeleteConfirm"
      :title="t('cms.delete_reusable_title', 'Delete Reusable Section')"
      :message="
        t(
          'cms.delete_reusable_msg',
          'Are you sure? Pages referencing this section will lose their shared content.',
        )
      "
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

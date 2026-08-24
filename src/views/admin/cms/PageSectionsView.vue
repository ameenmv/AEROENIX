<script setup lang="ts">
import type {
  CmsFieldDefinition,
  CmsReusableSection,
  CmsSection,
  CreateInlineSectionPayload,
} from '@/types/cms'
import {
  ArrowLeft02Icon,
  Cancel01Icon,
  LayoutLeftIcon,
  LibrariesIcon,
  PencilEdit02Icon,
  PlusSignIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed, nextTick, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import draggable from 'vuedraggable'
import FieldTypePicker from '@/components/ui/cms/FieldTypePicker.vue'
import SectionCard from '@/components/ui/cms/SectionCard.vue'
import ConfirmModal from '@/components/ui/modals/ConfirmModal.vue'
import { Badge } from '@/components/uic/badge'
import { Button } from '@/components/uic/button'
import { Card, CardContent, CardHeader } from '@/components/uic/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/uic/dialog'
import { InputField } from '@/components/uic/input'
import { Skeleton } from '@/components/uic/skeleton'
import { getFieldTypeDef } from '@/config/fieldTypeRegistry'
import { cmsPageService, cmsReusableService, cmsSectionService } from '@/services/cmsService'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

// ── Route params ──────────────────────────────────────────────────────────────
const pageId = computed(() => Number(route.params.id))

// ── State ─────────────────────────────────────────────────────────────────────
const pageName = ref('')
const sections = ref<CmsSection[]>([])
const loading = ref(true)
const toggling = ref<number | null>(null)
const deleting = ref<number | null>(null)
const togglingRepeatable = ref<number | null>(null)

// ── Load page and sections ────────────────────────────────────────────────────
async function loadData() {
  loading.value = true
  try {
    const page = await cmsPageService.get(pageId.value)
    pageName.value
      = typeof page.title === 'string'
        ? page.title
        : (page.title as any)?.[locale.value] || (page.title as any)?.en || ''

    // Always fetch sections from the dedicated endpoint to ensure proper IDs
    const result = await cmsSectionService.list(pageId.value)
    sections.value = result.data.sort(
      (a: CmsSection, b: CmsSection) => (a.order ?? 0) - (b.order ?? 0),
    )
  }
  catch (err: any) {
    toast.error(t('common.error', 'Error'), { description: err.message || 'Failed to load page' })
  }
  finally {
    loading.value = false
  }
}

watchEffect(() => {
  if (pageId.value)
    loadData()
})

// ── Add Section (Inline Form) ─────────────────────────────────────────────────
const showAddForm = ref(false)
const addSaving = ref(false)
const showFieldPicker = ref(false)
const existingEditingField = ref<any>(null)
const editFormEditingField = ref<any>(null)
const addFormRef = ref<HTMLElement | null>(null)
const sectionKeyError = ref('')
const backendKeyError = ref('')

const newSection = ref({
  key: '',
  label: { en: '', ar: '' },
  fields: [] as CmsFieldDefinition[],
  is_repeatable: false,
})

function openAddForm() {
  newSection.value = { key: '', label: { en: '', ar: '' }, fields: [], is_repeatable: false }
  showAddForm.value = true
  nextTick(() => {
    addFormRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

function cancelAddForm() {
  showAddForm.value = false
  newSection.value = { key: '', label: { en: '', ar: '' }, fields: [], is_repeatable: false }
}

function autoGenerateKey() {
  if (!newSection.value.key && newSection.value.label.en) {
    newSection.value.key = newSection.value.label.en
      .toLowerCase()
      .replace(/[^a-z0-9\s_]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
  }
}

watch(
  () => newSection.value.key,
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

/** Map FieldTypePicker output → CmsFieldDefinition */
function mapPickerFieldToDefinition(pickerField: any): CmsFieldDefinition {
  // Default Arabic label to English if not provided (backend requires both)
  const label = pickerField.label || { en: pickerField.key, ar: pickerField.key }
  if (!label.ar)
    label.ar = label.en

  const def: CmsFieldDefinition = {
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
    if (pickerField.type === 'number') {
      def.number_type = config.numberFormat
    }
    if (pickerField.type === 'date') {
      def.date_type = config.includeTime ? 'datetime' : 'date'
    }
    if (pickerField.type === 'relation') {
      def.model_table = config.relationResource
      def.relation_type = config.relationType === 'one-to-many' ? 'one_to_many' : 'one_to_one'
    }
  }
  if (pickerField.type === 'enumeration' && pickerField.options?.length) {
    def.options = pickerField.options.map((o: any) => o.value || o)
  }
  // Advanced settings (passed as top-level properties from FieldTypePicker)
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
    config.selectOptions = (def.options || []).map(o => ({ value: o, label: String(o) }))
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

function handleAddField(pickerField: any) {
  const mapped = mapPickerFieldToDefinition(pickerField)
  newSection.value.fields.push(mapped)
}

function handleUpdateFieldAddForm({ field, originalKey }: { field: any, originalKey: string }) {
  const mapped = mapPickerFieldToDefinition(field)
  const idx = newSection.value.fields.findIndex(f => f.key === originalKey)
  if (idx !== -1) {
    newSection.value.fields[idx] = mapped
  }
}

function removeField(index: number) {
  newSection.value.fields.splice(index, 1)
}

async function handleCreateSection() {
  if (!newSection.value.key || !newSection.value.label.en) {
    toast.error(t('cms.missing_required', 'Key and English label are required'))
    return
  }
  if (newSection.value.fields.length === 0) {
    toast.error(t('cms.fields_required', 'At least one field is required to create a section'))
    return
  }

  addSaving.value = true
  try {
    const payload: CreateInlineSectionPayload = {
      page_id: pageId.value,
      key: newSection.value.key,
      label: newSection.value.label,
      order: sections.value.length,
      fields: newSection.value.fields,
      is_repeatable: newSection.value.is_repeatable,
    }
    await cmsSectionService.createInline(pageId.value, payload)
    toast.success(t('cms.section_created', 'Section created successfully'))
    showAddForm.value = false
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
        description: err.response?.data?.message || err.message || 'Failed to create section',
      })
    }
  }
  finally {
    addSaving.value = false
  }
}

// ── Edit Section (Inline Form) ────────────────────────────────────────────────
const showEditForm = ref(false)
const editSaving = ref(false)
const editSection = ref<CmsSection | null>(null)
const editLabel = ref({ en: '', ar: '' })
const editFields = ref<CmsFieldDefinition[]>([])
const editIsRepeatable = ref(false)
const showEditFieldPicker = ref(false)
const editFormRef = ref<HTMLElement | null>(null)

const showEditReusableConfirm = ref(false)

function handleEdit(section: CmsSection) {
  // Close add form if open
  showAddForm.value = false

  editSection.value = section
  editLabel.value = {
    en: typeof section.label === 'string' ? section.label : section.label?.en || '',
    ar: typeof section.label === 'string' ? '' : section.label?.ar || '',
  }
  editFields.value = JSON.parse(JSON.stringify(section.fields || []))
  editIsRepeatable.value = section.is_repeatable ?? false
  showEditForm.value = true
  nextTick(() => {
    editFormRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

function cancelEditForm() {
  showEditForm.value = false
  editSection.value = null
}

function handleEditAddField(pickerField: any) {
  editFields.value.push(mapPickerFieldToDefinition(pickerField))
}

function handleUpdateFieldEditForm({ field, originalKey }: { field: any, originalKey: string }) {
  const mapped = mapPickerFieldToDefinition(field)
  const idx = editFields.value.findIndex(f => f.key === originalKey)
  if (idx !== -1) {
    editFields.value[idx] = mapped
  }
}

function removeEditField(idx: number) {
  editFields.value.splice(idx, 1)
}

function handleEditSave() {
  if (!editSection.value)
    return
  if (!editSection.value.id) {
    console.error('[CMS] Section missing ID:', editSection.value)
    toast.error('Section ID is missing. Try refreshing the page.')
    return
  }
  if (editFields.value.length === 0) {
    toast.error(t('cms.fields_required', 'At least one field is required'))
    return
  }

  if (editSection.value.is_reusable) {
    showEditReusableConfirm.value = true
    return
  }

  executeEditSave()
}

async function executeEditSave() {
  showEditReusableConfirm.value = false
  editSaving.value = true
  try {
    // Per backend API: update only sends label (and optionally order)
    const payload: Record<string, any> = {
      label: editLabel.value,
      is_repeatable: editIsRepeatable.value,
    }

    // Always include fields so configuration edits (like relation_type changes) are saved
    payload.fields = editFields.value.map((f) => {
      const clean: Record<string, any> = {
        key: f.key,
        label: {
          en: f.label?.en || f.key,
          ar: f.label?.ar || f.label?.en || f.key,
        },
        type: f.type,
        required: f.required ?? false,
        translatable: f.translatable ?? false,
        private: f.private ?? false,
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
      if (f.color_format)
        clean.color_format = f.color_format
      if (f.min_items !== undefined)
        clean.min_items = f.min_items
      if (f.max_items !== undefined)
        clean.max_items = f.max_items
      if (f.min !== undefined)
        clean.min = f.min
      if (f.max !== undefined)
        clean.max = f.max
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

    await cmsSectionService.update(pageId.value, editSection.value!.id, payload)
    toast.success(t('cms.section_updated', 'Section updated'))
    showEditForm.value = false
    editSection.value = null
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

// ── Delete Section ────────────────────────────────────────────────────────────
const showDeleteConfirm = ref(false)
const deleteTarget = ref<CmsSection | null>(null)

function handleDelete(section: CmsSection) {
  deleteTarget.value = section
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value)
    return
  deleting.value = deleteTarget.value.id
  try {
    await cmsSectionService.delete(pageId.value, deleteTarget.value.id)
    toast.success(t('cms.section_deleted', 'Section deleted'))
    showDeleteConfirm.value = false
    await loadData()
  }
  catch (err: any) {
    toast.error(t('common.error', 'Error'), {
      description: err.response?.data?.message || err.message,
    })
  }
  finally {
    deleting.value = null
  }
}

// ── Toggle Visibility ─────────────────────────────────────────────────────────
async function handleToggle(section: CmsSection) {
  const previousState = section.is_hidden
  // Optimistic update
  section.is_hidden = !previousState

  toggling.value = section.id
  try {
    await cmsSectionService.toggle(section.id)
    toast.success(
      section.is_hidden
        ? t('cms.section_hidden', 'Section is now hidden')
        : t('cms.section_shown', 'Section is now visible'),
    )
  }
  catch (err: any) {
    // Revert on error
    section.is_hidden = previousState
    toast.error(t('common.error', 'Error'), {
      description: err.response?.data?.message || err.message,
    })
  }
  finally {
    toggling.value = null
  }
}

// ── Toggle Repeatable ─────────────────────────────────────────────────────────
async function handleToggleRepeatable(section: CmsSection) {
  const previousState = section.is_repeatable ?? false
  // Optimistic update
  section.is_repeatable = !previousState

  togglingRepeatable.value = section.id
  try {
    await cmsSectionService.update(pageId.value, section.id, {
      is_repeatable: !previousState,
    })
    toast.success(
      !previousState
        ? t('cms.repeatable_enabled', 'Section is now repeatable')
        : t('cms.repeatable_disabled', 'Section is no longer repeatable'),
    )
  }
  catch (err: any) {
    // Revert on error
    section.is_repeatable = previousState
    toast.error(t('common.error', 'Error'), {
      description: err.response?.data?.message || err.message,
    })
  }
  finally {
    togglingRepeatable.value = null
  }
}

// ── Reorder (drag-and-drop) ───────────────────────────────────────────────────
async function onDragEnd() {
  // After drag, sections.value is already in the new order (vuedraggable mutates the array)
  const items = sections.value.map((s, i) => ({ id: s.id, order: i }))
  try {
    await cmsSectionService.reorder({ items })
    toast.success(t('cms.reordered', 'Sections reordered'))
  }
  catch (err: any) {
    toast.error(t('common.error', 'Error'), {
      description: err.response?.data?.message || err.message,
    })
    await loadData() // rollback on error
  }
}

// ── Navigation ────────────────────────────────────────────────────────────────
function handleBack() {
  router.push({ name: 'admin-cms' })
}

function handleEditMetadata() {
  router.push({ name: 'admin-cms-edit', params: { id: pageId.value } })
}

function handleEditContent() {
  router.push({ name: 'admin-cms-content', params: { id: pageId.value } })
}

// ── Import from Library ───────────────────────────────────────────────────────
const showImportDialog = ref(false)
const libraryItems = ref<CmsReusableSection[]>([])
const loadingLibrary = ref(false)
const importingId = ref<number | null>(null)

async function openImportDialog() {
  showImportDialog.value = true
  loadingLibrary.value = true
  try {
    const result = await cmsReusableService.list()
    libraryItems.value = result.data
  }
  catch (err: any) {
    toast.error(t('common.error', 'Error'), {
      description: err.message || 'Failed to load library',
    })
  }
  finally {
    loadingLibrary.value = false
  }
}

async function handleImportReusable(item: CmsReusableSection) {
  importingId.value = item.id
  try {
    await cmsSectionService.createReusableRef(pageId.value, {
      page_id: pageId.value,
      key: item.key,
      label: item.label,
      order: sections.value.length,
      reusable_section_id: item.id,
    })
    toast.success(t('cms.reusable_imported', 'Reusable section imported'))
    showImportDialog.value = false
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
    importingId.value = null
  }
}

// ── Field type display helpers ────────────────────────────────────────────────
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
  const def = getFieldTypeDef(type as any)
  return def?.label || type
}
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto pb-20">
    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <Skeleton class="h-12 w-64" />
      <Skeleton class="h-32 w-full" />
      <Skeleton class="h-32 w-full" />
    </div>

    <template v-else>
      <!-- Header -->
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <button
            class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            @click="handleBack"
          >
            <HugeiconsIcon :icon="ArrowLeft02Icon" :size="18" />
          </button>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-semibold text-foreground">
                {{ pageName || $t('cms.page_sections', 'Page Sections') }}
              </h1>
              <Badge variant="outline" class="text-xs uppercase tracking-wider">
                {{ $t('cms.structure', 'Structure') }}
              </Badge>
            </div>
            <p class="text-sm text-muted-foreground mt-0.5">
              {{ $t('cms.sections_desc', 'Define sections and their field schemas for this page') }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" @click="handleEditMetadata">
            {{ $t('cms.edit_metadata', 'Edit Metadata') }}
          </Button>
          <Button variant="outline" size="sm" @click="handleEditContent">
            {{ $t('cms.edit_content', 'Edit Content') }}
          </Button>
          <Button variant="outline" @click="openImportDialog">
            <HugeiconsIcon :icon="LibrariesIcon" :size="16" />
            {{ $t('cms.import_from_library', 'Import from Library') }}
          </Button>
          <Button :disabled="showAddForm" @click="openAddForm">
            <HugeiconsIcon :icon="PlusSignIcon" :size="16" />
            {{ $t('cms.add_section', 'Add Section') }}
          </Button>
        </div>
      </div>

      <!-- Empty State (only when no sections AND not showing add form) -->
      <Card v-if="sections.length === 0 && !showAddForm" class="border-dashed">
        <CardContent class="flex flex-col items-center justify-center py-12 text-center">
          <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <HugeiconsIcon :icon="LayoutLeftIcon" :size="24" class="text-primary" />
          </div>
          <h3 class="text-lg font-semibold text-foreground mb-1">
            {{ $t('cms.no_sections', 'No sections yet') }}
          </h3>
          <p class="text-sm text-muted-foreground mb-4 max-w-xs">
            {{
              $t(
                'cms.no_sections_desc',
                'Add sections to define the structure of this page. Each section can have multiple fields.',
              )
            }}
          </p>
          <Button @click="openAddForm">
            <HugeiconsIcon :icon="PlusSignIcon" :size="16" />
            {{ $t('cms.add_first_section', 'Add First Section') }}
          </Button>
        </CardContent>
      </Card>

      <!-- Sections List (drag-and-drop) -->
      <div v-if="sections.length > 0">
        <draggable
          v-model="sections"
          item-key="id"
          handle=".drag-handle"
          animation="200"
          ghost-class="opacity-30"
          drag-class="shadow-xl"
          class="space-y-3"
          @end="onDragEnd"
        >
          <template #item="{ element: section, index: idx }">
            <div>
              <SectionCard
                :section="section"
                :index="idx"
                :total="sections.length"
                :toggling="toggling === section.id"
                :deleting="deleting === section.id"
                :toggling-repeatable="togglingRepeatable === section.id"
                @edit="handleEdit"
                @delete="handleDelete"
                @toggle="handleToggle"
                @toggle-repeatable="handleToggleRepeatable"
              />

              <!-- Inline Edit Form (appears right below the section being edited) -->
              <Transition name="slide-fade">
                <Card
                  v-if="showEditForm && editSection?.id === section.id"
                  ref="editFormRef"
                  class="border-amber-500/30 bg-amber-500/5 mt-0! rounded-t-none border-t-0"
                >
                  <CardHeader class="pb-3">
                    <div class="flex items-center justify-between">
                      <div>
                        <h3 class="text-base font-semibold text-foreground flex items-center gap-2">
                          {{ $t('cms.edit_section', 'Edit Section') }}
                          <code
                            class="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded"
                          >{{ editSection?.key }}</code>
                        </h3>
                        <p class="text-sm text-muted-foreground mt-0.5">
                          {{
                            $t(
                              'cms.edit_section_desc',
                              'Update labels and manage fields for this section.',
                            )
                          }}
                        </p>
                      </div>
                      <button
                        class="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                        @click="cancelEditForm"
                      >
                        <HugeiconsIcon :icon="Cancel01Icon" :size="16" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent class="space-y-5">
                    <!-- Labels -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        v-model="editLabel.en"
                        :label="$t('cms.section_label_en', 'Section Label (English)')"
                        required
                      />
                      <InputField
                        v-model="editLabel.ar"
                        :label="$t('cms.section_label_ar', 'Section Label (Arabic)')"
                        dir="rtl"
                      />
                    </div>

                    <!-- Fields Section -->
                    <div>
                      <div class="flex items-center justify-between mb-3">
                        <label class="text-sm font-medium text-foreground">
                          {{ $t('cms.fields', 'Fields') }}
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
                          {{ $t('cms.add_field', 'Add Field') }}
                        </Button>
                      </div>

                      <!-- Empty fields -->
                      <div
                        v-if="editFields.length === 0"
                        class="border border-dashed border-border rounded-lg p-6 text-center"
                      >
                        <p class="text-sm text-muted-foreground">
                          {{ $t('cms.no_fields_yet', 'No fields yet.') }}
                        </p>
                      </div>

                      <!-- Fields list -->
                      <div v-else class="space-y-1.5">
                        <TransitionGroup name="field-list">
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
                            <span class="font-medium text-foreground truncate">
                              {{ field.label?.en || field.key }}
                            </span>
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
                                :title="$t('actions.edit', 'Edit')"
                                @click="
                                  editFormEditingField = mapDefinitionToPickerField(field)
                                  showEditFieldPicker = true
                                "
                              >
                                <HugeiconsIcon :icon="PencilEdit02Icon" :size="14" />
                              </button>
                              <button
                                class="w-7 h-7 flex items-center justify-center rounded-md text-destructive/40 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 cursor-pointer"
                                :title="$t('actions.remove', 'Remove')"
                                @click="removeEditField(fIdx)"
                              >
                                <HugeiconsIcon :icon="Cancel01Icon" :size="14" />
                              </button>
                            </div>
                          </div>
                        </TransitionGroup>
                      </div>
                    </div>

                    <!-- Action buttons -->
                    <div class="flex items-center justify-end gap-3 pt-2 border-t border-border/50">
                      <Button variant="outline" @click="cancelEditForm">
                        {{ $t('common.cancel', 'Cancel') }}
                      </Button>
                      <Button
                        :loading="editSaving"
                        :disabled="editSaving || editFields.length === 0"
                        @click="handleEditSave"
                      >
                        {{ $t('common.save', 'Save Changes') }}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Transition>
            </div>
          </template>
        </draggable>
      </div>

      <!-- Field Type Picker for ADD (popup) -->
      <FieldTypePicker
        :open="showFieldPicker"
        :section-name="newSection.label.en"
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

      <!-- Field Type Picker for EDIT (popup) -->
      <FieldTypePicker
        :open="showEditFieldPicker"
        :section-name="editSection?.label?.en || ''"
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

      <!-- Reusable Edit Confirm -->
      <ConfirmModal
        :show="showEditReusableConfirm"
        :title="$t('cms.edit_reusable_title', 'Edit Reusable Section?')"
        :message="
          $t(
            'cms.edit_reusable_msg_save',
            'This is a reusable section! Saving these changes will permanently modify its schema across ALL pages that use it. Are you sure you want to save?',
          )
        "
        :confirm-text="$t('common.save', 'Save Changes')"
        @confirm="executeEditSave"
        @cancel="showEditReusableConfirm = false"
      />

      <!-- Summary bar -->
      <div
        v-if="sections.length > 0"
        class="mt-4 flex items-center justify-between pt-3 border-t border-border/50"
      >
        <p class="text-sm text-muted-foreground">
          {{ sections.length }} {{ $t('cms.sections', 'sections') }}
          {{ $t('common.separator', '·') }} {{ sections.filter((s) => !s.is_hidden).length }}
          {{ $t('cms.visible', 'visible') }} {{ $t('common.separator', '·') }}
          {{ sections.filter((s) => s.is_reusable).length }} {{ $t('cms.reusable', 'reusable') }}
        </p>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- Inline Add Section Form (on the page, not a modal)              -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <Transition name="slide-fade">
        <Card v-if="showAddForm" ref="addFormRef" class="mt-4 border-primary/30 bg-primary/5">
          <CardHeader class="pb-3">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-foreground">
                  {{ $t('cms.add_section', 'Add Section') }}
                </h3>
                <p class="text-sm text-muted-foreground mt-0.5">
                  {{
                    $t(
                      'cms.add_section_inline_desc',
                      'Create a new inline section with at least one field.',
                    )
                  }}
                </p>
              </div>
              <button
                class="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                @click="cancelAddForm"
              >
                <HugeiconsIcon :icon="Cancel01Icon" :size="16" />
              </button>
            </div>
          </CardHeader>
          <CardContent class="space-y-5">
            <!-- Labels + Key row -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                v-model="newSection.label.en"
                :label="$t('cms.section_label_en', 'Section Label (English)')"
                :placeholder="$t('cms.placeholder_hero_banner', 'e.g. Hero Banner')"
                required
                @blur="autoGenerateKey"
              />
              <InputField
                v-model="newSection.label.ar"
                :label="$t('cms.section_label_ar', 'Section Label (Arabic)')"
                :placeholder="$t('cms.placeholder_hero_banner_ar', 'e.g. البانر الرئيسي')"
                dir="rtl"
              />
            </div>

            <div class="max-w-sm">
              <InputField
                v-model="newSection.key"
                :label="$t('cms.section_key', 'Section Key')"
                :placeholder="$t('cms.placeholder_hero_key', 'e.g. hero_banner')"
                required
                dir="ltr"
                class="font-mono"
                :error="sectionKeyError || backendKeyError"
              />
              <p class="text-[10px] text-muted-foreground mt-1">
                {{
                  $t(
                    'cms.key_hint',
                    'Unique snake_case identifier. Auto-generated from the English label.',
                  )
                }}
              </p>
            </div>

            <!-- Repeatable toggle -->
            <div
              class="flex items-center justify-between rounded-lg border border-border p-3 max-w-sm"
            >
              <div>
                <label class="text-sm font-medium text-foreground">
                  {{ $t('cms.repeatable', 'Repeatable') }}
                </label>
                <p class="text-[10px] text-muted-foreground mt-0.5">
                  {{ $t('cms.repeatable_hint', 'Allow multiple entries for this section.') }}
                </p>
              </div>
              <Switch
                :checked="newSection.is_repeatable"
                @update:checked="newSection.is_repeatable = $event"
              />
            </div>

            <!-- Fields Section -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <label class="text-sm font-medium text-foreground">
                  {{ $t('cms.fields', 'Fields') }}
                  <span class="text-destructive">*</span>
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  class="text-xs h-7"
                  @click="showFieldPicker = true"
                >
                  <HugeiconsIcon :icon="PlusSignIcon" :size="12" />
                  {{ $t('cms.add_field', 'Add Field') }}
                </Button>
              </div>

              <div
                v-if="newSection.fields.length === 0"
                class="border border-dashed border-border rounded-lg p-6 text-center"
              >
                <p class="text-sm text-muted-foreground mb-2">
                  {{ $t('cms.no_fields_yet', 'No fields yet.') }}
                </p>
                <p class="text-xs text-muted-foreground">
                  {{
                    $t(
                      'cms.add_field_hint',
                      'Click "Add Field" to define the schema for this section.',
                    )
                  }}
                </p>
              </div>

              <div v-else class="space-y-1.5">
                <TransitionGroup name="field-list">
                  <div
                    v-for="(field, idx) in newSection.fields"
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
                        :title="$t('actions.edit', 'Edit')"
                        @click="
                          existingEditingField = mapDefinitionToPickerField(field)
                          showFieldPicker = true
                        "
                      >
                        <HugeiconsIcon :icon="PencilEdit02Icon" :size="14" />
                      </button>
                      <button
                        class="w-7 h-7 flex items-center justify-center rounded-md text-destructive/40 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 cursor-pointer"
                        :title="$t('actions.remove', 'Remove')"
                        @click="removeField(idx)"
                      >
                        <HugeiconsIcon :icon="Cancel01Icon" :size="14" />
                      </button>
                    </div>
                  </div>
                </TransitionGroup>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center justify-end gap-3 pt-2 border-t border-border/50">
              <Button variant="outline" @click="cancelAddForm">
                {{ $t('common.cancel', 'Cancel') }}
              </Button>
              <Button
                :loading="addSaving"
                :disabled="
                  addSaving
                    || newSection.fields.length === 0
                    || !newSection.label.en.trim()
                    || !newSection.key.trim()
                    || !!sectionKeyError
                "
                @click="handleCreateSection"
              >
                <HugeiconsIcon :icon="PlusSignIcon" :size="14" />
                {{ $t('cms.create_section', 'Create Section') }}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Transition>
    </template>
    <!-- Delete Confirmation -->
    <ConfirmModal
      :show="showDeleteConfirm"
      :title="$t('cms.delete_section_title', 'Delete Section')"
      :message="
        $t(
          'cms.delete_section_msg',
          'Are you sure? This will remove the section and all its content. This action cannot be undone.',
        )
      "
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />

    <!-- Import from Library Dialog -->
    <Dialog v-model:open="showImportDialog">
      <DialogContent class="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <HugeiconsIcon :icon="LibrariesIcon" :size="18" class="text-purple-500" />
            {{ $t('cms.import_from_library', 'Import from Library') }}
          </DialogTitle>
          <DialogDescription>
            {{ $t('cms.import_desc', 'Select a reusable section to add to this page.') }}
          </DialogDescription>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto py-2 -mx-1 px-1">
          <!-- Loading -->
          <div v-if="loadingLibrary" class="space-y-3">
            <Skeleton class="h-16 w-full rounded-lg" />
            <Skeleton class="h-16 w-full rounded-lg" />
            <Skeleton class="h-16 w-full rounded-lg" />
          </div>

          <!-- Empty -->
          <div v-else-if="libraryItems.length === 0" class="py-10 text-center">
            <div
              class="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3"
            >
              <HugeiconsIcon :icon="LibrariesIcon" :size="20" class="text-purple-500" />
            </div>
            <p class="text-sm text-muted-foreground mb-1">
              {{ $t('cms.no_reusable_library', 'No reusable sections in library') }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{
                $t('cms.create_reusable_first', 'Create one from the Reusable Library page first.')
              }}
            </p>
          </div>

          <!-- Library items -->
          <div v-else class="space-y-2">
            <button
              v-for="item in libraryItems"
              :key="item.id"
              class="w-full text-left p-3 rounded-lg border border-border/60 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all cursor-pointer group"
              :class="importingId === item.id ? 'opacity-50 pointer-events-none animate-pulse' : ''"
              @click="handleImportReusable(item)"
            >
              <div class="flex items-center justify-between mb-1.5">
                <div class="flex items-center gap-2">
                  <HugeiconsIcon
                    :icon="LibrariesIcon"
                    :size="14"
                    class="text-purple-500 shrink-0"
                  />
                  <span class="font-medium text-foreground text-sm">
                    {{ typeof item.label === 'string' ? item.label : item.label?.en || item.key }}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  class="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity border-purple-500/30 text-purple-500"
                >
                  {{ $t('cms.click_to_import', 'Click to import') }}
                </Badge>
              </div>
              <div class="flex items-center gap-1.5 mb-1">
                <code class="text-[10px] text-muted-foreground font-mono">{{ item.key }}</code>
                <span class="text-[10px] text-muted-foreground">{{
                  $t('common.separator', '·')
                }}</span>
                <span class="text-[10px] text-muted-foreground">{{ (item.fields || []).length }} {{ $t('cms.fields', 'fields') }}</span>
              </div>
              <div class="flex flex-wrap gap-1">
                <Badge
                  v-for="field in (item.fields || []).slice(0, 6)"
                  :key="field.key"
                  :class="fieldTypeColors[field.type] || 'bg-gray-500/15 text-gray-400'"
                  class="text-[9px] font-mono px-1 py-0"
                >
                  {{ field.key }}
                </Badge>
                <Badge
                  v-if="(item.fields || []).length > 6"
                  variant="secondary"
                  class="text-[9px] px-1 py-0"
                >
                  +{{ (item.fields || []).length - 6 }}
                </Badge>
              </div>
            </button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showImportDialog = false">
            {{ $t('common.cancel', 'Cancel') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

.field-list-enter-active {
  transition: all 0.25s ease;
}
.field-list-leave-active {
  transition: all 0.15s ease-in;
}
.field-list-enter-from {
  opacity: 0;
  transform: translateX(-8px);
}
.field-list-leave-to {
  opacity: 0;
  transform: translateX(8px);
}
.field-list-move {
  transition: transform 0.2s ease;
}
</style>

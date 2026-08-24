<script setup lang="ts">
/**
 * ReusableContentView — Content Editor for Reusable Library Sections (Phase 5)
 *
 * Reuses CmsFieldRenderer to render fields, same locale tabs and save/publish flow
 * as PageEditorView but scoped to a single reusable section.
 */
import type { CmsFieldDefinition, CmsReusableSection } from '@/types/cms'
import {
  ArrowLeft02Icon,
  CheckmarkCircle02Icon,
  EyeIcon,
  LibrariesIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import CmsFieldRenderer from '@/components/ui/cms/CmsFieldRenderer.vue'
import { Badge } from '@/components/uic/badge'
import { Button } from '@/components/uic/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/uic/card'
import { Skeleton } from '@/components/uic/skeleton'
import { cmsReusableService } from '@/services/cmsService'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

// ── Route params ──────────────────────────────────────────────────────────────
const sectionId = computed(() => Number(route.params.id))

// ── State ─────────────────────────────────────────────────────────────────────
const section = ref<CmsReusableSection | null>(null)
const loading = ref(true)
const saving = ref(false)
const publishing = ref(false)
const activeLocale = ref<'en' | 'ar'>('en')

/** Content store: locale → { fieldKey: value } */
const contentStore = reactive<Record<string, Record<string, any>>>({ en: {}, ar: {} })
const contentStatus = reactive<Record<string, number>>({ en: 0, ar: 0 })

/** Validation errors: locale → fieldKey → error message */
const validationErrors = reactive<Record<string, Record<string, string>>>({ en: {}, ar: {} })

// ── Load ──────────────────────────────────────────────────────────────────────
async function loadData() {
  loading.value = true
  try {
    section.value = await cmsReusableService.get(sectionId.value)

    // Load content
    try {
      const data = await cmsReusableService.getContent(sectionId.value)
      if (data && typeof data === 'object') {
        for (const [loc, entry] of Object.entries(data)) {
          if (loc === 'en' || loc === 'ar') {
            const e = entry as any
            contentStore[loc] = e?.content ?? e ?? {}
            contentStatus[loc] = e?.status ?? 0
          }
        }
      }
    }
    catch {
      // Content may not exist yet
      contentStore.en = {}
      contentStore.ar = {}
    }
  }
  catch (err: any) {
    toast.error(t('common.error', 'Error'), { description: err.message || 'Failed to load' })
  }
  finally {
    loading.value = false
  }
}

watch(
  () => sectionId.value,
  () => loadData(),
  { immediate: true },
)

// ── Computed ──────────────────────────────────────────────────────────────────
const sectionName = computed(() => {
  if (!section.value)
    return ''
  const label = section.value.label
  if (typeof label === 'string')
    return label
  return label?.[locale.value as 'en' | 'ar'] || label?.en || ''
})

const fields = computed<CmsFieldDefinition[]>(() => section.value?.fields || [])

const activeContent = computed(() => contentStore[activeLocale.value] || {})

function getFieldValue(fieldKey: string): any {
  return activeContent.value[fieldKey] ?? ''
}

function setFieldValue(fieldKey: string, value: any) {
  if (!contentStore[activeLocale.value]) {
    contentStore[activeLocale.value] = {}
  }
  contentStore[activeLocale.value]![fieldKey] = value

  if (validationErrors[activeLocale.value]?.[fieldKey]) {
    delete validationErrors[activeLocale.value]![fieldKey]
  }
}

function getFieldError(fieldKey: string): string | undefined {
  return validationErrors[activeLocale.value]?.[fieldKey]
}

function validateField(field: CmsFieldDefinition, value: any): string | null {
  const isEmpty
    = value === undefined
      || value === null
      || value === ''
      || (Array.isArray(value) && value.length === 0)

  if (field.required && isEmpty) {
    const label
      = typeof field.label === 'string'
        ? field.label
        : field.label?.[locale.value as 'en' | 'ar'] || field.label?.en || field.key
    return t('validation.required', '{field} is required').replace('{field}', label)
  }

  // Skip further validation if value is empty and field is optional
  if (isEmpty)
    return null

  const strValue = String(value)

  if (field.min_length != null && strValue.length < field.min_length) {
    return t('validation.min_length', 'Minimum {min} characters').replace(
      '{min}',
      String(field.min_length),
    )
  }
  if (field.max_length != null && strValue.length > field.max_length) {
    return t('validation.max_length', 'Maximum {max} characters').replace(
      '{max}',
      String(field.max_length),
    )
  }
  if (field.type === 'email' && !/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(strValue)) {
    return t('validation.email', 'Invalid email address')
  }
  if (field.type === 'number') {
    const num = Number(value)
    if (Number.isNaN(num))
      return t('validation.number', 'Must be a valid number')
    if (field.min != null && num < field.min)
      return t('validation.min', 'Minimum value is {min}').replace('{min}', String(field.min))
    if (field.max != null && num > field.max)
      return t('validation.max', 'Maximum value is {max}').replace('{max}', String(field.max))
  }
  if (field.regex_pattern) {
    try {
      const re = new RegExp(field.regex_pattern)
      if (!re.test(strValue))
        return t('validation.pattern', 'Invalid format')
    }
    catch {
      /* ignore */
    }
  }
  return null
}

function validateCurrent(): boolean {
  validationErrors[activeLocale.value] = {}
  let hasErrors = false
  const content = contentStore[activeLocale.value] || {}

  for (const field of fields.value) {
    const value = content[field.key]
    const error = validateField(field, value)
    if (error) {
      validationErrors[activeLocale.value]![field.key] = error
      hasErrors = true
    }
  }
  return !hasErrors
}

function validateAll(): boolean {
  validationErrors.en = {}
  validationErrors.ar = {}
  let hasErrors = false

  for (const loc of ['en', 'ar'] as const) {
    const content = contentStore[loc] || {}
    for (const field of fields.value) {
      const value = content[field.key]
      const error = validateField(field, value)
      if (error) {
        validationErrors[loc]![field.key] = error
        hasErrors = true
      }
    }
  }

  // Prioritize active locale if both have errors
  const currentErrors = validationErrors[activeLocale.value] || {}
  const currentHasErrors = Object.keys(currentErrors).length > 0
  if (!currentHasErrors) {
    const otherLocale = activeLocale.value === 'en' ? 'ar' : 'en'
    const otherErrors = validationErrors[otherLocale] || {}
    if (Object.keys(otherErrors).length > 0) {
      activeLocale.value = otherLocale
    }
  }

  return !hasErrors
}

function getStatusLabel(): string {
  const content = contentStore[activeLocale.value]
  if (!content || Object.keys(content).length === 0)
    return 'empty'
  return contentStatus[activeLocale.value] === 1 ? 'published' : 'draft'
}

// ── Save ──────────────────────────────────────────────────────────────────────
async function handleSave() {
  if (!validateAll()) {
    // toast.error(t('common.validation_error', 'Validation Error'), {
    //   description: t('cms.fix_errors_before_saving', 'Please fix the highlighted errors before saving.'),
    // })
    return
  }

  saving.value = true
  try {
    await cmsReusableService.saveBatchContent(sectionId.value, {
      default: 'en',
      locales: { ...contentStore },
    })
    toast.success(t('cms.draft_saved', 'Draft saved'))
  }
  catch (err: any) {
    if (err.response?.status === 422 && err.response?.data?.errors) {
      const messages = Object.values(err.response.data.errors).flat() as string[]
      toast.error(t('common.validation_error', 'Validation Error'), {
        description: messages.slice(0, 3).join(' · '),
      })
    }
    else {
      toast.error(t('common.error', 'Error'), {
        description: err.response?.data?.message || err.message,
      })
    }
  }
  finally {
    saving.value = false
  }
}

async function handlePublish() {
  if (!validateCurrent()) {
    // toast.error(t('common.validation_error', 'Validation Error'), {
    //   description: t('cms.fix_errors_before_saving', 'Please fix the highlighted errors before saving.'),
    // })
    return
  }

  publishing.value = true
  try {
    await cmsReusableService.publishContent(sectionId.value, { locales: [activeLocale.value] })
    contentStatus[activeLocale.value] = 1
    toast.success(
      t('cms.published_locale', 'Content published for {locale}').replace(
        '{locale}',
        activeLocale.value.toUpperCase(),
      ),
    )
  }
  catch (err: any) {
    toast.error(t('common.error', 'Error'), {
      description: err.response?.data?.message || err.message,
    })
  }
  finally {
    publishing.value = false
  }
}

function handleBack() {
  router.push({ name: 'admin-cms-reusable' })
}
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto pb-20">
    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <Skeleton class="h-12 w-64" />
      <Skeleton class="h-[50vh] w-full rounded-xl" />
    </div>

    <template v-else-if="section">
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
              <HugeiconsIcon :icon="LibrariesIcon" :size="20" class="text-purple-500" />
              <h1 class="text-xl font-semibold text-foreground">
                {{ sectionName }}
              </h1>
              <Badge
                variant="outline"
                class="text-[10px] uppercase tracking-wider border-purple-500/30 text-purple-500"
              >
                {{ $t('cms.reusable', 'Reusable') }}
              </Badge>
            </div>
            <code class="text-[10px] text-muted-foreground font-mono">{{ section.key }}</code>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Locale Tabs -->
          <div class="flex items-center rounded-lg border border-border overflow-hidden mr-2">
            <button
              class="px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors"
              :class="
                activeLocale === 'en'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              "
              @click="activeLocale = 'en'"
            >
              {{ $t('common.lang_en_short', 'EN') }}
            </button>
            <button
              class="px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors"
              :class="
                activeLocale === 'ar'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              "
              @click="activeLocale = 'ar'"
            >
              {{ $t('common.lang_ar_short', 'AR') }}
            </button>
          </div>

          <Badge
            :variant="getStatusLabel() === 'published' ? 'default' : 'secondary'"
            class="text-[10px] uppercase tracking-wider"
          >
            {{
              getStatusLabel() === 'published'
                ? $t('common.published', 'Published')
                : getStatusLabel() === 'draft'
                  ? $t('common.draft', 'Draft')
                  : $t('cms.empty', 'Empty')
            }}
          </Badge>

          <Button variant="outline" size="sm" :disabled="saving" @click="handleSave">
            <HugeiconsIcon :icon="CheckmarkCircle02Icon" :size="14" />
            {{ $t('cms.save_draft', 'Save Draft') }}
          </Button>

          <Button
            variant="outline"
            size="sm"
            :disabled="publishing || getStatusLabel() === 'empty'"
            @click="handlePublish"
          >
            <HugeiconsIcon :icon="EyeIcon" :size="14" />
            {{ $t('cms.publish', 'Publish') }} {{ activeLocale.toUpperCase() }}
          </Button>
        </div>
      </div>

      <!-- No fields -->
      <Card v-if="fields.length === 0" class="border-dashed">
        <CardContent class="py-12 text-center">
          <p class="text-sm text-muted-foreground">
            {{ $t('cms.no_fields_content', 'This section has no fields defined.') }}
          </p>
        </CardContent>
      </Card>

      <!-- Fields Form -->
      <Card v-else>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm text-muted-foreground font-medium uppercase tracking-wider">
            {{
              activeLocale === 'ar'
                ? $t('common.lang_ar_content', 'المحتوى العربي')
                : $t('common.lang_en_content', 'English Content')
            }}
          </CardTitle>
        </CardHeader>
        <CardContent :dir="activeLocale === 'ar' ? 'rtl' : 'ltr'" class="space-y-5">
          <CmsFieldRenderer
            v-for="field in fields"
            :key="field.key"
            :field="field"
            :model-value="getFieldValue(field.key)"
            :sibling-values="activeContent"
            :locale="activeLocale"
            :error="getFieldError(field.key)"
            @update:model-value="setFieldValue(field.key, $event)"
          />
        </CardContent>
      </Card>

      <!-- Bottom bar -->
      <div class="mt-6 flex items-center justify-between pt-4 border-t border-border/50">
        <p class="text-xs text-muted-foreground">
          {{ fields.length }} {{ $t('cms.fields', 'fields') }} {{ $t('common.separator', '·') }}
          {{ activeLocale.toUpperCase() }}
        </p>
        <Button :loading="saving" :disabled="saving" @click="handleSave">
          {{ $t('cms.save_all_locales', 'Save Both Locales') }}
        </Button>
      </div>
    </template>
  </div>
</template>

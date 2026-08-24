<script setup lang="ts">
/**
 * PageEditorView — Content Editor (Phase 4)
 *
 * The main content editing experience:
 * - Section navigator sidebar
 * - Locale tabs (EN/AR) per section
 * - Draft/publish status per locale per section
 * - Save draft (single locale, batch, or page-level save all)
 * - Publish per locale
 */
import type { CmsFieldDefinition, CmsPage, CmsSection } from '@/types/cms'
import {
  ArrowLeft02Icon,
  CheckmarkCircle02Icon,
  CloudUploadIcon,
  EyeIcon,
  LayoutLeftIcon,
  ViewOffSlashIcon,
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
import { cmsPageService, cmsSectionContentService, cmsSectionService } from '@/services/cmsService'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

// ── Route params ──────────────────────────────────────────────────────────────
const pageId = computed(() => Number(route.params.id))

// ── State ─────────────────────────────────────────────────────────────────────
const page = ref<CmsPage | null>(null)
const sections = ref<CmsSection[]>([])
const loading = ref(true)
const saving = ref(false)
const publishing = ref(false)
const activeLocale = ref<'en' | 'ar'>('en')
const activeSectionId = ref<number | null>(null)

/**
 * Content store: sectionId → locale → { fieldKey: value }
 * This is the working draft content.
 */
const contentStore = reactive<Record<number, Record<string, Record<string, any>>>>({})

/**
 * Content status: sectionId → locale → status (0=draft, 1=published)
 */
const contentStatus = reactive<Record<number, Record<string, number>>>({})

/** Track which sections have been loaded */
const loadedSections = ref<Set<number>>(new Set())

// ── Load page + sections ──────────────────────────────────────────────────────
async function loadPage() {
  loading.value = true
  try {
    const p = await cmsPageService.get(pageId.value, { include: 'seoMetas,sections' })
    page.value = p

    // Get sections — from include or separate call
    if (p.sections && p.sections.length > 0) {
      sections.value = p.sections.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    }
    else {
      const result = await cmsSectionService.list(pageId.value)
      sections.value = result.data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    }

    // Filter to visible sections only
    const visibleSections = sections.value.filter(s => !s.is_hidden)
    if (visibleSections.length > 0 && !activeSectionId.value) {
      activeSectionId.value = visibleSections[0]!.id
    }

    // Load content for all sections
    await Promise.all(sections.value.map(s => loadSectionContent(s.id)))
  }
  catch (err: any) {
    toast.error(t('common.error', 'Error'), {
      description: err.response?.data?.message || err.message || 'Failed to load page',
    })
  }
  finally {
    loading.value = false
  }
}

async function loadSectionContent(sectionId: number) {
  try {
    const data = await cmsSectionContentService.getAll(sectionId)

    // Initialize content store for this section
    if (!contentStore[sectionId]) {
      contentStore[sectionId] = { en: {}, ar: {} }
    }
    if (!contentStatus[sectionId]) {
      contentStatus[sectionId] = { en: 0, ar: 0 }
    }

    // Parse the response — could be { en: { content: {...}, status: 0 }, ar: {...} }
    // or { locale: 'en', content: {...} } array, or direct content object
    if (data && typeof data === 'object') {
      for (const [loc, entry] of Object.entries(data)) {
        if (loc === 'en' || loc === 'ar') {
          const e = entry as any
          contentStore[sectionId]![loc] = e?.content ?? e ?? {}
          contentStatus[sectionId]![loc] = e?.status ?? 0
        }
      }
    }

    loadedSections.value.add(sectionId)
  }
  catch {
    // Content may not exist yet — that's OK, initialize empty
    if (!contentStore[sectionId]) {
      contentStore[sectionId] = { en: {}, ar: {} }
    }
    if (!contentStatus[sectionId]) {
      contentStatus[sectionId] = { en: 0, ar: 0 }
    }
    loadedSections.value.add(sectionId)
  }
}

// ── Initial load ──────────────────────────────────────────────────────────────
watch(
  () => pageId.value,
  () => loadPage(),
  { immediate: true },
)

// ── Computed helpers ──────────────────────────────────────────────────────────
const pageName = computed(() => {
  if (!page.value)
    return ''
  const title = page.value.title
  if (typeof title === 'string')
    return title
  return title?.[locale.value as 'en' | 'ar'] || title?.en || ''
})

const activeSection = computed(
  () => sections.value.find(s => s.id === activeSectionId.value) || null,
)

const activeSectionFields = computed<CmsFieldDefinition[]>(() => activeSection.value?.fields || [])

const activeSectionContent = computed(() => {
  if (!activeSectionId.value)
    return {}
  return contentStore[activeSectionId.value]?.[activeLocale.value] || {}
})

function getFieldValue(fieldKey: string): any {
  return activeSectionContent.value[fieldKey] ?? ''
}

function setFieldValue(fieldKey: string, value: any) {
  if (!activeSectionId.value)
    return

  if (!contentStore[activeSectionId.value]) {
    contentStore[activeSectionId.value] = { en: {}, ar: {} }
  }
  if (!contentStore[activeSectionId.value]![activeLocale.value]) {
    contentStore[activeSectionId.value]![activeLocale.value] = {}
  }
  contentStore[activeSectionId.value]![activeLocale.value]![fieldKey] = value
}

function localized(val: any): string {
  if (typeof val === 'string')
    return val
  if (!val)
    return '-'
  return val[locale.value] || val.en || val.ar || '-'
}

function getSectionStatusBadge(sectionId: number, loc: string): 'draft' | 'published' | 'empty' {
  const status = contentStatus[sectionId]?.[loc]
  const content = contentStore[sectionId]?.[loc]
  if (!content || Object.keys(content).length === 0)
    return 'empty'
  return status === 1 ? 'published' : 'draft'
}

// ── Save draft ────────────────────────────────────────────────────────────────

/** Save content for the active section + active locale */
async function handleSaveSection() {
  if (!activeSectionId.value)
    return

  saving.value = true
  try {
    const content = contentStore[activeSectionId.value]?.[activeLocale.value] || {}
    await cmsSectionContentService.saveDraft(activeSectionId.value, {
      locale: activeLocale.value,
      is_default: activeLocale.value === 'en',
      content,
    })
    toast.success(t('cms.draft_saved', 'Draft saved'))
  }
  catch (err: any) {
    handleSaveError(err)
  }
  finally {
    saving.value = false
  }
}

/** Save content for the active section — both locales at once */
async function handleSaveSectionBatch() {
  if (!activeSectionId.value)
    return

  saving.value = true
  try {
    const locales = contentStore[activeSectionId.value] || { en: {}, ar: {} }
    await cmsSectionContentService.saveBatch(activeSectionId.value, {
      default: 'en',
      locales,
    })
    toast.success(t('cms.draft_saved_batch', 'All locales saved'))
  }
  catch (err: any) {
    handleSaveError(err)
  }
  finally {
    saving.value = false
  }
}

/** Save ALL sections at once (page-level batch) */
async function handleSaveAll() {
  saving.value = true
  try {
    const sectionsPayload: Record<string, Record<string, Record<string, any>>> = {}

    for (const section of sections.value) {
      const sectionContent = contentStore[section.id] || { en: {}, ar: {} }
      sectionsPayload[String(section.id)] = {
        en: sectionContent.en || {},
        ar: sectionContent.ar || {},
      }
    }

    await cmsPageService.batchContent(pageId.value, {
      default: 'en',
      sections: sectionsPayload,
    })
    toast.success(t('cms.all_saved', 'All sections saved'))
  }
  catch (err: any) {
    handleSaveError(err)
  }
  finally {
    saving.value = false
  }
}

/** Publish content for the active section */
async function handlePublishSection() {
  if (!activeSectionId.value)
    return

  publishing.value = true
  try {
    await cmsSectionContentService.publish(activeSectionId.value, {
      locales: [activeLocale.value],
    })
    // Update local status
    if (contentStatus[activeSectionId.value]) {
      contentStatus[activeSectionId.value]![activeLocale.value] = 1
    }
    toast.success(
      t('cms.published_locale', 'Content published for {locale}').replace(
        '{locale}',
        activeLocale.value.toUpperCase(),
      ),
    )
  }
  catch (err: any) {
    toast.error(t('common.error', 'Error'), {
      description: err.response?.data?.message || err.message || 'Failed to publish',
    })
  }
  finally {
    publishing.value = false
  }
}

function handleSaveError(err: any) {
  if (err.response?.status === 422 && err.response?.data?.errors) {
    const errors = err.response.data.errors
    const messages = Object.values(errors).flat() as string[]
    toast.error(t('common.validation_error', 'Validation Error'), {
      description: messages.slice(0, 3).join(' · '),
    })
  }
  else {
    toast.error(t('common.error', 'Error'), {
      description: err.response?.data?.message || err.message || 'Failed to save',
    })
  }
}

// ── Navigation ────────────────────────────────────────────────────────────────
function handleBack() {
  router.push({ name: 'admin-cms' })
}

function handleGoToStructure() {
  router.push({ name: 'admin-cms-sections', params: { id: pageId.value } })
}
</script>

<template>
  <div class="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
    <!-- ═══ Loading ═══════════════════════════════════════════════════════ -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="space-y-4 w-full max-w-2xl px-6">
        <Skeleton class="h-12 w-64" />
        <div class="flex gap-4">
          <Skeleton class="h-[60vh] w-56 rounded-xl" />
          <Skeleton class="h-[60vh] flex-1 rounded-xl" />
        </div>
      </div>
    </div>

    <!-- ═══ No sections state ════════════════════════════════════════════ -->
    <div v-else-if="sections.length === 0" class="flex-1 flex items-center justify-center p-6">
      <div class="text-center max-w-sm">
        <div
          class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"
        >
          <HugeiconsIcon :icon="LayoutLeftIcon" :size="28" class="text-primary" />
        </div>
        <h2 class="text-xl font-semibold text-foreground mb-2">
          {{ $t('cms.no_sections', 'No sections yet') }}
        </h2>
        <p class="text-sm text-muted-foreground mb-4">
          {{
            $t(
              'cms.no_sections_content_hint',
              'Add sections to this page first, then come back to add content.',
            )
          }}
        </p>
        <Button @click="handleGoToStructure">
          {{ $t('cms.go_to_structure', 'Go to Structure Editor') }}
        </Button>
      </div>
    </div>

    <!-- ═══ Content Editor ════════════════════════════════════════════════ -->
    <template v-else>
      <!-- ── Top Bar ─────────────────────────────────────────────────────── -->
      <div
        class="shrink-0 px-6 py-3 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between gap-4"
      >
        <div class="flex items-center gap-3 min-w-0">
          <button
            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors shrink-0"
            @click="handleBack"
          >
            <HugeiconsIcon :icon="ArrowLeft02Icon" :size="16" />
          </button>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h1 class="text-lg font-semibold text-foreground truncate">
                {{ pageName }}
              </h1>
              <Badge variant="outline" class="text-[10px] uppercase tracking-wider shrink-0">
                {{ $t('cms.content_editor', 'Content') }}
              </Badge>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
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

          <Button variant="outline" size="sm" :disabled="saving" @click="handleSaveAll">
            <HugeiconsIcon :icon="CloudUploadIcon" :size="14" />
            {{ $t('cms.save_all', 'Save All') }}
          </Button>
        </div>
      </div>

      <!-- ── Main Layout: Sidebar + Content ──────────────────────────────── -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Section Navigator Sidebar -->
        <aside class="w-56 shrink-0 border-e border-border bg-card/50 overflow-y-auto">
          <div class="p-3">
            <p
              class="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 px-2"
            >
              {{ $t('cms.sections', 'Sections') }}
            </p>
            <nav class="space-y-0.5">
              <button
                v-for="section in sections"
                :key="section.id"
                class="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-start transition-all cursor-pointer text-sm"
                :class="[
                  activeSectionId === section.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  section.is_hidden ? 'opacity-50' : '',
                ]"
                @click="activeSectionId = section.id"
              >
                <span class="truncate flex-1">{{ localized(section.label) }}</span>
                <!-- Status dots per locale -->
                <span class="flex items-center gap-0.5 shrink-0">
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="{
                      'bg-emerald-500': getSectionStatusBadge(section.id, 'en') === 'published',
                      'bg-amber-500': getSectionStatusBadge(section.id, 'en') === 'draft',
                      'bg-muted-foreground/30': getSectionStatusBadge(section.id, 'en') === 'empty',
                    }"
                    :title="$t('common.lang_en_short', 'EN')"
                  />
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="{
                      'bg-emerald-500': getSectionStatusBadge(section.id, 'ar') === 'published',
                      'bg-amber-500': getSectionStatusBadge(section.id, 'ar') === 'draft',
                      'bg-muted-foreground/30': getSectionStatusBadge(section.id, 'ar') === 'empty',
                    }"
                    :title="$t('common.lang_ar_short', 'AR')"
                  />
                </span>
              </button>
            </nav>
          </div>
        </aside>

        <!-- Content Panel -->
        <main class="flex-1 overflow-y-auto">
          <div v-if="activeSection" class="p-6 max-w-3xl mx-auto pb-24">
            <!-- Section Header -->
            <div class="mb-6 flex items-center justify-between gap-4">
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-xl font-semibold text-foreground">
                    {{ localized(activeSection.label) }}
                  </h2>
                  <Badge v-if="activeSection.is_hidden" variant="secondary" class="text-[10px]">
                    <HugeiconsIcon :icon="ViewOffSlashIcon" :size="10" class="mr-0.5" />
                    {{ $t('cms.hidden', 'Hidden') }}
                  </Badge>
                  <Badge
                    v-if="activeSection.reusable_section_id"
                    variant="outline"
                    class="text-[10px] border-purple-500/30 text-purple-500"
                  >
                    {{ $t('cms.reusable', 'Reusable') }}
                  </Badge>
                </div>
                <code class="text-[10px] text-muted-foreground font-mono">{{
                  activeSection.key
                }}</code>
              </div>

              <!-- Section actions -->
              <div class="flex items-center gap-2 shrink-0">
                <!-- Status badge -->
                <Badge
                  :variant="
                    getSectionStatusBadge(activeSection.id, activeLocale) === 'published'
                      ? 'default'
                      : 'secondary'
                  "
                  class="text-[10px] uppercase tracking-wider"
                >
                  {{
                    getSectionStatusBadge(activeSection.id, activeLocale) === 'published'
                      ? $t('common.published', 'Published')
                      : getSectionStatusBadge(activeSection.id, activeLocale) === 'draft'
                        ? $t('common.draft', 'Draft')
                        : $t('cms.empty', 'Empty')
                  }}
                </Badge>

                <Button variant="outline" size="sm" :disabled="saving" @click="handleSaveSection">
                  <HugeiconsIcon :icon="CheckmarkCircle02Icon" :size="14" />
                  {{ $t('cms.save_draft', 'Save Draft') }}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  :disabled="
                    publishing || getSectionStatusBadge(activeSection.id, activeLocale) === 'empty'
                  "
                  @click="handlePublishSection"
                >
                  <HugeiconsIcon :icon="EyeIcon" :size="14" />
                  {{ $t('cms.publish', 'Publish') }} {{ activeLocale.toUpperCase() }}
                </Button>
              </div>
            </div>

            <!-- Reusable shared mode warning -->
            <div
              v-if="activeSection.reusable_section_id && activeSection.content_mode === 'shared'"
              class="mb-6 p-4 rounded-lg border border-purple-500/20 bg-purple-500/5"
            >
              <p class="text-sm text-purple-400 font-medium">
                {{
                  $t(
                    'cms.shared_content_notice',
                    'This section uses shared content from the library. Edit it in the Reusable Sections Library.',
                  )
                }}
              </p>
            </div>

            <!-- No fields state -->
            <Card v-if="activeSectionFields.length === 0" class="border-dashed">
              <CardContent class="py-12 text-center">
                <p class="text-sm text-muted-foreground">
                  {{
                    $t(
                      'cms.no_fields_content',
                      'This section has no fields defined. Go to the Structure Editor to add fields.',
                    )
                  }}
                </p>
                <Button variant="outline" size="sm" class="mt-3" @click="handleGoToStructure">
                  {{ $t('cms.go_to_structure', 'Go to Structure Editor') }}
                </Button>
              </CardContent>
            </Card>

            <!-- Fields Form -->
            <div v-else :dir="activeLocale === 'ar' ? 'rtl' : 'ltr'" class="space-y-5">
              <Card>
                <CardHeader class="pb-2">
                  <CardTitle
                    class="text-sm text-muted-foreground font-medium uppercase tracking-wider"
                  >
                    {{
                      activeLocale === 'ar'
                        ? $t('common.lang_ar_content', 'المحتوى العربي')
                        : $t('common.lang_en_content', 'English Content')
                    }}
                  </CardTitle>
                </CardHeader>
                <CardContent class="space-y-5">
                  <template v-for="field in activeSectionFields" :key="field.key">
                    <!-- Only render translatable fields in the active locale,
                         Non-translatable fields always show -->
                    <CmsFieldRenderer
                      v-if="!field.translatable || field.translatable"
                      :field="field"
                      :model-value="getFieldValue(field.key)"
                      :sibling-values="activeSectionContent"
                      :locale="activeLocale"
                      @update:model-value="setFieldValue(field.key, $event)"
                    />
                  </template>
                </CardContent>
              </Card>
            </div>

            <!-- Bottom section bar -->
            <div class="mt-6 flex items-center justify-between pt-4 border-t border-border/50">
              <p class="text-xs text-muted-foreground">
                {{ activeSectionFields.length }} {{ $t('cms.fields', 'fields') }}
                {{ $t('common.separator', '·') }} {{ activeLocale.toUpperCase() }}
              </p>
              <div class="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  :loading="saving"
                  :disabled="saving"
                  @click="handleSaveSectionBatch"
                >
                  {{ $t('cms.save_all_locales', 'Save Both Locales') }}
                </Button>
                <Button size="sm" :loading="saving" :disabled="saving" @click="handleSaveSection">
                  {{
                    $t('cms.save_locale', 'Save {locale}').replace(
                      '{locale}',
                      activeLocale.toUpperCase(),
                    )
                  }}
                </Button>
              </div>
            </div>
          </div>

          <!-- No section selected -->
          <div v-else class="flex-1 flex items-center justify-center h-full">
            <p class="text-sm text-muted-foreground">
              {{ $t('cms.select_section', 'Select a section from the sidebar') }}
            </p>
          </div>
        </main>
      </div>
    </template>
  </div>
</template>

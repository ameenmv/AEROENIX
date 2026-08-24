<script setup lang="ts">
import type { CmsSeoMeta, CreatePagePayload, UpdatePagePayload } from '@/types/cms'

import { useQueryClient } from '@tanstack/vue-query'

import { computed, reactive, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import PageSeoPanel from '@/components/ui/cms/PageSeoPanel.vue'
import { Badge } from '@/components/uic/badge'
import { Button } from '@/components/uic/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/uic/card'
import BilingualInput from '@/components/uic/inputs/BilingualInputField.vue'
import { Skeleton } from '@/components/uic/skeleton'
import { cmsSeoService } from '@/services/cmsSeoService'
import { cmsPageService } from '@/services/cmsService'
import { cleanSeoPayload } from '@/utils/cleanSeoPayload'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const queryClient = useQueryClient()

// ── Mode detection ────────────────────────────────────────────────────────────
const pageId = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!pageId.value)
const saving = ref(false)
const loading = ref(isEdit.value)

// ── Form state ────────────────────────────────────────────────────────────────
const page = reactive<{
  title: { en: string, ar: string }
  slug: { en: string, ar: string }
  meta: Record<string, any>
  status: number | string
  sectionsCount: number
}>({
  title: { en: '', ar: '' },
  slug: { en: '', ar: '' },
  meta: {},
  status: 0,
  sectionsCount: 0,
})

const seo = ref<Record<string, Partial<CmsSeoMeta>>>({
  en: { is_default: true, robots: 'index,follow', twitter_card: 'summary_large_image' },
  ar: {},
})
const showSeo = ref(false)
const inlineErrors = ref<Record<string, string>>({})
const backendErrors = ref<Record<string, string[]>>({})

// ── Load existing page for edit mode ──────────────────────────────────────────
watchEffect(async () => {
  if (pageId.value) {
    loading.value = true
    try {
      const existing = await cmsPageService.get(pageId.value)
      if (existing) {
        // Title & Slug — API returns { en, ar } objects when translated=true
        page.title = {
          en: typeof existing.title === 'string' ? existing.title : existing.title?.en || '',
          ar: typeof existing.title === 'string' ? '' : existing.title?.ar || '',
        }
        page.slug = {
          en: typeof existing.slug === 'string' ? existing.slug : existing.slug?.en || '',
          ar: typeof existing.slug === 'string' ? '' : existing.slug?.ar || '',
        }
        page.meta = existing.meta || {}
        page.status = existing.status ?? 0
        page.sectionsCount = existing.sections?.length ?? 0

        // SEO — load from seo_metas / seoMetas relationship (handles array or object)
        const rawSeo
          = (existing as any).seo_metas ?? (existing as any).seoMetas ?? (existing as any).seo
        if (rawSeo) {
          const seoData: Record<string, Partial<CmsSeoMeta>> = { en: {}, ar: {} }
          if (Array.isArray(rawSeo)) {
            // Array of locale objects: [{ locale: 'en', title: '...' }, { locale: 'ar', ... }]
            for (const meta of rawSeo) {
              const locale = meta.locale || (meta.is_default ? 'en' : 'ar')
              seoData[locale] = meta
            }
          }
          else if (typeof rawSeo === 'object') {
            // Object keyed by locale: { en: { title: '...' }, ar: { ... } }
            for (const [locale, meta] of Object.entries(rawSeo)) {
              if (meta && typeof meta === 'object') {
                seoData[locale] = meta as Partial<CmsSeoMeta>
              }
            }
          }
          seo.value = {
            en: {
              is_default: true,
              robots: 'index,follow',
              twitter_card: 'summary_large_image',
              ...seoData.en,
            },
            ar: { ...seoData.ar },
          }
        }
      }
    }
    catch (err: any) {
      toast.error(t('common.error', 'Error'), { description: err.message || 'Failed to load page' })
    }
    finally {
      loading.value = false
    }
  }
})

// ── Auto-generate slug from title ─────────────────────────────────────────────
function onTitleChange(val: { en: string, ar: string }) {
  page.title = val

  // Clear title validation errors on change
  delete inlineErrors.value['title.en']
  delete inlineErrors.value['title.ar']
  delete backendErrors.value['title.en']
  delete backendErrors.value['title.ar']

  if (!isEdit.value) {
    page.slug.en = val.en
      .toLowerCase()
      .replace(/[^a-z0-9\s_]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
    page.slug.ar = val.ar
      .replace(/[^\u0600-\u06FF0-9\s_]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')

    // Clear slug validation errors since it auto-populated
    delete inlineErrors.value['slug.en']
    delete inlineErrors.value['slug.ar']
    delete backendErrors.value['slug.en']
    delete backendErrors.value['slug.ar']
  }
}

function validateSlugLocale(slug: string, locale: 'en' | 'ar') {
  if (!slug)
    return
  // Snake case: letters, numbers, and underscores only
  const isSnakeCase
    = locale === 'ar' ? /^[\u0600-\u06FF0-9_]+$/.test(slug) : /^[a-z0-9_]+$/.test(slug)

  if (!isSnakeCase) {
    inlineErrors.value[`slug.${locale}`] = t(
      'cms.error_slug_snake_case',
      'Slug must be in snake_case (lowercase letters, numbers, and underscores only without spaces)',
    )
  }
}

function onSlugChange(val: { en: string, ar: string }) {
  page.slug = val
  // Clear slug validation errors on change
  delete inlineErrors.value['slug.en']
  delete inlineErrors.value['slug.ar']
  delete backendErrors.value['slug.en']
  delete backendErrors.value['slug.ar']

  validateSlugLocale(val.en, 'en')
  validateSlugLocale(val.ar, 'ar')
}

// ── Validation ────────────────────────────────────────────────────────────────
function validate(): boolean {
  inlineErrors.value = {}

  if (!page.title.en.trim()) {
    inlineErrors.value['title.en'] = t('cms.error_title_required', 'English page title is required')
  }

  if (!page.slug.en.trim()) {
    inlineErrors.value['slug.en'] = t('cms.error_slug_required', 'English slug is required')
  }
  else {
    validateSlugLocale(page.slug.en, 'en')
  }

  if (page.slug.ar.trim()) {
    validateSlugLocale(page.slug.ar, 'ar')
  }

  return Object.keys(inlineErrors.value).length === 0
}

// ── Submit ────────────────────────────────────────────────────────────────────
async function handleSubmit() {
  if (!validate())
    return

  saving.value = true
  backendErrors.value = {}

  try {
    if (isEdit.value) {
      // ── Edit mode: update page metadata + batch SEO ──
      const updatePayload: UpdatePagePayload = {
        title: page.title,
      }
      await cmsPageService.update(pageId.value!, updatePayload)

      // Save SEO separately via batch endpoint
      const cleanedSeo = cleanSeoPayload(seo.value) as
        | Record<string, Partial<CmsSeoMeta>>
        | undefined
      const hasSeo = cleanedSeo && Object.keys(cleanedSeo).length > 0
      if (hasSeo) {
        await cmsSeoService.saveBatch(pageId.value!, {
          default: 'en',
          locales: cleanedSeo!,
        })
      }

      queryClient.invalidateQueries({ queryKey: ['cms-pages'] })
      toast.success(t('common.updated_successfully', 'Page updated successfully'))
      router.push({ name: 'admin-cms' })
    }
    else {
      // ── Create mode: send slug, title, optional SEO ──
      const cleanedSeo = cleanSeoPayload(seo.value) as
        | Record<string, Partial<CmsSeoMeta>>
        | undefined
      const hasSeo = cleanedSeo && Object.keys(cleanedSeo).length > 0

      const createPayload: CreatePagePayload = {
        slug: page.slug,
        title: page.title,
        ...(hasSeo ? { seo: cleanedSeo } : {}),
      }
      await cmsPageService.create(createPayload)

      queryClient.invalidateQueries({ queryKey: ['cms-pages'] })
      toast.success(t('common.created_successfully', 'Page created successfully'))
      router.push({ name: 'admin-cms' })
    }
  }
  catch (err: any) {
    // Parse 422 validation errors
    if (err.response?.status === 422 && err.response?.data?.errors) {
      const translatedErrors: Record<string, string[]> = {}
      for (const [key, msgs] of Object.entries(err.response.data.errors)) {
        translatedErrors[key] = (msgs as string[]).map(m => t(m, m))
      }
      backendErrors.value = translatedErrors
      const messages = Object.values(translatedErrors).flat()
      toast.error(t('common.validation_error', 'Validation Error'), {
        description: messages.join(', '),
      })
    }
    else {
      toast.error(t('common.error', 'Error'), {
        description: err.response?.data?.message || err.message || 'Failed to save page',
      })
    }
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto pb-20">
    <!-- Page Header -->
    <div class="mb-8 flex items-center gap-3">
      <h1 class="text-2xl font-semibold text-foreground">
        {{ isEdit ? $t('cms.edit_page', 'Edit Page') : $t('cms.create_page', 'Create New Page') }}
      </h1>
      <Badge variant="outline" class="text-xs uppercase tracking-wider">
        {{ $t('cms.cms', 'CMS') }}
      </Badge>
    </div>

    <!-- ═══ Skeleton Loading State ═══════════════════════════════════════════ -->
    <template v-if="loading">
      <Card class="mb-6">
        <CardHeader>
          <Skeleton class="h-5 w-24" />
        </CardHeader>
        <CardContent class="space-y-6">
          <div>
            <Skeleton class="h-4 w-20 mb-2" />
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton class="h-10 w-full rounded-md" />
              <Skeleton class="h-10 w-full rounded-md" />
            </div>
          </div>
          <div>
            <Skeleton class="h-4 w-16 mb-2" />
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton class="h-10 w-full rounded-md" />
              <Skeleton class="h-10 w-full rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card class="mb-6">
        <CardHeader>
          <Skeleton class="h-5 w-12" />
        </CardHeader>
      </Card>
      <div class="flex items-center justify-end pt-4 border-t border-border">
        <Skeleton class="h-10 w-32 rounded-md" />
      </div>
    </template>

    <!-- ═══ Actual Form Content ═══════════════════════════════════════════ -->
    <template v-else>
      <!-- ═══ Page Info ═════════════════════════════════════════════════════ -->
      <Card class="mb-6">
        <CardHeader>
          <CardTitle class="text-base">
            {{ $t('cms.page_info', 'Page Info') }}
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BilingualInput
              :model-value="page.title"
              :label="$t('cms.page_title', 'Page Title')"
              input-type="text"
              required
              :error-en="inlineErrors['title.en'] || backendErrors['title.en']?.[0]"
              :error-ar="inlineErrors['title.ar'] || backendErrors['title.ar']?.[0]"
              class="col-span-1 md:col-span-2"
              @update:model-value="onTitleChange"
            />
            <BilingualInput
              :model-value="page.slug"
              :label="$t('cms.slug', 'Slug')"
              input-type="text"
              required
              :disabled="isEdit"
              :error-en="inlineErrors['slug.en'] || backendErrors['slug.en']?.[0]"
              :error-ar="inlineErrors['slug.ar'] || backendErrors['slug.ar']?.[0]"
              class="col-span-1 md:col-span-2"
              @update:model-value="onSlugChange"
            />
            <!-- Status & sections hint -->
            <div class="col-span-1 md:col-span-2 flex items-center gap-4">
              <p class="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 flex-1">
                {{
                  isEdit
                    ? $t(
                      'cms.edit_status_hint',
                      'Status is managed from the pages list using Publish / Unpublish.',
                    )
                    : $t(
                      'cms.create_status_hint',
                      'New pages are created as Draft. You can publish them from the pages list after creation.',
                    )
                }}
              </p>
              <!-- Sections count badge (edit mode only) -->
              <div v-if="isEdit" class="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" class="text-xs">
                  {{ page.sectionsCount }} {{ $t('cms.sections', 'sections') }}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  class="text-xs"
                  @click="router.push({ name: 'admin-cms-edit', params: { id: pageId } })"
                >
                  {{ $t('cms.manage_sections', 'Manage Sections') }}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- ═══ SEO Panel ════════════════════════════════════════════════════ -->
      <div class="mb-6">
        <PageSeoPanel v-model="seo" :open="showSeo" @update:open="showSeo = $event" />
      </div>

      <!-- ═══ Footer Actions ═══════════════════════════════════════════════ -->
      <div class="flex items-center justify-between pt-4 border-t border-border">
        <p class="text-sm text-muted-foreground">
          {{
            isEdit
              ? $t(
                'cms.editing_page_hint',
                'Editing page metadata and SEO. Manage sections from the structure editor.',
              )
              : $t('cms.creating_page_hint', 'Create the page first, then add sections.')
          }}
        </p>
        <div class="flex gap-3">
          <Button
            variant="secondary"
            :disabled="saving"
            @click="router.push({ name: 'admin-cms' })"
          >
            {{ $t('common.cancel', 'Cancel') }}
          </Button>
          <Button :loading="saving" :disabled="saving" @click="handleSubmit">
            {{
              isEdit
                ? $t('common.save_changes', 'Save Changes')
                : $t('cms.create_page', 'Create Page')
            }}
          </Button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>

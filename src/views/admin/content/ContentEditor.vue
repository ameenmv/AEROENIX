<script setup lang="ts">
import type { StaticPageContent } from '@/services/contentService'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import ModularView from '@/components/admin/ModularView.vue'
import { Button } from '@/components/uic/button'
import { contentService } from '@/services/contentService'

const { t } = useI18n()
const route = useRoute()

const pageSlug = computed(() => route.params.page as string)
const loading = ref(true)
const saving = ref(false)
const pageData = ref<StaticPageContent | null>(null)
const successMessage = ref('')

const videoIcon = '▶'
const imageIcon = '🖼'
const dashIcon = '—'

async function fetchPage() {
  loading.value = true
  try {
    pageData.value = await contentService.getBySlug(pageSlug.value)
  }
  catch (err) {
    console.error('Error fetching content page:', err)
  }
  finally {
    loading.value = false
  }
}

async function savePage() {
  if (!pageData.value)
    return
  saving.value = true
  successMessage.value = ''
  try {
    await contentService.updateBySlug(pageSlug.value, pageData.value)
    successMessage.value = t('content.saved_successfully')
    setTimeout(() => (successMessage.value = ''), 3000)
  }
  catch (err) {
    console.error('Error saving content page:', err)
  }
  finally {
    saving.value = false
  }
}

function updateSectionField(sectionIndex: number, fieldKey: string, value: string) {
  if (pageData.value?.sections) {
    pageData.value.sections[sectionIndex]!.fields[fieldKey] = value
  }
}

function updateSectionAttachment(sectionIndex: number, value: string) {
  if (pageData.value?.sections) {
    pageData.value.sections[sectionIndex]!.attachment_url = value
  }
}

onMounted(fetchPage)
watch(pageSlug, fetchPage)
</script>

<template>
  <ModularView>
    <div class="px-6 py-6 pb-20 sm:pb-6 max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-foreground">
            {{ t(`content.pages.${pageSlug}`, pageSlug) }}
          </h1>
          <p class="text-sm text-muted-foreground mt-1">
            {{ t('content.edit_page_content') }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <div v-if="successMessage" class="text-sm text-green-600 dark:text-green-400 font-medium">
            {{ successMessage }}
          </div>
          <Button :disabled="saving || loading" @click="savePage">
            {{ saving ? t('content.saving') : t('content.save_changes') }}
          </Button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="py-12 text-center text-muted-foreground">
        {{ t('common.loading') }}
      </div>

      <!-- Sections Form (for section-based pages) -->
      <template v-else-if="pageData?.page_type === 'sections' && pageData.sections">
        <div
          v-for="(section, secIdx) in pageData.sections"
          :key="section.key"
          class="bg-card p-6 rounded-xl shadow-sm border mb-4"
        >
          <h3 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span
              class="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold"
              :class="
                section.attachment_type === 'video'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : section.attachment_type === 'image'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              "
            >
              <template v-if="section.attachment_type === 'video'">{{ videoIcon }}</template>
              <template v-else-if="section.attachment_type === 'image'">{{ imageIcon }}</template>
              <template v-else>{{ dashIcon }}</template>
            </span>
            {{ t(`content.sections.${section.key}`, section.key) }}
          </h3>

          <!-- Section Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div v-for="(value, fieldKey) in section.fields" :key="fieldKey" class="space-y-1">
              <label class="text-sm font-medium text-foreground/70">
                {{ t(`content.fields.${fieldKey}`, fieldKey as string) }}
              </label>
              <textarea
                v-if="fieldKey === 'description' || fieldKey === 'bio'"
                :value="value"
                class="w-full px-3 py-2 bg-background border rounded-lg text-foreground text-sm min-h-[80px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                dir="rtl"
                @input="
                  updateSectionField(
                    secIdx,
                    fieldKey as string,
                    ($event.target as HTMLTextAreaElement).value,
                  )
                "
              />
              <input
                v-else
                :value="value"
                type="text"
                class="w-full px-3 py-2 bg-background border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                dir="rtl"
                @input="
                  updateSectionField(
                    secIdx,
                    fieldKey as string,
                    ($event.target as HTMLInputElement).value,
                  )
                "
              >
            </div>
          </div>

          <!-- Attachment -->
          <div v-if="section.attachment_type !== 'none'" class="space-y-1 border-t pt-4 mt-2">
            <label class="text-sm font-medium text-foreground/70">
              {{
                section.attachment_type === 'video'
                  ? t('content.video_url')
                  : t('content.image_url')
              }}
            </label>
            <input
              :value="section.attachment_url"
              type="text"
              class="w-full px-3 py-2 bg-background border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              dir="ltr"
              @input="updateSectionAttachment(secIdx, ($event.target as HTMLInputElement).value)"
            >
          </div>
        </div>
      </template>

      <!-- Legal Form (for privacy/terms pages) -->
      <template v-else-if="pageData?.page_type === 'legal' && pageData.legal_content">
        <div class="bg-card p-6 rounded-xl shadow-sm border">
          <div class="space-y-4">
            <div class="space-y-1">
              <label class="text-sm font-medium text-foreground/70">{{
                t('content.content_html')
              }}</label>
              <textarea
                v-model="pageData.legal_content.content"
                class="w-full px-3 py-2 bg-background border rounded-lg text-foreground text-sm min-h-[300px] font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                dir="rtl"
              />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium text-foreground/70">{{
                t('content.last_updated')
              }}</label>
              <input
                v-model="pageData.legal_content.last_updated"
                type="date"
                class="w-full px-3 py-2 bg-background border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              >
            </div>
          </div>
        </div>
      </template>

      <!-- Published Toggle -->
      <div v-if="pageData" class="bg-card p-4 rounded-xl shadow-sm border mt-4">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            v-model="pageData.is_published"
            type="checkbox"
            class="w-4 h-4 rounded text-primary focus:ring-primary/20"
          >
          <span class="text-sm font-medium text-foreground">{{ t('content.published') }}</span>
        </label>
      </div>
    </div>
  </ModularView>
</template>

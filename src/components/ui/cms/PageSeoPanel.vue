<script setup lang="ts">
import type { CmsSeoMeta } from '@/types/cms'
import { computed, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { InputField } from '@/components/uic/input'
import { SelectField } from '@/components/uic/select'
import { Textarea } from '@/components/uic/textarea'

// ── Props & Emits ─────────────────────────────────────────────────────────────
interface Props {
  /** SEO data keyed by locale: { en: {...}, ar: {...} } */
  modelValue?: Record<string, Partial<CmsSeoMeta>>
  /** Whether the panel is expanded (used in standalone/collapsible mode) */
  open?: boolean
  /** Whether to show in read-only mode */
  readonly?: boolean
  /**
   * Active locale passed from parent.
   * When set, hides the internal locale tabs and uses this value instead.
   */
  locale?: 'en' | 'ar'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    en: { is_default: true, robots: 'index,follow', twitter_card: 'summary_large_image' },
    ar: {},
  }),
  open: false,
  readonly: false,
  locale: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: Record<string, Partial<CmsSeoMeta>>): void
  (e: 'update:open', val: boolean): void
}>()

const { t, messages } = useI18n()

// ── Local state ───────────────────────────────────────────────────────────────
const internalLocale = ref<'en' | 'ar'>('en')

/** Use parent-provided locale if available, otherwise fall back to internal */
const activeLocale = computed(() => props.locale ?? internalLocale.value)

// Helper to force translation to the currently selected tab's language
function tTab(key: string, fallback: string) {
  const parts = key.split('.')
  let val: any = messages.value[activeLocale.value]
  for (const part of parts) {
    if (!val)
      break
    val = val[part]
  }
  return typeof val === 'string' ? val : t(key, fallback)
}

const isOpen = computed({
  get: () => props.open,
  set: val => emit('update:open', val),
})

/** When locale prop is provided, hide the collapsible wrapper + internal tabs */
const isInline = computed(() => !!props.locale)

// Internal reactive copy of SEO data
const seo = reactive<Record<string, Partial<CmsSeoMeta>>>({
  en: { is_default: true, robots: 'index,follow', twitter_card: 'summary_large_image' },
  ar: {},
})

// Sync from parent → internal state
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      seo.en = { ...seo.en, ...val.en }
      seo.ar = { ...seo.ar, ...val.ar }
    }
  },
  { immediate: true, deep: true },
)

// Emit changes up
function emitUpdate() {
  emit('update:modelValue', JSON.parse(JSON.stringify(seo)))
}

function updateField(locale: 'en' | 'ar', field: string, value: any) {
  ;(seo[locale] as any)[field] = value
  emitUpdate()
}

// ── Robots presets ────────────────────────────────────────────────────────────
const robotsPresets = [
  { value: 'index,follow', label: 'Index, Follow' },
  { value: 'noindex,follow', label: 'No Index, Follow' },
  { value: 'index,nofollow', label: 'Index, No Follow' },
  { value: 'noindex,nofollow', label: 'No Index, No Follow' },
]

const twitterCardOptions = [
  { value: 'summary', label: 'Summary' },
  { value: 'summary_large_image', label: 'Summary Large Image' },
  { value: 'app', label: 'App' },
  { value: 'player', label: 'Player' },
]

// ── SERP Preview ──────────────────────────────────────────────────────────────
const serpTitle = computed(
  () => seo[activeLocale.value]?.title || tTab('cms.seo_preview_title', 'Page Title'),
)
const serpDescription = computed(
  () =>
    seo[activeLocale.value]?.description
    || tTab('cms.seo_preview_description', 'Page description will appear here.'),
)
const serpUrl = computed(() => seo[activeLocale.value]?.canonical_url || 'https://example.com/page')
</script>

<template>
  <!-- ── Inline mode: no wrapper, no tabs (used in ContentPageEditor) ── -->
  <div v-if="isInline" class="space-y-6">
    <!-- SERP Preview -->
    <div class="p-4 rounded-lg bg-muted/30 border border-border/50">
      <p class="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
        {{ tTab('cms.seo_preview', 'Search Preview') }}
      </p>
      <div class="space-y-1" :dir="activeLocale === 'ar' ? 'rtl' : 'ltr'">
        <p class="text-blue-500 text-base font-medium truncate">
          {{ serpTitle }}
        </p>
        <p class="text-emerald-600 text-xs truncate">
          {{ serpUrl }}
        </p>
        <p class="text-sm text-muted-foreground line-clamp-2">
          {{ serpDescription }}
        </p>
      </div>
    </div>

    <!-- SEO Fields -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4" :dir="activeLocale === 'ar' ? 'rtl' : 'ltr'">
      <InputField
        :model-value="seo[activeLocale]?.title || ''"
        :label="tTab('cms.seo_title', 'SEO Title')"
        :placeholder="tTab('cms.seo_title_placeholder', 'Page title for search engines')"
        :disabled="readonly"
        @update:model-value="(v: any) => updateField(activeLocale, 'title', v)"
      />
      <InputField
        :model-value="seo[activeLocale]?.keywords || ''"
        :label="tTab('cms.seo_keywords', 'Keywords')"
        :placeholder="tTab('cms.seo_keywords_placeholder', 'keyword1, keyword2')"
        :disabled="readonly"
        @update:model-value="(v: any) => updateField(activeLocale, 'keywords', v)"
      />
      <div class="col-span-1 md:col-span-2">
        <label class="text-sm font-semibold tracking-tight text-foreground mb-1.5 block">
          {{ tTab('cms.seo_description', 'Meta Description') }}
        </label>
        <Textarea
          :model-value="seo[activeLocale]?.description || ''"
          :placeholder="
            tTab('cms.seo_description_placeholder', 'Describe this page for search engines')
          "
          :disabled="readonly"
          :rows="3"
          class="w-full"
          @update:model-value="(v: any) => updateField(activeLocale, 'description', v)"
        />
      </div>

      <!-- Canonical URL & Robots -->
      <InputField
        :model-value="seo[activeLocale]?.canonical_url || ''"
        :label="tTab('cms.seo_canonical', 'Canonical URL')"
        :placeholder="tTab('cms.seo_canonical_placeholder', 'https://example.com/page')"
        :disabled="readonly"
        @update:model-value="(v: any) => updateField(activeLocale, 'canonical_url', v)"
      />
      <SelectField
        :model-value="seo[activeLocale]?.robots || ''"
        :label="tTab('cms.seo_robots', 'Robots')"
        :placeholder="tTab('cms.robots_default', 'Not set')"
        :options="robotsPresets"
        :disabled="readonly"
        @update:model-value="(v: any) => updateField(activeLocale, 'robots', v)"
      />

      <!-- OG Fields -->
      <InputField
        :model-value="seo[activeLocale]?.og_title || ''"
        :label="tTab('cms.seo_og_title', 'OG Title')"
        :placeholder="tTab('cms.seo_og_title_placeholder', 'Title for social sharing')"
        :disabled="readonly"
        @update:model-value="(v: any) => updateField(activeLocale, 'og_title', v)"
      />
      <InputField
        :model-value="seo[activeLocale]?.og_description || ''"
        :label="tTab('cms.seo_og_desc', 'OG Description')"
        :placeholder="tTab('cms.seo_og_desc_placeholder', 'Description for social sharing')"
        :disabled="readonly"
        @update:model-value="(v: any) => updateField(activeLocale, 'og_description', v)"
      />
      <!-- OG Image (UUID or media ID) -->
      <InputField
        :model-value="String(seo[activeLocale]?.og_image || '')"
        :label="tTab('cms.seo_og_image', 'OG Image')"
        :placeholder="tTab('cms.seo_og_image_placeholder', 'Image ID (UUID)')"
        :disabled="readonly"
        @update:model-value="(v: any) => updateField(activeLocale, 'og_image', v)"
      />

      <!-- Twitter -->
      <SelectField
        :model-value="seo[activeLocale]?.twitter_card || ''"
        :label="tTab('cms.seo_twitter_card', 'Twitter Card')"
        :placeholder="tTab('cms.not_set', 'Not set')"
        :options="twitterCardOptions"
        :disabled="readonly"
        @update:model-value="(v: any) => updateField(activeLocale, 'twitter_card', v)"
      />
    </div>
  </div>

  <!-- ── Standalone mode: collapsible wrapper + own locale tabs ── -->
  <div v-else class="rounded-xl border border-border bg-card overflow-hidden">
    <!-- Header (collapsible) -->
    <button
      class="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors cursor-pointer"
      @click="isOpen = !isOpen"
    >
      <div class="flex items-center gap-2">
        <h3 class="text-base font-semibold text-foreground">
          {{ t('cms.seo', 'SEO') }}
        </h3>
        <span
          class="text-[10px] uppercase tracking-wider text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded"
        >
          {{ t('cms.optional', 'Optional') }}
        </span>
      </div>
      <span
        class="text-muted-foreground transition-transform text-lg"
        :class="isOpen ? 'rotate-180' : ''"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </button>

    <!-- Content -->
    <Transition name="slide">
      <div v-if="isOpen" class="px-6 pb-6 space-y-6">
        <!-- Locale Tabs -->
        <div class="flex items-center gap-1 border-b border-border">
          <button
            class="px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
            :class="
              internalLocale === 'en'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="internalLocale = 'en'"
          >
            {{ t('common.lang_en_short', 'EN') }}
          </button>
          <button
            class="px-4 py-2 text-sm font-medium transition-colors cursor-pointer"
            :class="
              internalLocale === 'ar'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="internalLocale = 'ar'"
          >
            {{ t('common.lang_ar_short', 'AR') }}
          </button>
        </div>

        <!-- SERP Preview -->
        <div class="p-4 rounded-lg bg-muted/30 border border-border/50">
          <p class="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
            {{ tTab('cms.seo_preview', 'Search Preview') }}
          </p>
          <div class="space-y-1" :dir="activeLocale === 'ar' ? 'rtl' : 'ltr'">
            <p class="text-blue-500 text-base font-medium truncate">
              {{ serpTitle }}
            </p>
            <p class="text-emerald-600 text-xs truncate">
              {{ serpUrl }}
            </p>
            <p class="text-sm text-muted-foreground line-clamp-2">
              {{ serpDescription }}
            </p>
          </div>
        </div>

        <!-- SEO Fields -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
          :dir="activeLocale === 'ar' ? 'rtl' : 'ltr'"
        >
          <InputField
            :model-value="seo[activeLocale]?.title || ''"
            :label="tTab('cms.seo_title', 'SEO Title')"
            :placeholder="tTab('cms.seo_title_placeholder', 'Page title for search engines')"
            :disabled="readonly"
            @update:model-value="(v: any) => updateField(activeLocale, 'title', v)"
          />
          <InputField
            :model-value="seo[activeLocale]?.keywords || ''"
            :label="tTab('cms.seo_keywords', 'Keywords')"
            :placeholder="tTab('cms.seo_keywords_placeholder', 'keyword1, keyword2')"
            :disabled="readonly"
            @update:model-value="(v: any) => updateField(activeLocale, 'keywords', v)"
          />
          <div class="col-span-1 md:col-span-2">
            <label class="text-sm font-semibold tracking-tight text-foreground mb-1.5 block">
              {{ tTab('cms.seo_description', 'Meta Description') }}
            </label>
            <Textarea
              :model-value="seo[activeLocale]?.description || ''"
              :placeholder="
                tTab('cms.seo_description_placeholder', 'Describe this page for search engines')
              "
              :disabled="readonly"
              :rows="3"
              class="w-full"
              @update:model-value="(v: any) => updateField(activeLocale, 'description', v)"
            />
          </div>

          <!-- Canonical URL & Robots (EN only typically, but available for both) -->
          <InputField
            :model-value="seo[activeLocale]?.canonical_url || ''"
            :label="tTab('cms.seo_canonical', 'Canonical URL')"
            :placeholder="tTab('cms.seo_canonical_placeholder', 'https://example.com/page')"
            :disabled="readonly"
            @update:model-value="(v: any) => updateField(activeLocale, 'canonical_url', v)"
          />
          <SelectField
            :model-value="seo[activeLocale]?.robots || ''"
            :label="tTab('cms.seo_robots', 'Robots')"
            :placeholder="tTab('cms.robots_default', 'Not set')"
            :options="robotsPresets"
            :disabled="readonly"
            @update:model-value="(v: any) => updateField(activeLocale, 'robots', v)"
          />

          <!-- OG Fields -->
          <InputField
            :model-value="seo[activeLocale]?.og_title || ''"
            :label="tTab('cms.seo_og_title', 'OG Title')"
            :placeholder="tTab('cms.seo_og_title_placeholder', 'Title for social sharing')"
            :disabled="readonly"
            @update:model-value="(v: any) => updateField(activeLocale, 'og_title', v)"
          />
          <InputField
            :model-value="seo[activeLocale]?.og_description || ''"
            :label="tTab('cms.seo_og_desc', 'OG Description')"
            :placeholder="tTab('cms.seo_og_desc_placeholder', 'Description for social sharing')"
            :disabled="readonly"
            @update:model-value="(v: any) => updateField(activeLocale, 'og_description', v)"
          />
          <!-- OG Image (UUID or media ID) -->
          <InputField
            :model-value="String(seo[activeLocale]?.og_image || '')"
            :label="tTab('cms.seo_og_image', 'OG Image')"
            :placeholder="tTab('cms.seo_og_image_placeholder', 'Image ID (UUID)')"
            :disabled="readonly"
            @update:model-value="(v: any) => updateField(activeLocale, 'og_image', v)"
          />

          <!-- Twitter -->
          <SelectField
            :model-value="seo[activeLocale]?.twitter_card || ''"
            :label="tTab('cms.seo_twitter_card', 'Twitter Card')"
            :placeholder="tTab('cms.not_set', 'Not set')"
            :options="twitterCardOptions"
            :disabled="readonly"
            @update:model-value="(v: any) => updateField(activeLocale, 'twitter_card', v)"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}
.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 2000px;
}
</style>

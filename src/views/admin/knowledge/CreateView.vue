<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Save,
  Sliders,
  Tag,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import { knowledgeService } from '@/services/knowledgeService'
import { KNOWLEDGE_CATEGORIES } from '@/types/entities/knowledge'
import type { KnowledgeCategory, KnowledgeCreatePayload } from '@/types/entities/knowledge'
import KnowledgePreviewCard from '@/components/admin/knowledge/KnowledgePreviewCard.vue'

import { Button } from '@/components/uic/button'
import { Input } from '@/components/uic/input'
import { Textarea } from '@/components/uic/textarea'
import { Label } from '@/components/uic/label'
import { Slider } from '@/components/uic/slider'
import { Card } from '@/components/uic/card'

const { t } = useI18n()
const router = useRouter()
const queryClient = useQueryClient()

// ── Form State ───────────────────────────────────────────────────────────────
const form = ref<KnowledgeCreatePayload>({
  category: 'general',
  title: '',
  content: '',
  priority: 5,
  status: 'active',
})

// ── Validation ───────────────────────────────────────────────────────────────
const errors = ref<Record<string, string>>({})
const hasAttemptedSubmit = ref(false)

function validateField(field: string) {
  if (!hasAttemptedSubmit.value) return
  delete errors.value[field]

  switch (field) {
    case 'title':
      if (!form.value.title.trim()) {
        errors.value.title = t('knowledge.errors.title_required', 'Title is required.')
      }
      break
    case 'content':
      if (!form.value.content.trim()) {
        errors.value.content = t('knowledge.errors.content_required', 'Content is required.')
      }
      break
    case 'category':
      if (!form.value.category) {
        errors.value.category = t('knowledge.errors.category_required', 'Please select a category.')
      }
      break
  }
}

function validate(): boolean {
  hasAttemptedSubmit.value = true
  errors.value = {}

  if (!form.value.title.trim()) {
    errors.value.title = t('knowledge.errors.title_required', 'Title is required.')
  }
  if (!form.value.content.trim()) {
    errors.value.content = t('knowledge.errors.content_required', 'Content is required.')
  }
  if (!form.value.category) {
    errors.value.category = t('knowledge.errors.category_required', 'Please select a category.')
  }

  return Object.keys(errors.value).length === 0
}

watch(() => form.value.title, () => validateField('title'))
watch(() => form.value.content, () => validateField('content'))
watch(() => form.value.category, () => validateField('category'))

// ── Submit ───────────────────────────────────────────────────────────────────
const createMutation = useMutation({
  mutationFn: (data: KnowledgeCreatePayload) => knowledgeService.create(data),
  onSuccess: () => {
    toast.success(t('knowledge.created', 'Knowledge entry created successfully!'))
    queryClient.invalidateQueries({ queryKey: ['knowledge'] })
    router.push({ name: 'admin-knowledge' })
  },
  onError: (err: any) => {
    const msg = err?.response?.data?.message || t('knowledge.create_error', 'Failed to create entry.')
    toast.error(msg)
  },
})

function handleSubmit() {
  if (!validate()) return
  createMutation.mutate(form.value)
}

function selectCategory(cat: KnowledgeCategory) {
  form.value.category = cat
}

// ── Priority Helpers ─────────────────────────────────────────────────────────
function getPriorityLabel(value: number): string {
  if (value >= 8) return 'Critical'
  if (value >= 5) return 'High'
  if (value >= 3) return 'Medium'
  return 'Low'
}

function getPriorityColor(value: number): string {
  if (value >= 8) return 'text-rose-400 bg-rose-500/10 border-rose-500/25'
  if (value >= 5) return 'text-amber-400 bg-amber-500/10 border-amber-500/25'
  if (value >= 3) return 'text-sky-400 bg-sky-500/10 border-sky-500/25'
  return 'text-muted-foreground bg-muted/40 border-border/40'
}

const charCount = computed(() => form.value.content?.length || 0)
const wordCount = computed(() => {
  const text = form.value.content?.trim()
  return text ? text.split(/\s+/).length : 0
})
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-7 pb-20 px-2 sm:px-4 animate-in fade-in duration-300">
    <!-- ── Header ──────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3.5">
        <Button
          variant="ghost"
          size="icon"
          class="shrink-0 rounded-xl hover:bg-muted/50"
          @click="router.push({ name: 'admin-knowledge' })"
        >
          <ArrowLeft class="w-5 h-5 rtl:rotate-180" />
        </Button>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold tracking-tight text-foreground">
              {{ t('knowledge.create_title', 'Add Knowledge Entry') }}
            </h1>
            
          </div>
          <p class="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {{ t('knowledge.create_subtitle', 'Add a question, policy, or information for the AI to use when answering guests.') }}
          </p>
        </div>
      </div>
    </div>

    <!-- ── 2-Column Responsive Layout ──────────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Column: The Form (7 cols) -->
      <form class="lg:col-span-7 space-y-6" @submit.prevent="handleSubmit">
        <Card class="rounded-2xl border-border/40 bg-card/70 backdrop-blur-md p-6 sm:p-7 space-y-6 shadow-sm">
          <!-- 1. Category Selection Pills -->
          <div class="space-y-2.5">
            <div class="flex items-center justify-between">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Tag class="w-3.5 h-3.5 text-primary" />
                {{ t('knowledge.field_category', 'Category') }}
              </Label>
              <span class="text-xs text-muted-foreground/60 capitalize font-medium">
                {{ form.category }}
              </span>
            </div>

            <!-- Visual Category Pills -->
            <div class="flex flex-wrap gap-2">
              <button
                v-for="cat in KNOWLEDGE_CATEGORIES"
                :key="cat"
                type="button"
                class="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all duration-200"
                :class="form.category === cat
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs scale-102'
                  : 'bg-background/60 hover:bg-muted/50 text-muted-foreground hover:text-foreground border-border/40'"
                @click="selectCategory(cat)"
              >
                {{ cat }}
              </button>
            </div>
            <p v-if="errors.category" class="text-xs text-destructive mt-1">{{ errors.category }}</p>
          </div>

          <div class="h-px bg-border/40" />

          <!-- 2. Question / Title -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label for="title" class="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <HelpCircle class="w-3.5 h-3.5 text-primary" />
                {{ t('knowledge.field_title', 'Title / Question') }}
              </Label>
              <span class="text-[11px] font-mono text-muted-foreground/60">
                {{ form.title.length }}/150
              </span>
            </div>
            <Input
              id="title"
              v-model="form.title"
              maxlength="150"
              :placeholder="t('knowledge.title_placeholder', 'e.g. What time is check-in?')"
              class="h-11 rounded-xl bg-background/60 border-border/40 text-sm focus-visible:ring-primary/20"
              :class="[errors.title ? 'border-destructive' : '']"
            />
            <p v-if="errors.title" class="text-xs text-destructive mt-1">{{ errors.title }}</p>
            <p class="text-[11px] text-muted-foreground/70">
              {{ t('knowledge.title_hint', 'The topic or question a guest might ask about.') }}
            </p>
          </div>

          <!-- 3. Answer / Content -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label for="content" class="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BookOpen class="w-3.5 h-3.5 text-primary" />
                {{ t('knowledge.field_content', 'Content / Answer') }}
              </Label>
              <span class="text-[11px] font-mono text-muted-foreground/60">
                {{ wordCount }} words • {{ charCount }} chars
              </span>
            </div>
            <Textarea
              id="content"
              v-model="form.content"
              rows="6"
              :placeholder="t('knowledge.content_placeholder', 'e.g. Check-in time is at 2:00 PM. Early check-in is available upon request.')"
              class="rounded-xl bg-background/60 border-border/40 text-sm leading-relaxed focus-visible:ring-primary/20 resize-y"
              :class="[errors.content ? 'border-destructive' : '']"
            />
            <p v-if="errors.content" class="text-xs text-destructive mt-1">{{ errors.content }}</p>
            <p class="text-[11px] text-muted-foreground/70">
              {{ t('knowledge.content_hint', 'The information the AI should use to answer. Be specific and accurate.') }}
            </p>
          </div>

          <div class="h-px bg-border/40" />

          <!-- 4. Priority & Status Controls -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
            <!-- Priority Slider -->
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <Label for="priority" class="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sliders class="w-3.5 h-3.5 text-primary" />
                  {{ t('knowledge.field_priority', 'Priority') }}
                </Label>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider border"
                  :class="getPriorityColor(form.priority ?? 5)"
                >
                  {{ getPriorityLabel(form.priority ?? 5) }} ({{ form.priority }})
                </span>
              </div>
              <div class="pt-2">
                <Slider
                  id="priority"
                  :model-value="[form.priority ?? 5]"
                  :min="1"
                  :max="10"
                  :step="1"
                  class="w-full"
                  @update:model-value="(val?: number[]) => form.priority = val?.[0] ?? 5"
                />
              </div>
              <p class="text-[11px] text-muted-foreground/70">
                {{ t('knowledge.priority_hint', 'Higher priority entries are preferred by the AI when multiple entries match.') }}
              </p>
            </div>

            <!-- Status Switch -->
            <div class="space-y-2.5">
              <Label class="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                {{ t('knowledge.field_status', 'Status') }}
              </Label>
              <div class="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  role="switch"
                  :aria-checked="form.status === 'active'"
                  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  :class="form.status === 'active' ? 'bg-primary border-primary' : 'bg-muted border-border/60'"
                  @click="form.status = form.status === 'active' ? 'inactive' : 'active'"
                >
                  <span
                    class="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out"
                    :class="form.status === 'active' ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0.5 rtl:-translate-x-0.5'"
                  />
                </button>
                <span
                  class="text-xs font-semibold select-none"
                  :class="form.status === 'active' ? 'text-emerald-400' : 'text-muted-foreground'"
                >
                  {{ form.status === 'active' ? t('knowledge.active', 'Active (AI Uses)') : t('knowledge.inactive', 'Inactive') }}
                </span>
              </div>
              <p class="text-[11px] text-muted-foreground/70">
                {{ t('knowledge.status_hint', 'Only active entries are used by the AI.') }}
              </p>
            </div>
          </div>
        </Card>

        <!-- Form Action Buttons -->
        <div class="flex items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            class="rounded-xl px-5 text-xs font-semibold"
            @click="router.push({ name: 'admin-knowledge' })"
          >
            {{ t('common.cancel', 'Cancel') }}
          </Button>

          <Button
            type="submit"
            class="rounded-xl px-6 text-xs font-semibold gap-2 shadow-xs min-w-[140px]"
            :disabled="createMutation.isPending.value"
          >
            <span v-if="createMutation.isPending.value" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            <Save v-else class="w-4 h-4" />
            {{ createMutation.isPending.value ? t('common.saving', 'Saving...') : t('knowledge.save', 'Save Entry') }}
          </Button>
        </div>
      </form>

      <!-- Right Column: Live AI Guest Chat Preview (5 cols) -->
      <div class="lg:col-span-5 space-y-5 lg:sticky lg:top-6">
        <!-- Live Preview Component -->
        <KnowledgePreviewCard
          :title="form.title"
          :content="form.content"
          :category="form.category"
          :priority="form.priority"
          :status="form.status"
        />

        <!-- Tips Card -->
        <Card class="rounded-2xl border-border/40 bg-card/50 p-5 space-y-3">
          <div class="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Lightbulb class="w-4 h-4" />
            <span>AI Knowledge Best Practices</span>
          </div>
          <ul class="space-y-2 text-xs text-muted-foreground/90 leading-relaxed list-disc ps-4">
            <li>Keep the question natural and direct, as guests would type it.</li>
            <li>Include exact times, prices, or room numbers in the answer.</li>
            <li>Set higher priority (7-10) for crucial policies like check-in or cancellation.</li>
          </ul>
        </Card>
      </div>
    </div>
  </div>
</template>

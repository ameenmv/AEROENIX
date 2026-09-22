<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  BookOpen01Icon,
  ArrowLeft01Icon,
  CheckmarkBadge01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'

import { knowledgeService } from '@/services/knowledgeService'
import { KNOWLEDGE_CATEGORIES } from '@/types/entities/knowledge'
import type { KnowledgeCreatePayload } from '@/types/entities/knowledge'

import { Button } from '@/components/uic/button'
import { Input } from '@/components/uic/input'
import { Textarea } from '@/components/uic/textarea'
import { Label } from '@/components/uic/label'
import { Slider } from '@/components/uic/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/uic/select'

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

  // Clear the specific field error first
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

// Real-time validation — clear/show errors as the user types
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
    // Handle 422 validation errors from backend
    if (err.status === 422 && err.errors) {
      errors.value = {}
      for (const [field, messages] of Object.entries(err.errors)) {
        errors.value[field] = Array.isArray(messages) ? messages[0] : (messages as string)
      }
    } else {
      toast.error(err.message || t('knowledge.create_error', 'Failed to create entry.'))
    }
  },
})

function handleSubmit() {
  if (!validate()) return
  createMutation.mutate(form.value)
}

// ── Priority Label ───────────────────────────────────────────────────────────
function getPriorityLabel(value: number): string {
  if (value >= 8) return 'Critical'
  if (value >= 5) return 'High'
  if (value >= 3) return 'Medium'
  return 'Low'
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- ── Header ──────────────────────────────────────────────────────── -->
    <div class="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        class="shrink-0 rounded-full"
        @click="router.push({ name: 'admin-knowledge' })"
      >
        <HugeiconsIcon :icon="ArrowLeft01Icon" :size="20" />
      </Button>
      <div>
        <h1 class="text-2xl font-bold tracking-tight flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <HugeiconsIcon :icon="BookOpen01Icon" :size="22" class="text-primary" />
          </div>
          {{ t('knowledge.create_title', 'Add Knowledge Entry') }}
        </h1>
        <p class="text-sm text-muted-foreground mt-1">
          {{ t('knowledge.create_subtitle', 'Add a question, policy, or information for the AI to use when answering guests.') }}
        </p>
      </div>
    </div>

    <!-- ── Form ────────────────────────────────────────────────────────── -->
    <form class="space-y-6" @submit.prevent="handleSubmit">
      <!-- Card wrapper -->
      <div class="bg-card rounded-xl border border-border/50 divide-y divide-border/50">
        <!-- Category -->
        <div class="p-6">
          <Label for="category" class="text-sm font-semibold text-foreground mb-2 block">
            {{ t('knowledge.field_category', 'Category') }}
          </Label>
          <Select v-model="form.category">
            <SelectTrigger id="category" :class="[errors.category ? 'border-destructive' : '']">
              <SelectValue :placeholder="t('knowledge.select_category', 'Select a category')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="cat in KNOWLEDGE_CATEGORIES" :key="cat" :value="cat">
                {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.category" class="text-xs text-destructive mt-1.5">{{ errors.category }}</p>
          <p class="text-xs text-muted-foreground mt-1.5">
            {{ t('knowledge.category_hint', 'Group this entry by topic so the AI can find it faster.') }}
          </p>
        </div>

        <!-- Title / Question -->
        <div class="p-6">
          <Label for="title" class="text-sm font-semibold text-foreground mb-2 block">
            {{ t('knowledge.field_title', 'Title / Question') }}
          </Label>
          <Input
            id="title"
            v-model="form.title"
            :placeholder="t('knowledge.title_placeholder', 'e.g. What time is check-in?')"
            :class="[errors.title ? 'border-destructive' : '']"
          />
          <p v-if="errors.title" class="text-xs text-destructive mt-1.5">{{ errors.title }}</p>
          <p class="text-xs text-muted-foreground mt-1.5">
            {{ t('knowledge.title_hint', 'The topic or question a guest might ask about.') }}
          </p>
        </div>

        <!-- Content / Answer -->
        <div class="p-6">
          <Label for="content" class="text-sm font-semibold text-foreground mb-2 block">
            {{ t('knowledge.field_content', 'Content / Answer') }}
          </Label>
          <Textarea
            id="content"
            v-model="form.content"
            :placeholder="t('knowledge.content_placeholder', 'e.g. Check-in time is at 2:00 PM. Early check-in is available upon request.')"
            rows="5"
            :class="[errors.content ? 'border-destructive' : '']"
          />
          <p v-if="errors.content" class="text-xs text-destructive mt-1.5">{{ errors.content }}</p>
          <p class="text-xs text-muted-foreground mt-1.5">
            {{ t('knowledge.content_hint', 'The information the AI should use to answer. Be specific and accurate.') }}
          </p>
        </div>

        <!-- Priority & Status Row -->
        <div class="p-6 flex flex-col sm:flex-row gap-6">
          <!-- Priority -->
          <div class="flex-1">
            <Label for="priority" class="text-sm font-semibold text-foreground mb-2 block">
              {{ t('knowledge.field_priority', 'Priority') }}
              <span
                :class="[
                  'ml-2 text-xs font-bold uppercase',
                  form.priority! >= 8 ? 'text-red-500' :
                  form.priority! >= 5 ? 'text-amber-500' :
                  form.priority! >= 3 ? 'text-blue-500' :
                  'text-muted-foreground',
                ]"
              >
                {{ getPriorityLabel(form.priority || 0) }}
              </span>
            </Label>
            <div class="flex items-center gap-3">
              <Slider
                id="priority"
                :model-value="[form.priority ?? 5]"
                :min="0"
                :max="10"
                :step="1"
                class="flex-1 priority-slider"
                @update:model-value="(val?: number[]) => form.priority = val?.[0] ?? 5"
              />
              <span
                class="text-sm font-bold text-foreground w-8 text-center tabular-nums transition-all duration-200"
                :class="[
                  (form.priority ?? 0) >= 8 ? 'text-red-500 scale-110' :
                  (form.priority ?? 0) >= 5 ? 'text-amber-500' :
                  (form.priority ?? 0) >= 3 ? 'text-blue-500' :
                  'text-muted-foreground',
                ]"
              >
                {{ form.priority }}
              </span>
            </div>
            <p class="text-xs text-muted-foreground mt-1.5">
              {{ t('knowledge.priority_hint', 'Higher priority entries are preferred by the AI when multiple entries match.') }}
            </p>
          </div>

          <!-- Status -->
          <div class="sm:w-48 shrink-0">
            <Label class="text-sm font-semibold text-foreground mb-2 block">
              {{ t('knowledge.field_status', 'Status') }}
            </Label>
            <div class="flex items-center gap-3 mt-1">
              <button
                type="button"
                role="switch"
                :aria-checked="form.status === 'active'"
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                :class="form.status === 'active' ? 'bg-primary border-primary' : 'bg-zinc-600 border-zinc-500'"
                @click="form.status = form.status === 'active' ? 'inactive' : 'active'"
              >
                <span
                  class="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out"
                  :class="form.status === 'active' ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0.5 rtl:-translate-x-0.5'"
                />
              </button>
              <span
                :class="[
                  'text-sm font-semibold select-none',
                  form.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground',
                ]"
              >
                {{ form.status === 'active' ? t('knowledge.active', 'Active') : t('knowledge.inactive', 'Inactive') }}
              </span>
            </div>
            <p class="text-xs text-muted-foreground mt-1.5">
              {{ t('knowledge.status_hint', 'Only active entries are used by the AI.') }}
            </p>
          </div>
        </div>
      </div>

      <!-- ── Actions ─────────────────────────────────────────────────────── -->
      <div class="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          @click="router.push({ name: 'admin-knowledge' })"
        >
          {{ t('common.cancel', 'Cancel') }}
        </Button>
        <Button
          type="submit"
          class="gap-2 min-w-[160px]"
          :disabled="createMutation.isPending.value"
        >
          <HugeiconsIcon
            v-if="!createMutation.isPending.value"
            :icon="CheckmarkBadge01Icon"
            :size="16"
          />
          {{
            createMutation.isPending.value
              ? t('common.saving', 'Saving...')
              : t('knowledge.save', 'Save Entry')
          }}
        </Button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.priority-slider {
  cursor: pointer;
}

.priority-slider :deep([data-slot="slider-thumb"]) {
  cursor: grab;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.priority-slider :deep([data-slot="slider-thumb"]:hover) {
  transform: scale(1.25);
  box-shadow: 0 0 0 4px hsl(var(--primary) / 0.2);
}

.priority-slider :deep([data-slot="slider-thumb"]:active) {
  cursor: grabbing;
  transform: scale(1.15);
  box-shadow: 0 0 0 6px hsl(var(--primary) / 0.25);
}

.priority-slider :deep([data-slot="slider-range"]) {
  transition: width 0.15s ease;
}

.priority-slider :deep([data-slot="slider-track"]) {
  transition: background-color 0.2s ease;
}

/* Custom status toggle */
.status-toggle {
  position: relative;
  width: 2.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: hsl(var(--muted-foreground) / 0.3);
  border: 1px solid hsl(var(--muted-foreground) / 0.4);
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  flex-shrink: 0;
  outline: none;
  padding: 2px;
  display: flex;
  align-items: center;
}

.status-toggle:focus-visible {
  box-shadow: 0 0 0 3px hsl(var(--ring) / 0.5);
}

.status-toggle.active {
  background: hsl(var(--primary));
  border-color: hsl(var(--primary));
}

.status-toggle-thumb {
  display: block;
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
  background: hsl(var(--background));
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.status-toggle.active .status-toggle-thumb {
  transform: translateX(calc(100% - 2px));
}
</style>

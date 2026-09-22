<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  BookOpen01Icon,
  ArrowLeft01Icon,
  CheckmarkBadge01Icon,
  Delete02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'

import { knowledgeService } from '@/services/knowledgeService'
import { KNOWLEDGE_CATEGORIES } from '@/types/entities/knowledge'
import type { KnowledgeUpdatePayload } from '@/types/entities/knowledge'

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
import { ConfirmDialog } from '@/components/uic/confirm-dialog'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const queryClient = useQueryClient()

const entryId = computed(() => route.params.id as string)

// ── Fetch Entry ──────────────────────────────────────────────────────────────
const { data: entry, isLoading } = useQuery({
  queryKey: ['knowledge', entryId],
  queryFn: () => knowledgeService.get(entryId.value),
  enabled: () => !!entryId.value,
})

// ── Form State ───────────────────────────────────────────────────────────────
const form = ref<KnowledgeUpdatePayload>({
  category: 'general',
  title: '',
  content: '',
  priority: 5,
  status: 'active',
})

// Populate form when data loads
watch(entry, (newEntry) => {
  if (newEntry) {
    form.value = {
      category: newEntry.category,
      title: newEntry.title,
      content: newEntry.content,
      priority: newEntry.priority,
      status: newEntry.status,
    }
  }
}, { immediate: true })


// ── Validation ───────────────────────────────────────────────────────────────
const errors = ref<Record<string, string>>({})
const hasAttemptedSubmit = ref(false)

function validateField(field: string) {
  if (!hasAttemptedSubmit.value) return
  delete errors.value[field]

  switch (field) {
    case 'title':
      if (!form.value.title?.trim()) {
        errors.value.title = t('knowledge.errors.title_required', 'Title is required.')
      }
      break
    case 'content':
      if (!form.value.content?.trim()) {
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

  if (!form.value.title?.trim()) {
    errors.value.title = t('knowledge.errors.title_required', 'Title is required.')
  }
  if (!form.value.content?.trim()) {
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

// ── Update Mutation ──────────────────────────────────────────────────────────
const updateMutation = useMutation({
  mutationFn: (data: KnowledgeUpdatePayload) => knowledgeService.update(entryId.value, data),
  onSuccess: () => {
    toast.success(t('knowledge.updated', 'Knowledge entry updated successfully!'))
    queryClient.invalidateQueries({ queryKey: ['knowledge'] })
    router.push({ name: 'admin-knowledge' })
  },
  onError: (err: any) => {
    if (err.status === 422 && err.errors) {
      errors.value = {}
      for (const [field, messages] of Object.entries(err.errors)) {
        errors.value[field] = Array.isArray(messages) ? messages[0] : (messages as string)
      }
    } else {
      toast.error(err.message || t('knowledge.update_error', 'Failed to update entry.'))
    }
  },
})

function handleSubmit() {
  if (!validate()) return
  updateMutation.mutate(form.value)
}

// ── Delete ───────────────────────────────────────────────────────────────────
const showDeleteDialog = ref(false)

const deleteMutation = useMutation({
  mutationFn: () => knowledgeService.destroy(entryId.value),
  onSuccess: () => {
    toast.success(t('knowledge.deleted', 'Knowledge entry deleted successfully.'))
    queryClient.invalidateQueries({ queryKey: ['knowledge'] })
    router.push({ name: 'admin-knowledge' })
  },
  onError: () => {
    toast.error(t('knowledge.delete_error', 'Failed to delete entry.'))
  },
})

// ── Priority Label ───────────────────────────────────────────────────────────
function getPriorityLabel(value: number): string {
  if (value >= 8) return 'Critical'
  if (value >= 5) return 'High'
  if (value >= 3) return 'Medium'
  return 'Low'
}

function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
      <div class="flex-1">
        <h1 class="text-2xl font-bold tracking-tight flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <HugeiconsIcon :icon="BookOpen01Icon" :size="22" class="text-primary" />
          </div>
          {{ t('knowledge.edit_title', 'Edit Knowledge Entry') }}
        </h1>
        <p v-if="entry" class="text-sm text-muted-foreground mt-1">
          {{ t('knowledge.edit_subtitle', 'Last updated') }} {{ formatDate(entry.updated_at) }}
        </p>
      </div>
    </div>

    <!-- ── Loading Skeleton ────────────────────────────────────────────── -->
    <div v-if="isLoading" class="bg-card rounded-xl border border-border/50 p-6 space-y-6 animate-pulse">
      <div class="space-y-3">
        <div class="h-4 w-20 rounded bg-muted/60" />
        <div class="h-10 w-full rounded bg-muted/60" />
      </div>
      <div class="space-y-3">
        <div class="h-4 w-24 rounded bg-muted/60" />
        <div class="h-10 w-full rounded bg-muted/60" />
      </div>
      <div class="space-y-3">
        <div class="h-4 w-16 rounded bg-muted/60" />
        <div class="h-32 w-full rounded bg-muted/60" />
      </div>
    </div>

    <!-- ── Form ────────────────────────────────────────────────────────── -->
    <form v-else class="space-y-6" @submit.prevent="handleSubmit">
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
        </div>

        <!-- Title -->
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
        </div>

        <!-- Content -->
        <div class="p-6">
          <Label for="content" class="text-sm font-semibold text-foreground mb-2 block">
            {{ t('knowledge.field_content', 'Content / Answer') }}
          </Label>
          <Textarea
            id="content"
            v-model="form.content"
            :placeholder="t('knowledge.content_placeholder', 'The information the AI should use to answer...')"
            rows="6"
            :class="[errors.content ? 'border-destructive' : '']"
          />
          <p v-if="errors.content" class="text-xs text-destructive mt-1.5">{{ errors.content }}</p>
        </div>

        <!-- Priority & Status -->
        <div class="p-6 flex flex-col sm:flex-row gap-6">
          <div class="flex-1">
            <Label for="priority" class="text-sm font-semibold text-foreground mb-2 block">
              {{ t('knowledge.field_priority', 'Priority') }}
              <span
                :class="[
                  'ml-2 text-xs font-bold uppercase',
                  (form.priority || 0) >= 8 ? 'text-red-500' :
                  (form.priority || 0) >= 5 ? 'text-amber-500' :
                  (form.priority || 0) >= 3 ? 'text-blue-500' :
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
          </div>

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
          </div>
        </div>
      </div>

      <!-- ── Actions ─────────────────────────────────────────────────────── -->
      <div class="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          class="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          @click="showDeleteDialog = true"
        >
          <HugeiconsIcon :icon="Delete02Icon" :size="16" />
          {{ t('actions.delete', 'Delete') }}
        </Button>
        <div class="flex items-center gap-3">
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
            :disabled="updateMutation.isPending.value"
          >
            <HugeiconsIcon
              v-if="!updateMutation.isPending.value"
              :icon="CheckmarkBadge01Icon"
              :size="16"
            />
            {{
              updateMutation.isPending.value
                ? t('common.saving', 'Saving...')
                : t('knowledge.update', 'Update Entry')
            }}
          </Button>
        </div>
      </div>
    </form>

    <!-- ── Delete Confirmation ─────────────────────────────────────────── -->
    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="t('knowledge.delete_title', 'Delete Knowledge Entry?')"
      :description="t('knowledge.delete_desc', 'This entry will be permanently removed. The AI will no longer use this information.')"
      :confirm-text="t('actions.delete', 'Delete')"
      :cancel-text="t('common.cancel', 'Cancel')"
      confirm-variant="destructive"
      :loading="deleteMutation.isPending.value"
      @confirm="deleteMutation.mutate()"
    />
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

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  ArrowLeft01Icon,
  Edit02Icon,
  Delete02Icon,
  CheckmarkBadge01Icon,
  Cancel01Icon,
  Building01Icon,
  Clock01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'

import { knowledgeService } from '@/services/knowledgeService'
import KnowledgeStatusBadge from '@/components/admin/knowledge/KnowledgeStatusBadge.vue'
import { Button } from '@/components/uic/button'
import { ConfirmDialog } from '@/components/uic/confirm-dialog'
import { ref } from 'vue'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const queryClient = useQueryClient()

const entryId = computed(() => route.params.id as string)

// ── Fetch Entry ──────────────────────────────────────────────────────────────
const { data: entry, isLoading, isError } = useQuery({
  queryKey: ['knowledge', entryId],
  queryFn: () => knowledgeService.get(entryId.value),
  enabled: () => !!entryId.value,
})

// ── Delete Mutation ──────────────────────────────────────────────────────────
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

// ── Toggle Status Mutation ────────────────────────────────────────────────────
const toggleMutation = useMutation({
  mutationFn: () => knowledgeService.toggleStatus(entryId.value),
  onSuccess: (updated) => {
    const isAct = updated.status === 'active'
    toast.success(
      isAct
        ? t('knowledge.activated', 'Entry activated — AI can now use this.')
        : t('knowledge.deactivated', 'Entry deactivated — AI will skip this.'),
    )
    queryClient.invalidateQueries({ queryKey: ['knowledge', entryId] })
    queryClient.invalidateQueries({ queryKey: ['knowledge'] })
  },
  onError: () => {
    toast.error(t('knowledge.toggle_error', 'Failed to update status.'))
  },
})

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    general: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    rooms: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    amenities: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    policies: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    location: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    dining: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    pricing: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    activities: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    transportation: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    contact: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  }
  return colors[category] || 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
}

function getPriorityColor(priority: number): string {
  if (priority >= 8) return 'text-red-500'
  if (priority >= 5) return 'text-amber-500'
  if (priority >= 3) return 'text-blue-500'
  return 'text-muted-foreground'
}

function getPriorityLabel(priority: number): string {
  if (priority >= 8) return 'Critical'
  if (priority >= 5) return 'High'
  if (priority >= 3) return 'Medium'
  return 'Low'
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <!-- ── Back & Header Row ───────────────────────────────────────────────── -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          class="h-9 w-9 rounded-full shrink-0"
          @click="router.push({ name: 'admin-knowledge' })"
        >
          <HugeiconsIcon :icon="ArrowLeft01Icon" :size="18" class="rtl:rotate-180" />
        </Button>
        <div>
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            {{ t('knowledge.view_title', 'Knowledge Entry Details') }}
          </h1>
          <p class="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {{ t('knowledge.entry_id', { id: entryId }) }}
          </p>
        </div>
      </div>

      <!-- Action buttons -->
      <div v-if="entry" class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          class="gap-1.5"
          :disabled="toggleMutation.isPending.value"
          @click="toggleMutation.mutate()"
        >
          <HugeiconsIcon
            :icon="entry.status === 'active' ? Cancel01Icon : CheckmarkBadge01Icon"
            :size="16"
          />
          <span class="hidden sm:inline">
            {{ entry.status === 'active' ? t('knowledge.deactivate', 'Deactivate') : t('knowledge.activate', 'Activate') }}
          </span>
        </Button>

        <Button
          size="sm"
          class="gap-1.5"
          @click="router.push({ name: 'admin-knowledge-edit', params: { id: entryId } })"
        >
          <HugeiconsIcon :icon="Edit02Icon" :size="16" />
          <span>{{ t('actions.edit', 'Edit') }}</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          class="h-9 w-9 text-destructive hover:bg-destructive/10"
          @click="showDeleteDialog = true"
        >
          <HugeiconsIcon :icon="Delete02Icon" :size="16" />
        </Button>
      </div>
    </div>

    <!-- ── Loading Skeleton ───────────────────────────────────────────────── -->
    <div v-if="isLoading" class="bg-card rounded-2xl border border-border/50 p-6 space-y-6 animate-pulse">
      <div class="h-6 w-32 bg-muted/60 rounded-full" />
      <div class="h-8 w-3/4 bg-muted/60 rounded-xl" />
      <div class="h-32 w-full bg-muted/40 rounded-xl" />
    </div>

    <!-- ── Error State ────────────────────────────────────────────────────── -->
    <div v-else-if="isError || !entry" class="bg-card rounded-2xl border border-border/50 p-12 text-center">
      <p class="text-sm font-medium text-destructive mb-3">{{ t('knowledge.error_desc', 'Could not load knowledge entry.') }}</p>
      <Button variant="outline" size="sm" @click="router.push({ name: 'admin-knowledge' })">
        {{ t('common.back', 'Back to List') }}
      </Button>
    </div>

    <!-- ── Main Card Content ──────────────────────────────────────────────── -->
    <div v-else class="space-y-6">
      <div class="bg-card rounded-2xl border border-border/50 shadow-xs overflow-hidden">
        <!-- Top Status & Category Banner -->
        <div class="p-6 border-b border-border/40 bg-muted/20 flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-2">
            <span
              :class="[
                'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider border',
                getCategoryColor(entry.category),
              ]"
            >
              {{ entry.category }}
            </span>
            <KnowledgeStatusBadge :status="entry.status" />
            <span
              :class="['text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-background border border-border/50', getPriorityColor(entry.priority)]"
            >
              {{ t('knowledge.field_priority', 'Priority') }}: {{ entry.priority }}/10 ({{ getPriorityLabel(entry.priority) }})
            </span>
          </div>

          <div v-if="entry.synced_to_ai" class="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-semibold bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
            <HugeiconsIcon :icon="SparklesIcon" :size="14" />
            {{ t('knowledge.synced_ai', 'Synced with AI') }}
          </div>
        </div>

        <div class="p-6 space-y-6">
          <!-- Title Section -->
          <div class="space-y-2">
            <span class="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
              {{ t('knowledge.label_title', 'Title') }}
            </span>
            <h2 class="text-xl sm:text-2xl font-bold text-foreground leading-snug">
              {{ entry.title }}
            </h2>
          </div>

          <!-- Content Section -->
          <div class="space-y-2 pt-2 border-t border-border/40">
            <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
              {{ t('knowledge.label_content', 'Content') }}
            </span>
            <div class="p-4 rounded-xl bg-muted/30 border border-border/40 text-[15px] text-foreground leading-relaxed whitespace-pre-wrap">
              {{ entry.content }}
            </div>
          </div>

          <!-- Hotel & Meta Details Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/40">
            <!-- Hotel Info (if present) -->
            <div v-if="entry.hotel" class="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/50">
              <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <HugeiconsIcon :icon="Building01Icon" :size="20" class="text-primary" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-[11px] text-muted-foreground">{{ t('knowledge.hotel', 'Hotel') }}</span>
                <span class="text-sm font-semibold text-foreground truncate">{{ entry.hotel.name }}</span>
              </div>
            </div>

            <!-- Created & Updated Time -->
            <div class="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/50">
              <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <HugeiconsIcon :icon="Clock01Icon" :size="20" class="text-muted-foreground" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-[11px] text-muted-foreground">{{ t('knowledge.created_at', 'Created At') }}</span>
                <span class="text-sm font-semibold text-foreground truncate">{{ formatDate(entry.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Delete Confirmation Dialog ─────────────────────────────────────── -->
    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="t('knowledge.delete_title', 'Delete Knowledge Entry?')"
      :description="t('knowledge.delete_desc', 'This entry will be permanently removed. The AI will no longer use this information.')"
      :confirm-label="t('common.delete', 'Delete')"
      variant="destructive"
      :loading="deleteMutation.isPending.value"
      @confirm="() => deleteMutation.mutate()"
    />
  </div>
</template>

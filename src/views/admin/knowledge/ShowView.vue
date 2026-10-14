<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  Clock,
  Copy,
  Pencil,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import { knowledgeService } from '@/services/knowledgeService'
import KnowledgeStatusBadge from '@/components/admin/knowledge/KnowledgeStatusBadge.vue'
import KnowledgePreviewCard from '@/components/admin/knowledge/KnowledgePreviewCard.vue'
import { Button } from '@/components/uic/button'
import { Card } from '@/components/uic/card'
import { Skeleton } from '@/components/uic/skeleton'
import { ConfirmDialog } from '@/components/uic/confirm-dialog'

const { t, locale } = useI18n()
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
const showToggleDialog = ref(false)
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
    showToggleDialog.value = false
  },
  onError: () => {
    toast.error(t('knowledge.toggle_error', 'Failed to update status.'))
  },
})

// ── Helpers ──────────────────────────────────────────────────────────────────
function getPriorityBadge(priority: number) {
  if (priority >= 8) return { label: 'Critical', class: 'bg-rose-500/15 text-rose-400 border-rose-500/30' }
  if (priority >= 5) return { label: 'High', class: 'bg-amber-500/15 text-amber-400 border-amber-500/30' }
  if (priority >= 3) return { label: 'Medium', class: 'bg-sky-500/15 text-sky-400 border-sky-500/30' }
  return { label: 'Low', class: 'bg-slate-500/15 text-slate-400 border-slate-500/30' }
}

function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const copiedAnswer = ref(false)
async function copyText(text: string) {
  await navigator.clipboard.writeText(text)
  copiedAnswer.value = true
  setTimeout(() => (copiedAnswer.value = false), 1800)
}
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-7 pb-20 px-2 sm:px-4 animate-in fade-in duration-300">
    <!-- ── Header ──────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
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
              {{ t('knowledge.view_title', 'Knowledge Entry Details') }}
            </h1>
            <span class="text-xs font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-lg border border-border/40">
              #{{ entryId }}
            </span>
          </div>
          <p class="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {{ t('knowledge.created_at', 'Created') }} {{ formatDate(entry?.created_at || null) }}
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div v-if="entry" class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          class="rounded-xl gap-1.5 text-xs font-semibold"
          @click="showToggleDialog = true"
        >
          <Sparkles class="w-3.5 h-3.5 text-primary" />
          {{ entry.status === 'active' ? t('knowledge.deactivate', 'Deactivate') : t('knowledge.activate', 'Activate') }}
        </Button>

        <Button
          size="sm"
          class="rounded-xl gap-1.5 text-xs font-semibold shadow-xs"
          @click="router.push({ name: 'admin-knowledge-edit', params: { id: entryId } })"
        >
          <Pencil class="w-3.5 h-3.5" />
          {{ t('actions.edit', 'Edit Entry') }}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          class="rounded-xl text-destructive hover:bg-destructive/10 gap-1.5 text-xs font-semibold"
          @click="showDeleteDialog = true"
        >
          <Trash2 class="w-3.5 h-3.5" />
          {{ t('actions.delete', 'Delete') }}
        </Button>
      </div>
    </div>

    <!-- ── Loading Skeleton ────────────────────────────────────────────── -->
    <div v-if="isLoading" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div class="lg:col-span-7 space-y-6">
        <Skeleton class="h-[400px] w-full rounded-2xl" />
      </div>
      <div class="lg:col-span-5 space-y-5">
        <Skeleton class="h-[300px] w-full rounded-2xl" />
      </div>
    </div>

    <!-- ── Main 2-Column Details View ─────────────────────────────────── -->
    <div v-else-if="entry" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Column: Details (7 cols) -->
      <div class="lg:col-span-7 space-y-6">
        <!-- Main Card -->
        <Card class="rounded-2xl border-border/40 bg-card/70 backdrop-blur-md p-6 sm:p-7 space-y-6 shadow-sm">
          <!-- Meta Pill Row -->
          <div class="flex items-center gap-2.5 flex-wrap">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-primary/25 bg-primary/10 text-primary">
              <Tag class="w-3 h-3" />
              {{ entry.category }}
            </span>

            <KnowledgeStatusBadge :status="entry.status" />

            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border"
              :class="getPriorityBadge(entry.priority).class"
            >
              Priority: {{ getPriorityBadge(entry.priority).label }} ({{ entry.priority }}/10)
            </span>
          </div>

          <div class="h-px bg-border/40" />

          <!-- Question Block -->
          <div class="space-y-2">
            <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              {{ t('knowledge.field_title', 'Title / Question') }}
            </span>
            <div class="p-4 rounded-xl bg-background/60 border border-border/40">
              <h2 class="text-base sm:text-lg font-bold text-foreground leading-snug">
                {{ entry.title }}
              </h2>
            </div>
          </div>

          <!-- Answer Block -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                {{ t('knowledge.field_content', 'Content / Answer') }}
              </span>
              <button
                type="button"
                class="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                @click="copyText(entry.content)"
              >
                <Check v-if="copiedAnswer" class="w-3.5 h-3.5 text-emerald-400" />
                <Copy v-else class="w-3.5 h-3.5" />
                {{ copiedAnswer ? t('knowledge.copied', 'Copied') : t('knowledge.copy_answer', 'Copy Answer') }}
              </button>
            </div>
            <div class="p-4 rounded-xl bg-background/60 border border-border/40 text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
              {{ entry.content }}
            </div>
          </div>

          <div class="h-px bg-border/40" />

          <!-- Hotel & Date Metadata -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div class="flex items-center gap-2">
              <Calendar class="w-4 h-4 text-primary shrink-0" />
              <span>Created {{ formatDate(entry.created_at) }}</span>
            </div>
            <div v-if="entry.updated_at" class="flex items-center gap-2">
              <Clock class="w-4 h-4 text-muted-foreground shrink-0" />
              <span>Updated {{ formatDate(entry.updated_at) }}</span>
            </div>
          </div>
        </Card>
      </div>

      <!-- Right Column: AI Live Preview & Vector Engine Card (5 cols) -->
      <div class="lg:col-span-5 space-y-5 lg:sticky lg:top-6">
        <KnowledgePreviewCard
          :title="entry.title"
          :content="entry.content"
          :category="entry.category"
          :priority="entry.priority"
          :status="entry.status"
          :hotel-name="entry.hotel?.name || null"
          :synced-to-ai="entry.synced_to_ai"
        />

        <!-- Vector Engine Info -->
        <Card class="rounded-2xl border-border/40 bg-card/50 p-5 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles class="w-3.5 h-3.5 text-primary" />
              AI Vector Engine
            </span>
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
              :class="entry.synced_to_ai || entry.qdrant_knowledge_id
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                : 'bg-muted/40 text-muted-foreground border border-border/40'"
            >
              {{ entry.synced_to_ai || entry.qdrant_knowledge_id ? 'Indexed' : 'Pending' }}
            </span>
          </div>

          <div v-if="entry.qdrant_knowledge_id" class="text-xs space-y-1">
            <span class="text-[11px] text-muted-foreground">Vector Point ID:</span>
            <p class="font-mono text-[11px] text-foreground/80 truncate bg-background/50 p-2 rounded-lg border border-border/30">
              {{ entry.qdrant_knowledge_id }}
            </p>
          </div>
        </Card>

        <!-- Hotel Card if linked -->
        <Card v-if="entry.hotel" class="rounded-2xl border-border/40 bg-card/50 p-5 space-y-2">
          <div class="flex items-center gap-2 text-foreground font-bold text-xs uppercase tracking-wider">
            <Building2 class="w-4 h-4 text-primary" />
            <span>{{ entry.hotel.name }}</span>
          </div>
          <p v-if="entry.hotel.country" class="text-xs text-muted-foreground">
            {{ entry.hotel.country }} • {{ entry.hotel.currency || 'USD' }}
          </p>
        </Card>
      </div>
    </div>

    <!-- Confirmation Dialogs -->
    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="t('knowledge.delete_title', 'Delete Knowledge Entry?')"
      :description="t('knowledge.delete_desc', 'This entry will be permanently removed. The AI will no longer use this information.')"
      :confirm-text="t('actions.delete', 'Delete')"
      :cancel-text="t('common.cancel', 'Cancel')"
      confirm-variant="destructive"
      :loading="deleteMutation.isPending.value"
      @confirm="() => deleteMutation.mutate()"
    />

    <ConfirmDialog
      v-model:open="showToggleDialog"
      :title="entry?.status === 'active' ? t('knowledge.deactivate_title', 'Deactivate Entry?') : t('knowledge.activate_title', 'Activate Entry?')"
      :description="entry?.status === 'active' ? t('knowledge.deactivate_desc', 'The AI will no longer use this entry to answer guest questions.') : t('knowledge.activate_desc', 'The AI will start using this entry to answer guest questions.')"
      :confirm-text="entry?.status === 'active' ? t('knowledge.deactivate', 'Deactivate') : t('knowledge.activate', 'Activate')"
      :cancel-text="t('common.cancel', 'Cancel')"
      :confirm-variant="entry?.status === 'active' ? 'destructive' : 'default'"
      :loading="toggleMutation.isPending.value"
      @confirm="() => toggleMutation.mutate()"
    />
  </div>
</template>

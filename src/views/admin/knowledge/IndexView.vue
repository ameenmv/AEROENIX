<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  Search01Icon,
  PlusSignIcon,
  Edit02Icon,
  Delete02Icon,
  MoreVerticalIcon,
  BookOpen01Icon,
  CheckmarkBadge01Icon,
  Cancel01Icon,
  FilterIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { toast } from 'vue-sonner'

import { knowledgeService } from '@/services/knowledgeService'
import { KNOWLEDGE_CATEGORIES } from '@/types/entities/knowledge'
import type { KnowledgeEntry } from '@/types/entities/knowledge'
import KnowledgeStatusBadge from '@/components/admin/knowledge/KnowledgeStatusBadge.vue'

import { Button } from '@/components/uic/button'
import { Input } from '@/components/uic/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/uic/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/uic/dropdown-menu'
import { ConfirmDialog } from '@/components/uic/confirm-dialog'

import { refDebounced } from '@vueuse/core'

const { t } = useI18n()
const router = useRouter()
const queryClient = useQueryClient()

// ── Filters ──────────────────────────────────────────────────────────────────
const search = ref('')
const debouncedSearch = refDebounced(search, 400)
const statusFilter = ref<string>('all')
const categoryFilter = ref<string>('all')
const currentPage = ref(1)
const perPage = ref(10)

// Reset page when filters change
watch([debouncedSearch, statusFilter, categoryFilter], () => {
  currentPage.value = 1
})

// ── Data Query ───────────────────────────────────────────────────────────────
const { data, isLoading, isError } = useQuery({
  queryKey: ['knowledge', debouncedSearch, statusFilter, categoryFilter, currentPage, perPage],
  queryFn: () =>
    knowledgeService.list({
      search: debouncedSearch.value,
      status: statusFilter.value === 'all' ? null : statusFilter.value,
      category: categoryFilter.value === 'all' ? null : categoryFilter.value,
      page: currentPage.value,
      limit: perPage.value,
    }),
})

const entries = computed(() => data.value?.data || [])
const pagination = computed(() => data.value?.pagination || null)

// ── Stats ────────────────────────────────────────────────────────────────────
const stats = computed(() => {
  const all = entries.value
  return {
    total: pagination.value?.total ?? all.length,
    active: all.filter((e) => e.status === 'active').length,
    inactive: all.filter((e) => e.status === 'inactive').length,
    categories: new Set(all.map((e) => e.category)).size,
  }
})

// ── Delete Dialog ────────────────────────────────────────────────────────────
const showDeleteDialog = ref(false)
const deletingEntry = ref<KnowledgeEntry | null>(null)

function openDeleteDialog(entry: KnowledgeEntry) {
  deletingEntry.value = entry
  showDeleteDialog.value = true
}

const deleteMutation = useMutation({
  mutationFn: (id: number) => knowledgeService.destroy(id),
  onSuccess: () => {
    toast.success(t('knowledge.deleted', 'Knowledge entry deleted successfully.'))
    queryClient.invalidateQueries({ queryKey: ['knowledge'] })
    showDeleteDialog.value = false
    deletingEntry.value = null
  },
  onError: () => {
    toast.error(t('knowledge.delete_error', 'Failed to delete entry.'))
  },
})

function confirmDelete() {
  if (deletingEntry.value) {
    deleteMutation.mutate(deletingEntry.value.id)
  }
}

// ── Toggle Status Dialog ─────────────────────────────────────────────────────
const showToggleDialog = ref(false)
const togglingEntry = ref<KnowledgeEntry | null>(null)

function openToggleDialog(entry: KnowledgeEntry) {
  togglingEntry.value = entry
  showToggleDialog.value = true
}

const toggleMutation = useMutation({
  mutationFn: (id: number) => knowledgeService.toggleStatus(id),
  onSuccess: (updated) => {
    toast.success(
      updated.status === 'active'
        ? t('knowledge.activated', 'Entry activated — AI can now use this.')
        : t('knowledge.deactivated', 'Entry deactivated — AI will skip this.'),
    )
    queryClient.invalidateQueries({ queryKey: ['knowledge'] })
    showToggleDialog.value = false
    togglingEntry.value = null
  },
  onError: () => {
    toast.error(t('knowledge.toggle_error', 'Failed to update status.'))
  },
})

function confirmToggle() {
  if (togglingEntry.value) {
    toggleMutation.mutate(togglingEntry.value.id)
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
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

function getPriorityLabel(priority: number): string {
  if (priority >= 8) return 'Critical'
  if (priority >= 5) return 'High'
  if (priority >= 3) return 'Medium'
  return 'Low'
}

function getPriorityColor(priority: number): string {
  if (priority >= 8) return 'text-red-500'
  if (priority >= 5) return 'text-amber-500'
  if (priority >= 3) return 'text-blue-500'
  return 'text-muted-foreground'
}

function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function truncate(text: string, max: number = 80): string {
  return text.length > max ? text.slice(0, max) + '…' : text
}

const hasActiveFilters = computed(
  () => statusFilter.value !== 'all' || categoryFilter.value !== 'all' || search.value.length > 0,
)

function clearFilters() {
  search.value = ''
  statusFilter.value = 'all'
  categoryFilter.value = 'all'
  currentPage.value = 1
}

function goToPage(page: number) {
  if (!pagination.value) return
  if (page < 1 || page > pagination.value.total_pages) return
  currentPage.value = page
}
</script>

<template>
  <div class="space-y-6">
    <!-- ── Header ──────────────────────────────────────────────────────── -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <HugeiconsIcon :icon="BookOpen01Icon" :size="22" class="text-primary" />
          </div>
          {{ t('knowledge.title', 'Knowledge Base') }}
        </h1>
        <p class="text-sm text-muted-foreground mt-1.5 max-w-lg">
          {{
            t(
              'knowledge.subtitle',
              'Manage FAQ entries and hotel information that the AI chatbot uses to answer guest questions automatically.',
            )
          }}
        </p>
      </div>
      <Button
        class="gap-2 shrink-0 shadow-sm"
        @click="router.push({ name: 'admin-knowledge-create' })"
      >
        <HugeiconsIcon :icon="PlusSignIcon" :size="16" />
        {{ t('knowledge.create', 'Add Entry') }}
      </Button>
    </div>

    <!-- ── Stats Cards ─────────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-card rounded-xl border border-border/50 p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
          <HugeiconsIcon :icon="BookOpen01Icon" :size="20" class="text-blue-500" />
        </div>
        <div>
          <p class="text-2xl font-bold text-foreground leading-none">{{ stats.total }}</p>
          <p class="text-xs text-muted-foreground mt-1">{{ t('knowledge.stat_total', 'Total Entries') }}</p>
        </div>
      </div>
      <div class="bg-card rounded-xl border border-border/50 p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
          <HugeiconsIcon :icon="CheckmarkBadge01Icon" :size="20" class="text-emerald-500" />
        </div>
        <div>
          <p class="text-2xl font-bold text-foreground leading-none">{{ stats.active }}</p>
          <p class="text-xs text-muted-foreground mt-1">{{ t('knowledge.stat_active', 'Active (AI Uses)') }}</p>
        </div>
      </div>
      <div class="bg-card rounded-xl border border-border/50 p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-slate-500/10 flex items-center justify-center shrink-0">
          <HugeiconsIcon :icon="Cancel01Icon" :size="20" class="text-slate-400" />
        </div>
        <div>
          <p class="text-2xl font-bold text-foreground leading-none">{{ stats.inactive }}</p>
          <p class="text-xs text-muted-foreground mt-1">{{ t('knowledge.stat_inactive', 'Inactive') }}</p>
        </div>
      </div>
      <div class="bg-card rounded-xl border border-border/50 p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
          <HugeiconsIcon :icon="FilterIcon" :size="20" class="text-violet-500" />
        </div>
        <div>
          <p class="text-2xl font-bold text-foreground leading-none">{{ stats.categories }}</p>
          <p class="text-xs text-muted-foreground mt-1">{{ t('knowledge.stat_categories', 'Categories') }}</p>
        </div>
      </div>
    </div>

    <!-- ── Filters ─────────────────────────────────────────────────────── -->
    <div class="bg-card p-4 rounded-xl border border-border/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
      <div class="relative w-full sm:max-w-xs">
        <HugeiconsIcon :icon="Search01Icon" :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          v-model="search"
          :placeholder="t('knowledge.search', 'Search knowledge base...')"
          class="pl-9 w-full bg-background"
        />
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <Select v-model="statusFilter">
          <SelectTrigger class="w-[150px] h-10 bg-background border-border/50">
            <SelectValue :placeholder="t('knowledge.all_statuses', 'All Statuses')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{{ t('knowledge.all_statuses', 'All Statuses') }}</SelectItem>
            <SelectItem value="active">{{ t('knowledge.active', 'Active') }}</SelectItem>
            <SelectItem value="inactive">{{ t('knowledge.inactive', 'Inactive') }}</SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="categoryFilter">
          <SelectTrigger class="w-[170px] h-10 bg-background border-border/50">
            <SelectValue :placeholder="t('knowledge.all_categories', 'All Categories')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{{ t('knowledge.all_categories', 'All Categories') }}</SelectItem>
            <SelectItem v-for="cat in KNOWLEDGE_CATEGORIES" :key="cat" :value="cat">
              {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          v-if="hasActiveFilters"
          variant="ghost"
          size="sm"
          class="text-muted-foreground hover:text-foreground shrink-0"
          @click="clearFilters"
        >
          {{ t('common.clear', 'Clear') }}
        </Button>
      </div>
    </div>

    <!-- ── Loading State ───────────────────────────────────────────────── -->
    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="bg-card rounded-xl border border-border/50 p-5 animate-pulse">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 space-y-3">
            <div class="flex items-center gap-2">
              <div class="h-5 w-16 rounded-full bg-muted/60" />
              <div class="h-5 w-14 rounded-full bg-muted/60" />
            </div>
            <div class="h-5 w-3/4 rounded bg-muted/60" />
            <div class="h-4 w-full rounded bg-muted/40" />
          </div>
          <div class="h-8 w-8 rounded bg-muted/60 shrink-0" />
        </div>
      </div>
    </div>

    <!-- ── Error State ─────────────────────────────────────────────────── -->
    <div
      v-else-if="isError"
      class="py-20 flex flex-col items-center justify-center border border-dashed border-destructive/30 rounded-xl bg-destructive/5"
    >
      <HugeiconsIcon :icon="Cancel01Icon" :size="48" class="text-destructive/30 mb-4" />
      <h3 class="text-lg font-medium text-destructive">{{ t('knowledge.error_title', 'Failed to Load') }}</h3>
      <p class="text-sm text-muted-foreground max-w-sm text-center mt-2">
        {{ t('knowledge.error_desc', 'Could not load knowledge base entries. The backend API may not be available yet.') }}
      </p>
    </div>

    <!-- ── Knowledge Entries List ───────────────────────────────────────── -->
    <div v-else-if="entries.length > 0" class="space-y-3">
      <TransitionGroup name="list" tag="div" class="space-y-3">
        <div
          v-for="entry in entries"
          :key="entry.id"
          class="group bg-card rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-sm overflow-hidden"
        >
          <div class="p-5 flex items-start gap-4">
            <!-- Left: Priority indicator -->
            <div
              class="w-1.5 h-full min-h-[60px] rounded-full shrink-0 self-stretch"
              :class="[
                entry.priority >= 8 ? 'bg-red-500' :
                entry.priority >= 5 ? 'bg-amber-500' :
                entry.priority >= 3 ? 'bg-blue-500' :
                'bg-slate-300 dark:bg-slate-600'
              ]"
            />

            <!-- Center: Content -->
            <div class="flex-1 min-w-0">
              <!-- Tags row -->
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border',
                    getCategoryColor(entry.category),
                  ]"
                >
                  {{ entry.category }}
                </span>
                <KnowledgeStatusBadge :status="entry.status" />
                <span
                  :class="['text-[10px] font-bold uppercase tracking-wider', getPriorityColor(entry.priority)]"
                >
                  {{ getPriorityLabel(entry.priority) }}
                </span>
              </div>

              <!-- Title -->
              <h3
                class="text-[15px] font-semibold text-foreground leading-snug mb-1.5 cursor-pointer hover:text-primary transition-colors"
                @click="router.push({ name: 'admin-knowledge-edit', params: { id: entry.id } })"
              >
                {{ entry.title }}
              </h3>

              <!-- Content preview -->
              <p class="text-sm text-muted-foreground leading-relaxed">
                {{ truncate(entry.content, 120) }}
              </p>

              <!-- Meta -->
              <div class="flex items-center gap-4 mt-3 text-xs text-muted-foreground/70">
                <span>{{ formatDate(entry.created_at) }}</span>
                <span v-if="entry.updated_at && entry.updated_at !== entry.created_at">
                  Updated {{ formatDate(entry.updated_at) }}
                </span>
              </div>
            </div>

            <!-- Right: Actions -->
            <div class="shrink-0 flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <HugeiconsIcon :icon="MoreVerticalIcon" :size="16" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-48">
                  <DropdownMenuItem
                    @click="router.push({ name: 'admin-knowledge-edit', params: { id: entry.id } })"
                  >
                    <HugeiconsIcon :icon="Edit02Icon" :size="14" class="mr-2" />
                    {{ t('actions.edit', 'Edit') }}
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="openToggleDialog(entry)">
                    <HugeiconsIcon
                      :icon="entry.status === 'active' ? Cancel01Icon : CheckmarkBadge01Icon"
                      :size="14"
                      class="mr-2"
                    />
                    {{ entry.status === 'active' ? t('knowledge.deactivate', 'Deactivate') : t('knowledge.activate', 'Activate') }}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    class="text-destructive focus:text-destructive"
                    @click="openDeleteDialog(entry)"
                  >
                    <HugeiconsIcon :icon="Delete02Icon" :size="14" class="mr-2" />
                    {{ t('actions.delete', 'Delete') }}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- ── Empty State ─────────────────────────────────────────────────── -->
    <div
      v-else
      class="py-20 flex flex-col items-center justify-center border border-dashed border-border rounded-xl"
    >
      <div class="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
        <HugeiconsIcon :icon="BookOpen01Icon" :size="40" class="text-primary/30" />
      </div>
      <h3 class="text-lg font-semibold text-foreground">
        {{ hasActiveFilters ? t('knowledge.no_results', 'No Results Found') : t('knowledge.empty_title', 'No Knowledge Entries Yet') }}
      </h3>
      <p class="text-sm text-muted-foreground max-w-md text-center mt-2">
        {{
          hasActiveFilters
            ? t('knowledge.no_results_desc', 'Try adjusting your search or filters.')
            : t('knowledge.empty_desc', 'Start adding FAQ entries, hotel policies, and room information so the AI chatbot can answer guest questions accurately.')
        }}
      </p>
      <Button
        v-if="!hasActiveFilters"
        class="mt-6 gap-2"
        @click="router.push({ name: 'admin-knowledge-create' })"
      >
        <HugeiconsIcon :icon="PlusSignIcon" :size="16" />
        {{ t('knowledge.create_first', 'Create Your First Entry') }}
      </Button>
      <Button
        v-else
        variant="outline"
        class="mt-6"
        @click="clearFilters"
      >
        {{ t('common.clear_filters', 'Clear Filters') }}
      </Button>
    </div>

    <!-- ── Pagination ──────────────────────────────────────────────────── -->
    <div
      v-if="pagination && pagination.total > 0"
      class="flex items-center justify-between mt-2 px-1 flex-wrap gap-4"
    >
      <div class="flex items-center gap-4">
        <p class="text-xs text-muted-foreground">
          {{ t('common.page_info', `Page ${pagination.current_page} of ${pagination.total_pages}`) }}
          <span class="hidden sm:inline">
            · {{ pagination.total }} {{ t('knowledge.total_entries', 'total entries') }}
          </span>
        </p>
        <div class="hidden sm:flex items-center gap-2">
          <span class="text-xs text-muted-foreground">{{ t('common.per_page', 'Per page') }}</span>
          <Select :model-value="String(perPage)" @update:model-value="(val: any) => { perPage = Number(val); currentPage = 1 }">
            <SelectTrigger class="w-[70px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div v-if="pagination.total_pages > 1" class="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          class="h-9 px-3 rounded-xl text-xs"
          :disabled="pagination.current_page <= 1"
          @click="goToPage(pagination.current_page - 1)"
        >
          {{ t('actions.previous', 'Previous') }}
        </Button>

        <template v-for="page in pagination.total_pages" :key="page">
          <Button
            v-if="page === 1 || page === pagination.total_pages || Math.abs(page - pagination.current_page) <= 1"
            :variant="page === pagination.current_page ? 'default' : 'outline'"
            size="sm"
            class="h-9 w-9 rounded-xl text-xs"
            :class="page === pagination.current_page
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : ''"
            @click="goToPage(page)"
          >
            {{ page }}
          </Button>
          <span
            v-else-if="page === 2 && pagination.current_page > 3"
            class="text-muted-foreground text-xs px-1"
          >…</span>
          <span
            v-else-if="page === pagination.total_pages - 1 && pagination.current_page < pagination.total_pages - 2"
            class="text-muted-foreground text-xs px-1"
          >…</span>
        </template>

        <Button
          variant="outline"
          size="sm"
          class="h-9 px-3 rounded-xl text-xs"
          :disabled="pagination.current_page >= pagination.total_pages"
          @click="goToPage(pagination.current_page + 1)"
        >
          {{ t('actions.next', 'Next') }}
        </Button>
      </div>
    </div>

    <!-- ── Delete Confirmation Dialog ──────────────────────────────────── -->
    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="t('knowledge.delete_title', 'Delete Knowledge Entry?')"
      :description="t('knowledge.delete_desc', 'This entry will be permanently removed. The AI will no longer use this information.')"
      :confirm-text="t('actions.delete', 'Delete')"
      :cancel-text="t('common.cancel', 'Cancel')"
      confirm-variant="destructive"
      :loading="deleteMutation.isPending.value"
      @confirm="confirmDelete"
    />

    <!-- ── Toggle Status Confirmation Dialog ────────────────────────────── -->
    <ConfirmDialog
      v-model:open="showToggleDialog"
      :title="
        togglingEntry?.status === 'active'
          ? t('knowledge.deactivate_title', 'Deactivate Entry?')
          : t('knowledge.activate_title', 'Activate Entry?')
      "
      :description="
        togglingEntry?.status === 'active'
          ? t('knowledge.deactivate_desc', 'The AI will no longer use this entry to answer guest questions.')
          : t('knowledge.activate_desc', 'The AI will start using this entry to answer guest questions.')
      "
      :confirm-text="
        togglingEntry?.status === 'active'
          ? t('knowledge.deactivate', 'Deactivate')
          : t('knowledge.activate', 'Activate')
      "
      :cancel-text="t('common.cancel', 'Cancel')"
      :confirm-variant="togglingEntry?.status === 'active' ? 'destructive' : 'default'"
      :loading="toggleMutation.isPending.value"
      @confirm="confirmToggle"
    />
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
</style>

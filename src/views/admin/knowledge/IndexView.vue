<script setup lang="ts">
import type { KnowledgeEntry } from '@/types/entities/knowledge'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { refDebounced } from '@vueuse/core'
import {
  AlertCircle,
  BookOpen,
  Building2,
  Calendar,
  Check,
  Clock,
  Copy,
  Eye,
  Layers,
  MoreVertical,
  Pencil,
  Plus,
  RotateCw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import { knowledgeService } from '@/services/knowledgeService'
import { hotelsService } from '@/services/hotelsService'
import type { Hotel } from '@/types/hotel'
import { KNOWLEDGE_CATEGORIES } from '@/types/entities/knowledge'
import KnowledgeStatusBadge from '@/components/admin/knowledge/KnowledgeStatusBadge.vue'

import { Button } from '@/components/uic/button'
import { Input } from '@/components/uic/input'
import { Card } from '@/components/uic/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/uic/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/uic/dropdown-menu'
import { ConfirmDialog } from '@/components/uic/confirm-dialog'

const { t, locale } = useI18n()
const router = useRouter()
const queryClient = useQueryClient()

// ── Filters & State ──────────────────────────────────────────────────────────
const search = ref('')
const debouncedSearch = refDebounced(search, 300)
const statusFilter = ref<string>('all')
const categoryFilter = ref<string>('all')
const hotelFilter = ref<string>('all')
const currentPage = ref(1)
const perPage = ref(10)
const copiedId = ref<number | null>(null)

// ── Hotels Query ─────────────────────────────────────────────────────────────
const { data: hotelsData } = useQuery({
  queryKey: ['hotels-list'],
  queryFn: () => hotelsService.list({ limit: 100 }),
  staleTime: 5 * 60 * 1000,
})
const hotels = computed<Hotel[]>(() => hotelsData.value?.data || [])

// Reset page when filters change
watch([debouncedSearch, statusFilter, categoryFilter, hotelFilter], () => {
  currentPage.value = 1
})

// ── Data Query ───────────────────────────────────────────────────────────────
const { data, isLoading, isError, refetch, isFetching } = useQuery({
  queryKey: ['knowledge', debouncedSearch, statusFilter, categoryFilter, hotelFilter, currentPage, perPage],
  queryFn: () =>
    knowledgeService.list({
      search: debouncedSearch.value,
      status: statusFilter.value === 'all' ? null : statusFilter.value,
      category: categoryFilter.value === 'all' ? null : categoryFilter.value,
      hotel_id: hotelFilter.value === 'all' ? undefined : Number(hotelFilter.value),
      page: currentPage.value,
      limit: perPage.value
    })
})

const entries = computed(() => data.value?.data || [])
const pagination = computed(() => data.value?.pagination || null)

// ── Dynamic Stats ────────────────────────────────────────────────────────────
const stats = computed(() => {
  const all = entries.value
  return {
    total: pagination.value?.total ?? all.length,
    active: all.filter((e) => e.status === 'active').length,
    inactive: all.filter((e) => e.status === 'inactive').length,
    categories: new Set(all.map((e) => e.category)).size
  }
})

// ── Delete Mutation & Dialog ─────────────────────────────────────────────────
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
  }
})

function confirmDelete() {
  if (deletingEntry.value) {
    deleteMutation.mutate(deletingEntry.value.id)
  }
}

// ── Toggle Status Mutation & Dialog ──────────────────────────────────────────
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
        : t('knowledge.deactivated', 'Entry deactivated — AI will skip this.')
    )
    queryClient.invalidateQueries({ queryKey: ['knowledge'] })
    showToggleDialog.value = false
    togglingEntry.value = null
  },
  onError: () => {
    toast.error(t('knowledge.toggle_error', 'Failed to update status.'))
  }
})

function confirmToggle() {
  if (togglingEntry.value) {
    toggleMutation.mutate(togglingEntry.value.id)
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getCategoryColor(category: string): { bg: string; text: string; border: string } {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    general: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/25' },
    rooms: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/25' },
    amenities: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/25' },
    policies: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/25' },
    location: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/25'
    },
    dining: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/25' },
    pricing: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/25' },
    activities: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/25' },
    transportation: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/25'
    },
    contact: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/25' }
  }
  return (
    map[category] || {
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      border: 'border-slate-500/25'
    }
  )
}

function getPriorityBadge(priority: number) {
  if (priority >= 8) {
    return {
      label: 'Critical',
      badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      barClass: 'bg-rose-500'
    }
  }
  if (priority >= 5) {
    return {
      label: 'High',
      badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      barClass: 'bg-amber-500'
    }
  }
  if (priority >= 3) {
    return {
      label: 'Medium',
      badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      barClass: 'bg-sky-500'
    }
  }
  return {
    label: 'Low',
    badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    barClass: 'bg-slate-500'
  }
}

function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

async function copyEntryContent(entry: KnowledgeEntry) {
  await navigator.clipboard.writeText(entry.content)
  copiedId.value = entry.id
  setTimeout(() => {
    if (copiedId.value === entry.id) copiedId.value = null
  }, 2000)
}

const hasActiveFilters = computed(
  () =>
    statusFilter.value !== 'all' ||
    categoryFilter.value !== 'all' ||
    hotelFilter.value !== 'all' ||
    search.value.length > 0
)

function clearFilters() {
  search.value = ''
  statusFilter.value = 'all'
  categoryFilter.value = 'all'
  hotelFilter.value = 'all'
  currentPage.value = 1
}

function goToPage(page: number) {
  if (!pagination.value) return
  if (page < 1 || page > pagination.value.total_pages) return
  currentPage.value = page
}
</script>

<template>
  <div class="space-y-7 max-w-7xl mx-auto pb-14 px-2 sm:px-4 animate-in fade-in duration-300">
    <!-- ══════════════════════════════════════════════════════════════════
         1. Hero Header
         ══════════════════════════════════════════════════════════════════ -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-start gap-4">
        <div
          class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/25 flex items-center justify-center text-primary shadow-xs shrink-0"
        >
          <BookOpen class="w-6 h-6" />
        </div>
        <div>
          <div class="flex flex-wrap items-center gap-2.5">
            <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {{ t('knowledge.title', 'Knowledge Base') }}
            </h1>
            <!-- AI Live Beacon -->
          </div>
          <p class="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            {{
              t(
                'knowledge.subtitle',
                'Manage FAQ entries and hotel policies that the AI chatbot uses to answer guest questions automatically.'
              )
            }}
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2.5 self-end md:self-auto flex-wrap">
        <Button
          variant="outline"
          size="sm"
          class="h-9 px-3.5 text-xs font-semibold gap-2 rounded-xl border-border/40 bg-card hover:bg-muted/50 shadow-xs"
          :disabled="isLoading || isFetching"
          @click="() => refetch()"
        >
          <RotateCw class="w-3.5 h-3.5 text-primary" :class="{ 'animate-spin': isFetching }" />
          <span>{{ t('common.refresh', 'Refresh') }}</span>
        </Button>

        <Button
          class="h-9 px-4 text-xs font-semibold gap-2 rounded-xl shadow-xs"
          @click="router.push({ name: 'admin-knowledge-create' })"
        >
          <Plus class="w-4 h-4" />
          {{ t('knowledge.create', 'Add Entry') }}
        </Button>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════
         2. KPI Stat Cards
         ══════════════════════════════════════════════════════════════════ -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total -->
      <Card
        class="relative p-5 rounded-2xl border-border/40 bg-gradient-to-br from-card via-card to-card/60 shadow-sm overflow-hidden group hover:border-primary/40 transition-all duration-300"
      >
        <div
          class="absolute -right-3 -top-3 w-20 h-20 bg-sky-500/10 rounded-full blur-xl group-hover:bg-sky-500/20 transition-all"
        />
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {{ t('knowledge.stat_total', 'Total Entries') }}
          </span>
          <div
            class="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400"
          >
            <BookOpen class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{{
            stats.total
          }}</span>
          <span class="text-xs text-muted-foreground/60 font-medium">{{
            t('knowledge.total_entries', 'total entries')
          }}</span>
        </div>
      </Card>

      <!-- Active in AI -->
      <Card
        class="relative p-5 rounded-2xl border-border/40 bg-gradient-to-br from-card via-card to-card/60 shadow-sm overflow-hidden group hover:border-emerald-500/40 transition-all duration-300"
      >
        <div
          class="absolute -right-3 -top-3 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"
        />
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {{ t('knowledge.stat_active', 'Active (AI Uses)') }}
          </span>
          <div
            class="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"
          >
            <Sparkles class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-black tracking-tight text-emerald-400">{{
            stats.active
          }}</span>
          <span class="text-xs text-muted-foreground/60 font-medium">{{
            t('knowledge.active', 'Active')
          }}</span>
        </div>
      </Card>

      <!-- Inactive -->
      <Card
        class="relative p-5 rounded-2xl border-border/40 bg-gradient-to-br from-card via-card to-card/60 shadow-sm overflow-hidden group hover:border-amber-500/40 transition-all duration-300"
      >
        <div
          class="absolute -right-3 -top-3 w-20 h-20 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all"
        />
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {{ t('knowledge.stat_inactive', 'Inactive') }}
          </span>
          <div
            class="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400"
          >
            <Clock class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-black tracking-tight text-amber-400">{{
            stats.inactive
          }}</span>
          <span class="text-xs text-muted-foreground/60 font-medium">{{
            t('knowledge.inactive', 'Inactive')
          }}</span>
        </div>
      </Card>

      <!-- Categories -->
      <Card
        class="relative p-5 rounded-2xl border-border/40 bg-gradient-to-br from-card via-card to-card/60 shadow-sm overflow-hidden group hover:border-violet-500/40 transition-all duration-300"
      >
        <div
          class="absolute -right-3 -top-3 w-20 h-20 bg-violet-500/10 rounded-full blur-xl group-hover:bg-violet-500/20 transition-all"
        />
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {{ t('knowledge.stat_categories', 'Categories') }}
          </span>
          <div
            class="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400"
          >
            <Layers class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-black tracking-tight text-violet-400">{{
            stats.categories
          }}</span>
          <span class="text-xs text-muted-foreground/60 font-medium">{{
            t('knowledge.field_category', 'Category')
          }}</span>
        </div>
      </Card>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════
         3. Search & Quick Filters Bar
         ══════════════════════════════════════════════════════════════════ -->
    <div
      class="bg-card/70 backdrop-blur-md p-3.5 rounded-2xl border border-border/40 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs"
    >
      <!-- Search Input -->
      <div class="relative w-full md:max-w-md">
        <Search
          class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
        />
        <Input
          v-model="search"
          :placeholder="t('knowledge.search', 'Search knowledge base...')"
          class="ps-9 pe-9 w-full h-10 bg-background/60 border-border/40 rounded-xl text-xs sm:text-sm focus-visible:ring-primary/20"
        />
        <button
          v-if="search"
          type="button"
          class="absolute end-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          @click="search = ''"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Filters & Status Pills -->
      <div class="flex items-center gap-2 w-full md:w-auto flex-wrap justify-end">
        <!-- Status Segmented Pills -->
        <div class="inline-flex rounded-xl border border-border/40 bg-background/50 p-1">
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            :class="
              statusFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="statusFilter = 'all'"
          >
            {{ t('knowledge.all_statuses', 'All') }}
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
            :class="
              statusFilter === 'active'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="statusFilter = 'active'"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-300" />
            {{ t('knowledge.active', 'Active') }}
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            :class="
              statusFilter === 'inactive'
                ? 'bg-muted text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="statusFilter = 'inactive'"
          >
            {{ t('knowledge.inactive', 'Inactive') }}
          </button>
        </div>

        <!-- Category Dropdown -->
        <Select v-model="categoryFilter">
          <SelectTrigger class="w-[160px] h-9 bg-background/60 border-border/40 rounded-xl text-xs">
            <Tag class="w-3.5 h-3.5 text-muted-foreground me-1.5 shrink-0" />
            <SelectValue :placeholder="t('knowledge.all_categories', 'All Categories')" />
          </SelectTrigger>
          <SelectContent class="rounded-xl border-border/40 shadow-lg">
            <SelectItem value="all">{{
              t('knowledge.all_categories', 'All Categories')
            }}</SelectItem>
            <SelectItem v-for="cat in KNOWLEDGE_CATEGORIES" :key="cat" :value="cat">
              {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
            </SelectItem>
          </SelectContent>
        </Select>

        <!-- Hotel Dropdown -->
        <Select v-if="hotels.length > 0" v-model="hotelFilter">
          <SelectTrigger class="w-[170px] h-9 bg-background/60 border-border/40 rounded-xl text-xs gap-1.5">
            <Building2 class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <SelectValue :placeholder="t('dashboard.all_hotels', 'All Hotels')" />
          </SelectTrigger>
          <SelectContent class="rounded-xl border-border/40 shadow-lg">
            <SelectItem value="all">{{
              t('dashboard.all_hotels', 'All Hotels')
            }}</SelectItem>
            <SelectItem v-for="h in hotels" :key="h.id" :value="String(h.id)">
              {{ h.name }}
            </SelectItem>
          </SelectContent>
        </Select>

        <!-- Clear Button -->
        <Button
          v-if="hasActiveFilters"
          variant="ghost"
          size="sm"
          class="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          @click="clearFilters"
        >
          {{ t('common.clear', 'Clear') }}
        </Button>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════
         4. Loading Skeleton State
         ══════════════════════════════════════════════════════════════════ -->
    <div v-if="isLoading" class="space-y-4">
      <div
        v-for="i in 4"
        :key="i"
        class="bg-card/60 rounded-2xl border border-border/40 p-5 animate-pulse space-y-4"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="h-6 w-20 rounded-full bg-muted/60" />
            <div class="h-6 w-16 rounded-full bg-muted/60" />
          </div>
          <div class="h-8 w-8 rounded-lg bg-muted/60" />
        </div>
        <div class="h-5 w-1/2 rounded bg-muted/70" />
        <div class="h-16 w-full rounded-xl bg-muted/30" />
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════
         5. Error State
         ══════════════════════════════════════════════════════════════════ -->
    <div
      v-else-if="isError"
      class="py-20 flex flex-col items-center justify-center border border-dashed border-destructive/30 rounded-2xl bg-destructive/5 text-center px-4"
    >
      <AlertCircle class="w-12 h-12 text-destructive mb-3" />
      <h3 class="text-base font-bold text-destructive">
        {{ t('knowledge.error_title', 'Failed to Load Knowledge Base') }}
      </h3>
      <p class="text-xs text-muted-foreground max-w-sm mt-1.5">
        {{
          t(
            'knowledge.error_desc',
            'Could not load entries. Please check your connection and try again.'
          )
        }}
      </p>
      <Button variant="outline" size="sm" class="mt-4 rounded-xl gap-2" @click="() => refetch()">
        <RotateCw class="w-3.5 h-3.5" />
        {{ t('common.retry', 'Retry') }}
      </Button>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════
         6. Knowledge Cards List
         ══════════════════════════════════════════════════════════════════ -->
    <div v-else-if="entries.length > 0" class="space-y-4">
      <TransitionGroup name="list" tag="div" class="space-y-4">
        <div
          v-for="entry in entries"
          :key="entry.id"
          class="group relative bg-card/70 hover:bg-card/95 rounded-2xl border border-border/40 hover:border-primary/40 transition-all duration-300 shadow-xs hover:shadow-md overflow-hidden p-5 sm:p-6"
        >
          <!-- Left priority accent bar -->
          <div
            class="absolute start-0 top-0 bottom-0 w-1.5 transition-all duration-300 group-hover:w-2"
            :class="getPriorityBadge(entry.priority).barClass"
          />

          <div class="flex flex-col gap-4 ps-2">
            <!-- Header Row: Category, Status, Priority, AI Ready, Actions -->
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <div class="flex items-center gap-2 flex-wrap">
                <!-- Category Pill -->
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border"
                  :class="[
                    getCategoryColor(entry.category).bg,
                    getCategoryColor(entry.category).text,
                    getCategoryColor(entry.category).border
                  ]"
                >
                  <Tag class="w-3 h-3" />
                  {{ entry.category }}
                </span>

                <!-- Status Badge -->
                <KnowledgeStatusBadge :status="entry.status" />

                <!-- Priority Badge -->
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider border"
                  :class="getPriorityBadge(entry.priority).badgeClass"
                >
                  {{ getPriorityBadge(entry.priority).label }} ({{ entry.priority }})
                </span>

                <!-- AI Synced Tag -->
                <span
                  v-if="entry.synced_to_ai || entry.qdrant_knowledge_id"
                  class="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20"
                >
                  <Sparkles class="w-2.5 h-2.5" />
                  {{ t('knowledge.synced_ai', 'AI Ready') }}
                </span>
              </div>

              <!-- Action Menu -->
              <div class="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  class="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1 rounded-lg"
                  @click="router.push({ name: 'admin-knowledge-show', params: { id: entry.id } })"
                >
                  <Eye class="w-3.5 h-3.5" />
                  <span>{{ t('actions.view', 'View') }}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  class="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1 rounded-lg"
                  @click="router.push({ name: 'admin-knowledge-edit', params: { id: entry.id } })"
                >
                  <Pencil class="w-3.5 h-3.5" />
                  <span>{{ t('actions.edit', 'Edit') }}</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                    >
                      <MoreVertical class="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    class="w-48 rounded-xl border-border/40 shadow-lg"
                  >
                    <DropdownMenuItem
                      @click="
                        router.push({ name: 'admin-knowledge-show', params: { id: entry.id } })
                      "
                    >
                      <Eye class="w-4 h-4 me-2 text-muted-foreground" />
                      {{ t('actions.view', 'View Details') }}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      @click="
                        router.push({ name: 'admin-knowledge-edit', params: { id: entry.id } })
                      "
                    >
                      <Pencil class="w-4 h-4 me-2 text-muted-foreground" />
                      {{ t('actions.edit', 'Edit Entry') }}
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="openToggleDialog(entry)">
                      <Sparkles class="w-4 h-4 me-2 text-primary" />
                      {{
                        entry.status === 'active'
                          ? t('knowledge.deactivate', 'Deactivate')
                          : t('knowledge.activate', 'Activate')
                      }}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      class="text-destructive focus:text-destructive focus:bg-destructive/10"
                      @click="openDeleteDialog(entry)"
                    >
                      <Trash2 class="w-4 h-4 me-2" />
                      {{ t('actions.delete', 'Delete') }}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <!-- Question / Title -->
            <div class="space-y-1">
              <h3
                class="text-base sm:text-lg font-bold text-foreground hover:text-primary transition-colors cursor-pointer leading-snug flex items-start gap-2"
                @click="router.push({ name: 'admin-knowledge-show', params: { id: entry.id } })"
              >
                <span
                  class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-primary/10 text-primary text-[11px] font-black shrink-0 mt-0.5"
                >
                  Q
                </span>
                <span class="flex-1">{{ entry.title }}</span>
              </h3>
            </div>

            <!-- Answer / Content in soft callout bubble -->
            <div
              class="group/answer relative bg-background/60 hover:bg-background/80 rounded-xl border border-border/30 p-3.5 transition-colors"
            >
              <div class="flex items-start gap-2.5">
                <span
                  class="inline-flex items-center justify-center w-5 h-5 rounded-md bg-muted/60 text-muted-foreground text-[11px] font-black shrink-0 mt-0.5"
                >
                  A
                </span>
                <p
                  class="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line flex-1"
                >
                  {{ entry.content }}
                </p>
                <!-- Copy answer button -->
                <button
                  type="button"
                  class="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all shrink-0"
                  :title="t('knowledge.copy_answer', 'Copy Answer')"
                  @click="copyEntryContent(entry)"
                >
                  <Check v-if="copiedId === entry.id" class="w-3.5 h-3.5 text-emerald-400" />
                  <Copy v-else class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Footer: Hotel affiliation & Timestamps -->
            <div
              class="flex items-center justify-between gap-4 text-xs text-muted-foreground/80 flex-wrap pt-1 border-t border-border/20"
            >
              <div class="flex items-center gap-3 flex-wrap">
                <span
                  v-if="entry.hotel?.name"
                  class="inline-flex items-center gap-1.5 text-foreground/85 font-medium"
                >
                  <Building2 class="w-3.5 h-3.5 text-primary shrink-0" />
                  {{ entry.hotel.name }}
                </span>
                <span class="inline-flex items-center gap-1.5">
                  <Calendar class="w-3.5 h-3.5 text-muted-foreground/60" />
                  {{ formatDate(entry.created_at) }}
                </span>
                <span
                  v-if="entry.updated_at && entry.updated_at !== entry.created_at"
                  class="hidden sm:inline-flex items-center gap-1 text-muted-foreground/60"
                >
                  • Updated {{ formatDate(entry.updated_at) }}
                </span>
              </div>

              <span class="text-[11px] font-mono text-muted-foreground/50"> #{{ entry.id }} </span>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════
         7. Empty State
         ══════════════════════════════════════════════════════════════════ -->
    <div
      v-else
      class="py-20 flex flex-col items-center justify-center border border-dashed border-border/60 rounded-2xl bg-card/30 text-center px-4"
    >
      <div
        class="w-16 h-16 rounded-3xl bg-muted/30 border border-border/40 flex items-center justify-center mb-4 text-muted-foreground/50 shadow-inner"
      >
        <BookOpen class="w-8 h-8" />
      </div>
      <h3 class="text-base font-bold text-foreground">
        {{
          hasActiveFilters
            ? t('knowledge.no_results', 'No Results Found')
            : t('knowledge.empty_title', 'No Knowledge Entries Yet')
        }}
      </h3>
      <p class="text-xs text-muted-foreground max-w-md mt-1.5 leading-relaxed">
        {{
          hasActiveFilters
            ? t('knowledge.no_results_desc', 'Try adjusting your search or filters.')
            : t(
                'knowledge.empty_desc',
                'Start adding FAQ entries, hotel policies, and room information so the AI chatbot can answer guest questions accurately.'
              )
        }}
      </p>
      <Button
        v-if="!hasActiveFilters"
        class="mt-5 rounded-xl gap-2 shadow-xs"
        @click="router.push({ name: 'admin-knowledge-create' })"
      >
        <Plus class="w-4 h-4" />
        {{ t('knowledge.create_first', 'Create Your First Entry') }}
      </Button>
      <Button v-else variant="outline" class="mt-5 rounded-xl" @click="clearFilters">
        {{ t('common.clear_filters', 'Clear Filters') }}
      </Button>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════
         8. Modern Pagination
         ══════════════════════════════════════════════════════════════════ -->
    <div
      v-if="pagination && pagination.total > 0"
      class="flex items-center justify-between mt-4 px-1 flex-wrap gap-4 border-t border-border/30 pt-4"
    >
      <div class="flex items-center gap-4">
        <p class="text-xs text-muted-foreground">
          {{
            t('common.page_info', `Page ${pagination.current_page} of ${pagination.total_pages}`)
          }}
          <span class="hidden sm:inline">
            · {{ pagination.total }} {{ t('knowledge.total_entries', 'total entries') }}
          </span>
        </p>
        <div class="hidden sm:flex items-center gap-2">
          <span class="text-xs text-muted-foreground">{{ t('common.per_page', 'Per page') }}</span>
          <Select
            :model-value="String(perPage)"
            @update:model-value="
              (val: any) => {
                perPage = Number(val)
                currentPage = 1
              }
            "
          >
            <SelectTrigger class="w-[70px] h-8 text-xs rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent class="rounded-xl">
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
          class="h-8 px-3 rounded-xl text-xs"
          :disabled="pagination.current_page <= 1"
          @click="goToPage(pagination.current_page - 1)"
        >
          {{ t('actions.previous', 'Previous') }}
        </Button>

        <template v-for="page in pagination.total_pages" :key="page">
          <Button
            v-if="
              page === 1 ||
              page === pagination.total_pages ||
              Math.abs(page - pagination.current_page) <= 1
            "
            :variant="page === pagination.current_page ? 'default' : 'outline'"
            size="sm"
            class="h-8 w-8 rounded-xl text-xs"
            :class="
              page === pagination.current_page
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                : ''
            "
            @click="goToPage(page)"
          >
            {{ page }}
          </Button>
          <span
            v-else-if="page === 2 && pagination.current_page > 3"
            class="text-muted-foreground text-xs px-1"
            >…</span
          >
          <span
            v-else-if="
              page === pagination.total_pages - 1 &&
              pagination.current_page < pagination.total_pages - 2
            "
            class="text-muted-foreground text-xs px-1"
            >…</span
          >
        </template>

        <Button
          variant="outline"
          size="sm"
          class="h-8 px-3 rounded-xl text-xs"
          :disabled="pagination.current_page >= pagination.total_pages"
          @click="goToPage(pagination.current_page + 1)"
        >
          {{ t('actions.next', 'Next') }}
        </Button>
      </div>
    </div>

    <!-- ── Confirmation Dialogs ────────────────────────────────────────── -->
    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="t('knowledge.delete_title', 'Delete Knowledge Entry?')"
      :description="
        t(
          'knowledge.delete_desc',
          'This entry will be permanently removed. The AI will no longer use this information.'
        )
      "
      :confirm-text="t('actions.delete', 'Delete')"
      :cancel-text="t('common.cancel', 'Cancel')"
      confirm-variant="destructive"
      :loading="deleteMutation.isPending.value"
      @confirm="confirmDelete"
    />

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
  transition: all 0.25s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>

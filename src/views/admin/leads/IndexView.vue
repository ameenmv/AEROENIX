<script setup lang="ts">
import type { LeadCard, LeadClassification } from '@/types/entities/lead'
import {
  Building04Icon,
  Comment01Icon,
  FacebookIcon,
  FireIcon,
  FlashIcon,
  InstagramIcon,
  KanbanIcon,
  Search01Icon,
  TableIcon,
  Target02Icon,
  UserGroupIcon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import draggable from 'vuedraggable'
import { toast } from 'vue-sonner'
import LeadCardComponent from '@/components/admin/leads/LeadCard.vue'
import LeadDetailSheet from '@/components/admin/leads/LeadDetailSheet.vue'
import { Button } from '@/components/uic/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/uic/select'
import { Skeleton } from '@/components/uic/skeleton'
import { hotelsService } from '@/services/hotelsService'
import { leadsService } from '@/services/leadsService'

const { t } = useI18n()
const queryClient = useQueryClient()

// Filters state
const selectedHotelId = ref<string>('all')
const selectedChannel = ref<string>('all')
const searchQuery = ref<string>('')
const viewMode = ref<'kanban' | 'list'>('kanban')
const activeClassificationFilter = ref<LeadClassification | null>(null)

// Detail sheet state
const selectedLead = ref<LeadCard | null>(null)
const sheetOpen = ref(false)

function openDetail(lead: LeadCard) {
  selectedLead.value = lead
  sheetOpen.value = true
}

// ── Fetch Hotels for filter dropdown ──────────────────────────────────────────
const { data: hotelsData } = useQuery({
  queryKey: ['admin-hotels-list'],
  queryFn: () => hotelsService.list({ limit: 100 }),
})

// ── Fetch Leads ───────────────────────────────────────────────────────────────
const queryParams = computed(() => ({
  hotel_id: selectedHotelId.value !== 'all' ? Number(selectedHotelId.value) : undefined,
  channel: selectedChannel.value !== 'all' ? selectedChannel.value : undefined,
  search: searchQuery.value.trim() ? searchQuery.value.trim() : undefined,
  classification: activeClassificationFilter.value || undefined,
}))

const { data: leadsData, isLoading, isFetching, refetch } = useQuery({
  queryKey: ['admin-leads-list', queryParams],
  queryFn: () => leadsService.list(queryParams.value),
})

// Loading indicator triggered on initial load AND refetches (filters, searches)
const isStatsLoading = computed(() => isLoading.value || isFetching.value)

// Local reactive columns for fluid drag-and-drop
const hotLeads = ref<LeadCard[]>([])
const warmLeads = ref<LeadCard[]>([])
const coldLeads = ref<LeadCard[]>([])

watch(
  () => leadsData.value,
  (val) => {
    if (val?.columns) {
      hotLeads.value = [...(val.columns.hot || [])]
      warmLeads.value = [...(val.columns.warm || [])]
      coldLeads.value = [...(val.columns.cold || [])]
    }
    else {
      hotLeads.value = []
      warmLeads.value = []
      coldLeads.value = []
    }
  },
  { immediate: true },
)

// Drag and drop handler
async function onColumnChange(event: any, targetClassification: LeadClassification) {
  if (event.added) {
    const movedLead = event.added.element as LeadCard
    const oldClassification = movedLead.classification
    movedLead.classification = targetClassification

    try {
      await leadsService.updateClassification(movedLead.conversation_id, {
        classification: targetClassification,
      })
      toast.success(
        t('leads.status_updated', {
          classification:
            targetClassification === 'hot'
              ? t('leads.hot', 'Hot 🔥')
              : targetClassification === 'warm'
                ? t('leads.warm', 'Warm 🟡')
                : t('leads.cold', 'Cold 🔵'),
        }),
      )
      // Invalidate background leads cache
      queryClient.invalidateQueries({ queryKey: ['admin-leads-list'] })
    }
    catch {
      toast.error(t('leads.status_update_failed', 'Failed to update classification.'))
      // Revert on error
      movedLead.classification = oldClassification
      refetch()
    }
  }
}

// Summary numbers
const summary = computed(() => {
  return leadsData.value?.summary || {
    total: hotLeads.value.length + warmLeads.value.length + coldLeads.value.length,
    hot: hotLeads.value.length,
    warm: warmLeads.value.length,
    cold: coldLeads.value.length,
  }
})

// Flat list for table view
const allLeadsList = computed(() => {
  return leadsData.value?.leads || [...hotLeads.value, ...warmLeads.value, ...coldLeads.value]
})

function toggleClassification(type: LeadClassification | null) {
  if (activeClassificationFilter.value === type) {
    activeClassificationFilter.value = null
  }
  else {
    activeClassificationFilter.value = type
  }
}
</script>

<template>
  <div class="p-4 sm:p-7 text-foreground min-h-[calc(100vh-(--spacing(16)))] bg-background select-none">
    <div class="max-w-[1600px] mx-auto space-y-7 animate-in fade-in duration-300">

      <!-- ══════════════════════════════════════════════════════════════════
           1. Header Section (System Style)
           ══════════════════════════════════════════════════════════════════ -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div class="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] shrink-0">
            <HugeiconsIcon :icon="Target02Icon" :size="22" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {{ t('leads.title', 'Leads Pipeline') }}
            </h1>
            <p class="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {{ t('leads.subtitle', 'Score, prioritize, and classify guest inquiries across channels.') }}
            </p>
          </div>
        </div>

        <!-- Controls: Hotel Filter & View Switcher -->
        <div class="flex flex-wrap items-center gap-3">
          <!-- Hotel Filter -->
          <Select v-model="selectedHotelId">
            <SelectTrigger class="w-[190px] h-9.5 text-xs bg-card border-border/40 rounded-xl gap-2 shadow-xs hover:border-border transition-colors">
              <HugeiconsIcon :icon="Building04Icon" :size="15" class="text-primary shrink-0" />
              <SelectValue :placeholder="t('leads.all_hotels', 'All Hotels')" />
            </SelectTrigger>
            <SelectContent class="rounded-xl border-border/40 bg-card/95 backdrop-blur-xl shadow-lg">
              <SelectItem value="all">{{ t('leads.all_hotels', 'All Hotels') }}</SelectItem>
              <SelectItem
                v-for="hotel in hotelsData?.data"
                :key="hotel.id"
                :value="String(hotel.id)"
              >
                {{ hotel.name }}
              </SelectItem>
            </SelectContent>
          </Select>

          <!-- View Mode Toggle -->
          <div class="flex items-center p-1 rounded-xl bg-card border border-border/40 shadow-xs">
            <button
              type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              :class="viewMode === 'kanban' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'"
              @click="viewMode = 'kanban'"
            >
              <HugeiconsIcon :icon="KanbanIcon" :size="14" />
              <span class="hidden sm:inline">{{ t('leads.view_kanban', 'Kanban') }}</span>
            </button>
            <button
              type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              :class="viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'"
              @click="viewMode = 'list'"
            >
              <HugeiconsIcon :icon="TableIcon" :size="14" />
              <span class="hidden sm:inline">{{ t('leads.view_list', 'Table') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════
           2. System-Compliant KPI Stats Cards Grid (4 Cards with Skeleton Loading)
           ══════════════════════════════════════════════════════════════════ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <!-- 1. Total Leads -->
        <div
          class="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-5 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/40 hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)] cursor-pointer"
          :class="{ 'ring-2 ring-blue-500/50 border-blue-500/50': activeClassificationFilter === null }"
          @click="toggleClassification(null)"
        >
          <div class="absolute -right-3 -top-3 w-20 h-20 bg-sky-500/10 rounded-full blur-xl group-hover:bg-sky-500/20 transition-all pointer-events-none" />
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {{ t('leads.summary_total', 'Total Leads') }}
            </span>
            <div class="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center transition-transform group-hover:scale-110">
              <HugeiconsIcon :icon="UserGroupIcon" :size="16" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <template v-if="isStatsLoading">
              <Skeleton class="h-8 w-16 mb-1 rounded-lg" />
            </template>
            <template v-else>
              <span class="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{{ summary.total }}</span>
            </template>
          </div>
          <div class="mt-1 text-[11px] text-muted-foreground">
            <template v-if="isStatsLoading">
              <Skeleton class="h-3.5 w-28 rounded-md" />
            </template>
            <template v-else>
              {{ t('leads.kpi_total_desc', 'All active guest leads') }}
            </template>
          </div>
        </div>

        <!-- 2. Hot Leads -->
        <div
          class="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-5 backdrop-blur-xl transition-all duration-300 hover:border-red-500/40 hover:shadow-[0_8px_30px_rgba(239,68,68,0.12)] cursor-pointer"
          :class="{ 'ring-2 ring-red-500/50 border-red-500/50': activeClassificationFilter === 'hot' }"
          @click="toggleClassification('hot')"
        >
          <div class="absolute -right-3 -top-3 w-20 h-20 bg-red-500/10 rounded-full blur-xl group-hover:bg-red-500/20 transition-all pointer-events-none" />
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {{ t('leads.hot', 'Hot 🔥') }}
            </span>
            <div class="h-8 w-8 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center transition-transform group-hover:scale-110">
              <HugeiconsIcon :icon="FireIcon" :size="16" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <template v-if="isStatsLoading">
              <Skeleton class="h-8 w-16 mb-1 rounded-lg" />
            </template>
            <template v-else>
              <span class="text-2xl sm:text-3xl font-bold tracking-tight text-red-400">{{ summary.hot }}</span>
            </template>
          </div>
          <div class="mt-1 text-[11px] text-muted-foreground">
            <template v-if="isStatsLoading">
              <Skeleton class="h-3.5 w-28 rounded-md" />
            </template>
            <template v-else>
              {{ t('leads.kpi_hot_desc', 'High booking intent') }}
            </template>
          </div>
        </div>

        <!-- 3. Warm Leads -->
        <div
          class="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-5 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/40 hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)] cursor-pointer"
          :class="{ 'ring-2 ring-amber-500/50 border-amber-500/50': activeClassificationFilter === 'warm' }"
          @click="toggleClassification('warm')"
        >
          <div class="absolute -right-3 -top-3 w-20 h-20 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {{ t('leads.warm', 'Warm 🟡') }}
            </span>
            <div class="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center transition-transform group-hover:scale-110">
              <HugeiconsIcon :icon="FlashIcon" :size="16" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <template v-if="isStatsLoading">
              <Skeleton class="h-8 w-16 mb-1 rounded-lg" />
            </template>
            <template v-else>
              <span class="text-2xl sm:text-3xl font-bold tracking-tight text-amber-400">{{ summary.warm }}</span>
            </template>
          </div>
          <div class="mt-1 text-[11px] text-muted-foreground">
            <template v-if="isStatsLoading">
              <Skeleton class="h-3.5 w-28 rounded-md" />
            </template>
            <template v-else>
              {{ t('leads.kpi_warm_desc', 'Pricing & availability queries') }}
            </template>
          </div>
        </div>

        <!-- 4. Cold Leads -->
        <div
          class="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-5 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/40 hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)] cursor-pointer"
          :class="{ 'ring-2 ring-blue-500/50 border-blue-500/50': activeClassificationFilter === 'cold' }"
          @click="toggleClassification('cold')"
        >
          <div class="absolute -right-3 -top-3 w-20 h-20 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {{ t('leads.cold', 'Cold 🔵') }}
            </span>
            <div class="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center transition-transform group-hover:scale-110">
              <HugeiconsIcon :icon="Comment01Icon" :size="16" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <template v-if="isStatsLoading">
              <Skeleton class="h-8 w-16 mb-1 rounded-lg" />
            </template>
            <template v-else>
              <span class="text-2xl sm:text-3xl font-bold tracking-tight text-blue-400">{{ summary.cold }}</span>
            </template>
          </div>
          <div class="mt-1 text-[11px] text-muted-foreground">
            <template v-if="isStatsLoading">
              <Skeleton class="h-3.5 w-28 rounded-md" />
            </template>
            <template v-else>
              {{ t('leads.kpi_cold_desc', 'General info & browsing') }}
            </template>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════
           3. Filter Bar & Search Strip
           ══════════════════════════════════════════════════════════════════ -->
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-b from-card/90 to-card/50 border border-border/60 backdrop-blur-xl shadow-xs">
        <!-- Channel Filters -->
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
            :class="selectedChannel === 'all'
              ? 'bg-primary/10 text-primary border-primary/30 shadow-xs'
              : 'bg-card/40 text-muted-foreground border-border/40 hover:text-foreground hover:bg-card/80'"
            @click="selectedChannel = 'all'"
          >
            {{ t('leads.all_channels', 'All Channels') }}
          </button>

          <button
            type="button"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
            :class="selectedChannel === 'whatsapp'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-xs'
              : 'bg-card/40 text-muted-foreground border-border/40 hover:text-foreground hover:bg-card/80'"
            @click="selectedChannel = 'whatsapp'"
          >
            <HugeiconsIcon :icon="WhatsappIcon" :size="14" class="text-emerald-400" />
            <span>{{ t('leads.whatsapp', 'WhatsApp') }}</span>
          </button>

          <button
            type="button"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
            :class="selectedChannel === 'messenger'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-xs'
              : 'bg-card/40 text-muted-foreground border-border/40 hover:text-foreground hover:bg-card/80'"
            @click="selectedChannel = 'messenger'"
          >
            <HugeiconsIcon :icon="FacebookIcon" :size="14" class="text-blue-400" />
            <span>{{ t('leads.messenger', 'Messenger') }}</span>
          </button>

          <button
            type="button"
            class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border"
            :class="selectedChannel === 'instagram'
              ? 'bg-pink-500/10 text-pink-400 border-pink-500/30 shadow-xs'
              : 'bg-card/40 text-muted-foreground border-border/40 hover:text-foreground hover:bg-card/80'"
            @click="selectedChannel = 'instagram'"
          >
            <HugeiconsIcon :icon="InstagramIcon" :size="14" class="text-pink-400" />
            <span>{{ t('leads.instagram', 'Instagram') }}</span>
          </button>
        </div>

        <!-- Search Bar -->
        <div class="relative w-full md:w-80">
          <HugeiconsIcon
            :icon="Search01Icon"
            :size="15"
            class="absolute top-1/2 -translate-y-1/2 start-3 text-muted-foreground pointer-events-none"
          />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('leads.search_placeholder', 'Search guest name, phone, or inquiry...')"
            class="w-full h-9.5 ps-9 pe-3 rounded-xl bg-card border border-border/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary/50 transition-colors shadow-xs"
          />
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════
           4. Kanban Pipeline Board
           ══════════════════════════════════════════════════════════════════ -->
      <div v-if="viewMode === 'kanban'">
        <!-- Skeleton Loading when fetching or filtering -->
        <div v-if="isStatsLoading" class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div v-for="col in 3" :key="col" class="space-y-3">
            <Skeleton class="h-12 w-full rounded-2xl" />
            <Skeleton class="h-32 w-full rounded-2xl" />
            <Skeleton class="h-32 w-full rounded-2xl" />
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          <!-- COLUMN 1: HOT LEADS -->
          <div class="rounded-3xl p-4 bg-gradient-to-b from-card/85 via-card/50 to-card/30 border border-border/60 backdrop-blur-xl shadow-xs flex flex-col gap-3 min-h-[600px] transition-all hover:border-red-500/30">
            <div class="flex items-center justify-between pb-3 border-b border-border/40">
              <div class="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
                <span class="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)] shrink-0"></span>
                <span class="text-sm font-bold text-foreground">{{ t('leads.hot_title', 'Hot') }}</span>
                <span class="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                  {{ hotLeads.length }}
                </span>
              </div>
              <span class="text-[11px] text-muted-foreground truncate">{{ t('leads.hot_desc', 'High intent') }}</span>
            </div>

            <draggable
              v-model="hotLeads"
              group="leads-kanban"
              item-key="id"
              animation="200"
              ghost-class="opacity-40"
              class="flex flex-col gap-3 flex-1 min-h-[420px]"
              @change="(e: any) => onColumnChange(e, 'hot')"
            >
              <template #item="{ element }">
                <LeadCardComponent :lead="element" @select="openDetail" />
              </template>
            </draggable>

            <div
              v-if="hotLeads.length === 0"
              class="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-border/40 rounded-2xl text-xs text-muted-foreground"
            >
              {{ t('leads.empty_column', 'No leads in this column') }}
            </div>
          </div>

          <!-- COLUMN 2: WARM LEADS -->
          <div class="rounded-3xl p-4 bg-gradient-to-b from-card/85 via-card/50 to-card/30 border border-border/60 backdrop-blur-xl shadow-xs flex flex-col gap-3 min-h-[600px] transition-all hover:border-amber-500/30">
            <div class="flex items-center justify-between pb-3 border-b border-border/40">
              <div class="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.7)] shrink-0"></span>
                <span class="text-sm font-bold text-foreground">{{ t('leads.warm_title', 'Warm') }}</span>
                <span class="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                  {{ warmLeads.length }}
                </span>
              </div>
              <span class="text-[11px] text-muted-foreground truncate">{{ t('leads.warm_desc', 'Engaged') }}</span>
            </div>

            <draggable
              v-model="warmLeads"
              group="leads-kanban"
              item-key="id"
              animation="200"
              ghost-class="opacity-40"
              class="flex flex-col gap-3 flex-1 min-h-[420px]"
              @change="(e: any) => onColumnChange(e, 'warm')"
            >
              <template #item="{ element }">
                <LeadCardComponent :lead="element" @select="openDetail" />
              </template>
            </draggable>

            <div
              v-if="warmLeads.length === 0"
              class="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-border/40 rounded-2xl text-xs text-muted-foreground"
            >
              {{ t('leads.empty_column', 'No leads in this column') }}
            </div>
          </div>

          <!-- COLUMN 3: COLD LEADS -->
          <div class="rounded-3xl p-4 bg-gradient-to-b from-card/85 via-card/50 to-card/30 border border-border/60 backdrop-blur-xl shadow-xs flex flex-col gap-3 min-h-[600px] transition-all hover:border-blue-500/30">
            <div class="flex items-center justify-between pb-3 border-b border-border/40">
              <div class="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
                <span class="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.7)] shrink-0"></span>
                <span class="text-sm font-bold text-foreground">{{ t('leads.cold_title', 'Cold') }}</span>
                <span class="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                  {{ coldLeads.length }}
                </span>
              </div>
              <span class="text-[11px] text-muted-foreground truncate">{{ t('leads.cold_desc', 'Browsing') }}</span>
            </div>

            <draggable
              v-model="coldLeads"
              group="leads-kanban"
              item-key="id"
              animation="200"
              ghost-class="opacity-40"
              class="flex flex-col gap-3 flex-1 min-h-[420px]"
              @change="(e: any) => onColumnChange(e, 'cold')"
            >
              <template #item="{ element }">
                <LeadCardComponent :lead="element" @select="openDetail" />
              </template>
            </draggable>

            <div
              v-if="coldLeads.length === 0"
              class="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-border/40 rounded-2xl text-xs text-muted-foreground"
            >
              {{ t('leads.empty_column', 'No leads in this column') }}
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════
           5. Alternative Table List View
           ══════════════════════════════════════════════════════════════════ -->
      <div v-else class="rounded-3xl overflow-hidden bg-card/60 border border-border/50 backdrop-blur-xl shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-start text-xs">
            <thead class="bg-muted/40 border-b border-border/40 text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th class="px-5 py-3.5 text-start">{{ t('leads.guest', 'Guest') }}</th>
                <th class="px-5 py-3.5 text-start">{{ t('leads.channel', 'Channel') }}</th>
                <th class="px-5 py-3.5 text-start">{{ t('leads.score', 'Score') }}</th>
                <th class="px-5 py-3.5 text-start">{{ t('leads.inquiry', 'Inquiry') }}</th>
                <th class="px-5 py-3.5 text-start">{{ t('leads.time', 'Time') }}</th>
                <th class="px-5 py-3.5 text-end">{{ t('leads.actions', 'Actions') }}</th>
              </tr>
            </thead>
            <tbody v-if="isStatsLoading" class="divide-y divide-border/30">
              <tr v-for="i in 5" :key="i">
                <td class="px-5 py-4"><Skeleton class="h-8 w-32 rounded-lg" /></td>
                <td class="px-5 py-4"><Skeleton class="h-6 w-20 rounded-full" /></td>
                <td class="px-5 py-4"><Skeleton class="h-6 w-12 rounded-full" /></td>
                <td class="px-5 py-4"><Skeleton class="h-4 w-48 rounded-md" /></td>
                <td class="px-5 py-4"><Skeleton class="h-4 w-16 rounded-md" /></td>
                <td class="px-5 py-4 text-end"><Skeleton class="h-8 w-16 rounded-xl ms-auto" /></td>
              </tr>
            </tbody>
            <tbody v-else class="divide-y divide-border/30">
              <tr
                v-for="lead in allLeadsList"
                :key="lead.id"
                class="hover:bg-muted/20 cursor-pointer transition-colors"
                @click="openDetail(lead)"
              >
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                      {{ lead.avatar_initials }}
                    </div>
                    <div>
                      <div class="font-bold text-foreground">{{ lead.contact_name || lead.phone || 'Guest' }}</div>
                      <div v-if="lead.phone" class="text-[11px] text-muted-foreground font-mono" dir="ltr">{{ lead.phone }}</div>
                    </div>
                  </div>
                </td>

                <td class="px-5 py-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted/60 border border-border/40">
                    {{ lead.channel_badge_name }}
                  </span>
                </td>

                <td class="px-5 py-4">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border"
                    :class="lead.score >= 70 ? 'bg-red-500/10 text-red-400 border-red-500/20' : lead.score >= 40 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'"
                  >
                    {{ lead.score }}
                  </span>
                </td>

                <td class="px-5 py-4 max-w-xs truncate text-muted-foreground">
                  {{ lead.inquiry }}
                </td>

                <td class="px-5 py-4 text-muted-foreground font-mono">
                  {{ lead.time }}
                </td>

                <td class="px-5 py-4 text-end">
                  <Button variant="outline" size="sm" class="rounded-xl h-8 text-xs font-semibold" @click.stop="openDetail(lead)">
                    {{ t('common.details', 'Details') }}
                  </Button>
                </td>
              </tr>

              <tr v-if="allLeadsList.length === 0">
                <td colspan="6" class="px-5 py-12 text-center text-muted-foreground text-xs">
                  {{ t('leads.empty_search', 'No leads found matching your search.') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Lead Detail Slide-over Sheet -->
    <LeadDetailSheet
      v-model:open="sheetOpen"
      :lead="selectedLead"
    />
  </div>
</template>

<script setup lang="ts">
import type { ActivityLogItem, ActivityLogPagination, ActivityLogListParams, ActivityLogStats } from '@/services/activityLogService'
import type { Hotel } from '@/types/hotel'
import {
  Activity,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  LogIn,
  LogOut,
  RotateCw,
  Search,
  Shield,
  ShieldCheck,
  Sliders,
  Users,
  X,
} from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card } from '@/components/uic/card'
import { Input } from '@/components/uic/input'
import { Button } from '@/components/uic/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/uic/select'
import { activityLogService } from '@/services/activityLogService'
import { hotelsService } from '@/services/hotelsService'

// ── State ────────────────────────────────────────────────────────────────────
const { t, locale } = useI18n()
const logs = ref<ActivityLogItem[]>([])
const pagination = ref<ActivityLogPagination | null>(null)
const serverStats = ref<ActivityLogStats | null>(null)
const isLoading = ref(false)
const isRefreshing = ref(false)
const searchQuery = ref('')
const selectedCategory = ref<string>('all')
const selectedHotelId = ref<string>('all')
const currentPage = ref(1)
const perPage = ref('20')
const hotels = ref<Hotel[]>([])

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

// ── Quick Filter Tabs ────────────────────────────────────────────────────────
const filterCategories = computed(() => [
  { key: 'all', label: t('activity_logs.filters.all', 'All Activities'), icon: Layers },
  { key: 'auth', label: t('activity_logs.filters.auth', 'Auth & Security'), icon: Shield },
  { key: 'settings', label: t('activity_logs.filters.settings', 'Settings'), icon: Sliders },
  { key: 'hotels', label: t('activity_logs.filters.hotels', 'Hotels'), icon: Building2 },
  { key: 'users', label: t('activity_logs.filters.users', 'Users'), icon: Users },
])

// ── Data Fetching ────────────────────────────────────────────────────────────

async function fetchHotels() {
  try {
    const res = await hotelsService.list({ limit: 100 })
    hotels.value = res.data || []
  }
  catch {
    hotels.value = []
  }
}

async function fetchLogs(page = 1, showRefreshAnim = false) {
  if (showRefreshAnim) {
    isRefreshing.value = true
  }
  else {
    isLoading.value = true
  }

  try {
    const params: ActivityLogListParams = {
      page,
      per_page: Number(perPage.value),
    }

    if (searchQuery.value.trim()) {
      params.search = searchQuery.value.trim()
    }

    if (selectedCategory.value !== 'all') {
      params.action = selectedCategory.value
    }

    if (selectedHotelId.value !== 'all') {
      params.hotel_id = selectedHotelId.value
    }

    const result = await activityLogService.getActivityLogs(params)
    logs.value = result.items || []
    pagination.value = result.pagination || null
    if (result.stats) {
      serverStats.value = result.stats
    }
    currentPage.value = page
  }
  catch (err: any) {
    console.error('Failed to load activity logs:', err)
  }
  finally {
    isLoading.value = false
    isRefreshing.value = false
  }
}

function handleSearch() {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    currentPage.value = 1
    fetchLogs(1)
  }, 250)
}

function clearSearch() {
  searchQuery.value = ''
  currentPage.value = 1
  fetchLogs(1)
}

function selectFilterCategory(key: string) {
  selectedCategory.value = key
  currentPage.value = 1
  fetchLogs(1)
}

function goToPage(page: number) {
  if (page < 1 || (pagination.value && page > pagination.value.total_pages)) return
  fetchLogs(page)
}

function refreshNow() {
  fetchLogs(currentPage.value, true)
}

// ── Smart Stats Calculations (Server-driven with local fallback) ────────────
const stats = computed(() => {
  if (serverStats.value) {
    return {
      total: serverStats.value.total,
      authEvents: serverStats.value.auth_events,
      settingsEvents: serverStats.value.settings_events,
      activeActors: serverStats.value.active_operators,
    }
  }

  const allLogs = logs.value
  const authEvents = allLogs.filter(l => {
    const act = (l.action || '').toLowerCase()
    const desc = (l.description || '').toLowerCase()
    return act.includes('login') || act.includes('logout') || act.includes('auth') || desc.includes('logged')
  }).length

  const settingsEvents = allLogs.filter(l => {
    const act = (l.action || '').toLowerCase()
    const desc = (l.description || '').toLowerCase()
    return act.includes('setting') || act.includes('update') || desc.includes('updated') || desc.includes('settings')
  }).length

  const uniqueActors = new Set(allLogs.map(l => l.user_name).filter(Boolean)).size

  return {
    total: pagination.value?.total ?? allLogs.length,
    authEvents,
    settingsEvents,
    activeActors: uniqueActors || 1,
  }
})

// ── User initials & Avatar styling ───────────────────────────────────────────
const avatarGradients = [
  'from-sky-500/25 to-blue-600/30 text-sky-400 border-sky-500/30',
  'from-emerald-500/25 to-teal-600/30 text-emerald-400 border-emerald-500/30',
  'from-violet-500/25 to-purple-600/30 text-violet-400 border-violet-500/30',
  'from-amber-500/25 to-orange-600/30 text-amber-400 border-amber-500/30',
  'from-rose-500/25 to-pink-600/30 text-rose-400 border-rose-500/30',
  'from-indigo-500/25 to-cyan-600/30 text-indigo-400 border-indigo-500/30',
]

function getAvatarStyle(name: string) {
  if (!name) return avatarGradients[0]!
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return avatarGradients[hash % avatarGradients.length]!
}

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]!.substring(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

// ── Clean Message Text to avoid "Super Admin Super Admin logged in" ──────────
function formatLogDescription(userName: string, rawDesc: string): string {
  if (!rawDesc) return ''
  let clean = rawDesc.trim()

  // If description starts with user_name, remove it cleanly
  if (userName && clean.toLowerCase().startsWith(userName.toLowerCase())) {
    clean = clean.substring(userName.length).trim()
  }
  // Also strip "User [userName]" if present
  const userPrefix = `User ${userName}`.toLowerCase()
  if (clean.toLowerCase().startsWith(userPrefix)) {
    clean = clean.substring(userPrefix.length).trim()
  }

  // Capitalize first letter if needed
  if (clean.length > 0) {
    return clean.charAt(0).toUpperCase() + clean.slice(1)
  }
  return rawDesc
}

// ── Action Badge & Icon styling ──────────────────────────────────────────────
interface ActionBadgeConfig {
  label: string
  pillClass: string
  dotClass: string
  icon: any
}

function getActionBadge(action: string, description: string): ActionBadgeConfig {
  const act = (action || '').toLowerCase()
  const desc = (description || '').toLowerCase()

  if (act.includes('login') || desc.includes('logged in')) {
    return {
      label: 'Login',
      pillClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25',
      dotClass: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
      icon: LogIn,
    }
  }

  if (act.includes('logout') || desc.includes('logged out')) {
    return {
      label: 'Logout',
      pillClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25',
      dotClass: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
      icon: LogOut,
    }
  }

  if (act.includes('delete') || act.includes('destroy') || desc.includes('deleted')) {
    return {
      label: 'Delete',
      pillClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25',
      dotClass: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]',
      icon: X,
    }
  }

  if (act.includes('create') || act.includes('store') || desc.includes('created')) {
    return {
      label: 'Create',
      pillClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30 hover:bg-sky-500/25',
      dotClass: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]',
      icon: ShieldCheck,
    }
  }

  if (act.includes('update') || act.includes('edit') || desc.includes('updated') || act.includes('setting')) {
    return {
      label: 'Update',
      pillClass: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/25',
      dotClass: 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]',
      icon: Sliders,
    }
  }

  return {
    label: action || 'Activity',
    pillClass: 'bg-muted/40 text-muted-foreground border-border/40 hover:bg-muted/60',
    dotClass: 'bg-primary/80 shadow-[0_0_8px_rgba(197,168,105,0.6)]',
    icon: Activity,
  }
}

// ── Date formatting ──────────────────────────────────────────────────────────
function formatFullDate(timestamp: string) {
  if (!timestamp) return '—'
  const d = new Date(timestamp)
  return d.toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(timestamp: string) {
  if (!timestamp) return '—'
  const d = new Date(timestamp)
  return d.toLocaleTimeString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function getDateGroup(timestamp: string) {
  if (!timestamp) return 'Other'
  const d = new Date(timestamp)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return t('activity_logs.today', 'Today')
  if (diff === 1) return t('activity_logs.yesterday', 'Yesterday')
  return d.toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Group logs by date
const groupedLogs = computed(() => {
  const groups: { label: string; items: ActivityLogItem[] }[] = []
  let currentGroup = ''

  for (const log of logs.value) {
    const group = getDateGroup(log.timestamp)
    if (group !== currentGroup) {
      currentGroup = group
      groups.push({ label: group, items: [] })
    }
    groups[groups.length - 1]!.items.push(log)
  }
  return groups
})

// ── Watchers ─────────────────────────────────────────────────────────────────
watch(searchQuery, handleSearch)
watch(perPage, () => {
  currentPage.value = 1
  fetchLogs(1)
})
watch(selectedHotelId, () => {
  currentPage.value = 1
  fetchLogs(1)
})

onMounted(() => {
  fetchHotels()
  fetchLogs()
})
</script>

<template>
  <div class="space-y-7 max-w-7xl mx-auto pb-14 px-2 sm:px-4 animate-in fade-in duration-300">
    <!-- ══════════════════════════════════════════════════════════════════
         1. Header with Cyber-Security Beacon & Live Refresh
         ══════════════════════════════════════════════════════════════════ -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
      <div>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/25 flex items-center justify-center text-primary shadow-sm shadow-primary/10">
            <ShieldCheck class="w-5 h-5 text-primary" />
          </div>
          <div>
            <div class="flex items-center gap-2.5">
              <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {{ t('activity_logs.title', 'Activity Logs') }}
              </h1>
             
            </div>
            <p class="text-xs sm:text-sm text-muted-foreground mt-1">
              {{ t('activity_logs.subtitle', 'Security audit trail of all system actions.') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Action controls -->
      <div class="flex items-center gap-3 self-end md:self-auto flex-wrap">
        <!-- Hotel Filter -->
        <Select v-if="hotels.length > 0" v-model="selectedHotelId">
          <SelectTrigger class="w-[170px] h-9 text-xs bg-card border-border/40 rounded-xl gap-2 shadow-xs">
            <Building2 class="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <SelectValue :placeholder="t('dashboard.all_hotels', 'All Hotels')" />
          </SelectTrigger>
          <SelectContent class="rounded-xl border-border/40 shadow-lg">
            <SelectItem value="all">{{ t('dashboard.all_hotels', 'All Hotels') }}</SelectItem>
            <SelectItem v-for="h in hotels" :key="h.id" :value="String(h.id)">
              {{ h.name }}
            </SelectItem>
          </SelectContent>
        </Select>

        <!-- Live Refresh button -->
        <Button
          variant="outline"
          size="sm"
          class="h-9 px-3.5 text-xs font-semibold gap-2 rounded-xl border-border/40 bg-card hover:bg-muted/50 shadow-xs transition-all"
          :disabled="isLoading || isRefreshing"
          @click="refreshNow"
        >
          <RotateCw
            class="w-3.5 h-3.5 text-primary"
            :class="{ 'animate-spin': isRefreshing || isLoading }"
          />
          <span>{{ t('activity_logs.refresh', 'Refresh Logs') }}</span>
        </Button>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════
         2. High-End KPI Stats Cards
         ══════════════════════════════════════════════════════════════════ -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Events -->
      <Card class="relative p-5 rounded-2xl border-border/40 bg-gradient-to-br from-card via-card to-card/60 shadow-sm overflow-hidden group hover:border-primary/40 transition-all duration-300">
        <div class="absolute -right-3 -top-3 w-20 h-20 bg-sky-500/10 rounded-full blur-xl group-hover:bg-sky-500/20 transition-all" />
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {{ t('activity_logs.stat_total_events', 'Total Audit Events') }}
          </span>
          <div class="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <ShieldCheck class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{{ stats.total }}</span>
          <span class="text-xs text-muted-foreground/60 font-medium">{{ t('activity_logs.total_entries', 'total entries') }}</span>
        </div>
      </Card>

      <!-- Auth Events -->
      <Card class="relative p-5 rounded-2xl border-border/40 bg-gradient-to-br from-card via-card to-card/60 shadow-sm overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
        <div class="absolute -right-3 -top-3 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {{ t('activity_logs.stat_auth_events', 'Auth & Logins') }}
          </span>
          <div class="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <LogIn class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-black tracking-tight text-emerald-400">{{ stats.authEvents }}</span>
          <span class="text-xs text-muted-foreground/60 font-medium">{{ t('activity_logs.auth_events_label', 'Auth events') }}</span>
        </div>
      </Card>

      <!-- Settings & Updates -->
      <Card class="relative p-5 rounded-2xl border-border/40 bg-gradient-to-br from-card via-card to-card/60 shadow-sm overflow-hidden group hover:border-violet-500/40 transition-all duration-300">
        <div class="absolute -right-3 -top-3 w-20 h-20 bg-violet-500/10 rounded-full blur-xl group-hover:bg-violet-500/20 transition-all" />
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {{ t('activity_logs.stat_settings_events', 'Settings & Updates') }}
          </span>
          <div class="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Sliders class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-black tracking-tight text-violet-400">{{ stats.settingsEvents }}</span>
          <span class="text-xs text-muted-foreground/60 font-medium">{{ t('activity_logs.settings_events_label', 'Settings changes') }}</span>
        </div>
      </Card>

      <!-- Active Operators -->
      <Card class="relative p-5 rounded-2xl border-border/40 bg-gradient-to-br from-card via-card to-card/60 shadow-sm overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
        <div class="absolute -right-3 -top-3 w-20 h-20 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all" />
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {{ t('activity_logs.stat_active_actors', 'Active Operators') }}
          </span>
          <div class="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Users class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl sm:text-3xl font-black tracking-tight text-amber-400">{{ stats.activeActors }}</span>
          <span class="text-xs text-muted-foreground/60 font-medium">{{ t('activity_logs.active_operators_label', 'Unique users') }}</span>
        </div>
      </Card>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════
         3. Search Bar + Category Filter Pills
         ══════════════════════════════════════════════════════════════════ -->
    <div class="space-y-3">
      <!-- Search row -->
      <div class="flex flex-col sm:flex-row items-center gap-3">
        <div class="relative flex-1 w-full">
          <Search class="w-4 h-4 absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
          <Input
            v-model="searchQuery"
            type="text"
            :placeholder="t('activity_logs.search', 'Search by user, action, or description...')"
            class="w-full h-11 ps-10 pe-10 rounded-2xl bg-card border-border/40 text-sm shadow-xs focus:border-primary/50 transition-all placeholder:text-muted-foreground/40"
          />
          <button
            v-if="searchQuery"
            class="absolute end-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground flex items-center justify-center transition-all cursor-pointer"
            @click="clearSearch"
          >
            <X class="w-3 h-3" />
          </button>
        </div>

        <!-- Per page dropdown -->
        <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span class="text-xs text-muted-foreground font-medium hidden sm:inline">
            {{ t('common.per_page', 'Per page') }}:
          </span>
          <Select v-model="perPage">
            <SelectTrigger class="w-[84px] h-11 text-xs bg-card border-border/40 rounded-2xl shadow-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent class="rounded-xl border-border/40">
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Filter tabs -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
        <button
          v-for="cat in filterCategories"
          :key="cat.key"
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border"
          :class="selectedCategory === cat.key
            ? 'bg-primary text-primary-foreground border-primary shadow-xs shadow-primary/20'
            : 'bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground border-border/40'"
          @click="selectFilterCategory(cat.key)"
        >
          <component :is="cat.icon" class="w-3.5 h-3.5 shrink-0" />
          <span>{{ cat.label }}</span>
        </button>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════
         4. Timeline Main Card
         ══════════════════════════════════════════════════════════════════ -->
    <Card class="border-border/40 shadow-sm rounded-3xl bg-card/60 backdrop-blur-xs overflow-hidden relative">
      <!-- Loading Skeleton -->
      <div v-if="isLoading && logs.length === 0" class="p-6 space-y-6">
        <div v-for="i in 6" :key="i" class="flex items-start gap-4">
          <div class="w-11 h-11 rounded-2xl bg-muted/60 animate-pulse shrink-0" />
          <div class="flex-1 space-y-2.5 pt-1">
            <div class="h-4 bg-muted/60 rounded-full animate-pulse" :style="{ width: `${140 + (i % 3) * 60}px` }" />
            <div class="h-3 bg-muted/40 rounded-full animate-pulse" :style="{ width: `${200 + (i % 4) * 80}px` }" />
          </div>
          <div class="h-3 w-16 bg-muted/40 rounded-full animate-pulse shrink-0" />
        </div>
      </div>

      <!-- Logs Timeline List -->
      <div v-else-if="logs.length > 0" class="divide-y divide-border/20">
        <template v-for="(group, gi) in groupedLogs" :key="gi">
          <!-- Date Sticky Header -->
          <div class="sticky top-0 z-10 px-6 py-2.5 bg-card/90 backdrop-blur-md border-b border-border/30 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Calendar class="w-3.5 h-3.5 text-primary" />
              <span class="text-[11px] font-black uppercase tracking-wider text-foreground/80">
                {{ group.label }}
              </span>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border/30">
              {{ group.items.length }} {{ t('activity_logs.total_entries', 'entries') }}
            </span>
          </div>

          <!-- Items in Group -->
          <div class="px-3 sm:px-6 py-2 relative">
            <!-- Continuous Timeline Spine -->
            <div class="absolute start-[27px] sm:start-[39px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-primary/30 via-border/40 to-transparent" />

            <div
              v-for="log in group.items"
              :key="log.id"
              class="relative flex items-start gap-3 sm:gap-4 py-3.5 px-3 rounded-2xl transition-all duration-200 hover:bg-muted/30 group"
            >
              <!-- Avatar Node -->
              <div class="relative z-1 shrink-0">
                <div
                  class="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br flex items-center justify-center text-xs font-black shadow-xs border transition-transform duration-200 group-hover:scale-105"
                  :class="getAvatarStyle(log.user_name)"
                >
                  {{ getInitials(log.user_name) }}
                </div>
              </div>

              <!-- Content Body -->
              <div class="flex-1 min-w-0 pt-0.5">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
                  <!-- Actor & Action Message -->
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-sm font-bold text-foreground">
                        {{ log.user_name || t('conversations.unknown_contact', 'Unknown') }}
                      </span>

                      <!-- Semantic Action Badge -->
                      <span
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors"
                        :class="getActionBadge(log.action, log.description).pillClass"
                      >
                        <component
                          :is="getActionBadge(log.action, log.description).icon"
                          class="w-3 h-3 shrink-0"
                        />
                        <span>{{ getActionBadge(log.action, log.description).label }}</span>
                      </span>

                      <!-- Associated Hotel Tag -->
                      <span
                        v-if="log.hotel_name"
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted/50 text-muted-foreground border border-border/40 max-w-[140px] truncate"
                        :title="log.hotel_name"
                      >
                        <Building2 class="w-2.5 h-2.5 text-primary shrink-0" />
                        <span class="truncate">{{ log.hotel_name }}</span>
                      </span>
                    </div>

                    <!-- Clean Description -->
                    <p class="text-sm sm:text-[13.5px] text-foreground/90 font-medium mt-1 leading-relaxed">
                      {{ formatLogDescription(log.user_name, log.description) }}
                    </p>
                  </div>

                  <!-- Time & Relative Timestamp -->
                  <div class="flex items-center gap-2 sm:self-start shrink-0 pt-0.5">
                    <!-- Pulse Dot -->
                    <span
                      class="w-1.5 h-1.5 rounded-full shrink-0"
                      :class="getActionBadge(log.action, log.description).dotClass"
                    />

                    <!-- Relative Time -->
                    <span class="text-xs font-semibold text-foreground/80 whitespace-nowrap">
                      {{ log.time_ago }}
                    </span>
                  </div>
                </div>

                <!-- Footer Timestamp Row -->
                <div class="flex items-center gap-2 mt-2.5 text-xs text-muted-foreground font-medium">
                  <span class="flex items-center gap-1.5 text-foreground/85">
                    <Clock class="w-3.5 h-3.5 text-primary/80 shrink-0" />
                    {{ formatTime(log.timestamp) }}
                  </span>
                  <span class="text-muted-foreground/50">•</span>
                  <span class="text-muted-foreground/90">{{ formatFullDate(log.timestamp) }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Empty State -->
      <div v-else class="py-24 text-center px-4">
        <div class="w-16 h-16 rounded-3xl bg-muted/30 border border-border/40 flex items-center justify-center mx-auto mb-4 text-muted-foreground/50 shadow-inner">
          <Activity class="w-8 h-8" />
        </div>
        <h3 class="text-base font-bold text-foreground">
          {{ t('activity_logs.no_logs', 'No activity logs found') }}
        </h3>
        <p class="text-xs text-muted-foreground mt-1.5 max-w-sm mx-auto leading-relaxed">
          {{ searchQuery ? t('activity_logs.no_logs_search', 'Try a different search term or change the filter.') : t('activity_logs.no_logs_desc', 'Activity will appear here as actions are performed on the platform.') }}
        </p>
        <Button
          v-if="searchQuery || selectedCategory !== 'all' || selectedHotelId !== 'all'"
          variant="outline"
          size="sm"
          class="mt-4 rounded-xl text-xs font-semibold"
          @click="clearSearch(); selectFilterCategory('all'); selectedHotelId = 'all'"
        >
          {{ t('common.clear_all', 'Clear Filters') }}
        </Button>
      </div>

      <!-- Loading overlay for refresh -->
      <div
        v-if="isRefreshing"
        class="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center rounded-3xl z-20"
      >
        <div class="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-card border border-border shadow-lg">
          <RotateCw class="w-4 h-4 text-primary animate-spin" />
          <span class="text-xs font-semibold text-foreground">{{ t('common.loading', 'Loading...') }}</span>
        </div>
      </div>
    </Card>

    <!-- ══════════════════════════════════════════════════════════════════
         5. Modern Pagination Footer
         ══════════════════════════════════════════════════════════════════ -->
    <div
      v-if="pagination && pagination.total > 0"
      class="flex flex-col sm:flex-row items-center justify-between gap-4 px-2"
    >
      <p class="text-xs text-muted-foreground font-medium">
        {{ t('activity_logs.page_of', { page: pagination.current_page, total: pagination.total_pages }) }}
        <span class="hidden sm:inline">
          · {{ t('activity_logs.showing', {
            start: ((pagination.current_page - 1) * pagination.per_page) + 1,
            end: Math.min(pagination.current_page * pagination.per_page, pagination.total),
          }) }}
        </span>
      </p>

      <div class="flex items-center gap-1.5" v-if="pagination.total_pages > 1">
        <Button
          variant="outline"
          size="sm"
          class="h-9 px-3 rounded-xl text-xs border-border/40 hover:bg-muted font-semibold"
          :disabled="pagination.current_page <= 1"
          @click="goToPage(pagination.current_page - 1)"
        >
          <ChevronLeft class="w-3.5 h-3.5 rtl:rotate-180 me-1" />
          {{ t('actions.previous', 'Previous') }}
        </Button>

        <template v-for="page in pagination.total_pages" :key="page">
          <Button
            v-if="page === 1 || page === pagination.total_pages || Math.abs(page - pagination.current_page) <= 1"
            :variant="page === pagination.current_page ? 'default' : 'outline'"
            size="sm"
            class="h-9 w-9 rounded-xl text-xs font-bold"
            :class="page === pagination.current_page
              ? 'bg-primary text-primary-foreground shadow-xs shadow-primary/20'
              : 'border-border/40 hover:bg-muted'"
            @click="goToPage(page)"
          >
            {{ page }}
          </Button>
          <span
            v-else-if="page === 2 && pagination.current_page > 3"
            class="text-muted-foreground/40 text-xs px-1 font-bold"
          >…</span>
          <span
            v-else-if="page === pagination.total_pages - 1 && pagination.current_page < pagination.total_pages - 2"
            class="text-muted-foreground/40 text-xs px-1 font-bold"
          >…</span>
        </template>

        <Button
          variant="outline"
          size="sm"
          class="h-9 px-3 rounded-xl text-xs border-border/40 hover:bg-muted font-semibold"
          :disabled="pagination.current_page >= pagination.total_pages"
          @click="goToPage(pagination.current_page + 1)"
        >
          {{ t('actions.next', 'Next') }}
          <ChevronRight class="w-3.5 h-3.5 rtl:rotate-180 ms-1" />
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

<script setup lang="ts">
import type { ActivityLogItem, ActivityLogPagination, ActivityLogListParams } from '@/services/activityLogService'
import {
  Activity01Icon,
  CheckmarkCircle02Icon,
  Comment01Icon,
  Delete02Icon,
  Search01Icon,
  Settings02Icon,
  Share01Icon,
  Shield02Icon,
  UserCheck01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card } from '@/components/uic/card'
import { Input } from '@/components/uic/input'
import { Button } from '@/components/uic/button'
import { Badge } from '@/components/uic/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/uic/select'
import { activityLogService } from '@/services/activityLogService'

// ── State ────────────────────────────────────────────────────────────────────
const { t } = useI18n()
const logs = ref<ActivityLogItem[]>([])
const pagination = ref<ActivityLogPagination | null>(null)
const isLoading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const perPage = ref('20')

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

// ── Data Fetching ────────────────────────────────────────────────────────────

async function fetchLogs(page = 1) {
  isLoading.value = true
  try {
    const params: ActivityLogListParams = {
      page,
      per_page: Number(perPage.value),
    }
    if (searchQuery.value.trim()) {
      params.search = searchQuery.value.trim()
    }

    const result = await activityLogService.getActivityLogs(params)
    logs.value = result.items
    pagination.value = result.pagination
    currentPage.value = page
  } catch (err: any) {
    console.error('Failed to load activity logs:', err)
  } finally {
    isLoading.value = false
  }
}

function handleSearch() {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    currentPage.value = 1
    fetchLogs(1)
  }, 300)
}

function goToPage(page: number) {
  if (page < 1 || (pagination.value && page > pagination.value.total_pages)) return
  fetchLogs(page)
}

// ── Icon Mapping ─────────────────────────────────────────────────────────────
function getIcon(icon: string) {
  switch (icon) {
    case 'settings': return Settings02Icon
    case 'user-check': return UserCheck01Icon
    case 'message-circle': return Comment01Icon
    case 'share-2': return Share01Icon
    case 'shield': return Shield02Icon
    case 'trash': return Delete02Icon
    case 'check': return CheckmarkCircle02Icon
    default: return Activity01Icon
  }
}

function getIconClasses(icon: string) {
  switch (icon) {
    case 'settings': return 'bg-blue-500/15 text-blue-400 ring-blue-500/20'
    case 'user-check': return 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/20'
    case 'message-circle': return 'bg-sky-500/15 text-sky-400 ring-sky-500/20'
    case 'share-2': return 'bg-violet-500/15 text-violet-400 ring-violet-500/20'
    case 'shield': return 'bg-amber-500/15 text-amber-400 ring-amber-500/20'
    case 'trash': return 'bg-rose-500/15 text-rose-400 ring-rose-500/20'
    case 'check': return 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/20'
    default: return 'bg-primary/10 text-primary ring-primary/20'
  }
}

function getIconDotColor(icon: string) {
  switch (icon) {
    case 'settings': return 'bg-blue-400'
    case 'user-check': return 'bg-emerald-400'
    case 'message-circle': return 'bg-sky-400'
    case 'share-2': return 'bg-violet-400'
    case 'shield': return 'bg-amber-400'
    case 'trash': return 'bg-rose-400'
    case 'check': return 'bg-emerald-400'
    default: return 'bg-primary'
  }
}

// ── Date formatting ──────────────────────────────────────────────────────────
function formatFullDate(timestamp: string) {
  const d = new Date(timestamp)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(timestamp: string) {
  const d = new Date(timestamp)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function getDateGroup(timestamp: string) {
  const d = new Date(timestamp)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return t('activity_logs.today', 'Today')
  if (diff === 1) return t('activity_logs.yesterday', 'Yesterday')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
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

watch(searchQuery, handleSearch)
watch(perPage, () => {
  currentPage.value = 1
  fetchLogs(1)
})

onMounted(() => {
  fetchLogs()
})
</script>

<template>
  <div class="p-4 md:p-6 text-foreground min-h-[calc(100vh-(--spacing(16)))] bg-background">
    <div class="max-w-[920px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

      <!-- ── Header ──────────────────────────────────────────── -->
      <div class="mb-7">
        <h1 class="text-2xl font-bold text-foreground tracking-tight">{{ t('activity_logs.title', 'Activity Logs') }}</h1>
        <p class="text-sm text-muted-foreground/70 mt-1">{{ t('activity_logs.subtitle', 'Security audit trail of all system actions.') }}</p>
      </div>

      <!-- ── Search + Stats Bar ──────────────────────────────── -->
      <div class="flex items-center gap-3 mb-5">
        <div class="relative flex-1">
          <HugeiconsIcon
            :icon="Search01Icon"
            :size="18"
            class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40"
          />
          <Input
            v-model="searchQuery"
            type="text"
            :placeholder="t('activity_logs.search', 'Search by user, action, or description...')"
            class="w-full h-12 pl-11 pr-4 rounded-2xl bg-card border-border/30 text-sm focus:border-primary/40"
          />
        </div>
        <div
          v-if="pagination"
          class="hidden sm:flex items-center gap-2 px-4 h-12 rounded-2xl bg-card border border-border/30 text-xs text-muted-foreground shrink-0"
        >
          <span class="font-bold text-foreground">{{ pagination.total }}</span>
          <span>{{ t('activity_logs.total_entries', 'total entries') }}</span>
        </div>
      </div>

      <!-- ── Activity List ───────────────────────────────────── -->
      <Card class="border-border/30 shadow-sm rounded-2xl overflow-hidden relative">

        <!-- Skeleton Loading -->
        <div v-if="isLoading && logs.length === 0" class="p-2">
          <div v-for="i in 8" :key="i" class="flex items-center gap-4 px-4 py-4">
            <div class="w-10 h-10 rounded-xl bg-white/[0.06] shrink-0 animate-pulse" />
            <div class="flex-1 space-y-2.5">
              <div class="h-3.5 bg-white/[0.08] rounded-full animate-pulse" :style="{ width: `${180 + (i % 3) * 60}px` }" />
              <div class="h-2.5 bg-white/[0.04] rounded-full animate-pulse" :style="{ width: `${120 + (i % 4) * 40}px` }" />
            </div>
            <div class="h-2.5 w-16 bg-white/[0.04] rounded-full animate-pulse shrink-0" />
          </div>
        </div>

        <!-- Grouped Activity Rows -->
        <div v-else-if="logs.length > 0">
          <template v-for="(group, gi) in groupedLogs" :key="gi">
            <!-- Date Group Header -->
            <div class="px-5 py-2.5 bg-muted/8 border-b border-border/10 sticky top-0 z-[1]">
              <span class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">
                {{ group.label }}
              </span>
            </div>

            <!-- Rows -->
            <div
              v-for="(log, li) in group.items"
              :key="log.id"
              class="flex items-start gap-4 px-5 py-2.5 transition-all duration-150 hover:bg-white/[0.02] group relative"
              :class="{ 'border-b border-border/8': li < group.items.length - 1 }"
            >
              <!-- Timeline dot connector -->
              <div class="relative flex flex-col items-center shrink-0">
                <!-- Icon -->
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center ring-1 transition-transform duration-200 group-hover:scale-110"
                  :class="getIconClasses(log.icon)"
                >
                  <HugeiconsIcon :icon="getIcon(log.icon)" :size="18" />
                </div>
                <!-- Connector line -->
                <div
                  v-if="li < group.items.length - 1"
                  class="w-[2px] flex-1 mt-1.5 rounded-full bg-border/15"
                  style="min-height: 12px"
                />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0 pt-0.5">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-[13px] text-foreground leading-relaxed">
                      <span class="font-bold">{{ log.user_name }}</span>
                      <span class="text-muted-foreground/70 ml-1">{{ log.description }}</span>
                    </p>

                    <!-- Action badge + full timestamp -->
                    <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge
                        v-if="log.action"
                        variant="outline"
                        class="text-[10px] px-2 py-0 h-5 font-medium border-border/20 text-muted-foreground/60"
                      >
                        {{ log.action }}
                      </Badge>
                      <span class="text-[11px] text-muted-foreground/40 font-medium">
                        {{ formatTime(log.timestamp) }} · {{ formatFullDate(log.timestamp) }}
                      </span>
                    </div>
                  </div>

                  <!-- Relative time -->
                  <div class="flex items-center gap-2 shrink-0 pt-0.5">
                    <span
                      class="w-1.5 h-1.5 rounded-full opacity-60"
                      :class="getIconDotColor(log.icon)"
                    />
                    <span class="text-xs text-muted-foreground/50 font-semibold whitespace-nowrap">
                      {{ log.time_ago }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Empty State -->
        <div v-else class="py-20 text-center">
          <div class="w-16 h-16 rounded-2xl bg-muted/10 flex items-center justify-center mx-auto mb-4">
            <HugeiconsIcon :icon="Activity01Icon" :size="32" class="text-muted-foreground/25" />
          </div>
          <p class="text-sm font-semibold text-foreground/60">{{ t('activity_logs.no_logs', 'No activity logs found') }}</p>
          <p class="text-xs text-muted-foreground/50 mt-1">
            {{ searchQuery ? t('activity_logs.no_logs_search', 'Try a different search term.') : t('activity_logs.no_logs_desc', 'Activity will appear here as actions are performed.') }}
          </p>
        </div>

        <!-- Loading overlay -->
        <div
          v-if="isLoading && logs.length > 0"
          class="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl z-10"
        >
          <div class="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </Card>

      <!-- ── Pagination ──────────────────────────────────────── -->
      <div
        v-if="pagination && pagination.total > 0"
        class="flex items-center justify-between mt-5 px-1 flex-wrap gap-4"
      >
        <div class="flex items-center gap-4">
          <p class="text-xs text-muted-foreground/50">
            {{ t('activity_logs.page_of', { page: pagination.current_page, total: pagination.total_pages }) }}
            <span class="hidden sm:inline">
              · {{ t('activity_logs.showing', { start: ((pagination.current_page - 1) * pagination.per_page) + 1, end: Math.min(pagination.current_page * pagination.per_page, pagination.total) }) }}
            </span>
          </p>
          <div class="hidden sm:flex items-center gap-2">
            <span class="text-xs text-muted-foreground/50">{{ t('activity_logs.records_per_page', 'Records Per Page Display') }}</span>
            <Select v-model="perPage">
              <SelectTrigger class="w-[70px] h-8 text-xs bg-card border-border/30 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="flex items-center gap-1.5" v-if="pagination.total_pages > 1">
          <Button
            variant="outline"
            size="sm"
            class="h-9 px-3 rounded-xl text-xs border-border/30 hover:bg-white/[0.04]"
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
                : 'border-border/30 hover:bg-white/[0.04]'"
              @click="goToPage(page)"
            >
              {{ page }}
            </Button>
            <span
              v-else-if="page === 2 && pagination.current_page > 3"
              class="text-muted-foreground/40 text-xs px-1"
            >…</span>
            <span
              v-else-if="page === pagination.total_pages - 1 && pagination.current_page < pagination.total_pages - 2"
              class="text-muted-foreground/40 text-xs px-1"
            >…</span>
          </template>

          <Button
            variant="outline"
            size="sm"
            class="h-9 px-3 rounded-xl text-xs border-border/30 hover:bg-white/[0.04]"
            :disabled="pagination.current_page >= pagination.total_pages"
            @click="goToPage(pagination.current_page + 1)"
          >
            {{ t('actions.next', 'Next') }}
          </Button>
        </div>
      </div>

    </div>
  </div>
</template>

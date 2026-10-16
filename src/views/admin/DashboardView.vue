<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import type { ChannelDistItem } from '@/services/dashboardService'
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  BubbleChatIcon,
  Building04Icon,
  Calendar03Icon,
  Comment01Icon,
  Delete02Icon,
  FacebookIcon,
  InstagramIcon,
  MailSend01Icon,
  Notification03Icon,
  Shield01Icon,
  SparklesIcon,
  Time02Icon,
  UserCircleIcon,
  UserGroupIcon,
  WhatsappIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useQuery } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Card, CardContent } from '@/components/uic/card'
import { ChartArea } from '@/components/uic/chart'
import { Skeleton } from '@/components/uic/skeleton'
import { Button } from '@/components/uic/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/uic/select'
import { dashboardService } from '@/services/dashboardService'
import { hotelsService } from '@/services/hotelsService'

const { t, locale } = useI18n()
const router = useRouter()

const selectedHotelId = ref<string>('all')

// ── Fetch hotels list for the filter dropdown ────────────────────────────────
const { data: hotelsData } = useQuery({
  queryKey: ['dashboard-hotels-list'],
  queryFn: () => hotelsService.list({ limit: 100 }),
})

// ── Fetch dashboard data ─────────────────────────────────────────────────────
const { data: dashboardData, isLoading } = useQuery({
  queryKey: ['dashboard-stats', selectedHotelId],
  queryFn: () =>
    dashboardService.get(
      selectedHotelId.value !== 'all'
        ? { hotel_id: selectedHotelId.value }
        : undefined,
    ),
})

// ── Computed data ────────────────────────────────────────────────────────────
const kpis = computed(() => dashboardData.value?.kpis)
const chartDays = computed(() => dashboardData.value?.conversations_last_7_days || [])
const channelDist = computed(() => {
  const dist = dashboardData.value?.channel_distribution
  if (!dist) return []
  return Object.values(dist) as ChannelDistItem[]
})

const dayTranslations: Record<string, string> = {
  Sat: 'السبت',
  Sun: 'الأحد',
  Mon: 'الإثنين',
  Tue: 'الثلاثاء',
  Wed: 'الأربعاء',
  Thu: 'الخميس',
  Fri: 'الجمعة',
}

// ── Trend Formatter (fixes +- bug) ──────────────────────────────────────────
function formatTrend(changePercentage?: number, trend?: 'up' | 'down' | 'neutral') {
  if (changePercentage === undefined || changePercentage === null) return null
  const cleanVal = Math.abs(changePercentage)
  const isUp = trend === 'up'
  return {
    label: `${isUp ? '+' : '-'}${cleanVal}%`,
    isUp,
  }
}

// ── Chart config ─────────────────────────────────────────────────────────────
const areaSeries = computed<ApexAxisChartSeries>(() => [
  {
    name: t('dashboard.conversations', 'Conversations'),
    data: chartDays.value.map(d => d.count),
  },
])

const areaCategories = computed<string[]>(() =>
  chartDays.value.map((d) => {
    if (locale.value === 'ar' && d.day && dayTranslations[d.day]) {
      return dayTranslations[d.day]!
    }
    return d.day || ''
  }),
)

function getChannelDisplayName(name: string): string {
  const key = (name || '').toLowerCase()
  if (locale.value === 'ar') {
    if (key.includes('whatsapp')) return 'واتساب'
    if (key.includes('messenger') || key.includes('facebook')) return 'ماسنجر'
    if (key.includes('instagram')) return 'انستغرام'
    if (key.includes('chat')) return 'المحادثة المباشرة'
  }
  return name
}

function getChannelIcon(name: string) {
  const key = (name || '').toLowerCase()
  if (key.includes('whatsapp')) return WhatsappIcon
  if (key.includes('messenger') || key.includes('facebook')) return FacebookIcon
  if (key.includes('instagram')) return InstagramIcon
  return BubbleChatIcon
}

const areaChartOptions = computed<ApexOptions>(() => ({
  colors: ['#38bdf8'],
  stroke: { width: 3, curve: 'smooth' },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      type: 'vertical',
      opacityFrom: 0.45,
      opacityTo: 0.04,
      stops: [0, 100],
    },
  },
  grid: {
    borderColor: 'rgba(148, 163, 184, 0.08)',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  },
  xaxis: {
    labels: { style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 600 } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: { style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 600 } },
  },
  markers: {
    size: 5,
    colors: ['#0f172a'],
    strokeColors: '#38bdf8',
    strokeWidth: 3,
    hover: { sizeOffset: 3 },
  },
  tooltip: {
    theme: 'dark',
    marker: { show: true },
  },
  dataLabels: {
    enabled: true,
    offsetY: -10,
    style: { fontSize: '11px', fontWeight: 700, colors: ['#e2e8f0'] },
    background: { enabled: false },
  },
  chart: {
    toolbar: { show: false },
    zoom: { enabled: false },
    background: 'transparent',
  },
}))

// ── Donut chart — rendered manually with SVG for full control ────────────────
const totalConversationsFromChannels = computed(() =>
  channelDist.value.reduce((sum, c) => sum + c.count, 0),
)

function formatNumber(num: number | undefined) {
  if (!num && num !== 0) return '0'
  return num.toLocaleString()
}

// ── Donut SVG rendering ──────────────────────────────────────────────────────
function computeDonutSegments() {
  const items = channelDist.value
  const total = items.reduce((s, c) => s + c.count, 0)
  if (total === 0) return []

  const segments: { offset: number; dashArray: string; color: string; percentage: number }[] = []
  let cumulative = 0
  const circumference = 2 * Math.PI * 70 // radius = 70

  for (const item of items) {
    const pct = item.count / total
    const length = pct * circumference
    const gap = circumference - length
    segments.push({
      offset: -cumulative * circumference + circumference * 0.25, // start from top
      dashArray: `${length} ${gap}`,
      color: item.color,
      percentage: Math.round(pct * 100),
    })
    cumulative += pct
  }
  return segments
}

const donutSegments = computed(() => computeDonutSegments())

function getIconForActivity(iconName: string) {
  switch (iconName) {
    case 'trash': return Delete02Icon
    case 'shield': return Shield01Icon
    case 'user': return UserCircleIcon
    default: return Notification03Icon
  }
}
</script>

<template>
  <div class="p-4 sm:p-7 text-foreground min-h-[calc(100vh-(--spacing(16)))] bg-background select-none">
    <div class="max-w-[1400px] mx-auto space-y-7 animate-in fade-in duration-300">

      <!-- ══════════════════════════════════════════════════════════════════
           Page Header
           ══════════════════════════════════════════════════════════════════ -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {{ t('dashboard.overview_title', 'Dashboard Overview') }}
            </h1>
          </div>
          <p class="text-muted-foreground mt-1 text-xs sm:text-sm">
            {{ t('dashboard.overview_subtitle', 'Here is what is happening with Azul today.') }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Hotel Filter Dropdown -->
          <Select v-model="selectedHotelId">
            <SelectTrigger class="w-[200px] h-10 rounded-xl bg-card/70 border-border/50 backdrop-blur-md gap-2 shadow-xs hover:border-border transition-colors">
              <HugeiconsIcon :icon="Building04Icon" :size="16" class="text-primary shrink-0" />
              <SelectValue :placeholder="t('dashboard.all_hotels', 'All Hotels')" />
            </SelectTrigger>
            <SelectContent class="rounded-xl border-border/50 bg-card/95 backdrop-blur-xl">
              <SelectItem value="all">{{ t('dashboard.all_hotels', 'All Hotels') }}</SelectItem>
              <SelectItem
                v-for="hotel in hotelsData?.data"
                :key="hotel.id"
                :value="String(hotel.id)"
              >
                {{ hotel.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════
           Quick Shortcuts Strip
           ══════════════════════════════════════════════════════════════════ -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          class="flex items-center gap-2.5 p-3 rounded-xl bg-card/40 hover:bg-card/80 border border-border/40 hover:border-primary/40 transition-all text-xs font-semibold text-muted-foreground hover:text-foreground group cursor-pointer shadow-xs"
          @click="router.push({ name: 'admin-conversations' })"
        >
          <div class="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
            <HugeiconsIcon :icon="Comment01Icon" :size="15" />
          </div>
          <span>{{ t('dashboard.open_inbox', 'Go to Inbox') }}</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-2.5 p-3 rounded-xl bg-card/40 hover:bg-card/80 border border-border/40 hover:border-emerald-500/40 transition-all text-xs font-semibold text-muted-foreground hover:text-foreground group cursor-pointer shadow-xs"
          @click="router.push({ name: 'admin-bookings' })"
        >
          <div class="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
            <HugeiconsIcon :icon="Calendar03Icon" :size="15" />
          </div>
          <span>{{ t('dashboard.view_bookings', 'Manage Bookings') }}</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-2.5 p-3 rounded-xl bg-card/40 hover:bg-card/80 border border-border/40 hover:border-violet-500/40 transition-all text-xs font-semibold text-muted-foreground hover:text-foreground group cursor-pointer shadow-xs"
          @click="router.push({ name: 'admin-knowledge' })"
        >
          <div class="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
            <HugeiconsIcon :icon="SparklesIcon" :size="15" />
          </div>
          <span>{{ t('dashboard.new_knowledge', 'Add Knowledge') }}</span>
        </button>

        <button
          type="button"
          class="flex items-center gap-2.5 p-3 rounded-xl bg-card/40 hover:bg-card/80 border border-border/40 hover:border-amber-500/40 transition-all text-xs font-semibold text-muted-foreground hover:text-foreground group cursor-pointer shadow-xs"
          @click="router.push({ name: 'admin-users' })"
        >
          <div class="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
            <HugeiconsIcon :icon="UserGroupIcon" :size="15" />
          </div>
          <span>{{ t('dashboard.invite_user', 'Invite Team') }}</span>
        </button>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════
           Stats Cards — mapped from kpis.*
           ══════════════════════════════════════════════════════════════════ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <!-- Total Conversations -->
        <Card
          class="relative overflow-hidden rounded-2xl border-border/50 bg-card/70 backdrop-blur-md hover:border-sky-500/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group shadow-xs"
          @click="router.push({ name: 'admin-conversations' })"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-transparent pointer-events-none" />
          <CardContent class="p-6 relative">
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 via-sky-500/10 to-transparent border border-sky-500/25 flex items-center justify-center text-sky-400 shadow-xs">
                <HugeiconsIcon :icon="Comment01Icon" :size="24" />
              </div>
              <template v-if="kpis?.total_conversations?.change_percentage !== undefined">
                <span
                  class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border"
                  :class="formatTrend(kpis.total_conversations.change_percentage, kpis.total_conversations.trend)?.isUp
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'"
                >
                  <HugeiconsIcon
                    :icon="formatTrend(kpis.total_conversations.change_percentage, kpis.total_conversations.trend)?.isUp ? ArrowUp01Icon : ArrowDown01Icon"
                    :size="13"
                  />
                  {{ formatTrend(kpis.total_conversations.change_percentage, kpis.total_conversations.trend)?.label }}
                </span>
              </template>
            </div>

            <template v-if="isLoading">
              <Skeleton class="h-9 w-20 mb-2" />
              <Skeleton class="h-4 w-32" />
            </template>
            <template v-else>
              <p class="text-3xl font-extrabold text-foreground tracking-tight">
                {{ kpis?.total_conversations?.formatted_value || '0' }}
              </p>
              <div class="flex items-center justify-between mt-1">
                <p class="text-xs sm:text-sm text-muted-foreground font-medium">
                  {{ t('dashboard.total_conversations', 'Total Conversations') }}
                </p>
                <span class="text-[11px] text-muted-foreground/60">{{ t('dashboard.from_last_month', 'vs last month') }}</span>
              </div>
            </template>
          </CardContent>
        </Card>

        <!-- Active Leads -->
        <Card
          class="relative overflow-hidden rounded-2xl border-border/50 bg-card/70 backdrop-blur-md hover:border-emerald-500/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group shadow-xs"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
          <CardContent class="p-6 relative">
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-xs">
                <HugeiconsIcon :icon="MailSend01Icon" :size="24" />
              </div>
              <template v-if="kpis?.active_leads?.change_percentage !== undefined">
                <span
                  class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border"
                  :class="formatTrend(kpis.active_leads.change_percentage, kpis.active_leads.trend)?.isUp
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'"
                >
                  <HugeiconsIcon
                    :icon="formatTrend(kpis.active_leads.change_percentage, kpis.active_leads.trend)?.isUp ? ArrowUp01Icon : ArrowDown01Icon"
                    :size="13"
                  />
                  {{ formatTrend(kpis.active_leads.change_percentage, kpis.active_leads.trend)?.label }}
                </span>
              </template>
            </div>

            <template v-if="isLoading">
              <Skeleton class="h-9 w-16 mb-2" />
              <Skeleton class="h-4 w-24" />
            </template>
            <template v-else>
              <p class="text-3xl font-extrabold text-foreground tracking-tight">
                {{ kpis?.active_leads?.formatted_value || '0' }}
              </p>
              <div class="flex items-center justify-between mt-1">
                <p class="text-xs sm:text-sm text-muted-foreground font-medium">
                  {{ t('dashboard.active_leads', 'Active Leads') }}
                </p>
                <span class="text-[11px] text-muted-foreground/60">{{ t('dashboard.from_last_month', 'vs last month') }}</span>
              </div>
            </template>
          </CardContent>
        </Card>

        <!-- Bookings This Month -->
        <Card
          class="relative overflow-hidden rounded-2xl border-border/50 bg-card/70 backdrop-blur-md hover:border-violet-500/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group shadow-xs"
          @click="router.push({ name: 'admin-bookings' })"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent pointer-events-none" />
          <CardContent class="p-6 relative">
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-transparent border border-violet-500/25 flex items-center justify-center text-violet-400 shadow-xs">
                <HugeiconsIcon :icon="Calendar03Icon" :size="24" />
              </div>
              <template v-if="kpis?.bookings_this_month?.change_percentage !== undefined">
                <span
                  class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border"
                  :class="formatTrend(kpis.bookings_this_month.change_percentage, kpis.bookings_this_month.trend)?.isUp
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'"
                >
                  <HugeiconsIcon
                    :icon="formatTrend(kpis.bookings_this_month.change_percentage, kpis.bookings_this_month.trend)?.isUp ? ArrowUp01Icon : ArrowDown01Icon"
                    :size="13"
                  />
                  {{ formatTrend(kpis.bookings_this_month.change_percentage, kpis.bookings_this_month.trend)?.label }}
                </span>
              </template>
            </div>

            <template v-if="isLoading">
              <Skeleton class="h-9 w-16 mb-2" />
              <Skeleton class="h-4 w-36" />
            </template>
            <template v-else>
              <p class="text-3xl font-extrabold text-foreground tracking-tight">
                {{ kpis?.bookings_this_month?.formatted_value || '0' }}
              </p>
              <div class="flex items-center justify-between mt-1">
                <p class="text-xs sm:text-sm text-muted-foreground font-medium">
                  {{ t('dashboard.bookings_this_month', 'Bookings This Month') }}
                </p>
                <span class="text-[11px] text-muted-foreground/60">{{ t('dashboard.from_last_month', 'vs last month') }}</span>
              </div>
            </template>
          </CardContent>
        </Card>

        <!-- Hotels & Users -->
        <Card
          class="relative overflow-hidden rounded-2xl border-border/50 bg-card/70 backdrop-blur-md hover:border-amber-500/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group shadow-xs"
          @click="router.push({ name: 'admin-hotels' })"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />
          <CardContent class="p-6 relative">
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/25 flex items-center justify-center text-amber-400 shadow-xs">
                <HugeiconsIcon :icon="Building04Icon" :size="24" />
              </div>
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground border border-border/40">
                {{ t('dashboard.hotels_and_users', 'Properties & Staff') }}
              </span>
            </div>

            <template v-if="isLoading">
              <Skeleton class="h-9 w-24 mb-2" />
              <Skeleton class="h-4 w-28" />
            </template>
            <template v-else>
              <div class="flex items-baseline gap-5">
                <div>
                  <p class="text-3xl font-extrabold text-foreground tracking-tight">
                    {{ formatNumber(kpis?.hotels_and_users?.hotels_count) }}
                  </p>
                  <p class="text-xs text-muted-foreground font-medium mt-0.5">
                    {{ t('dashboard.total_hotels', 'Hotels') }}
                  </p>
                </div>
                <div class="h-8 w-px bg-border/40" />
                <div>
                  <p class="text-3xl font-extrabold text-foreground tracking-tight">
                    {{ formatNumber(kpis?.hotels_and_users?.users_count) }}
                  </p>
                  <p class="text-xs text-muted-foreground font-medium mt-0.5">
                    {{ t('dashboard.total_users', 'Users') }}
                  </p>
                </div>
              </div>
              <div class="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                <p class="text-xs text-muted-foreground/70 font-medium">
                  {{ t('dashboard.hotels_and_users', 'Hotels & Users') }}
                </p>
              </div>
            </template>
          </CardContent>
        </Card>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════
           Charts Row
           ══════════════════════════════════════════════════════════════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">

        <!-- Conversations Chart (takes 3/5 columns) -->
        <div class="lg:col-span-3">
          <template v-if="isLoading">
            <Card class="rounded-2xl border-border/50 bg-card/70 p-6">
              <Skeleton class="h-6 w-48 mb-4" />
              <Skeleton class="h-[280px] w-full rounded-xl" />
            </Card>
          </template>
          <template v-else>
            <Card class="rounded-2xl border-border/50 bg-card/70 backdrop-blur-md p-6 h-full flex flex-col justify-between shadow-xs">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-base font-bold text-foreground">
                    {{ t('dashboard.conversations_last_7_days', 'Conversations — Last 7 Days') }}
                  </h3>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    {{ t('dashboard.subtitle', 'Overview of messaging traffic across the week') }}
                  </p>
                </div>
                <div class="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-xl border border-border/40">
                  <HugeiconsIcon :icon="Calendar03Icon" :size="14" class="text-primary" />
                  <span>{{ t('dashboard.last_7_days', 'Last 7 Days') }}</span>
                </div>
              </div>

              <ChartArea
                :series="areaSeries"
                :categories="areaCategories"
                :height="320"
                :options="areaChartOptions"
                :fill-opacity="0.4"
                class="w-full"
              />
            </Card>
          </template>
        </div>

        <!-- Channel Distribution (takes 2/5 columns) -->
        <div class="lg:col-span-2">
          <template v-if="isLoading">
            <Card class="rounded-2xl border-border/50 bg-card/70 p-6 h-full">
              <Skeleton class="h-6 w-40 mb-4" />
              <Skeleton class="h-[180px] w-[180px] rounded-full mx-auto mb-4" />
              <Skeleton class="h-4 w-full mb-2" v-for="i in 3" :key="i" />
            </Card>
          </template>
          <template v-else>
            <Card class="rounded-2xl border-border/50 bg-card/70 backdrop-blur-md h-full shadow-xs">
              <CardContent class="p-6 flex flex-col justify-between h-full">
                <div>
                  <h3 class="text-base font-bold text-foreground">
                    {{ t('dashboard.channel_distribution', 'Channel Distribution') }}
                  </h3>
                  <p class="text-xs text-muted-foreground mt-0.5 mb-5">
                    {{ t('dashboard.channel_desc', 'Traffic distribution across messaging platforms') }}
                  </p>
                </div>

                <div class="flex flex-col items-center my-2">
                  <!-- Custom SVG Donut Chart -->
                  <div class="relative w-[190px] h-[190px] mx-auto mb-5">
                    <svg viewBox="0 0 200 200" class="w-full h-full -rotate-90">
                      <!-- Background circle -->
                      <circle
                        cx="100" cy="100" r="70"
                        fill="none"
                        stroke="rgba(148, 163, 184, 0.1)"
                        stroke-width="22"
                      />
                      <!-- Data segments -->
                      <circle
                        v-for="(seg, idx) in donutSegments"
                        :key="idx"
                        cx="100" cy="100" r="70"
                        fill="none"
                        :stroke="seg.color"
                        stroke-width="22"
                        :stroke-dasharray="seg.dashArray"
                        :stroke-dashoffset="seg.offset"
                        stroke-linecap="round"
                        class="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <!-- Center label -->
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                      <span class="text-3xl font-extrabold text-foreground tracking-tight font-mono">
                        {{ formatNumber(totalConversationsFromChannels) }}
                      </span>
                      <span class="text-[11px] text-muted-foreground font-semibold mt-0.5">{{ t('dashboard.conversations', 'Conversations') }}</span>
                    </div>
                  </div>

                  <!-- Custom Rich Legend with icons & progress tracks -->
                  <div class="w-full space-y-3.5">
                    <div
                      v-for="channel in channelDist"
                      :key="channel.name"
                      class="space-y-1.5"
                    >
                      <div class="flex items-center justify-between text-xs">
                        <div class="flex items-center gap-2">
                          <HugeiconsIcon :icon="getChannelIcon(channel.name)" :size="15" :style="{ color: channel.color }" />
                          <span class="font-semibold text-foreground">{{ getChannelDisplayName(channel.name) }}</span>
                        </div>
                        <div class="flex items-center gap-2.5">
                          <span class="font-mono text-muted-foreground font-semibold">{{ channel.percentage }}%</span>
                          <span class="font-bold text-foreground font-mono tabular-nums min-w-[30px] text-right">
                            {{ formatNumber(channel.count) }}
                          </span>
                        </div>
                      </div>
                      <!-- Relative progress bar -->
                      <div class="w-full h-1.5 rounded-full bg-muted/40 overflow-hidden">
                        <div
                          class="h-full rounded-full transition-all duration-500"
                          :style="{ width: `${channel.percentage}%`, backgroundColor: channel.color }"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </template>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════
           Recent Activity Stream
           ══════════════════════════════════════════════════════════════════ -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2.5">
            <h3 class="text-lg font-bold text-foreground">
              {{ t('dashboard.recent_activity', 'Recent Activity') }}
            </h3>
            <span class="text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-md border border-border/40 font-mono">
              {{ dashboardData?.recent_activity?.length || 0 }}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            class="text-xs h-8 rounded-xl border-border/60 hover:bg-muted/40"
            @click="router.push({ name: 'admin-activity-logs' })"
          >
            {{ t('dashboard.view_all', 'View All') }}
          </Button>
        </div>
        
        <template v-if="isLoading">
          <Card class="rounded-2xl border-border/50 bg-card/70 p-6">
            <div class="space-y-4">
              <Skeleton class="h-14 w-full rounded-xl" v-for="i in 4" :key="i" />
            </div>
          </Card>
        </template>
        <template v-else-if="dashboardData?.recent_activity?.length">
          <Card class="rounded-2xl border-border/50 bg-card/70 backdrop-blur-md overflow-hidden shadow-xs divide-y divide-border/40">
            <div
              v-for="activity in dashboardData.recent_activity"
              :key="activity.id"
              class="p-4 flex items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
            >
              <div class="flex items-center gap-3.5 min-w-0">
                <!-- Icon Squircle -->
                <div class="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center bg-primary/10 text-primary border border-primary/20 shadow-xs">
                  <HugeiconsIcon :icon="getIconForActivity(activity.icon)" :size="18" />
                </div>
                
                <!-- Content -->
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-foreground truncate">
                    <span class="text-primary font-bold">{{ activity.user_name }}</span>
                    <span class="font-normal text-muted-foreground ml-1.5">{{ activity.description }}</span>
                  </p>
                </div>
              </div>

              <!-- Time -->
              <div class="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 font-mono">
                <HugeiconsIcon :icon="Time02Icon" :size="13" class="opacity-60" />
                <span>{{ activity.time_ago }}</span>
              </div>
            </div>
          </Card>
        </template>
        <template v-else>
          <Card class="rounded-2xl border-border/50 bg-card/70 backdrop-blur-md p-10 text-center flex flex-col items-center justify-center shadow-xs">
            <div class="w-14 h-14 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-center text-muted-foreground mb-3">
              <HugeiconsIcon :icon="Notification03Icon" :size="24" />
            </div>
            <p class="text-sm font-bold text-foreground">{{ t('dashboard.no_recent_activity', 'No recent activity.') }}</p>
            <p class="text-xs text-muted-foreground mt-1">{{ t('dashboard.no_recent_desc', 'System events and staff actions will appear here.') }}</p>
          </Card>
        </template>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApexOptions } from 'apexcharts'
import type { ChannelDistItem } from '@/services/dashboardService'
import {
  Building04Icon,
  Comment01Icon,
  MailSend01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useQuery } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Card, CardContent } from '@/components/uic/card'
import { ChartArea } from '@/components/uic/chart'

import { Skeleton } from '@/components/uic/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/uic/select'
import { dashboardService } from '@/services/dashboardService'
import { hotelsService } from '@/services/hotelsService'

const { t } = useI18n()
const router = useRouter()

const selectedHotelId = ref<string>('all')

// Fetch hotels list for the filter dropdown
const { data: hotelsData } = useQuery({
  queryKey: ['dashboard-hotels-list'],
  queryFn: () => hotelsService.list({ limit: 100 }),
})

// Fetch dashboard data
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


// ── Chart config ─────────────────────────────────────────────────────────────
const areaSeries = computed<ApexAxisChartSeries>(() => [
  {
    name: 'Conversations',
    data: chartDays.value.map(d => d.count),
  },
])

const areaCategories = computed(() => chartDays.value.map(d => d.day))

const areaChartOptions = computed<ApexOptions>(() => ({
  colors: ['#38bdf8'],
  stroke: { width: 3, curve: 'smooth' },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      type: 'vertical',
      opacityFrom: 0.4,
      opacityTo: 0.05,
      stops: [0, 100],
    },
  },
  grid: {
    borderColor: 'rgba(148, 163, 184, 0.12)',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  },
  xaxis: {
    labels: { style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 500 } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: { style: { colors: '#94a3b8', fontSize: '12px', fontWeight: 500 } },
  },
  markers: {
    size: 5,
    colors: ['#0f172a'],
    strokeColors: '#38bdf8',
    strokeWidth: 3,
    hover: { sizeOffset: 2 },
  },
  tooltip: {
    theme: 'dark',
    marker: { show: true },
  },
  dataLabels: {
    enabled: true,
    offsetY: -10,
    style: { fontSize: '11px', fontWeight: 600, colors: ['#e2e8f0'] },
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
</script>

<template>
  <div class="p-6 text-foreground min-h-[calc(100vh-(--spacing(16)))] bg-background">
    <div class="max-w-[1400px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <!-- ══════════════════════════════════════════════════════════════════
           Page Header
           ══════════════════════════════════════════════════════════════════ -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">
            {{ t('common.Dashboard', 'Dashboard') }}
          </h1>
          <p class="text-muted-foreground mt-1 text-sm">
            {{ t('common.dashboard_subtitle', 'Overview of Aeroenix Hotel platform performance.') }}
          </p>
        </div>

        <div class="flex items-center gap-4">
          <!-- Hotel Filter -->
          <Select v-model="selectedHotelId">
            <SelectTrigger class="w-[180px] h-10 bg-card border-border/50 gap-2">
              <HugeiconsIcon :icon="Building04Icon" :size="16" class="text-muted-foreground shrink-0" />
              <SelectValue :placeholder="t('dashboard.all_hotels', 'All Hotels')" />
            </SelectTrigger>
            <SelectContent>
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

          <!-- User Badge -->
          
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════
           Stats Cards — mapped from kpis.*
           ══════════════════════════════════════════════════════════════════ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <!-- Total Conversations -->
        <Card
          class="relative overflow-hidden border-border/40 hover:border-border/70 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
          @click="router.push({ name: 'admin-conversations' })"
        >
          <CardContent class="px-5 py-3">
            <div class="flex items-start justify-between mb-4">
              <div class="w-11 h-11 rounded-xl bg-sky-500/15 flex items-center justify-center">
                <HugeiconsIcon :icon="Comment01Icon" :size="22" class="text-sky-400" />
              </div>
              <span
                v-if="kpis?.total_conversations?.change_percentage"
                class="text-xs font-semibold px-2.5 py-1 rounded-full"
                :class="kpis.total_conversations.trend === 'up' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'"
              >
                {{ kpis.total_conversations.trend === 'up' ? '+' : '-' }}{{ kpis.total_conversations.change_percentage }}%
              </span>
            </div>
            <template v-if="isLoading">
              <Skeleton class="h-8 w-20 mb-1" />
              <Skeleton class="h-4 w-32" />
            </template>
            <template v-else>
              <p class="text-3xl font-bold text-foreground tracking-tight">
                {{ kpis?.total_conversations?.formatted_value || '0' }}
              </p>
              <p class="text-sm text-muted-foreground mt-0.5 font-medium">
                {{ kpis?.total_conversations?.label || t('dashboard.total_conversations', 'Total Conversations') }}
              </p>
            </template>
          </CardContent>
        </Card>

        <!-- Active Leads -->
        <Card
          class="relative overflow-hidden border-border/40 hover:border-border/70 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
        >
          <CardContent class="px-5 py-3">
            <div class="flex items-start justify-between mb-4">
              <div class="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <HugeiconsIcon :icon="MailSend01Icon" :size="22" class="text-emerald-400" />
              </div>
              <span
                v-if="kpis?.active_leads?.change_percentage"
                class="text-xs font-semibold px-2.5 py-1 rounded-full"
                :class="kpis.active_leads.trend === 'up' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'"
              >
                {{ kpis.active_leads.trend === 'up' ? '+' : '-' }}{{ kpis.active_leads.change_percentage }}%
              </span>
            </div>
            <template v-if="isLoading">
              <Skeleton class="h-8 w-16 mb-1" />
              <Skeleton class="h-4 w-24" />
            </template>
            <template v-else>
              <p class="text-3xl font-bold text-foreground tracking-tight">
                {{ kpis?.active_leads?.formatted_value || '0' }}
              </p>
              <p class="text-sm text-muted-foreground mt-0.5 font-medium">
                {{ kpis?.active_leads?.label || t('dashboard.active_leads', 'Active Leads') }}
              </p>
            </template>
          </CardContent>
        </Card>

        <!-- Bookings This Month -->
        <Card
          class="relative overflow-hidden border-border/40 hover:border-border/70 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
        >
          <CardContent class="px-5 py-3">
            <div class="flex items-start justify-between mb-4">
              <div class="w-11 h-11 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-violet-400">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
              </div>
              <span
                v-if="kpis?.bookings_this_month?.change_percentage"
                class="text-xs font-semibold px-2.5 py-1 rounded-full"
                :class="kpis.bookings_this_month.trend === 'up' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'"
              >
                {{ kpis.bookings_this_month.trend === 'up' ? '+' : '-' }}{{ kpis.bookings_this_month.change_percentage }}%
              </span>
            </div>
            <template v-if="isLoading">
              <Skeleton class="h-8 w-12 mb-1" />
              <Skeleton class="h-4 w-36" />
            </template>
            <template v-else>
              <p class="text-3xl font-bold text-foreground tracking-tight">
                {{ kpis?.bookings_this_month?.formatted_value || '0' }}
              </p>
              <p class="text-sm text-muted-foreground mt-0.5 font-medium">
                {{ kpis?.bookings_this_month?.label || t('dashboard.bookings_this_month', 'Bookings This Month') }}
              </p>
            </template>
          </CardContent>
        </Card>

        <!-- Hotels & Users (split card) -->
        <Card
          class="relative overflow-hidden border-border/40 hover:border-border/70 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
          @click="router.push({ name: 'admin-hotels' })"
        >
          <CardContent class="px-5 py-3">
            <div class="flex items-start justify-between mb-4">
              <div class="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <HugeiconsIcon :icon="Building04Icon" :size="22" class="text-blue-400" />
              </div>
            </div>
            <template v-if="isLoading">
              <Skeleton class="h-8 w-24 mb-1" />
              <Skeleton class="h-4 w-28" />
            </template>
            <template v-else>
              <div class="flex items-baseline gap-6">
                <div>
                  <p class="text-3xl font-bold text-foreground tracking-tight">
                    {{ formatNumber(kpis?.hotels_and_users?.hotels_count) }}
                  </p>
                  <p class="text-xs text-muted-foreground font-medium mt-0.5">
                    {{ kpis?.hotels_and_users?.label_hotels || t('dashboard.total_hotels', 'Total Hotels') }}
                  </p>
                </div>
                <div class="h-8 w-px bg-border/50" />
                <div>
                  <p class="text-3xl font-bold text-foreground tracking-tight">
                    {{ formatNumber(kpis?.hotels_and_users?.users_count) }}
                  </p>
                  <p class="text-xs text-muted-foreground font-medium mt-0.5">
                    {{ kpis?.hotels_and_users?.label_users || t('dashboard.total_users', 'Total Users') }}
                  </p>
                </div>
              </div>
              <p class="text-sm text-muted-foreground mt-2 font-medium">
                {{ kpis?.hotels_and_users?.title || t('dashboard.hotels_and_users', 'Hotels & Users') }}
              </p>
            </template>
          </CardContent>
        </Card>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════
           Charts Row
           ══════════════════════════════════════════════════════════════════ -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-5">

        <!-- Conversations Chart (takes 3/5 columns) -->
        <div class="lg:col-span-3">
          <template v-if="isLoading">
            <Card class="border-border/40 p-5">
              <Skeleton class="h-6 w-48 mb-4" />
              <Skeleton class="h-[280px] w-full rounded-lg" />
            </Card>
          </template>
          <template v-else>
            <ChartArea
              :series="areaSeries"
              :categories="areaCategories"
              :height="280"
              :options="areaChartOptions"
              :fill-opacity="0.35"
              class="border-border/40"
            >
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-semibold text-foreground">
                    {{ t('dashboard.conversations_last_7_days', 'Conversations — Last 7 Days') }}
                  </h3>
                  <div class="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                    <span class="font-medium">{{ t('dashboard.last_7_days', 'Last 7 Days') }}</span>
                  </div>
                </div>
              </template>
            </ChartArea>
          </template>
        </div>

        <!-- Channel Distribution (takes 2/5 columns) -->
        <div class="lg:col-span-2">
          <template v-if="isLoading">
            <Card class="border-border/40 p-5 h-full">
              <Skeleton class="h-6 w-40 mb-4" />
              <Skeleton class="h-[180px] w-[180px] rounded-full mx-auto mb-4" />
              <Skeleton class="h-4 w-full mb-2" />
              <Skeleton class="h-4 w-full mb-2" />
              <Skeleton class="h-4 w-full" />
            </Card>
          </template>
          <template v-else>
            <Card class="border-border/40 h-full">
              <CardContent class="p-5">
                <h3 class="text-sm font-semibold text-foreground mb-5">
                  {{ t('dashboard.channel_distribution', 'Channel Distribution') }}
                </h3>

                <div class="flex flex-col items-center">
                  <!-- Custom SVG Donut Chart -->
                  <div class="relative w-[200px] h-[200px] mx-auto mb-5">
                    <svg viewBox="0 0 200 200" class="w-full h-full -rotate-90">
                      <!-- Background circle -->
                      <circle
                        cx="100" cy="100" r="70"
                        fill="none"
                        stroke="rgba(148, 163, 184, 0.1)"
                        stroke-width="24"
                      />
                      <!-- Data segments -->
                      <circle
                        v-for="(seg, idx) in donutSegments"
                        :key="idx"
                        cx="100" cy="100" r="70"
                        fill="none"
                        :stroke="seg.color"
                        stroke-width="24"
                        :stroke-dasharray="seg.dashArray"
                        :stroke-dashoffset="seg.offset"
                        stroke-linecap="round"
                        class="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <!-- Center label -->
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                      <span class="text-2xl font-bold text-foreground">
                        {{ formatNumber(totalConversationsFromChannels) }}
                      </span>
                      <span class="text-xs text-muted-foreground font-medium">Conversations</span>
                    </div>
                  </div>

                  <!-- Custom Legend -->
                  <div class="w-full space-y-3">
                    <div
                      v-for="channel in channelDist"
                      :key="channel.name"
                      class="flex items-center justify-between"
                    >
                      <div class="flex items-center gap-2.5">
                        <span
                          class="w-2.5 h-2.5 rounded-full shrink-0"
                          :style="{ backgroundColor: channel.color }"
                        />
                        <span class="text-sm font-medium text-foreground">{{ channel.name }}</span>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="text-sm font-semibold text-muted-foreground">{{ channel.percentage }}%</span>
                        <span class="text-sm font-bold text-foreground tabular-nums min-w-[40px] text-right">
                          {{ formatNumber(channel.count) }}
                        </span>
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
           Recent Activity
           ══════════════════════════════════════════════════════════════════ -->
      
    </div>
  </div>
</template>

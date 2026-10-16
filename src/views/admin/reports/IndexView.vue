<script setup lang="ts">
import {
  Analytics01Icon,
  Building04Icon,
  Calendar03Icon,
  Download01Icon,
  Loading03Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useQuery } from '@tanstack/vue-query'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'
import FunnelStageBar from '@/components/admin/reports/FunnelStageBar.vue'
import ReportKpiCard from '@/components/admin/reports/ReportKpiCard.vue'
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
import { reportsService } from '@/services/reportsService'

const { t } = useI18n()

const selectedHotelId = ref<string>('all')
const isExporting = ref(false)

// ── Fetch Hotels for the scoping filter ─────────────────────────────────────────
const { data: hotelsData } = useQuery({
  queryKey: ['reports-hotels-list'],
  queryFn: () => hotelsService.list({ limit: 100 }),
})

// ── Fetch Funnel Metrics & KPIs ────────────────────────────────────────────────
const queryParams = computed(() => ({
  hotel_id: selectedHotelId.value !== 'all' ? Number(selectedHotelId.value) : undefined,
}))

const { data: funnelData, isLoading } = useQuery({
  queryKey: ['reports-funnel-metrics', queryParams],
  queryFn: () => reportsService.getFunnelMetrics(queryParams.value),
})

// KPI shortcuts
const kpis = computed(() => funnelData.value?.kpis)
const funnel = computed(() => funnelData.value?.lead_funnel)

// Conversion steps calculation
const convToLeadsRatio = computed(() => {
  const conv = funnel.value?.total_conversations?.count || 0
  const leads = funnel.value?.leads_generated?.count || 0
  if (conv <= 0) return ''
  const pct = Math.round((leads / conv) * 100)
  return `${pct}% conversion rate`
})

const leadsToBookingsRatio = computed(() => {
  const leads = funnel.value?.leads_generated?.count || 0
  const bookings = funnel.value?.bookings_created?.count || 0
  if (leads <= 0) return ''
  const pct = Math.round((bookings / leads) * 100)
  return `${pct}% of leads booked`
})

const bookingsToConfirmedRatio = computed(() => {
  const bookings = funnel.value?.bookings_created?.count || 0
  const confirmed = funnel.value?.confirmed?.count || 0
  if (bookings <= 0) return ''
  const pct = Math.round((confirmed / bookings) * 100)
  return `${pct}% confirmed`
})

// ── Handle CSV Export ─────────────────────────────────────────────────────────
async function handleExportCsv() {
  if (isExporting.value) return
  isExporting.value = true
  try {
    await reportsService.exportCsv(queryParams.value)
    toast.success(t('reports.export_success', 'Report exported successfully as CSV!'))
  }
  catch (err: any) {
    console.error('Export CSV error:', err)
    toast.error(t('reports.export_error', 'Failed to generate report export.'))
  }
  finally {
    isExporting.value = false
  }
}
</script>

<template>
  <div class="p-4 sm:p-7 text-foreground min-h-[calc(100vh-(--spacing(16)))] bg-background select-none">
    <div class="max-w-[1400px] mx-auto space-y-7 animate-in fade-in duration-300">

      <!-- ══════════════════════════════════════════════════════════════════
           Header & Export Action
           ══════════════════════════════════════════════════════════════════ -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div class="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] shrink-0">
            <HugeiconsIcon :icon="Analytics01Icon" :size="22" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {{ t('reports.title', 'Reports & Analytics') }}
            </h1>
            <p class="text-muted-foreground mt-0.5 text-xs sm:text-sm">
              {{ t('reports.subtitle', 'Performance insights, lead conversion funnels, and customer data exports.') }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- Hotel Filter Dropdown -->
          <Select v-model="selectedHotelId">
            <SelectTrigger class="w-[190px] h-10 rounded-xl bg-card/70 border-border/50 backdrop-blur-md gap-2 shadow-xs hover:border-border transition-colors">
              <HugeiconsIcon :icon="Building04Icon" :size="16" class="text-primary shrink-0" />
              <SelectValue :placeholder="t('reports.all_hotels', 'All Hotels')" />
            </SelectTrigger>
            <SelectContent class="rounded-xl border-border/50 bg-card/95 backdrop-blur-xl">
              <SelectItem value="all">{{ t('reports.all_hotels', 'All Hotels') }}</SelectItem>
              <SelectItem
                v-for="hotel in hotelsData?.data"
                :key="hotel.id"
                :value="String(hotel.id)"
              >
                {{ hotel.name }}
              </SelectItem>
            </SelectContent>
          </Select>

          <!-- Export CSV Button -->
          <Button
            :disabled="isExporting"
            class="h-10 rounded-xl px-4 gap-2 font-semibold shadow-xs"
            @click="handleExportCsv"
          >
            <HugeiconsIcon
              :icon="isExporting ? Loading03Icon : Download01Icon"
              :size="16"
              :class="{ 'animate-spin': isExporting }"
            />
            <span>
              {{ isExporting ? t('reports.exporting', 'Generating Export...') : t('reports.export_csv', 'Export CSV') }}
            </span>
          </Button>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════
           Top 4 KPI Cards Grid
           ══════════════════════════════════════════════════════════════════ -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Skeleton v-for="i in 4" :key="i" class="h-32 rounded-2xl" />
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- 1. Avg Response Time -->
        <ReportKpiCard
          type="response_time"
          :value="kpis?.avg_response_time?.value || '1.2s'"
          :label="t('reports.kpis.avg_response_time', 'Avg Response Time')"
          :badge-text="kpis?.avg_response_time?.label || 'Bot'"
          :subtext="kpis?.avg_response_time?.description"
        />

        <!-- 2. Guest Satisfaction -->
        <ReportKpiCard
          type="satisfaction"
          :value="kpis?.guest_satisfaction?.value || '4.7/5'"
          :label="t('reports.kpis.guest_satisfaction', 'Guest Satisfaction')"
          :rating="kpis?.guest_satisfaction?.rating || 4.7"
          :stars="kpis?.guest_satisfaction?.stars || 5"
        />

        <!-- 3. Bot Mistakes -->
        <ReportKpiCard
          type="mistakes"
          :value="kpis?.bot_mistakes?.value ?? 3"
          :label="t('reports.kpis.bot_mistakes', 'Bot Mistakes')"
          :badge-text="kpis?.bot_mistakes?.period || 'This month'"
          :trend-color="kpis?.bot_mistakes?.trend_color || 'red'"
        />

        <!-- 4. Handover Rate -->
        <ReportKpiCard
          type="handover"
          :value="kpis?.handover_rate?.value || '13%'"
          :label="t('reports.kpis.handover_rate', 'Handover Rate')"
          :badge-text="kpis?.handover_rate?.comparison || 'from 18%'"
          :trend="kpis?.handover_rate?.trend || 'down'"
        />
      </div>

      <!-- ══════════════════════════════════════════════════════════════════
           Lead Funnel Visual Progress Card
           ══════════════════════════════════════════════════════════════════ -->
      <div v-if="isLoading">
        <Skeleton class="h-80 w-full rounded-3xl" />
      </div>

      <div v-else class="rounded-3xl p-6 sm:p-7 bg-card/60 border border-border/40 backdrop-blur-md shadow-xs space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/30">
          <div>
            <h3 class="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <span>{{ t('reports.lead_funnel', 'Lead Funnel') }}</span>
              <span class="text-xs font-normal text-muted-foreground">— {{ funnelData?.month_label || t('reports.lead_funnel_period', 'This Month') }}</span>
            </h3>
            <p class="text-xs text-muted-foreground mt-0.5">
              {{ t('reports.lead_funnel_desc', 'Guest journey progression from initial conversation to confirmed booking') }}
            </p>
          </div>

          <div class="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <HugeiconsIcon :icon="Calendar03Icon" :size="14" class="text-primary" />
            <span>{{ funnelData?.period || 'This Month' }}</span>
          </div>
        </div>

        <!-- 4 Funnel Stages List -->
        <div class="space-y-4">
          <!-- Stage 1: Total Conversations -->
          <FunnelStageBar
            :label="funnel?.total_conversations?.label || t('reports.stages.total_conversations', 'Total Conversations')"
            :count="funnel?.total_conversations?.count ?? 0"
            :bar-percentage="funnel?.total_conversations?.bar_percentage ?? 100"
            :color-hex="funnel?.total_conversations?.color || '#3b82f6'"
          />

          <!-- Stage 2: Leads Generated -->
          <FunnelStageBar
            :label="funnel?.leads_generated?.label || t('reports.stages.leads_generated', 'Leads Generated')"
            :count="funnel?.leads_generated?.count ?? 0"
            :bar-percentage="funnel?.leads_generated?.bar_percentage ?? 37"
            :color-hex="funnel?.leads_generated?.color || '#f59e0b'"
            :conversion-ratio-text="convToLeadsRatio"
          />

          <!-- Stage 3: Bookings Created -->
          <FunnelStageBar
            :label="funnel?.bookings_created?.label || t('reports.stages.bookings_created', 'Bookings Created')"
            :count="funnel?.bookings_created?.count ?? 0"
            :bar-percentage="funnel?.bookings_created?.bar_percentage ?? 26"
            :color-hex="funnel?.bookings_created?.color || '#14b8a6'"
            :conversion-ratio-text="leadsToBookingsRatio"
          />

          <!-- Stage 4: Confirmed Bookings -->
          <FunnelStageBar
            :label="funnel?.confirmed?.label || t('reports.stages.confirmed', 'Confirmed Bookings')"
            :count="funnel?.confirmed?.count ?? 0"
            :bar-percentage="funnel?.confirmed?.bar_percentage ?? 20"
            :color-hex="funnel?.confirmed?.color || '#22c55e'"
            :conversion-ratio-text="bookingsToConfirmedRatio"
          />
        </div>
      </div>

    </div>
  </div>
</template>

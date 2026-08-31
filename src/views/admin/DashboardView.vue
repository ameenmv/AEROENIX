<script setup lang="ts">
import {
  Activity01Icon,
  Airplane01Icon,
  ArrowUpRight01Icon,
  BookOpen01Icon,
  MoreHorizontalIcon,
  UserGroupIcon,
  Wallet01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import { Button as Btn } from '@/components/uic/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/uic/card'

const { t } = useI18n()
</script>

<template>
  <div class="p-6 text-foreground min-h-[calc(100vh-(--spacing(16)))] bg-background">
    <div class="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">
            {{ $t('common.Dashboard', 'Dashboard Overview') }}
          </h1>
          <p class="text-muted-foreground mt-1 text-sm">
            {{ $t('common.dashboard_subtitle', 'Here is what is happening with Aeroenix today.') }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Btn variant="outline" class="gap-2 h-10 px-4">
            <HugeiconsIcon :icon="BookOpen01Icon" :size="18" />
            <span>{{ $t('common.documentation', 'View Docs') }}</span>
          </Btn>
          <Btn variant="primary" class="gap-2 h-10 px-4 shadow-md shadow-primary/20">
            <HugeiconsIcon :icon="ArrowUpRight01Icon" :size="18" />
            <span>{{ $t('common.export', 'Export Report') }}</span>
          </Btn>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Stat 1 -->
        <Card class="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/50">
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">
              {{ $t('dashboard.total_flights', 'Total Flights') }}
            </CardTitle>
            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <HugeiconsIcon :icon="Airplane01Icon" :size="18" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold">
              1,248
            </div>
            <p class="text-xs text-emerald-500 flex items-center gap-1 mt-1 font-medium">
              <HugeiconsIcon :icon="ArrowUpRight01Icon" :size="14" />
              {{ $t('dashboard.from_last_month', 'from last month') }}
            </p>
          </CardContent>
        </Card>

        <!-- Stat 2 -->
        <Card class="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/50">
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">
              {{ $t('dashboard.active_users', 'Active Passengers') }}
            </CardTitle>
            <div class="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <HugeiconsIcon :icon="UserGroupIcon" :size="18" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold">
              +14,592
            </div>
            <p class="text-xs text-emerald-500 flex items-center gap-1 mt-1 font-medium">
              <HugeiconsIcon :icon="ArrowUpRight01Icon" :size="14" />
              {{ $t('dashboard.from_last_month', 'from last month') }}
            </p>
          </CardContent>
        </Card>

        <!-- Stat 3 -->
        <Card class="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/50">
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">
              {{ $t('dashboard.revenue', 'Total Revenue') }}
            </CardTitle>
            <div class="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <HugeiconsIcon :icon="Wallet01Icon" :size="18" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold">
              $1.4M
            </div>
            <p class="text-xs text-emerald-500 flex items-center gap-1 mt-1 font-medium">
              <HugeiconsIcon :icon="ArrowUpRight01Icon" :size="14" />
              {{ $t('dashboard.from_last_month', 'from last month') }}
            </p>
          </CardContent>
        </Card>

        <!-- Stat 4 -->
        <Card class="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/50">
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">
              {{ $t('dashboard.system_health', 'System Health') }}
            </CardTitle>
            <div class="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
              <HugeiconsIcon :icon="Activity01Icon" :size="18" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold">
              99.9%
            </div>
            <p class="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {{ $t('dashboard.all_systems_operational', 'All systems operational') }}
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Main Content Area -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Chart Placeholder -->
        <Card class="col-span-1 lg:col-span-2 border-border/50 shadow-sm flex flex-col group">
          <CardHeader class="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle>{{ $t('dashboard.activity_overview', 'Activity Overview') }}</CardTitle>
              <CardDescription>{{ $t('dashboard.activity_subtitle', 'Daily flight and passenger metrics.') }}</CardDescription>
            </div>
            <Btn variant="ghost" size="icon" class="text-muted-foreground hover:bg-muted">
              <HugeiconsIcon :icon="MoreHorizontalIcon" :size="20" />
            </Btn>
          </CardHeader>
          <CardContent class="flex-1 flex flex-col items-center justify-center min-h-[300px] border-t border-border/40 mt-4 pt-8 text-muted-foreground">
            <!-- Simulated Chart Area -->
            <div class="w-full h-full flex items-end justify-between gap-1 sm:gap-2 px-1 sm:px-4 pb-4 opacity-80 group-hover:opacity-100 transition-opacity">
              <div v-for="i in 20" :key="i" class="w-full bg-primary/20 rounded-t-md hover:bg-primary transition-colors cursor-pointer relative group/bar" :style="`height: ${Math.max(20, Math.random() * 100)}%`">
                <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-md opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {{ Math.floor(Math.random() * 500) + 100 }}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Recent Activity Feed -->
        <Card class="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>{{ $t('dashboard.recent_activity', 'Recent Activity') }}</CardTitle>
            <CardDescription>{{ $t('dashboard.recent_activity_subtitle', 'Latest actions in the system.') }}</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-6 pt-2">
              <div v-for="i in 5" :key="i" class="flex gap-4 group">
                <div class="relative flex-shrink-0 mt-1">
                  <div class="w-2.5 h-2.5 bg-primary/80 rounded-full ring-4 ring-primary/10 group-hover:ring-primary/30 group-hover:scale-125 transition-all duration-300" />
                  <div v-if="i < 5" class="absolute top-4 left-[4.5px] w-[1px] h-full bg-border -z-10 group-hover:bg-primary/20 transition-colors duration-300" />
                </div>
                <div class="flex-1 space-y-1.5 pb-1">
                  <p class="text-sm font-medium leading-none text-foreground">
                    New flight AX-492 scheduled
                  </p>
                  <p class="text-xs text-muted-foreground leading-relaxed">
                    Flight from DXB to LHR confirmed by admin.
                  </p>
                  <p class="text-[10px] text-muted-foreground/70 font-semibold uppercase tracking-wider">
                    {{ $t('dashboard.mins_ago', { count: i * 15 }) }}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

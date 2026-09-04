<script setup lang="ts">
import {
  Activity01Icon,
  Building04Icon,
  MailSend01Icon,
  UserGroupIcon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useQuery } from '@tanstack/vue-query'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/uic/card'
import { Button as Btn } from '@/components/uic/button'
import { hotelsService } from '@/services/hotelsService'
import { usersService } from '@/services/usersService'

const { t } = useI18n()
const router = useRouter()

// Fetch hotels list for count & overview
const { data: hotelsData, isLoading: isLoadingHotels } = useQuery({
  queryKey: ['dashboard-hotels'],
  queryFn: () => hotelsService.list({ limit: 5 }),
})

// Fetch users & invitations list for count & overview
const { data: usersData, isLoading: isLoadingUsers } = useQuery({
  queryKey: ['dashboard-users'],
  queryFn: () => usersService.list({ limit: 5 }),
})
</script>

<template>
  <div class="p-6 text-foreground min-h-[calc(100vh-(--spacing(16)))] bg-background">
    <div class="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">
            {{ t('common.Dashboard', 'Dashboard Overview') }}
          </h1>
          <p class="text-muted-foreground mt-1 text-sm">
            {{ t('common.dashboard_subtitle', 'Here is what is happening with Aeroenix today.') }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Btn variant="primary" class="gap-2 h-10 px-4 shadow-md shadow-primary/20" @click="router.push({ name: 'admin-hotels' })">
            <HugeiconsIcon :icon="Building04Icon" :size="18" />
            <span>{{ t('hotels.title', 'Manage Hotels') }}</span>
          </Btn>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Hotels -->
        <Card class="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/50 cursor-pointer" @click="router.push({ name: 'admin-hotels' })">
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">
              {{ t('hotels.title', 'Hotels') }}
            </CardTitle>
            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <HugeiconsIcon :icon="Building04Icon" :size="18" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold">
              <span v-if="isLoadingHotels" class="animate-pulse">...</span>
              <span v-else>{{ hotelsData?.pagination?.total ?? hotelsData?.data?.length ?? 0 }}</span>
            </div>
            <p class="text-xs text-muted-foreground mt-1 font-medium">
              {{ t('hotels.subtitle', 'Managed properties') }}
            </p>
          </CardContent>
        </Card>

        <!-- Total Active Users -->
        <Card class="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/50 cursor-pointer" @click="router.push({ name: 'admin-users' })">
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">
              {{ t('users.title', 'System Users') }}
            </CardTitle>
            <div class="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <HugeiconsIcon :icon="UserGroupIcon" :size="18" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold">
              <span v-if="isLoadingUsers" class="animate-pulse">...</span>
              <span v-else>{{ usersData?.pagination?.total ?? usersData?.users?.length ?? 0 }}</span>
            </div>
            <p class="text-xs text-muted-foreground mt-1 font-medium">
              {{ t('users.subtitle', 'Active staff & admins') }}
            </p>
          </CardContent>
        </Card>

        <!-- Pending Invitations -->
        <Card class="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/50 cursor-pointer" @click="router.push({ name: 'admin-users' })">
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">
              {{ t('users.tabs.invitations', 'Pending Invitations') }}
            </CardTitle>
            <div class="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <HugeiconsIcon :icon="MailSend01Icon" :size="18" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold">
              <span v-if="isLoadingUsers" class="animate-pulse">...</span>
              <span v-else>{{ usersData?.invitations?.length ?? 0 }}</span>
            </div>
            <p class="text-xs text-amber-500 mt-1 font-medium">
              {{ t('users.status.invited', 'Awaiting acceptance') }}
            </p>
          </CardContent>
        </Card>

        <!-- System Health -->
        <Card class="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/50">
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium text-muted-foreground">
              {{ t('dashboard.system_health', 'System Health') }}
            </CardTitle>
            <div class="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <HugeiconsIcon :icon="Activity01Icon" :size="18" />
            </div>
          </CardHeader>
          <CardContent>
            <div class="text-3xl font-bold text-emerald-500 flex items-center gap-2">
              <HugeiconsIcon :icon="CheckmarkCircle02Icon" :size="24" />
              <span>100%</span>
            </div>
            <p class="text-xs text-muted-foreground mt-1">
              {{ t('dashboard.all_systems_operational', 'All systems operational') }}
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Main Overview Tables -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Hotels -->
        <Card class="border-border/50 shadow-sm">
          <CardHeader class="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{{ t('hotels.title', 'Hotels Overview') }}</CardTitle>
              <CardDescription>{{ t('hotels.subtitle', 'Recently created hotel properties') }}</CardDescription>
            </div>
            <Btn variant="outline" size="sm" @click="router.push({ name: 'admin-hotels' })">
              {{ t('actions.view', 'View All') }}
            </Btn>
          </CardHeader>
          <CardContent>
            <div v-if="isLoadingHotels" class="py-8 text-center text-muted-foreground text-sm">
              Loading hotels...
            </div>
            <div v-else-if="!hotelsData?.data?.length" class="py-8 text-center text-muted-foreground text-sm">
              No hotels configured yet.
            </div>
            <div v-else class="space-y-4 pt-2">
              <div
                v-for="hotel in hotelsData.data"
                :key="hotel.id"
                class="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer"
                @click="router.push({ name: 'admin-hotels-show', params: { id: hotel.id } })"
              >
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {{ hotel.name.substring(0, 2).toUpperCase() }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-foreground leading-tight">{{ hotel.name }}</p>
                    <p class="text-xs text-muted-foreground mt-0.5">{{ hotel.address || 'No address specified' }}</p>
                  </div>
                </div>
                <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize" :class="hotel.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'">
                  {{ hotel.status }}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Recent Users -->
        <Card class="border-border/50 shadow-sm">
          <CardHeader class="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{{ t('users.title', 'Recent Users') }}</CardTitle>
              <CardDescription>{{ t('users.subtitle', 'Active platform administrators & staff') }}</CardDescription>
            </div>
            <Btn variant="outline" size="sm" @click="router.push({ name: 'admin-users' })">
              {{ t('actions.view', 'View All') }}
            </Btn>
          </CardHeader>
          <CardContent>
            <div v-if="isLoadingUsers" class="py-8 text-center text-muted-foreground text-sm">
              Loading users...
            </div>
            <div v-else-if="!usersData?.users?.length" class="py-8 text-center text-muted-foreground text-sm">
              No users found.
            </div>
            <div v-else class="space-y-4 pt-2">
              <div
                v-for="user in usersData.users"
                :key="user.id"
                class="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer"
                @click="router.push({ name: 'admin-users-show', params: { id: user.id } })"
              >
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                    {{ user.name.substring(0, 2).toUpperCase() }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-foreground leading-tight">{{ user.name }}</p>
                    <p class="text-xs text-muted-foreground mt-0.5">{{ user.email }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-xs font-medium text-foreground block">{{ user.role?.name || user.hotel_name || 'Staff' }}</span>
                  <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize mt-0.5" :class="user.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'">
                    {{ user.status }}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

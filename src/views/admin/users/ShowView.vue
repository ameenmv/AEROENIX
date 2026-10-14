<script setup lang="ts">
import type { User } from '@/types/entities/users'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import {
  ArrowLeft01Icon,
  Building04Icon,
  Calendar03Icon,
  CheckmarkBadge01Icon,
  Clock01Icon,
  Copy01Icon,
  Delete02Icon,
  Edit02Icon,
  Mail01Icon,
  SecurityLockIcon,
  SmartPhone01Icon,
  Tick01Icon,
  UnavailableIcon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

import { usersService } from '@/services/usersService'
import { Button } from '@/components/uic/button'
import { Card } from '@/components/uic/card'
import { Skeleton } from '@/components/uic/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/uic/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/uic/alert-dialog'
import { DataTable } from '@/components/ui/tables'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const queryClient = useQueryClient()

const userId = computed(() => route.params.id as string)

// ── Query ────────────────────────────────────────────────────────────────────
const { data: user, isLoading } = useQuery<User>({
  queryKey: ['users', userId],
  queryFn: () => usersService.get(userId.value),
  enabled: () => !!userId.value,
})

// ── Copy helpers ─────────────────────────────────────────────────────────────
const copiedEmail = ref(false)
const copiedPhone = ref(false)

function copyEmail(email: string) {
  navigator.clipboard.writeText(email)
  copiedEmail.value = true
  toast.success(t('users.copied_to_clipboard', 'Email copied to clipboard'))
  setTimeout(() => (copiedEmail.value = false), 2000)
}

function copyPhone(phone: string) {
  navigator.clipboard.writeText(phone)
  copiedPhone.value = true
  toast.success(t('users.copied_to_clipboard', 'Phone copied to clipboard'))
  setTimeout(() => (copiedPhone.value = false), 2000)
}

// ── Formatters ───────────────────────────────────────────────────────────────
function formatDate(dateStr?: string | null): string {
  if (!dateStr) return t('users.never', 'Never')
  return new Date(dateStr).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getInitials(name?: string): string {
  if (!name) return 'U'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => (p?.[0] ? p[0].toUpperCase() : ''))
    .join('')
}

// ── Suspend / Activate Dialog ────────────────────────────────────────────────
const isStatusDialogOpen = ref(false)
const { mutate: toggleStatusFn, isPending: isTogglingStatus } = useMutation({
  mutationFn: () => usersService.toggleStatus(userId.value),
  onSuccess: () => {
    isStatusDialogOpen.value = false
    toast.success(
      user.value?.status === 'active'
        ? t('users.confirm_suspend_success', 'User suspended successfully')
        : t('users.confirm_activate_success', 'User activated successfully'),
    )
    queryClient.invalidateQueries({ queryKey: ['users', userId] })
    queryClient.invalidateQueries({ queryKey: ['users'] })
  },
  onError: () => {
    toast.error(t('common.error_occurred', 'Failed to update user status.'))
  },
})

// ── Delete Dialog ────────────────────────────────────────────────────────────
const isDeleteDialogOpen = ref(false)
const { mutate: deleteUserFn, isPending: isDeleting } = useMutation({
  mutationFn: () => usersService.delete(userId.value),
  onSuccess: () => {
    isDeleteDialogOpen.value = false
    toast.success(t('users.delete_success', 'User deleted successfully.'))
    queryClient.invalidateQueries({ queryKey: ['users'] })
    router.push({ name: 'admin-users' })
  },
  onError: () => {
    toast.error(t('common.error_occurred', 'Failed to delete user.'))
  },
})

// ── Activity Log Columns ─────────────────────────────────────────────────────
const activityColumns = [
  { key: 'description', label: 'common.description' },
  { key: 'created_at', label: 'common.timestamp', className: 'text-end w-48' },
]
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-7 pb-20 px-2 sm:px-4 animate-in fade-in duration-300">
    <!-- ── Top Header ──────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3.5">
        <Button
          variant="ghost"
          size="icon"
          class="shrink-0 rounded-xl hover:bg-muted/50 border border-border/40"
          @click="router.push({ name: 'admin-users' })"
        >
          <HugeiconsIcon :icon="ArrowLeft01Icon" :size="20" class="rtl:rotate-180" />
        </Button>
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-2xl font-bold tracking-tight text-foreground">
              {{ t('users.user_profile', 'User Dossier') }}
            </h1>
            <span class="text-xs font-mono text-muted-foreground bg-muted/40 px-2.5 py-0.5 rounded-lg border border-border/40">
              #{{ userId }}
            </span>
          </div>
          <p class="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {{ t('users.subtitle', 'Manage platform users and invitations') }}
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div v-if="user" class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          class="rounded-xl gap-2 text-xs font-medium border-border/60 hover:bg-muted/40"
          @click="router.push({ name: 'admin-users-edit', params: { id: userId } })"
        >
          <HugeiconsIcon :icon="Edit02Icon" :size="15" class="text-primary" />
          {{ t('users.actions.update_role', 'Change Role') }}
        </Button>

        <Button
          variant="outline"
          size="sm"
          class="rounded-xl gap-2 text-xs font-medium border-border/60"
          :class="user.status === 'active'
            ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-500/10'
            : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10'"
          @click="isStatusDialogOpen = true"
        >
          <HugeiconsIcon
            :icon="user.status === 'active' ? UnavailableIcon : CheckmarkBadge01Icon"
            :size="15"
          />
          {{ user.status === 'active' ? t('users.actions.suspend', 'Suspend') : t('users.actions.activate', 'Activate') }}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          class="rounded-xl text-destructive hover:bg-destructive/10 gap-1.5 text-xs font-medium"
          @click="isDeleteDialogOpen = true"
        >
          <HugeiconsIcon :icon="Delete02Icon" :size="15" />
          {{ t('actions.delete', 'Delete') }}
        </Button>
      </div>
    </div>

    <!-- ── Loading Skeleton ────────────────────────────────────────────────── -->
    <div v-if="isLoading" class="space-y-6">
      <Skeleton class="h-44 w-full rounded-2xl" />
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Skeleton v-for="i in 4" :key="i" class="h-24 rounded-2xl" />
      </div>
      <Skeleton class="h-64 w-full rounded-2xl" />
    </div>

    <!-- ── Profile Content ─────────────────────────────────────────────────── -->
    <template v-else-if="user">
      <!-- Hero Dossier Banner -->
      <Card class="rounded-2xl border-border/50 bg-card/70 backdrop-blur-md overflow-hidden relative shadow-sm">
        <div class="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent pointer-events-none" />

        <div class="relative p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex items-center gap-5">
            <!-- Monogram Avatar -->
            <div class="relative shrink-0">
              <div class="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border border-primary/30 flex items-center justify-center font-bold text-xl sm:text-2xl text-primary shadow-sm tracking-wider">
                {{ getInitials(user.name) }}
              </div>
              <span
                class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center"
                :class="user.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'"
              >
                <span class="w-2 h-2 rounded-full bg-white/90" />
              </span>
            </div>

            <!-- Identity Info -->
            <div class="space-y-1.5 min-w-0">
              <div class="flex items-center gap-3 flex-wrap">
                <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                  {{ user.name || t('users.fields.user', 'User') }}
                </h2>
                <!-- Status Badge -->
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize border"
                  :class="user.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-xs shadow-emerald-500/10'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/25'"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="user.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'"
                  />
                  {{ user.status === 'active' ? t('users.statuses.active', 'Active') : t('users.statuses.inactive', 'Suspended') }}
                </span>
              </div>

              <!-- Contact & Affiliation Details -->
              <div class="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
                <button
                  type="button"
                  class="flex items-center gap-1.5 hover:text-foreground transition-colors group cursor-pointer"
                  @click="copyEmail(user.email)"
                >
                  <HugeiconsIcon :icon="Mail01Icon" :size="14" class="text-muted-foreground/70 group-hover:text-primary transition-colors shrink-0" />
                  <span class="font-mono">{{ user.email }}</span>
                  <HugeiconsIcon
                    :icon="copiedEmail ? Tick01Icon : Copy01Icon"
                    :size="13"
                    class="opacity-60 group-hover:opacity-100 transition-opacity"
                    :class="{ 'text-emerald-500': copiedEmail }"
                  />
                </button>

                <button
                  v-if="user.phone"
                  type="button"
                  class="flex items-center gap-1.5 hover:text-foreground transition-colors group cursor-pointer"
                  dir="ltr"
                  @click="copyPhone(user.phone)"
                >
                  <HugeiconsIcon :icon="SmartPhone01Icon" :size="14" class="text-muted-foreground/70 group-hover:text-primary transition-colors shrink-0" />
                  <span class="font-mono">{{ user.phone }}</span>
                  <HugeiconsIcon
                    :icon="copiedPhone ? Tick01Icon : Copy01Icon"
                    :size="13"
                    class="opacity-60 group-hover:opacity-100 transition-opacity"
                    :class="{ 'text-emerald-500': copiedPhone }"
                  />
                </button>

                <div v-if="user.hotel_name" class="flex items-center gap-1.5 text-muted-foreground">
                  <HugeiconsIcon :icon="Building04Icon" :size="14" class="text-primary/70 shrink-0" />
                  <span>{{ user.hotel_name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- 4 Quick KPI Summary Ribbon -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <!-- Tile 1: Role -->
        <Card class="rounded-2xl border-border/50 bg-card/60 backdrop-blur-md p-4 sm:p-5 relative overflow-hidden group hover:border-border transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-muted-foreground">{{ t('users.fields.role', 'Role') }}</span>
            <div class="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <HugeiconsIcon :icon="SecurityLockIcon" :size="16" />
            </div>
          </div>
          <div class="mt-3">
            <p class="text-base sm:text-lg font-bold text-foreground truncate">
              {{ user.role?.name || '—' }}
            </p>
            <span class="text-[11px] text-muted-foreground/70 capitalize">{{ t('users.access_control', 'Permissions') }}</span>
          </div>
        </Card>

        <!-- Tile 2: Property -->
        <Card class="rounded-2xl border-border/50 bg-card/60 backdrop-blur-md p-4 sm:p-5 relative overflow-hidden group hover:border-border transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-muted-foreground">{{ t('users.fields.hotel', 'Hotel') }}</span>
            <div class="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <HugeiconsIcon :icon="Building04Icon" :size="16" />
            </div>
          </div>
          <div class="mt-3">
            <p class="text-base sm:text-lg font-bold text-foreground truncate">
              {{ user.hotel_name || t('common.all_hotels', 'Platform Level') }}
            </p>
            <span class="text-[11px] text-muted-foreground/70">{{ t('users.fields.hotel', 'Affiliation') }}</span>
          </div>
        </Card>

        <!-- Tile 3: Last Active -->
        <Card class="rounded-2xl border-border/50 bg-card/60 backdrop-blur-md p-4 sm:p-5 relative overflow-hidden group hover:border-border transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-muted-foreground">{{ t('users.fields.last_login_at', 'Last Login') }}</span>
            <div class="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
              <HugeiconsIcon :icon="Clock01Icon" :size="16" />
            </div>
          </div>
          <div class="mt-3">
            <p class="text-base sm:text-lg font-bold text-foreground truncate">
              {{ formatDate(user.last_active) }}
            </p>
            <span class="text-[11px] text-muted-foreground/70">{{ t('users.last_seen', 'Last Seen') }}</span>
          </div>
        </Card>

        <!-- Tile 4: Member Since -->
        <Card class="rounded-2xl border-border/50 bg-card/60 backdrop-blur-md p-4 sm:p-5 relative overflow-hidden group hover:border-border transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-muted-foreground">{{ t('users.fields.created_at', 'Created At') }}</span>
            <div class="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <HugeiconsIcon :icon="Calendar03Icon" :size="16" />
            </div>
          </div>
          <div class="mt-3">
            <p class="text-base sm:text-lg font-bold text-foreground truncate">
              {{ formatDate(user.created_at) }}
            </p>
            <span class="text-[11px] text-muted-foreground/70">{{ t('users.member_since', 'Member Since') }}</span>
          </div>
        </Card>
      </div>

      <!-- ── Tabs Section ──────────────────────────────────────────────────── -->
      <Card class="rounded-2xl border-border/50 bg-card/70 backdrop-blur-md overflow-hidden shadow-sm">
        <Tabs default-value="overview" class="w-full">
          <div class="border-b border-border/50 px-6 pt-2 bg-muted/20">
            <TabsList class="h-12 bg-transparent p-0 gap-6 rounded-none">
              <TabsTrigger
                value="overview"
                class="relative h-12 rounded-none border-b-2 border-transparent text-xs sm:text-sm font-semibold text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent px-2"
              >
                {{ t('common.overview', 'Overview') }}
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                class="relative h-12 rounded-none border-b-2 border-transparent text-xs sm:text-sm font-semibold text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent px-2"
              >
                {{ t('users.activity_log', 'Activity Log') }}
                <span
                  v-if="user.activity_log?.length"
                  class="ms-2 px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-primary/10 text-primary border border-primary/20"
                >
                  {{ user.activity_log.length }}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <!-- Tab 1: Overview -->
          <TabsContent value="overview" class="p-6 sm:p-8 mt-0 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Account Details Card -->
              <div class="rounded-xl border border-border/40 bg-muted/20 p-5 space-y-4">
                <div class="flex items-center gap-2 text-sm font-bold text-foreground">
                  <HugeiconsIcon :icon="UserIcon" :size="16" class="text-primary" />
                  {{ t('users.account_info', 'Account Details') }}
                </div>
                <div class="divide-y divide-border/30 text-xs sm:text-sm">
                  <div class="py-2.5 flex items-center justify-between">
                    <span class="text-muted-foreground">{{ t('users.fields.name', 'Full Name') }}</span>
                    <span class="font-medium text-foreground">{{ user.name }}</span>
                  </div>
                  <div class="py-2.5 flex items-center justify-between">
                    <span class="text-muted-foreground">{{ t('users.fields.email', 'Email Address') }}</span>
                    <span class="font-mono text-foreground">{{ user.email }}</span>
                  </div>
                  <div class="py-2.5 flex items-center justify-between">
                    <span class="text-muted-foreground">{{ t('users.fields.phone', 'Phone Number') }}</span>
                    <span class="font-mono text-foreground" dir="ltr">{{ user.phone || '—' }}</span>
                  </div>
                  <div class="py-2.5 flex items-center justify-between">
                    <span class="text-muted-foreground">{{ t('users.fields.status', 'Account Status') }}</span>
                    <span class="font-semibold capitalize" :class="user.status === 'active' ? 'text-emerald-400' : 'text-rose-400'">
                      {{ user.status }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Hotel & Permissions Card -->
              <div class="rounded-xl border border-border/40 bg-muted/20 p-5 space-y-4">
                <div class="flex items-center gap-2 text-sm font-bold text-foreground">
                  <HugeiconsIcon :icon="SecurityLockIcon" :size="16" class="text-primary" />
                  {{ t('users.access_control', 'Access & Permissions') }}
                </div>
                <div class="divide-y divide-border/30 text-xs sm:text-sm">
                  <div class="py-2.5 flex items-center justify-between">
                    <span class="text-muted-foreground">{{ t('users.fields.role', 'Assigned Role') }}</span>
                    <span class="font-semibold text-primary">{{ user.role?.name || '—' }}</span>
                  </div>
                  <div class="py-2.5 flex items-center justify-between">
                    <span class="text-muted-foreground">{{ t('users.fields.hotel', 'Assigned Hotel') }}</span>
                    <span class="font-medium text-foreground">{{ user.hotel_name || t('common.all_hotels', 'Platform Level') }}</span>
                  </div>
                  <div class="py-2.5 flex items-center justify-between">
                    <span class="text-muted-foreground">{{ t('users.fields.last_login_at', 'Last Login') }}</span>
                    <span class="font-medium text-foreground">{{ formatDate(user.last_active) }}</span>
                  </div>
                  <div class="py-2.5 flex items-center justify-between">
                    <span class="text-muted-foreground">{{ t('users.fields.created_at', 'Registered On') }}</span>
                    <span class="font-medium text-foreground">{{ formatDate(user.created_at) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <!-- Tab 2: Activity Log -->
          <TabsContent value="activity" class="p-6 sm:p-8 mt-0">
            <div v-if="user.activity_log && user.activity_log.length > 0">
              <DataTable
                :data="(user.activity_log || []) as unknown as Record<string, unknown>[]"
                :columns="activityColumns"
                :loading="false"
                :total-items="user.activity_log.length"
                transparent-container
                separated-records
              >
                <template #description="{ value }">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <HugeiconsIcon :icon="Clock01Icon" :size="15" />
                    </div>
                    <span class="text-sm font-medium text-foreground">{{ value }}</span>
                  </div>
                </template>
                <template #created_at="{ value }">
                  <span class="text-xs text-muted-foreground font-mono whitespace-nowrap">{{ formatDate(value as string) }}</span>
                </template>
              </DataTable>
            </div>

            <!-- Empty Activity State -->
            <div v-else class="py-16 text-center space-y-3">
              <div class="w-14 h-14 rounded-2xl bg-muted/40 border border-border/40 mx-auto flex items-center justify-center text-muted-foreground">
                <HugeiconsIcon :icon="Clock01Icon" :size="24" />
              </div>
              <h3 class="text-base font-bold text-foreground">
                {{ t('users.no_activity', 'No activity recorded yet') }}
              </h3>
              <p class="text-xs text-muted-foreground max-w-sm mx-auto">
                {{ t('users.no_activity_desc', 'User actions, system interactions, and logins will appear here.') }}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </template>

    <!-- ── Suspend / Activate Dialog ─────────────────────────────────────── -->
    <AlertDialog :open="isStatusDialogOpen" @update:open="isStatusDialogOpen = $event">
      <AlertDialogContent class="rounded-2xl border-border/60 bg-card/95 backdrop-blur-xl max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle class="text-lg font-bold">
            {{ user?.status === 'active' ? t('users.confirm_suspend', 'Confirm Suspend') : t('users.confirm_activate', 'Confirm Activate') }}
          </AlertDialogTitle>
          <AlertDialogDescription class="text-sm text-muted-foreground mt-2">
            {{
              user?.status === 'active'
                ? t('users.confirm_suspend_message', { name: user?.name })
                : t('users.confirm_activate_message', { name: user?.name })
            }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter class="mt-6 flex items-center gap-2 justify-end">
          <AlertDialogCancel class="rounded-xl">{{ t('actions.cancel', 'Cancel') }}</AlertDialogCancel>
          <AlertDialogAction
            class="rounded-xl"
            :class="user?.status === 'active' ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-primary hover:bg-primary/90 text-primary-foreground'"
            :disabled="isTogglingStatus"
            @click="toggleStatusFn()"
          >
            {{ user?.status === 'active' ? t('users.actions.suspend', 'Suspend') : t('users.actions.activate', 'Activate') }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- ── Delete User Dialog ────────────────────────────────────────────── -->
    <AlertDialog :open="isDeleteDialogOpen" @update:open="isDeleteDialogOpen = $event">
      <AlertDialogContent class="rounded-2xl border-border/60 bg-card/95 backdrop-blur-xl max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle class="text-lg font-bold text-destructive">
            {{ t('users.confirm_delete', 'Confirm Delete') }}
          </AlertDialogTitle>
          <AlertDialogDescription class="text-sm text-muted-foreground mt-2">
            {{ t('users.confirm_delete_message', { name: user?.name }) }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter class="mt-6 flex items-center gap-2 justify-end">
          <AlertDialogCancel class="rounded-xl">{{ t('actions.cancel', 'Cancel') }}</AlertDialogCancel>
          <AlertDialogAction
            class="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            :disabled="isDeleting"
            @click="deleteUserFn()"
          >
            {{ t('actions.delete', 'Delete') }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { HotelInvitation, User } from '@/types/entities/users'
import {
  UserGroupIcon,
  CheckmarkBadge01Icon,
  MailSend01Icon,
  SecurityLockIcon,
  Building04Icon,
  Delete02Icon,
  Cancel01Icon,
  EyeIcon,
  MoreVerticalIcon,
  PlusSignIcon,
  Edit02Icon,
  Copy01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import ConfirmModal from '@/components/ui/modals/ConfirmModal.vue'
import { DataTable } from '@/components/ui/tables'
import { Button } from '@/components/uic/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/uic/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/uic/dropdown-menu'

import { useConfirm } from '@/composables/shared/useConfirm'
import { useTable } from '@/composables/shared/useTable'
import { usersService } from '@/services/usersService'

const { t } = useI18n()
const router = useRouter()
const queryClient = useQueryClient()
const { confirmState, confirm, cancel } = useConfirm()

const activeTab = ref('users')
const userFilter = ref<'all' | 'active' | 'suspended' | 'admins'>('all')
const allUsers = ref<User[]>([])
const invitations = ref<HotelInvitation[]>([])

const userColumns = [
  { key: 'name', label: 'users.fields.name', className: 'font-semibold' },
  { key: 'email', label: 'users.fields.email', className: 'font-semibold' },
  { key: 'role', label: 'users.fields.role', className: 'font-semibold' },
  { key: 'hotel_name', label: 'users.fields.hotel', className: 'font-semibold' },
  { key: 'status', label: 'users.fields.status', className: 'font-semibold text-center w-[120px]' },
]

const invitationColumns = [
  { key: 'email', label: 'users.fields.email', className: 'font-semibold' },
  { key: 'name', label: 'users.fields.name', className: 'font-semibold' },
  { key: 'role', label: 'users.fields.role', className: 'font-semibold' },
  { key: 'hotel_name', label: 'users.fields.hotel', className: 'font-semibold' },
  { key: 'status', label: 'users.fields.status', className: 'font-semibold text-center w-[120px]' },
]

const table = useTable<User>({
  resourceName: 'users',
  fetchFn: async (params: any) => {
    try {
      const result = await usersService.list({
        limit: 100,
        search: params.search,
      })
      allUsers.value = result.users
      invitations.value = result.invitations
      return { data: result.users, total: result.users.length }
    }
    catch {
      return { data: [], total: 0 }
    }
  },
})

// KPI Metrics
const computedStats = computed(() => {
  const users = allUsers.value
  const total = users.length
  const active = users.filter(u => u.status === 'active').length
  const suspended = users.filter(u => u.status === 'suspended').length
  const pending_invitations = invitations.value.length
  const hotel_admins = users.filter(u => u.role?.name?.toLowerCase().includes('admin')).length
  return { total, active, suspended, pending_invitations, hotel_admins }
})

const filteredUsers = computed(() => {
  let list = allUsers.value
  if (userFilter.value === 'active') {
    list = list.filter(u => u.status === 'active')
  }
  else if (userFilter.value === 'suspended') {
    list = list.filter(u => u.status === 'suspended')
  }
  else if (userFilter.value === 'admins') {
    list = list.filter(u => u.role?.name?.toLowerCase().includes('admin'))
  }
  return list
})

function selectFilter(filter: 'all' | 'active' | 'suspended' | 'admins' | 'invitations') {
  if (filter === 'invitations') {
    activeTab.value = 'invitations'
  }
  else {
    activeTab.value = 'users'
    userFilter.value = filter
  }
}

function getInitials(name?: string): string {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  const first = parts[0] ?? ''
  if (parts.length === 1) return first.slice(0, 2).toUpperCase()
  const last = parts[parts.length - 1] ?? ''
  const firstChar = first[0] ?? ''
  const lastChar = last[0] ?? ''
  return (firstChar + lastChar).toUpperCase() || 'U'
}

function copyEmail(email: string) {
  navigator.clipboard.writeText(email)
  toast.success('Email copied to clipboard')
}

const deleteMutation = useMutation({
  mutationFn: (id: string | number) => usersService.delete(id),
  onSuccess: (message) => {
    toast.success(message)
    queryClient.invalidateQueries({ queryKey: ['users'] })
    table.refresh()
  },
})

const toggleMutation = useMutation({
  mutationFn: (id: string | number) => usersService.toggleStatus(id),
  onSuccess: ({ message }) => {
    toast.success(message)
    queryClient.invalidateQueries({ queryKey: ['users'] })
    table.refresh()
  },
})

function handleDelete(id: string | number) {
  confirm(
    t('common.confirm_delete_title', 'Delete confirmation'),
    t('common.confirm_delete', 'Are you sure you want to delete this user?'),
    () => {
      deleteMutation.mutate(id, {
        onSettled: () => cancel(),
      })
    },
    'destructive',
  )
}

function handleToggleStatus(user: User) {
  const action = user.status === 'active' ? 'suspend' : 'activate'
  const variant = action === 'activate' ? 'default' : ('destructive' as const)
  confirm(
    t(`users.confirm_${action}`),
    t(`users.confirm_${action}_message`, { name: user.name }),
    () => {
      toggleMutation.mutate(user.id, {
        onSettled: () => cancel(),
      })
    },
    variant,
  )
}

function handleResendInvitation(invitation: HotelInvitation) {
  confirm(
    t('users.confirm_resend'),
    t('users.confirm_resend_message', { email: invitation.email }),
    async () => {
      try {
        const message = await usersService.resendInvitation(invitation.id)
        toast.success(message)
        queryClient.invalidateQueries({ queryKey: ['users'] })
      }
      catch {
        // Error handled by api interceptor
      }
      finally {
        cancel()
      }
    },
  )
}

function u(row: any): User {
  return row as User
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="h-11 w-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.12)]">
          <HugeiconsIcon :icon="UserGroupIcon" :size="22" />
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground">
            {{ t('users.title', 'Users') }}
          </h1>
          <p class="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {{ t('users.subtitle', 'Manage platform users and invitations') }}
          </p>
        </div>
      </div>

      <Button
        class="gap-2 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110"
        @click="router.push({ name: 'admin-users-create' })"
      >
        <HugeiconsIcon :icon="PlusSignIcon" :size="18" />
        {{ t('users.actions.invite', 'Invite User') }}
      </Button>
    </div>

    <!-- 4 KPI Metrics Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <!-- Total Users -->
      <div
        class="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-4 backdrop-blur-xl transition-all duration-300 hover:border-blue-500/40 hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)] cursor-pointer"
        :class="{ 'ring-2 ring-blue-500/50 border-blue-500/50': activeTab === 'users' && userFilter === 'all' }"
        @click="selectFilter('all')"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">{{ t('users.kpi_total', 'Total Users') }}</span>
          <div class="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <HugeiconsIcon :icon="UserGroupIcon" :size="16" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl font-bold tracking-tight text-foreground">{{ computedStats.total }}</span>
        </div>
        <div class="mt-1 text-[11px] text-muted-foreground">
          {{ t('users.kpi_total_desc', 'Platform accounts') }}
        </div>
      </div>

      <!-- Active Users -->
      <div
        class="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-4 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)] cursor-pointer"
        :class="{ 'ring-2 ring-emerald-500/50 border-emerald-500/50': activeTab === 'users' && userFilter === 'active' }"
        @click="selectFilter('active')"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">{{ t('users.kpi_active', 'Active Users') }}</span>
          <div class="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <HugeiconsIcon :icon="CheckmarkBadge01Icon" :size="16" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl font-bold tracking-tight text-emerald-400">{{ computedStats.active }}</span>
        </div>
        <div class="mt-1 text-[11px] text-muted-foreground">
          {{ t('users.kpi_active_desc', 'Can access system') }}
        </div>
      </div>

      <!-- Pending Invitations -->
      <div
        class="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-4 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/40 hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)] cursor-pointer"
        :class="{ 'ring-2 ring-amber-500/50 border-amber-500/50': activeTab === 'invitations' }"
        @click="selectFilter('invitations')"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">{{ t('users.kpi_invitations', 'Pending Invites') }}</span>
          <div class="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <HugeiconsIcon :icon="MailSend01Icon" :size="16" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl font-bold tracking-tight text-amber-400">{{ computedStats.pending_invitations }}</span>
        </div>
        <div class="mt-1 text-[11px] text-muted-foreground">
          {{ t('users.kpi_invitations_desc', 'Awaiting acceptance') }}
        </div>
      </div>

      <!-- Hotel Admins -->
      <div
        class="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/90 to-card/40 p-4 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/40 hover:shadow-[0_8px_30px_rgba(168,85,247,0.12)] cursor-pointer"
        :class="{ 'ring-2 ring-purple-500/50 border-purple-500/50': activeTab === 'users' && userFilter === 'admins' }"
        @click="selectFilter('admins')"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">{{ t('users.kpi_admins', 'Hotel Admins') }}</span>
          <div class="h-8 w-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center transition-transform group-hover:scale-110">
            <HugeiconsIcon :icon="SecurityLockIcon" :size="16" />
          </div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-2xl font-bold tracking-tight text-foreground">{{ computedStats.hotel_admins }}</span>
        </div>
        <div class="mt-1 text-[11px] text-muted-foreground">
          {{ t('users.kpi_admins_desc', 'Property managers') }}
        </div>
      </div>
    </div>

    <!-- Tabs Navigation & Quick Filters -->
    <Tabs v-model="activeTab" class="w-full">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <TabsList class="p-1 rounded-xl bg-muted/40 border border-border/50 w-fit backdrop-blur-md">
          <TabsTrigger
            value="users"
            class="gap-2 text-xs px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            <HugeiconsIcon :icon="UserGroupIcon" :size="15" />
            <span>{{ t('users.tabs.users', 'Users') }}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/80 text-muted-foreground">{{ computedStats.total }}</span>
          </TabsTrigger>

          <TabsTrigger
            value="invitations"
            class="gap-2 text-xs px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
          >
            <HugeiconsIcon :icon="MailSend01Icon" :size="15" />
            <span>{{ t('users.tabs.invitations', 'Pending Invitations') }}</span>
            <span
              v-if="computedStats.pending_invitations > 0"
              class="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-semibold"
            >
              {{ computedStats.pending_invitations }}
            </span>
          </TabsTrigger>
        </TabsList>

        <!-- Quick Filter Pills for Users Tab -->
        <div
          v-if="activeTab === 'users'"
          class="flex items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/50 w-fit backdrop-blur-md overflow-x-auto max-w-full"
        >
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 select-none whitespace-nowrap cursor-pointer"
            :class="userFilter === 'all'
              ? 'bg-background text-foreground shadow-sm border border-border/50 font-semibold'
              : 'text-muted-foreground hover:text-foreground'"
            @click="userFilter = 'all'"
          >
            <span>{{ t('users.filters.all', 'All Users') }}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-muted/80 text-muted-foreground">{{ computedStats.total }}</span>
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 select-none whitespace-nowrap cursor-pointer"
            :class="userFilter === 'active'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
              : 'text-muted-foreground hover:text-emerald-400'"
            @click="userFilter = 'active'"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>{{ t('users.filters.active', 'Active') }}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300">{{ computedStats.active }}</span>
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 select-none whitespace-nowrap cursor-pointer"
            :class="userFilter === 'suspended'
              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold'
              : 'text-muted-foreground hover:text-rose-400'"
            @click="userFilter = 'suspended'"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-rose-400" />
            <span>{{ t('users.filters.suspended', 'Suspended') }}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300">{{ computedStats.suspended }}</span>
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 select-none whitespace-nowrap cursor-pointer"
            :class="userFilter === 'admins'
              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30 font-semibold'
              : 'text-muted-foreground hover:text-purple-400'"
            @click="userFilter = 'admins'"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-purple-400" />
            <span>{{ t('users.filters.hotel_admins', 'Hotel Admins') }}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300">{{ computedStats.hotel_admins }}</span>
          </button>
        </div>
      </div>

      <!-- Users Tab Content -->
      <TabsContent value="users" class="mt-4 focus-visible:outline-none focus-visible:ring-0">
        <DataTable
          :data="filteredUsers as any"
          :columns="userColumns"
          :loading="table.loading.value"
          searchable
          modern-search
          transparent-container
          separated-records
        >
          <!-- Name Column -->
          <template #name="{ row }">
            <div
              class="flex items-center gap-3 cursor-pointer group/user py-1"
              @click="router.push({ name: 'admin-users-show', params: { id: String(u(row).id) } })"
            >
              <div class="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 transition-transform group-hover/user:scale-105 shadow-sm">
                {{ getInitials(u(row).name) }}
              </div>
              <div class="min-w-0">
                <div class="font-semibold text-sm text-foreground group-hover/user:text-primary transition-colors truncate">
                  {{ u(row).name }}
                </div>
                <div v-if="u(row).phone" dir="ltr" class="text-xs text-muted-foreground font-mono mt-0.5">
                  {{ u(row).phone }}
                </div>
              </div>
            </div>
          </template>

          <!-- Email Column -->
          <template #email="{ row }">
            <div class="flex items-center gap-2 group/email py-1">
              <span class="text-sm text-muted-foreground group-hover/email:text-foreground transition-colors font-mono truncate max-w-[220px]">
                {{ u(row).email }}
              </span>
              <button
                type="button"
                class="opacity-0 group-hover/email:opacity-100 text-muted-foreground hover:text-foreground transition-opacity p-0.5 rounded"
                title="Copy Email"
                @click.stop="copyEmail(u(row).email)"
              >
                <HugeiconsIcon :icon="Copy01Icon" :size="12" />
              </button>
            </div>
          </template>

          <!-- Role Column -->
          <template #role="{ row }">
            <div class="py-1">
              <span
                v-if="u(row).role"
                class="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20"
              >
                {{ u(row).role?.name }}
              </span>
              <span v-else class="text-xs text-muted-foreground/60">—</span>
            </div>
          </template>

          <!-- Hotel Column -->
          <template #hotel_name="{ row }">
            <div class="py-1">
              <div v-if="u(row).hotel_name" class="text-xs text-foreground flex items-center gap-1.5 font-medium">
                <HugeiconsIcon :icon="Building04Icon" :size="13" class="text-muted-foreground shrink-0" />
                <span class="truncate max-w-[180px]">{{ u(row).hotel_name }}</span>
              </div>
              <span v-else class="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-muted/60 text-muted-foreground border border-border/40">
                Global Platform
              </span>
            </div>
          </template>

          <!-- Status Column -->
          <template #status="{ row }">
            <div class="w-full flex justify-center py-1">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider border select-none transition-colors"
                :class="u(row).status === 'active'
                  ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
                  : 'border-rose-500/25 bg-rose-500/10 text-rose-400'"
              >
                <span
                  class="h-1.5 w-1.5 rounded-full me-1.5 shrink-0"
                  :class="u(row).status === 'active' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]' : 'bg-rose-400'"
                />
                {{ u(row).status }}
              </span>
            </div>
          </template>

          <!-- Actions Column -->
          <template #actions="{ row }">
            <div class="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button
                    size="icon"
                    variant="ghost"
                    class="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  >
                    <HugeiconsIcon :icon="MoreVerticalIcon" :size="16" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-44 rounded-xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-xl">
                  <DropdownMenuItem
                    class="cursor-pointer gap-2 text-xs py-2"
                    @click="router.push({ name: 'admin-users-show', params: { id: String(u(row).id) } })"
                  >
                    <HugeiconsIcon :icon="EyeIcon" :size="14" class="text-muted-foreground" />
                    {{ t('actions.view', 'View Details') }}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    class="cursor-pointer gap-2 text-xs py-2"
                    @click="router.push({ name: 'admin-users-edit', params: { id: String(u(row).id) } })"
                  >
                    <HugeiconsIcon :icon="Edit02Icon" :size="14" class="text-muted-foreground" />
                    {{ t('users.actions.update_role', 'Change Role') }}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    class="cursor-pointer gap-2 text-xs py-2"
                    @click="handleToggleStatus(u(row))"
                  >
                    <HugeiconsIcon :icon="Cancel01Icon" :size="14" class="text-muted-foreground" />
                    {{ u(row).status === 'active' ? t('users.actions.suspend', 'Suspend Account') : t('users.actions.activate', 'Activate Account') }}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    class="cursor-pointer gap-2 text-xs py-2 text-rose-400 focus:text-rose-300 focus:bg-rose-500/10"
                    @click="handleDelete(u(row).id)"
                  >
                    <HugeiconsIcon :icon="Delete02Icon" :size="14" />
                    {{ t('actions.delete', 'Delete') }}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </template>

          <!-- Empty State -->
          <template #empty>
            <div class="flex flex-col items-center justify-center gap-3 py-14">
              <div class="h-14 w-14 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-center text-muted-foreground/60 shadow-inner">
                <HugeiconsIcon :icon="UserGroupIcon" :size="28" />
              </div>
              <div class="text-center">
                <p class="text-sm font-semibold text-foreground">{{ t('users.no_users', 'No users found') }}</p>
                <p class="text-xs text-muted-foreground mt-0.5">{{ t('users.no_users_desc', 'Invite team members to get started.') }}</p>
              </div>
            </div>
          </template>
        </DataTable>
      </TabsContent>

      <!-- Pending Invitations Tab Content -->
      <TabsContent value="invitations" class="mt-4 focus-visible:outline-none focus-visible:ring-0">
        <DataTable
          :data="invitations as any[]"
          :columns="invitationColumns"
          searchable
          modern-search
          transparent-container
          separated-records
        >
          <!-- Email Column -->
          <template #email="{ row }">
            <div class="flex items-center gap-2 group/invEmail py-1">
              <span class="font-mono text-sm font-medium text-foreground">
                {{ (row as any).email }}
              </span>
              <button
                type="button"
                class="opacity-0 group-hover/invEmail:opacity-100 text-muted-foreground hover:text-foreground transition-opacity p-0.5 rounded"
                title="Copy Email"
                @click.stop="copyEmail((row as any).email)"
              >
                <HugeiconsIcon :icon="Copy01Icon" :size="12" />
              </button>
            </div>
          </template>

          <!-- Name Column -->
          <template #name="{ row }">
            <div class="py-1 text-sm text-muted-foreground">
              {{ (row as any).name || '—' }}
            </div>
          </template>

          <!-- Role Column -->
          <template #role="{ row }">
            <div class="py-1">
              <span
                v-if="(row as any).role"
                class="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20"
              >
                {{ (row as any).role?.name }}
              </span>
              <span v-else class="text-xs text-muted-foreground/60">—</span>
            </div>
          </template>

          <!-- Hotel Column -->
          <template #hotel_name="{ row }">
            <div class="py-1">
              <div v-if="(row as any).hotel_name" class="text-xs text-foreground flex items-center gap-1.5 font-medium">
                <HugeiconsIcon :icon="Building04Icon" :size="13" class="text-muted-foreground shrink-0" />
                <span>{{ (row as any).hotel_name }}</span>
              </div>
              <span v-else class="text-xs text-muted-foreground/60">—</span>
            </div>
          </template>

          <!-- Status Column -->
          <template #status>
            <div class="w-full flex justify-center py-1">
              <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider border border-amber-500/25 bg-amber-500/10 text-amber-400 select-none">
                <span class="h-1.5 w-1.5 rounded-full me-1.5 shrink-0 bg-amber-400 animate-pulse" />
                {{ t('users.status.invited', 'Invited') }}
              </span>
            </div>
          </template>

          <!-- Actions Column -->
          <template #actions="{ row }">
            <div class="flex items-center justify-center">
              <Button
                variant="outline"
                size="sm"
                class="gap-1.5 text-xs rounded-xl border-border/60 hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                @click="handleResendInvitation(row as any)"
              >
                <HugeiconsIcon :icon="MailSend01Icon" :size="14" />
                {{ t('users.actions.resend', 'Resend') }}
              </Button>
            </div>
          </template>

          <!-- Empty State -->
          <template #empty>
            <div class="flex flex-col items-center justify-center gap-3 py-14">
              <div class="h-14 w-14 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-center text-muted-foreground/60 shadow-inner">
                <HugeiconsIcon :icon="MailSend01Icon" :size="28" />
              </div>
              <div class="text-center">
                <p class="text-sm font-semibold text-foreground">{{ t('users.no_pending_invitations', 'No pending invitations') }}</p>
                <p class="text-xs text-muted-foreground mt-0.5">All invitations have been claimed or none are pending.</p>
              </div>
            </div>
          </template>
        </DataTable>
      </TabsContent>
    </Tabs>

    <ConfirmModal
      :show="confirmState.show"
      :title="confirmState.title"
      :message="confirmState.message"
      :variant="confirmState.variant"
      @confirm="confirmState.callback?.()"
      @cancel="cancel"
    />
  </div>
</template>

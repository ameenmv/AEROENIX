<script setup lang="ts">
import type { User } from '@/types/entities/users'
import {
  Building04Icon,
  Calendar03Icon,
  Clock01Icon,
  Mail01Icon,
  SecurityLockIcon,
  SmartPhone01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useDetails } from '@/composables/useDetails'
import { usersService } from '@/services/usersService'
import { Button } from '@/components/uic/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/uic/tabs'
import { TableCell, TableHead, TableRow } from '@/components/uic/table'
import { DataTable } from '@/components/ui/tables'

const { t } = useI18n()
const router = useRouter()

const { item, loading } = useDetails<User>({
  resourceName: 'users',
  getFn: (id: string | number) => usersService.get(id),
  autoLoadId: true,
})

interface DetailField {
  label: string
  value: string | number | null | undefined
  icon: any
  dir?: string
}

function getFields(user: User): DetailField[] {
  return [
    { label: t('users.fields.email', 'Email'), value: user.email, icon: Mail01Icon },
    { label: t('users.fields.phone', 'Phone'), value: user.phone, icon: SmartPhone01Icon, dir: 'ltr' },
    { label: t('users.fields.role', 'Role'), value: user.role?.name, icon: SecurityLockIcon },
    { label: t('users.fields.hotel', 'Hotel'), value: user.hotel_name, icon: Building04Icon },
    { label: t('users.fields.last_login_at', 'Last Login'), value: user.last_active ? new Date(user.last_active).toLocaleString() : null, icon: Clock01Icon },
    { label: t('users.fields.created_at', 'Created At'), value: user.created_at ? new Date(user.created_at).toLocaleString() : null, icon: Calendar03Icon },
  ]
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">
          {{ t('users.title', 'User') }} {{ t('common.details', 'Details') }}
        </h1>
        <p class="mt-1 text-sm text-muted-foreground">
          {{ t('users.subtitle', 'Manage platform users and invitations') }}
        </p>
      </div>
      <Button variant="ghost" @click="router.push({ name: 'admin-users' })">
        {{ t('actions.back', 'Back') }}
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-20 flex flex-col items-center gap-3">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <span class="text-sm text-muted-foreground">{{ t('common.loading', 'Loading...') }}</span>
    </div>

    <template v-else-if="item">
      <div class="rounded-xl border border-border bg-card overflow-hidden">
        <!-- Hero Header -->
        <div class="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent p-6 border-b border-border/50">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                <HugeiconsIcon :icon="UserIcon" :size="28" />
              </div>
              <div>
                <h2 class="text-xl font-bold tracking-tight">{{ item.name }}</h2>
                <p class="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <HugeiconsIcon :icon="Mail01Icon" :size="14" class="shrink-0" />
                  {{ item.email }}
                </p>
              </div>
            </div>
            <span
              class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize"
              :class="item.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-red-500/10 text-red-400'"
            >
              <span class="h-1.5 w-1.5 rounded-full" :class="item.status === 'active' ? 'bg-emerald-500' : 'bg-red-400'" />
              {{ item.status }}
            </span>
          </div>
        </div>

        <!-- Tabs -->
        <Tabs default-value="overview" class="w-full">
          <div class="border-b border-border/50">
            <TabsList class="h-12 w-full bg-transparent p-0 gap-0 rounded-none">
              <TabsTrigger
                value="overview"
                class="relative flex-1 h-12 rounded-none border-b-2 border-transparent text-sm font-medium text-muted-foreground transition-colors data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent"
              >
                {{ t('common.overview', 'Overview') }}
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                class="relative flex-1 h-12 rounded-none border-b-2 border-transparent text-sm font-medium text-muted-foreground transition-colors data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent"
              >
                {{ t('users.activity_log', 'Activity Log') }}
              </TabsTrigger>
            </TabsList>
          </div>

          <!-- Overview Tab -->
          <TabsContent value="overview" class="p-6 mt-0">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div
                v-for="field in getFields(item)"
                :key="field.label"
                class="flex items-center gap-3"
              >
                <div class="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                  <HugeiconsIcon :icon="field.icon" :size="18" />
                </div>
                <div class="min-w-0">
                  <span class="text-[11px] uppercase tracking-widest text-muted-foreground/70 font-medium">
                    {{ field.label }}
                  </span>
                  <p class="font-semibold text-sm mt-0.5 truncate" :dir="field.dir">{{ field.value || '—' }}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <!-- Activity Log Tab -->
          <TabsContent value="activity" class="p-6 mt-0">
            <DataTable
              :data="(item.activity_log || []) as any"
              :loading="false"
              :total-items="(item.activity_log || []).length"
            >
              <template #header>
                <TableRow class="border-none hover:bg-transparent bg-muted/30">
                  <TableHead class="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">
                    {{ t('common.description', 'Description') }}
                  </TableHead>
                  <TableHead class="px-4 py-3 text-right text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">
                    {{ t('common.timestamp', 'Timestamp') }}
                  </TableHead>
                </TableRow>
              </template>
              <template #row="{ row }">
                <TableRow class="bg-card border-none hover:bg-muted/50 transition-colors">
                  <TableCell class="px-4 py-4 text-left text-sm first:rounded-l-lg last:rounded-r-lg">
                    {{ (row as any).description }}
                  </TableCell>
                  <TableCell class="px-4 py-4 text-right text-xs text-muted-foreground whitespace-nowrap first:rounded-l-lg last:rounded-r-lg">
                    {{ new Date((row as any).created_at).toLocaleString() }}
                  </TableCell>
                </TableRow>
              </template>
            </DataTable>
          </TabsContent>
        </Tabs>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Admin } from '@/types/entities/admin'
import {
  Calendar03Icon,
  Edit02Icon,
  Mail01Icon,
  SecurityLockIcon,
  SmartPhone01Icon,
  UserAccountIcon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useDetails } from '@/composables/useDetails'
import { adminsService } from '@/services/adminsService'
import { Button } from '@/components/uic/button'

const { t } = useI18n()
const router = useRouter()

const { item, loading } = useDetails<Admin>({
  resourceName: 'admins',
  getFn: (id: string | number) => adminsService.get(id, { scope: 'full', include: 'roles' }),
  autoLoadId: true,
})

interface DetailField {
  label: string
  value: string | number | null | undefined
  icon: any
  dir?: string
}

function getFields(admin: Admin): DetailField[] {
  return [
    { label: t('admins.fields.phone', 'Phone'), value: admin.phone, icon: SmartPhone01Icon, dir: 'ltr' },
    { label: t('admins.fields.username', 'Username'), value: admin.username, icon: UserAccountIcon },
    { label: t('admins.fields.created_at', 'Created At'), value: new Date(admin.created_at).toLocaleString(), icon: Calendar03Icon },
    { label: t('admins.fields.updated_at', 'Updated At'), value: new Date(admin.updated_at).toLocaleString(), icon: Calendar03Icon },
  ]
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">
          {{ t('admins.title', 'Admin') }} {{ t('common.details', 'Details') }}
        </h1>
        <p class="mt-1 text-sm text-muted-foreground">
          {{ t('admins.subtitle', 'Manage system administration users') }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button
          v-if="item?.can_update"
          variant="outline"
          class="gap-2"
          @click="router.push({ name: 'admin-admins-edit', params: { id: String(item.id) } })"
        >
          <HugeiconsIcon :icon="Edit02Icon" :size="16" />
          {{ t('actions.edit', 'Edit') }}
        </Button>
        <Button variant="ghost" @click="router.push({ name: 'admin-admins' })">
          {{ t('actions.back', 'Back') }}
        </Button>
      </div>
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
            <div class="flex items-center gap-2">
              <span
                class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                :class="
                  item.status?.color === 'green'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : item.status?.color === 'red'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-gray-500/10 text-gray-400'
                "
              >
                <span
                  class="h-1.5 w-1.5 rounded-full"
                  :class="
                    item.status?.color === 'green'
                      ? 'bg-emerald-500'
                      : item.status?.color === 'red'
                        ? 'bg-red-400'
                        : 'bg-gray-400'
                  "
                />
                {{ item.status?.badge || item.status_label }}
              </span>
              <span
                v-if="item.email_verified_at"
                class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-500"
              >
                ✓ {{ t('admins.verified', 'Verified') }}
              </span>
            </div>
          </div>
        </div>

        <!-- Fields -->
        <div class="p-6 space-y-6">
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

          <!-- Roles -->
          <div v-if="item.roles && item.roles.length > 0" class="pt-2 border-t border-border/50">
            <h3 class="text-[11px] uppercase tracking-widest text-muted-foreground/70 font-medium mb-3 flex items-center gap-2">
              <HugeiconsIcon :icon="SecurityLockIcon" :size="14" />
              {{ t('admins.fields.roles', 'Roles') }}
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="role in item.roles"
                :key="role.id"
                class="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20"
              >
                {{ role.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/types/entities/users'
import { computed, watch } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft01Icon,
  Building04Icon,
  InformationCircleIcon,
  Mail01Icon,
  SmartPhone01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

import { useForm } from '@/composables/shared/useForm'
import { updateUserRoleSchema } from '@/modules/users/schema'
import { usersService } from '@/services/usersService'
import { rolesService } from '@/services/rolesService'
import { Button } from '@/components/uic/button'
import { Card } from '@/components/uic/card'
import { Skeleton } from '@/components/uic/skeleton'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const queryClient = useQueryClient()
const id = route.params.id as string

const { data: item, isLoading } = useQuery<User>({
  queryKey: ['users', id],
  queryFn: () => usersService.get(id),
  retry: false,
  refetchOnWindowFocus: false,
})

// Fetch roles for the select dropdown
const { data: matrixData, isLoading: isLoadingRoles } = useQuery({
  queryKey: ['roles-matrix'],
  queryFn: () => rolesService.getMatrix(),
})

const roleOptions = computed(() => {
  const roles = matrixData.value?.roles || []
  return roles
    .filter(r => r.scope === 'hotel')
    .map(r => ({
      value: r.id,
      label: r.name,
    }))
})

const form = useForm({
  resourceName: 'users',
  action: 'update',
  schema: updateUserRoleSchema(t),
  mutationFn: data => usersService.updateRole(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
    router.push({ name: 'admin-users' })
  },
})

const [roleId, roleIdProps] = form.defineField('role_id')

watch(
  item,
  (newItem) => {
    if (newItem?.role) {
      form.setValues({ role_id: newItem.role.id })
    }
  },
  { immediate: true },
)

function getInitials(name?: string): string {
  if (!name) return 'U'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => (p?.[0] ? p[0].toUpperCase() : ''))
    .join('')
}
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
          <h1 class="text-2xl font-bold tracking-tight text-foreground">
            {{ t('users.edit_role_title', 'Update User Role') }}
          </h1>
          <p class="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {{ t('users.edit_role_desc', 'Change access permissions and hotel scope for this account') }}
          </p>
        </div>
      </div>
    </div>

    <!-- ── Loading Skeleton ────────────────────────────────────────────────── -->
    <div v-if="isLoading" class="space-y-6">
      <Skeleton class="h-32 w-full rounded-2xl" />
      <Skeleton class="h-64 w-full rounded-2xl" />
    </div>

    <!-- ── Main Edit Layout ────────────────────────────────────────────────── -->
    <template v-else-if="item">
      <!-- User Profile Dossier Ribbon -->
      <Card class="rounded-2xl border-border/50 bg-card/70 backdrop-blur-md p-6 sm:p-7 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border border-primary/30 flex items-center justify-center font-bold text-lg text-primary shadow-xs">
              {{ getInitials(item.name) }}
            </div>
            <div class="space-y-1 min-w-0">
              <div class="flex items-center gap-2.5">
                <h2 class="text-lg font-bold text-foreground truncate">{{ item.name }}</h2>
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border"
                  :class="item.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/25'"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="item.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'" />
                  {{ item.status }}
                </span>
              </div>
              <div class="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span class="flex items-center gap-1 font-mono">
                  <HugeiconsIcon :icon="Mail01Icon" :size="13" class="text-muted-foreground/70" />
                  {{ item.email }}
                </span>
                <span v-if="item.phone" class="flex items-center gap-1 font-mono" dir="ltr">
                  <HugeiconsIcon :icon="SmartPhone01Icon" :size="13" class="text-muted-foreground/70" />
                  {{ item.phone }}
                </span>
                <span v-if="item.hotel_name" class="flex items-center gap-1 text-primary">
                  <HugeiconsIcon :icon="Building04Icon" :size="13" />
                  {{ item.hotel_name }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              class="rounded-xl text-xs"
              @click="router.push({ name: 'admin-users-show', params: { id } })"
            >
              {{ t('users.user_profile', 'View Dossier') }}
            </Button>
          </div>
        </div>
      </Card>

      <!-- Role Form -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div class="lg:col-span-8">
          <Card class="rounded-2xl border-border/50 bg-card/70 backdrop-blur-md p-6 sm:p-8 shadow-sm">
            <FormContainer
              :form="form"
              :is-edit="true"
              @cancel="router.push({ name: 'admin-users' })"
            >
              <!-- Role Select Field -->
              <div class="md:col-span-2">
                <SelectField
                  name="role_id"
                  v-model="roleId"
                  v-bind="roleIdProps"
                  :options="roleOptions"
                  :label="t('users.fields.role', 'Select Role')"
                  :placeholder="isLoadingRoles ? t('common.loading') : t('users.placeholders.role')"
                  :disabled="isLoadingRoles"
                  :error="form.displayErrors.value.role_id"
                />
              </div>
            </FormContainer>
          </Card>
        </div>

        <div class="lg:col-span-4 space-y-4">
          <Card class="rounded-2xl border-border/50 bg-card/40 backdrop-blur-md p-6 space-y-4 shadow-sm">
            <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <HugeiconsIcon :icon="InformationCircleIcon" :size="16" class="text-sky-400" />
              {{ t('users.access_control', 'Access & Permissions') }}
            </div>
            <p class="text-xs text-muted-foreground leading-relaxed">
              {{ t('users.edit_role_desc', 'Changing the role will immediately adjust this user permissions across hotel modules and API access.') }}
            </p>
            <div class="pt-3 border-t border-border/40 space-y-2 text-xs">
              <div class="flex items-center justify-between text-muted-foreground">
                <span>{{ t('users.fields.role', 'Current Role') }}:</span>
                <span class="font-semibold text-foreground">{{ item.role?.name || '—' }}</span>
              </div>
              <div class="flex items-center justify-between text-muted-foreground">
                <span>{{ t('users.fields.hotel', 'Hotel Scope') }}:</span>
                <span class="font-semibold text-foreground">{{ item.hotel_name || t('common.all_hotels', 'Platform Level') }}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </template>
  </div>
</template>

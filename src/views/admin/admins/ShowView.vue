<script setup lang="ts">
import type { Admin } from '@/types/entities/admin'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useDetails } from '@/composables/useDetails'
import { adminsService } from '@/services/adminsService'

const { t } = useI18n()
const router = useRouter()

const { item, loading } = useDetails<Admin>({
  resourceName: 'admins',
  getFn: (id: string | number) => adminsService.get(id, { scope: 'full', include: 'roles' }),
  autoLoadId: true,
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">
        {{ t('admins.title', 'Admin') }} {{ t('common.details', 'Details') }}
      </h1>
      <Button variant="ghost" @click="router.push({ name: 'admin-admins' })">
        {{ t('actions.back', 'Back') }}
      </Button>
    </div>

    <div class="rounded-xl border border-border bg-card">
      <div v-if="loading" class="py-12 text-center text-muted-foreground">
        {{ t('common.loading', 'Loading...') }}
      </div>
      <div v-else-if="item" class="p-6 space-y-8">
        <!-- Admin Header -->
        <div>
          <h2 class="text-xl font-semibold">
            {{ item.name }}
          </h2>
          <p class="text-sm text-muted-foreground">
            {{ item.email }}
          </p>
          <div class="mt-3 flex items-center gap-2">
            <span
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
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
              class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-500"
            >
              ✓ {{ t('admins.verified', 'Verified') }}
            </span>
          </div>
        </div>

        <!-- Detail Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span class="text-sm text-muted-foreground">{{
              t('admins.fields.phone', 'Phone')
            }}</span>
            <p class="font-medium mt-1" dir="ltr">
              {{ item.phone || '—' }}
            </p>
          </div>
          <div>
            <span class="text-sm text-muted-foreground">{{
              t('admins.fields.username', 'Username')
            }}</span>
            <p class="font-medium mt-1">
              {{ item.username || '—' }}
            </p>
          </div>
          <div>
            <span class="text-sm text-muted-foreground">{{
              t('admins.fields.created_at', 'Created At')
            }}</span>
            <p class="font-medium mt-1">
              {{ new Date(item.created_at).toLocaleString() }}
            </p>
          </div>
          <div>
            <span class="text-sm text-muted-foreground">{{
              t('admins.fields.updated_at', 'Updated At')
            }}</span>
            <p class="font-medium mt-1">
              {{ new Date(item.updated_at).toLocaleString() }}
            </p>
          </div>
        </div>

        <!-- Roles -->
        <div v-if="item.roles && item.roles.length > 0">
          <h3 class="text-lg font-semibold mb-3">
            {{ t('admins.fields.roles', 'Roles') }}
          </h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="role in item.roles"
              :key="role.id"
              class="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium bg-purple-500/10 text-purple-500"
            >
              {{ role.display_name?.en || role.name }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 pt-4 border-t border-border">
          <Button
            v-if="item.can_update"
            @click="router.push({ name: 'admin-admins-edit', params: { id: String(item.id) } })"
          >
            {{ t('actions.edit', 'Edit') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

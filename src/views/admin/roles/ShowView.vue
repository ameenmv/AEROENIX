<script setup lang="ts">
import type { Role } from '@/types/entities/role'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useDetails } from '@/composables'
import { rolesService } from '@/services/rolesService'

const { t } = useI18n()
const router = useRouter()

const { item, loading } = useDetails<Role>({
  resourceName: 'roles',
  getFn: id => rolesService.get(id, { scope: 'full', include: 'permissions' }),
  autoLoadId: true,
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">
        {{ t('roles.title', 'Role') }} {{ t('common.details', 'Details') }}
      </h1>
      <Button variant="ghost" @click="router.push({ name: 'admin-roles' })">
        {{ t('actions.back', 'Back') }}
      </Button>
    </div>

    <div class="rounded-xl border border-border bg-card">
      <div v-if="loading" class="py-12 text-center text-muted-foreground">
        {{ t('common.loading', 'Loading...') }}
      </div>
      <div v-else-if="item" class="p-6 space-y-8">
        <!-- Role Header -->
        <div>
          <h2 class="text-xl font-semibold">
            {{ item.display_name?.en || item.name }}
          </h2>
          <p v-if="item.display_name?.ar" class="text-sm text-muted-foreground mt-1" dir="rtl">
            {{ item.display_name.ar }}
          </p>
          <div class="mt-3 flex items-center gap-2">
            <span
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="item.status?.color === 'green' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-400'"
            >
              <span
                class="h-1.5 w-1.5 rounded-full"
                :class="item.status?.color === 'green' ? 'bg-emerald-500' : 'bg-gray-400'"
              />
              {{ item.status?.badge || item.status_label }}
            </span>
            <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-500">
              {{ item.guard_name }}
            </span>
          </div>
        </div>

        <!-- Detail Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span class="text-sm text-muted-foreground">{{ t('roles.fields.name', 'System Name') }}</span>
            <p class="font-medium mt-1">
              {{ item.name }}
            </p>
          </div>
          <div>
            <span class="text-sm text-muted-foreground">{{ t('roles.fields.created_at', 'Created At') }}</span>
            <p class="font-medium mt-1">
              {{ new Date(item.created_at).toLocaleString() }}
            </p>
          </div>
        </div>

        <!-- Permissions -->
        <div v-if="item.permissions && item.permissions.length > 0">
          <h3 class="text-lg font-semibold mb-4">
            {{ t('roles.fields.permissions', 'Permissions') }} ({{ item.permissions.length }})
          </h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="perm in item.permissions"
              :key="perm.id"
              class="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary"
            >
              {{ perm.label?.en || perm.name }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 pt-4 border-t border-border">
          <Button
            v-if="item.can_update"
            @click="router.push({ name: 'admin-roles-edit', params: { id: String(item.id) } })"
          >
            {{ t('actions.edit', 'Edit') }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

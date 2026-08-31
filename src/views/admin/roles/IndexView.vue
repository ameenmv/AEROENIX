<script setup lang="ts">
import type { Role } from '@/types/entities/role'
import { PlusSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useRoles } from '@/composables'
import { Button } from '@/components/uic/button'
import { Skeleton } from '@/components/uic/skeleton'

const { t } = useI18n()
const router = useRouter()

const { roles, modules, isLoading } = useRoles()

/**
 * Check if a role has a specific permission by ID.
 */
function hasPermission(role: Role, permissionId: number): boolean {
  return role.permissions.includes(permissionId)
}
</script>

<template>
  <ModularView>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">
            {{ t('roles.title') }}
          </h1>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ t('roles.subtitle') }}
          </p>
        </div>
        <Button @click="router.push({ name: 'admin-roles-create' })">
          <HugeiconsIcon :icon="PlusSignIcon" :size="20" class="mr-2" />
          {{ t('roles.actions.create') }}
        </Button>
      </div>

      <!-- Loading State Skeleton -->
      <div v-if="isLoading" class="overflow-x-auto rounded-lg border border-border/50">
        <table class="w-full text-sm border-separate border-spacing-y-0">
          <thead>
            <tr>
              <th class="sticky left-0 z-10 bg-muted/30 px-4 py-3.5 text-left w-64">
                <Skeleton class="h-4 w-28" />
              </th>
              <th v-for="i in 4" :key="`sk-th-${i}`" class="min-w-[140px] px-4 py-3.5 bg-muted/30">
                <div class="flex flex-col items-center gap-2">
                  <Skeleton class="h-4 w-20" />
                  <Skeleton class="h-4 w-14 rounded-full" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="section in 3" :key="`sk-sec-${section}`">
              <tr>
                <td :colspan="5" class="sticky left-0 px-4 py-3 bg-muted/15">
                  <Skeleton class="h-3.5 w-40" />
                </td>
              </tr>
              <tr v-for="row in 3" :key="`sk-row-${row}`">
                <td class="sticky left-0 z-10 bg-background px-4 py-3.5">
                  <Skeleton class="h-4 w-44" />
                </td>
                <td v-for="col in 4" :key="`sk-col-${col}`" class="px-4 py-3.5 text-center">
                  <Skeleton class="h-5 w-5 rounded-full mx-auto" />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Roles Matrix -->
      <div v-else-if="roles.length > 0" class="overflow-x-auto rounded-lg border">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b bg-muted/50">
              <th class="sticky left-0 z-10 bg-muted/50 px-4 py-3 text-left font-medium">
                {{ t('roles.fields.permission') }}
              </th>
              <th
                v-for="role in roles"
                :key="role.id"
                class="min-w-[120px] px-4 py-3 text-center font-medium"
              >
                <div class="flex flex-col items-center gap-1">
                  <span>{{ role.name }}</span>
                  <span
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize"
                    :class="role.scope === 'platform'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'"
                  >
                    {{ role.scope }}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="mod in modules" :key="mod.name">
              <!-- Module Header -->
              <tr class="bg-muted/30">
                <td
                  :colspan="roles.length + 1"
                  class="sticky left-0 px-4 py-2 font-semibold text-xs uppercase tracking-wider text-muted-foreground"
                >
                  {{ mod.name }}
                </td>
              </tr>
              <!-- Permission Rows -->
              <tr
                v-for="perm in mod.permissions"
                :key="perm.id"
                class="border-b hover:bg-muted/20 transition-colors"
              >
                <td class="sticky left-0 z-10 bg-background px-4 py-2.5 text-sm">
                  {{ perm.action }}
                </td>
                <td
                  v-for="role in roles"
                  :key="`${role.id}-${perm.id}`"
                  class="px-4 py-2.5 text-center"
                >
                  <span
                    class="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs"
                    :class="hasPermission(role, perm.id)
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'"
                  >
                    {{ hasPermission(role, perm.id) ? '✓' : '—' }}
                  </span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>{{ t('roles.empty') }}</p>
      </div>
    </div>
  </ModularView>
</template>

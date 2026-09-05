<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useRoles } from '@/composables'
import type { Role } from '@/types/entities/role'
import { Button } from '@/components/uic/button'
import { Skeleton } from '@/components/uic/skeleton'
import { Badge } from '@/components/uic/badge'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { roles, modules, isLoading } = useRoles()

const roleId = Number(route.params.id)
const role = computed<Role | undefined>(() => roles.value.find(r => r.id === roleId))

function hasPermission(permissionId: number): boolean {
  if (!role.value) return false
  return role.value.permissions.includes(permissionId)
}
</script>

<template>
  <ModularView>
    <div class="space-y-6">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="router.push({ name: 'admin-roles' })">
          <HugeiconsIcon :icon="ArrowLeft01Icon" :size="20" />
        </Button>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold tracking-tight">
              <Skeleton v-if="isLoading" class="h-8 w-40" />
              <template v-else-if="role">{{ role.name }}</template>
              <template v-else>{{ t('roles.not_found', 'Role Not Found') }}</template>
            </h1>
            <Badge v-if="role" :variant="role.scope === 'platform' ? 'default' : 'secondary'" class="capitalize">
              {{ role.scope }}
            </Badge>
          </div>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ t('roles.show_subtitle', 'Detailed permissions for this role') }}
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-10 mt-10">
        <div v-for="m in 4" :key="`sk-mod-${m}`">
          <Skeleton class="h-6 w-48 mb-4" />
          <div class="flex flex-wrap gap-3">
             <Skeleton class="h-10 w-40 rounded-lg" v-for="p in 8" :key="`sk-perm-${p}`" />
          </div>
        </div>
      </div>

      <!-- Roles Content -->
      <div v-else-if="role" class="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-12 mt-10">
        <div v-for="mod in modules" :key="mod.name" class="flex flex-col">
          <!-- Module Header -->
          <div class="flex items-center gap-4 mb-5">
            <h3 class="text-lg font-bold tracking-tight uppercase text-foreground whitespace-nowrap">{{ mod.name }}</h3>
            <div class="h-px bg-border/60 flex-1 min-w-4"></div>
            <span class="text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md whitespace-nowrap">
              {{ mod.permissions.length }} {{ t('roles.fields.permissions_count', 'Permissions') }}
            </span>
          </div>
          
          <!-- Pills Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-3">
            <div
              v-for="perm in mod.permissions"
              :key="perm.id"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200"
              :class="hasPermission(perm.id) 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 shadow-sm' 
                : 'bg-background border-border/50 text-muted-foreground opacity-60 hover:opacity-100 hover:bg-muted/30'"
            >
              <div 
                class="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                :class="hasPermission(perm.id) ? 'bg-emerald-500 text-white shadow-sm' : 'bg-muted-foreground/20'"
              >
                {{ hasPermission(perm.id) ? '✓' : '✕' }}
              </div>
              <span class="text-[13px] font-semibold tracking-wide truncate" :title="perm.action">
                {{ perm.action }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Not Found State -->
      <div v-else class="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>{{ t('roles.not_found', 'Role Not Found') }}</p>
        <Button variant="link" @click="router.push({ name: 'admin-roles' })" class="mt-2">
          {{ t('actions.go_back', 'Go Back') }}
        </Button>
      </div>
    </div>
  </ModularView>
</template>

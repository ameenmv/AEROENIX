<script setup lang="ts">
import type { Role } from '@/types/entities/role'
import { ArrowLeft, Pencil } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import RolePermissionsBoard from '@/components/roles/RolePermissionsBoard.vue'
import { Button } from '@/components/uic/button'
import { Skeleton } from '@/components/uic/skeleton'
import { useRoles } from '@/composables/roles/useRoles'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { roles, modules, isLoading } = useRoles()

const roleId = Number(route.params.id)
const role = computed<Role | undefined>(() => roles.value.find(r => r.id === roleId))
const granted = computed(() => role.value?.permissions ?? [])
</script>

<template>
  <ModularView>
    <div class="mx-auto max-w-7xl space-y-6 pb-12">
      <!-- Top bar -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <Button variant="ghost" size="icon" class="rounded-xl" @click="router.push({ name: 'admin-roles' })">
            <ArrowLeft class="h-5 w-5 rtl:rotate-180" />
          </Button>
          <div>
            <h1 class="text-2xl font-bold tracking-tight">
              {{ t('roles.board.view_title', 'Role Permissions') }}
            </h1>
            <p class="mt-0.5 text-sm text-muted-foreground">
              {{ t('roles.show_subtitle', 'Detailed permissions for this role') }}
            </p>
          </div>
        </div>

        <Button
          v-if="role && role.is_editable !== false"
          class="rounded-xl gap-2"
          @click="router.push({ name: 'admin-roles-edit', params: { id: String(roleId) } })"
        >
          <Pencil class="h-4 w-4" />
          {{ t('roles.board.edit_permissions', 'Edit Permissions') }}
        </Button>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="space-y-6">
        <Skeleton class="h-36 w-full rounded-2xl" />
        <Skeleton class="h-10 w-full max-w-md rounded-xl" />
        <div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <Skeleton v-for="i in 4" :key="i" class="h-52 rounded-2xl" />
        </div>
      </div>

      <RolePermissionsBoard
        v-else-if="role"
        :role="role"
        :modules="modules"
        :model-value="granted"
      />

      <!-- Not found -->
      <div v-else class="rounded-2xl border border-dashed border-border/60 py-16 text-center text-muted-foreground">
        <p>{{ t('roles.not_found', 'Role Not Found') }}</p>
        <Button variant="link" class="mt-2" @click="router.push({ name: 'admin-roles' })">
          {{ t('actions.go_back', 'Go Back') }}
        </Button>
      </div>
    </div>
  </ModularView>
</template>

<script setup lang="ts">
import type { Role } from '@/types/entities/role'
import { ArrowLeft, RotateCcw, Save } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import RolePermissionsBoard from '@/components/roles/RolePermissionsBoard.vue'
import { Button } from '@/components/uic/button'
import { Skeleton } from '@/components/uic/skeleton'
import { useRoles } from '@/composables/roles/useRoles'
import { rolesService } from '@/services/rolesService'
import { useSonarStore } from '@/stores/shared/sonar'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { roles, modules, isLoading, refetch } = useRoles()
const sonar = useSonarStore()

const roleId = Number(route.params.id)
const role = computed<Role | undefined>(() => roles.value.find(r => r.id === roleId))

// Mutable selection + snapshot of the original for diffing
const selectedPermissions = ref<number[]>([])
const originalPermissions = ref<number[]>([])
const isSaving = ref(false)

watch(role, (newRole) => {
  if (newRole) {
    selectedPermissions.value = [...newRole.permissions]
    originalPermissions.value = [...newRole.permissions]
  }
}, { immediate: true })

const changesCount = computed(() => {
  const a = new Set(selectedPermissions.value)
  const b = new Set(originalPermissions.value)
  let n = 0
  a.forEach(id => { if (!b.has(id)) n++ })
  b.forEach(id => { if (!a.has(id)) n++ })
  return n
})
const isDirty = computed(() => changesCount.value > 0)

function resetChanges() {
  selectedPermissions.value = [...originalPermissions.value]
}

function goBack() {
  router.push({ name: 'admin-roles' })
}

async function savePermissions() {
  if (!role.value) return
  isSaving.value = true
  try {
    await rolesService.updatePermissions(role.value.id, {
      permissions: selectedPermissions.value,
    })
    sonar.success(t('common.success', 'Success'), t('roles.permissions_updated', 'Permissions updated successfully'))
    await refetch()
    router.push({ name: 'admin-roles-show', params: { id: String(roleId) } })
  }
  catch (error: any) {
    sonar.error(t('common.error', 'Error'), error?.response?.data?.message || t('roles.permissions_update_failed', 'Failed to update permissions'))
  }
  finally {
    isSaving.value = false
  }
}
</script>

<template>
  <ModularView>
    <div class="mx-auto max-w-7xl space-y-6 pb-28">
      <!-- Top bar -->
      <div class="flex items-center gap-3">
        <Button variant="ghost" size="icon" class="rounded-xl" @click="goBack">
          <ArrowLeft class="h-5 w-5 rtl:rotate-180" />
        </Button>
        <div>
          <h1 class="text-2xl font-bold tracking-tight">
            {{ t('roles.board.edit_title', 'Edit Permissions') }}
          </h1>
          <p class="mt-0.5 text-sm text-muted-foreground">
            {{ t('roles.edit_subtitle', 'Toggle permissions to grant or revoke access') }}
          </p>
        </div>
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
        v-model="selectedPermissions"
        :role="role"
        :modules="modules"
        :original="originalPermissions"
        editable
      />

      <!-- Not found -->
      <div v-else class="rounded-2xl border border-dashed border-border/60 py-16 text-center text-muted-foreground">
        <p>{{ t('roles.not_found', 'Role Not Found') }}</p>
        <Button variant="link" class="mt-2" @click="goBack">
          {{ t('actions.go_back', 'Go Back') }}
        </Button>
      </div>
    </div>

    <!-- Sticky save bar -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-6 opacity-0"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="translate-y-6 opacity-0"
    >
      <div v-if="role" class="pointer-events-none sticky bottom-6 z-30 mx-auto flex max-w-3xl justify-center px-4">
        <div class="pointer-events-auto flex w-full items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/90 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div class="flex items-center gap-2.5 text-sm">
            <span
              class="h-2 w-2 rounded-full"
              :class="isDirty ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'"
            />
            <span v-if="isDirty" class="font-medium text-foreground">
              {{ t('roles.board.changes_pending', { count: changesCount }, `${changesCount} unsaved changes`) }}
            </span>
            <span v-else class="text-muted-foreground">
              {{ t('roles.board.no_changes', 'No changes yet') }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <Button
              v-if="isDirty"
              variant="ghost"
              size="sm"
              class="gap-1.5 rounded-xl"
              :disabled="isSaving"
              @click="resetChanges"
            >
              <RotateCcw class="h-3.5 w-3.5" />
              {{ t('roles.board.reset', 'Reset') }}
            </Button>
            <Button variant="outline" size="sm" class="rounded-xl" :disabled="isSaving" @click="goBack">
              {{ t('actions.cancel', 'Cancel') }}
            </Button>
            <Button size="sm" class="gap-1.5 rounded-xl" :disabled="isSaving || !isDirty" @click="savePermissions">
              <span v-if="isSaving" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              <Save v-else class="h-3.5 w-3.5" />
              {{ t('actions.save_changes', 'Save Changes') }}
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </ModularView>
</template>

<script setup lang="ts">
import type { Permission } from '@/types/entities/permission'
import { useQuery } from '@tanstack/vue-query'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from '@/composables'
import { roleFormSchema } from '@/modules/roles/schema'
import { permissionsService } from '@/services/permissionsService'
import { rolesService } from '@/services/rolesService'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const id = route.params.id as string

const { data: item, isLoading } = useQuery({
  queryKey: ['roles', id],
  queryFn: () => rolesService.get(id, { scope: 'full', include: 'permissions' }),
  retry: false,
  refetchOnWindowFocus: false,
})

const { data: allPermissions } = useQuery({
  queryKey: ['permissions'],
  queryFn: () => permissionsService.list(),
  retry: false,
  refetchOnWindowFocus: false,
})

const selectedPermissions = ref<number[]>([])

const form = useForm({
  resourceName: 'roles',
  action: 'update',
  schema: roleFormSchema(t),
  mutationFn: async (data) => {
    const result = await rolesService.update(id, data)
    // Sync permissions separately
    await rolesService.syncPermissions(id, selectedPermissions.value)
    return result
  },
  onSuccess: () => router.push({ name: 'admin-roles' }),
})

watch(item, (newItem) => {
  if (newItem) {
    form.setValues({
      display_name: newItem.display_name,
      permissions: newItem.permissions?.map(p => p.id) || [],
    })
    selectedPermissions.value = newItem.permissions?.map(p => p.id) || []
  }
}, { immediate: true })

// Group permissions by module for the UI
function groupedPermissions(permissions: Permission[]) {
  const groups: Record<string, Permission[]> = {}
  for (const perm of permissions) {
    const module = perm.module || 'general'
    if (!groups[module])
      groups[module] = []
    groups[module].push(perm)
  }
  return groups
}

function togglePermission(permId: number) {
  const idx = selectedPermissions.value.indexOf(permId)
  if (idx === -1) {
    selectedPermissions.value.push(permId)
  }
  else {
    selectedPermissions.value.splice(idx, 1)
  }
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">
      {{ t('actions.edit') }} {{ t('roles.title', 'Role') }}
    </h1>

    <div v-if="isLoading" class="py-12 flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>

    <FormContainer
      v-else
      :form="form"
      :is-edit="true"
      @cancel="router.push({ name: 'admin-roles' })"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          name="display_name.en"
          :label="`${t('roles.fields.display_name', 'Role Name')} (EN)`"
          :placeholder="t('roles.placeholders.display_name_en', 'Enter role name in English')"
          :error="form.errors.value['display_name.en']"
        />
        <InputField
          name="display_name.ar"
          :label="`${t('roles.fields.display_name', 'Role Name')} (AR)`"
          :placeholder="t('roles.placeholders.display_name_ar', 'Enter role name in Arabic')"
          dir="rtl"
          :error="form.errors.value['display_name.ar']"
        />
      </div>

      <!-- Permissions Matrix -->
      <div class="mt-6">
        <h3 class="text-lg font-semibold mb-4">
          {{ t('roles.fields.permissions', 'Permissions') }}
        </h3>

        <div v-if="allPermissions?.data" class="space-y-6">
          <div
            v-for="(perms, module) in groupedPermissions(allPermissions.data)"
            :key="module"
            class="rounded-lg border border-border p-4"
          >
            <h4 class="text-sm font-semibold capitalize mb-3 text-primary">
              {{ module }}
            </h4>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              <label
                v-for="perm in perms"
                :key="perm.id"
                class="flex items-center gap-2 text-sm cursor-pointer rounded-md p-2 hover:bg-muted/50 transition-colors"
              >
                <input
                  type="checkbox"
                  :checked="selectedPermissions.includes(perm.id)"
                  class="rounded border-border"
                  @change="togglePermission(perm.id)"
                >
                <span>{{ perm.label?.en || perm.name }}</span>
              </label>
            </div>
          </div>
        </div>
        <div v-else class="text-sm text-muted-foreground">
          {{ t('common.loading', 'Loading...') }}
        </div>
      </div>
    </FormContainer>
  </div>
</template>

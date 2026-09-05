<script setup lang="ts">
import type { User } from '@/types/entities/users'
import { computed, watch } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from '@/composables'
import { updateUserRoleSchema } from '@/modules/users/schema'
import { usersService } from '@/services/usersService'
import { rolesService } from '@/services/rolesService'

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
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">
      {{ t('users.actions.update_role', 'Update User Role') }}
    </h1>

    <div v-if="isLoading" class="py-12 flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>

    <template v-else-if="item">
      <!-- User info header -->
      <div class="rounded-lg border p-4 bg-muted/30">
        <div class="flex items-center gap-3">
          <div>
            <span class="font-semibold">{{ item.name }}</span>
            <span class="text-sm text-muted-foreground ml-2">{{ item.email }}</span>
          </div>
          <span
            class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize"
            :class="item.status === 'active'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
          >
            {{ item.status }}
          </span>
        </div>
      </div>

      <FormContainer
        :form="form"
        :is-edit="true"
        @cancel="router.push({ name: 'admin-users' })"
      >
        <!-- Role -->
        <SelectField
          name="role_id"
          v-model="roleId"
          v-bind="roleIdProps"
          :options="roleOptions"
          :label="t('users.fields.role', 'Role')"
          :placeholder="isLoadingRoles ? t('common.loading', 'Loading...') : t('users.placeholders.role', 'Select a role')"
          :disabled="isLoadingRoles"
          :error="form.displayErrors.value.role_id"
        />
      </FormContainer>
    </template>
  </div>
</template>

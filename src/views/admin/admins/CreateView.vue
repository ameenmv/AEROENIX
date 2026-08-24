<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useForm } from '@/composables'
import { adminCreateSchema } from '@/modules/admins/schema'
import { adminsService } from '@/services/adminsService'
import { rolesService } from '@/services/rolesService'

const { t } = useI18n()
const router = useRouter()

const form = useForm({
  resourceName: 'admins',
  action: 'create',
  schema: adminCreateSchema(t),
  mutationFn: data => adminsService.create(data),
  onSuccess: () => router.push({ name: 'admin-admins' }),
})

// Fetch roles for dropdown
const { data: rolesData } = useQuery({
  queryKey: ['roles-dropdown'],
  queryFn: () => rolesService.dropdown({ limit: 50 }),
  retry: false,
  refetchOnWindowFocus: false,
})

const selectedRoleIds = ref<number[]>([])

function toggleRole(roleId: number) {
  const idx = selectedRoleIds.value.indexOf(roleId)
  if (idx === -1) {
    selectedRoleIds.value.push(roleId)
  }
  else {
    selectedRoleIds.value.splice(idx, 1)
  }
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">
      {{ t('actions.create') }} {{ t('admins.title', 'Admin') }}
    </h1>

    <FormContainer
      :form="form"
      @cancel="router.push({ name: 'admin-admins' })"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          name="name"
          :label="t('admins.fields.name', 'Name')"
          :placeholder="t('admins.placeholders.name', 'Full name')"
          :error="form.errors.value.name"
        />
        <InputField
          name="email"
          type="email"
          :label="t('admins.fields.email', 'Email')"
          :placeholder="t('admins.placeholders.email', 'email@example.com')"
          :error="form.errors.value.email"
        />
        <InputField
          name="phone"
          type="tel"
          :label="t('admins.fields.phone', 'Phone')"
          :placeholder="t('admins.placeholders.phone', '+966...')"
          :error="form.errors.value.phone"
        />
        <InputField
          name="username"
          :label="t('admins.fields.username', 'Username')"
          :placeholder="t('admins.placeholders.username', 'Optional username')"
          :error="form.errors.value.username"
        />
        <InputField
          name="password"
          type="password"
          :label="t('admins.fields.password', 'Password')"
          :placeholder="t('admins.placeholders.password', 'Min 8 characters')"
          :error="form.errors.value.password"
        />
        <InputField
          name="password_confirmation"
          type="password"
          :label="t('admins.fields.password_confirmation', 'Confirm Password')"
          :placeholder="t('admins.placeholders.password_confirmation', 'Repeat password')"
          :error="form.errors.value.password_confirmation"
        />
      </div>

      <!-- Roles -->
      <div class="mt-6">
        <h3 class="text-sm font-medium mb-3">
          {{ t('admins.fields.roles', 'Roles') }}
        </h3>
        <div v-if="rolesData?.data" class="flex flex-wrap gap-2">
          <label
            v-for="role in rolesData.data"
            :key="role.id"
            class="flex items-center gap-2 text-sm cursor-pointer rounded-md border border-border px-3 py-2 hover:bg-muted/50 transition-colors"
            :class="{ 'bg-primary/10 border-primary': selectedRoleIds.includes(role.id) }"
          >
            <input
              type="checkbox"
              :checked="selectedRoleIds.includes(role.id)"
              class="rounded border-border"
              @change="toggleRole(role.id)"
            >
            {{ role.display_name?.en || role.name }}
          </label>
        </div>
        <p v-else class="text-sm text-muted-foreground">
          {{ t('common.loading', 'Loading roles...') }}
        </p>
      </div>
    </FormContainer>
  </div>
</template>

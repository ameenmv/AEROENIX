<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { useForm } from '@/composables'
import { hotelCreateSchema } from '@/modules/hotels/schema'
import { hotelsService } from '@/services/hotelsService'
import { permissionsService } from '@/services/permissionsService'

const { t } = useI18n()
const router = useRouter()

// Fetch permissions for the multi-select
const { data: permissionsResponse, isLoading: isLoadingPermissions } = useQuery({
  queryKey: ['permissions', 'mini'],
  queryFn: () => permissionsService.list(),
})

const permissionOptions = computed(() => {
  const data = permissionsResponse.value?.data || []
  // Handle backend returning { permissions: [...] } instead of direct array
  const perms = Array.isArray(data) ? data : (data.permissions || [])
  
  return perms.map((p: any) => ({
    value: p.id,
    label: p.name, // or p.label?.en || p.name if it's translatable
  }))
})

const form = useForm({
  resourceName: 'hotels',
  action: 'create',
  schema: hotelCreateSchema(t),
  mutationFn: data => hotelsService.create(data),
  onSuccess: () => router.push({ name: 'admin-hotels' }),
})

const [name, nameProps] = form.defineField('name')
const [adminEmail, adminEmailProps] = form.defineField('admin_email')
const [adminPermissions, adminPermissionsProps] = form.defineField('admin_permissions')
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">
      {{ t('actions.create') }} {{ t('hotels.title', 'Hotel') }}
    </h1>

    <FormContainer :form="form" @cancel="router.push({ name: 'admin-hotels' })">
      <!-- Hotel Name -->
      <InputField
        name="name"
        v-model="name"
        v-bind="nameProps"
        :label="t('hotels.fields.name', 'Hotel Name')"
        :placeholder="t('hotels.fields.name', 'Hotel Name')"
        :error="form.displayErrors.value.name"
      />

      <!-- Admin Email -->
      <InputField
        name="admin_email"
        type="email"
        v-model="adminEmail"
        v-bind="adminEmailProps"
        :label="t('hotels.fields.admin_email', 'Admin Email')"
        :placeholder="t('hotels.fields.admin_email', 'Admin Email')"
        :error="form.displayErrors.value.admin_email"
      />

      <!-- Admin Permissions -->
      <div class="md:col-span-2">
        <SelectField
          name="admin_permissions"
          v-model="adminPermissions"
          v-bind="adminPermissionsProps"
          multiple
          :options="permissionOptions"
          :label="t('hotels.fields.admin_permissions', 'Admin Permissions')"
          :placeholder="isLoadingPermissions ? t('common.loading', 'Loading...') : t('hotels.fields.admin_permissions', 'Select Permissions')"
          :disabled="isLoadingPermissions"
          :error="form.displayErrors.value.admin_permissions"
        />
      </div>
    </FormContainer>
  </div>
</template>

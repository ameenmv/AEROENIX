<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { useForm } from '@/composables'
import { inviteUserSchema } from '@/modules/users/schema'
import { usersService } from '@/services/usersService'
import { rolesService } from '@/services/rolesService'
import { hotelsService } from '@/services/hotelsService'

const { t } = useI18n()
const router = useRouter()

// Fetch roles for the select dropdown
const { data: matrixData, isLoading: isLoadingRoles } = useQuery({
  queryKey: ['roles-matrix'],
  queryFn: () => rolesService.getMatrix(),
})

// Fetch all hotels for the select dropdown
const { data: hotelsData, isLoading: isLoadingHotels } = useQuery({
  queryKey: ['hotels-all'],
  queryFn: () => hotelsService.list({ limit: 999 }),
})

const roleOptions = computed(() => {
  const roles = matrixData.value?.roles || []
  return roles
    .filter(r => r.scope === 'hotel') // Only show hotel-scoped roles for invitation
    .map(r => ({
      value: r.id,
      label: r.name,
    }))
})

const hotelOptions = computed(() => {
  const hotels = hotelsData.value?.data || []
  return hotels.map(h => ({
    value: h.id,
    label: h.name,
  }))
})

const form = useForm({
  resourceName: 'users',
  action: 'create',
  schema: inviteUserSchema(t),
  mutationFn: data => usersService.invite(data),
  onSuccess: () => router.push({ name: 'admin-users' }),
})

const [email, emailProps] = form.defineField('email')
const [name, nameProps] = form.defineField('name')
const [roleId, roleIdProps] = form.defineField('role_id')
const [hotelId, hotelIdProps] = form.defineField('hotel_id')
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">
        {{ t('users.actions.invite') }}
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        {{ t('users.invite_subtitle') }}
      </p>
    </div>

    <FormContainer :form="form" @cancel="router.push({ name: 'admin-users' })">
      <!-- Email -->
      <InputField
        name="email"
        type="email"
        v-model="email"
        v-bind="emailProps"
        :label="t('users.fields.email')"
        :placeholder="t('users.placeholders.email')"
        :error="form.displayErrors.value.email"
      />

      <!-- Name (optional) -->
      <InputField
        name="name"
        v-model="name"
        v-bind="nameProps"
        :label="t('users.fields.name')"
        :placeholder="t('users.placeholders.name')"
        :error="form.displayErrors.value.name"
      />

      <!-- Role -->
      <SelectField
        name="role_id"
        v-model="roleId"
        v-bind="roleIdProps"
        :options="roleOptions"
        :label="t('users.fields.role')"
        :placeholder="isLoadingRoles ? t('common.loading') : t('users.placeholders.role')"
        :disabled="isLoadingRoles"
        :error="form.displayErrors.value.role_id"
      />

      <!-- Hotel -->
      <SelectField
        name="hotel_id"
        v-model="hotelId"
        v-bind="hotelIdProps"
        :options="hotelOptions"
        :label="t('users.fields.hotel')"
        :placeholder="isLoadingHotels ? t('common.loading') : t('users.placeholders.hotel')"
        :disabled="isLoadingHotels"
        :error="form.displayErrors.value.hotel_id"
      />
    </FormContainer>
  </div>
</template>

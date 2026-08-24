<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useForm } from '@/composables'
import { userCreateSchema } from '@/modules/users/schema'
import { usersService } from '@/services/usersService'

const { t } = useI18n()
const router = useRouter()

const form = useForm({
  resourceName: 'users',
  action: 'create',
  schema: userCreateSchema(t),
  mutationFn: data => usersService.create(data),
  onSuccess: () => router.push({ name: 'admin-users' }),
})
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">
      {{ t('actions.create') }} {{ t('users.title', 'User') }}
    </h1>

    <FormContainer
      :form="form"
      @cancel="router.push({ name: 'admin-users' })"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          name="name"
          :label="t('users.fields.name', 'Name')"
          :placeholder="t('users.fields.name', 'Name')"
          :error="form.errors.value.name"
        />
        <InputField
          name="email"
          type="email"
          :label="t('users.fields.email', 'Email')"
          :placeholder="t('users.fields.email', 'Email')"
          :error="form.errors.value.email"
        />
      </div>
    </FormContainer>
  </div>
</template>

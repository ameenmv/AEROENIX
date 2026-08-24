<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from '@/composables'
import { userEditSchema } from '@/modules/users/schema'
import { usersService } from '@/services/usersService'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const id = route.params.id as string

const { data: item, isLoading } = useQuery({
  queryKey: ['users', id],
  queryFn: () => usersService.get(id),
  retry: false,
  refetchOnWindowFocus: false,
})

const form = useForm({
  resourceName: 'users',
  action: 'update',
  schema: userEditSchema(t),
  mutationFn: data => usersService.update(id, data),
  onSuccess: () => router.push({ name: 'admin-users' }),
})

watch(
  item,
  (newItem) => {
    if (newItem)
      form.setValues(newItem)
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">
      {{ t('actions.edit') }} {{ t('users.title', 'User') }}
    </h1>

    <div v-if="isLoading" class="py-12 flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>

    <FormContainer
      v-else
      :form="form"
      :is-edit="true"
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

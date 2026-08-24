<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useForm } from '@/composables'
import { roleFormSchema } from '@/modules/roles/schema'
import { rolesService } from '@/services/rolesService'

const { t } = useI18n()
const router = useRouter()

const form = useForm({
  resourceName: 'roles',
  action: 'create',
  schema: roleFormSchema(t),
  mutationFn: data => rolesService.create(data),
  onSuccess: () => router.push({ name: 'admin-roles' }),
})
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">
      {{ t('actions.create') }} {{ t('roles.title', 'Role') }}
    </h1>

    <FormContainer
      :form="form"
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

      <!-- Permissions section placeholder -->
      <div class="mt-6">
        <h3 class="text-lg font-semibold mb-4">
          {{ t('roles.fields.permissions', 'Permissions') }}
        </h3>
        <p class="text-sm text-muted-foreground">
          {{ t('roles.permissions_hint', 'Permissions can be managed after creating the role.') }}
        </p>
      </div>
    </FormContainer>
  </div>
</template>

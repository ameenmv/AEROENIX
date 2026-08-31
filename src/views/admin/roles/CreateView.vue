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

const [name, nameProps] = form.defineField('name')
const [description, descriptionProps] = form.defineField('description')
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">
      {{ t('roles.actions.create', 'Create Role') }}
    </h1>

    <FormContainer :form="form" @cancel="router.push({ name: 'admin-roles' })">
      <!-- Role Name -->
      <InputField
        name="name"
        v-model="name"
        v-bind="nameProps"
        :label="t('roles.fields.name', 'Role Name')"
        :placeholder="t('roles.placeholders.name', 'e.g. Front Desk Manager')"
        :error="form.displayErrors.value.name"
      />

      <!-- Description -->
      <div class="md:col-span-2">
        <InputField
          name="description"
          v-model="description"
          v-bind="descriptionProps"
          :label="t('roles.fields.description', 'Description (Optional)')"
          :placeholder="t('roles.placeholders.description', 'Brief description of this role')"
          :error="form.displayErrors.value.description"
        />
      </div>

      <!-- Permissions note -->
      <div class="md:col-span-2 mt-2">
        <p class="text-sm text-muted-foreground">
          {{ t('roles.permissions_hint', 'Permissions can be managed from the roles matrix after creating this role.') }}
        </p>
      </div>
    </FormContainer>
  </div>
</template>

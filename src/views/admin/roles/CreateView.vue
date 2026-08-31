<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useForm } from '@/composables'
import { useQuery } from '@tanstack/vue-query'
import { roleFormSchema } from '@/modules/roles/schema'
import { rolesService } from '@/services/rolesService'
import { Checkbox } from '@/components/uic/checkbox'
import { Label } from '@/components/uic/label'
import { Loader2Icon } from 'lucide-vue-next'

const { t } = useI18n()
const router = useRouter()

// Standalone ref for permissions — bypasses VeeValidate's array tracking issues
const selectedPermissions = ref<string[]>([])

const form = useForm({
  resourceName: 'roles',
  action: 'create',
  schema: roleFormSchema(t),
  initialValues: {
    name: '',
    description: '',
  },
  mutationFn: data => rolesService.create({
    ...data,
    permissions: selectedPermissions.value,
  }),
  onSuccess: () => router.push({ name: 'admin-roles' }),
})

const [name, nameProps] = form.defineField('name')
const [description, descriptionProps] = form.defineField('description')

// Fetch the roles matrix to get permission modules
const { data: matrixData, isLoading: isLoadingMatrix } = useQuery({
  queryKey: ['roles-matrix'],
  queryFn: () => rolesService.getMatrix(),
})

function togglePermission(action: string, checked: boolean) {
  if (checked) {
    if (!selectedPermissions.value.includes(action)) {
      selectedPermissions.value = [...selectedPermissions.value, action]
    }
  } else {
    selectedPermissions.value = selectedPermissions.value.filter(a => a !== action)
  }
}
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

      <!-- Permissions Grid -->
      <div class="md:col-span-2 mt-4 space-y-4">
        <div>
          <h3 class="text-lg font-medium">{{ t('roles.permissions_title', 'Permissions') }}</h3>
          <p class="text-sm text-muted-foreground">{{ t('roles.permissions_subtitle', 'Select the permissions this role should have.') }}</p>
        </div>

        <div v-if="isLoadingMatrix" class="flex items-center space-x-2 py-4 text-muted-foreground">
          <Loader2Icon class="h-4 w-4 animate-spin" />
          <span>{{ t('common.loading', 'Loading...') }}</span>
        </div>

        <div v-else-if="matrixData" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 border rounded-lg p-6 bg-card">
          <div
            v-for="module in matrixData.modules"
            :key="module.name"
            class="space-y-3"
          >
            <h4 class="font-semibold text-sm tracking-tight capitalize border-b pb-2">
              {{ module.name.replace('_', ' ') }}
            </h4>
            <div class="space-y-2">
              <div
                v-for="p in module.permissions"
                :key="p.id"
                class="flex items-center space-x-2"
              >
                <Checkbox
                  :id="p.action"
                  :checked="selectedPermissions.includes(p.action)"
                  @update:checked="(val: boolean) => togglePermission(p.action, val)"
                />
                <Label :for="p.action" class="text-sm cursor-pointer font-normal">
                  {{ p.action.split('.')[1] || p.action }}
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormContainer>
  </div>
</template>


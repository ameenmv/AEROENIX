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
      <InputField
        name="description"
        v-model="description"
        v-bind="descriptionProps"
        :label="t('roles.fields.description', 'Description (Optional)')"
        :placeholder="t('roles.placeholders.description', 'Brief description of this role')"
        :error="form.displayErrors.value.description"
      />

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

        <div v-else-if="matrixData" class="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-10 mt-6">
          <div v-for="mod in matrixData.modules" :key="mod.name" class="flex flex-col">
            <!-- Module Header -->
            <div class="flex items-center gap-4 mb-5">
              <h4 class="text-sm font-bold tracking-tight uppercase text-foreground whitespace-nowrap">{{ mod.name.replace('_', ' ') }}</h4>
              <div class="h-px bg-border/60 flex-1 min-w-4"></div>
              <span class="text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md whitespace-nowrap">
                {{ mod.permissions.length }} {{ t('roles.fields.permissions_count', 'Permissions') }}
              </span>
            </div>
            
            <!-- Pills Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-3">
              <button
                type="button"
                v-for="perm in mod.permissions"
                :key="perm.id"
                @click="togglePermission(perm.action, !selectedPermissions.includes(perm.action))"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-primary/30"
                :class="selectedPermissions.includes(perm.action)
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 shadow-sm' 
                  : 'bg-background border-border/50 text-muted-foreground opacity-60 hover:opacity-100 hover:bg-muted/30'"
              >
                <div 
                  class="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold transition-colors"
                  :class="selectedPermissions.includes(perm.action) ? 'bg-emerald-500 text-white shadow-sm' : 'bg-muted-foreground/20 text-transparent'"
                >
                  ✓
                </div>
                <span class="text-[13px] font-semibold tracking-wide truncate" :title="perm.action">
                  {{ perm.action }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </FormContainer>
  </div>
</template>


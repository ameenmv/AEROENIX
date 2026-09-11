<script setup lang="ts">
import { ref } from 'vue'
import { PlusSignIcon, MoreHorizontalIcon, ViewIcon, PencilEdit01Icon, Delete02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useQueryClient, useMutation } from '@tanstack/vue-query'
import { toast } from 'vue-sonner'
import { useRoles } from '@/composables'
import { rolesService } from '@/services/rolesService'
import type { Role } from '@/types/entities/role'
import { Button } from '@/components/uic/button'

import { Badge } from '@/components/uic/badge'
import { DataTable } from '@/components/ui/tables'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/uic/dropdown-menu'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/uic/alert-dialog'

const { t } = useI18n()
const router = useRouter()
const queryClient = useQueryClient()

const { roles, isLoading, isFetching } = useRoles()

const columns = [
  { key: 'name', label: 'roles.fields.name' },
  { key: 'scope', label: 'roles.fields.scope' },
  { key: 'permissions', label: 'roles.fields.permissions_count', className: 'text-center' },
]

const isDeleteDialogOpen = ref(false)
const roleToDelete = ref<Role | null>(null)

const { mutate: executeDelete, isPending: isDeleting } = useMutation({
  mutationFn: (id: string | number) => rolesService.delete(id),
  onSuccess: () => {
    toast.success(t('roles.delete_success', 'Role deleted successfully'))
    queryClient.invalidateQueries({ queryKey: ['roles-permissions'] })
    closeDeleteDialog()
  },
  onError: (error: any) => {
    toast.error(error?.response?.data?.message || t('roles.delete_error', 'Failed to delete role'))
  }
})

function openDeleteDialog(role: Role) {
  roleToDelete.value = role
  isDeleteDialogOpen.value = true
}

function closeDeleteDialog() {
  isDeleteDialogOpen.value = false
  roleToDelete.value = null
}

function confirmDelete() {
  if (roleToDelete.value) {
    executeDelete(roleToDelete.value.id)
  }
}
</script>

<template>
  <ModularView>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">
            {{ t('roles.title') }}
          </h1>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ t('roles.subtitle') }}
          </p>
        </div>
        <Button @click="router.push({ name: 'admin-roles-create' })">
          <HugeiconsIcon :icon="PlusSignIcon" :size="20" class="mr-2" />
          {{ t('roles.actions.create') }}
        </Button>
      </div>

      <!-- Roles List -->
      <DataTable
        v-if="isLoading || isFetching || roles.length > 0"
        :data="roles as any[]"
        :columns="columns"
        :loading="isLoading || isFetching"
        searchable
        modern-search
        transparent-container
        separated-records
      >
        <template #name="{ value }">
          <span class="font-medium text-sm text-foreground">{{ value }}</span>
        </template>
        <template #scope="{ value }">
          <Badge :variant="value === 'platform' ? 'default' : 'secondary'" class="capitalize text-[10px]">
            {{ value }}
          </Badge>
        </template>
        <template #permissions="{ value }">
          <div class="w-full text-center">
            <span class="text-sm text-muted-foreground">{{ (value || []).length }}</span>
          </div>
        </template>
        <template #actions="{ row }">
          <div class="w-full flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon" class="h-8 w-8 rounded-lg hover:bg-muted">
                  <HugeiconsIcon :icon="MoreHorizontalIcon" :size="18" class="text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-44">
                <DropdownMenuItem @click="router.push({ name: 'admin-roles-show', params: { id: String((row as any).id) } })">
                  <HugeiconsIcon :icon="ViewIcon" :size="16" />
                  {{ t('actions.view', 'View') }}
                </DropdownMenuItem>
                <DropdownMenuItem @click="router.push({ name: 'admin-roles-edit', params: { id: String((row as any).id) } })">
                  <HugeiconsIcon :icon="PencilEdit01Icon" :size="16" />
                  {{ t('actions.edit', 'Edit') }}
                </DropdownMenuItem>
                <DropdownMenuItem class="text-destructive focus:text-destructive focus:bg-destructive/10" @click="openDeleteDialog(row as any)">
                  <HugeiconsIcon :icon="Delete02Icon" :size="16" />
                  {{ t('actions.delete', 'Delete') }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </template>
      </DataTable>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>{{ t('roles.empty') }}</p>
      </div>
    </div>

    <!-- Delete Dialog -->
    <AlertDialog :open="isDeleteDialogOpen" @update:open="val => { if (!isDeleting) isDeleteDialogOpen = val }">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ t('actions.delete', 'Delete') }} {{ t('roles.title', 'Role') }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{ t('roles.delete_confirm', 'Are you sure you want to delete this role? This action cannot be undone.') }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isDeleting" @click="closeDeleteDialog">
            {{ t('actions.cancel', 'Cancel') }}
          </AlertDialogCancel>
          <Button variant="destructive" :disabled="isDeleting" @click="confirmDelete">
            <span v-if="isDeleting" class="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            {{ t('actions.delete', 'Delete') }}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </ModularView>
</template>

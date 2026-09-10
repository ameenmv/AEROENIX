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
import { Skeleton } from '@/components/uic/skeleton'
import { Badge } from '@/components/uic/badge'
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

      <!-- Loading State Skeleton -->
      <div v-if="isLoading || isFetching" class="overflow-x-auto rounded-lg border border-border/50">
        <table class="w-full text-sm border-separate border-spacing-y-0">
          <thead>
            <tr>
              <th class="sticky left-0 z-10 bg-muted/30 px-4 py-3.5 text-left w-64">
                <Skeleton class="h-4 w-28" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in 3" :key="`sk-row-${row}`">
              <td class="sticky left-0 z-10 bg-background px-4 py-3.5">
                <Skeleton class="h-4 w-44" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Roles List -->
      <div v-else-if="roles.length > 0" class="overflow-x-auto">
        <table class="w-full border-separate border-spacing-y-2">
          <thead>
            <tr class="border-none bg-muted/30 rounded-lg">
              <th class="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('roles.fields.name', 'Role Name') }}</th>
              <th class="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('roles.fields.scope', 'Scope') }}</th>
              <th class="px-4 py-3 text-center text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('roles.fields.permissions_count', 'Permissions') }}</th>
              <th class="px-4 py-3 text-center text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg w-16" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="role in roles"
              :key="role.id"
              class="bg-card hover:bg-muted/50 transition-colors"
            >
              <td class="px-4 py-4 text-left first:rounded-l-lg last:rounded-r-lg">
                <span class="font-medium text-sm text-foreground">{{ role.name }}</span>
              </td>
              <td class="px-4 py-4 text-left first:rounded-l-lg last:rounded-r-lg">
                <Badge :variant="role.scope === 'platform' ? 'default' : 'secondary'" class="capitalize text-[10px]">
                  {{ role.scope }}
                </Badge>
              </td>
              <td class="px-4 py-4 text-center first:rounded-l-lg last:rounded-r-lg">
                <span class="text-sm text-muted-foreground">{{ role.permissions.length }}</span>
              </td>
              <td class="px-4 py-4 text-center first:rounded-l-lg last:rounded-r-lg w-16">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="h-8 w-8 rounded-lg hover:bg-muted">
                      <HugeiconsIcon :icon="MoreHorizontalIcon" :size="18" class="text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-44">
                    <DropdownMenuItem
                      @click="router.push({ name: 'admin-roles-show', params: { id: String(role.id) } })"
                    >
                      <HugeiconsIcon :icon="ViewIcon" :size="16" />
                      {{ t('actions.view', 'View') }}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      @click="router.push({ name: 'admin-roles-edit', params: { id: String(role.id) } })"
                    >
                      <HugeiconsIcon :icon="PencilEdit01Icon" :size="16" />
                      {{ t('actions.edit', 'Edit') }}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      class="text-destructive focus:text-destructive focus:bg-destructive/10"
                      @click="openDeleteDialog(role)"
                    >
                      <HugeiconsIcon :icon="Delete02Icon" :size="16" />
                      {{ t('actions.delete', 'Delete') }}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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

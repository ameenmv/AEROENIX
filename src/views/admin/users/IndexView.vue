<script setup lang="ts">
import type { HotelInvitation, User } from '@/types/entities/users'
import { Cancel01Icon, Delete02Icon, MailSend01Icon, MoreHorizontalIcon, PlusSignIcon, ViewIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import ConfirmModal from '@/components/ui/modals/ConfirmModal.vue'
import { DataTable } from '@/components/ui/tables'
import { TableCell, TableHead, TableRow } from '@/components/uic/table'
import { useConfirm } from '@/composables/shared/useConfirm'
import { useTable } from '@/composables/shared/useTable'
import { usersService } from '@/services/usersService'
import { Button } from '@/components/uic/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/uic/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/uic/dropdown-menu'

const { t } = useI18n()
const router = useRouter()
const queryClient = useQueryClient()
const { confirmState, confirm, cancel } = useConfirm()

/** Active tab */
const activeTab = ref('users')

/** Pending invitations (loaded alongside users) */
const invitations = ref<HotelInvitation[]>([])

const table = useTable<User>({
  resourceName: 'users',
  fetchFn: async (params: any) => {
    try {
      const result = await usersService.list({
        page: params.page,
        limit: params.limit || params.perPage,
        search: params.search,
      })
      // Store invitations separately
      invitations.value = result.invitations
      return { data: result.users, total: result.pagination.total }
    }
    catch {
      return { data: [], total: 0 }
    }
  },
})

const deleteMutation = useMutation({
  mutationFn: (id: string | number) => usersService.delete(id),
  onSuccess: (message) => {
    toast.success(message)
    queryClient.invalidateQueries({ queryKey: ['users'] })
  },
})

const toggleMutation = useMutation({
  mutationFn: (id: string | number) => usersService.toggleStatus(id),
  onSuccess: ({ message }) => {
    toast.success(message)
    queryClient.invalidateQueries({ queryKey: ['users'] })
  },
})

function handleDelete(id: string | number) {
  confirm(
    t('common.confirm_delete_title'),
    t('common.confirm_delete'),
    () => {
      deleteMutation.mutate(id, {
        onSettled: () => cancel(),
      })
    },
  )
}

function handleToggleStatus(user: User) {
  const action = user.status === 'active' ? 'suspend' : 'activate'
  const variant = action === 'activate' ? 'default' : 'destructive' as const
  confirm(
    t(`users.confirm_${action}`),
    t(`users.confirm_${action}_message`, { name: user.name }),
    () => {
      toggleMutation.mutate(user.id, {
        onSettled: () => cancel(),
      })
    },
    variant,
  )
}

function handleResendInvitation(invitation: HotelInvitation) {
  confirm(
    t('users.confirm_resend'),
    t('users.confirm_resend_message', { email: invitation.email }),
    async () => {
      try {
        const message = await usersService.resendInvitation(invitation.id)
        toast.success(message)
        queryClient.invalidateQueries({ queryKey: ['users'] })
      }
      catch {
        // Error handled by api interceptor
      }
      finally {
        cancel()
      }
    },
  )
}

/** Type-safe row accessor */
function u(row: any): User {
  return row as User
}
</script>

<template>
  <ModularView>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">
            {{ t('users.title') }}
          </h1>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ t('users.subtitle') }}
          </p>
        </div>
        <Button @click="router.push({ name: 'admin-users-create' })">
          <HugeiconsIcon :icon="PlusSignIcon" :size="20" class="mr-2" />
          {{ t('users.actions.invite') }}
        </Button>
      </div>

      <!-- Tabs: Users / Pending Invitations -->
      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="w-full grid grid-cols-2 h-11 rounded-lg bg-muted/50 p-1">
          <TabsTrigger value="users" class="rounded-md text-sm font-medium">
            {{ t('users.tabs.users') }}
          </TabsTrigger>
          <TabsTrigger value="invitations" class="rounded-md text-sm font-medium">
            {{ t('users.tabs.invitations') }}
            <span
              v-if="invitations.length > 0"
              class="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-amber-500/15 px-1.5 text-[11px] font-semibold text-amber-500 tabular-nums"
            >
              {{ invitations.length }}
            </span>
          </TabsTrigger>
        </TabsList>

        <!-- Users Tab -->
        <TabsContent value="users" class="mt-4">
          <DataTable
            :data="table.items.value as any"
            :loading="table.loading.value"
            :total-items="table.totalItems.value"
            :page="table.page.value"
            :per-page="table.perPage.value"
            server-side
            searchable
            @update:page="table.goToPage"
            @update:per-page="table.setPerPage"
            @update:search="table.setSearchQuery"
            @sort="table.setSorting"
          >
            <template #header>
              <TableRow class="border-none hover:bg-transparent bg-muted/30">
                <TableHead class="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('users.fields.name') }}</TableHead>
                <TableHead class="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('users.fields.email') }}</TableHead>
                <TableHead class="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('users.fields.role') }}</TableHead>
                <TableHead class="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('users.fields.hotel') }}</TableHead>
                <TableHead class="px-4 py-3 text-center text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('users.fields.status') }}</TableHead>
                <TableHead class="px-4 py-3 text-center text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg w-16" />
              </TableRow>
            </template>

            <template #row="{ row }">
              <TableRow class="bg-card border-none hover:bg-muted/50 transition-colors">
                <TableCell class="px-4 py-4 text-left first:rounded-l-lg last:rounded-r-lg">
                  <span class="font-medium text-foreground">{{ u(row).name }}</span>
                </TableCell>

                <TableCell class="px-4 py-4 text-left first:rounded-l-lg last:rounded-r-lg">
                  <span class="text-muted-foreground text-sm">{{ u(row).email }}</span>
                </TableCell>

                <TableCell class="px-4 py-4 text-left first:rounded-l-lg last:rounded-r-lg">
                  <span v-if="u(row).role" class="text-sm">
                    {{ u(row).role?.name }}
                  </span>
                  <span v-else class="text-xs text-muted-foreground/50">—</span>
                </TableCell>

                <TableCell class="px-4 py-4 text-left first:rounded-l-lg last:rounded-r-lg">
                  <span class="text-sm">{{ u(row).hotel_name || '—' }}</span>
                </TableCell>

                <TableCell class="px-4 py-4 text-center first:rounded-l-lg last:rounded-r-lg">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize"
                    :class="u(row).status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-red-500/10 text-red-500'"
                  >
                    {{ u(row).status }}
                  </span>
                </TableCell>

                <!-- Actions dropdown -->
                <TableCell class="px-4 py-4 text-center first:rounded-l-lg last:rounded-r-lg w-16">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="icon" class="h-8 w-8 rounded-lg hover:bg-muted">
                        <HugeiconsIcon :icon="MoreHorizontalIcon" :size="18" class="text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" class="w-44">
                      <DropdownMenuItem
                        @click="router.push({ name: 'admin-users-show', params: { id: String(u(row).id) } })"
                      >
                        <HugeiconsIcon :icon="ViewIcon" :size="16" />
                        {{ t('actions.view') }}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        @click="handleToggleStatus(u(row))"
                      >
                        <HugeiconsIcon :icon="Cancel01Icon" :size="16" />
                        {{ u(row).status === 'active' ? t('users.actions.suspend') : t('users.actions.activate') }}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        @click="handleDelete(u(row).id)"
                      >
                        <HugeiconsIcon :icon="Delete02Icon" :size="16" />
                        {{ t('actions.delete') }}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </template>
          </DataTable>
        </TabsContent>

        <!-- Pending Invitations Tab -->
        <TabsContent value="invitations" class="mt-4">
          <div v-if="invitations.length === 0" class="flex flex-col items-center justify-center py-16 text-muted-foreground/60">
            <p class="text-sm">{{ t('users.no_pending_invitations') }}</p>
          </div>
          <div v-else class="overflow-x-hidden overflow-y-auto">
            <table class="w-full border-separate border-spacing-y-2">
              <thead>
                <tr class="border-none bg-muted/30 rounded-lg">
                  <th class="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('users.fields.email') }}</th>
                  <th class="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('users.fields.name') }}</th>
                  <th class="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('users.fields.role') }}</th>
                  <th class="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('users.fields.hotel') }}</th>
                  <th class="px-4 py-3 text-center text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('users.fields.status') }}</th>
                  <th class="px-4 py-3 text-center text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg w-16" />
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="inv in invitations"
                  :key="`inv-${inv.id}`"
                  class="bg-card hover:bg-muted/50 transition-colors"
                >
                  <td class="px-4 py-4 text-left first:rounded-l-lg last:rounded-r-lg">
                    <span class="font-medium text-sm text-foreground">{{ inv.email }}</span>
                  </td>
                  <td class="px-4 py-4 text-left first:rounded-l-lg last:rounded-r-lg">
                    <span class="text-sm text-muted-foreground">{{ inv.name || '—' }}</span>
                  </td>
                  <td class="px-4 py-4 text-left first:rounded-l-lg last:rounded-r-lg">
                    <span class="text-sm text-muted-foreground">{{ inv.role?.name || '—' }}</span>
                  </td>
                  <td class="px-4 py-4 text-left first:rounded-l-lg last:rounded-r-lg">
                    <span class="text-sm text-muted-foreground">{{ inv.hotel_name || '—' }}</span>
                  </td>
                  <td class="px-4 py-4 text-center first:rounded-l-lg last:rounded-r-lg">
                    <span class="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-500">
                      {{ t('users.status.invited') }}
                    </span>
                  </td>
                  <td class="px-4 py-4 text-center first:rounded-l-lg last:rounded-r-lg w-16">
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="icon" class="h-8 w-8 rounded-lg hover:bg-muted">
                          <HugeiconsIcon :icon="MoreHorizontalIcon" :size="18" class="text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" class="w-44">
                        <DropdownMenuItem @click="handleResendInvitation(inv)">
                          <HugeiconsIcon :icon="MailSend01Icon" :size="16" />
                          {{ t('users.actions.resend') }}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmModal
        :show="confirmState.show"
        :title="confirmState.title"
        :message="confirmState.message"
        :variant="confirmState.variant"
        @confirm="confirmState.callback?.()"
        @cancel="cancel"
      />
    </div>
  </ModularView>
</template>

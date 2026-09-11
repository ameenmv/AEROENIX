const fs = require('fs')
const path = 'src/views/admin/users/IndexView.vue'
let content = fs.readFileSync(path, 'utf8')

// Add columns definition
content = content.replace(
  'const invitations = ref<HotelInvitation[]>([])',
  'const invitations = ref<HotelInvitation[]>([])\n\nconst columns = [\n  { key: "name", label: "users.fields.name" },\n  { key: "email", label: "users.fields.email" },\n  { key: "role", label: "users.fields.role" },\n  { key: "hotel_name", label: "users.fields.hotel" },\n  { key: "status", label: "users.fields.status", className: "text-center" },\n]'
)

// Replace the <DataTable> block
const oldDataTableBlock = `<DataTable
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
          </DataTable>`

const newDataTableBlock = `<DataTable
            :data="table.items.value as any"
            :columns="columns"
            :loading="table.loading.value"
            :total-items="table.totalItems.value"
            :page="table.page.value"
            :per-page="table.perPage.value"
            server-side
            searchable
            modern-search
            transparent-container
            separated-records
            @update:page="table.goToPage"
            @update:per-page="table.setPerPage"
            @update:search="table.setSearchQuery"
            @sort="table.setSorting"
          >
            <template #name="{ row, value }">
              <span class="font-medium text-foreground">{{ value }}</span>
            </template>
            <template #email="{ row, value }">
              <span class="text-muted-foreground text-sm">{{ value }}</span>
            </template>
            <template #role="{ row }">
              <span v-if="u(row).role" class="text-sm">{{ u(row).role?.name }}</span>
              <span v-else class="text-xs text-muted-foreground/50">—</span>
            </template>
            <template #hotel_name="{ row, value }">
              <span class="text-sm">{{ value || '—' }}</span>
            </template>
            <template #status="{ row, value }">
              <div class="w-full flex justify-center">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize"
                  :class="value === 'active'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-red-500/10 text-red-500'"
                >
                  {{ value }}
                </span>
              </div>
            </template>
            <template #actions="{ row }">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon" class="h-8 w-8 rounded-lg hover:bg-muted">
                    <HugeiconsIcon :icon="MoreHorizontalIcon" :size="18" class="text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-44">
                  <DropdownMenuItem @click="router.push({ name: 'admin-users-show', params: { id: String(u(row).id) } })">
                    <HugeiconsIcon :icon="ViewIcon" :size="16" />
                    {{ t('actions.view') }}
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleToggleStatus(u(row))">
                    <HugeiconsIcon :icon="Cancel01Icon" :size="16" />
                    {{ u(row).status === 'active' ? t('users.actions.suspend') : t('users.actions.activate') }}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" @click="handleDelete(u(row).id)">
                    <HugeiconsIcon :icon="Delete02Icon" :size="16" />
                    {{ t('actions.delete') }}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </template>
          </DataTable>`

content = content.replace(oldDataTableBlock, newDataTableBlock)

fs.writeFileSync(path, content)

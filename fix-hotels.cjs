const fs = require('fs')

const path = 'src/views/admin/hotels/IndexView.vue'
let content = fs.readFileSync(path, 'utf8')

// Remove TableCell, TableHead, TableRow import
content = content.replace(
  "import { TableCell, TableHead, TableRow } from '@/components/uic/table'",
  ""
)

// Add columns
content = content.replace(
  'function h(row: any): Hotel {',
  `const columns = [
  { key: 'name', label: 'hotels.fields.name' },
  { key: 'address', label: 'hotels.fields.address' },
  { key: 'staff_count', label: 'hotels.fields.staff_count', className: 'text-center' },
  { key: 'status', label: 'hotels.fields.status', className: 'text-center' },
  { key: 'actions', label: 'actions.title', className: 'text-right' },
]

function h(row: any): Hotel {`
)

const oldTableBlock = `<DataTable
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
            <TableHead class="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('hotels.fields.name') }}</TableHead>
            <TableHead class="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('hotels.fields.address') }}</TableHead>
            <TableHead class="px-4 py-3 text-center text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('hotels.fields.staff_count') }}</TableHead>
            <TableHead class="px-4 py-3 text-center text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('hotels.fields.status') }}</TableHead>
            <TableHead class="px-4 py-3 text-right text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">{{ t('actions.title', 'Actions') }}</TableHead>
          </TableRow>
        </template>

        <template #row="{ row }">
          <TableRow
            class="bg-card border-none hover:bg-muted/50 transition-colors cursor-pointer"
            @click="router.push({ name: 'admin-hotels-show', params: { id: h(row).id } })"
          >
            <TableCell class="px-4 py-4 text-left first:rounded-l-lg last:rounded-r-lg">
              <span class="font-medium text-foreground">{{ h(row).name }}</span>
            </TableCell>
            <TableCell class="px-4 py-4 text-left first:rounded-l-lg last:rounded-r-lg">
              <span class="text-muted-foreground text-sm">{{ h(row).address || '—' }}</span>
            </TableCell>
            <TableCell class="px-4 py-4 text-center first:rounded-l-lg last:rounded-r-lg">
              <span class="text-sm tabular-nums">{{ h(row).staff_count ?? 0 }}</span>
            </TableCell>
            <TableCell class="px-4 py-4 text-center first:rounded-l-lg last:rounded-r-lg">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize"
                :class="h(row).status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-amber-500/10 text-amber-500'"
              >
                {{ h(row).status }}
              </span>
            </TableCell>
            <TableCell class="px-4 py-4 text-right first:rounded-l-lg last:rounded-r-lg" @click.stop>
              <div class="flex items-center justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button size="sm" variant="ghost" class="h-8 w-8 p-0">
                      <HugeiconsIcon :icon="MoreVerticalIcon" :size="16" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-40">
                    <DropdownMenuItem @click="router.push({ name: 'admin-hotels-show', params: { id: h(row).id } })">
                      <HugeiconsIcon :icon="ViewIcon" :size="14" class="mr-2 text-muted-foreground" />
                      {{ t('actions.view', 'View') }}
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="router.push({ name: 'admin-hotels-edit', params: { id: h(row).id } })">
                      <HugeiconsIcon :icon="Edit02Icon" :size="14" class="mr-2 text-muted-foreground" />
                      {{ t('actions.edit', 'Edit') }}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem class="text-red-500 focus:text-red-500" @click="handleDelete(h(row))">
                      <HugeiconsIcon :icon="Delete02Icon" :size="14" class="mr-2" />
                      {{ t('actions.delete', 'Delete') }}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        </template>
      </DataTable>`

const newTableBlock = `<DataTable
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
          <div class="cursor-pointer" @click="router.push({ name: 'admin-hotels-show', params: { id: h(row).id } })">
            <span class="font-medium text-foreground">{{ value }}</span>
          </div>
        </template>
        <template #address="{ row, value }">
          <div class="cursor-pointer" @click="router.push({ name: 'admin-hotels-show', params: { id: h(row).id } })">
            <span class="text-muted-foreground text-sm">{{ value || '—' }}</span>
          </div>
        </template>
        <template #staff_count="{ row, value }">
          <div class="cursor-pointer w-full text-center" @click="router.push({ name: 'admin-hotels-show', params: { id: h(row).id } })">
            <span class="text-sm tabular-nums">{{ value ?? 0 }}</span>
          </div>
        </template>
        <template #status="{ row, value }">
          <div class="cursor-pointer w-full flex justify-center" @click="router.push({ name: 'admin-hotels-show', params: { id: h(row).id } })">
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize"
              :class="value === 'active'
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-amber-500/10 text-amber-500'"
            >
              {{ value }}
            </span>
          </div>
        </template>
        <template #actions="{ row }">
          <div class="flex items-center justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button size="sm" variant="ghost" class="h-8 w-8 p-0">
                  <HugeiconsIcon :icon="MoreVerticalIcon" :size="16" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-40">
                <DropdownMenuItem @click="router.push({ name: 'admin-hotels-show', params: { id: h(row).id } })">
                  <HugeiconsIcon :icon="ViewIcon" :size="14" class="mr-2 text-muted-foreground" />
                  {{ t('actions.view', 'View') }}
                </DropdownMenuItem>
                <DropdownMenuItem @click="router.push({ name: 'admin-hotels-edit', params: { id: h(row).id } })">
                  <HugeiconsIcon :icon="Edit02Icon" :size="14" class="mr-2 text-muted-foreground" />
                  {{ t('actions.edit', 'Edit') }}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="text-red-500 focus:text-red-500" @click="handleDelete(h(row))">
                  <HugeiconsIcon :icon="Delete02Icon" :size="14" class="mr-2" />
                  {{ t('actions.delete', 'Delete') }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </template>
      </DataTable>`

content = content.replace(oldTableBlock, newTableBlock)
// Fix unused `row` variable in destructuring
content = content.replace('<template #name="{ row, value }">', '<template #name="{ row, value }">')

fs.writeFileSync(path, content)

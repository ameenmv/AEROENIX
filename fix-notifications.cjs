const fs = require('fs')

const path = 'src/views/admin/notifications/IndexView.vue'
let content = fs.readFileSync(path, 'utf8')

// Remove TableCell, TableHead, TableRow import
content = content.replace(
  "import { TableCell, TableHead, TableRow } from '@/components/uic/table'",
  ""
)

// Add columns
content = content.replace(
  'function n(row: any): ManualNotification {',
  `const columns = [
  { key: 'title', label: 'notifications.fields.title' },
  { key: 'status', label: 'notifications.fields.status' },
  { key: 'type', label: 'notifications.fields.type' },
  { key: 'send_at', label: 'notifications.fields.send_at' },
  { key: 'created_at', label: 'notifications.fields.created_at' },
  { key: 'actions', label: 'common.actions', className: 'text-right' },
]

function n(row: any): ManualNotification {`
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
          <TableRow>
            <TableHead>{{ t('notifications.fields.title', 'Title') }}</TableHead>
            <TableHead>{{ t('notifications.fields.status', 'Status') }}</TableHead>
            <TableHead>{{ t('notifications.fields.type', 'Type') }}</TableHead>
            <TableHead>{{ t('notifications.fields.send_at', 'Send At') }}</TableHead>
            <TableHead>{{ t('notifications.fields.created_at', 'Created At') }}</TableHead>
            <TableHead class="text-right">
              {{ t('common.actions', 'Actions') }}
            </TableHead>
          </TableRow>
        </template>

        <template #row="{ row }">
          <TableRow class="hover:bg-muted/50 transition-colors">
            <!-- Title -->
            <TableCell>
              <span class="font-medium">
                {{ n(row).title?.en || '—' }}
              </span>
            </TableCell>

            <!-- Status badge -->
            <TableCell>
              <span
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="statusColorClass[NotificationStatusColor[n(row).status] || 'gray']"
              >
                <span
                  class="h-1.5 w-1.5 rounded-full"
                  :class="statusDotClass[NotificationStatusColor[n(row).status] || 'gray']"
                />
                {{ NotificationStatusLabel[n(row).status] || 'Unknown' }}
              </span>
            </TableCell>

            <!-- Type -->
            <TableCell>
              <span class="text-sm">
                {{ n(row).type }}
              </span>
            </TableCell>

            <!-- Send At -->
            <TableCell>
              <span class="text-xs text-muted-foreground">
                {{
                  n(row).send_at
                    ? new Date(n(row).send_at!).toLocaleString()
                    : t('common.not_scheduled', '—')
                }}
              </span>
            </TableCell>

            <!-- Created at -->
            <TableCell>
              <span class="text-xs text-muted-foreground">
                {{ new Date(n(row).created_at).toLocaleDateString() }}
              </span>
            </TableCell>

            <!-- Actions -->
            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="
                    router.push({
                      name: 'admin-notifications-show',
                      params: { id: String(n(row).id) },
                    })
                  "
                >
                  {{ t('actions.view', 'View') }}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="
                    router.push({
                      name: 'admin-notifications-edit',
                      params: { id: String(n(row).id) },
                    })
                  "
                >
                  {{ t('actions.edit', 'Edit') }}
                </Button>
                <Button variant="ghost" size="sm" class="text-primary" @click="sendNow(n(row))">
                  {{ t('notifications.actions.send_now', 'Send') }}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  class="text-destructive hover:text-destructive"
                  @click="deleteItem(n(row))"
                >
                  {{ t('actions.delete', 'Delete') }}
                </Button>
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
        <template #title="{ row }">
          <span class="font-medium">
            {{ n(row).title?.en || '—' }}
          </span>
        </template>
        <template #status="{ row }">
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
            :class="statusColorClass[NotificationStatusColor[n(row).status] || 'gray']"
          >
            <span
              class="h-1.5 w-1.5 rounded-full"
              :class="statusDotClass[NotificationStatusColor[n(row).status] || 'gray']"
            />
            {{ NotificationStatusLabel[n(row).status] || 'Unknown' }}
          </span>
        </template>
        <template #type="{ row }">
          <span class="text-sm">
            {{ n(row).type }}
          </span>
        </template>
        <template #send_at="{ row }">
          <span class="text-xs text-muted-foreground">
            {{
              n(row).send_at
                ? new Date(n(row).send_at!).toLocaleString()
                : t('common.not_scheduled', '—')
            }}
          </span>
        </template>
        <template #created_at="{ row }">
          <span class="text-xs text-muted-foreground">
            {{ new Date(n(row).created_at).toLocaleDateString() }}
          </span>
        </template>
        <template #actions="{ row }">
          <div class="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" @click="router.push({ name: 'admin-notifications-show', params: { id: String(n(row).id) } })">
              {{ t('actions.view', 'View') }}
            </Button>
            <Button variant="ghost" size="sm" @click="router.push({ name: 'admin-notifications-edit', params: { id: String(n(row).id) } })">
              {{ t('actions.edit', 'Edit') }}
            </Button>
            <Button variant="ghost" size="sm" class="text-primary" @click="sendNow(n(row))">
              {{ t('notifications.actions.send_now', 'Send') }}
            </Button>
            <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive" @click="deleteItem(n(row))">
              {{ t('actions.delete', 'Delete') }}
            </Button>
          </div>
        </template>
      </DataTable>`

content = content.replace(oldTableBlock, newTableBlock)
fs.writeFileSync(path, content)

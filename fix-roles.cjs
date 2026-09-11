const fs = require('fs')

const path = 'src/views/admin/roles/IndexView.vue'
let content = fs.readFileSync(path, 'utf8')

// Add DataTable import
content = content.replace(
  "import { Badge } from '@/components/uic/badge'",
  "import { Badge } from '@/components/uic/badge'\nimport { DataTable } from '@/components/ui/tables'"
)

// Add columns
content = content.replace(
  'const { roles, isLoading, isFetching } = useRoles()',
  `const { roles, isLoading, isFetching } = useRoles()

const columns = [
  { key: 'name', label: 'roles.fields.name' },
  { key: 'scope', label: 'roles.fields.scope' },
  { key: 'permissions', label: 'roles.fields.permissions_count', className: 'text-center' },
  { key: 'actions', label: '', className: 'text-right w-16' },
]`
)

const oldTableStart = `      <!-- Loading State Skeleton -->`
const oldTableEnd = `      <!-- Empty State -->`

const startIndex = content.indexOf(oldTableStart)
const endIndex = content.indexOf(oldTableEnd)
const oldBlock = content.slice(startIndex, endIndex)

const newTableBlock = `      <!-- Roles List -->
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
        <template #name="{ row, value }">
          <span class="font-medium text-sm text-foreground">{{ value }}</span>
        </template>
        <template #scope="{ row, value }">
          <Badge :variant="value === 'platform' ? 'default' : 'secondary'" class="capitalize text-[10px]">
            {{ value }}
          </Badge>
        </template>
        <template #permissions="{ row, value }">
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

`
content = content.replace(oldBlock, newTableBlock)
fs.writeFileSync(path, content)

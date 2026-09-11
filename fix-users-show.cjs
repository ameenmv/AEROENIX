const fs = require('fs')

const path = 'src/views/admin/users/ShowView.vue'
let content = fs.readFileSync(path, 'utf8')

// Remove TableCell, TableHead, TableRow import
content = content.replace(
  "import { TableCell, TableHead, TableRow } from '@/components/uic/table'",
  ""
)

// Add columns
content = content.replace(
  'function getFields(user: User): DetailField[] {',
  `const columns = [
  { key: 'description', label: 'common.description' },
  { key: 'created_at', label: 'common.timestamp', className: 'text-right' },
]

function getFields(user: User): DetailField[] {`
)

const oldTableBlock = `<DataTable
              :data="(item.activity_log || []) as any"
              :loading="false"
              :total-items="(item.activity_log || []).length"
            >
              <template #header>
                <TableRow class="border-none hover:bg-transparent bg-muted/30">
                  <TableHead class="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">
                    {{ t('common.description', 'Description') }}
                  </TableHead>
                  <TableHead class="px-4 py-3 text-right text-[11px] uppercase tracking-widest font-medium text-muted-foreground/70 first:rounded-l-lg last:rounded-r-lg">
                    {{ t('common.timestamp', 'Timestamp') }}
                  </TableHead>
                </TableRow>
              </template>
              <template #row="{ row }">
                <TableRow class="bg-card border-none hover:bg-muted/50 transition-colors">
                  <TableCell class="px-4 py-4 text-left text-sm first:rounded-l-lg last:rounded-r-lg">
                    {{ (row as any).description }}
                  </TableCell>
                  <TableCell class="px-4 py-4 text-right text-xs text-muted-foreground whitespace-nowrap first:rounded-l-lg last:rounded-r-lg">
                    {{ new Date((row as any).created_at).toLocaleString() }}
                  </TableCell>
                </TableRow>
              </template>
            </DataTable>`

const newTableBlock = `<DataTable
              :data="(item.activity_log || []) as any"
              :columns="columns"
              :loading="false"
              :total-items="(item.activity_log || []).length"
              transparent-container
              separated-records
            >
              <template #description="{ row, value }">
                <span class="text-sm">{{ value }}</span>
              </template>
              <template #created_at="{ row, value }">
                <div class="text-right w-full">
                  <span class="text-xs text-muted-foreground whitespace-nowrap">{{ new Date(value as string).toLocaleString() }}</span>
                </div>
              </template>
            </DataTable>`

content = content.replace(oldTableBlock, newTableBlock)
content = content.replace('<template #description="{ row, value }">', '<template #description="{ value }">')
content = content.replace('<template #created_at="{ row, value }">', '<template #created_at="{ value }">')

fs.writeFileSync(path, content)

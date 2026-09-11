const fs = require('fs')

const path = 'src/views/admin/bookings/IndexView.vue'
let content = fs.readFileSync(path, 'utf8')

// Replace old imports with new DataTable
content = content.replace(
  "import { Button } from '@/components/uic/button'",
  "import { Button } from '@/components/uic/button'\nimport { DataTable } from '@/components/ui/tables'"
)
content = content.replace(
  "import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/uic/table'",
  ""
)

// Add columns
content = content.replace(
  'const { t } = useI18n()',
  `const { t } = useI18n()
  
const columns = [
  { key: 'booking_reference', label: 'bookings.reference', className: 'font-semibold' },
  { key: 'guest', label: 'bookings.guest', className: 'font-semibold' },
  { key: 'hotel', label: 'bookings.hotel', className: 'font-semibold' },
  { key: 'dates', label: 'bookings.dates', className: 'font-semibold' },
  { key: 'total', label: 'bookings.total', className: 'font-semibold text-right' },
  { key: 'status', label: 'bookings.status', className: 'font-semibold text-center' },
  { key: 'actions', label: '', className: 'w-[80px]' },
]`
)

const oldFiltersStart = `    <!-- Filters and Search -->`
const oldTableEnd = `      </Table>\n    </div>`

const startIndex = content.indexOf(oldFiltersStart)
const endIndex = content.indexOf(oldTableEnd) + oldTableEnd.length
const oldBlock = content.slice(startIndex, endIndex)

const newTableBlock = `    <!-- Filters and Search -->
    <div class="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border/50">
      <div class="relative w-full sm:max-w-xs">
        <HugeiconsIcon :icon="Search01Icon" :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="search" :placeholder="t('bookings.search', 'Search bookings...')" class="pl-9 w-full bg-background" />
      </div>
      
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <!-- Simple Status Filter -->
        <select v-model="filters.status" class="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option :value="null">{{ t('bookings.all_statuses', 'All Statuses') }}</option>
          <option value="pending">{{ t('bookings.pending', 'Pending') }}</option>
          <option value="confirmed">{{ t('bookings.confirmed', 'Confirmed') }}</option>
          <option value="rejected">{{ t('bookings.rejected', 'Rejected') }}</option>
        </select>
      </div>
    </div>

    <!-- Data Table -->
    <div class="mt-4">
      <DataTable
        :data="(data?.data || []) as any[]"
        :columns="columns"
        :loading="isLoading"
        transparent-container
        separated-records
      >
        <template #booking_reference="{ row, value }">
          <div class="cursor-pointer" @click="router.push({ name: 'admin-bookings-show', params: { id: (row as any).id } })">
            <span class="font-medium text-primary">{{ value }}</span>
          </div>
        </template>
        <template #guest="{ row }">
          <div class="cursor-pointer" @click="router.push({ name: 'admin-bookings-show', params: { id: (row as any).id } })">
            <div class="font-semibold">{{ (row as any).guest.name }}</div>
            <div class="text-xs text-muted-foreground">{{ (row as any).guest.phone || (row as any).guest.email }}</div>
          </div>
        </template>
        <template #hotel="{ row }">
          <div class="cursor-pointer" @click="router.push({ name: 'admin-bookings-show', params: { id: (row as any).id } })">
            <div class="text-sm font-medium">{{ (row as any).hotel_name || t('common.na', 'N/A') }}</div>
            <div class="text-xs text-muted-foreground">{{ (row as any).room.name }} (x{{ (row as any).room.rooms_count }})</div>
          </div>
        </template>
        <template #dates="{ row }">
          <div class="cursor-pointer" @click="router.push({ name: 'admin-bookings-show', params: { id: (row as any).id } })">
            <div class="text-sm flex items-center gap-1.5">
              <HugeiconsIcon :icon="Calendar01Icon" :size="14" class="text-muted-foreground" />
              <span v-if="(row as any).check_in_date && (row as any).check_out_date">
                {{ new Date((row as any).check_in_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }}
                &rarr;
                {{ new Date((row as any).check_out_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }}
              </span>
              <span v-else>—</span>
            </div>
            <div class="text-xs text-muted-foreground mt-0.5">{{ (row as any).nights_count }} {{ t('bookings.nights', 'nights') }}</div>
          </div>
        </template>
        <template #total="{ row }">
          <div class="cursor-pointer w-full text-right font-medium" @click="router.push({ name: 'admin-bookings-show', params: { id: (row as any).id } })">
            {{ (row as any).price }}
          </div>
        </template>
        <template #status="{ row }">
          <div class="cursor-pointer w-full text-center" @click="router.push({ name: 'admin-bookings-show', params: { id: (row as any).id } })">
            <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border', getStatusColor((row as any).status)]">
              {{ (row as any).status_label }}
            </span>
          </div>
        </template>
        <template #actions="{ row }">
          <div class="w-full flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <HugeiconsIcon :icon="MoreVerticalIcon" :size="16" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="router.push({ name: 'admin-bookings-show', params: { id: (row as any).id } })">
                  <HugeiconsIcon :icon="EyeIcon" :size="14" class="mr-2" />
                  {{ t('actions.view', 'View') }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </template>
        <template #empty>
          <div class="flex flex-col items-center justify-center gap-2 py-10">
            <HugeiconsIcon :icon="NoteIcon" :size="32" class="opacity-20" />
            <p class="text-muted-foreground">{{ t('bookings.no_bookings', 'No bookings found.') }}</p>
          </div>
        </template>
      </DataTable>
    </div>`

content = content.replace(oldBlock, newTableBlock)

// Fix multiple occurrences of import if they exist
content = content.replace("import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/uic/table'", "")

fs.writeFileSync(path, content)

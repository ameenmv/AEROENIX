const fs = require('fs')

const path = 'src/views/admin/cms/BuilderIndexView.vue'
let content = fs.readFileSync(path, 'utf8')

// Remove TableCell, TableHead, TableRow import
content = content.replace(
  "import { TableCell, TableHead, TableRow } from '@/components/uic/table'",
  ""
)

// Add columns
content = content.replace(
  'const table = useTable<CmsPage>({',
  `const columns = [
  { key: 'id', label: 'common.id', className: 'w-16' },
  { key: 'title', label: 'cms.page_name' },
  { key: 'slug', label: 'cms.slug' },
  { key: 'sections_count', label: 'cms.sections_count' },
  { key: 'status', label: 'common.status', className: 'text-center' },
  { key: 'updated_at', label: 'cms.updated' },
  { key: 'actions', label: 'actions.title', className: 'text-center' },
]

const table = useTable<CmsPage>({`
)

const oldTableBlockStart = `      <DataTable`
const oldTableBlockEnd = `      </DataTable>`

// Using replace to cut the chunk precisely
const startIndex = content.indexOf(oldTableBlockStart)
const endIndex = content.indexOf(oldTableBlockEnd) + oldTableBlockEnd.length
const oldBlock = content.slice(startIndex, endIndex)

const newTableBlock = `      <DataTable
        :data="table.items.value as unknown as Record<string, unknown>[]"
        :columns="columns"
        :loading="table.loading.value"
        searchable
        server-side
        modern-search
        transparent-container
        separated-records
        :total-items="table.totalItems.value"
        :page="table.page.value"
        :per-page="table.perPage.value"
        :context-menu-actions="contextMenuActions"
        @update:page="table.goToPage"
        @update:per-page="table.setPerPage"
        @update:search="table.setSearchQuery"
      >
        <template #id="{ row }">
          <span class="text-xs text-muted-foreground font-mono">#{{ (row as any).id }}</span>
        </template>
        <template #title="{ row }">
          <span class="font-medium text-foreground">{{ localized((row as any).title) }}</span>
        </template>
        <template #slug="{ row }">
          <code class="text-xs px-2 py-1 rounded bg-muted text-muted-foreground font-mono">
            /{{ localized((row as any).slug) }}
          </code>
        </template>
        <template #sections_count="{ row }">
          <Badge variant="secondary" class="text-xs">
            {{ (row as any).sections_count ?? ((row as any).sections || []).length ?? 0 }}
          </Badge>
        </template>
        <template #status="{ row }">
          <div class="text-center w-full flex justify-center" @click.stop>
            <button
              class="inline-flex items-center justify-center gap-2 group/toggle mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              :title="
                (row as any).can_toggle === false
                  ? $t('common.action_restricted', 'Action restricted')
                  : ''
              "
              :disabled="publishing === (row as any).id || (row as any).can_toggle === false"
              @click="handleTogglePublish(row as any)"
            >
              <span
                class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border shadow-inner transition-colors"
                :class="[
                  isPublished(row)
                    ? 'bg-primary border-primary'
                    : 'bg-muted border-border dark:bg-input/80 dark:border-transparent',
                  publishing === (row as any).id
                    ? 'opacity-50 animate-pulse'
                    : 'group-hover/toggle:opacity-80',
                ]"
              >
                <span
                  class="pointer-events-none block size-4 rounded-full bg-white dark:bg-background shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-transform ring-1 ring-black/5"
                  :class="[
                    isPublished(row)
                      ? locale === 'ar'
                        ? '-translate-x-[calc(100%-2px)]'
                        : 'translate-x-[calc(100%-2px)]'
                      : 'translate-x-0',
                  ]"
                />
              </span>
              <span class="text-xs text-muted-foreground">
                {{
                  isPublished(row)
                    ? $t('common.published', 'Published')
                    : $t('common.draft', 'Draft')
                }}
              </span>
            </button>
          </div>
        </template>
        <template #updated_at="{ row }">
          <span class="text-sm text-muted-foreground whitespace-nowrap">
            {{ formatDate((row as any).updated_at || (row as any).updatedAt) }}
          </span>
        </template>
        <template #actions="{ row }">
          <div class="flex items-center justify-center gap-1">
            <button
              :title="
                (row as any).can_update === false
                  ? $t('common.action_restricted', 'Action restricted')
                  : $t('cms.edit_content', 'Edit Content')
              "
              class="w-8 h-8 flex items-center justify-center rounded-full text-primary/70 hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              :disabled="(row as any).can_update === false"
              @click="handleEditContent(row as any)"
            >
              <HugeiconsIcon :icon="ViewIcon" :size="16" :stroke-width="2" />
            </button>
            <button
              :title="
                (row as any).can_update === false
                  ? $t('common.action_restricted', 'Action restricted')
                  : $t('cms.edit_structure', 'Edit Structure')
              "
              class="w-8 h-8 flex items-center justify-center rounded-full text-foreground/50 hover:bg-accent hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              :disabled="(row as any).can_update === false"
              @click="handleEditStructure(row as any)"
            >
              <HugeiconsIcon :icon="Edit02Icon" :size="16" :stroke-width="2" />
            </button>
            <button
              :title="
                (row as any).can_update === false
                  ? $t('common.action_restricted', 'Action restricted')
                  : $t('cms.duplicate_page', 'Duplicate')
              "
              class="w-8 h-8 flex items-center justify-center rounded-full text-foreground/50 hover:bg-accent hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              :class="
                duplicating === (row as any).id
                  ? 'opacity-50 animate-pulse pointer-events-none'
                  : ''
              "
              :disabled="(row as any).can_update === false"
              @click="handleDuplicate(row as any)"
            >
              <HugeiconsIcon :icon="Copy01Icon" :size="16" :stroke-width="2" />
            </button>
            <button
              :title="
                (row as any).can_delete === false
                  ? $t('common.action_restricted', 'Action restricted')
                  : $t('actions.delete')
              "
              class="w-8 h-8 flex items-center justify-center rounded-full text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              :disabled="(row as any).can_delete === false"
              @click="handleDelete(row as any)"
            >
              <HugeiconsIcon :icon="Delete01Icon" :size="16" :stroke-width="2" />
            </button>
          </div>
        </template>
      </DataTable>`

content = content.replace(oldBlock, newTableBlock)
fs.writeFileSync(path, content)

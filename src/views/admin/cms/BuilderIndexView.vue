<script setup lang="ts">
import type { CmsPage } from '@/types/cms'
import {
  Copy01Icon,
  Delete01Icon,
  Edit02Icon,
  LayoutLeftIcon,
  LibrariesIcon,
  PlusSignIcon,
  ToggleOnIcon,
  ViewIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import ModularView from '@/components/admin/ModularView.vue'

import ConfirmModal from '@/components/ui/modals/ConfirmModal.vue'
import DataTable from '@/components/ui/tables/DataTable.vue'
import { Badge } from '@/components/uic/badge'
import { Button } from '@/components/uic/button'
import { SelectField } from '@/components/uic/select'
import { TableCell, TableHead, TableRow } from '@/components/uic/table'
import { useTable } from '@/composables/shared/useTable'
import { cmsPageService } from '@/services/cmsService'

const router = useRouter()
const { t, locale } = useI18n()

/** Get the translated value from a bilingual object based on current locale */
function localized(val: any): string {
  if (typeof val === 'string')
    return val
  if (!val)
    return '-'
  return val[locale.value] || val.en || val.ar || '-'
}
const publishing = ref<number | null>(null)
const duplicating = ref<number | null>(null)

// ── Filter state ──────────────────────────────────────────────────────────────
const selectedStatus = ref<string | null>(null)
const dateFrom = ref('')
const dateTo = ref('')

// ── Table ─────────────────────────────────────────────────────────────────────
const table = useTable<CmsPage>({
  fetchFn: async (params) => {
    const result = await cmsPageService.list(params)
    return { data: result.data, total: result.meta?.total ?? result.data.length }
  },
  deleteFn: (id: string | number) => cmsPageService.delete(id as number),
  resourceName: 'cms-pages',
  defaultPerPage: 10,
  defaultStatus: 'all',
  filterConfig: {
    resource: 'cms-pages',
    fields: [
      { key: 'status', label: 'common.status', type: 'select' },
      { key: 'from', label: 'common.from_date', type: 'date' },
      { key: 'to', label: 'common.to_date', type: 'date' },
    ],
  },
})

watch([selectedStatus, dateFrom, dateTo], () => applyFilters())

function applyFilters() {
  const filters: Record<string, unknown> = {}
  if (selectedStatus.value && selectedStatus.value !== 'all')
    filters.status = selectedStatus.value === 'published' ? 1 : 0
  if (dateFrom.value)
    filters.from = dateFrom.value
  if (dateTo.value)
    filters.to = dateTo.value
  table.setFilters(filters)
}

function clearAllFilters() {
  selectedStatus.value = null
  dateFrom.value = ''
  dateTo.value = ''
  table.clearFilters()
}

const hasFilters = computed(
  () =>
    !!(selectedStatus.value && selectedStatus.value !== 'all') || !!dateFrom.value || !!dateTo.value,
)

const statusOptions = computed(() => [
  { value: 'all', label: t('common.all', 'All') },
  { value: 'published', label: t('common.published', 'Published') },
  { value: 'draft', label: t('common.draft', 'Draft') },
])

// ── Navigation ────────────────────────────────────────────────────────────────
function handleCreate() {
  router.push({ name: 'admin-cms-create' })
}

function handleEditStructure(row: CmsPage) {
  router.push({ name: 'admin-cms-sections', params: { id: row.id } })
}

function handleEditContent(row: CmsPage) {
  router.push({ name: 'admin-cms-content', params: { id: row.id } })
}

function handleDelete(row: CmsPage) {
  table.deleteItem?.(row.id as any)
}

// ── Publish / Unpublish ───────────────────────────────────────────────────────
async function handleTogglePublish(row: CmsPage) {
  if (!row.id || publishing.value !== null)
    return
  publishing.value = row.id

  const isPublished = row.status === 1 || row.status === 'published'
  try {
    if (isPublished) {
      const updated = await cmsPageService.unpublish(row.id)
      toast.success(t('cms.unpublished_success', 'Page unpublished'))
      table.updateRow?.(row.id as number, (r: CmsPage) => ({ ...r, status: updated?.status ?? 0 }))
    }
    else {
      const updated = await cmsPageService.publish(row.id)
      toast.success(t('cms.published_success', 'Page published'))
      table.updateRow?.(row.id as number, (r: CmsPage) => ({ ...r, status: updated?.status ?? 1 }))
    }
    // Optimistic update: no table.refresh() to avoid loading spinner
  }
  catch (err: any) {
    toast.error('Error', {
      description: err.response?.data?.message || err.message || 'Failed to toggle publish',
    })
  }
  finally {
    publishing.value = null
  }
}

// ── Duplicate ─────────────────────────────────────────────────────────────────
async function handleDuplicate(row: CmsPage) {
  if (!row.id || duplicating.value !== null)
    return
  duplicating.value = row.id
  try {
    const duplicated = await cmsPageService.duplicate(row.id)
    toast.success(t('cms.duplicated_success', 'Page duplicated as draft'))
    table.refresh()
    // Optionally navigate to the duplicated page
    if (duplicated?.id) {
      router.push({ name: 'admin-cms-edit', params: { id: duplicated.id } })
    }
  }
  catch (err: any) {
    toast.error('Error', {
      description: err.response?.data?.message || err.message || 'Failed to duplicate page',
    })
  }
  finally {
    duplicating.value = null
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function isPublished(row: any): boolean {
  return row.status === 1 || row.status === 'published'
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr)
    return '-'
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr))
  }
  catch {
    return dateStr
  }
}

// ── Context menu ──────────────────────────────────────────────────────────────
const contextMenuActions = computed(() => {
  return [
    {
      label: t('cms.edit_content', 'Edit Content'),
      icon: ViewIcon,
      onClick: (row: any) => handleEditContent(row),
      disabled: (row: any) => row.can_update === false,
    },
    {
      label: t('cms.edit_structure', 'Edit Structure'),
      icon: Edit02Icon,
      onClick: (row: any) => handleEditStructure(row),
      disabled: (row: any) => row.can_update === false,
    },
    {
      label: t('cms.toggle_publish', 'Publish / Unpublish'),
      icon: ToggleOnIcon,
      onClick: (row: any) => handleTogglePublish(row),
      disabled: (row: any) => row.can_toggle === false,
    },
    {
      label: t('cms.duplicate_page', 'Duplicate'),
      icon: Copy01Icon,
      onClick: (row: any) => handleDuplicate(row),
      disabled: (row: any) => row.can_update === false,
    },
    {
      label: t('actions.delete', 'Delete'),
      icon: Delete01Icon,
      variant: 'delete' as const,
      separator: true,
      onClick: (row: any) => handleDelete(row),
      disabled: (row: any) => row.can_delete === false,
    },
  ]
})
</script>

<template>
  <ModularView>
    <div class="px-6 py-6 pb-20 sm:pb-6">
      <!-- Header -->
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <HugeiconsIcon :icon="LayoutLeftIcon" :size="20" class="text-primary" />
            </div>
            <div>
              <h1 class="text-2xl font-semibold text-foreground">
                {{ $t('cms.builder_title', 'CMS Page Builder') }}
              </h1>
              <p class="text-sm text-muted-foreground">
                {{
                  $t('cms.builder_subtitle', 'Create pages, define sections, and manage content')
                }}
              </p>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="outline" @click="router.push({ name: 'admin-cms-reusable' })">
            <HugeiconsIcon :icon="LibrariesIcon" :size="16" />
            {{ $t('cms.reusable_library', 'Reusable Library') }}
          </Button>
          <Button @click="handleCreate">
            <HugeiconsIcon :icon="PlusSignIcon" :size="16" />
            {{ $t('cms.new_page', 'New Page') }}
          </Button>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
        <!-- Status filter -->
        <div class="w-full sm:w-[180px]">
          <SelectField
            :model-value="selectedStatus || 'all'"
            :options="statusOptions"
            :label="$t('common.status', 'Status')"
            :placeholder="$t('common.all', 'All')"
            variant="filter"
            size="sm"
            @update:model-value="(v: any) => (selectedStatus = v)"
          />
        </div>

        <DatePickerFilter v-model="dateFrom" :label="$t('common.from_date', 'From')" />
        <DatePickerFilter v-model="dateTo" :label="$t('common.to_date', 'To')" />

        <!-- Clear filters -->
        <Transition name="fade">
          <div v-if="hasFilters" class="flex items-end">
            <button
              class="h-7 px-3 text-xs rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-1.5"
              @click="clearAllFilters"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              {{ $t('common.clear_filters', 'Clear Filters') }}
            </button>
          </div>
        </Transition>
      </div>

      <!-- Data Table -->
      <DataTable
        :data="table.items.value as unknown as Record<string, unknown>[]"
        :loading="table.loading.value"
        searchable
        server-side
        :total-items="table.totalItems.value"
        :page="table.page.value"
        :per-page="table.perPage.value"
        :context-menu-actions="contextMenuActions"
        @update:page="table.goToPage"
        @update:per-page="table.setPerPage"
        @update:search="table.setSearchQuery"
      >
        <template #header>
          <TableRow>
            <TableHead class="w-16">
              {{ $t('common.id', 'ID') }}
            </TableHead>
            <TableHead>{{ $t('cms.page_name', 'Page') }}</TableHead>
            <TableHead>{{ $t('cms.slug', 'Slug') }}</TableHead>
            <TableHead>{{ $t('cms.sections_count', 'Sections') }}</TableHead>
            <TableHead class="text-center">
              {{ $t('common.status', 'Status') }}
            </TableHead>
            <TableHead>{{ $t('cms.updated', 'Last Updated') }}</TableHead>
            <TableHead class="text-center">
              {{ $t('actions.title', 'Actions') }}
            </TableHead>
          </TableRow>
        </template>

        <template #row="{ row }">
          <TableRow
            class="hover:bg-muted/50 cursor-pointer border-b transition-colors border-none group"
          >
            <!-- ID -->
            <TableCell>
              <span class="text-xs text-muted-foreground font-mono">#{{ (row as any).id }}</span>
            </TableCell>

            <!-- Page Name (translated) -->
            <TableCell>
              <span class="font-medium text-foreground">{{ localized((row as any).title) }}</span>
            </TableCell>

            <!-- Slug (translated) -->
            <TableCell>
              <code class="text-xs px-2 py-1 rounded bg-muted text-muted-foreground font-mono">
                /{{ localized((row as any).slug) }}
              </code>
            </TableCell>

            <!-- Sections Count -->
            <TableCell>
              <Badge variant="secondary" class="text-xs">
                {{ (row as any).sections_count ?? ((row as any).sections || []).length ?? 0 }}
              </Badge>
            </TableCell>

            <!-- Status (toggle) -->
            <TableCell class="text-center" @click.stop>
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
                <!-- Custom toggle pill -->
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
            </TableCell>

            <!-- Updated -->
            <TableCell class="text-sm text-muted-foreground whitespace-nowrap">
              {{ formatDate((row as any).updated_at || (row as any).updatedAt) }}
            </TableCell>

            <!-- Actions -->
            <TableCell class="text-center">
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
            </TableCell>
          </TableRow>
        </template>
      </DataTable>
    </div>

    <ConfirmModal
      :show="table.confirmState?.value?.show ?? false"
      :title="table.confirmState?.value?.title ?? ''"
      :message="table.confirmState?.value?.message ?? ''"
      @confirm="table.confirmState?.value?.callback?.()"
      @cancel="table.cancelConfirm?.()"
    />
  </ModularView>
</template>

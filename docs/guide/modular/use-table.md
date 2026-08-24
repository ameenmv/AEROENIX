# useTable

`useTable` is a standalone composable that manages all state and actions required for rendering a robust data table, completely independent of UI rendering.

## Features
- **Data Fetching:** Automatic data fetching, caching, and invalidation powered by TanStack Query.
- **Pagination:** Handles page limits, current page, and prev/next logic.
- **Sorting & Search:** Reactive sorting parameters and global search input.
- **Filters:** Seamless integration with `useFilterStore` for complex filtering scenarios.
- **Row Selection:** Manage selected rows for bulk actions.
- **Delete with Confirmation:** Built-in delete with confirm dialog and auto-refresh.
- **Mock Data Handling:** First-class support for local mock data when APIs are unavailable.
- **Debounced Params:** Batches rapid reactive changes (mount-time bursts) into a single API request.
- **Fintech-Safe Caching:** `retry: false`, `gcTime: 30s`, `refetchOnWindowFocus: false` by default.

## Basic Usage

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTable } from '@/composables'
import { usersService } from '@/services/users'

const { t } = useI18n()

const table = useTable({
  fetchFn: (params) => usersService.list(params),
  resourceName: 'users',
  defaultPerPage: 15,
})
</script>

<template>
  <div>
    <!-- Search & Controls (You fully control these UI components!) -->
    <div class="controls">
      <input v-model="table.searchQuery.value" placeholder="Search..." />
      <button @click="table.refresh">Refresh</button>
    </div>

    <!-- The Table — use structural slots for full control -->
    <DataTable
      :data="table.items.value"
      :loading="table.loading.value"
      :server-side="true"
      :page="table.page.value"
      :per-page="table.perPage.value"
      :total-items="table.totalItems.value"
      @update:page="table.goToPage"
      @update:per-page="table.setPerPage"
      @update:search="table.setSearchQuery"
    >
      <template #header>
        <TableRow>
          <TableHead>{{ t('users.fields.name') }}</TableHead>
          <TableHead>{{ t('users.fields.email') }}</TableHead>
          <TableHead>{{ t('users.fields.role') }}</TableHead>
        </TableRow>
      </template>

      <template #row="{ row }">
        <TableRow>
          <TableCell>{{ row.name }}</TableCell>
          <TableCell>{{ row.email }}</TableCell>
          <TableCell>{{ row.role }}</TableCell>
        </TableRow>
      </template>
    </DataTable>
  </div>
</template>
```

## Delete Support

`useTable` has built-in delete with confirmation dialog. Just provide a `deleteFn`:

```ts
const table = useTable<User>({
  fetchFn: (params) => usersService.list(params),
  resourceName: 'users',

  // Enable built-in delete
  deleteFn: (id) => usersService.delete(id),
  deleteConfirmMessage: 'Are you sure you want to delete this user?',
})
```

Then in your template:

```vue
<template>
  <!-- Delete button in row actions -->
  <Button @click="table.deleteItem(row.id)">Delete</Button>

  <!-- Wire up the confirm dialog -->
  <ConfirmModal
    :show="table.confirmState.value.show"
    :title="table.confirmState.value.title"
    :message="table.confirmState.value.message"
    @confirm="table.confirmState.value.callback?.()"
    @cancel="table.cancelConfirm()"
  />
</template>
```

When `deleteItem(id)` is called:
1. A confirm dialog is shown
2. On confirm, the `deleteFn` is called
3. On success, a toast notification is shown and the table auto-refreshes
4. On error, an error toast is shown

## Advanced Configuration Options

```ts
const table = useTable<User>({
  // Required: Function to fetch data (e.g., from your service)
  fetchFn: async (params) => usersService.list(params),

  // Optional string to namespace cache and filters
  resourceName: 'users',

  // Optional: Custom TanStack query key (defaults to [resourceName])
  queryKey: ['custom', 'key'],

  // Filter configuration for advanced filter sheets
  filterConfig: usersConfig.filters,

  // Optional Data transform layer
  formatter: usersConfig.formatter,

  // Local fallback data
  mockData: mockUsersArray,

  // Pagination & Status defaults
  defaultPerPage: 20,
  defaultStatus: 'active',

  // Reactivity: Array of refs to watch; refetches on change
  watchKeys: [someExternalRef],

  // Callbacks
  onSuccess: (data) => console.log('Fetched:', data),
  onError: (error) => console.error('Failed:', error),

  // Refetch on window focus (default: false)
  // Set to true for real-time data (e.g., transactions, balances)
  refetchOnFocus: false,

  // Delete support (optional)
  deleteFn: (id) => usersService.delete(id),
  deleteConfirmMessage: 'Are you sure?',
})
```

## Performance Notes

`useTable` includes several performance optimizations out of the box:

| Setting | Default | Why |
|---------|---------|-----|
| `refDebounced(params, 150)` | Always on | Batches rapid mount-time param changes into 1 API call |
| `retry` | `false` | Failed list requests show error immediately, no silent retries |
| `gcTime` | `30_000` (30s) | Cached data cleared 30s after leaving page — safe for fintech |
| `staleTime` | `0` | Data always re-fetched on revisit (always fresh) |
| `refetchOnWindowFocus` | `false` | No auto-refetch on tab switch (opt-in via `refetchOnFocus: true`) |

## API Reference

### State & Data
- `items`: The final formatted items array.
- `rawItems`: The raw items returned directly from the API.
- `totalItems`: Total record count.
- `loading`: Boolean loading status.
- `error`: Error object or null.

### Pagination
- `page`, `perPage`
- `totalPages`, `hasNextPage`, `hasPrevPage`
- `goToPage(page)`, `nextPage()`, `prevPage()`, `setPerPage(count)`

### Sorting & Search
- `searchQuery`, `setSearchQuery(query)`
- `sortBy`, `sortOrder`, `setSorting(col, order)`, `toggleSort(col)`

### Filters
- `statusFilter`, `setStatusFilter(status)`
- `activeFilters`, `hasActiveFilters`, `activeFilterCount`
- `openFilterSheet()`, `closeFilterSheet()`, `clearFilters()`

### Selection
- `selectedItems`, `onSelectionChange(items)`, `clearSelection()`

### Delete
- `deleteItem(id)`: Show confirmation, delete via `deleteFn`, auto-refresh on success.
- `deleting`: Boolean indicating a delete operation is in progress.
- `confirmState`: Reactive state for wiring to a `<ConfirmModal>` component.
- `cancelConfirm()`: Close the confirm dialog.

### Core Utilities
- `refresh()`: Invalidate the query and trigger a fetch.
- `resetAll()`: Reset search, page, filters, and selection to defaults.

## Customizing Table Structure (Slots & Templates)

While `useTable` manages all the heavy logic and state, the `DataTable` component acts as the presentation layer. You **own the template** — use structural slots to render whatever HTML you want.

`DataTable` provides these structural slots:
- `#header`: Define the `<thead>` content.
- `#row="{ row }"`: Define the `<tr>` for each data row.

> [!TIP]
> For detailed snippet examples, refer to the [Customizing Components Guide](./components.md#slots).

### Full Example: Slot-Only Table

Use `useTable` for the data and structural slots for the HTML. Ensure you use the `t()` function for your table headers:

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTable } from '@/composables'
import { TableRow, TableCell, TableHead } from '@/components/uic/table'
import { postsService } from '@/services/posts'

const { t } = useI18n()

const table = useTable({
  fetchFn: (params) => postsService.list(params),
  resourceName: 'posts',
})
</script>

<template>
  <DataTable
    :data="table.items.value"
    :loading="table.loading.value"
  >
    <template #header>
      <TableRow class="bg-gray-50 dark:bg-gray-800">
        <TableHead>📝 {{ t('posts.fields.title') }}</TableHead>
        <TableHead>👤 {{ t('posts.fields.author') }}</TableHead>
        <TableHead class="text-right">{{ t('common.actions') }}</TableHead>
      </TableRow>
    </template>

    <template #row="{ row }">
      <TableRow class="hover:bg-muted/50 transition-colors">
        <TableCell class="font-bold">{{ row.title }}</TableCell>
        <TableCell>
          <div class="flex items-center gap-2">
            <div class="h-6 w-6 rounded-full bg-blue-200" />
            <span>{{ row.author }}</span>
          </div>
        </TableCell>
        <TableCell class="text-right">
          <button @click="editPost(row.id)">✏️ Edit</button>
        </TableCell>
      </TableRow>
    </template>
  </DataTable>
</template>
```

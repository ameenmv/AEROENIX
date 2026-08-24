# Team Instructions for Gemini

These are the core instructions, architecture details, and project rules for the `dashboard-base-vue` project. **You must strictly obey these guidelines.**

## Stack & Libraries

| Category | Technology |
|---|---|
| **Package Manager** | Bun (`bun run`, `bun x`, `bun add`) |
| **Framework** | Vue 3 (Composition API, `<script setup lang="ts">`) |
| **Build Tool** | Vite 7 |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS v4 + CSS Variables for theming (`src/style.css`) |
| **UI Components** | Custom `shadcn/ui` built on `reka-ui` (`src/components/uic/`) |
| **Icons** | `@hugeicons/vue` + `@hugeicons/core-free-icons` and `lucide-vue-next` |
| **Data Fetching** | `@tanstack/vue-query` v5 integrated with Axios (`src/services/api.ts`) |
| **Tables** | `@tanstack/vue-table` + custom slots |
| **State Management** | Pinia v3 (`src/stores/`) |
| **Forms & Validation** | `vee-validate` + `zod` (`@vee-validate/zod`) |
| **Routing** | `vue-router` v5 using a modular `registerModule()` pattern |
| **i18n** | `vue-i18n` v9 with namespace-based JSON files (en/ar) |

## Folder Structure

```
src/
├── components/          # Reusable Vue components
│   ├── admin/           # Admin-specific module UI components (e.g. admin/plans/)
│   ├── layout/          # Layout wrappers (AdminLayout, Sidebar, Navbar)
│   ├── ui/              # Higher-level UI elements (DataTable, FormContainer)
│   └── uic/             # shadcn/ui generic primitives (Button, Card, Input...)
├── composables/         # Hooks: useTable, useForm, useCan, useDarkMode...
├── config/              # Constants i.e. endpoints.ts, navigation.ts
├── i18n/locales/        # JSON translations (en/ar)
├── modules/             # Module definitions ONLY (schema.ts, routes index.ts, endpoints.ts - NO views or components here)
├── router/              # Main router & route guards
├── services/            # API Services (createService) & Axios configuration
├── stores/              # Pinia Stores (auth, permissions, filters)
├── types/               # Global TypeScript definitions
└── views/               # Page Components
    └── admin/           # Admin pages mapped logically (e.g., admin/plans/*)
```

**Auto-Import**:
- Vue APIs (`ref`, `computed`), Router, Pinia, and some `VueUse` fns are automatically imported via `unplugin-auto-import`.
- All Vue components inside `src/components/` are auto-imported via `unplugin-vue-components`.
- Types, services, composables (`src/composables`), and schemas are NOT auto-imported. Import them manually.

## Core Architecture: The Modular Approach

We enforce a **Declarative, Slot-Based Modular Architecture**. The view logic and the core state are strictly separated. 
We do NOT use monolithic configurations (like arrays for form fields or columns). Everything is explicit inside `<template>`.

### 1. `useTable` and `<DataTable>`
- **Logic:** `useTable` (TanStack Query) handles fetching, caching, pagination, sorting, filters, and row selection. (Default cache TTL: 30s). Included built-in `deleteFn` and confirm dialogs.
- **UI:** `<DataTable>` presentation component must use `#header` and `#row` slots natively. **DO NOT** use `columns.ts` files or pass monolithic schema arrays to `<DataTable>` prop. Everything must be explicitly mapped in HTML using `#header` and `#row`.
- **Filters:** Use `defineFilters()` + `<DataTableFilters>` inline above the table. **DO NOT** use `FilterSheet`, `filterable`, `filterConfig` props, or `useFilterStore` — they have been removed.

```vue
<!-- Example Table + Inline Filters -->
<script setup>
import { DataTable, DataTableFilters } from '@/components/ui/tables'
import { TableRow, TableHead, TableCell } from '@/components/uic/table'
import { defineFilters, useTable } from '@/composables'

const filterConfig = defineFilters('users', [
  { key: 'role', type: 'select', values: ['admin', 'editor', 'viewer', 'user'] },
  { key: 'status', type: 'select', values: ['active', 'inactive'] },
  { key: 'is_verified', type: 'toggle' },
  { key: 'created_at', type: 'dateRange' },
  // Load from API: { key: 'city_id', type: 'select', endpoint: () => citiesService.dropdown(), labelKey: 'name' },
])

const table = useTable({ fetchFn: (params) => myService.list(params), filterConfig })
</script>
<template>
  <DataTableFilters :fields="filterConfig.fields" :filters="table.activeFilters.value" @update:filters="table.setFilters" />
  <DataTable :data="table.items.value" :loading="table.loading.value" server-side>
    <template #header> <TableRow><TableHead>{{$t("example.name")}}</TableHead></TableRow> </template>
    <template #row="{ row }"> <TableRow><TableCell>{{ row.name }}</TableCell></TableRow> </template>
  </DataTable>
</template>
```

**`defineFilters` shorthand rules:**
- Labels auto-derive: `{resource}.fields.{key}` (e.g. `users.fields.role`)
- Select option labels auto-derive: `{resource}.{key}s.{value}` (e.g. `users.roles.admin`)
- Use `values: string[]` for static options, `endpoint: () => service.dropdown()` for API options
- Supported types: `text`, `number`, `select`, `multiselect`, `toggle`, `range`, `date`, `dateRange`, `checkbox`

### 2. `useForm` and `<FormContainer>`
- **Logic:** We rely purely on `useForm` (a wrapper over TanStack Query `useMutation`) binding with `Zod` and `vee-validate`. It automates validations and error mapping.
- **UI:** `<FormContainer>` wraps input primitives, managing the grid layout, wizard stepping, and submit footers.

```vue
<!-- Example Form Standard Setup -->
<script setup>
const form = useForm({
  schema: mySchema,
  action: 'create', // or 'update'
  mutationFn: (data) => myService.create(data) // or .update(id, data)
})
</script>
<template>
  <FormContainer :form="form">
    <InputField v-model="form.values.name" @update:model-value="form.setFieldValue('name', $event)" />
  </FormContainer>
</template>
```

## Route Navigation & View Modes

Views navigate strictly via Vue Router (`router.push`). Parent and child views are bound logically.

- **`registerModule()`:** Creates nested routes in `src/modules/<resource>/index.ts`. A router meta configuration drives subpage rendering styles.
  - `meta: { openMode: 'modal' }` renders in a slide-out/dialog overlay via `<ModularView>`.
  - `meta: { openMode: 'full' }` renders inside the full app content pane.

## API Services & HTTP Layer

- Axios instance in `services/api.ts` maps automatically handles auth bearers, multi-language `X-Locale`, and unifies response data/error capturing.
- Custom service files (e.g. `usersService.ts`) use the `createService<T>` factory giving methods:
  - `list({ limit, page, scope, filters, search })`
  - `dropdown({ search, limit })` -> Mini scope fallback.
  - `get(id)`
  - `create(data)` -> Detects FormData wrapper natively.
  - `update(id, data)` -> Sends `_method: PUT` inside FormData wrappers.
  - `delete(id)`
  - `toggle(id, column?)`

### Mock Data System
- **Per-service mocking**: use `useMock: true` in `createService()` config — NOT env variables.
- The global mock env var has been completely removed. Auth system mock is controlled by `VITE_MOCK_AUTH` only.
- Use `mockFieldsFromKeys(['id', 'name', 'email', 'status', 'created_at'])` to auto-generate Faker data from field names.
- The mock service implements full `ResourceService<T>` — list, get, create, update, delete, toggle, export, import all work in-memory.
- Mock files live in `src/services/mock/`. Core files: `createMockService.ts`, `fakerFieldMap.ts`, `mockFromType.ts`.
- Tables, forms, and detail views work **transparently** — they don't need to know the service is mocked.
- See `docs/guide/generic/mock-data.md` for full documentation.

## Scaffolding Tool (`bun make`)

Use `bun make <resource>` or `bun make:module <resource>` to scaffold immediately.
- Generates `schema.ts`, `index.ts` routes, `endpoints.ts` inside `src/modules/<resource>/`.
- Generates `IndexView.vue`, `CreateView.vue`, `EditView.vue`, `ShowView.vue` inside `src/views/admin/<resource>/`. Module views belongs here, NOT in `src/modules`.
- Generates `*Service.ts`, `entities/*.ts`, `mock/*.ts` and english/arabic i18n shells.
- **Auto-injects** the module into `router/index.ts` & `config/navigation.ts`, meaning you do *not* need to wire routes or menus manually when scaffolding.
- The UI must then be customized via declarative inputs in strings, headers, and form schemas.

## Permissions & RBAC

- Roles are assigned via the `{resource}.{action}` pattern (e.g. `users.manage`, `clients.view`).
- **Store:** `$permissionStore` holds rights. `*` grants superadmin.
- **Composables:** Check privileges with `useCan()` (`can('users.manage')`).
- **Directives:** Toggle markup using `v-can="'users.view'"`.
- **Guards:** Inject fallbacks rendering securely `<PermGuard permKey="users.manage">...</PermGuard>`. 
- **Routes:** Router checks `meta.permission` naturally. `permissionKey` automaps module namespaces.

## Git, Pre-Commit, & Formatting

- Husky enforcing `bun run lint` (ESLint) and `bun run build` (Vue-TSC + Vite build script) prior to any commit. Note: Failing TS checks restricts commit creation.
- Strict Conventional Commits usage. Branches format `type/short-description` (e.g., `feat/add-api`).
- Keep code neat with `bun run clean:all` and formatting passes.

## Standard Guidelines

1. **Naming**: Resource files are strictly **plural lowercase** (`clients`, `products`).
2. **i18n Translation**: Text must use `t('key.path', 'Fallback text')`. Arabic is RTL autodetected. Ensure translation syncs locally using `bun i18n:report`.
3. **Themes**: Dark Mode is default. Never hardcode DOM hex; utilize CSS vars (`--background`, `--text-main`) bound heavily in `@/style.css`. Use `useDarkMode()` hooks.
4. **Tool Use**: Reference "hugeicons" MCP server to find correct Vue SVGs (`import { ShoppingIcon } from '@hugeicons/core-free-icons'`). Reference "context7" to query modern `tanstack-query-v5` or `vue3` logic if needed. 

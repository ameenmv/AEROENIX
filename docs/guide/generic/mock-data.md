# Mock Data System

Develop UIs without a running backend using auto-generated Faker.js data. The mock system is **per-service** — you can mock one module while keeping others hitting the real API.

## Quick Start

Add `useMock: true` + `mockFieldsFromKeys()` to any service:

```ts
// src/services/plansService.ts
import { createService } from './createService'
import { mockFieldsFromKeys } from './mock'
import type { Plan } from '@/types'

export const plansService = createService<Plan>('/admin/v1/plans', {
  useMock: true,  // ← flip to false when API is ready
  mockFields: mockFieldsFromKeys([
    'id', 'name_en', 'name_ar', 'price', 'status',
    'description_en', 'description_ar', 'created_at',
  ]),
})
```

That's it. **No env variables, no manual mock files.** The service now returns realistic Faker data for all CRUD operations.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│  createService<T>(endpoint, { useMock, mockFields })            │
│                                                                 │
│  useMock: false  ──→  Real API service (Axios)                  │
│  useMock: true   ──→  createMockService<T>()                    │
│                        ├─ In-memory array (Faker-generated)     │
│                        ├─ Full CRUD: list, get, create,         │
│                        │   update, delete, toggle, export,      │
│                        │   import                               │
│                        ├─ Search, filter, sort, pagination      │
│                        └─ Session-persistent mutations           │
└─────────────────────────────────────────────────────────────────┘
```

### Field Name Resolution

`mockFieldsFromKeys()` auto-resolves field names to Faker generators using a 3-tier strategy:

| Priority | Strategy | Example |
|----------|----------|---------|
| 1 | **Exact match** | `email` → `faker.internet.email()` |
| 2 | **Prefix match** | `is_verified` → `faker.datatype.boolean()` |
| 3 | **Suffix match** | `company_email` → `faker.internet.email()` |
| 4 | **Fallback** | `custom_field` → `faker.lorem.word()` |

**Supported exact matches** (150+ fields):

| Category | Fields |
|----------|--------|
| **Identity** | `id`, `uuid` |
| **Person** | `name`, `first_name`, `last_name`, `email`, `phone`, `avatar`, `role`, `gender`, `age` |
| **Text** | `title`, `description`, `body`, `content`, `slug`, `summary`, `note`, `message` |
| **Numbers** | `price`, `amount`, `total`, `quantity`, `discount`, `tax`, `rating`, `percentage` |
| **Status** | `status`, `is_active`, `is_verified`, `is_published`, `type`, `priority`, `severity` |
| **Dates** | `created_at`, `updated_at`, `published_at`, `start_date`, `end_date`, `due_date` |
| **Location** | `address`, `city`, `country`, `lat`, `lng`, `zip_code` |
| **Media** | `url`, `image`, `image_url`, `thumbnail`, `logo`, `cover`, `file_url` |
| **Bilingual** | `name_en`, `name_ar`, `title_en`, `title_ar`, `description_en`, `description_ar` |
| **References** | `user_id`, `category_id`, `project_id`, `code`, `reference`, `tracking_code` |

**Supported prefixes:** `is_`, `has_`, `can_`, `total_`, `max_`, `min_`, `num_`

**Supported suffixes:** `_id`, `_uuid`, `_url`, `_email`, `_phone`, `_date`, `_at`, `_count`, `_name`, `_code`, `_color`, `_image`, `_path`, `_en`, `_ar`

## Usage with Tables

When `useMock: true` is set on the service, **tables work automatically** — no extra configuration needed:

```vue
<script setup lang="ts">
import { useTable } from '@/composables'
import { plansService } from '@/services/plansService'
import type { Plan } from '@/types'

// The service is already mocked — useTable doesn't need to know!
const table = useTable<Plan>({
  resourceName: 'plans',
  fetchFn: (params) => plansService.list(params),
})

const columns = [
  { key: 'id', label: '#' },
  { key: 'name_en', label: 'Name' },
  { key: 'price', label: 'Price' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Created' },
]
</script>

<template>
  <DataTable
    :columns="columns"
    :data="table.items.value"
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
  />
</template>
```

The mock service handles search, filtering, sorting, and pagination automatically — just like the real API.

## Usage with Forms

Forms also work transparently. The mock service returns created/updated records:

```vue
<script setup lang="ts">
import { useForm } from '@/composables'
import { plansSchema } from '@/modules/plans/schema'
import { plansService } from '@/services/plansService'

// Create form — plansService.create() is mocked automatically
const form = useForm({
  resourceName: 'plans',
  action: 'create',
  schema: plansSchema,
  mutationFn: (data) => plansService.create(data),
  onSuccess: () => router.push({ name: 'admin-plans' }),
})
</script>

<template>
  <FormContainer :form="form" @cancel="router.back()">
    <InputField name="name_en" label="Name (EN)" />
    <InputField name="name_ar" label="Name (AR)" />
    <InputField name="price" type="number" label="Price" />
  </FormContainer>
</template>
```

**Edit forms** work too — `plansService.get(id)` returns a mock record, and `plansService.update(id, data)` updates the in-memory store:

```vue
<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { useForm } from '@/composables'
import { plansService } from '@/services/plansService'

const id = route.params.id as string

// get() returns a mock record
const { data: item } = useQuery({
  queryKey: ['plans', id],
  queryFn: () => plansService.get(id),
})

const form = useForm({
  resourceName: 'plans',
  action: 'update',
  schema: plansSchema,
  mutationFn: (data) => plansService.update(id, data),
  onSuccess: () => router.push({ name: 'admin-plans' }),
})

// Populate form when data loads
watch(item, (plan) => {
  if (plan) form.setValues(plan)
}, { immediate: true })
</script>
```

## Usage with Show/Detail Views

Detail views also work out of the box:

```vue
<script setup lang="ts">
import { useDetails } from '@/composables'
import { plansService } from '@/services/plansService'

// get(id) returns a mock record with all fields populated
const { item, loading } = useDetails({
  resourceName: 'plans',
  getFn: (id) => plansService.get(id),
  autoLoadId: true,
})
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="item">
    <p>{{ item.name_en }}</p>
    <p>{{ item.price }}</p>
  </div>
</template>
```

## Custom Field Overrides

For domain-specific values, override individual fields:

```ts
import { faker } from '@faker-js/faker'
import { createService } from './createService'
import { mockFieldsFromKeys } from './mock'

export const ordersService = createService<Order>('/admin/v1/orders', {
  useMock: true,
  mockFields: {
    // Auto-resolved fields
    ...mockFieldsFromKeys(['id', 'user_id', 'total', 'status', 'created_at']),

    // Custom overrides
    payment_method: () => faker.helpers.arrayElement(['card', 'cash', 'bank_transfer']),
    order_number: () => `ORD-${faker.string.alphanumeric(6).toUpperCase()}`,
    items_count: () => faker.number.int({ min: 1, max: 20 }),
  },
  mockCount: 50,     // generate 50 records (default: 25)
  mockDelay: 500,    // simulate 500ms latency (default: 200)
})
```

## Service Config Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `useMock` | `boolean` | `false` | Enable mock mode for this service |
| `mockFields` | `Record<string, () => unknown>` | — | Field generators (use `mockFieldsFromKeys()`) |
| `mockCount` | `number` | `25` | Number of mock records to generate |
| `mockDelay` | `number` | `200` | Simulated network latency in ms |

## Authentication Mocking

Authentication state and validation are handled independently of the module-level `useMock` options. You can test your login UI and validate mock credentials without needing a real backend auth server.

Enable it globally via Environment Variables:

```env
VITE_MOCK_AUTH=true
VITE_MOCK_AUTH_EMAIL=admin@example.com
VITE_MOCK_AUTH_PASSWORD=password123
```

- When `VITE_MOCK_AUTH=true` is set, `authService.ts` will mock all endpoints (`login`, `logout`, `password_change`, etc.).
- `login()` validates against the email and password you define in `.env`.
- You cannot login if your inputs do not match standard mock or `.env` credentials!

## Mock CRUD Operations

The mock service supports all `ResourceService<T>` operations:

| Operation | Behavior |
|-----------|----------|
| `list(params)` | Search, filter, sort, paginate against in-memory array |
| `dropdown(params)` | Same as list, scoped for selects |
| `get(id)` | Returns a single record by ID |
| `create(data)` | Adds to the in-memory array, returns it with a new auto-incremented ID |
| `update(id, data)` | Merges data into existing record |
| `delete(id)` | Removes from in-memory array |
| `toggle(id, column)` | Flips boolean or swaps `active`↔`inactive` |
| `export()` | Returns a mock download URL |
| `import(file)` | Adds 5 new generated records |

All mutations **persist during the browser session** — so if you create a record and then go back to the list, you'll see it there.

## Direct Array Override (Legacy)

For quick prototyping, you can still pass `mockData` directly to `useTable`:

```ts
import { generateMockRecords, mockFieldsFromKeys } from '@/services/mock'

const table = useTable<Plan>({
  fetchFn: (params) => plansService.list(params),
  mockData: generateMockRecords<Plan>(
    mockFieldsFromKeys(['id', 'name', 'price', 'status', 'created_at']),
    25,
  ),
})
```

::: warning
The direct `mockData` prop only supports tables (list operations). The recommended approach is `useMock: true` on the service, which supports all CRUD operations.
:::

## Dev Console

When mock mode is active, you'll see a log in the browser console:

```
[🧪 Mock] /admin/v1/plans → using auto-generated mock data
```

This only appears in development mode (`import.meta.env.DEV`).

## File Structure

```
src/services/mock/
├── index.ts              # Barrel export
├── createMockService.ts  # Full CRUD mock factory (ResourceService<T>)
├── fakerFieldMap.ts      # 150+ field name → Faker mappings
└── mockFromType.ts       # mockFieldsFromKeys() + generateMockRecords()
```

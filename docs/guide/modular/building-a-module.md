# Building a Module

This guide walks you through building a complete CRUD module from scratch using the simplified modular architecture.

> [!TIP]
> You can skip this guide and scaffold everything automatically with `bun run make:module`. This guide is for understanding how it works under the hood.

## What You'll Build

A "Products" module with:
- **List page** — table with search, pagination, and delete
- **Create page** — form with validation
- **Edit page** — form pre-populated from API
- **Show page** — read-only detail view

## Step 1: Define the Module Config Files

### Schema (`src/modules/products/schema.ts`)

```ts
import { z } from 'zod'

export const productsSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(1, 'Name is required'),
  price: z.number({ required_error: 'Price is required' }).min(0, 'Price must be positive'),
  description: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).default('active'),
})
```

### Columns (`src/modules/products/columns.ts`)

```ts
import type { TableColumn } from '@/types'

export const productsColumns: TableColumn[] = [
  { key: 'id', label: '#' },
  { key: 'name', label: 'Name' },
  { key: 'price', label: 'Price' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Created At' },
]
```

### Fields (`src/modules/products/fields.ts`)

```ts
import type { FormField } from '@/types'

export const productsFields: FormField[] = [
  { key: 'name', label: 'Name', required: true },
  { key: 'price', label: 'Price', type: 'number', required: true },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'status', label: 'Status', type: 'select' },
]
```

### Endpoints (`src/modules/products/endpoints.ts`)

```ts
export const API_PREFIX = '/api/v1'

export const PRODUCTS_ENDPOINTS = {
  LIST: `${API_PREFIX}/products`,
  GET: (id: string | number) => `${API_PREFIX}/products/${id}`,
  CREATE: `${API_PREFIX}/products`,
  UPDATE: (id: string | number) => `${API_PREFIX}/products/${id}`,
  DELETE: (id: string | number) => `${API_PREFIX}/products/${id}`,
} as const
```

## Step 2: Create the Service

`src/services/productsService.ts`:

```ts
import api from './api'
import type { Product, PaginatedResponse } from '@/types'
import { PRODUCTS_ENDPOINTS } from '@/modules/products/endpoints'

export const productsService = {
  async list(params = {}) {
    const response = await api.get<PaginatedResponse<Product>>(PRODUCTS_ENDPOINTS.LIST, { params })
    return { data: response.data?.data || [], total: response.data?.total || 0 }
  },
  async get(id: string | number) {
    const response = await api.get<{ data: Product }>(PRODUCTS_ENDPOINTS.GET(id))
    return (response.data as any)?.data || response.data
  },
  async create(data: Partial<Product>) {
    const response = await api.post<{ data: Product }>(PRODUCTS_ENDPOINTS.CREATE, data)
    return (response.data as any)?.data || response.data
  },
  async update(id: string | number, data: Partial<Product>) {
    const response = await api.put<{ data: Product }>(PRODUCTS_ENDPOINTS.UPDATE(id), data)
    return (response.data as any)?.data || response.data
  },
  async delete(id: string | number) {
    await api.delete(PRODUCTS_ENDPOINTS.DELETE(id))
  }
}
```

## Step 3: Build the Views

### IndexView.vue — The Table

This is the main listing page. It uses `useTable` for data management and `router.push()` for navigation:

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useTable } from '@/composables'
import { DataTable } from '@/views/admin/components'
import { productsColumns } from '@/modules/products/columns'
import { productsService } from '@/services/productsService'
import type { Product } from '@/types'
import { PlusSignIcon, ViewIcon, Edit02Icon, Delete02Icon } from '@hugeicons/core-free-icons'

const router = useRouter()

const table = useTable<Product>({
  resourceName: 'products',
  fetchFn: (params) => productsService.list(params),
  columns: productsColumns,
  deleteFn: (id) => productsService.delete(id),
})
</script>

<template>
  <ModularView>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold tracking-tight">{{ $t('menu.products') }}</h1>
        <Button v-can="'products.manage'" @click="router.push({ name: 'admin-products-create' })">
          <PlusSignIcon class="w-5 h-5 mr-2" />
          {{ $t('actions.add') }}
        </Button>
      </div>

      <DataTable
        :columns="productsColumns"
        :data="table.items.value"
        :loading="table.loading.value"
      >
        <template #actions="{ row }">
          <div class="flex items-center justify-end gap-2">
            <Button size="sm" variant="ghost"
              @click="router.push({ name: 'admin-products-show', params: { id: row.id } })">
              <ViewIcon class="w-4 h-4 text-gray-500" />
            </Button>
            <Button size="sm" variant="ghost"
              @click="router.push({ name: 'admin-products-edit', params: { id: row.id } })">
              <Edit02Icon class="w-4 h-4 text-blue-500" />
            </Button>
            <Button size="sm" variant="ghost" v-can="'products.manage'"
              @click="table.deleteItem(row.id)">
              <Delete02Icon class="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </template>
      </DataTable>

      <!-- Confirm dialog for deletes -->
      <ConfirmModal
        v-if="table.confirmState.value.show"
        :title="table.confirmState.value.title"
        :message="table.confirmState.value.message"
        @confirm="table.confirmState.value.callback?.()"
        @cancel="table.cancelConfirm()"
      />
    </div>
  </ModularView>
</template>
```

> [!TIP]
> Notice there's no `usePage`, no `useForm`, no glue logic. `useTable` handles data + delete. `router.push()` handles navigation. `ModularView` handles modal/full rendering. `v-can` handles permissions.

### CreateView.vue — The Create Form

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useForm } from '@/composables'
import { productsSchema } from '@/modules/products/schema'
import { productsFields } from '@/modules/products/fields'
import { productsService } from '@/services/productsService'

const router = useRouter()

const form = useForm({
  resourceName: 'products',
  createFn: (data) => productsService.create(data),
  schema: productsSchema,
  fields: productsFields,
  onSuccess: () => router.push({ name: 'admin-products' }),
})
form.startCreate()
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ $t('actions.create') }} {{ $t('menu.products') }}</h1>

    <FormContainer
      :fields="form.computedFields.value"
      :form-data="form.formData.value"
      @update:form-data="form.setFields"
      @submit="form.submit"
      @cancel="router.push({ name: 'admin-products' })"
    />
  </div>
</template>
```

### EditView.vue — The Edit Form

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useForm } from '@/composables'
import { productsSchema } from '@/modules/products/schema'
import { productsFields } from '@/modules/products/fields'
import { productsService } from '@/services/productsService'

const router = useRouter()

const form = useForm({
  resourceName: 'products',
  updateFn: (id, data) => productsService.update(id, data),
  getFn: (id) => productsService.get(id),
  autoLoadId: true,
  schema: productsSchema,
  fields: productsFields,
  onSuccess: () => router.push({ name: 'admin-products' }),
})
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ $t('actions.edit') }} {{ $t('menu.products') }}</h1>

    <div v-if="form.saving.value" class="py-12 flex justify-center">
      <Spinner class="w-8 h-8" />
    </div>

    <FormContainer
      v-else
      :fields="form.computedFields.value"
      :form-data="form.formData.value"
      :is-edit="true"
      @update:form-data="form.setFields"
      @submit="form.submit"
      @cancel="router.push({ name: 'admin-products' })"
    />
  </div>
</template>
```

### ShowView.vue — The Detail View

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useDetails } from '@/composables'
import { productsFields } from '@/modules/products/fields'
import { productsService } from '@/services/productsService'

const router = useRouter()

const { item, loading } = useDetails({
  resourceName: 'products',
  getFn: (id) => productsService.get(id),
  autoLoadId: true,
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ $t('menu.products') }} Details</h1>
      <Button variant="ghost" @click="router.push({ name: 'admin-products' })">Back</Button>
    </div>

    <div v-if="loading" class="py-12 text-center">Loading...</div>
    <div v-else-if="item" class="grid grid-cols-2 gap-4 p-6 rounded-xl border border-border bg-card">
      <div v-for="field in productsFields" :key="field.key">
        <span class="text-sm text-muted-foreground">{{ field.label }}</span>
        <p class="font-medium">{{ (item as any)[field.key] }}</p>
      </div>
    </div>
  </div>
</template>
```

## Step 4: Register Routes

Create `src/modules/products/index.ts`:

```ts
import { registerModule } from '@/router/modules'
import { ShoppingBag02Icon } from '@hugeicons/core-free-icons'

registerModule({
  name: 'products',
  path: 'admin/products',
  icon: ShoppingBag02Icon,
  permissionKey: 'products',
  routes: [
    {
      path: 'admin/products',
      name: 'admin-products',
      component: () => import('@/views/admin/products/IndexView.vue'),
      meta: { breadcrumbKey: 'menu.products' },
      children: [
        {
          path: 'create',
          name: 'admin-products-create',
          component: () => import('@/views/admin/products/CreateView.vue'),
          meta: { openMode: 'modal' },
        },
        {
          path: ':id',
          name: 'admin-products-show',
          component: () => import('@/views/admin/products/ShowView.vue'),
          meta: { openMode: 'full' },
        },
        {
          path: ':id/edit',
          name: 'admin-products-edit',
          component: () => import('@/views/admin/products/EditView.vue'),
          meta: { openMode: 'modal' },
        },
      ],
    },
  ],
})
```

Then import it in `src/router/index.ts`:

```ts
import '../modules/products'
```

## Step 5: Add Navigation & i18n

Add to `src/lib/navigation.ts`:

```ts
{
  name: 'products',
  label: 'menu.products',
  icon: ShoppingBag02Icon,
  to: '/admin/products',
  permission: 'products.view',
}
```

Add i18n keys:

```json
// src/i18n/locales/en/menu.json
{ "products": "Products" }

// src/i18n/locales/ar/menu.json
{ "products": "المنتجات" }
```

## Summary

| View | Composable | Role |
|---|---|---|
| IndexView | `useTable` | Data listing, search, pagination, delete |
| CreateView | `useForm` | Create form with validation |
| EditView | `useForm` (autoLoadId) | Edit form with auto-loading |
| ShowView | `useDetails` (autoLoadId) | Read-only detail view |

The views are connected by `router.push()` — no orchestrator composable needed. `ModularView` handles modal/full rendering automatically based on `route.meta.openMode`.

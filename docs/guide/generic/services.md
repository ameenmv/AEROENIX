# Services & API Layer

Services are plain objects that talk to your backend API. Each resource gets its own service file.

## Creating a Service

```ts
// src/services/clientsService.ts
import api from './api'
import type { Client } from '@/types'

export const clientsService = {
  async list(params = {}) {
    const response = await api.get('/clients', { params })
    return {
      data: response.data?.data || [],
      total: response.data?.total || 0,
    }
  },

  async get(id: string | number) {
    const response = await api.get(`/clients/${id}`)
    return response.data?.data || response.data
  },

  async create(data: Partial<Client>) {
    const response = await api.post('/clients', data)
    return response.data?.data || response.data
  },

  async update(id: string | number, data: Partial<Client>) {
    const response = await api.put(`/clients/${id}`, data)
    return response.data?.data || response.data
  },

  async delete(id: string | number) {
    await api.delete(`/clients/${id}`)
  },
}
```

That's it — five methods. `useTable` calls `list()`, `useForm` calls `create()`/`update()`/`get()`, and `useTable`'s built-in delete calls `delete()`.

## API Instance

The shared Axios instance (`src/services/api.ts`) handles:

- **Auth token injection** via request interceptor
- **Error normalization** via response interceptor
- **Auto-redirect on 401** (session expired → login page)
- **Toast notifications** for 422, 500, and other errors

```ts
import api from '@/services/api'

// The token is automatically attached
const response = await api.get('/users')
```

::: tip
You never need to manually attach the `Authorization` header — the interceptor reads it from `localStorage`.
:::

## API Endpoints

For modular modules, define endpoints in `src/modules/<name>/endpoints.ts`:

```ts
export const API_PREFIX = '/api/v1'

export const CLIENTS_ENDPOINTS = {
  LIST: `${API_PREFIX}/clients`,
  GET: (id: string | number) => `${API_PREFIX}/clients/${id}`,
  CREATE: `${API_PREFIX}/clients`,
  UPDATE: (id: string | number) => `${API_PREFIX}/clients/${id}`,
  DELETE: (id: string | number) => `${API_PREFIX}/clients/${id}`,
} as const
```

## Optional Methods

If your resource needs extra capabilities, just add methods to the service object:

```ts
export const clientsService = {
  // ... standard CRUD methods above

  async export(params = {}) {
    const response = await api.get('/clients/export', {
      params,
      responseType: 'blob',
    })
    return response.data
  },

  async import(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    await api.post('/clients/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
```

No interface to implement — just add what you need.

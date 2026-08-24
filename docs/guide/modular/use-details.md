# useDetails

The `useDetails` composable manages reading, loading, and refreshing a single entity's details.

It is built specifically on top of `@tanstack/vue-query`'s `useQuery` API, which means that any cached data seamlessly invalidates and refetches when you trigger an update inside `useForm`!

## Basic Usage

```vue
<script setup lang="ts">
import { useDetails } from '@/composables'
import { usersService } from '@/services/users'

// Fully supports ES6 destructuring out of the box! No `.value` chaining needed in templates!
const { item, loading } = useDetails({
  resourceName: 'users',
  getFn: (id) => usersService.get(id),
  id: 123
})
</script>

<template>
  <div v-if="loading">Loading...</div>
  
  <div v-else-if="item">
    <h1>{{ item.name }}</h1>
    <p>{{ item.email }}</p>
  </div>
</template>
```

## Auto-Loading from Router

Just like `useForm`'s auto-load feature, `useDetails` seamlessly interfaces with the Vue Router. If you have a View component living on a dynamic route route like `/admin/users/:id`, you can command `useDetails` to bind to that ID dynamically.

```typescript
const { item, loading } = useDetails({
  resourceName: 'users',
  getFn: (id) => usersService.get(id),
  autoLoadId: true, // Magically binds to route.params.id
})
```

## Options

| Option | Type | Required | Description |
|---|---|---|---|
| `resourceName` | `string` | Yes | The base name for the cache key (e.g., `'users'`). |
| `getFn` | `(id: string \| number) => Promise<T>` | Yes | The API tracking promise that retrieves the entity. |
| `id` | `string \| number \| Ref<...>` | No | The specific ID to load. Can be a literal, a Ref, or a Computed properties. If `autoLoadId` is active, it will prioritize the URL params over this property. |
| `autoLoadId` | `boolean` | No | Automatically scans `vue-router`'s `route.params.id` string map and mounts it as the ID. |
| `queryKey` | `unknown[]` | No | Fully overrides the backend cache map if you need specialized cache tracking arrays. Defaults to `[resourceName, 'details', id]`. |

## Returns

| Property | Type | Description |
|---|---|---|
| `item` | `Ref<T \| undefined>` | The reactive data entity fetched from the `getFn`. |
| `loading` | `Ref<boolean>` | `true` while the query is resolving in the background. |
| `error` | `Ref<any>` | Populates if the underlying promise throws an error. |
| `refresh` | `() => Promise<void>` | Force-bypasses caching to immediately hit the network API again. |

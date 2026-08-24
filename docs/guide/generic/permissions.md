# Permissions & Roles

The framework has a built-in **role-based access control (RBAC)** system with a permission store, a composable, and route guards.

## Permission Format

Permissions use the `{resource}.{action}` pattern:

```
users.view
users.manage
users.delete
statistics.view
clients.view
clients.manage
```

The special `*` permission grants access to everything (superadmin).

## Permission Store

The `usePermissionStore` Pinia store manages permissions:

```ts
import { usePermissionStore } from '@/stores/permissions'

const permissionStore = usePermissionStore()

// Set permissions after login
permissionStore.setPermissions(['users.view', 'users.manage', 'statistics.view'])

// Check a permission
permissionStore.hasPermission('users.view')   // true
permissionStore.hasPermission('users.delete')  // false

// Check if any of several permissions are held
permissionStore.hasAnyPermission(['users.view', 'clients.view'])  // true

// Clear on logout
permissionStore.clearPermissions()
```

Permissions are persisted in `localStorage` and survive page refreshes.

## useCan Composable

The `useCan` composable provides clean permission checks in components:

```ts
import { useCan } from '@/composables/useCan'

const { can, canAny, canAll, canResource } = useCan()

// Check a single permission
if (can('users.manage')) {
  // Show edit button
}

// Check if user has ANY of the permissions
if (canAny(['users.view', 'clients.view'])) {
  // Show navigation
}

// Check if user has ALL permissions
if (canAll(['users.view', 'users.manage'])) {
  // Show admin panel
}

// Shorthand for resource-based checks
if (canResource('users', 'view')) {
  // Equivalent to can('users.view')
}
```

### In Templates

```vue
<script setup>
const { can, canResource } = useCan()
</script>

<template>
  <button v-if="can('users.manage')" @click="openEdit(item.id)">
    Edit
  </button>

  <button v-if="canResource('users', 'delete')" @click="remove(item.id)">
    Delete
  </button>
</template>
```

## Route Guards

### Per-Route Permission

Add a `permission` meta to restrict access:

```ts
{
  path: 'admin/users',
  name: 'admin-users',
  component: ...,
  meta: { permission: 'users.view' },
}
```

The router guard checks this:

```ts
if (to.meta.permission) {
  const hasPermission = permissions.includes(to.meta.permission) || permissions.includes('*')
  if (!hasPermission) {
    return next({ path: `/${lang}/admin/dashboard` })
  }
}
```

### Module Route Injection

If you are using the Modular Architecture, you can set the `permissionKey` when registering the module. This automatically injects `meta: { permission: 'key.view' }` into every route within that module that doesn't already have one.

```ts
// src/modules/users.ts
registerModule({
  name: 'users',
  path: 'admin/users',
  permissionKey: 'users', // Auto-injects meta.permission = 'users.view'
  routes: [ ... ],
})
```

## Navigation Filtering

Navigation items are automatically hidden for users without the required permission:

```ts
// src/lib/navigation.ts
{
  name: 'users',
  label: 'menu.users',
  icon: UserGroupIcon,
  to: '/admin/users',
  permission: 'users.view',  // Only visible if user has this permission
}
```

## Resource Config Permission

Each resource config can specify its permission key:

```ts
export function usersConfig(): ResourceConfig {
  return {
    permissionKey: 'users',
    // This enables:
    // - users.view for viewing
    // - users.manage for create/edit
    // - users.delete for deletion
    actions: {
      canAdd: true,    // Checked against users.manage
      canEdit: true,   // Checked against users.manage
      canDelete: true, // Checked against users.delete
      canView: true,   // Checked against users.view
    },
  }
}
```

## Generic Use via Components and Directives

### Using `<PermGuard>`

A generic wrapper component is available to hide templates when permissions don't match.

```vue
<script setup>
import PermGuard from '@/components/common/PermGuard.vue'
</script>

<template>
  <PermGuard perm-key="users.manage">
    <button>Add User</button>
    <template #fallback>
      <span>You don't have permission to add users.</span>
    </template>
  </PermGuard>
</template>
```

### Using v-can Directive

For inline checks, use the globally registered `v-can` directive. It supports single permissions or an array of permissions (requires "any" of them).

```vue
<template>
  <!-- Single permission -->
  <button v-can="'users.manage'">Edit</button>

  <!-- Array of permissions (hasAnyPermission) -->
  <div v-can="['users.view', 'clients.view']">
    Reports Section
  </div>
</template>
```

## Setting Permissions After Login

```ts
// In your login handler
const response = await authService.login(credentials)

const permissionStore = usePermissionStore()
permissionStore.setPermissions(response.data.permissions)

// Superadmin gets all permissions
permissionStore.setPermissions(['*'])
```

::: tip
Always use the `useCan` composable in templates rather than accessing the store directly — it's cleaner and more readable.
:::

# Modules & Routing

Every resource is a **module** that self-registers its routes using `registerModule()`.

## How It Works

### 1. Create the Module

Create `src/modules/<name>/index.ts`:

```ts
import { registerModule } from '@/router/modules'
import { UserIcon } from '@hugeicons/core-free-icons'

registerModule({
  name: 'users',
  path: 'admin/users',
  icon: UserIcon,
  permissionKey: 'users',
  routes: [
    {
      path: 'admin/users',
      name: 'admin-users',
      component: () => import('@/views/admin/users/IndexView.vue'),
      meta: { breadcrumbKey: 'menu.users' },
      children: [
        {
          path: 'create',
          name: 'admin-users-create',
          component: () => import('@/views/admin/users/CreateView.vue'),
          meta: { openMode: 'modal' },
        },
        {
          path: ':id',
          name: 'admin-users-show',
          component: () => import('@/views/admin/users/ShowView.vue'),
          meta: { openMode: 'full' },
        },
        {
          path: ':id/edit',
          name: 'admin-users-edit',
          component: () => import('@/views/admin/users/EditView.vue'),
          meta: { openMode: 'modal' },
        },
      ],
    },
  ],
})
```

### 2. Import in Router

Import it in `src/router/index.ts` — the import triggers registration:

```ts
import '../modules/users'
```

The router picks up the routes automatically via `getModuleRoutes()`.

### 3. Add Navigation

Add to `src/lib/navigation.ts`:

```ts
{
  name: 'users',
  label: 'menu.users',
  icon: UserGroupIcon,
  to: '/admin/users',
  permission: 'users.view',
}
```

## Module Interface

```ts
interface ModuleConfig {
  name: string             // Module name (e.g., 'users')
  path: string             // Base path
  icon?: any               // Icon for navigation
  order?: number           // Sort order in sidebar
  permissionKey?: string   // Auto-injects permission on all routes
  routes: RouteRecordRaw[] // Route definitions
}
```

## Permission Key Injection

When you set `permissionKey: 'users'`, all routes in the module automatically get `meta: { permission: 'users.view' }` — unless they already define their own permission. No boilerplate needed.

## View Mode Control

Each child route's `meta.openMode` controls how it renders:

| `meta.openMode` | Behavior |
|---|---|
| `'modal'` | Renders as a dialog overlay via `<ModularView>` |
| `'full'` | Renders as a full page |

The `<ModularView>` wrapper in the parent `IndexView` reads this meta and handles the rendering automatically.

## Route Guards

The router has three built-in guards:

1. **Locale** — Extract and set language from URL (`/:lang([a-z]{2})?/admin/...`)
2. **Auth** — Redirect unauthenticated users to login
3. **Permission** — Check `route.meta.permission` against the user's stored permissions

```ts
// Auth guard
if (isAdminRoute && !isAuthRoute && !token) {
  return next({ path: `/${lang}/admin/login` })
}

// Permission guard
if (to.meta.permission) {
  const hasPermission = permissions.includes(to.meta.permission) || permissions.includes('*')
  if (!hasPermission) {
    return next({ path: `/${lang}/admin/dashboard` })
  }
}
```

## i18n URL Structure

All routes support locale prefixing:

```
/en/admin/users       → English
/ar/admin/users       → Arabic
```

::: tip
Navigation items with a `permission` key are automatically hidden from users who lack that permission.
:::

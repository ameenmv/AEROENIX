# useSidebar

Composable for managing the sidebar navigation state across desktop and mobile.

## Usage

```ts
import { useSidebar } from '@/composables/useSidebar'

const { isOpen, isMobileOpen, isCollapsed, toggle, toggleCollapse, close, open } = useSidebar()
```

## Returned API

| Property / Method | Type | Description |
|---|---|---|
| `isOpen` | `Ref<boolean>` | Desktop sidebar open state (default: `true`) |
| `isMobileOpen` | `Ref<boolean>` | Mobile sidebar open state (default: `false`) |
| `isCollapsed` | `Ref<boolean>` | Whether sidebar shows icons only (default: `false`) |
| `toggle()` | `() => void` | Toggle sidebar (responsive: mobile on `< 1024px`, desktop otherwise) |
| `toggleCollapse()` | `() => void` | Toggle between full and icon-only sidebar |
| `close()` | `() => void` | Close mobile sidebar |
| `open()` | `() => void` | Open sidebar (responsive) |

## Responsive Behavior

The composable automatically adapts based on viewport width:

- **Desktop** (`≥ 1024px`): `toggle()` and `open()` control `isOpen`
- **Mobile** (`< 1024px`): `toggle()` and `open()` control `isMobileOpen`

```ts
// On desktop (viewport ≥ 1024px)
toggle()  // toggles isOpen

// On mobile (viewport < 1024px)
toggle()  // toggles isMobileOpen
```

## Global State

The sidebar state is **global** (defined outside the composable function). This means all components using `useSidebar()` share the same state — toggling from the header updates the sidebar layout component automatically.

## Template Usage

```vue
<!-- Header toggle button -->
<button @click="toggle">☰</button>

<!-- Sidebar collapse button -->
<button @click="toggleCollapse">
  {{ isCollapsed ? '→' : '←' }}
</button>

<!-- Mobile overlay -->
<div v-if="isMobileOpen" class="fixed inset-0 bg-black/50 z-40" @click="close" />
```

::: tip
The sidebar state persists across route changes since it's shared globally. It does **not** persist across page reloads — the sidebar always opens expanded on fresh load.
:::

## Permission Integration

The App Sidebar natively supports the new permission system out-of-the-box. When defining Navigation Items, the sidebar automatically hides links checking their required permission via the `useCan()` composable:

```ts
// src/lib/navigation.ts
export const navigationConfig: NavItem[] = [
  {
    name: 'users',
    label: 'menu.users',
    to: '/admin/users',
    permission: 'users.view', // Sidebar will automatically hide this if user lacks permission
  }
]
```

### Hiding Sidebar Elements Inline (v-can)

If you have custom elements inside the Sidebar that don't stem from `navigation.ts`, you can leverage the global `v-can` directive:

```vue
<!-- Inside AppSidebar.vue -->
<div class="sidebar-footer" v-can="'admin.settings'">
   <button>Advanced Settings</button>
</div>
```

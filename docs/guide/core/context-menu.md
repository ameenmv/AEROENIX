# Context Menu System

The project ships a **singleton, app-wide context menu** built on top of a custom composable (`useContextMenu`) and a portal component (`ContextMenuPortal`). Right-clicking any registered element opens a floating action list positioned at the cursor while staying within the viewport bounds.

## Architecture

```
useContextMenu()          ← consumed by any component that wants a right-click menu
useContextMenuPortal()    ← consumed only by <ContextMenuPortal> (mounted once in the layout)
ContextMenuPortal.vue     ← renders the floating menu via <Teleport to="body">
```

The state is a **module-level singleton** (`ref` outside the composable function), so every caller shares the same menu instance — only one menu is visible at a time.

---

## Setup

`<ContextMenuPortal>` must be mounted **once** at the root layout (e.g. `AdminLayout.vue`). It registers global `click`, `contextmenu`, and `keydown` listeners that handle auto-closing.

```vue
<!-- src/components/layout/AdminLayout.vue -->
<template>
  <div>
    <AppSidebar />
    <main>
      <slot />
    </main>

    <!-- Mount the shared portal once -->
    <ContextMenuPortal />
  </div>
</template>
```

> [!IMPORTANT]
> Do **not** mount `<ContextMenuPortal>` more than once. Because the state is a singleton, a second instance would register duplicate window listeners.

---

## `useContextMenu()`

Import and call in any component that needs to trigger the menu.

```ts
import { useContextMenu } from '@/composables/useContextMenu'

const { openContextMenu, closeContextMenu, ctxMenuState } = useContextMenu()
```

### Returns

| Return | Type | Description |
|---|---|---|
| `openContextMenu` | `(event: MouseEvent, actions: ContextMenuAction[]) => void` | Opens the menu at cursor position |
| `closeContextMenu` | `() => void` | Closes the menu |
| `ctxMenuState` | `Ref<{ show, x, y, actions }>` | Reactive state (usually consumed by the portal only) |

---

## `ContextMenuAction` type

```ts
interface ContextMenuAction {
  label: string
  icon?: object | string   // HugeiconsIcon object or CSS class string
  onClick?: () => void
  variant?: 'default' | 'delete'  // 'delete' applies destructive styling
  separator?: boolean              // renders a divider above this item
}
```

---

## Basic Usage

```vue
<script setup lang="ts">
import { ViewIcon, PlusSignIcon } from '@hugeicons/core-free-icons'
import { useContextMenu } from '@/composables/useContextMenu'
import { useRouter } from 'vue-router'

const router = useRouter()
const { openContextMenu } = useContextMenu()

function onRightClick(event: MouseEvent) {
  openContextMenu(event, [
    {
      label: 'View',
      icon: ViewIcon,
      onClick: () => router.push('/admin/users'),
    },
    {
      label: 'Create New',
      icon: PlusSignIcon,
      separator: true,
      onClick: () => router.push('/admin/users/create'),
    },
  ])
}
</script>

<template>
  <div @contextmenu="onRightClick">
    Right-click me
  </div>
</template>
```

---

## Real-world Examples

### Sidebar items (`AppSidebar.vue`)

Every sidebar nav item opens a context menu with **View** and optionally **Create New** shortcuts:

```ts
function openSidebarCtx(event: MouseEvent, item: NavItem) {
  if (!item.to) return

  const viewPath = `${adminPrefix.value}${item.to.replace('/admin', '')}`

  const actions = [
    { label: t('actions.view', 'View'), icon: ViewIcon, onClick: () => router.push(viewPath) },
  ]

  if (item.createRoute) {
    const createPath = `${adminPrefix.value}${item.createRoute.replace('/admin', '')}`
    actions.push({
      label: t('actions.create', 'Create New'),
      icon: PlusSignIcon,
      separator: true,
      onClick: () => router.push(createPath),
    } as any)
  }

  openContextMenu(event, actions)
}
```

```vue
<SidebarMenuButton @contextmenu="openSidebarCtx($event, item)">
  ...
</SidebarMenuButton>
```

### DataTable rows (`DataTable.vue`)

Pass a `contextMenu` prop to `<DataTable>` and rows will automatically wire up right-click:

```vue
<DataTable
  :data="rows"
  :columns="columns"
  :context-menu="(row) => [
    { label: 'Edit', icon: Edit01Icon, onClick: () => router.push(`/admin/users/${row.id}/edit`) },
    { label: 'Delete', icon: Delete01Icon, variant: 'delete', separator: true, onClick: () => deleteUser(row.id) },
  ]"
/>
```

---

## Viewport-aware Positioning

The menu is automatically repositioned if it would overflow the viewport edge:

```ts
const menuW = 200
const menuH = actions.length * 44 + 16

state.value = {
  show: true,
  x: Math.min(event.clientX, window.innerWidth  - menuW - 8),
  y: Math.min(event.clientY, window.innerHeight - menuH - 8),
  actions,
}
```

---

## Closing Behaviour

The menu closes automatically on:

| Trigger | Handler |
|---|---|
| Click anywhere | `window click` listener in `useContextMenuPortal` |
| Right-click elsewhere | `window contextmenu` listener (with `justOpened` guard to avoid closing the menu that was just opened) |
| `Escape` key | `window keydown` listener |

---

## File Reference

| File | Role |
|---|---|
| `src/composables/useContextMenu.ts` | Singleton state + composable exports |
| `src/components/ui/ContextMenuPortal.vue` | Global floating menu renderer |
| `src/components/uic/context-menu/` | Low-level shadcn/ui primitives (alternative declarative API) |

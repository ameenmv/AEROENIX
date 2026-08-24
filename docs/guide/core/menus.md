# Navigation & Menus

The sidebar navigation is defined in a single config file and automatically integrates with permissions and i18n.

## NavItem Interface

```ts
interface NavItem {
  name: string          // Unique identifier
  label: string         // i18n key (e.g., 'menu.home')
  icon: any             // HugeIcons icon component
  to?: string           // Route path
  permission?: string   // Required permission to see this item
  children?: NavItem[]  // Nested sub-menu items
}
```

## Defining Navigation

Edit `src/lib/navigation.ts`:

```ts
import {
  Home01Icon,
  UserGroupIcon,
  Folder01Icon,
  Settings01Icon,
} from '@hugeicons/core-free-icons'

export const navigationConfig: NavItem[] = [
  {
    name: 'home',
    label: 'menu.home',
    icon: Home01Icon,
    to: '/admin/dashboard',
    permission: 'statistics.view',
  },
  {
    name: 'users',
    label: 'menu.users',
    icon: UserGroupIcon,
    to: '/admin/users',
    permission: 'users.view',
  },
  {
    name: 'projects',
    label: 'menu.projects',
    icon: Folder01Icon,
    to: '/admin/projects',
    permission: 'projects.view',
  },
]
```

## Nested Menus

Use `children` for dropdown sub-menus:

```ts
{
  name: 'settings',
  label: 'menu.settings',
  icon: Settings01Icon,
  permission: 'settings.view',
  children: [
    {
      name: 'general',
      label: 'menu.settings_general',
      icon: Settings01Icon,
      to: '/admin/settings/general',
      permission: 'settings.view',
    },
    {
      name: 'roles',
      label: 'menu.settings_roles',
      icon: UserGroupIcon,
      to: '/admin/settings/roles',
      permission: 'roles.view',
    },
  ],
}
```

::: tip
Parent items with `children` should **not** have a `to` property — they just expand to show the sub-menu.
:::

## Permission-Based Visibility

Menu items with a `permission` key are **automatically hidden** from users who lack that permission:

```ts
{
  name: 'users',
  label: 'menu.users',
  icon: UserGroupIcon,
  to: '/admin/users',
  permission: 'users.view',  // Only visible if user has 'users.view'
}
```

The sidebar component checks permissions using `useCan()`:

```ts
const { can } = useCan()

// Only show if user has permission (or no permission is required)
const visibleItems = navigationConfig.filter(item =>
  !item.permission || can(item.permission)
)
```

## Adding a Menu Item After Scaffolding

After running `bun make` to scaffold a new resource, add a navigation entry:

```ts
import { Building01Icon } from '@hugeicons/core-free-icons'

// Add to navigationConfig array:
{
  name: 'clients',
  label: 'menu.clients',
  icon: Building01Icon,
  to: '/admin/clients',
  permission: 'clients.view',
}
```

Then add the i18n key in `src/i18n/locales/en/menu.json`:

```json
{
  "clients": "Clients"
}
```

## Using HugeIcons

The framework uses [HugeIcons](https://hugeicons.com/) for all icons. Import from `@hugeicons/core-free-icons`:

```ts
import { Home01Icon, UserGroupIcon, Folder01Icon } from '@hugeicons/core-free-icons'
```

Browse available icons at [hugeicons.com](https://hugeicons.com/).

## Sidebar State

The sidebar state is managed by the `useSidebar` composable:

```ts
import { useSidebar } from '@/composables/useSidebar'

const { isOpen, isMobileOpen, isCollapsed, toggle, toggleCollapse, close, open } = useSidebar()
```

| Property | Description |
|---|---|
| `isOpen` | Desktop sidebar open state |
| `isMobileOpen` | Mobile sidebar open state |
| `isCollapsed` | Whether sidebar shows icons only |
| `toggle()` | Toggle open/close (responsive) |
| `toggleCollapse()` | Toggle icon-only mode |
| `close()` | Close mobile sidebar |
| `open()` | Open sidebar (responsive) |

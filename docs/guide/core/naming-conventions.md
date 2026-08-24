# Naming Conventions

Consistent naming makes the codebase predictable and easy to navigate.

## Files & Directories

| Item                | Convention       | Example                    |
|---------------------|------------------|----------------------------|
| Vue components      | `PascalCase.vue` | `ResourcePage.vue`         |
| Composables         | `camelCase.ts`   | `useResource.ts`           |
| Services            | `camelCase.ts`   | `usersService.ts`          |
| Stores              | `camelCase.ts`   | `authStore.ts`             |
| Types               | `kebab-case.ts`  | `resource-form.ts`         |
| Resource configs    | `camelCase.ts`   | `users.ts` (in `lib/resources/`) |
| Module registrations| `camelCase.ts`   | `users.ts` (in `modules/`) |

## Resource Naming

When creating a new resource, use the **plural lowercase** form everywhere:

```
Resource name: "clients"

src/lib/resources/clients.ts     → export function clientsConfig()
src/services/clientsService.ts   → export const clientsService
src/modules/clients.ts           → registerModule({ name: 'clients', ... })
src/views/admin/clients/         → IndexView.vue, components/
src/types/entities/clients.ts    → export interface Client { ... }
src/schemas/clients.ts           → export const ClientSchema = z.object(...)
```

## CSS Variables

CSS variables follow the `--category-name` pattern:

```css
/* Backgrounds */
--bg-main, --bg-surface, --bg-surface-hover

/* Text colors */
--text-primary, --text-secondary, --text-muted

/* Borders */
--border-main, --border-strong

/* Brand/semantic colors */
--color-brand, --color-success, --color-warning, --color-danger
```

::: tip
Always use CSS variables instead of hard-coded colors so dark/light mode switching works automatically.
:::

## Route Names

Routes follow the pattern `{section}-{resource}-{action?}`:

```
admin-users           → users index
admin-users-create    → create user (auto-generated)
admin-users-view      → view user (auto-generated)
admin-users-edit      → edit user (auto-generated)
```

## Permission Keys

Permissions follow the pattern `{resource}.{action}`:

```
users.view
users.manage
users.delete
statistics.view
```

## Git Commits

All commit messages are written in **lowercase only**.

```bash
git commit -m "add clients resource with filters and export"
```

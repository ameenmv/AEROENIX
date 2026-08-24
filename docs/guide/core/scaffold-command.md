# Scaffold Command

The `bun make` command (aliased to `bun make:module`) generates all files needed for a new modular resource via an interactive CLI wizard.

## Usage

```bash
# Interactive wizard
bun make

# Pass resource name directly
bun make clients

# Preview what would be created (no files written)
bun make -- --dry-run

# Force overwrite existing files
bun make -- --force
```

## Wizard Steps

The wizard walks you through 8 steps:

| Step | Prompt | Default |
|------|--------|---------|
| 1 | Resource name (kebab-case) | — |
| 2 | Feature selection (Index, Create, Edit, Show, Mock Data) | All selected |
| 3 | Permission key (optional) | OFF |
| 4–6 | Open mode per view (Full Page or Modal) | Full Page |
| 7 | Table actions style (Inline Buttons or Dropdown Menu ⋮) | Inline |
| 8 | Summary & confirm | — |

### Feature Selection

Toggle which views to generate:
- **Index (List Page)** — always included
- **Create Page** — optional
- **Edit Page** — optional
- **Show (Detail) Page** — optional
- **Mock Data (faker.js)** — optional, generates mock data with auto-fallback

### Actions Style

Choose how table row actions are displayed:

- **Inline Buttons** — View, Edit, Delete icons side-by-side
- **Dropdown Menu (⋮)** — Three-dot menu using shadcn `DropdownMenu`, generates a `partials/ActionsDropdown.vue` component

## What Gets Generated

Running `bun make` for a resource called `clients` creates:

| File | Purpose |
|---|---|
| `src/modules/clients/schema.ts` | Zod validation schema |
| `src/modules/clients/index.ts` | Module registration & routes |
| `src/modules/clients/endpoints.ts` | API endpoint constants |
| `src/views/admin/clients/IndexView.vue` | List page with DataTable |
| `src/views/admin/clients/CreateView.vue` | Create form page |
| `src/views/admin/clients/EditView.vue` | Edit form page |
| `src/views/admin/clients/ShowView.vue` | Detail view page |
| `src/views/admin/clients/partials/ActionsDropdown.vue` | Dropdown actions (if selected) |
| `src/types/entities/clients.ts` | TypeScript entity interface |
| `src/services/clientsService.ts` | API service |
| `src/services/mock/clientsMock.ts` | Faker mock data (if selected) |
| `src/i18n/locales/en/clients.json` | English translations |
| `src/i18n/locales/ar/clients.json` | Arabic translations |

## What Gets Auto-Updated

The scaffold also **automatically** modifies these existing files:

| File | What's Added |
|---|---|
| `src/types/index.ts` | Entity export |
| `src/router/index.ts` | Module import |
| `src/config/navigation.ts` | Sidebar nav item |
| `src/i18n/locales/en/menu.json` | Menu label (English) |
| `src/i18n/locales/ar/menu.json` | Menu label (needs Arabic translation) |

## After Scaffolding

Most wiring is automatic. You just need to:

1. **Define fields** in `src/modules/clients/schema.ts`
2. **Add columns** in `IndexView.vue`
3. **Add form fields** in `CreateView.vue` and `EditView.vue`
4. **Add detail fields** in `ShowView.vue`
5. **Update entity type** in `src/types/entities/clients.ts`
6. **Add more i18n keys** in `src/i18n/locales/{en,ar}/clients.json`
7. **Translate the Arabic menu label** in `src/i18n/locales/ar/menu.json`
8. **Add mock fields** in `src/services/mock/clientsMock.ts` (if mock data selected)

## Safety Features

### Duplicate Detection
If a module with the same name already exists, the wizard **blocks input** immediately:

```
✗ Module "clients" already exists at src/modules/clients/. Use --force to overwrite.
```

### Overwrite Protection
Existing files are **skipped** with a warning:

```
  ⏭️  src/views/admin/clients/IndexView.vue  (already exists, use --force to overwrite)
```

### `--dry-run`
Preview what would be generated without writing any files:

```bash
bun make -- --dry-run
```

### `--force`
Overwrite all existing files (use with caution):

```bash
bun make -- --force
```

::: warning
`--force` will overwrite any custom code you've written in the generated views. Use only when you want a fresh re-scaffold.
:::

## Module Removal (`bun unmake`)

To **remove** a scaffolded module and clean all references:

```bash
# Interactive — pick from a list
bun unmake

# Direct — pass module name
bun unmake clients

# Auto-confirm (no prompt)
bun unmake clients -y

# Preview what would be removed
bun unmake -- --dry-run
```

This deletes all generated files and cleans references from `router/index.ts`, `types/index.ts`, `navigation.ts`, and `menu.json` (en + ar).

::: tip
The scaffold command handles all the boilerplate and wiring. You just need to customize the schema, columns, and form fields.
:::

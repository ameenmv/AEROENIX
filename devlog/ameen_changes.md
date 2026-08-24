# Ameen's Changes — Scaffold & useTable Hardening

> **Date:** 2026-04-03
> **Scope:** `scripts/scaffold-module.ts`, `src/composables/useTable.ts`, `src/types/`, VitePress docs

---

## 1. Scaffold Script (`bun make`) — Bug Fixes

### 🐛 `</script>` Double Escape
- **File:** `scripts/scaffold-module.ts` (IndexView template)
- **Problem:** The closing `<script>` tag was escaped as `<\\/script>` (double backslash) causing Vue compiler errors.
- **Fix:** Changed to `<\/script>` (single escape) which Vite handles correctly at runtime.

### 🐛 ConfirmModal Wrong Import Path
- **File:** `scripts/scaffold-module.ts` (IndexView template)
- **Problem:** Import used `@/components/common/ConfirmModal.vue` — this path doesn't exist.
- **Fix:** Changed to `@/components/ui/modals/ConfirmModal.vue`.

### 🐛 Non-existent `useResourceMutation`
- **File:** `scripts/scaffold-module.ts` (IndexView template)
- **Problem:** Template imported `useResourceMutation` from composables, but this composable was never built.
- **Fix:** Replaced with `useMutation` and `useQueryClient` from `@tanstack/vue-query`, which is the established project pattern.

### 🐛 ConfirmModal Missing `:show` Prop
- **File:** `scripts/scaffold-module.ts` (IndexView template)
- **Problem:** Template used `v-if="confirmState.show"` but `ConfirmModal` requires a `:show` binding because it uses `AlertDialog` with `:open` prop internally.
- **Fix:** Changed to `:show="confirmState.show"` so the dialog properly opens/closes via data binding.

### 🐛 Entity Type Not Compatible with DataTable
- **File:** `scripts/scaffold-module.ts` (entity template)
- **Problem:** Generated entity interfaces (e.g., `interface Users { id: number }`) don't satisfy `Record<string, unknown>` which `DataTable`'s `:data` prop requires.
- **Fix:** Added `[key: string]: unknown` index signature to the generated entity interface.

---

## 2. Scaffold Script — New Features

### ✨ Overwrite Protection
- **What:** Added a `safeWrite()` helper that checks if a file exists before writing. Existing files are skipped with a ⏭️ warning.
- **Why:** Previously, running `bun make` twice with the same name would silently overwrite all customized code.

### ✨ `--force` Flag
- **Usage:** `bun make -- --force`
- **What:** Skips the overwrite check and regenerates all files.
- **Why:** Sometimes you need a clean re-scaffold (e.g., after significant template updates).

### ✨ `--dry-run` Flag
- **Usage:** `bun make -- --dry-run`
- **What:** Shows what files would be created/overwritten without actually writing anything.
- **Why:** Useful to preview the scaffold output before committing to it.

### ✨ Auto Navigation Config
- **What:** `bun make` now auto-appends a nav item to `src/config/navigation.ts`.
- **Why:** This was a manual step that developers kept forgetting, causing "where's my module?" confusion.

### ✨ Auto `menu.json`
- **What:** Auto-adds the English key to `en/menu.json` and `ar/menu.json`.
- **Why:** The sidebar uses `t('menu.{resource}')` — without the key, the raw i18n path shows as the label.
- **Note:** Arabic value defaults to PascalCase English — needs manual Arabic translation.

### ✨ Auto i18n Files
- **What:** Creates `en/{resource}.json` and `ar/{resource}.json` with starter keys (`title`, `subtitle`, `fields.created_at`).
- **Why:** Every module needs these basic keys. Auto-generating them saves time and ensures consistency.

### ✨ Subtitle in IndexView Template
- **What:** The generated IndexView now includes a subtitle paragraph under the page title.
- **Why:** Better UX — provides context for what the page does.

---

## 3. `useTable` Composable — Performance Fixes

### ⚡ Debounced Query Params (`refDebounced`)
- **File:** `src/composables/useTable.ts`
- **Problem:** During component mount, `DataTable` emits multiple events (page, perPage, search, sort) which each triggered a separate API request.
- **Fix:** Wrapped `queryParams` with `refDebounced(queryParams, 150)` from VueUse. Rapid changes within 150ms batch into one request.

### ⚡ Disabled Auto-Retry (`retry: false`)
- **File:** `src/composables/useTable.ts`
- **Problem:** TanStack Query's default behavior retries failed requests 3 times (1 initial + 3 retries = 4 total requests on failure).
- **Fix:** Set `retry: false` — if a list request fails, show the error immediately without silent retries.

### ⚡ Controlled Cache Lifetime (`gcTime: 30_000`)
- **File:** `src/composables/useTable.ts`
- **Problem:** Default `gcTime` (5 min) keeps stale data in memory too long for fintech-sensitive data.
- **Fix:** Set `gcTime: 30_000` (30s) — cached data is cleared 30 seconds after leaving the page.

### ✨ `refetchOnFocus` Option (default: `false`)
- **Files:** `src/composables/useTable.ts`, `src/types/composables/table.ts`
- **Problem:** TanStack Query's default `refetchOnWindowFocus: true` causes an API call every time the user switches browser tabs.
- **Fix:** New `refetchOnFocus` option (defaults to `false`). Pass `refetchOnFocus: true` to opt-in for real-time tables.

---

## 4. AdminLayout — Title/Subtitle Slots
- **File:** `src/components/layout/AdminLayout.vue`
- **What:** Added `#title` and `#subtitle` named slots for page headers.
- **Why:** Consistent header pattern across pages without duplicating markup.

---

## Files Modified

| File | Type |
|------|------|
| `scripts/scaffold-module.ts` | Bug fixes + new features |
| `src/composables/useTable.ts` | Performance optimizations |
| `src/types/composables/table.ts` | New `refetchOnFocus` option |
| `src/components/layout/AdminLayout.vue` | Title/subtitle slots |
| `src/types/entities/users.ts` | Index signature fix |
| `src/i18n/locales/en/users.json` | Added missing keys |
| `src/i18n/locales/ar/users.json` | Added missing keys |
| `docs/guide/core/scaffold-command.md` | Updated docs |
| `docs/guide/modular/use-table.md` | Updated docs |

---

# Session 2 — Interactive Wizard & Module Lifecycle

> **Date:** 2026-04-03 (evening)
> **Scope:** `scripts/scaffold-module.ts`, `scripts/remove-module.ts`, `src/composables/useTable.ts`, `src/components/ui/tables/DataTable.vue`

---

## 5. Scaffold Wizard — Interactive Multi-Step Flow

### ✨ Feature Selection (Step 2)
- Developers can toggle which views to generate: Index, Create, Edit, Show, Mock Data.
- Only selected views are scaffolded — no unused boilerplate.

### ✨ Per-View Open Mode (Steps 4–6)
- Each view (Create/Edit/Show) gets a `rawlist` prompt: `Full Page` or `Modal`.
- Sets `meta.openMode` in the route definition accordingly.

### ✨ Actions Style (Step 7)
- New step: choose between `Inline Buttons` or `Dropdown Menu (⋮)` for table row actions.
- **Inline:** View / Edit / Delete buttons shown side-by-side (original behavior).
- **Dropdown:** Generates `partials/ActionsDropdown.vue` using shadcn `DropdownMenu`, with ⋮ trigger, View/Edit items, separator, and destructive Delete item.

### ✨ Permission Toggle (Step 3)
- Permissions are now optional. If disabled, no `v-can` directives or `permissionKey` are generated.
- Useful for early development before backend RBAC is wired.

### ✨ Duplicate Module Detection
- If `src/modules/{name}/` already exists, the wizard **blocks input** with a clear error message.
- Use `--force` flag to override and re-scaffold.

---

## 6. Module Removal (`bun unmake`)

### ✨ New Script: `scripts/remove-module.ts`
- **Interactive:** Lists all existing modules for selection, or accepts module name as argument.
- **Flags:** `--dry-run` (preview), `-y` (auto-confirm).

### Files Deleted
| Target | Path |
|---|---|
| Module | `src/modules/{name}/` |
| Views + partials | `src/views/admin/{name}/` |
| Service | `src/services/{name}Service.ts` |
| Mock data | `src/services/mock/{name}Mock.ts` |
| Entity type | `src/types/entities/{name}.ts` |
| i18n | `src/i18n/locales/{en,ar}/{name}.json` |

### References Cleaned
| File | What's Removed |
|---|---|
| `src/router/index.ts` | Module import line |
| `src/types/index.ts` | Entity export line |
| `src/config/navigation.ts` | Nav item block |
| `src/i18n/locales/en/menu.json` | Menu key |
| `src/i18n/locales/ar/menu.json` | Menu key |

---

## 7. Icon Fix — HugeiconsIcon Wrapper

- **Problem:** Scaffold templates used `<ViewIcon />` directly — but `@hugeicons/core-free-icons` exports data objects, not Vue components. Icons rendered nothing.
- **Fix:** All templates now use `<HugeiconsIcon :icon="ViewIcon" :size="16" />` wrapper from `@hugeicons/vue`.

---

## 8. Mock Data Auto-Fallback

- **File:** `src/composables/useTable.ts`
- **Problem:** Mock data used to rely on a global `VITE_USE_MOCK_DATA=true` env var which is now removed.
- **Fix:** If `mockData` is provided and the API request fails (404), `useTable` now falls back to mock data **automatically** without requiring the env var.

---

## Files Modified (Session 2)

| File | Type |
|------|------|
| `scripts/scaffold-module.ts` | Interactive wizard, actions style, icons, duplicate detection |
| `scripts/remove-module.ts` | **[NEW]** Module removal wizard |
| `package.json` | Added `unmake` + `unmake:module` scripts |
| `src/composables/useTable.ts` | Mock data auto-fallback |
| `src/components/ui/tables/DataTable.vue` | Skeleton loading (already existed) |

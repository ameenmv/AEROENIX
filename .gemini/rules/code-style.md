# Code Style Rules

## Vue Components
- Always use `<script setup lang="ts">` with Composition API.
- SFC tag order: `<script>` → `<template>` → `<style>` (enforced by `bun clean:reorder-tags`).
- No consecutive empty lines (enforced by `bun clean:empty-lines`).

## UI Components
- Use pre-built components in `src/components/uic/` (shadcn/ui style built on reka-ui).
- Do not install new UI libraries without permission.
- Use `<Logo />` component instead of raw `<img>` tags for branding.

## Icons
- Use `@hugeicons/vue` and import from `@hugeicons/core-free-icons`.
- Fallback: `lucide-vue-next`.

## CSS & Theming
- Use Tailwind v4 utility classes.
- Use `clsx` and `tailwind-merge` via `cn()` utility in `src/utils/`.
- Always use CSS variables (`var(--background)`, `var(--primary)`, etc.) — never hard-code colors.
- Use custom Tailwind variants `modal:` and `full:` for view-mode-responsive form layouts.
- Use `neop-*` CSS classes (`.neop-table`, `.neop-form-container`, `.neop-btn-save`, etc.) for consistent styling.

## TypeScript
- Use strict typing.
- Export entity interfaces in `src/types/entities/`.
- Export composable option types in `src/types/composables/`.

## Formatting & Linting
- ESLint: `@antfu/eslint-config` with auto-fix (`bun lint`).
- Prettier: `bun format`.
- Pre-commit hooks via Husky + lint-staged auto-lint and format staged files.

## Naming Conventions
- Vue components: `PascalCase.vue`
- Composables: `camelCase.ts` (e.g. `useResource.ts`)
- Services: `camelCase.ts` (e.g. `usersService.ts`)
- Resource names: **plural lowercase** everywhere (e.g. `clients`, `products`)
- CSS variables: `--category-name` (e.g. `--bg-main`, `--text-primary`)
- Route names: `admin-<resource>-<action?>` (e.g. `admin-users-create`)
- Permission keys: `<resource>.<action>` (e.g. `users.view`)
- Git commits: **lowercase only** (e.g. `add clients resource with filters`)

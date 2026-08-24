---
description: Review a Vue component or module for code quality, conventions, and best practices
---

# /project:review

Review the specified file(s) or module for adherence to project conventions.

## Steps

1. **Check SFC structure**: Ensure `<script setup lang="ts">` → `<template>` → `<style>` tag order.
2. **Imports**: Verify auto-imported APIs are NOT manually imported (Vue APIs, Vue Router, Pinia, VueUse). Verify composables, services, types, and external libs ARE manually imported.
3. **Naming**: Check file naming (`PascalCase.vue` for components, `camelCase.ts` for services/composables).
4. **Theming**: Ensure no hard-coded colors — must use CSS variables (`var(--background)`, `var(--primary)`, etc.).
5. **i18n**: Ensure all user-facing strings use `t('namespace.key', 'Fallback')` — no raw text in templates.
6. **Permissions**: Check that `v-can` directive or `<PermGuard>` is used for permission-gated UI.
7. **TypeScript**: Ensure strict typing, no `any` types unless justified.
8. **Data Fetching**: Ensure TanStack Query is used (not raw `onMounted` + `fetch`).

---
description: Diagnose and fix an issue in the codebase
---

# /project:fix-issue

Diagnose and resolve a reported bug or issue.

## Steps

1. **Reproduce**: Understand the issue and identify affected files.
2. **Check route configuration**: Look at `src/modules/<resource>.ts` and `src/router/index.ts` for route issues.
3. **Check composables**: Review `useTable`, `useForm`, `usePage` usage for data flow issues.
4. **Check i18n**: Run `bun i18n:report` if missing translations are suspected.
5. **Check permissions**: Verify `permissionKey` in `registerModule()` and `v-can` directives.
6. **Check types**: Run `bun x vue-tsc -b` for TypeScript errors.
7. **Fix & Verify**: Apply the fix, run `bun lint` to auto-format, and `bun test` to verify.
8. **Commit**: Use lowercase commit message describing the fix (e.g. `fix users table pagination issue`).

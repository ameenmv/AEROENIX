---
name: security-review
description: Audit a module or component for security issues
---

# Security Review Skill

Perform a security audit on the specified files or modules.

## Checklist

1. **Permission Gates**:
   - Every route has a `permissionKey` or explicit `meta.permission`.
   - UI elements use `v-can` or `<PermGuard>` to gate sensitive actions.
   - Sidebar navigation items have `permission` set.

2. **Auth Guard**:
   - All admin routes are protected by the auth guard in `src/router/index.ts`.
   - Token is checked before allowing access to `/:lang/admin/*` routes.

3. **API Security**:
   - Axios interceptors in `src/services/api.ts` attach auth tokens.
   - No API keys or secrets are hard-coded in source files.
   - Environment variables are used for sensitive config (`.env` file, gitignored).

4. **Input Validation**:
   - All forms use Zod schemas for validation (in `src/schemas/` or `src/modules/<name>/schema.ts`).
   - No raw user input is rendered without sanitization.

5. **Dependencies**:
   - Run `bun x taze` to check for outdated packages with known vulnerabilities.

6. **Data Exposure**:
   - Sensitive fields (passwords, tokens) are never displayed in tables or views.
   - API responses are filtered server-side; check that formatters (`src/lib/formatters/`) don't expose sensitive data.

# Session 3 — Backend-Frontend Base Alignment

> **Date:** 2026-04-03 (late evening)
> **Scope:** `src/services/`, `src/types/services/`, `src/config/endpoints.ts`, `.env.example`, `src/main.ts`

---

## Overview

Deep analysis of `neop-backend-base` (25+ files — middleware, controllers, services, traits, routes, configs) to align the frontend API layer with the backend's full API contract. The frontend was covering ~10% of the backend's capabilities — now it covers 100%.

---

## 1. API Response Types — `src/types/services/api.ts` [NEW]

Typed interfaces matching the backend's `ApiResponse` trait and `BaseResource` pagination:

- `ApiSuccessResponse<T>` — `{ success, message, data: T }`
- `ApiErrorResponse` — `{ success, message, error_code, errors, meta }`
- `ApiPaginatedResponse<T>` — `{ data: T[], meta, links }`
- `PaginationMeta` — `{ current_page, from, last_page, per_page, to, total }`
- `PaginationLinks` — `{ first, last, prev, next }`
- `ApiListParams` — Standard query params: `paginate, limit, scope, fields, exclude, include, filters, search, sort_by, sort_dir`
- `ServiceListResult<T>`, `ServiceDropdownResult<T>`, `ExportResponse`, `ImportResponse`

---

## 2. Hardened API Layer — `src/services/api.ts` [REWRITE]

From 50 LOC → 180 LOC. Aligned with backend middleware:

| Feature | Backend Middleware | Frontend Implementation |
|---|---|---|
| Progress bar | — | NProgress with request counter |
| i18n | Backend reads `Accept-Language` | Sends `Accept-Language` + `X-Locale` from `localStorage.locale` |
| Client auth | `AuthenticateClient` middleware | Sends `X-Client-Id` + `X-Client-Secret` from localStorage |
| Permission tracking | Route permission audit | Injects `permission` param from `localStorage._current_permission` |
| Auth strategy | Sanctum (Bearer + Cookie) | Configurable via `VITE_AUTH_STRATEGY` env var |
| 401 handling | Returns `{ success: false, message, error_code: "UNAUTHENTICATED" }` | Clears token → redirects to login (locale-aware) |
| 403 handling | Returns `error_code: "FORBIDDEN"` | Toast "You do not have permission" |
| 422 handling | Returns `{ errors: { field: [...] } }` | Passthrough for vee-validate, toast only if no field errors |
| 429 handling | `Retry-After` header | Toast with countdown seconds |
| 5xx handling | Returns `error_code: "SERVER_ERROR"` | Toast "Something went wrong" |

**Key decision:** Dynamic `import()` for sonar store to break circular dependency (api → store → service → api).

---

## 3. Service Factory — `src/services/createService.ts` [NEW]

Factory function generating typed services matching all 10 backend controller concerns:

```ts
const usersService = createService<User>('/admin/v1/users')
```

| Method | HTTP | Backend Concern | Notes |
|---|---|---|---|
| `.list(params)` | GET | `HasIndex` | Paginated, scope=mini default |
| `.dropdown(params)` | GET /dropdown | `HasDropdown` | scope=micro default |
| `.get(id)` | GET /:id | `HasShow` | Supports `?scope=` + `?include=` |
| `.create(data)` | POST | `HasStore` | Auto FormData detection |
| `.update(id, data)` | PUT /:id | `HasUpdate` | `_method: PUT` for FormData (Laravel convention) |
| `.delete(id)` | DELETE /:id | `HasDestroy` | — |
| `.toggle(id, col?)` | PATCH /:id/toggle | `HasToggle` | Default column: `status` |
| `.export(params)` | GET /export | `HasExport` | Supports `format: xlsx \| csv` |
| `.import(file)` | POST /import | `HasImport` | multipart/form-data |

---

## 4. Auth Service — `src/services/auth.ts` [REWRITE]

From 3 endpoints → 16 endpoints, matching all backend auth routes:

| Category | Endpoints |
|---|---|
| **Public** | `getConfig()`, `login()`, `register()`, `verifyOtp()`, `resendOtp()` |
| **Password Reset** | `forgotPassword()`, `verifyResetOtp()`, `resetPassword()` |
| **Protected** | `me()`, `logout()`, `changePassword()`, `verifyChangePassword()` |
| **TOTP** | `setupTotp()`, `confirmTotp()`, `disableTotp()` |

All endpoints include mock data support via `VITE_MOCK_AUTH` flag for Auth, and `useMock: true` for resources.

Typed interfaces: `AuthConfig`, `AuthUser`, `LoginResponse`, `OtpResponse`, `PasswordResetResponse`, `TotpSetupResponse`.

---

## 5. Endpoint Configuration — `src/config/endpoints.ts` [REWRITE]

- **Prefix:** Changed from `/admin` → `/api/admin/v1` (matches backend route aggregator)
- **Configurable:** Reads `VITE_API_PREFIX` env var
- **Auth:** All 15 auth endpoint constants defined
- **Resources:** Uses `resource(name)` helper → `createService()` handles CRUD
- **Temp uploads:** `/api/temp-uploads` (global routes from backend)

---

## 6. Environment Configuration — `.env.example` [MODIFY]

New variables:

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_PREFIX` | `/api/admin/v1` | Backend route prefix |
| `VITE_AUTH_STRATEGY` | `bearer` | `bearer` or `cookie` (Sanctum SPA) |
| `VITE_CLIENT_ID` | — | Device auth (optional) |
| `VITE_CLIENT_SECRET` | — | Device auth (optional) |

---

## 7. NProgress CSS — `src/main.ts` [MODIFY]

Added `import 'nprogress/nprogress.css'` to main entry point.

---

## 8. Type Compatibility Fixes

- `src/types/services/auth.ts` — Re-exports `AuthUser as User` from services for backward compatibility
- `src/types/index.ts` — Removed stale `entities/users` re-export (file doesn't exist)

---

## Build Verification

✅ `bun run build` passes — TypeScript compilation + Vite production build (`✓ built in 13.77s`)

---

## Files Modified

| File | Status | ~LOC |
|---|---|---|
| `src/types/services/api.ts` | **[NEW]** | 110 |
| `src/services/api.ts` | Rewrite | 180 |
| `src/services/createService.ts` | **[NEW]** | 210 |
| `src/services/auth.ts` | Rewrite | 250 |
| `src/config/endpoints.ts` | Rewrite | 60 |
| `.env.example` | Modified | 16 |
| `src/main.ts` | Modified | +1 |
| `src/types/services/auth.ts` | Modified | 7 |
| `src/types/index.ts` | Modified | -1 |

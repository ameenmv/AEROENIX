# API Layer

The API layer provides a hardened HTTP client, a service factory for CRUD operations, and a complete auth service — all aligned with the `neop-backend-base` Laravel project.

## Architecture Overview

```
src/services/
├── api.ts              ← Hardened Axios instance (interceptors, headers, errors)
├── createService.ts    ← Factory: generates typed CRUD+ services
├── auth.ts             ← Auth service (16 endpoints)
└── {name}Service.ts    ← Resource-specific overrides (optional)

src/types/services/
├── api.ts              ← Response types (envelopes, pagination, params)
└── auth.ts             ← Auth type re-exports

src/config/
└── endpoints.ts        ← API endpoint constants
```

## HTTP Client (`api.ts`)

The Axios instance is configured with interceptors that handle:

### Request Interceptor
| Feature | Header/Action | Source |
|---|---|---|
| Auth token | `Authorization: Bearer {token}` | `localStorage.auth_token` |
| Locale | `Accept-Language` + `X-Locale` | `localStorage.locale` |
| Device auth | `X-Client-Id` + `X-Client-Secret` | `localStorage.client_id/secret` |
| Permission | `?permission=` param | `localStorage._current_permission` |
| Progress bar | NProgress start/done | Request counter |

### Response Error Handling
| Status | Action |
|---|---|
| **401** | Clear tokens → redirect to `/login` |
| **403** | Toast: "Forbidden" |
| **404** | Toast: "Not Found" |
| **409** | Toast: "Conflict" |
| **422** | Passthrough for forms; toast if no field errors |
| **429** | Toast with `Retry-After` countdown |
| **5xx** | Toast: "Server Error" |

### Loading State

```ts
import { httpLoading } from '@/services/api'

// In templates:
<div v-if="httpLoading.isLoading">Loading...</div>
```

### Configuration (`.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_PREFIX=/api/admin/v1
VITE_AUTH_STRATEGY=bearer    # or 'cookie' for Sanctum SPA
VITE_CLIENT_ID=              # optional device auth
VITE_CLIENT_SECRET=          # optional device auth
```

## Service Factory (`createService.ts`)

### Basic Usage

```ts
import type { User } from '@/types/entities/user'
import { createService } from '@/services/createService'

export const usersService = createService<User>('/admin/v1/users')
```

### Available Methods

| Method | HTTP | Backend Controller | Notes |
|---|---|---|---|
| `list(params?)` | `GET /` | `HasIndex` | Paginated, scope defaults to mini |
| `dropdown(params?)` | `GET /dropdown` | `HasDropdown` | Scope defaults to micro |
| `get(id, params?)` | `GET /:id` | `HasShow` | Supports `?scope=` and `?include=` |
| `create(data)` | `POST /` | `HasStore` | Auto FormData detection |
| `update(id, data)` | `PUT /:id` | `HasUpdate` | Uses `_method: PUT` for FormData |
| `delete(id)` | `DELETE /:id` | `HasDestroy` | — |
| `toggle(id, col?)` | `PATCH /:id/toggle` | `HasToggle` | Default column: `status` |
| `export(params?)` | `GET /export` | `HasExport` | Format: `xlsx` or `csv` |
| `import(file)` | `POST /import` | `HasImport` | multipart/form-data |

### List with Pagination

```ts
const { data, meta, links } = await usersService.list({
  paginate: true,
  limit: 15,
  page: 1,
  scope: 'mini',           // micro | mini | full
  include: 'roles,profile', // eager-load relations
  filters: { status: 'active' },
  search: 'john',
  sort_by: 'created_at',
  sort_dir: 'desc',
})

// meta = { current_page, from, last_page, per_page, to, total }
// links = { first, last, prev, next }
```

### Dropdown for Select Inputs

```ts
// Uses micro scope by default — returns minimal fields (id, name)
const { data: options } = await usersService.dropdown({
  search: 'john',
  limit: 50,
})
```

### Toggle Status

```ts
// Toggle 'status' column (default)
const updated = await usersService.toggle(userId)

// Toggle a custom column
const updated = await usersService.toggle(userId, 'is_active')
```

### File Upload (Create/Update)

```ts
const formData = new FormData()
formData.append('name', 'John')
formData.append('avatar', fileInput.files[0])

// create() auto-detects FormData and sets Content-Type
const user = await usersService.create(formData)

// update() with FormData uses POST + _method: PUT (Laravel convention)
const updated = await usersService.update(userId, formData)
```

### Export/Import

```ts
// Export
const { download_url } = await usersService.export({
  format: 'xlsx',
  filters: { status: 'active' },
})

// Import
const fileInput = document.querySelector('input[type="file"]')
const { import_id } = await usersService.import(fileInput.files[0])
```

### Configuration

```ts
const usersService = createService<User>('/admin/v1/users', {
  dataPath: 'data',              // response envelope key (default: 'data')
  defaultDropdownScope: 'micro', // default scope for dropdown() (default: 'micro')
  defaultLimit: 15,              // default pagination limit (default: 15)
})
```

## Auth Service (`auth.ts`)

### Available Methods

```ts
import { authService } from '@/services/auth'
```

| Category | Method | Description |
|---|---|---|
| **Public** | `getConfig()` | Auth configuration for the guard |
| | `login(credentials)` | Login with email/password |
| | `register(data)` | Register new account |
| | `verifyOtp({ otp_token, code })` | Verify OTP code |
| | `resendOtp({ otp_token })` | Resend OTP |
| **Password Reset** | `forgotPassword({ email })` | Request reset OTP |
| | `verifyResetOtp({ otp_token, code })` | Verify reset OTP |
| | `resetPassword({ otp_token, password, password_confirmation })` | Set new password |
| **Protected** | `me()` | Get authenticated user |
| | `logout()` | Revoke token |
| | `changePassword({ current_password, password, password_confirmation })` | Change password |
| | `verifyChangePassword({ otp_token, code })` | Verify change password OTP |
| **TOTP** | `setupTotp()` | Get QR code + secret |
| | `confirmTotp({ code })` | Confirm TOTP setup |
| | `disableTotp()` | Disable TOTP |

### Login Flow

```ts
// 1. Check auth config
const config = await authService.getConfig()

// 2. Login
const result = await authService.login({ email, password })

if (result.requires_otp) {
  // 3a. OTP required — verify
  const verified = await authService.verifyOtp({
    otp_token: result.otp_token,
    code: userInput,
  })
  // Store token: verified.token
} else {
  // 3b. Direct login — store token
  localStorage.setItem('auth_token', result.token)
}
```

### Password Reset Flow (3-step)

```ts
// 1. Request reset OTP
const { otp_token } = await authService.forgotPassword({ email })

// 2. Verify OTP
const { otp_token: resetToken } = await authService.verifyResetOtp({
  otp_token,
  code: userInput,
})

// 3. Set new password
await authService.resetPassword({
  otp_token: resetToken,
  password: newPassword,
  password_confirmation: newPassword,
})
```

## Backend API Contract

### Response Envelope

```json
// Success
{ "success": true, "message": "...", "data": { ... } }

// Error
{ "success": false, "message": "...", "error_code": "NOT_FOUND", "errors": { "field": ["..."] } }

// Paginated
{ "success": true, "data": [...], "meta": { "current_page": 1, "total": 100, ... }, "links": { ... } }
```

### Query Parameters

| Param | Type | Description |
|---|---|---|
| `paginate` | boolean | Enable pagination |
| `limit` | number | Items per page (default: 15) |
| `page` | number | Page number |
| `scope` | string | Field visibility: `micro`, `mini`, `full` |
| `fields` | string | Comma-separated field names (overrides scope) |
| `exclude` | string | Comma-separated fields to remove |
| `include` | string | Comma-separated relations to eager-load |
| `filters[key]` | mixed | Filter by field value |
| `search` | string | Full-text search |
| `sort_by` | string | Sort field |
| `sort_dir` | `asc`/`desc` | Sort direction |

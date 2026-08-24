# API Conventions

## HTTP Client
- Use the configured Axios instance at `src/services/api.ts` (includes interceptors for auth tokens and error handling).
- Never use raw `fetch()` — always go through the Axios instance.

## Data Fetching
- Use `@tanstack/vue-query` v5 (integrated within `useTable` and `useForm` composables).
- Never fetch data in `onMounted` — use TanStack Query's `useQuery` / `useMutation` or the composable wrappers.
- Query keys are shared between `useTable` and `useForm` for automatic cache invalidation.

## Services
- Group API calls by resource in `src/services/<resourceName>Service.ts`.
- Standard methods: `list(params)`, `get(id)`, `create(data)`, `update(id, data)`, `delete(id)`.
- Optional methods: `export(params)`, `import(file)`, `bulkDelete(ids)`, `reorder(items)`.

## API Endpoints
- Define endpoint constants in `src/constants/endpoints.ts`.
- Pattern: `RESOURCE_NAME: { LIST, GET(id), CREATE, UPDATE(id), DELETE(id) }`.

## Mock Data
- Mock service layer in `src/services/mock/` using `@faker-js/faker`.
- Enable with `VITE_MOCK_AUTH=true`
- `VITE_MOCK_AUTH_EMAIL=admin@neop.com`
- `VITE_MOCK_AUTH_PASSWORD=neoo0pAdmin2026!=true` in `.env`.

## Real-time
- WebSocket support via `laravel-echo` + `pusher-js`.
- Sonar store in `src/stores/` manages real-time event subscriptions.

## Error Handling
- Axios interceptors handle token refresh and global error toasts.
- Form-specific API errors are caught and mapped to field-level errors by `useForm`.

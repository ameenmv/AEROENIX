---
description: Build and deploy the application
---

# /project:deploy

Prepare the project for production deployment.

## Steps

1. **Pre-deploy verification**:
   ```bash
   bun verify
   ```
   This runs: `bun lint:all` → `bun build` → `bun test`

2. **i18n check** (ensure no missing translations):
   ```bash
   bun i18n:check
   ```

3. **Build for production**:
   ```bash
   bun build
   ```
   Output is in `dist/`.

4. **Docker deployment** (if applicable):
   ```bash
   bun docker:build
   bun docker:up
   ```

5. **PM2 deployment** (if applicable):
   ```bash
   bun pm2:start
   ```

## Environment Variables Required
- `VITE_API_BASE_URL` — production API endpoint
- `VITE_MOCK_AUTH=false` — ensure mock mode is disabled

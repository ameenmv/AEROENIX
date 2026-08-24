---
name: deploy
description: Automated deployment preparation workflow
---

# Deploy Skill

Automated workflow to verify and prepare the project for deployment.

## Pre-flight Checks

1. **Lint & Format**:
   ```bash
   bun lint:all
   ```

2. **Type Check & Build**:
   ```bash
   bun build
   ```

3. **Run Tests**:
   ```bash
   bun test
   ```

4. **i18n Integrity**:
   ```bash
   bun i18n:check
   ```

## Build Output
- Production build output is in `dist/`.
- Served via Docker (`Dockerfile` + `docker-compose.yml`) or PM2 (`ecosystem.config.js`).

## Docker Commands
```bash
bun docker:build    # Build image
bun docker:up       # Start containers
bun docker:down     # Stop containers
bun docker:logs     # View logs
```

## PM2 Commands
```bash
bun pm2:start       # Start with PM2
bun pm2:stop        # Stop processes
bun pm2:restart     # Restart processes
bun pm2:logs        # View logs
bun pm2:monit       # Monitoring dashboard
```

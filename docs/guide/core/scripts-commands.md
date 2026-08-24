# Scripts & Commands

Complete reference of all available `bun` scripts.

## Development

| Command | Description |
|---|---|
| `bun dev` | Start Vite dev server on port 5173 |
| `bun build` | Type-check with `vue-tsc` then build for production |
| `bun preview` | Preview the production build locally |

## Code Quality

| Command | Description |
|---|---|
| `bun lint` | Run ESLint with `--fix` on all files |
| `bun format` | Run Prettier on all `src/` files |
| `bun format:check` | Check formatting without writing (CI-friendly) |
| `bun lint:all` | Run lint + format + clean:all in sequence |
| `bun verify` | Run lint:all + build + test (pre-deploy check) |

## Testing

| Command | Description |
|---|---|
| `bun test` | Run Vitest test suite once |
| `bun test:watch` | Run Vitest in watch mode |
| `bun test:ui` | Open Vitest UI in browser |

## i18n

| Command | Description |
|---|---|
| `bun i18n:prep` | Merge namespace JSON files into `.i18n-temp/` for analysis |
| `bun i18n:report` | Generate `i18n-report.json` with missing & unused keys |
| `bun i18n:check` | Same as report but exits with error code for CI |

See [i18n Guide](/guide/core/i18n) for details.

## Scaffolding

| Command | Description |
|---|---|
| `bun make` | Scaffold a new module (interactive wizard) |
| `bun make:module` | Alias for `bun make` |
| `bun unmake` | Remove a scaffolded module and clean all references |
| `bun unmake:module` | Alias for `bun unmake` |

See [Scaffold Command](/guide/core/scaffold-command) for details.

## Code Cleanup

| Command | Description |
|---|---|
| `bun clean:empty-lines` | Remove conneoptive empty lines from Vue/TS files |
| `bun clean:reorder-tags` | Reorder Vue SFC tags to `<script>` → `<template>` → `<style>` |
| `bun clean:all` | Run both cleanup scripts |
| `bun strip:comments` | Remove all comments from source files |

## Dependencies

| Command | Description |
|---|---|
| `bun deps:update` | Check for outdated packages and update using [taze](https://github.com/antfu/taze) |

```bash
# Check and interactively update all packages
bun deps:update
```

::: tip
`taze` shows you which packages have updates available and let you choose which to update. It writes the new versions to `package.json` — run `bun install` afterward.
:::

## Docker

| Command | Description |
|---|---|
| `bun docker:build` | Build Docker images via docker-compose |
| `bun docker:up` | Start containers in detached mode |
| `bun docker:down` | Stop and remove containers |
| `bun docker:logs` | Tail container logs |

## PM2 (Process Manager)

| Command | Description |
|---|---|
| `bun pm2:start` | Start the app with PM2 using `ecosystem.config.js` |
| `bun pm2:stop` | Stop PM2 processes |
| `bun pm2:restart` | Restart PM2 processes |
| `bun pm2:logs` | View PM2 log output |
| `bun pm2:monit` | Open PM2 monitoring dashboard |

## Documentation

| Command | Description |
|---|---|
| `bun docs:dev` | Start VitePress dev server on port 5174 |
| `bun docs:build` | Build static docs for deployment |
| `bun docs:preview` | Preview built docs locally |

## Git Commits

| Command | Description |
|---|---|
| `bun commit` | Interactive conventional commit wizard via commitizen |

Commit messages are validated by **commitlint** via the `.husky/commit-msg` hook. See [Git Workflow](/guide/core/git-workflow) for details.

## Releases & Changelog

| Command | Description |
|---|---|
| `bun release` | Auto-bump version, update CHANGELOG, create git tag |
| `bun release:patch` | Force a patch version bump (`1.0.0` → `1.0.1`) |
| `bun release:minor` | Force a minor version bump (`1.0.0` → `1.1.0`) |
| `bun release:major` | Force a major version bump (`1.0.0` → `2.0.0`) |
| `bun release:first` | Initial release (no version bump) |
| `bun release:dry` | Preview what the next release would look like |
| `bun release:changelog` | Regenerate CHANGELOG only (no bump/tag) |
| `bun gh:release` | Create a GitHub Release from the latest tag |
| `bun changelog:reset` | Wipe and reset CHANGELOG.md |

See [Releases & Changelog](/guide/core/releases) for the full workflow and configuration.

::: tip Quick Release Workflow
```bash
bun release:dry         # Preview
bun release             # Cut the release
git push --follow-tags  # Push commit + tag
bun gh:release          # Create GitHub Release
```
:::

## Project Initialization

When setting up the project for the first time:

```bash
# 1. Clone the repository
git clone <repo-url>
cd dashboad-base

# 2. Install dependencies
bun install

# 3. Set up environment
cp .env.example .env
# Edit .env with your API URL

# 4. Start development
bun dev
```

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `""` |
| `VITE_MOCK_AUTH` | Use mock data for the Auth system | `false` |

## Git Hooks

The project uses **Husky** with two hooks:

### Pre-Commit (`.husky/pre-commit`)

```bash
bun run lint      # ESLint with --fix
bun run build     # vue-tsc type-check + Vite build
git add .         # Stage any auto-fixed files
```

### Commit-Msg (`.husky/commit-msg`)

Validates that every commit message follows the **Conventional Commits** format using **commitlint**:

```bash
bun x commitlint --edit "$1"
```

Non-conforming messages are rejected. Use `bun commit` for a guided experience.

### Lint-Staged (`.lintstagedrc`)

```json
{
  "*.{js,ts,vue,jsx,tsx}": ["prettier --write", "eslint --fix"],
  "*.{json,md,css,html}": ["prettier --write"]
}
```

::: warning
Don't skip Git hooks with `--no-verify` unless absolutely necessary. The hooks exist to catch errors before they reach the repository.
:::

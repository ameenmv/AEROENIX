# Getting Started

Welcome to the **Neop Base** — a modular, resource-driven admin panel built with Vue 3, TailwindCSS 4, Pinia, TanStack Vue Query, and VeeValidate + Zod.

## Prerequisites

- **Node.js** ≥ 18
- **Bun** (package manager) — [bun.sh](https://bun.sh)

## Quick Start

```bash
# Install dependencies
bun install

# Start the dev server (port 5173)
bun dev

# Start the docs server (port 5174)
bun docs:dev
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_API_BASE_URL=https://api.example.com
VITE_MOCK_AUTH=true
```

| Variable              | Description                             | Default |
|-----------------------|-----------------------------------------|---------|
| `VITE_API_BASE_URL`  | Base URL of the backend API             | `""`    |
| `VITE_MOCK_AUTH`     | Use mock data for the Auth system       | `false` |

::: tip
Set `useMock: true` directly in your service module exports during development to work without a running backend.
:::

## UI Framework & Branding

This project uses [shadcn/ui](https://ui.shadcn.com/) (Vue port via `reka-ui` and `tailwindcss` v4) for all UI components. They are located in `src/components/uic/`. Always try to use these existing components (Buttons, Inputs, Cards, etc.) rather than building raw HTML elements.

**Logo:** All logos in the project are managed via a single component: `src/components/layout/Logo.vue`. Use `<Logo />` instead of raw `<img>` tags to ensure branding consistency and proper dark mode support.

## Available Scripts

| Command | Description |
|---|---|
| `bun dev` | Start dev server on port 5173 |
| `bun build` | Type-check & build for production |
| `bun preview` | Preview the production build |
| `bun lint` | Lint with ESLint and auto-fix |
| `bun format` | Format with Prettier |
| `bun lint:all` | Lint + format + clean all files |
| `bun test` | Run unit tests with Vitest |
| `bun test:watch` | Run Vitest in watch mode |
| `bun make` | Scaffold a new resource (interactive CLI) |
| `bun deps:update` | Check & update outdated packages via [taze](https://github.com/antfu/taze) |
| `bun i18n:report` | Generate i18n missing/unused keys report |
| `bun i18n:check` | i18n check for CI (fails on missing keys) |
| `bun verify` | Full pre-deploy check: lint + build + test |
| `bun docs:dev` | Start VitePress docs on port 5174 |

See [Scripts & Commands](/guide/core/scripts-commands) for the full list (30+ commands including Docker, PM2, cleanup scripts).

## Updating Packages

```bash
bun deps:update
```

This uses `taze` to interactively check for outdated packages and write new versions to `package.json`. Run `bun install` afterward to install the updates.

## Creating Your First Resource

The fastest way to add a new CRUD page:

```bash
bun make
# Follow the prompts: enter resource name, pick fields, etc.
```

This generates all the files you need: service, config, view, routes, and mock data. See [Scaffold Command](/guide/core/scaffold-command) for details.

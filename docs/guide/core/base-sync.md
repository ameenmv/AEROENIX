# Base Sync Command

The `base-sync` tool is a utility that helps you synchronize core framework updates, configuration changes, and boilerplate code from the base repository into your project. It includes an interactive CLI and a professional web-based Diff Viewer to review changes before applying them.

## Quick Bootstrap (Recommended)

If you are setting up a **child project** that doesn't have `base-sync` yet, you can pull the entire toolchain with a **single command** — no need to copy any files first.

### One-liner (via `gh` CLI)

`cd` into your child project directory, then run:

```bash
if ! command -v bun &> /dev/null; then curl -fsSL https://bun.sh/install | bash; export PATH="$HOME/.bun/bin:$PATH"; fi; gh api "repos/neop-planet/dashboard-base-vue/contents/scripts/bootstrap-base-sync.ts?ref=dev" -H "Accept: application/vnd.github.raw" | bun run -
```

> [!TIP]
> This cross-platform command (works on Mac and Linux) ensures `bun` is installed, then uses the GitHub CLI (`gh`) to securely fetch the bootstrap script from the private repo. Authentication is handled automatically via your `gh` login, and the script is piped directly into `bun` for immediate execution.

#### Windows (PowerShell)

If you are using Windows, use this PowerShell script which securely handles downloading to a temp file, installs bun if missing, and executes the script safely:

```powershell
if (!(Get-Command bun -ErrorAction SilentlyContinue)) { irm bun.sh/install.ps1 | iex; $env:PATH += ";$HOME\.bun\bin" }; gh api "repos/neop-planet/dashboard-base-vue/contents/scripts/bootstrap-base-sync.ts?ref=dev" -H "Accept: application/vnd.github.raw" > "$env:TEMP\bootstrap.ts"; bun "$env:TEMP\bootstrap.ts"; Remove-Item "$env:TEMP\bootstrap.ts" -Force
```

### Local alternatives

If you already have the script locally (e.g. in the base repo itself):

```bash
bun scripts/bootstrap-base-sync.ts
# or
bun run bootstrap
```

### What it does

The bootstrap script will:
1. **Sparse-clone** the `dev` branch of `dashboard-base-vue`
2. **Copy** `scripts/base-sync/`, `scripts/neop-logo/`, `scripts/jira-to-md/`, and `.basesync.json` into your project
3. **Install** all required dev dependencies automatically (`consola`, `diff`, `fast-glob`, `simple-git`, `@inquirer/prompts`, `commander`, `chalk`, `dotenv`)
4. **Add** the `base-sync`, `jira`, `jira:fetch`, and `jira:list` scripts to your `package.json`

After bootstrapping, you can run `bun run base-sync` immediately.

If you already have `base-sync` in your project, you can skip straight to [Usage](#usage).

---

## Prerequisites

> [!IMPORTANT]
> **Required Dependencies:** The `base-sync` tool relies on several npm packages that **must be listed in your project's `package.json`** before you can use it. If any of these packages are missing, `bun run base-sync` will fail with module-not-found errors.

Run the following command to install all required dependencies at once:

```bash
bun add -D consola diff fast-glob simple-git @inquirer/prompts commander chalk
```

Here is the full list of packages that `base-sync` depends on:

| Package | Section | Purpose |
|---|---|---|
| `consola` | `devDependencies` | Styled terminal logging and error reporting |
| `diff` | `devDependencies` | Line-by-line text diffing between base and child files |
| `fast-glob` | `devDependencies` | Fast file-system globbing for directory scanning |
| `simple-git` | `devDependencies` | Programmatic Git operations (clone, branch, commit) |
| `@inquirer/prompts` | `devDependencies` | Interactive terminal prompts (select, confirm, checkbox) |
| `commander` | `devDependencies` | CLI argument parsing *(optional — used internally for future sub-commands)* |
| `chalk` | `devDependencies` | Terminal color output for the NEOP logo animation |
| `zod` | `dependencies` | Config schema validation (`.basesync.json`) |

> [!NOTE]
> `zod` is typically already installed as a project dependency since it is used across the dashboard for form validation. The remaining packages are **dev-only** dependencies and won't be bundled into your production build.

### System Requirements

- **Bun** — `base-sync` is executed via `bun` and uses Bun-native APIs such as `Bun.serve` for the web diff viewer.
- **Git** — Must be installed and available in your `PATH` for clone, branch, and commit operations.
- **GitHub CLI (`gh`)** *(optional)* — Required only if you use the `scaffold --push` flow to create and push to a new GitHub repository.

## Usage

To start the interactive wizard, simply run without any arguments:

```bash
bun run base-sync
```

When you execute the command, the CLI will present a summary of the files and launch the synchronization process:

![CLI Usage](/bun-sync.png)

## Commands

For fully automated scripts or specific workflows, you can pass a command directly:

```bash
bun base-sync <command> [options]
```

### Available Commands

| Command | Description |
|---|---|
| `scaffold` | Create a new child project from the base template |
| `diff` | Compare a child project against a remote repository |
| `status` | Check the drift between this project and a repository |
| `sync` | Pull repository updates into this project |
| `list` | List all known child projects |
| `cleanup` | Remove the temporary clone cache |

## Flags & Options

Depending on the command, you can supply specific options. By default, running the interactive wizard will prompt you for these.

### Global Options
- `--config <path>`: Custom `.basesync.json` configuration path.
- `--verbose`: Enable detailed logging.
- `--help`, `-h`: Show the help menu.

### Scaffold Options
- `--name <name>`: Name of the new project.
- `--output <path>`: Where to create the project.
- `--git-init`: Initialize a Git repository.
- `--push`: Push to GitHub after creation.
- `--branch <name>`: Branch name (default: `dev`).
- `--dry-run`: Preview without writing any modifications.
- `--exclude <pat>`: Comma-separated extra exclude patterns.

### Diff / Status / Sync Options
- `--base <owner/repo>`: GitHub repository to compare against.
- `--branch <name>`: Branch to compare (default: `dev`).
- `--strategy <mode>`: Merge strategy (`merge`, `patch`, or `overwrite`) (Sync only).
- `--dry-run`: Preview without writing (Diff/Sync only).
- `--local-only`: Skip all remote operations (default is `true` in Diff).
- `--json`: Format output as JSON (Status only).

## Configuration (`.basesync.json`)

`base-sync` is configured via a `.basesync.json` file at the project root. If no config file is found, sensible defaults are used.

### Full Configuration Reference

Here is the actual `.basesync.json` used in this project:

```json
{
  "role": "base",
  "base": null,
  "exclude": [
    "node_modules",
    ".git",
    "dist",
    "dist-ssr",
    ".env",
    ".env.*",
    "!.env.example",
    "*.local",
    ".gemini",
    "GEMINI.local.md",
    "bun.lock",
    ".basesync-registry.json",
    "docs/.vitepress/cache",
    "docs/.vitepress/dist",
    ".i18n-temp",
    "i18n-report.json",
    "eslint-report.json"
  ],
  "defaultBranch": "dev",
  "registry": ".basesync-registry.json",
  "github": {
    "org": "neop-planet",
    "useCLI": true
  }
}
```

### Configuration Fields

| Field | Type | Default | Description |
|---|---|---|---|
| `role` | `"base" \| "child"` | `"base"` | Whether this project is the **base template** or a **child** derived from it. Base projects are the source of truth; child projects receive updates from the base. |
| `base` | `string \| null` | `null` | GitHub `owner/repo` of the upstream base repository. Set to `null` in the base project itself. In child projects, set this to `"neop-planet/dashboard-base-vue"` to specify the upstream source. |
| `exclude` | `string[]` | *(see below)* | Glob patterns for files and directories to **ignore** during sync. Supports negation with `!` prefix. |
| `defaultBranch` | `string` | `"dev"` | Default Git branch used for comparison and sync operations. |
| `registry` | `string` | `".basesync-registry.json"` | Path to the child project registry file. This file tracks all child projects scaffolded from the base. |
| `github.org` | `string` | `"neop-planet"` | GitHub organization name. Used when scaffolding new repos with `--push`. |
| `github.useCLI` | `boolean` | `true` | Whether to use the `gh` CLI for GitHub operations (creating repos, pushing). If `false`, manual Git remote setup is required. |

### Exclude Patterns Explained

The `exclude` array uses **glob patterns** to determine which files are skipped during sync. Understanding these patterns is critical to avoid accidentally overwriting project-specific files.

| Pattern | What It Excludes | Why |
|---|---|---|
| `node_modules` | All `node_modules/` directories | Dependencies are installed per-project |
| `.git` | Git metadata | Each project has its own git history |
| `dist` | Production build output | Generated files, not source code |
| `dist-ssr` | SSR build output | Generated files, not source code |
| `.env` | Environment variables file | Contains secrets specific to each project |
| `.env.*` | All `.env` variants (`.env.local`, `.env.staging`) | Environment-specific secrets |
| `!.env.example` | **Include** `.env.example` (negation) | The example file should sync to keep docs updated |
| `*.local` | Local override files | Developer-specific local configs |
| `.gemini` | Gemini AI configuration | Local AI assistant settings |
| `GEMINI.local.md` | Local Gemini context file | Project-specific AI context |
| `bun.lock` | Bun lockfile | Lock files differ per project's dependency tree |
| `.basesync-registry.json` | Child project registry | Only relevant to the base project |
| `docs/.vitepress/cache` | VitePress build cache | Generated files |
| `docs/.vitepress/dist` | VitePress build output | Generated files |
| `.i18n-temp` | i18n temporary processing files | Generated during i18n workflow |
| `i18n-report.json` | i18n translation report | Generated per project |
| `eslint-report.json` | ESLint report output | Generated per project |

> [!TIP]
> **Negation patterns** (prefixed with `!`) override previous exclude rules. For example, `.env.*` excludes all `.env` variants, but `!.env.example` brings `.env.example` back so it syncs across projects.

### Base vs. Child Configuration

The configuration differs based on the project's role:

**Base project** (this repo):
```json
{
  "role": "base",
  "base": null
}
```

**Child project** (derived from the base):
```json
{
  "role": "child",
  "base": "neop-planet/dashboard-base-vue"
}
```

When a child project runs `bun run base-sync sync`, it:
1. Clones `neop-planet/dashboard-base-vue` (the `base` field)
2. Checks out the `defaultBranch` (`dev`)
3. Compares all files, excluding those matching `exclude` patterns
4. Opens the web diff viewer for review
5. Applies selected changes

## Web-Based Diff Viewer

Instead of reviewing changes blindly within the terminal, `base-sync` provides a sleek web-based GUI for an improved developer experience. During the process, it will launch a local server and open your browser to display the differences side-by-side using `diff2html`.

![Browser View](/image%20copy.png)

From the browser UI, you can:
- Clearly visualize added, removed, and modified lines.
- Review modifications with a clean, Tailwind CSS-powered interface in dark mode.
- Selectively choose which files to include or exclude from the sync.
- Submit your selections to resume the CLI synchronization process.

## Workflow Overview

Here is a typical workflow for syncing updates from the base into a child project:

```
1. cd into child project
2. bun run base-sync
3. Select "sync" from the interactive menu
4. Choose the upstream base repo (auto-detected or manual)
5. Wait for the clone & diff to complete
6. Review changes in the Web-Based Diff Viewer
7. Select files to sync → Submit
8. Changes are applied locally
9. Review in your IDE → Commit & Push
```

## 💡 Best Practices & Tips

> [!CAUTION]
> **Commit Local Changes First:** Always commit any uncommitted changes in your working directory before running the `sync` command. This ensures you have a clean state to fall back to if the sync process introduces unexpected conflicts.

> [!WARNING]
> **Keep It Local First:** Do NOT apply your initial sync operations directly to a remote production branch. Perform the sync on your **local machine** first. Use the Web-Based Diff Viewer and your IDE to thoroughly review the changes. Only commit and push the code to your remote repository after you are absolutely sure that the sync is correct.

> [!TIP]
> **Use `--dry-run` for Safety:** When trying a new command for the first time, append `--dry-run` to preview what would happen without making any actual changes:
> ```bash
> bun base-sync sync --base neop-planet/dashboard-base-vue --dry-run
> ```

> [!TIP]
> **Exclude project-specific files:** If your child project has files that should never be overwritten by the base (e.g. custom theme files, project-specific configs), add them to the `exclude` array in your child's `.basesync.json`.

# Git Workflow & Husky

The project uses **Husky v9** for Git hooks to enforce code quality before every commit.

## What Runs Before a Commit

The pre-commit hook (`.husky/pre-commit`) runs automatically when you `git commit`:

```bash
bun run lint      # ESLint with --fix
bun run build     # vue-tsc type-check + Vite build
git add .         # Stage any auto-fixed files
```

::: important
**Both `lint` and `build` must pass** before your commit goes through. If either fails, the commit is rejected.
:::

### What Each Check Does

| Step | Command | What It Catches |
|---|---|---|
| **Lint** | `bun run lint` | ESLint errors, unused imports, formatting issues (auto-fixes what it can) |
| **Build** | `bun run build` | TypeScript type errors, Vue template errors, missing imports |

### If a Commit Fails

1. Read the error output — it tells you exactly what failed
2. Fix the issue (type errors, lint warnings, etc.)
3. Stage your changes again: `git add .`
4. Try your commit again

```bash
# Example: fix a type error, then retry
git add .
git commit -m "feat: add client resource"
```

## Pre-Commit Checklist

Before committing, make sure:

- [ ] `bun run lint` passes with no errors
- [ ] `bun run build` passes with no type errors
- [ ] You've added any new i18n keys (run `bun i18n:check`)
- [ ] New files follow [naming conventions](/guide/core/naming-conventions)

::: tip
Run `bun verify` to check everything at once (lint + build + test). This is the same check CI runs.
:::

## Branch Naming Conventions

Use the following branch naming pattern:

```
<type>/<short-description>
```

### Branch Types

| Prefix | Purpose | Example |
|---|---|---|
| `feature/` | New features or enhancements | `feature/client-resource` |
| `fix/` | Bug fixes | `fix/login-redirect-loop` |
| `hotfix/` | Urgent production fixes | `hotfix/payment-crash` |
| `refactor/` | Code refactoring (no feature change) | `refactor/extract-auth-service` |
| `docs/` | Documentation changes | `docs/add-validation-guide` |
| `chore/` | Tooling, deps, CI, config | `chore/update-eslint-config` |
| `test/` | Adding or fixing tests | `test/user-service-unit` |

### Rules

- Use **lowercase** only
- Use **hyphens** (`-`) to separate words (not underscores)
- Keep descriptions **short and descriptive** (2-4 words)
- Include ticket/issue number if applicable: `feature/PROJ-123-client-filters`

### Examples

```bash
# ✅ Good
feature/user-roles
fix/table-sorting-bug
refactor/resource-composable
docs/i18n-setup-guide
chore/bump-vue-query

# ❌ Bad
Feature/UserRoles          # No uppercase
new-feature                # No type prefix
fix/this_is_a_bug          # No underscores
feature/add-really-long-description-that-goes-on-forever  # Too long
```

## Commit Message Conventions

All commit messages are validated by **commitlint** via a Husky `commit-msg` hook. Messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) standard.

### Quick Format

```
<type>(<scope>): <description>
```

### Using Commitizen (Recommended)

Run the interactive commit wizard instead of writing the message manually:

```bash
bun commit
```

This walks you through selecting the type, scope, and description step by step.

### Manual Commits

```bash
# ✅ Good
git commit -m "feat(auth): add oauth2 login support"
git commit -m "fix(api): handle null response from payment gateway"
git commit -m "docs: update validation guide"
git commit -m "chore: update dependencies"
git commit -m "refactor(table): extract column helpers"
git commit -m "i18n: add missing arabic translations"
git commit -m "ui: redesign sidebar navigation"

# ❌ Bad — commitlint will reject these
git commit -m "Added client resource"     # No type, uppercase
git commit -m "Fix bug"                    # No type prefix, uppercase
git commit -m "WIP"                        # Not descriptive
```

### Commit Types

| Type | Description | Triggers |
|---|---|---|
| `feat` | New feature | Minor version bump |
| `fix` | Bug fix | Patch version bump |
| `docs` | Documentation changes | — |
| `style` | Code style (formatting, semicolons) | — |
| `refactor` | Code refactoring | — |
| `perf` | Performance improvement | — |
| `test` | Adding or updating tests | — |
| `build` | Build system or dependencies | — |
| `ci` | CI/CD configuration | — |
| `chore` | Maintenance tasks | — |
| `i18n` | Internationalization changes | — |
| `ui` | UI/styling changes | — |
| `revert` | Revert a previous commit | — |

::: tip Breaking Changes
Add `!` after the type or a `BREAKING CHANGE:` footer for major version bumps:
```bash
git commit -m "chore!: drop Node 18 support"
```
:::

See [Releases & Changelog](/guide/core/releases) for the full release workflow, changelog management, and version bumping.

> [!IMPORTANT]
> Use this sparingly. Skipping hooks means your code won't be type-checked or linted until it reaches CI.

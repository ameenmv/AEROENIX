# Releases & Changelog

The project uses a structured release pipeline built on **Conventional Commits**. This page covers how to write commits, cut releases, manage changelogs, and publish GitHub Releases.

## Overview

```
Conventional Commit → commitlint validates → commit-and-tag-version bumps → CHANGELOG.md → git tag → GitHub Release
```

| Tool | Role |
|---|---|
| **commitlint** | Enforces Conventional Commits format on every commit via Husky |
| **commitizen** (`bun commit`) | Interactive CLI to write properly formatted commit messages |
| **commit-and-tag-version** | Reads commits, bumps `package.json` version, updates `CHANGELOG.md`, creates a git tag |
| **GitHub CLI** (`gh`) | Creates a GitHub Release from the latest tag |

## Conventional Commits

Every commit message **must** follow the [Conventional Commits](https://www.conventionalcommits.org/) standard. The `commit-msg` Husky hook enforces this automatically — non-conforming commits are rejected.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Examples

```bash
feat(auth): add OAuth2 login support
fix(api): handle null response from payment gateway
docs: update README with new env vars
refactor(table): extract column helpers into composable
chore!: drop Node 18 support         # the ! means breaking change
perf(search): add debounce to filter input

# With body and footer
feat(users): add bulk delete action

Adds a new bulk action that allows admins to delete
multiple users at once from the DataTable.

BREAKING CHANGE: removes the old single-delete endpoint
Closes #142
```

### Allowed Commit Types

| Type | Description | Changelog Section |
|---|---|---|
| `feat` | New feature | ✨ Features |
| `fix` | Bug fix | 🐛 Bug Fixes |
| `docs` | Documentation changes | 📝 Documentation |
| `style` | Code formatting (no logic change) | _hidden_ |
| `refactor` | Code restructuring (no feature/fix) | ♻️ Refactoring |
| `perf` | Performance improvement | ⚡ Performance |
| `test` | Adding or updating tests | ✅ Tests |
| `build` | Build system or dependencies | 📦 Build |
| `ci` | CI/CD configuration | 🔧 CI |
| `chore` | Maintenance tasks | _hidden_ |
| `revert` | Revert a previous commit | ⏪ Reverts |
| `i18n` | Internationalization changes | 🌐 Internationalization |
| `ui` | UI/styling changes | 🎨 UI Changes |

### Version Bumping Rules

| Commit Pattern | Version Bump | Example |
|---|---|---|
| `fix(scope): ...` | **Patch** (`1.0.0` → `1.0.1`) | Bug fixes |
| `feat(scope): ...` | **Minor** (`1.0.0` → `1.1.0`) | New features |
| `BREAKING CHANGE:` in footer or `!` after type | **Major** (`1.0.0` → `2.0.0`) | Breaking changes |

## Writing Commits

### Option 1: Interactive (Recommended)

Use the commitizen wizard — it guides you through the format step by step:

```bash
bun commit
```

This launches an interactive prompt:

```
? Select the type of change:     feat
? Scope (optional):              auth
? Short description:             add OAuth2 login support
? Longer description (optional): 
? Breaking changes (optional):   
? Issues closed (optional):      #142
```

Result: `feat(auth): add OAuth2 login support`

### Option 2: Manual

Write the message yourself — commitlint validates it automatically:

```bash
git commit -m "feat(auth): add OAuth2 login support"
```

If the format is wrong, the commit is rejected:

```
⧗   input: Added new login feature
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]
✖   Found 2 problems, 0 warnings
```

## Cutting a Release

### Preview First

Always preview before releasing:

```bash
bun release:dry
```

This shows what would happen (version bump, changelog entries, tag name) without making any changes.

### Automatic Version Bump

Let the tool determine the version bump from your commit history:

```bash
bun release
```

This command:
1. Reads all commits since the last tag
2. Determines the version bump (patch/minor/major) from commit types
3. Updates `version` in `package.json`
4. Generates/updates `CHANGELOG.md`
5. Creates a commit: `chore(release): v1.2.0`
6. Creates a git tag: `v1.2.0`

### Forced Version Bumps

Override the automatic bump detection:

```bash
bun release:patch    # Force patch: 1.0.0 → 1.0.1
bun release:minor    # Force minor: 1.0.0 → 1.1.0
bun release:major    # Force major: 1.0.0 → 2.0.0
```

### First Release

For the very first release of the project (creates the initial changelog and tag without bumping):

```bash
bun release:first
```

### After Releasing

Push the commit and tag to remote:

```bash
git push --follow-tags
```

## GitHub Releases

After pushing a tag, create a GitHub Release:

```bash
bun gh:release
```

This uses the [GitHub CLI](https://cli.github.com/) to create a release from the latest tag with auto-generated release notes.

::: tip Prerequisites
Make sure the [GitHub CLI](https://cli.github.com/) is installed and authenticated:
```bash
gh auth login
```
:::

## Changelog Management

### Regenerate Changelog

Rebuild the changelog from commit history without bumping the version or creating a tag:

```bash
bun release:changelog
```

### Reset Changelog

Wipe the changelog and start fresh:

```bash
bun changelog:reset
```

### Changelog Format

The generated `CHANGELOG.md` follows the [Keep a Changelog](https://keepachangelog.com/) standard with emoji sections:

```markdown
# Changelog

## [1.2.0](https://github.com/org/repo/compare/v1.1.0...v1.2.0) (2026-04-02)

### ✨ Features

* **auth:** add OAuth2 login support ([abc1234](https://github.com/org/repo/commit/abc1234))

### 🐛 Bug Fixes

* **api:** handle null response from payment gateway ([def5678](https://github.com/org/repo/commit/def5678))

### ♻️ Refactoring

* **table:** extract column helpers into composable ([ghi9012](https://github.com/org/repo/commit/ghi9012))
```

## Commands Reference

| Command | Description |
|---|---|
| `bun commit` | Interactive conventional commit wizard |
| `bun release` | Auto-bump version, update CHANGELOG, create git tag |
| `bun release:patch` | Force a patch version bump |
| `bun release:minor` | Force a minor version bump |
| `bun release:major` | Force a major version bump |
| `bun release:first` | Initial release (no version bump) |
| `bun release:dry` | Preview the next release without changes |
| `bun release:changelog` | Regenerate CHANGELOG only (no bump/tag) |
| `bun gh:release` | Create GitHub Release from latest tag |
| `bun changelog:reset` | Wipe and reset CHANGELOG.md |

## Configuration Files

| File | Purpose |
|---|---|
| `commitlint.config.ts` | Commit message rules (types, casing, length) |
| `.versionrc.json` | Changelog sections and formatting |
| `.husky/commit-msg` | Git hook that runs commitlint |
| `package.json` → `config.commitizen` | Commitizen adapter config |

## Complete Workflow Example

```bash
# 1. Create a feature branch
git checkout -b feature/user-bulk-actions

# 2. Make your changes...

# 3. Commit with the interactive wizard
bun commit

# 4. Push and create a PR
git push -u origin feature/user-bulk-actions

# 5. After PR is merged to main, switch and pull
git checkout main && git pull

# 6. Preview the release
bun release:dry

# 7. Cut the release
bun release

# 8. Push with tags
git push --follow-tags

# 9. Create the GitHub Release
bun gh:release
```

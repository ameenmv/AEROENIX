# Jira to Markdown

The `jira-to-md` tool fetches issues directly from your Jira Cloud instance and exports them as clean, structured Markdown files — organized by **sprints** and **backlog**. Each sprint becomes a folder, and each issue becomes a `.md` file with full metadata, description, subtasks, and comments.

## Prerequisites

### 1. Generate a Jira API Token

You need an **API token** from Atlassian to authenticate. You **cannot** use your regular Jira password.

1. Go to → [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click **"Create API token"**
3. Give it a label (e.g. `jira-to-md`)
4. Copy the token — you will only see it once

### 2. Add Credentials to `.env`

The script reads credentials from the `.env` file at the project root. Add the following three variables:

```bash
# ─── Jira Integration ────────────────────────────────────────────
JIRA_HOST=https://neop1.atlassian.net
JIRA_EMAIL=your-email@neop.com
JIRA_TOKEN=paste_your_api_token_here
```

| Variable | Description | Example |
|---|---|---|
| `JIRA_HOST` | Your Atlassian cloud URL (no trailing slash) | `https://neop1.atlassian.net` |
| `JIRA_EMAIL` | The email address you use to log into Jira | `adham@neop.com` |
| `JIRA_TOKEN` | API token generated from Atlassian account settings | `ATATT3xF...` |

> [!CAUTION]
> **Never commit your `.env` file!** It is already in `.gitignore`. If you need to share credentials with teammates, use a secure vault or 1Password — not Slack or email.

## Quick Start

```bash
# Just run it — fully interactive!
bun run jira:fetch
```

The tool will guide you through each step interactively:

```
? Select a Jira project:
  SV2          05-SEEN_Ver2

? Output folder name: business

✔ Using board: SV2 board (ID: 31)

? What do you want to fetch?
  🟢  Active sprints only
  🔵  Active + Future sprints
  📦  All sprints (Active + Future + Closed)
  📋  Backlog only
  🎯  Pick specific sprints

🟢 Fetching sprint: SV2 Sprint 0 (Active)...
✔  SV2 Sprint 0 (Active): 14 issues
📋 Fetching backlog...
✔  Backlog: 87 issues

╭─────────────────────────────────────────╮
│  🎉 Done!                               │
│  101 issues written to: ./business      │
│  2 sections (sprints + backlog)         │
│  📋 INDEX.md with board overview        │
╰─────────────────────────────────────────╯
```

## Interactive Workflow

When you run `bun run jira:fetch` without any flags, the tool walks you through **5 interactive steps**:

### Step 1 — Project Selection

All accessible Jira projects are listed. Pick the one you want to export.

### Step 2 — Output Folder Name

Choose the folder name where the Markdown files will be saved. Default is `business`. The folder is **fully wiped and recreated** on each fetch to ensure a clean state.

### Step 3 — Board Detection

The tool automatically finds the Jira board for your project. If multiple boards exist, you'll be prompted to pick one.

### Step 4 — Fetch Mode

Choose what data to pull from the board:

| Option | Description |
|---|---|
| 🟢 **Active sprints only** | Only the currently active sprint(s) |
| 🔵 **Active + Future sprints** | Active plus all planned future sprints |
| 📦 **All sprints** | Active + Future + Closed sprints + Backlog |
| 📋 **Backlog only** | Only issues in the backlog (not assigned to any sprint) |
| 🎯 **Pick specific sprints** | Multi-select specific sprints with checkbox (active pre-selected) |

When using **"Pick specific sprints"**, you can also include the Backlog as a checkbox option.

### Step 5 — Fetch & Export

Issues are fetched per sprint, filtered, and written to disk. A summary box shows the total count and output path.

## Output Structure

The tool creates a **folder-per-sprint** structure with an `INDEX.md` at each level:

```
business/
├── INDEX.md                          ← Board overview with links
├── SV2 Sprint 0 (Active)/
│   ├── INDEX.md                      ← Sprint summary table
│   ├── SV2-1230.md
│   ├── SV2-1231.md
│   └── SV2-1232.md
├── SV2 Sprint 1 (Future)/
│   ├── INDEX.md
│   └── SV2-1400.md
└── Backlog/
    ├── INDEX.md
    ├── SV2-407.md
    └── SV2-510.md
```

### Folder Naming

Sprint folders are named with the sprint state appended:
- `SV2 Sprint 0 (Active)` — currently active
- `SV2 Sprint 1 (Future)` — planned
- `SV2 Sprint 2 (Closed)` — completed

### What Each Issue File Contains

Each `.md` file includes:

| Section | Content |
|---|---|
| **Title** | Issue key + summary |
| **Details** | Metadata table: type, status, priority, assignee, reporter, dates, components, fix versions |
| **Labels** | Rendered as inline code badges |
| **Description** | Full Jira description converted from ADF (Atlassian Document Format) to Markdown |
| **Subtasks** | Checklist with key, summary, and status |
| **Comments** | All comments with author name and timestamp |

### INDEX.md Files

Each sprint folder contains an `INDEX.md` with a summary table:

```md
# SV2 Sprint 0 (Active)

> Generated on 2026-04-08 · 14 issue(s)

| Key | Type | Status | Summary | Assignee |
|-----|------|--------|---------|----------|
| [SV2-1230](./SV2-1230.md) | Story | To Do | Client Registration | Adham |
```

The root `INDEX.md` links to all sprint/backlog sections with issue counts.

## Filtering Rules

The tool automatically applies two filters to keep output clean:

| Filter | Rule | Reason |
|---|---|---|
| **No subtasks** | Issues of type `Sub-task` are excluded | Subtasks are already listed within their parent issue as a checklist |
| **No empty issues** | Issues without a description are excluded | Issues with no description provide no useful documentation value |

## CLI Options

All steps can also be passed as flags for CI/CD or scripted usage:

```bash
bun run jira:fetch [options]
```

| Flag | Description | Default |
|---|---|---|
| `-p, --project <key>` | Jira project key (skip interactive selection) | *(interactive)* |
| `-o, --output <dir>` | Output directory (skip folder name prompt) | *(interactive, default: `business`)* |
| `-m, --max <number>` | Maximum issues per sprint/backlog | `500` |
| `--host <url>` | Override `JIRA_HOST` | `.env` value |
| `--email <email>` | Override `JIRA_EMAIL` | `.env` value |
| `--token <token>` | Override `JIRA_TOKEN` | `.env` value |

### Examples

```bash
# Fully interactive (recommended)
bun run jira:fetch

# Non-interactive: fetch project SV2 into ./business
bun run jira:fetch -p SV2 -o ./business

# Fetch up to 1000 issues per section
bun run jira:fetch -m 1000

# List all available projects
bun run jira:list
```

## Commands Reference

| Script | Command | Description |
|---|---|---|
| `bun run jira:fetch` | `fetch` | Fetch issues from board sprints + backlog |
| `bun run jira:list` | `list-projects` | List all Jira projects you can access |

## API Details

Under the hood, the tool uses two Jira APIs:

| API | Endpoint | Purpose |
|---|---|---|
| **Jira Agile REST API** | `/rest/agile/1.0/board` | Discover boards for a project |
| | `/rest/agile/1.0/board/{id}/sprint` | List sprints on a board |
| | `/rest/agile/1.0/sprint/{id}/issue` | Get issues in a specific sprint |
| | `/rest/agile/1.0/board/{id}/backlog` | Get backlog issues |
| **Jira REST API v3** | `/rest/api/3/project` | List all accessible projects |
| | `POST /rest/api/3/search/jql` | Fallback flat issue search |

> [!NOTE]
> The tool uses the **new** `POST /rest/api/3/search/jql` endpoint (not the deprecated `GET /rest/api/3/search` which was removed by Atlassian). If the Agile API is not available for a project, the tool falls back to flat JQL search automatically.

## File Structure

```
scripts/jira-to-md/
├── index.ts      ← CLI entry point, interactive prompts, folder management
├── jira.ts       ← Jira API client (boards, sprints, backlog, search)
└── markdown.ts   ← ADF-to-Markdown converter, issue template
```

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `❌ Missing Jira credentials!` | `.env` is missing `JIRA_HOST`, `JIRA_EMAIL`, or `JIRA_TOKEN` | Add all three variables to `.env` |
| `401 Unauthorized` | Wrong email or token | Re-generate token at [Atlassian settings](https://id.atlassian.com/manage-profile/security/api-tokens). Ensure the email matches the Atlassian account that generated the token. |
| `403 Forbidden` | You don't have access to that project | Ask your Jira admin for permissions |
| `410 Gone` | Using deprecated search API | Already handled — the tool uses the new `/search/jql` endpoint |
| `No boards found` | Project doesn't use Jira Software boards | Tool automatically falls back to flat JQL search |
| Sprint fetch stuck | Pagination bug (should be fixed) | Ensure you're using the latest version of the script |

> [!TIP]
> **Combine with VitePress docs:** You can export issues directly into your VitePress docs folder for a browseable backlog:
> ```bash
> bun run jira:fetch -o ./docs/backlog
> ```

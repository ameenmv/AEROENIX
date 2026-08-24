import type {
  ApplyMode,
  BaseSyncConfig,
  SyncStrategy,
} from '../types'
import path from 'node:path'
import { confirm, input, select } from '@inquirer/prompts'
import { walkDir } from './files'
import {
  getDefaultBranch,
  isGhAvailable,
  listOwnerRepos,
  listOwners,
  listRepoBranches,
} from './github'
import { execSync } from 'node:child_process'
import { searchCheckbox } from './searchCheckbox'

// ─── Types ───────────────────────────────────────────────────────

export type CommandChoice = 'scaffold' | 'diff' | 'status' | 'sync' | 'list'

export interface RepoSelection {
  owner: string
  repo: string
  fullName: string // "owner/repo"
  branch: string
}

// ─── Core Prompts ────────────────────────────────────────────────

export async function promptCommand(): Promise<CommandChoice> {
  return await select({
    message: 'What do you want to do?',
    choices: [
      { name: '  Scaffold — Create a new child project from base', value: 'scaffold' as const },
      { name: '  Diff — Extract changes from a child project', value: 'diff' as const },
      { name: '  Status — See how a child differs from base', value: 'status' as const },
      { name: ' Sync — Pull base updates into a child', value: 'sync' as const },
      { name: '  List — Show all known child projects', value: 'list' as const },
    ],
  })
}

// ─── GitHub-Native Repo Selection ────────────────────────────────

export async function promptSelectOwner(): Promise<string> {
  if (!isGhAvailable()) {
    console.log('\n  [WARN] GitHub CLI not found or not authenticated.')
    console.log('  Run: gh auth login\n')
    process.exit(1)
  }

  const owners = listOwners()

  if (owners.length === 0) {
    console.log('\n  [WARN] No GitHub accounts found.\n')
    process.exit(1)
  }

  // If only one owner, auto-select
  if (owners.length === 1) {
    console.log(`  [LOC] Using: ${owners[0].name}`)
    return owners[0].name
  }

  return await select({
    message: 'Select GitHub owner/org:',
    choices: owners.map(o => ({
      name: `${o.type === 'org' ? '' : ''}  ${o.name}`,
      value: o.name,
    })),
  })
}

export async function promptSelectRepo(owner: string, excludeRepo?: string): Promise<{ name: string, fullName: string }> {
  const repos = listOwnerRepos(owner)

  if (repos.length === 0) {
    console.log(`\n  [WARN] No repos found for ${owner}.\n`)
    process.exit(1)
  }

  // Filter out excluded repo (usually the current base)
  const filteredRepos = excludeRepo
    ? repos.filter(r => r.name !== excludeRepo)
    : repos

  const choices = filteredRepos.map(r => ({
    name: `${r.isPrivate ? '' : ''}  ${r.name}${r.description ? `  —  ${r.description}` : ''}`,
    value: r.name,
  }))

  const repoName = await select({
    message: `Select repository (${owner}):`,
    choices,
  })

  return { name: repoName, fullName: `${owner}/${repoName}` }
}

export async function promptSelectRepoBranch(ownerRepo: string, suggestedBranch?: string): Promise<string> {
  const branches = listRepoBranches(ownerRepo)

  if (branches.length === 0) {
    const defaultBranch = getDefaultBranch(ownerRepo)
    console.log(`  [LOC] Using default branch: ${defaultBranch}`)
    return defaultBranch
  }

  // Put suggested/default branches first
  const prioritized = [...new Set([
    ...(suggestedBranch ? [suggestedBranch] : []),
    'dev',
    'main',
    'master',
    ...branches,
  ])].filter(b => branches.includes(b))

  return await select({
    message: `Select branch (${ownerRepo}):`,
    choices: prioritized.map(b => ({
      name: `${b === 'dev' || b === 'main' ? '' : ''}  ${b}`,
      value: b,
    })),
  })
}

/**
 * Full repo selection flow: Owner → Repo → Branch
 */
export async function promptFullRepoSelection(options?: {
  excludeRepo?: string
  message?: string
  defaultOwner?: string
}): Promise<RepoSelection> {
  if (options?.message) {
    console.log(`\n  ${options.message}`)
  }

  const owner = options?.defaultOwner || await promptSelectOwner()
  const repo = await promptSelectRepo(owner, options?.excludeRepo)
  const branch = await promptSelectRepoBranch(repo.fullName)

  return {
    owner,
    repo: repo.name,
    fullName: repo.fullName,
    branch,
  }
}

// ─── Commits Selection Prompts ───────────────────────────────────

export async function promptSelectCommits(repoDir: string): Promise<string[]> {
  let logOutput = ''
  try {
    logOutput = execSync(
      `git -C "${repoDir}" log -n 50 --pretty=format:"%H|%h|%s|%xd|%an"`,
      { stdio: 'pipe', encoding: 'utf-8' }
    )
  }
  catch (err) {
    return []
  }

  const lines = logOutput.trim().split('\n').filter(Boolean)
  if (lines.length === 0) return []

  // Replace invalid formatting codes %xd to standard string output for date
  try {
    logOutput = execSync(
      `git -C "${repoDir}" log -n 50 --pretty=format:"%H|%h|%s|%cd|%an" --date=short`,
      { stdio: 'pipe', encoding: 'utf-8' }
    )
  }
  catch (err) {
    // ignore
  }
  const dateLines = logOutput.trim().split('\n').filter(Boolean)

  const choices = dateLines.map((line) => {
    const [hash, short, msg, time, author] = line.split('|')
    const name = `${short} — ${msg} (${time} by ${author})`
    return { name, value: hash, short, description: `Commit: ${short} by ${author} (${time})` }
  })

  return await searchCheckbox({
    message: 'Select commits to sync from (Space to select, optionally type to search):',
    source: async (input: string | undefined) => {
      const term = (input || '').toLowerCase()
      if (!term) return choices.slice(0, 50)
      return choices
        .filter(c => c.name.toLowerCase().includes(term) || c.value.toLowerCase().includes(term))
        .slice(0, 50)
    },
  })
}

// ─── Target Mode Prompts ─────────────────────────────────────────

export async function promptApplyMode(): Promise<ApplyMode> {
  return await select({
    message: 'How should changes be applied?',
    choices: [
      { name: '  New branch (named after project)', value: 'new-branch' as const },
      { name: '  Existing branch (merge into selected)', value: 'existing-branch' as const },
      { name: '  Reference folder (copy files into a folder inside a branch)', value: 'ref-folder' as const },
      { name: '  Merge to ref folder (apply changes + deletions into a named folder)', value: 'merge-ref-folder' as const },
    ],
  })
}

export async function promptTargetBranch(ownerRepo: string, suggestedName?: string): Promise<{
  mode: 'new' | 'existing'
  branch: string
}> {
  const branches = listRepoBranches(ownerRepo)

  const choices: { name: string, value: any }[] = []

  if (suggestedName) {
    choices.push({
      name: `[+]  Create new branch: "${suggestedName}"`,
      value: { mode: 'new', branch: suggestedName },
    })
  }

  choices.push({
    name: '  Create new branch (custom name)...',
    value: { mode: 'new', branch: '__custom__' },
  })

  for (const b of branches) {
    choices.push({
      name: `${b === 'dev' || b === 'main' ? '' : '   '}  ${b}`,
      value: { mode: 'existing', branch: b },
    })
  }

  const result = await select({
    message: 'Select target branch:',
    choices,
  })

  if (result.branch === '__custom__') {
    const customName = await input({
      message: 'Branch name:',
      validate: (v) => {
        if (!v.trim())
          return 'Branch name is required'
        if (!/^[\w/-]+$/.test(v.trim()))
          return 'Invalid branch name'
        return true
      },
    })
    return { mode: 'new', branch: customName.trim() }
  }

  return result
}

// ─── Scaffold Prompts ────────────────────────────────────────────

export async function promptProjectName(): Promise<string> {
  return await input({
    message: 'New project name:',
    validate: (v) => {
      if (!v.trim())
        return 'Name is required'
      if (!/^[a-z0-9][a-z0-9-]*$/.test(v.trim()))
        return 'Use lowercase letters, numbers, and hyphens'
      return true
    },
  })
}

export async function promptScaffoldTarget(): Promise<{
  type: 'new-repo' | 'existing-repo' | 'local'
  owner?: string
  repoName?: string
  path?: string
}> {
  const choice = await select({
    message: 'Where should the new project be created?',
    choices: [
      { name: '  Create a new GitHub repo', value: 'new-repo' as const },
      { name: '  Push to an existing GitHub repo', value: 'existing-repo' as const },
      { name: '  Local directory only', value: 'local' as const },
    ],
  })

  if (choice === 'new-repo') {
    const owner = await promptSelectOwner()
    return { type: 'new-repo', owner }
  }

  if (choice === 'existing-repo') {
    const owner = await promptSelectOwner()
    const repo = await promptSelectRepo(owner)
    return { type: 'existing-repo', owner, repoName: repo.name }
  }

  const localPath = await input({
    message: 'Output directory:',
    default: '../',
  })

  return { type: 'local', path: localPath }
}

// ─── Sync / Diff Prompts ─────────────────────────────────────────

export async function promptSyncStrategy(): Promise<SyncStrategy> {
  return await select({
    message: 'Sync strategy:',
    choices: [
      { name: '  Merge — Smart merge, skip customized files on conflict', value: 'merge' as const },
      { name: '  Patch — Copy base versions alongside for manual merge', value: 'patch' as const },
      { name: '  Overwrite — Force replace with base (dangerous)', value: 'overwrite' as const },
    ],
  })
}

export async function promptRepoVisibility(): Promise<boolean> {
  return await select({
    message: 'Repository visibility:',
    choices: [
      { name: '  Private', value: true },
      { name: '  Public', value: false },
    ],
  })
}

// ─── Utility Prompts ─────────────────────────────────────────────

export async function promptConfirm(message: string, defaultVal = true): Promise<boolean> {
  return await confirm({ message, default: defaultVal })
}

export async function promptFileSelection(files: string[]): Promise<string[]> {
  if (files.length === 0)
    return []

  const choices = files.map(f => ({ name: `[F] ${f}`, value: f, short: f }))

  return await searchCheckbox({
    message: 'Select files to include (Space to select, optionally type to filter):',
    defaultSelected: choices,
    source: async (input: string | undefined) => {
      const term = (input || '').toLowerCase()
      if (!term)
        return choices.slice(0, 100)
      return choices.filter(c => c.name.toLowerCase().includes(term) || c.value.toLowerCase().includes(term)).slice(0, 100)
    },
  })
}

export async function promptExcludePatterns(config?: BaseSyncConfig): Promise<string[]> {
  const localDir = process.cwd()
  let files: string[] = []

  try {
    files = await walkDir(localDir, config?.exclude || [])
  }
  catch {
    // Fallback if walkDir fails
  }

  const dirSet = new Set<string>()
  for (const f of files) {
    let dirname = path.dirname(f)
    while (dirname !== '.') {
      dirSet.add(dirname)
      dirname = path.dirname(dirname)
    }
  }

  const dirs = Array.from(dirSet).sort()

  const allChoices = [
    ...dirs.map(d => ({ name: ` ${d}`, value: d, short: d })),
    ...files.map(f => ({ name: `[F] ${f}`, value: f, short: f })),
  ]

  const selection = await searchCheckbox({
    message: 'Extra exclude patterns (Space to select, optionally type to filter):',
    source: async (input: string | undefined) => {
      const term = (input || '').toLowerCase()
      if (!term) {
        return allChoices.slice(0, 100)
      }
      const filtered = allChoices.filter(c =>
        c.name.toLowerCase().includes(term) || c.value.toLowerCase().includes(term),
      )
      return filtered.slice(0, 100)
    },
  })

  return selection
}

export async function promptDryRun(): Promise<boolean> {
  return await confirm({
    message: 'Dry run? (preview without writing)',
    default: false,
  })
}

export async function promptRefFolderName(suggestedName: string): Promise<string> {
  return await input({
    message: 'Reference folder name:',
    default: `_base-sync/${suggestedName}`,
  })
}

export async function promptOutputDir(): Promise<string> {
  return await input({
    message: 'Output directory:',
    default: '../',
  })
}

export async function promptSpecificPaths(config: BaseSyncConfig): Promise<string[]> {
  const localDir = process.cwd()
  let files: string[] = []

  try {
    files = await walkDir(localDir, config.exclude)
  }
  catch {
    // Fallback if walkDir fails
  }

  const dirSet = new Set<string>()
  for (const f of files) {
    let dirname = path.dirname(f)
    while (dirname !== '.') {
      dirSet.add(dirname)
      dirname = path.dirname(dirname)
    }
  }

  const dirs = Array.from(dirSet).sort()

  const allChoices = [
    ...dirs.map(d => ({ name: ` ${d}`, value: d, short: d })),
    ...files.map(f => ({ name: `[F] ${f}`, value: f, short: f })),
  ]

  const selection = await searchCheckbox({
    message: 'Select specific folders or files (Space to select, Enter to finish, optionally type to filter):',
    source: async (input: string | undefined) => {
      const term = (input || '').toLowerCase()
      if (!term) {
        return allChoices.slice(0, 100)
      }
      const filtered = allChoices.filter(c =>
        c.name.toLowerCase().includes(term) || c.value.toLowerCase().includes(term),
      )
      return filtered.slice(0, 100)
    },
  })

  return selection
}

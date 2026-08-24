import type { GitHubRepo } from '../types'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import consola from 'consola'

// ─── GitHub CLI Wrapper (Fully Repo-Based) ───────────────────────

/**
 * Check if `gh` CLI is available and authenticated
 */
export function isGhAvailable(): boolean {
  try {
    execSync('gh auth status', { stdio: 'pipe' })
    return true
  }
  catch {
    return false
  }
}

/**
 * Get the currently authenticated GitHub username
 */
export function getGhUsername(): string | null {
  try {
    return execSync('gh api user --jq .login', { stdio: 'pipe', encoding: 'utf-8', env: { ...process.env, PAGER: 'cat' } }).trim()
  }
  catch {
    return null
  }
}

/**
 * List all orgs the authenticated user belongs to
 */
export function listUserOrgs(): string[] {
  try {
    const output = execSync(
      `gh api user/orgs --jq ".[].login"`,
      { stdio: 'pipe', encoding: 'utf-8', env: { ...process.env, PAGER: 'cat' } },
    )
    return output.trim().split('\n').filter(Boolean)
  }
  catch {
    return []
  }
}

/**
 * List all available owners (user + orgs)
 */
export function listOwners(): { name: string, type: 'user' | 'org' }[] {
  const owners: { name: string, type: 'user' | 'org' }[] = []

  const username = getGhUsername()
  if (username) {
    owners.push({ name: username, type: 'user' })
  }

  const orgs = listUserOrgs()
  for (const org of orgs) {
    owners.push({ name: org, type: 'org' })
  }

  return owners
}

/**
 * List repos for an owner (user or org) via `gh`
 */
export function listOwnerRepos(owner: string): GitHubRepo[] {
  try {
    const output = execSync(
      `gh repo list ${owner} --limit 100 --json name,description,url,isPrivate`,
      { stdio: 'pipe', encoding: 'utf-8', env: { ...process.env, PAGER: 'cat' } },
    )
    return JSON.parse(output)
  }
  catch (err) {
    consola.warn(`Could not list repos for ${owner}:`, (err as Error).message)
    return []
  }
}

/**
 * List branches of a remote repo via `gh`
 */
export function listRepoBranches(ownerRepo: string): string[] {
  try {
    const output = execSync(
      `gh api repos/${ownerRepo}/branches --paginate --jq ".[].name"`,
      { stdio: 'pipe', encoding: 'utf-8', env: { ...process.env, PAGER: 'cat' } },
    )
    return output.trim().split('\n').filter(Boolean)
  }
  catch {
    return []
  }
}

/**
 * Get default branch of a repo
 */
export function getDefaultBranch(ownerRepo: string): string {
  try {
    return execSync(
      `gh api repos/${ownerRepo} --jq ".default_branch"`,
      { stdio: 'pipe', encoding: 'utf-8', env: { ...process.env, PAGER: 'cat' } },
    ).trim()
  }
  catch {
    return 'main'
  }
}

/**
 * Clone a repo into a temp directory (shallow clone for speed)
 */
export function cloneRepoToTemp(ownerRepo: string, branch?: string): string {
  const tmpBase = path.join(process.cwd(), '.basesync-tmp')
  const safeName = ownerRepo.replace('/', '__')
  const branchSuffix = branch ? `__${branch.replace(/\//g, '_')}` : ''
  const targetDir = path.join(tmpBase, `${safeName}${branchSuffix}`)

  // If we already cloned this recently (within last 5 min), reuse it
  if (fs.existsSync(targetDir)) {
    const stat = fs.statSync(targetDir)
    const ageMs = Date.now() - stat.mtimeMs
    if (ageMs < 5 * 60 * 1000) {
      consola.info(`Using cached clone of ${ownerRepo}@${branch || 'default'}`)
      return targetDir
    }
    // Delete stale cache
    fs.rmSync(targetDir, { recursive: true, force: true })
  }

  fs.mkdirSync(tmpBase, { recursive: true })

  consola.start(`Cloning ${ownerRepo}${branch ? `@${branch}` : ''}...`)

  const branchArg = branch ? `--branch ${branch}` : ''
  try {
    execSync(
      `gh repo clone ${ownerRepo} ${targetDir} -- --depth 50 ${branchArg}`,
      { stdio: 'pipe', encoding: 'utf-8', env: { ...process.env, PAGER: 'cat' } },
    )
    consola.success(`Cloned ${ownerRepo} → ${path.relative(process.cwd(), targetDir)}`)
  }
  catch (err) {
    consola.error(`Failed to clone ${ownerRepo}:`, (err as Error).message)
    throw new Error(`Clone failed for ${ownerRepo}`)
  }

  return targetDir
}

/**
 * Clean up temp clone directories
 */
export function cleanupTempClones(): void {
  const tmpBase = path.join(process.cwd(), '.basesync-tmp')
  if (fs.existsSync(tmpBase)) {
    fs.rmSync(tmpBase, { recursive: true, force: true })
    consola.info('Cleaned up temporary clones')
  }
}

/**
 * Create a new GitHub repo
 */
export function createGhRepo(
  name: string,
  org: string,
  options: { isPrivate?: boolean, description?: string } = {},
): string | null {
  try {
    const visibility = options.isPrivate ? '--private' : '--public'
    const desc = options.description ? `--description "${options.description}"` : ''
    const fullName = `${org}/${name}`

    execSync(
      `gh repo create ${fullName} ${visibility} ${desc} --confirm`,
      { stdio: 'pipe', encoding: 'utf-8', env: { ...process.env, PAGER: 'cat' } },
    )

    consola.success(`Created GitHub repo: ${fullName}`)
    return `https://github.com/${fullName}`
  }
  catch (err) {
    consola.error(`Failed to create repo:`, (err as Error).message)
    return null
  }
}

/**
 * Open a PR via `gh`
 */
export function createPullRequest(
  title: string,
  body: string,
  base: string,
  head: string,
): boolean {
  try {
    execSync(
      `gh pr create --title "${title}" --body "${body}" --base ${base} --head ${head}`,
      { stdio: 'pipe', encoding: 'utf-8', env: { ...process.env, PAGER: 'cat' } },
    )
    consola.success(`Created PR: ${title}`)
    return true
  }
  catch (err) {
    consola.error(`Failed to create PR:`, (err as Error).message)
    return false
  }
}

/**
 * Push a local branch to a remote repo
 */
export function pushToRepo(dir: string, remote = 'origin', branch?: string): void {
  try {
    const branchArg = branch || ''
    execSync(
      `git -C "${dir}" push --set-upstream ${remote} ${branchArg}`,
      { stdio: 'pipe', encoding: 'utf-8' },
    )
    consola.success(`Pushed to ${remote}/${branchArg}`)
  }
  catch (err) {
    consola.error('Push failed:', (err as Error).message)
  }
}

/**
 * Get repo URL for cloning
 */
export function getRepoUrl(owner: string, name: string): string {
  return `https://github.com/${owner}/${name}.git`
}

/**
 * Detect the owner/repo of the current project from git remote
 */
export function detectCurrentRepo(dir?: string): { owner: string, repo: string } | null {
  try {
    const cwd = dir || process.cwd()
    const remoteUrl = execSync(
      `git -C "${cwd}" remote get-url origin`,
      { stdio: 'pipe', encoding: 'utf-8' },
    ).trim()

    // Parse owner/repo from various URL formats
    const match = remoteUrl.match(/github\.com[/:]+([^/]+)\/([^/.]+)/)
    if (match) {
      return { owner: match[1], repo: match[2] }
    }
  }
  catch { /* not a git repo or no remote */ }
  return null
}

/**
 * Get modified files from an array of commits
 */
export function getModifiedFilesInCommits(dir: string, commits: string[]): string[] {
  if (!commits || commits.length === 0) return []
  const files = new Set<string>()
  for (const commit of commits) {
    try {
      const output = execSync(
        `git -C "${dir}" show --name-only --format="" ${commit}`,
        { stdio: 'pipe', encoding: 'utf-8' }
      )
      const lines = output.trim().split('\n').filter(Boolean)
      for (const line of lines) {
        files.add(line)
      }
    }
    catch {
      // ignore errors for individual commits
    }
  }
  return Array.from(files)
}

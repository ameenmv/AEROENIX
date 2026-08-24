import type { SimpleGit } from 'simple-git'
import type { BranchInfo } from '../types'
import consola from 'consola'
import simpleGit from 'simple-git'

// ─── Git Wrapper ─────────────────────────────────────────────────

export function createGit(cwd?: string): SimpleGit {
  return simpleGit(cwd || process.cwd())
}

export async function isGitRepo(dir: string): Promise<boolean> {
  try {
    const git = createGit(dir)
    return await git.checkIsRepo()
  }
  catch {
    return false
  }
}

export async function getCurrentBranch(dir: string): Promise<string> {
  const git = createGit(dir)
  const branch = await git.revparse(['--abbrev-ref', 'HEAD'])
  return branch.trim()
}

export async function listBranches(dir: string): Promise<BranchInfo[]> {
  const git = createGit(dir)
  const summary = await git.branch(['-a'])
  const branches: BranchInfo[] = []

  for (const [name, data] of Object.entries(summary.branches)) {
    // Skip HEAD references
    if (name.includes('HEAD'))
      continue

    const isRemote = name.startsWith('remotes/')
    const cleanName = isRemote
      ? name.replace(/^remotes\/origin\//, '')
      : name

    // Avoid duplicates (local + remote of same name)
    if (isRemote && branches.some(b => b.name === cleanName && !b.isRemote))
      continue

    branches.push({
      name: cleanName,
      current: data.current,
      isRemote,
    })
  }

  return branches
}

export async function createBranch(dir: string, branchName: string, checkout = true): Promise<void> {
  const git = createGit(dir)
  if (checkout) {
    await git.checkoutLocalBranch(branchName)
    consola.success(`Created and checked out branch: ${branchName}`)
  }
  else {
    await git.branch([branchName])
    consola.success(`Created branch: ${branchName}`)
  }
}

export async function checkoutBranch(dir: string, branchName: string): Promise<void> {
  const git = createGit(dir)
  await git.checkout(branchName)
  consola.success(`Checked out branch: ${branchName}`)
}

export async function stageAndCommit(dir: string, message: string, files?: string[]): Promise<void> {
  const git = createGit(dir)
  if (files && files.length > 0) {
    await git.add(files)
  }
  else {
    await git.add('.')
  }
  await git.commit(message, undefined, { '--no-verify': null })
  consola.success(`Committed: ${message}`)
}

export async function pushBranch(dir: string, remote = 'origin', branch?: string): Promise<void> {
  const git = createGit(dir)
  const currentBranch = branch || await getCurrentBranch(dir)
  await git.push(remote, currentBranch, ['--set-upstream'])
  consola.success(`Pushed to ${remote}/${currentBranch}`)
}

export async function initRepo(dir: string): Promise<void> {
  const git = createGit(dir)
  await git.init()
  consola.success(`Initialized new Git repo in ${dir}`)
}

export async function getRemoteUrl(dir: string): Promise<string | null> {
  try {
    const git = createGit(dir)
    const remotes = await git.getRemotes(true)
    const origin = remotes.find(r => r.name === 'origin')
    return origin?.refs?.fetch || null
  }
  catch {
    return null
  }
}

export async function getLastCommitDate(dir: string): Promise<string | null> {
  try {
    const git = createGit(dir)
    const log = await git.log({ maxCount: 1 })
    return log.latest?.date || null
  }
  catch {
    return null
  }
}

export async function getGitDiffStat(dir: string, base: string): Promise<string> {
  try {
    const git = createGit(dir)
    return await git.diff(['--stat', base])
  }
  catch {
    return ''
  }
}

export async function addRemote(dir: string, name: string, url: string): Promise<void> {
  const git = createGit(dir)
  await git.addRemote(name, url)
  consola.success(`Added remote ${name} → ${url}`)
}

export async function cloneRepo(url: string, targetDir: string, branch?: string): Promise<void> {
  const git = simpleGit()
  const opts = branch ? ['--branch', branch] : []
  await git.clone(url, targetDir, opts)
  consola.success(`Cloned ${url} → ${targetDir}`)
}

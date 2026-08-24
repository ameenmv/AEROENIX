import type { BaseSyncConfig, StatusOptions } from '../types'
import path from 'node:path'
import consola from 'consola'
import { diffDirectories } from '../lib/files'
import { getCurrentBranch, getLastCommitDate, isGitRepo } from '../lib/git'
import { cleanupTempClones, cloneRepoToTemp, detectCurrentRepo } from '../lib/github'
import { promptFullRepoSelection, promptSpecificPaths } from '../lib/prompts'
import { calculateDriftScore, printChangeAnalysis, printChangeBar, printDiffSummary, printStatusTable } from '../lib/reporter'

// ─── Status Command (GitHub-Native) ──────────────────────────────

export async function statusInteractive(config: BaseSyncConfig): Promise<void> {
  const currentRepo = detectCurrentRepo()
  console.log('')
  if (currentRepo) {
    consola.info(`Current project: ${currentRepo.owner}/${currentRepo.repo}`)
  }
  else {
    consola.info(`Current project: ${path.basename(process.cwd())} (local)`)
  }

  // Select repo to compare against
  console.log('')
  consola.info('Select the repo to compare against:')
  const repoSelection = await promptFullRepoSelection({
    excludeRepo: currentRepo?.repo,
    defaultOwner: currentRepo?.owner || config.github.org,
  })

  // Clone and compare
  const clonedDir = cloneRepoToTemp(repoSelection.fullName, repoSelection.branch)
  const specificPaths = await promptSpecificPaths(config)

  await executeStatus(config, {
    base: clonedDir,
    json: false,
    specificPaths,
  }, repoSelection.fullName, repoSelection.branch)

  cleanupTempClones()
}

export async function executeStatus(
  config: BaseSyncConfig,
  options: StatusOptions,
  repoName?: string,
  branchName?: string,
): Promise<void> {
  let resolvedBase: string

  // If base is owner/repo format, clone it
  if (options.base.includes('/') && !options.base.startsWith('.') && !options.base.startsWith('/')) {
    resolvedBase = cloneRepoToTemp(options.base)
    if (!repoName)
      repoName = options.base
  }
  else {
    resolvedBase = path.resolve(options.base)
  }

  const localDir = process.cwd()
  const localName = path.basename(localDir)
  const remoteName = repoName || path.basename(resolvedBase)

  let sourceOfTruthDir: string
  let sourceOfTruthName: string
  let derivedDir: string
  let derivedName: string

  if (config.role === 'base') {
    sourceOfTruthDir = localDir
    sourceOfTruthName = localName
    derivedDir = resolvedBase
    derivedName = remoteName
  }
  else {
    sourceOfTruthDir = resolvedBase
    sourceOfTruthName = remoteName
    derivedDir = localDir
    derivedName = localName
  }

  consola.start(`Comparing ${derivedName} against ${sourceOfTruthName}...`)
  const diff = await diffDirectories(sourceOfTruthDir, derivedDir, config.exclude, options.specificPaths)
  const driftScore = calculateDriftScore(diff)

  if (options.json) {
    const output = {
      child: derivedName,
      base: sourceOfTruthName,
      branch: branchName,
      driftScore,
      ...diff.summary,
      added: diff.added.map(f => f.relativePath),
      modified: diff.modified.map(f => f.relativePath),
      deleted: diff.deleted.map(f => f.relativePath),
    }
    console.log(JSON.stringify(output, null, 2))
    cleanupTempClones()
    return
  }

  // Header
  console.log('')
  console.log(`  [LOC] Project:  ${derivedName}`)
  console.log(`  [BAS] Base:     ${sourceOfTruthName}`)
  if (branchName) {
    console.log(`  [BRN] Branch:   ${branchName}`)
  }
  console.log(`  [DRF] Drift:    ${driftScore}%`)

  // Git info for current project
  const childIsGit = await isGitRepo(localDir)
  if (childIsGit) {
    const branch = await getCurrentBranch(localDir)
    const lastCommit = await getLastCommitDate(localDir)
    console.log(`  [BRN] Local Branch: ${branch}`)
    if (lastCommit)
      console.log(`  [CMT] Last Commit:  ${lastCommit}`)
  }

  if (config.lastSync) {
    console.log(`  [SYN] Last Sync:    ${config.lastSync}`)
  }

  printDiffSummary(diff)
  printChangeBar(diff)
  printChangeAnalysis(diff)
  printStatusTable(diff)

  cleanupTempClones()
}

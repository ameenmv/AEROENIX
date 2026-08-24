import type { BaseSyncConfig, DiffOptions } from '../types'
import fs from 'node:fs'
import path from 'node:path'
import consola from 'consola'
import { copyFiles, diffDirectories } from '../lib/files'
import { createBranch, createGit, isGitRepo, pushBranch, stageAndCommit } from '../lib/git'
import { cleanupTempClones, cloneRepoToTemp, detectCurrentRepo, getModifiedFilesInCommits } from '../lib/github'
import {
  promptApplyMode,
  promptConfirm,
  promptDryRun,
  promptExcludePatterns,
  promptFullRepoSelection,
  promptRefFolderName,
  promptSelectCommits,
  promptSpecificPaths,
  promptTargetBranch,
} from '../lib/prompts'
import {
  generateMarkdownReport,
  printChangeAnalysis,
  printChangeBar,
  printDiffSummary,
  printStatusTable,
  printSuccess,
} from '../lib/reporter'
import { launchWebDiffViewer } from '../lib/webDiff'

// ─── Diff Command (GitHub-Native) ────────────────────────────────

export async function diffInteractive(config: BaseSyncConfig): Promise<void> {
  const childDir = process.cwd()
  const childName = path.basename(childDir)

  // Detect current project's repo
  const currentRepo = detectCurrentRepo()
  console.log('')
  if (currentRepo) {
    consola.info(`Current project: ${currentRepo.owner}/${currentRepo.repo}`)
  }
  else {
    consola.info(`Current project: ${childName} (local)`)
  }

  // Step 1: Select what to compare against (a GitHub repo)
  console.log('')
  consola.info('Select the repo to compare against:')
  const repoSelection = await promptFullRepoSelection({
    excludeRepo: currentRepo?.repo,
    defaultOwner: currentRepo?.owner || config.github.org,
  })

  // Step 2: Clone the selected repo
  const clonedDir = cloneRepoToTemp(repoSelection.fullName, repoSelection.branch)

  // Commit selection flow
  const selectedCommits = await promptSelectCommits(clonedDir)
  let specificPaths: string[] = []
  let extraExclude: string[] = []
  let baseExclude = config.exclude

  if (selectedCommits && selectedCommits.length > 0) {
    specificPaths = getModifiedFilesInCommits(clonedDir, selectedCommits)
    if (specificPaths.length === 0) {
      consola.warn('No modified files found in the selected commits. Exiting.')
      cleanupTempClones()
      return
    }
    consola.info(`Filtered down to ${specificPaths.length} file(s) modified in selected commits.`)
    baseExclude = [] // bypass exclude so we don't hide files from those commits
  } else {
    specificPaths = await promptSpecificPaths(config)
  }

  let diffBaseDir: string
  let diffDerivedDir: string
  let copySourceDir: string
  let copyTargetDir: string
  let targetName: string
  let targetRepoFullName: string | null

  if (config.role === 'base') {
    // Diff compares local (base) vs remote (derived)
    diffBaseDir = childDir
    diffDerivedDir = clonedDir

    // Copy features FROM remote child TO local base
    copySourceDir = clonedDir
    copyTargetDir = childDir

    targetName = childName // Local base name
    targetRepoFullName = currentRepo ? `${currentRepo.owner}/${currentRepo.repo}` : null
  }
  else {
    // Diff compares remote (base) vs local (child)
    diffBaseDir = clonedDir
    diffDerivedDir = childDir

    // Copy features FROM local child TO remote base
    copySourceDir = childDir
    copyTargetDir = clonedDir

    targetName = repoSelection.fullName.split('/').pop() || 'base'
    targetRepoFullName = repoSelection.fullName
  }

  // Step 3: Run diff
  consola.start('Comparing files...')
  
  if (!selectedCommits || selectedCommits.length === 0) {
    extraExclude = await promptExcludePatterns(config)
  }
  
  const exclude = [...baseExclude, ...extraExclude]
  const diff = await diffDirectories(diffBaseDir, diffDerivedDir, exclude, specificPaths)

  printDiffSummary(diff)
  printChangeBar(diff)
  printChangeAnalysis(diff)
  printStatusTable(diff)

  if (diff.summary.addedCount + diff.summary.modifiedCount + diff.summary.deletedCount === 0) {
    consola.success('No differences found. Your project matches the base!')
    cleanupTempClones()
    return
  }

  // Launch Interactive Web Viewer for Diff & Selection
  const submission = await launchWebDiffViewer(diff, diffBaseDir, diffDerivedDir)
  const changedFiles = submission.selectedFiles
  const mixedEdits = submission.mixedEdits

  // If user selected 0 files, they might have cancelled or just submitted empty.
  if (changedFiles.length === 0 && Object.keys(mixedEdits || {}).length === 0) {
    consola.info('No files selected in the web viewer. Exiting.')
    cleanupTempClones()
    return
  }

  // Step 4: Ask what to do with the diff
  const applyMode = await promptApplyMode()
  const dryRun = await promptDryRun()
  const localOnly = true
  consola.info(' Enforcing Local-only mode (No remote push/fetch)')

  // ── Handle Custom Mixed Edits from Web UI
  const mixedFiles = Object.keys(mixedEdits || {})
  if (mixedFiles.length > 0) {
    consola.info(`\n── Manual Web Edits (${mixedFiles.length}) ──`)
    if (!dryRun) {
      for (const file of mixedFiles) {
        // mixed edits are applied to the local derived directory if it's the child,
        // wait, we should apply them to targetDir which is passed in handleBranchMode!
      }
    }
  }

  if (applyMode === 'new-branch' || applyMode === 'existing-branch') {
    await handleBranchMode(diff, changedFiles, mixedEdits, copySourceDir, copyTargetDir, targetName, targetRepoFullName, applyMode, dryRun, localOnly)
  }
  else if (applyMode === 'ref-folder') {
    await handleRefFolderMode(diff, changedFiles, mixedEdits, copySourceDir, copyTargetDir, targetName, dryRun, localOnly)
  }
  else if (applyMode === 'merge-ref-folder') {
    await handleMergeRefFolderMode(diff, changedFiles, mixedEdits, copySourceDir, copyTargetDir, targetName, dryRun, localOnly)
  }

  // Generate report
  const doReport = await promptConfirm('Generate markdown report?', true)
  if (doReport) {
    const report = generateMarkdownReport(diff, childName, `${repoSelection.fullName}@${repoSelection.branch}`)
    const reportPath = path.join(childDir, 'DIFF_REPORT.md')
    if (!dryRun) {
      fs.writeFileSync(reportPath, report)
      consola.success(`Report saved to ${reportPath}`)
    }
    else {
      consola.info(`[DRY RUN] Would save report to ${reportPath}`)
    }
  }

  // Cleanup
  cleanupTempClones()
}

async function handleBranchMode(
  diff: any,
  changedFiles: string[],
  mixedEdits: Record<string, string>,
  sourceDir: string,
  targetDir: string,
  targetName: string,
  targetRepoFullName: string | null,
  applyMode: 'new-branch' | 'existing-branch',
  dryRun: boolean,
  localOnly: boolean,
): Promise<void> {
  const hasGit = await isGitRepo(targetDir)
  if (!hasGit) {
    consola.error(`The target directory (${targetName}) is not a Git repo. Cannot create branches.`)
    return
  }

  let branchName: string

  if (applyMode === 'new-branch') {
    const branchResult = await promptTargetBranch(targetRepoFullName || '', targetName)
    branchName = branchResult.branch
  }
  else {
    const branchResult = await promptTargetBranch(targetRepoFullName || '')
    branchName = branchResult.branch
  }

  if (dryRun) {
    consola.info(`[DRY RUN] Would copy/modify ${changedFiles.length} files to ${targetName} and use branch "${branchName}"`)
    consola.info(`[DRY RUN] Would apply ${Object.keys(mixedEdits || {}).length} mixed edits`)
    return
  }

  if (applyMode === 'new-branch') {
    await createBranch(targetDir, branchName)
  }
  else {
    // Switch to existing branch and fetch it if needed from remote
    const git = createGit(targetDir)
    try {
      await git.checkout(branchName)
      consola.success(`Switched to branch: ${branchName}`)
    }
    catch {
      if (localOnly) {
        consola.warn(`Branch ${branchName} not found locally. In local-only mode, cannot fetch from remote.`)
        consola.info(`Creating branch ${branchName} locally instead...`)
        await createBranch(targetDir, branchName)
      }
      else {
        consola.info(`Branch ${branchName} not found locally. Attempting to fetch from remote...`)
        try {
          await git.fetch('origin', `${branchName}:${branchName}`)
          await git.checkout(branchName)
          consola.success(`Fetched and switched to branch: ${branchName}`)
        }
        catch (err: any) {
          consola.error(`Failed to checkout branch ${branchName}. Make sure it exists. Original error: ${err.message}`)
          return
        }
      }
    }
  }

  // Handle deletions: if a file is in changedFiles but doesn't exist in sourceDir, it means we are "taking incoming" which is deleting it
  for (const file of changedFiles) {
    const sourcePath = path.join(sourceDir, file)
    const targetPath = path.join(targetDir, file)
    if (!fs.existsSync(sourcePath)) {
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath)
        consola.info(`Deleted ${file} (missing in incoming base)`)
      }
    }
  }

  copyFiles(changedFiles, sourceDir, targetDir)

  // Handle mixedEdits
  const mixedFiles = Object.keys(mixedEdits || {})
  for (const file of mixedFiles) {
    const targetPath = path.join(targetDir, file)
    fs.mkdirSync(path.dirname(targetPath), { recursive: true })
    fs.writeFileSync(targetPath, mixedEdits[file], 'utf-8')
    consola.success(`Applied mixed edit for ${file}`)
  }

  const allTouchedFiles = Array.from(new Set([...changedFiles, ...mixedFiles]))

  const doCommit = await promptConfirm('Automatically commit these changes?', false)
  if (doCommit && allTouchedFiles.length > 0) {
    await stageAndCommit(targetDir, `chore(base-sync): diff snapshot from ${targetName}`, allTouchedFiles)

    // Local-only mode: skip push prompt entirely
    if (localOnly) {
      consola.info(`[LOK] Local-only mode: Changes committed locally to branch "${branchName}" (not pushed to remote)`)
    }
    else {
      const doPush = await promptConfirm('Push this branch to remote?', false)
      if (doPush) {
        await pushBranch(targetDir, 'origin', branchName)
      }
    }
  }
  else {
    consola.info(`Changes copied to "${branchName}" but left uncommitted in the working directory.`)
  }

  printSuccess(`Branch "${branchName}" handled in ${targetName} with ${allTouchedFiles.length} files applied.`)
}

async function handleRefFolderMode(
  diff: any,
  changedFiles: string[],
  mixedEdits: Record<string, string>,
  sourceDir: string,
  targetDir: string,
  targetName: string,
  dryRun: boolean,
  localOnly: boolean,
): Promise<void> {
  const folderName = await promptRefFolderName(targetName)
  const refDir = path.join(targetDir, folderName)

  if (dryRun) {
    consola.info(`[DRY RUN] Would copy ${changedFiles.length} files to ${refDir}`)
    consola.info(`[DRY RUN] Would apply ${Object.keys(mixedEdits || {}).length} mixed edits`)
    return
  }

  const result = copyFiles(changedFiles, sourceDir, refDir)

  // Handle mixedEdits
  const mixedFiles = Object.keys(mixedEdits || {})
  for (const file of mixedFiles) {
    const targetPath = path.join(refDir, file)
    fs.mkdirSync(path.dirname(targetPath), { recursive: true })
    fs.writeFileSync(targetPath, mixedEdits[file], 'utf-8')
    consola.success(`Saved mixed edit for ${file}`)
  }

  if (localOnly) {
    consola.info(`[LOK] Local-only mode: Copied ${result.copied} files and saved ${mixedFiles.length} edits to local ref folder ${refDir}`)
  }
  printSuccess(`Copied ${result.copied} files to ${refDir}`)

  // Also save deleted files list
  if (diff.deleted.length > 0) {
    const deletedList = diff.deleted.map((f: any) => f.relativePath).join('\n')
    fs.writeFileSync(path.join(refDir, '_DELETED_FILES.txt'), `${deletedList}\n`)
    consola.info('Saved list of deleted files to _DELETED_FILES.txt')
  }
}

async function handleMergeRefFolderMode(
  diff: any,
  changedFiles: string[],
  mixedEdits: Record<string, string>,
  sourceDir: string,
  targetDir: string,
  targetName: string,
  dryRun: boolean,
  _localOnly: boolean,
): Promise<void> {
  const folderName = await promptRefFolderName(targetName)
  const refDir = path.join(targetDir, folderName)

  if (dryRun) {
    consola.info(`[DRY RUN] Would merge ${changedFiles.length} files into ${refDir}`)
    consola.info(`[DRY RUN] Would apply ${Object.keys(mixedEdits || {}).length} mixed edits`)
    if (diff.deleted.length > 0) {
      consola.info(`[DRY RUN] Would delete ${diff.deleted.length} files from ${refDir}`)
    }
    return
  }

  // Step 1: Copy changed/added files into the ref folder
  const result = copyFiles(changedFiles, sourceDir, refDir)
  consola.success(`Copied ${result.copied} files into ${refDir}`)

  // Step 2: Apply mixed edits
  const mixedFiles = Object.keys(mixedEdits || {})
  for (const file of mixedFiles) {
    const targetPath = path.join(refDir, file)
    fs.mkdirSync(path.dirname(targetPath), { recursive: true })
    fs.writeFileSync(targetPath, mixedEdits[file], 'utf-8')
    consola.success(`Applied mixed edit for ${file}`)
  }

  // Step 3: Handle deletions — remove files from the ref folder that were deleted
  let deletedCount = 0
  for (const file of changedFiles) {
    const sourcePath = path.join(sourceDir, file)
    const refPath = path.join(refDir, file)
    if (!fs.existsSync(sourcePath) && fs.existsSync(refPath)) {
      fs.unlinkSync(refPath)
      consola.info(`Deleted ${file} (missing in incoming source)`)
      deletedCount++
    }
  }

  // Also handle explicit deletions from the diff
  for (const deleted of diff.deleted) {
    const refPath = path.join(refDir, deleted.relativePath)
    if (fs.existsSync(refPath)) {
      fs.unlinkSync(refPath)
      consola.info(`Deleted ${deleted.relativePath}`)
      deletedCount++
    }
  }

  if (deletedCount > 0) {
    consola.info(`Removed ${deletedCount} deleted file(s) from ${refDir}`)
  }

  // Save a manifest of deleted files for reference
  if (diff.deleted.length > 0) {
    const deletedList = diff.deleted.map((f: any) => f.relativePath).join('\n')
    fs.writeFileSync(path.join(refDir, '_DELETED_FILES.txt'), `${deletedList}\n`)
    consola.info('Saved list of deleted files to _DELETED_FILES.txt')
  }

  const totalApplied = result.copied + mixedFiles.length
  printSuccess(`Merged ${totalApplied} files into ${refDir} (${deletedCount} deleted)`)
}

/**
 * Non-interactive diff execution (for CLI flags)
 */
export async function executeDiff(config: BaseSyncConfig, options: DiffOptions): Promise<void> {
  const childDir = process.cwd()
  const childName = path.basename(childDir)

  // If base is owner/repo format, clone it; else use as path
  let resolvedBase: string
  if (options.base.includes('/') && !options.base.startsWith('.') && !options.base.startsWith('/')) {
    const branch = options.branch
    resolvedBase = cloneRepoToTemp(options.base, branch)
  }
  else {
    resolvedBase = path.resolve(options.base)
  }

  let diffBaseDir: string
  let diffDerivedDir: string
  let copySourceDir: string
  let _copyTargetDir: string

  if (config.role === 'base') {
    diffBaseDir = childDir
    diffDerivedDir = resolvedBase

    copySourceDir = resolvedBase
    _copyTargetDir = childDir
  }
  else {
    diffBaseDir = resolvedBase
    diffDerivedDir = childDir

    copySourceDir = childDir
    _copyTargetDir = resolvedBase
  }

  consola.start('Comparing files...')
  const diff = await diffDirectories(diffBaseDir, diffDerivedDir, config.exclude, options.specificPaths)

  printDiffSummary(diff)
  printChangeBar(diff)
  printChangeAnalysis(diff)
  printStatusTable(diff)

  if (options.localOnly) {
    consola.info(' Local-only mode: No remote operations will be performed')
  }

  // Collect files based on filters
  let changedFiles: string[] = []
  if (!options.addedOnly && !options.modifiedOnly && !options.deletedOnly) {
    changedFiles = [
      ...diff.added.map(f => f.relativePath),
      ...diff.modified.map(f => f.relativePath),
    ]
  }
  else {
    if (options.addedOnly)
      changedFiles.push(...diff.added.map(f => f.relativePath))
    if (options.modifiedOnly)
      changedFiles.push(...diff.modified.map(f => f.relativePath))
  }

  // Copy to output
  if (options.output) {
    if (!options.dryRun) {
      fs.mkdirSync(options.output, { recursive: true })
      const result = copyFiles(changedFiles, copySourceDir, options.output, options.dryRun)
      consola.success(`Copied ${result.copied} files to ${options.output}`)
    }
    else {
      consola.info(`[DRY RUN] Would copy ${changedFiles.length} files to ${options.output}`)
    }
  }

  // Generate report
  if (options.report) {
    const report = generateMarkdownReport(diff, childName, options.base)
    const reportPath = path.join(childDir, 'DIFF_REPORT.md')
    if (!options.dryRun) {
      fs.writeFileSync(reportPath, report)
      consola.success(`Report saved to ${reportPath}`)
    }
  }

  cleanupTempClones()
}

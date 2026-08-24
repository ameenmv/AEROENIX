import type { BaseSyncConfig, SyncOptions } from '../types'
import fs from 'node:fs'
import path from 'node:path'
import consola from 'consola'
import { saveConfig } from '../config'
import { createBackup } from '../lib/backup'
import { isSafeToAutoMerge } from '../lib/categorizer'
import { compareFiles, copyFiles, diffDirectories } from '../lib/files'
import { cleanupTempClones, cloneRepoToTemp, detectCurrentRepo, getModifiedFilesInCommits } from '../lib/github'
import {
  promptConfirm,
  promptDryRun,
  promptFullRepoSelection,
  promptSelectCommits,
  promptSpecificPaths,
  promptSyncStrategy,
} from '../lib/prompts'
import { printChangeAnalysis, printDiffSummary, printSuccess } from '../lib/reporter'
import { launchWebDiffViewer } from '../lib/webDiff'

// ─── Sync Command (GitHub-Native) ────────────────────────────────

export async function syncInteractive(config: BaseSyncConfig): Promise<void> {
  const currentRepo = detectCurrentRepo()
  console.log('')
  if (currentRepo) {
    consola.info(`Current project: ${currentRepo.owner}/${currentRepo.repo}`)
  }
  else {
    consola.info(`Current project: ${path.basename(process.cwd())} (local)`)
  }

  // Select base repo to sync from
  console.log('')
  if (config.role === 'base') {
    consola.warn('You are running "sync" from a Base project.')
    consola.info('Usually, "sync" is run from a Child project to pull updates FROM a Base.')
    consola.info('If you continue, you will pull changes FROM the selected remote into this local Base project.')
    console.log('')
  }

  consola.info('Select the repo to sync FROM:')
  const repoSelection = await promptFullRepoSelection({
    excludeRepo: currentRepo?.repo,
    defaultOwner: currentRepo?.owner || config.github.org,
  })

  // We will prompt for strategy after seeing the diff
  // Clone the base repo
  const clonedDir = cloneRepoToTemp(repoSelection.fullName, repoSelection.branch)
  
  const selectedCommits = await promptSelectCommits(clonedDir)
  let specificPaths: string[] = []
  let excludeVars = config.exclude

  if (selectedCommits && selectedCommits.length > 0) {
    specificPaths = getModifiedFilesInCommits(clonedDir, selectedCommits)
    if (specificPaths.length === 0) {
      consola.warn('No modified files found in the selected commits. Exiting.')
      cleanupTempClones()
      return
    }
    consola.info(`Filtered down to ${specificPaths.length} file(s) modified in selected commits.`)
    // Focus entirely on the commits files! Do not let normal include/exclude filters affect them.
    excludeVars = []
  } else {
    // Fall back to original prompt if no commits were selected
    specificPaths = await promptSpecificPaths(config)
  }

  await executeSync(config, {
    base: clonedDir,
    exclude: excludeVars,
    specificPaths,
  }, repoSelection.fullName)

  cleanupTempClones()
}

export async function executeSync(
  config: BaseSyncConfig,
  options: Partial<SyncOptions>,
  repoName?: string,
): Promise<void> {
  let resolvedBase: string

  // If base is owner/repo format, clone it
  if (options.base!.includes('/') && !options.base!.startsWith('.') && !options.base!.startsWith('/')) {
    resolvedBase = cloneRepoToTemp(options.base!)
  }
  else {
    resolvedBase = path.resolve(options.base!)
  }

  const childDir = process.cwd()
  const childName = path.basename(childDir)
  const baseName = repoName || path.basename(resolvedBase)

  consola.start(`Syncing ${childName} from ${baseName}...`)

  const diff = await diffDirectories(resolvedBase, childDir, options.exclude || config.exclude, options.specificPaths)

  // For sync: diff perspective is "base vs child"
  // diff.deleted = files in base but not child → files we should ADD from base
  // diff.modified = files different between base and child → potential sync targets
  // diff.added = files in child but not base → child-specific, leave alone

  // ── Show detailed analysis
  printDiffSummary(diff)
  printChangeAnalysis(diff)

  // ── Summary of sync targets
  const whitespaceOnly = diff.modified.filter(f => (f as any).whitespaceOnly)
  const realModified = diff.modified.filter(f => !(f as any).whitespaceOnly)

  console.log('')
  consola.info('Files to potentially sync:')
  consola.info(`  [+] New from base (will be added):       ${diff.deleted.length}`)
  consola.info(`  [~] Modified (logic changes):            ${realModified.length}`)
  if (whitespaceOnly.length > 0) {
    consola.info(`  [~] Modified (whitespace only):           ${whitespaceOnly.length}`)
  }
  consola.info(`  [K] Child-only files (will be kept):      ${diff.added.length}`)
  console.log('')

  if (diff.deleted.length === 0 && diff.modified.length === 0) {
    consola.success('Already in sync! No changes to apply.')
    cleanupTempClones()
    return
  }

  // ── Provide Web UI for Review and Selection ──
  const { selectedFiles, mixedEdits } = await launchWebDiffViewer(diff, resolvedBase, childDir)

  if (selectedFiles.length === 0 && Object.keys(mixedEdits || {}).length === 0) {
    consola.info('No files selected in the web viewer. Exiting.')
    cleanupTempClones()
    return
  }

  // Filter diff based on selected files
  diff.added = diff.added.filter(f => selectedFiles.includes(f.relativePath))
  diff.modified = diff.modified.filter(f => selectedFiles.includes(f.relativePath))
  diff.deleted = diff.deleted.filter(f => selectedFiles.includes(f.relativePath))

  // Now ask for strategy
  const strategy = options.strategy || await promptSyncStrategy()
  const dryRun = options.dryRun ?? await promptDryRun()

  // ── Handle NEW files from base
  if (diff.deleted.length > 0) {
    consola.info(`\n── New files from base (${diff.deleted.length}) ──`)
    const filesToSync = diff.deleted.map(f => f.relativePath)

    if (!dryRun) {
      const result = copyFiles(filesToSync, resolvedBase, childDir)
      consola.success(`Added ${result.copied} new files from base`)
    }
    else {
      consola.info(`[DRY RUN] Would add ${filesToSync.length} files from base`)
    }
  }

  // ── Handle MODIFIED files
  if (diff.modified.length > 0) {
    consola.info(`\n── Modified files (${diff.modified.length}) ──`)
    const modifiedFiles = diff.modified.map(f => f.relativePath)

    if (strategy === 'overwrite') {
      if (!dryRun) {
        // Backup before overwrite
        createBackup(modifiedFiles, childDir)
        const result = copyFiles(modifiedFiles, resolvedBase, childDir)
        consola.success(`Overwrote ${result.copied} files with base versions`)
        consola.info(' Originals backed up to .basesync-backups/')
      }
      else {
        consola.info(`[DRY RUN] Would overwrite ${modifiedFiles.length} files`)
      }
    }
    else if (strategy === 'merge') {
      consola.info('Smart merge: analyzing each file with risk scoring...')

      const safeToSync: string[] = []
      const whitespaceOnlyFiles: string[] = []
      const conflicts: string[] = []

      for (const fileChange of diff.modified) {
        const file = fileChange.relativePath
        const basePath = path.join(resolvedBase, file)
        const childPath = path.join(childDir, file)
        const comparison = compareFiles(basePath, childPath)

        if (comparison.whitespaceOnly) {
          whitespaceOnlyFiles.push(file)
        }
        else if (isSafeToAutoMerge(fileChange)) {
          safeToSync.push(file)
        }
        else {
          conflicts.push(file)
        }
      }

      // Handle whitespace-only changes
      if (whitespaceOnlyFiles.length > 0) {
        consola.info(`  [~] Whitespace-only: ${whitespaceOnlyFiles.length} files (formatting changes)`)
        if (!dryRun) {
          const result = copyFiles(whitespaceOnlyFiles, resolvedBase, childDir)
          consola.success(`Synced ${result.copied} whitespace-only files`)
        }
      }

      // Handle safe files
      if (safeToSync.length > 0) {
        consola.info(`  [OK] Safe to sync: ${safeToSync.length} files (low risk score)`)
        if (!dryRun) {
          // Backup even safe files
          createBackup(safeToSync, childDir)
          const result = copyFiles(safeToSync, resolvedBase, childDir)
          consola.success(`Synced ${result.copied} files`)
        }
      }

      // Handle conflicts (high-risk files)
      if (conflicts.length > 0) {
        consola.warn(`  [WARN] ${conflicts.length} files have significant customizations (high risk score):`)
        for (const f of conflicts) {
          const fileChange = diff.modified.find(fc => fc.relativePath === f)
          const stats = fileChange
            ? `  (+${fileChange.linesAdded}/-${fileChange.linesRemoved})`
            : ''
          consola.info(`     - ${f}${stats}`)
        }

        const doForce = await promptConfirm('Wait, these are HIGH RISK files. Force overwrite them anyway?', false)
        if (doForce) {
          const filesToForce = conflicts
          if (!dryRun) {
            // Backup before force overwrite
            createBackup(filesToForce, childDir)
            const result = copyFiles(filesToForce, resolvedBase, childDir)
            consola.success(`Force-synced ${result.copied} files`)
            consola.info(' Originals backed up to .basesync-backups/')
          }
        }
        else {
          consola.info('Skipped conflicting files')
        }
      }
    }
    else {
      // Patch strategy
      const patchDir = path.join(childDir, '_base-sync-patches')
      consola.info(`Patch mode: copying base versions to ${patchDir}/`)

      if (!dryRun) {
        const result = copyFiles(modifiedFiles, resolvedBase, patchDir)
        consola.success(`Copied ${result.copied} base versions for manual patching`)
        consola.info('Compare files manually and merge as needed, then delete the patches folder.')
      }
      else {
        consola.info(`[DRY RUN] Would copy ${modifiedFiles.length} files to ${patchDir}/`)
      }
    }
  }

  // ── Handle Custom Mixed Edits from Web UI
  const mixedFiles = Object.keys(mixedEdits || {})
  if (mixedFiles.length > 0) {
    consola.info(`\n── Manual Web Edits (${mixedFiles.length}) ──`)
    if (!dryRun) {
      for (const file of mixedFiles) {
        const targetPath = path.join(childDir, file)
        fs.mkdirSync(path.dirname(targetPath), { recursive: true })
        fs.writeFileSync(targetPath, mixedEdits[file], 'utf-8')
      }
      consola.success(`Successfully saved ${mixedFiles.length} manual web edits`)
    }
    else {
      consola.info(`[DRY RUN] Would save ${mixedFiles.length} manual web edits`)
    }
  }

  // ── Update lastSync
  if (!dryRun) {
    config.lastSync = new Date().toISOString()
    saveConfig(config)
  }

  printSuccess('Sync complete!')
  cleanupTempClones()
}

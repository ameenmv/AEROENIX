import type { BaseSyncConfig, ScaffoldOptions } from '../types'
import fs from 'node:fs'
import path from 'node:path'
import consola from 'consola'
import { loadRegistry, saveConfig, saveRegistry } from '../config'
import { copyDirectory } from '../lib/files'
import { addRemote, initRepo, pushBranch, stageAndCommit } from '../lib/git'
import { createGhRepo, detectCurrentRepo, isGhAvailable } from '../lib/github'
import {
  promptConfirm,
  promptDryRun,
  promptExcludePatterns,
  promptProjectName,
  promptRepoVisibility,
  promptScaffoldTarget,
} from '../lib/prompts'
import { printScaffoldSummary, printSuccess } from '../lib/reporter'

// ─── Scaffold Command (GitHub-Native) ────────────────────────────

export async function scaffoldInteractive(config: BaseSyncConfig): Promise<void> {
  const name = await promptProjectName()
  const target = await promptScaffoldTarget()
  const extraExclude = await promptExcludePatterns(config)
  const dryRun = await promptDryRun()

  let outputDir: string
  let push = false
  let isPrivate = true
  let targetOwner = config.github.org

  if (target.type === 'new-repo') {
    targetOwner = target.owner || config.github.org
    isPrivate = await promptRepoVisibility()
    outputDir = path.resolve('../', name)
    push = true
  }
  else if (target.type === 'existing-repo') {
    targetOwner = target.owner || config.github.org
    outputDir = path.resolve('../', name)
    push = true
  }
  else {
    outputDir = path.resolve(target.path || '../', name)
  }

  const options: ScaffoldOptions = {
    name,
    output: outputDir,
    gitInit: push || await promptConfirm('Initialize a Git repo?', true),
    push,
    branch: config.defaultBranch,
    dryRun,
    exclude: [...config.exclude, ...extraExclude],
  }

  printScaffoldSummary(name, outputDir, { ...options, targetOwner, targetType: target.type })

  const proceed = await promptConfirm('Proceed with scaffold?')
  if (!proceed) {
    consola.info('Aborted.')
    return
  }

  await executeScaffold(config, options, isPrivate, targetOwner, target.type === 'new-repo' ? 'create' : target.type === 'existing-repo' ? 'existing' : 'local')
}

export async function executeScaffold(
  config: BaseSyncConfig,
  options: ScaffoldOptions,
  isPrivate = true,
  targetOwner?: string,
  repoMode: 'create' | 'existing' | 'local' = 'local',
): Promise<void> {
  const baseDir = process.cwd()

  // ── 1. Check if output already exists
  if (fs.existsSync(options.output) && !options.dryRun) {
    const entries = fs.readdirSync(options.output)
    if (entries.length > 0) {
      consola.error(`Output directory is not empty: ${options.output}`)
      return
    }
  }

  // ── 2. Copy files
  consola.start('Copying base project files...')
  const result = await copyDirectory(baseDir, options.output, options.exclude, options.dryRun)

  if (options.dryRun) {
    consola.info(`[DRY RUN] Would copy ${result.total} files to ${options.output}`)
    return
  }

  consola.success(`Copied ${result.copied} files`)

  // ── 3. Rewrite package.json
  const pkgPath = path.join(options.output, 'package.json')
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
      pkg.name = options.name
      pkg.version = '0.1.0'
      pkg.description = `${options.name} — derived from dashboard-base-vue`
      delete pkg.repository
      fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
      consola.success('Updated package.json (name, version, description)')
    }
    catch (err) {
      consola.warn('Could not update package.json:', err)
    }
  }

  // ── 4. Create child .basesync.json
  const currentRepo = detectCurrentRepo()
  const childConfig: BaseSyncConfig = {
    role: 'child',
    base: currentRepo ? `${currentRepo.owner}/${currentRepo.repo}` : path.relative(options.output, baseDir),
    exclude: config.exclude,
    defaultBranch: options.branch,
    registry: config.registry,
    github: config.github,
    lastSync: new Date().toISOString(),
    baseBranch: config.defaultBranch,
  }
  saveConfig(childConfig, options.output)

  // ── 5. Remove base-only files
  const baseOnlyFiles = ['.basesync-registry.json', 'CHANGELOG.md']
  for (const f of baseOnlyFiles) {
    const fp = path.join(options.output, f)
    if (fs.existsSync(fp)) {
      fs.unlinkSync(fp)
      consola.info(`Removed base-only file: ${f}`)
    }
  }

  // ── 6. Git init
  if (options.gitInit) {
    await initRepo(options.output)

    const doCommit = await promptConfirm('Create initial commit for the new project?', true)
    if (doCommit) {
      await stageAndCommit(options.output, `chore: init ${options.name} from base`)

      // ── 7. GitHub push
      if (options.push && isGhAvailable() && targetOwner) {
        if (repoMode === 'create') {
          const repoUrl = createGhRepo(options.name, targetOwner, {
            isPrivate,
            description: `${options.name} — derived from dashboard-base-vue`,
          })
          if (repoUrl) {
            await addRemote(options.output, 'origin', repoUrl)
            await pushBranch(options.output, 'origin', options.branch)
          }
        }
        else if (repoMode === 'existing') {
          const repoUrl = `https://github.com/${targetOwner}/${options.name}.git`
          await addRemote(options.output, 'origin', repoUrl)
          await pushBranch(options.output, 'origin', options.branch)
        }
      }
    }
  }

  // ── 8. Update registry
  const registry = loadRegistry(config)
  registry.children.push({
    name: options.name,
    path: path.relative(baseDir, options.output),
    remote: targetOwner ? `${targetOwner}/${options.name}` : undefined,
    branch: options.branch,
    lastSync: new Date().toISOString(),
    driftScore: 0,
    createdAt: new Date().toISOString(),
  })
  saveRegistry(config, registry)

  printSuccess(`\n  [OK] Project "${options.name}" scaffolded at ${options.output}\n`)
}

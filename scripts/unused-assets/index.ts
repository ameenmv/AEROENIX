#!/usr/bin/env bun
/**
 * unused-assets/index.ts
 *
 * Scans the project for unused images & static assets (in `public/` and `src/assets/`).
 * Shows where each asset IS used, highlights the unused ones,
 * and optionally removes them interactively.
 *
 * Usage:
 *   bun scripts/unused-assets/index.ts            # Interactive mode
 *   bun scripts/unused-assets/index.ts --report    # Report only, no deletion prompts
 *   bun scripts/unused-assets/index.ts --auto      # Auto-remove all unused assets
 *   bun scripts/unused-assets/index.ts --json      # Output JSON report
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import chalk from 'chalk'
import fg from 'fast-glob'
import { renderAnimatedLogo } from '../neop-logo/index'

// ── Types ─────────────────────────────────────────────────────────

interface AssetInfo {
  /** Absolute path to the asset file */
  absolutePath: string
  /** Relative path from project root */
  relativePath: string
  /** Just the filename */
  filename: string
  /** File size in bytes */
  sizeBytes: number
  /** Human-readable size */
  sizeHuman: string
  /** Files that reference this asset */
  usedIn: UsageEntry[]
  /** Whether the asset has any usages */
  isUsed: boolean
  /** The lookup key used to search for usage (e.g., '/icons/arrow.svg') */
  lookupKeys: string[]
}

interface UsageEntry {
  /** File that references the asset */
  file: string
  /** Line number where the reference was found */
  line: number
  /** The content of the line (trimmed) */
  content: string
}

interface AnalysisReport {
  totalAssets: number
  usedAssets: number
  unusedAssets: number
  totalSizeBytes: number
  unusedSizeBytes: number
  assets: AssetInfo[]
}

// ── Config ────────────────────────────────────────────────────────

const ROOT = process.cwd()

/** Directories to scan for assets */
const ASSET_DIRS = ['public', 'src/assets']

/** File extensions to consider as assets */
const ASSET_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.svg', '.gif',
  '.webp', '.ico', '.avif', '.bmp', '.tiff',
]

/** Source file patterns to search for usages */
const SOURCE_PATTERNS = [
  'src/**/*.{vue,ts,tsx,js,jsx,css,scss}',
  'index.html',
  '*.config.{ts,js,mjs}',
]

/** Directories/files to exclude from usage search */
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.git/**',
  '**/scripts/unused-assets/**',
]

/** Assets that should NEVER be flagged as unused (essential files) */
const PROTECTED_ASSETS = [
  'public/vite.svg',        // Vite default
  'public/simple-logo.png', // App logo
  'public/full-logo.png',   // App logo
  'public/404.png',         // 404 page
]

// ── Helpers ───────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)
  return `${size} ${units[i]}`
}

function getBarChart(value: number, max: number, width = 20): string {
  const filled = Math.round((value / Math.max(max, 1)) * width)
  const empty = width - filled
  return chalk.red('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))
}

// ── Core: Discover Assets ─────────────────────────────────────────

async function discoverAssets(): Promise<AssetInfo[]> {
  const assets: AssetInfo[] = []

  for (const dir of ASSET_DIRS) {
    const absDir = path.join(ROOT, dir)
    if (!fs.existsSync(absDir)) continue

    const files = await fg(
      ASSET_EXTENSIONS.map(ext => `**/*${ext}`),
      {
        cwd: absDir,
        absolute: false,
        dot: false,
        onlyFiles: true,
      },
    )

    for (const file of files) {
      const relativePath = path.join(dir, file)
      const absolutePath = path.join(ROOT, relativePath)
      const stat = fs.statSync(absolutePath)

      // Build lookup keys — different ways this asset might be referenced
      const lookupKeys: string[] = []
      const filename = path.basename(file)

      if (dir === 'public') {
        // public/ files are served from root: /icons/arrow.svg, icons/arrow.svg
        const publicPath = file // e.g., 'icons/arrow.svg'
        lookupKeys.push(`/${publicPath}`)          // /icons/arrow.svg
        lookupKeys.push(publicPath)                 // icons/arrow.svg
        lookupKeys.push(filename)                   // arrow.svg
      } else {
        // src/assets/ files are imported: @/assets/vue.svg, ../assets/vue.svg
        lookupKeys.push(file)                       // vue.svg
        lookupKeys.push(`assets/${file}`)           // assets/vue.svg
        lookupKeys.push(`@/assets/${file}`)         // @/assets/vue.svg
        lookupKeys.push(filename)                   // vue.svg
      }

      assets.push({
        absolutePath,
        relativePath,
        filename,
        sizeBytes: stat.size,
        sizeHuman: formatSize(stat.size),
        usedIn: [],
        isUsed: false,
        lookupKeys: [...new Set(lookupKeys)],
      })
    }
  }

  return assets
}

// ── Core: Find Usages ─────────────────────────────────────────────

async function findUsages(assets: AssetInfo[]): Promise<void> {
  // Collect all source files
  const sourceFiles = await fg(SOURCE_PATTERNS, {
    cwd: ROOT,
    absolute: false,
    dot: false,
    ignore: EXCLUDE_PATTERNS,
  })

  // Read all files and cache contents
  const fileContents = new Map<string, string[]>()
  for (const file of sourceFiles) {
    try {
      const content = fs.readFileSync(path.join(ROOT, file), 'utf-8')
      fileContents.set(file, content.split('\n'))
    } catch {
      // skip files that can't be read
    }
  }

  // Also check index.html at root
  const indexHtmlPath = path.join(ROOT, 'index.html')
  if (fs.existsSync(indexHtmlPath)) {
    const content = fs.readFileSync(indexHtmlPath, 'utf-8')
    fileContents.set('index.html', content.split('\n'))
  }

  // Find usages for each asset
  for (const asset of assets) {
    // Check if it's a protected asset
    if (PROTECTED_ASSETS.includes(asset.relativePath)) {
      asset.isUsed = true
      asset.usedIn.push({
        file: '(protected — essential asset)',
        line: 0,
        content: 'Auto-protected from removal',
      })
      continue
    }

    for (const [file, lines] of fileContents) {
      // Don't search the asset file itself
      if (file === asset.relativePath) continue

      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx]

        for (const key of asset.lookupKeys) {
          // We need to be smart about matching — avoid false positives from partial filename matches
          // Only match the filename alone if it's unique enough (has > 6 chars or has path separators in key)
          if (key === asset.filename && key.length <= 6 && !key.includes('/')) {
            // Skip short filenames for bare-name matching to avoid false positives
            continue
          }

          if (line.includes(key)) {
            asset.usedIn.push({
              file,
              line: lineIdx + 1,
              content: line.trim().substring(0, 120),
            })
            break // Only count one match per line
          }
        }
      }
    }

    // Deduplicate usages by file+line
    const seen = new Set<string>()
    asset.usedIn = asset.usedIn.filter((u) => {
      const key = `${u.file}:${u.line}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    asset.isUsed = asset.usedIn.length > 0
  }
}

// ── Core: Build Report ────────────────────────────────────────────

function buildReport(assets: AssetInfo[]): AnalysisReport {
  const usedAssets = assets.filter(a => a.isUsed)
  const unusedAssets = assets.filter(a => !a.isUsed)

  return {
    totalAssets: assets.length,
    usedAssets: usedAssets.length,
    unusedAssets: unusedAssets.length,
    totalSizeBytes: assets.reduce((sum, a) => sum + a.sizeBytes, 0),
    unusedSizeBytes: unusedAssets.reduce((sum, a) => sum + a.sizeBytes, 0),
    assets,
  }
}

// ── Display: Pretty Report ────────────────────────────────────────

function printReport(report: AnalysisReport): void {
  const { totalAssets, usedAssets, unusedAssets, totalSizeBytes, unusedSizeBytes } = report
  const unusedList = report.assets.filter(a => !a.isUsed)
  const usedList = report.assets.filter(a => a.isUsed)

  // ── Summary Header ─────────────────────────────────────────
  console.log()
  console.log(chalk.bold.cyan('  ┌─────────────────────────────────────────────────────────┐'))
  console.log(chalk.bold.cyan('  │') + chalk.bold('   📊  Asset Analysis Report                              ') + chalk.bold.cyan('│'))
  console.log(chalk.bold.cyan('  └─────────────────────────────────────────────────────────┘'))
  console.log()

  // ── Stats Grid ─────────────────────────────────────────────
  const usedPct = totalAssets > 0 ? Math.round((usedAssets / totalAssets) * 100) : 0
  const unusedPct = totalAssets > 0 ? Math.round((unusedAssets / totalAssets) * 100) : 0

  console.log(chalk.dim('  ─────────────────────────────────────────────────────────'))
  console.log(`  ${chalk.bold('Total assets')}         ${chalk.white.bold(totalAssets)}  ${chalk.dim('files')}  ${chalk.dim('(')}${formatSize(totalSizeBytes)}${chalk.dim(')')}`)
  console.log(`  ${chalk.bold.green('✓ Used')}               ${chalk.green.bold(usedAssets)}  ${chalk.dim('files')}  ${chalk.dim('(')}${usedPct}%${chalk.dim(')')}`)
  console.log(`  ${chalk.bold.red('✗ Unused')}             ${chalk.red.bold(unusedAssets)}  ${chalk.dim('files')}  ${chalk.dim('(')}${unusedPct}%${chalk.dim(')')} ${chalk.dim('—')} ${chalk.red.bold(formatSize(unusedSizeBytes))} ${chalk.red('reclaimable')}`)
  console.log(chalk.dim('  ─────────────────────────────────────────────────────────'))
  console.log()

  // ── Usage Bar ──────────────────────────────────────────────
  const barWidth = 40
  const usedWidth = Math.round((usedAssets / Math.max(totalAssets, 1)) * barWidth)
  const unusedWidth = barWidth - usedWidth
  console.log(`  ${chalk.dim('Usage:')}  ${chalk.green('█'.repeat(usedWidth))}${chalk.red('█'.repeat(unusedWidth))}  ${chalk.green(`${usedPct}% used`)} ${chalk.dim('/')} ${chalk.red(`${unusedPct}% unused`)}`)
  console.log()

  // ── Unused Assets Detail ───────────────────────────────────
  if (unusedList.length > 0) {
    console.log(chalk.bold.red(`  ╔══════════════════════════════════════════════════════════╗`))
    console.log(chalk.bold.red(`  ║`) + chalk.bold.red(`   🗑️  Unused Assets (${unusedList.length} files — ${formatSize(unusedSizeBytes)})`) + ' '.repeat(Math.max(0, 37 - formatSize(unusedSizeBytes).length - String(unusedList.length).length)) + chalk.bold.red('║'))
    console.log(chalk.bold.red(`  ╚══════════════════════════════════════════════════════════╝`))
    console.log()

    // Sort by size descending
    const sorted = [...unusedList].sort((a, b) => b.sizeBytes - a.sizeBytes)
    const maxSize = sorted[0]?.sizeBytes ?? 0

    for (let i = 0; i < sorted.length; i++) {
      const asset = sorted[i]
      const num = chalk.dim(`${String(i + 1).padStart(3)}.`)
      const sizeBar = getBarChart(asset.sizeBytes, maxSize, 12)
      const size = chalk.yellow(asset.sizeHuman.padStart(8))
      const filePath = chalk.white(asset.relativePath)

      console.log(`  ${num} ${sizeBar} ${size}  ${filePath}`)
    }
    console.log()
  } else {
    console.log(chalk.bold.green('  ✨ All assets are in use! Nothing to clean up.'))
    console.log()
  }

  // ── Used Assets Detail ─────────────────────────────────────
  if (usedList.length > 0) {
    console.log(chalk.bold.green(`  ╔══════════════════════════════════════════════════════════╗`))
    console.log(chalk.bold.green(`  ║`) + chalk.bold.green(`   ✓  Used Assets (${usedList.length} files)`) + ' '.repeat(Math.max(0, 40 - String(usedList.length).length)) + chalk.bold.green('║'))
    console.log(chalk.bold.green(`  ╚══════════════════════════════════════════════════════════╝`))
    console.log()

    for (const asset of usedList) {
      console.log(`  ${chalk.green('●')} ${chalk.white.bold(asset.relativePath)}  ${chalk.dim(`(${asset.sizeHuman})`)}`)

      // Show up to 3 usage locations
      const displayUsages = asset.usedIn.slice(0, 3)
      for (const usage of displayUsages) {
        if (usage.line === 0) {
          console.log(`    ${chalk.dim('└─')} ${chalk.cyan(usage.file)}`)
        } else {
          console.log(`    ${chalk.dim('└─')} ${chalk.cyan(`${usage.file}:${usage.line}`)} ${chalk.dim('—')} ${chalk.dim(usage.content.substring(0, 80))}`)
        }
      }
      if (asset.usedIn.length > 3) {
        console.log(`    ${chalk.dim(`   ... and ${asset.usedIn.length - 3} more`)}`)
      }
    }
    console.log()
  }

  // ── Size Breakdown by Directory ────────────────────────────
  console.log(chalk.bold.cyan('  ┌─────────────────────────────────────────────────────────┐'))
  console.log(chalk.bold.cyan('  │') + chalk.bold('   📁  Size by Directory                                  ') + chalk.bold.cyan('│'))
  console.log(chalk.bold.cyan('  └─────────────────────────────────────────────────────────┘'))
  console.log()

  const dirMap = new Map<string, { total: number; unused: number; count: number; unusedCount: number }>()

  for (const asset of report.assets) {
    const dir = path.dirname(asset.relativePath)
    const entry = dirMap.get(dir) ?? { total: 0, unused: 0, count: 0, unusedCount: 0 }
    entry.total += asset.sizeBytes
    entry.count++
    if (!asset.isUsed) {
      entry.unused += asset.sizeBytes
      entry.unusedCount++
    }
    dirMap.set(dir, entry)
  }

  const maxDirSize = Math.max(...[...dirMap.values()].map(v => v.total))

  for (const [dir, info] of [...dirMap.entries()].sort((a, b) => b[1].total - a[1].total)) {
    const bar = getBarChart(info.unused, maxDirSize, 15)
    const pct = info.count > 0 ? Math.round((info.unusedCount / info.count) * 100) : 0
    console.log(`  ${chalk.white.bold(dir.padEnd(25))} ${bar} ${chalk.yellow(formatSize(info.total).padStart(8))} ${chalk.dim('total')} / ${chalk.red(formatSize(info.unused).padStart(8))} ${chalk.red('unused')} ${chalk.dim(`(${pct}%)`)}`)
  }
  console.log()
}

// ── Shared: Clean Empty Directories ───────────────────────────────

function cleanEmptyDirs(assets: AssetInfo[]): void {
  const affectedDirs = new Set(assets.map(a => path.dirname(a.absolutePath)))
  // Sort deepest first so nested dirs get cleaned before parents
  for (const dir of [...affectedDirs].sort((a, b) => b.length - a.length)) {
    try {
      const entries = fs.readdirSync(dir)
      if (entries.length === 0) {
        fs.rmdirSync(dir)
        console.log(`  ${chalk.dim('🗂️  Removed empty directory:')} ${chalk.dim(path.relative(ROOT, dir))}`)
      }
    } catch {
      // ignore
    }
  }
}

// ── Action: Move Assets to Folder ─────────────────────────────────

const UNUSED_FOLDER = '.unused-assets'

function moveAssetsToFolder(assets: AssetInfo[]): { movedCount: number; movedBytes: number } {
  let movedCount = 0
  let movedBytes = 0
  const destBase = path.join(ROOT, UNUSED_FOLDER)

  for (const asset of assets) {
    try {
      // Preserve directory structure inside .unused-assets/
      const destPath = path.join(destBase, asset.relativePath)
      const destDir = path.dirname(destPath)

      fs.mkdirSync(destDir, { recursive: true })
      fs.renameSync(asset.absolutePath, destPath)
      movedCount++
      movedBytes += asset.sizeBytes
      console.log(`  ${chalk.yellow('→')} Moved: ${chalk.dim(asset.relativePath)} ${chalk.dim('→')} ${chalk.dim(path.join(UNUSED_FOLDER, asset.relativePath))}`)
    } catch (err: any) {
      console.log(`  ${chalk.yellow('⚠')} Failed to move ${asset.relativePath}: ${err.message}`)
    }
  }

  return { movedCount, movedBytes }
}

// ── Action: Delete Assets ─────────────────────────────────────────

function deleteAssets(assets: AssetInfo[]): { deletedCount: number; freedBytes: number } {
  let deletedCount = 0
  let freedBytes = 0

  for (const asset of assets) {
    try {
      fs.unlinkSync(asset.absolutePath)
      deletedCount++
      freedBytes += asset.sizeBytes
      console.log(`  ${chalk.red('✗')} Deleted: ${chalk.dim(asset.relativePath)}`)
    } catch (err: any) {
      console.log(`  ${chalk.yellow('⚠')} Failed to delete ${asset.relativePath}: ${err.message}`)
    }
  }

  return { deletedCount, freedBytes }
}

// ── Interactive Removal ───────────────────────────────────────────

async function interactiveRemoval(report: AnalysisReport): Promise<void> {
  const unusedList = report.assets.filter(a => !a.isUsed)

  if (unusedList.length === 0) {
    return
  }

  const { checkbox, select, confirm } = await import('@inquirer/prompts')

  // Step 1: Ask what to do
  console.log()
  const action = await select({
    message: 'What would you like to do with unused assets?',
    choices: [
      {
        name: `📂  Move to ${chalk.cyan(UNUSED_FOLDER + '/')} folder ${chalk.dim('(safe — can restore later)')}`,
        value: 'move' as const,
      },
      {
        name: `🗑️   Delete immediately ${chalk.dim('(permanent)')}`,
        value: 'delete' as const,
      },
      {
        name: `❌  Cancel — do nothing`,
        value: 'cancel' as const,
      },
    ],
  })

  if (action === 'cancel') {
    console.log(chalk.dim('  Cancelled. No files were modified.'))
    return
  }

  // Step 2: Select which assets
  console.log()
  console.log(chalk.bold.yellow('  ⚡ Select assets:'))
  console.log()

  const choices = unusedList
    .sort((a, b) => b.sizeBytes - a.sizeBytes)
    .map(a => ({
      name: `${a.relativePath}  ${chalk.dim(`(${a.sizeHuman})`)}`,
      value: a.relativePath,
      checked: true, // Pre-select all unused
    }))

  const selected = await checkbox({
    message: action === 'move' ? 'Assets to move' : 'Assets to delete',
    choices,
    pageSize: 20,
  })

  if (selected.length === 0) {
    console.log(chalk.dim('  No assets selected. Exiting.'))
    return
  }

  // Calculate totals
  const selectedAssets = unusedList.filter(a => selected.includes(a.relativePath))
  const totalSize = selectedAssets.reduce((sum, a) => sum + a.sizeBytes, 0)

  // Step 3: Confirm
  console.log()
  if (action === 'move') {
    console.log(chalk.bold(`  About to move ${chalk.yellow(String(selected.length))} files (${chalk.yellow(formatSize(totalSize))}) to ${chalk.cyan(UNUSED_FOLDER + '/')}`))
  } else {
    console.log(chalk.bold(`  About to ${chalk.red('permanently delete')} ${chalk.red(String(selected.length))} files (${chalk.red(formatSize(totalSize))})`))
  }
  console.log()

  const proceed = await confirm({
    message: action === 'move'
      ? 'Move these files to the unused folder?'
      : 'Are you sure you want to permanently delete these files?',
    default: action === 'move', // Default yes for move (safe), no for delete (destructive)
  })

  if (!proceed) {
    console.log(chalk.dim('  Cancelled. No files were modified.'))
    return
  }

  // Step 4: Execute
  console.log()
  if (action === 'move') {
    const { movedCount, movedBytes } = moveAssetsToFolder(selectedAssets)
    cleanEmptyDirs(selectedAssets)

    console.log()
    console.log(chalk.bold.green(`  ✨ Moved ${movedCount} files (${formatSize(movedBytes)}) to ${chalk.cyan(UNUSED_FOLDER + '/')}`))
    console.log(chalk.dim(`  You can restore them by moving files back from ${UNUSED_FOLDER}/`))
    console.log(chalk.dim(`  Or delete the folder entirely: ${chalk.white(`rm -rf ${UNUSED_FOLDER}`)}`))
  } else {
    const { deletedCount, freedBytes } = deleteAssets(selectedAssets)
    cleanEmptyDirs(selectedAssets)

    console.log()
    console.log(chalk.bold.green(`  ✨ Deleted ${deletedCount} files — freed ${formatSize(freedBytes)}`))
  }
  console.log()
}

// ── Auto Removal ──────────────────────────────────────────────────

function autoRemoval(report: AnalysisReport): void {
  const unusedList = report.assets.filter(a => !a.isUsed)

  if (unusedList.length === 0) {
    return
  }

  console.log(chalk.bold.yellow(`  🗑️  Auto-removing ${unusedList.length} unused assets...`))
  console.log()

  const { deletedCount, freedBytes } = deleteAssets(unusedList)
  cleanEmptyDirs(unusedList)

  console.log()
  console.log(chalk.bold.green(`  ✨ Cleaned up ${deletedCount} files — freed ${formatSize(freedBytes)}`))
  console.log()
}

// ── JSON Output ───────────────────────────────────────────────────

function outputJson(report: AnalysisReport): void {
  const output = {
    summary: {
      totalAssets: report.totalAssets,
      usedAssets: report.usedAssets,
      unusedAssets: report.unusedAssets,
      totalSize: formatSize(report.totalSizeBytes),
      unusedSize: formatSize(report.unusedSizeBytes),
    },
    unused: report.assets
      .filter(a => !a.isUsed)
      .map(a => ({
        path: a.relativePath,
        size: a.sizeHuman,
        sizeBytes: a.sizeBytes,
      })),
    used: report.assets
      .filter(a => a.isUsed)
      .map(a => ({
        path: a.relativePath,
        size: a.sizeHuman,
        sizeBytes: a.sizeBytes,
        usedIn: a.usedIn.map(u => ({ file: u.file, line: u.line })),
      })),
  }

  console.log(JSON.stringify(output, null, 2))
}

// ── Main ──────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const isReportOnly = args.includes('--report')
  const isAutoRemove = args.includes('--auto')
  const isJson = args.includes('--json')

  if (!isJson) {
    // Show the NEOP logo animation
    await renderAnimatedLogo()

    console.log(chalk.bold.cyan('  ┌─────────────────────────────────────────────────────────┐'))
    console.log(chalk.bold.cyan('  │') + chalk.bold('   🔍  Unused Assets Analyzer                             ') + chalk.bold.cyan('│'))
    console.log(chalk.bold.cyan('  │') + chalk.dim('   Find and clean up unused images & static assets        ') + chalk.bold.cyan('│'))
    console.log(chalk.bold.cyan('  └─────────────────────────────────────────────────────────┘'))
    console.log()

    console.log(chalk.dim('  Scanning directories:'))
    for (const dir of ASSET_DIRS) {
      console.log(chalk.dim(`    → ${dir}/`))
    }
    console.log()
  }

  // Step 1: Discover all assets
  if (!isJson) console.log(`  ${chalk.cyan('›')} ${chalk.bold('Discovering assets...')}`)
  const assets = await discoverAssets()
  if (!isJson) console.log(`  ${chalk.green('✓')} Found ${chalk.bold(String(assets.length))} asset files`)
  if (!isJson) console.log()

  // Step 2: Find usages across the codebase
  if (!isJson) console.log(`  ${chalk.cyan('›')} ${chalk.bold('Scanning codebase for references...')}`)
  await findUsages(assets)
  const usedCount = assets.filter(a => a.isUsed).length
  if (!isJson) console.log(`  ${chalk.green('✓')} Found references in ${chalk.bold(String(usedCount))} assets`)
  if (!isJson) console.log()

  // Step 3: Build report
  const report = buildReport(assets)

  // Step 4: Output
  if (isJson) {
    outputJson(report)
    return
  }

  printReport(report)

  // Step 5: Interactive removal (if not report-only mode)
  if (isAutoRemove) {
    autoRemoval(report)
  } else if (!isReportOnly) {
    await interactiveRemoval(report)
  }

  if (isReportOnly) {
    console.log(chalk.dim('  ℹ️  Report mode — no files were modified.'))
    console.log(chalk.dim('  Run without --report to interactively remove unused assets.'))
    console.log()
  }
}

main().catch((err) => {
  console.error(chalk.red(`  ✗ Error: ${err.message}`))
  process.exit(1)
})

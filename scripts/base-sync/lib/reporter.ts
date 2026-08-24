/* eslint-disable no-control-regex, no-misleading-character-class */
import type { DiffResult, FileChange } from '../types'
import type { CategorizedChanges, RiskLevel } from './categorizer'
import consola from 'consola'
import { categorizeChanges, getRiskBadge } from './categorizer'

// ─── Reporter — Professional Terminal Output ─────────────────────

const COLORS = {
  green: '\x1B[32m',
  red: '\x1B[31m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  cyan: '\x1B[36m',
  magenta: '\x1B[35m',
  dim: '\x1B[2m',
  bold: '\x1B[1m',
  reset: '\x1B[0m',
  white: '\x1B[37m',
  bgCyan: '\x1B[46m\x1B[30m',
  bgGreen: '\x1B[42m\x1B[30m',
  bgYellow: '\x1B[43m\x1B[30m',
  bgRed: '\x1B[41m\x1B[37m',
}

function c(color: keyof typeof COLORS, text: string): string {
  return `${COLORS[color]}${text}${COLORS.reset}`
}

/** Get responsive terminal width */
function getTermWidth(): number {
  return process.stdout.columns || 80
}

/** Create a horizontal line that fits the terminal */
function line(char = '─', padding = 2): string {
  return char.repeat(Math.max(20, getTermWidth() - padding * 2))
}

/** Truncate a string to fit within maxLen, adding ellipsis */
function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen)
    return str
  return `${str.slice(0, maxLen - 1)}…`
}

// ─── Banner ──────────────────────────────────────────────────────

export function printBanner(): void {
  const w = getTermWidth()
  const innerW = Math.max(30, Math.min(w - 4, 48))
  const border = '═'.repeat(innerW)
  const title = ' Base-Sync — Project Manager'
  const padLen = Math.max(0, innerW - title.length - 1)

  console.log('')
  console.log(`  ${c('cyan', `╔${border}╗`)}`)
  console.log(`  ${c('cyan', '║')}  ${c('bold', title)}${' '.repeat(padLen)}${c('cyan', '║')}`)
  console.log(`  ${c('cyan', `╚${border}╝`)}`)
  console.log('')
}

export function printSection(title: string): void {
  console.log('')
  console.log(`  ${c('bold', c('cyan', `── ${title} ${'─'.repeat(Math.max(4, getTermWidth() - title.length - 8))}`))}`)
  console.log('')
}

// ─── Diff Summary Box (Terminal-Aware) ───────────────────────────

export function printDiffSummary(diff: DiffResult): void {
  const { summary } = diff
  const w = Math.max(32, Math.min(getTermWidth() - 4, 50))
  const border = '─'.repeat(w)
  const innerW = w - 4

  console.log('')
  console.log(`  ${c('bold', `┌${border}┐`)}`)
  console.log(`  ${c('bold', '│')}  ${c('bold', ' Diff Summary')}${' '.repeat(Math.max(0, innerW - 15))}  ${c('bold', '│')}`)
  console.log(`  ${c('bold', `├${border}┤`)}`)

  const rows = [
    [c('green', `+ Added:`), `${summary.addedCount} files`],
    [c('yellow', `~ Modified:`), `${summary.modifiedCount} files`],
    [c('red', `- Deleted:`), `${summary.deletedCount} files`],
    [c('dim', `  Unchanged:`), `${summary.unchangedCount} files`],
  ]

  for (const [label, value] of rows) {
    // Calculate visible length (without ANSI codes)
    const visibleLabel = label.replace(/\x1B\[[0-9;]*m/g, '')
    const visibleValue = value.replace(/\x1B\[[0-9;]*m/g, '')
    const pad = Math.max(1, innerW - visibleLabel.length - visibleValue.length)
    console.log(`  ${c('bold', '│')}  ${label}${' '.repeat(pad)}${value}  ${c('bold', '│')}`)
  }

  console.log(`  ${c('bold', `├${border}┤`)}`)

  const linesChanged = `${c('green', `+${summary.totalLinesAdded}`)} / ${c('red', `-${summary.totalLinesRemoved}`)} lines changed`
  const visibleLines = linesChanged.replace(/\x1B\[[0-9;]*m/g, '')
  const linesPad = Math.max(1, innerW - visibleLines.length)
  console.log(`  ${c('bold', '│')}  ${linesChanged}${' '.repeat(linesPad)}  ${c('bold', '│')}`)
  console.log(`  ${c('bold', `└${border}┘`)}`)
  console.log('')
}

// ─── Tree-View File Output ───────────────────────────────────────

interface TreeNode {
  name: string
  children: Map<string, TreeNode>
  files: { name: string, file: FileChange }[]
}

function buildFileTree(files: FileChange[]): TreeNode {
  const root: TreeNode = { name: '', children: new Map(), files: [] }

  for (const file of files) {
    const parts = file.relativePath.split('/')
    const fileName = parts.pop()!
    let current = root

    for (const part of parts) {
      if (!current.children.has(part)) {
        current.children.set(part, { name: part, children: new Map(), files: [] })
      }
      current = current.children.get(part)!
    }

    current.files.push({ name: fileName, file })
  }

  return root
}

function renderTreeChildren(node: TreeNode, prefix: string, statsWidth: number): string[] {
  const lines: string[] = []

  const entries: { type: 'dir' | 'file', name: string, node?: TreeNode, file?: FileChange }[] = []

  const sortedDirs = Array.from(node.children.entries()).sort(([a], [b]) => a.localeCompare(b))
  for (const [, childNode] of sortedDirs) {
    entries.push({ type: 'dir', name: childNode.name, node: childNode })
  }

  const sortedFiles = [...node.files].sort((a, b) => a.name.localeCompare(b.name))
  for (const fileEntry of sortedFiles) {
    entries.push({ type: 'file', name: fileEntry.name, file: fileEntry.file })
  }

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    const entryIsLast = i === entries.length - 1
    const entryConnector = entryIsLast ? '└── ' : '├── '
    const entryNextPrefix = prefix + (entryIsLast ? '    ' : '│   ')

    if (entry.type === 'dir') {
      const fileCount = countFilesInNode(entry.node!)
      lines.push(`${prefix}${entryConnector}${c('blue', `${entry.name}/`)}  ${c('dim', `(${fileCount} files)`)}`)
      const childLines = renderTreeChildren(entry.node!, entryNextPrefix, statsWidth)
      lines.push(...childLines)
    }
    else {
      const f = entry.file!
      const statusColor = f.status === 'added' ? 'green' : f.status === 'deleted' ? 'red' : 'yellow'
      const statusIcon = f.status === 'added' ? '+' : f.status === 'deleted' ? '-' : '~'

      let stats: string
      if (f.status === 'deleted') {
        stats = c('red', `-${f.linesRemoved}`)
      }
      else if (f.status === 'added') {
        stats = c('green', `+${f.linesAdded}`)
      }
      else {
        stats = `${c('green', `+${f.linesAdded}`)}/${c('red', `-${f.linesRemoved}`)}`
      }

      const size = formatBytes(f.status === 'deleted' ? f.sizeBase : f.sizeChild)
      const nameStr = c(statusColor, `${statusIcon} ${entry.name}`)
      const visibleName = `${statusIcon} ${entry.name}`
      const pathLen = prefix.length + entryConnector.length + visibleName.length
      const termW = getTermWidth()
      const gap = Math.max(2, termW - pathLen - 30)

      lines.push(`${prefix}${entryConnector}${nameStr}${' '.repeat(gap)}${stats}  ${c('dim', size)}`)
    }
  }

  return lines
}

function countFilesInNode(node: TreeNode): number {
  let count = node.files.length
  for (const [, child] of node.children) {
    count += countFilesInNode(child)
  }
  return count
}

/**
 * Print files in a tree-view grouped by directory
 */
export function printFileTree(files: FileChange[], title: string): void {
  if (files.length === 0)
    return

  const tree = buildFileTree(files)

  console.log(`  ${c('bold', title)} (${files.length})`)
  console.log(`  ${line('─')}`)

  // Render root level (files and dirs at root)
  const treeLines = renderTreeChildren(tree, '  ', 20)
  for (const treeLine of treeLines) {
    console.log(treeLine)
  }

  console.log('')
}

// ─── Status Table — Tree View ────────────────────────────────────

export function printStatusTable(diff: DiffResult): void {
  const allChanges = [...diff.added, ...diff.modified, ...diff.deleted]
  if (allChanges.length === 0)
    return

  // Print tree view of all changes
  printFileTree(diff.added, ' Added Files')
  printFileTree(diff.modified, ' Modified Files')
  printFileTree(diff.deleted, ' Deleted Files')
}

// ─── Change Analysis (Categorized View) ──────────────────────────

export function printChangeAnalysis(diff: DiffResult): void {
  const allChanges = [...diff.added, ...diff.modified, ...diff.deleted]
  if (allChanges.length === 0)
    return

  const categorized = categorizeChanges(allChanges)
  const w = Math.max(40, Math.min(getTermWidth() - 4, 56))
  const border = '─'.repeat(w)

  console.log(`  ${c('bold', `┌${border}┐`)}`)
  console.log(`  ${c('bold', '│')}  ${c('bold', ' Change Analysis')}${' '.repeat(Math.max(0, w - 22))}  ${c('bold', '│')}`)
  console.log(`  ${c('bold', `├${border}┤`)}`)

  // Group by risk level
  const riskGroups: Record<RiskLevel, CategorizedChanges[]> = {
    high: [],
    medium: [],
    low: [],
  }

  for (const cat of categorized) {
    riskGroups[cat.category.risk].push(cat)
  }

  const riskLabels: Record<RiskLevel, string> = {
    high: c('red', c('bold', ' High Risk')),
    medium: c('yellow', c('bold', ' Medium Risk')),
    low: c('green', c('bold', ' Low Risk')),
  }

  for (const risk of ['high', 'medium', 'low'] as RiskLevel[]) {
    const groups = riskGroups[risk]
    if (groups.length === 0)
      continue

    // Risk level header
    const riskLabel = riskLabels[risk]
    console.log(`  ${c('bold', '│')}  ${riskLabel}${' '.repeat(Math.max(0, w - 16))}  ${c('bold', '│')}`)

    for (const group of groups) {
      const { category, files } = group
      const fileCount = `${files.length} file${files.length !== 1 ? 's' : ''}`
      const lineStats = `${c('green', `+${group.totalLinesAdded}`)}/${c('red', `-${group.totalLinesRemoved}`)}`

      const label = `    ${category.icon} ${category.label}`
      const visibleLabel = label.replace(/\x1B\[[0-9;]*m/g, '')
      // Account for emoji widths (most emojis take 2 character widths)
      const emojiCount = (label.match(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu) || []).length
      const statsStr = `${fileCount}  ${lineStats}`
      const visibleStats = statsStr.replace(/\x1B\[[0-9;]*m/g, '')
      const gap = Math.max(1, w - visibleLabel.length - visibleStats.length + emojiCount)

      console.log(`  ${c('bold', '│')}${label}${' '.repeat(gap)}${statsStr}  ${c('bold', '│')}`)
    }
  }

  console.log(`  ${c('bold', `└${border}┘`)}`)
  console.log('')
}

// ─── Change Bar Graph ────────────────────────────────────────────

export function printChangeBar(diff: DiffResult): void {
  const { summary } = diff
  const total = summary.addedCount + summary.modifiedCount + summary.deletedCount
  if (total === 0)
    return

  const barWidth = Math.max(20, Math.min(getTermWidth() - 20, 50))

  const addedWidth = Math.round((summary.addedCount / total) * barWidth)
  const modifiedWidth = Math.round((summary.modifiedCount / total) * barWidth)
  const deletedWidth = barWidth - addedWidth - modifiedWidth

  const bar
    = c('green', '█'.repeat(Math.max(0, addedWidth)))
      + c('yellow', '█'.repeat(Math.max(0, modifiedWidth)))
      + c('red', '█'.repeat(Math.max(0, deletedWidth)))

  console.log(`  ${bar}`)
  console.log(`  ${c('green', `■ Added ${summary.addedCount}`)}  ${c('yellow', `■ Modified ${summary.modifiedCount}`)}  ${c('red', `■ Deleted ${summary.deletedCount}`)}`)
  console.log('')
}

// ─── Scaffold Summary ────────────────────────────────────────────

export function printScaffoldSummary(name: string, output: string, options: Record<string, any>): void {
  const w = Math.max(32, Math.min(getTermWidth() - 4, 50))
  const border = '─'.repeat(w)
  const innerW = w - 4

  console.log('')
  console.log(`  ${c('bold', `┌${border}┐`)}`)
  console.log(`  ${c('bold', '│')}  ${c('bold', ' Scaffold Summary')}${' '.repeat(Math.max(0, innerW - 18))}  ${c('bold', '│')}`)
  console.log(`  ${c('bold', `├${border}┤`)}`)

  const rows: [string, string][] = [
    ['Name:', name],
    ['Output:', truncate(output, innerW - 10)],
    ['Git:', options.gitInit ? c('green', 'Yes') : c('dim', 'No')],
    ['Push:', options.push ? c('green', 'Yes') : c('dim', 'No')],
  ]

  for (const [label, value] of rows) {
    const visibleLabel = label.replace(/\x1B\[[0-9;]*m/g, '')
    const visibleValue = value.replace(/\x1B\[[0-9;]*m/g, '')
    const pad = Math.max(1, innerW - visibleLabel.length - visibleValue.length - 1)
    console.log(`  ${c('bold', '│')}  ${label}${' '.repeat(pad)}${value}  ${c('bold', '│')}`)
  }

  console.log(`  ${c('bold', `└${border}┘`)}`)
  console.log('')
}

// ─── Simple Print Helpers ────────────────────────────────────────

export function printSuccess(message: string): void {
  consola.success(message)
}

export function printError(message: string): void {
  consola.error(message)
}

export function printInfo(message: string): void {
  consola.info(message)
}

export function printWarn(message: string): void {
  consola.warn(message)
}

// ─── Legacy Table (kept for backward compat) ─────────────────────

export function printFileTable(files: FileChange[], title: string): void {
  // Redirect to tree view
  printFileTree(files, title)
}

// ─── Markdown Report ─────────────────────────────────────────────

export function generateMarkdownReport(diff: DiffResult, childName: string, baseName: string): string {
  const now = new Date().toISOString()
  const allChanges = [...diff.added, ...diff.modified, ...diff.deleted]
  const categorized = categorizeChanges(allChanges)

  let md = `# Diff Report: ${childName} vs ${baseName}\n\n`
  md += `> Generated: ${now}\n\n`

  // Summary table
  md += `## Summary\n\n`
  md += `| Metric | Count |\n|---|---|\n`
  md += `| [+] Added | ${diff.summary.addedCount} |\n`
  md += `| [~] Modified | ${diff.summary.modifiedCount} |\n`
  md += `| [-] Deleted | ${diff.summary.deletedCount} |\n`
  md += `| [ ] Unchanged | ${diff.summary.unchangedCount} |\n`
  md += `| Lines Added | +${diff.summary.totalLinesAdded} |\n`
  md += `| Lines Removed | -${diff.summary.totalLinesRemoved} |\n\n`

  // Change analysis by category
  if (categorized.length > 0) {
    md += `## Change Analysis\n\n`
    md += `| Risk | Category | Files | +Lines | -Lines |\n|---|---|---|---|---|\n`
    for (const cat of categorized) {
      const riskEmoji = getRiskBadge(cat.category.risk)
      md += `| ${riskEmoji} | ${cat.category.icon} ${cat.category.label} | ${cat.files.length} | +${cat.totalLinesAdded} | -${cat.totalLinesRemoved} |\n`
    }
    md += '\n'
  }

  // File lists
  if (diff.added.length > 0) {
    md += `## Added Files\n\n`
    for (const f of diff.added) {
      md += `- \`${f.relativePath}\` (+${f.linesAdded} lines, ${formatBytes(f.sizeChild)})\n`
    }
    md += '\n'
  }

  if (diff.modified.length > 0) {
    md += `## Modified Files\n\n`
    for (const f of diff.modified) {
      md += `- \`${f.relativePath}\` (+${f.linesAdded}/-${f.linesRemoved} lines)\n`
    }
    md += '\n'
  }

  if (diff.deleted.length > 0) {
    md += `## Deleted Files\n\n`
    for (const f of diff.deleted) {
      md += `- \`${f.relativePath}\` (-${f.linesRemoved} lines)\n`
    }
    md += '\n'
  }

  return md
}

// ─── Helpers ─────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0)
    return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

/**
 * Calculate a drift score (0-100) based on diff — weighted by file importance
 */
export function calculateDriftScore(diff: DiffResult): number {
  const totalFiles = diff.summary.totalFiles
  if (totalFiles === 0)
    return 0

  const allChanges = [...diff.added, ...diff.modified, ...diff.deleted]
  const categorized = categorizeChanges(allChanges)

  // Weighted score: high-risk changes count more
  let weightedChanges = 0
  let totalWeight = 0

  for (const cat of categorized) {
    const riskWeight = cat.category.risk === 'high' ? 3 : cat.category.risk === 'medium' ? 1.5 : 0.5
    weightedChanges += cat.files.length * riskWeight
    totalWeight += cat.files.length
  }

  if (totalWeight === 0)
    return 0

  const avgWeight = weightedChanges / totalWeight
  const rawPercent = (totalWeight / totalFiles) * 100
  const weightedPercent = rawPercent * (avgWeight / 1.5) // Normalize around medium risk

  return Math.min(100, Math.round(weightedPercent))
}

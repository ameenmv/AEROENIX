import type { FileChange } from '../types'
import fs from 'node:fs'
import path from 'node:path'
import { select } from '@inquirer/prompts'
import { diffLines } from 'diff'
import { isBinaryFile, readFileSafe } from './files'

// ─── Diff Preview — Interactive File Diff Viewer ─────────────────

const COLORS = {
  green: '\x1B[32m',
  red: '\x1B[31m',
  cyan: '\x1B[36m',
  dim: '\x1B[2m',
  bold: '\x1B[1m',
  bgGreen: '\x1B[42m\x1B[30m',
  bgRed: '\x1B[41m\x1B[37m',
  reset: '\x1B[0m',
}

function c(color: keyof typeof COLORS, text: string): string {
  return `${COLORS[color]}${text}${COLORS.reset}`
}

interface DiffHunk {
  baseStart: number
  baseCount: number
  childStart: number
  childCount: number
  lines: { type: 'add' | 'remove' | 'context', content: string }[]
}

/**
 * Generate unified diff hunks between two files
 */
function generateHunks(basePath: string, childPath: string, contextLines = 3): DiffHunk[] {
  const baseContent = readFileSafe(basePath) || ''
  const childContent = readFileSafe(childPath) || ''

  const changes = diffLines(baseContent, childContent)

  // Build raw line list with types
  const allLines: { type: 'add' | 'remove' | 'context', content: string }[] = []
  for (const change of changes) {
    const lines = change.value.split('\n')
    // Remove trailing empty line from split
    if (lines[lines.length - 1] === '')
      lines.pop()

    for (const line of lines) {
      if (change.added) {
        allLines.push({ type: 'add', content: line })
      }
      else if (change.removed) {
        allLines.push({ type: 'remove', content: line })
      }
      else {
        allLines.push({ type: 'context', content: line })
      }
    }
  }

  // Group into hunks with context
  const hunks: DiffHunk[] = []
  let currentHunk: DiffHunk | null = null
  let baseLineNum = 0
  let childLineNum = 0
  let trailingContext = 0

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i]
    const isChange = line.type !== 'context'

    if (isChange) {
      if (!currentHunk) {
        // Start new hunk, include leading context
        const contextStart = Math.max(0, i - contextLines)
        currentHunk = {
          baseStart: baseLineNum - (i - contextStart),
          baseCount: 0,
          childStart: childLineNum - (i - contextStart),
          childCount: 0,
          lines: [],
        }

        // Add leading context lines
        for (let j = contextStart; j < i; j++) {
          currentHunk.lines.push(allLines[j])
          currentHunk.baseCount++
          currentHunk.childCount++
        }
      }

      currentHunk.lines.push(line)
      if (line.type === 'remove') {
        currentHunk.baseCount++
      }
      else {
        currentHunk.childCount++
      }
      trailingContext = 0
    }
    else {
      if (currentHunk) {
        trailingContext++
        if (trailingContext <= contextLines) {
          currentHunk.lines.push(line)
          currentHunk.baseCount++
          currentHunk.childCount++
        }

        if (trailingContext >= contextLines) {
          // Check if next change is close enough to merge hunks
          let nextChangeIdx = -1
          for (let j = i + 1; j < allLines.length; j++) {
            if (allLines[j].type !== 'context') {
              nextChangeIdx = j
              break
            }
          }

          if (nextChangeIdx === -1 || nextChangeIdx - i > contextLines * 2) {
            // End this hunk
            hunks.push(currentHunk)
            currentHunk = null
            trailingContext = 0
          }
        }
      }
    }

    // Track line numbers
    if (line.type !== 'add')
      baseLineNum++
    if (line.type !== 'remove')
      childLineNum++
  }

  // Push final hunk
  if (currentHunk) {
    hunks.push(currentHunk)
  }

  return hunks
}

/**
 * Render a single hunk as formatted terminal output
 */
function renderHunk(hunk: DiffHunk, maxWidth: number): string {
  const headerLine = c('cyan', `@@ -${hunk.baseStart + 1},${hunk.baseCount} +${hunk.childStart + 1},${hunk.childCount} @@`)
  const lines: string[] = [headerLine]

  const contentWidth = maxWidth - 6 // prefix + padding

  for (const line of hunk.lines) {
    const truncated = line.content.length > contentWidth
      ? `${line.content.slice(0, contentWidth - 1)}…`
      : line.content

    switch (line.type) {
      case 'add':
        lines.push(c('green', `  + ${truncated}`))
        break
      case 'remove':
        lines.push(c('red', `  - ${truncated}`))
        break
      case 'context':
        lines.push(c('dim', `    ${truncated}`))
        break
    }
  }

  return lines.join('\n')
}

/**
 * Render a complete file diff preview
 */
export function renderFileDiff(
  basePath: string,
  childPath: string,
  relativePath: string,
  maxHunks = 5,
): string {
  const termWidth = process.stdout.columns || 80

  // Header
  const separator = '─'.repeat(Math.min(termWidth - 4, 76))
  const lines: string[] = [
    '',
    `  ${c('bold', c('cyan', `── ${relativePath} ${separator.slice(relativePath.length + 4)}`))}`,
  ]

  // Binary file check
  if (fs.existsSync(basePath) && isBinaryFile(basePath)) {
    lines.push(`  ${c('dim', '(binary file — diff not available)')}`)
    return lines.join('\n')
  }

  // Generate and render hunks
  const hunks = generateHunks(basePath, childPath)

  if (hunks.length === 0) {
    lines.push(`  ${c('dim', '(no visible changes)')}`)
    return lines.join('\n')
  }

  const displayHunks = hunks.slice(0, maxHunks)
  for (const hunk of displayHunks) {
    lines.push(renderHunk(hunk, termWidth))
  }

  if (hunks.length > maxHunks) {
    lines.push(`  ${c('dim', `... and ${hunks.length - maxHunks} more change regions`)}`)
  }

  lines.push('')
  return lines.join('\n')
}

/**
 * Interactive diff preview — let user browse modified files
 */
export async function interactiveDiffPreview(
  modifiedFiles: FileChange[],
  baseDir: string,
  childDir: string,
): Promise<void> {
  if (modifiedFiles.length === 0)
    return

  let keepBrowsing = true

  while (keepBrowsing) {
    const choices = [
      ...modifiedFiles.map(f => ({
        name: `${f.relativePath}  ${c('green', `+${f.linesAdded}`)}/${c('red', `-${f.linesRemoved}`)}`,
        value: f.relativePath,
      })),
      { name: c('dim', '← Done previewing'), value: '__done__' },
    ]

    const selected = await select({
      message: ' Preview file diff (↑↓ navigate, Enter to view):',
      choices,
    })

    if (selected === '__done__') {
      keepBrowsing = false
      continue
    }

    const basePath = path.join(baseDir, selected)
    const childPath = path.join(childDir, selected)

    console.log(renderFileDiff(basePath, childPath, selected))

    // After showing diff, ask if they want to see more
    const another = await select({
      message: 'Continue previewing?',
      choices: [
        { name: '  View another file', value: 'continue' },
        { name: '  Done', value: 'done' },
      ],
    })

    if (another === 'done') {
      keepBrowsing = false
    }
  }
}

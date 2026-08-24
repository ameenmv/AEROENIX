import type { DiffResult, FileChange } from '../types'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { diffLines } from 'diff'
import fg from 'fast-glob'

// ─── File Operations ─────────────────────────────────────────────

/**
 * Convert exclude patterns to fast-glob negation patterns
 */
function buildGlobPatterns(exclude: string[]): string[] {
  return exclude.map((pattern) => {
    // Already a negation
    if (pattern.startsWith('!'))
      return pattern
    // Directory-like patterns
    if (!pattern.includes('*') && !pattern.includes('.')) {
      return `!**/${pattern}/**`
    }
    // File patterns with special glob chars
    return `!**/${pattern}`
  })
}

/**
 * Walk a directory recursively and return all file paths relative to root
 */
export async function walkDir(rootDir: string, exclude: string[]): Promise<string[]> {
  const negations = buildGlobPatterns(exclude)
  const patterns = ['**/*', ...negations]

  const files = await fg(patterns, {
    cwd: rootDir,
    dot: true,
    onlyFiles: true,
    followSymbolicLinks: false,
    ignore: ['node_modules/**', '.git/**', '.basesync-tmp/**', '.basesync-backups/**'],
  })

  return files.sort()
}

/**
 * Read file content safely
 */
export function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  }
  catch {
    return null
  }
}

/**
 * Check if a file is binary by reading the first chunk
 */
export function isBinaryFile(filePath: string): boolean {
  try {
    const buffer = Buffer.alloc(8192)
    const fd = fs.openSync(filePath, 'r')
    const bytesRead = fs.readSync(fd, buffer, 0, 8192, 0)
    fs.closeSync(fd)

    for (let i = 0; i < bytesRead; i++) {
      if (buffer[i] === 0)
        return true
    }
    return false
  }
  catch {
    return false
  }
}

// ─── Content Hashing (Fast Comparison) ───────────────────────────

/**
 * Quick SHA-256 hash of file contents (first 16 hex chars)
 * Used for fast identical-file detection without full diff
 */
export function quickHash(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath)
    return createHash('sha256').update(content).digest('hex').slice(0, 16)
  }
  catch {
    return ''
  }
}

/**
 * Fast check if two files are identical using size + hash
 * Returns true if identical, false if different or uncertain
 */
export function areFilesIdentical(pathA: string, pathB: string): boolean {
  try {
    const statA = fs.statSync(pathA)
    const statB = fs.statSync(pathB)

    // Phase 1: Different sizes → definitely different
    if (statA.size !== statB.size)
      return false

    // Phase 2: Same size → compare content hash
    return quickHash(pathA) === quickHash(pathB)
  }
  catch {
    return false
  }
}

// ─── Whitespace Detection ────────────────────────────────────────

/**
 * Check if two files differ only in whitespace/formatting
 * Returns true if the only differences are spaces, tabs, newlines, etc.
 */
export function isWhitespaceOnlyChange(basePath: string, childPath: string): boolean {
  try {
    const baseContent = readFileSafe(basePath)
    const childContent = readFileSafe(childPath)

    if (baseContent === null || childContent === null)
      return false

    // Normalize: collapse all whitespace to single spaces, trim lines
    const normalize = (s: string) =>
      s.split('\n')
        .map(line => line.trim().replace(/\s+/g, ' '))
        .filter(line => line.length > 0)
        .join('\n')

    return normalize(baseContent) === normalize(childContent)
  }
  catch {
    return false
  }
}

// ─── File Comparison ─────────────────────────────────────────────

/**
 * Compare two files and return diff stats
 */
export function compareFiles(
  basePath: string,
  childPath: string,
): { linesAdded: number, linesRemoved: number, identical: boolean, whitespaceOnly: boolean } {
  // Binary files: compare by content hash
  if (isBinaryFile(basePath) || isBinaryFile(childPath)) {
    const identical = areFilesIdentical(basePath, childPath)
    return { linesAdded: identical ? 0 : 1, linesRemoved: identical ? 0 : 1, identical, whitespaceOnly: false }
  }

  // Fast path: check if files are identical using hash
  if (areFilesIdentical(basePath, childPath)) {
    return { linesAdded: 0, linesRemoved: 0, identical: true, whitespaceOnly: false }
  }

  // Files are different — check if whitespace-only
  const whitespaceOnly = isWhitespaceOnlyChange(basePath, childPath)

  const baseContent = readFileSafe(basePath) || ''
  const childContent = readFileSafe(childPath) || ''

  const changes = diffLines(baseContent, childContent)
  let linesAdded = 0
  let linesRemoved = 0

  for (const change of changes) {
    if (change.added)
      linesAdded += (change.count || 0)
    if (change.removed)
      linesRemoved += (change.count || 0)
  }

  return { linesAdded, linesRemoved, identical: false, whitespaceOnly }
}

/**
 * Get file size safely
 */
export function getFileSize(filePath: string): number {
  try {
    return fs.statSync(filePath).size
  }
  catch {
    return 0
  }
}

// ─── Progress Callback ──────────────────────────────────────────

export type ProgressCallback = (current: number, total: number, currentFile: string) => void

/**
 * Create a console-based progress spinner
 */
export function createProgressReporter(label: string): ProgressCallback {
  let lastUpdate = 0
  const updateInterval = 100 // ms between updates

  return (current: number, total: number, currentFile: string) => {
    const now = Date.now()
    if (now - lastUpdate < updateInterval && current < total)
      return
    lastUpdate = now

    const percent = Math.round((current / total) * 100)
    const spinChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    const spinChar = spinChars[current % spinChars.length]

    const termWidth = process.stdout.columns || 80
    const maxFileLen = Math.max(10, termWidth - 35)
    const shortFile = currentFile.length > maxFileLen
      ? `…${currentFile.slice(-maxFileLen + 1)}`
      : currentFile

    // Clear line and write progress
    process.stdout.write(`\r  ${spinChar} ${label} ${current}/${total} (${percent}%) ${shortFile}`)

    // Clear to end of line
    process.stdout.write('\x1B[K')

    // On completion, add newline
    if (current >= total) {
      process.stdout.write('\n')
    }
  }
}

// ─── Directory Diff ──────────────────────────────────────────────

/**
 * Perform a full diff between two directories
 */
export async function diffDirectories(
  baseDir: string,
  childDir: string,
  exclude: string[],
  specificPaths?: string[],
  onProgress?: ProgressCallback,
): Promise<DiffResult> {
  let baseFilesArray = await walkDir(baseDir, exclude)
  let childFilesArray = await walkDir(childDir, exclude)

  if (specificPaths && specificPaths.length > 0) {
    const filterFn = (f: string) => specificPaths.some((p) => {
      const cleanPath = p.replace(/\/+$/, '')
      return f === cleanPath || f.startsWith(`${cleanPath}/`) || f.startsWith(cleanPath + path.sep)
    })
    baseFilesArray = baseFilesArray.filter(filterFn)
    childFilesArray = childFilesArray.filter(filterFn)
  }

  const baseFiles = new Set(baseFilesArray)
  const childFiles = new Set(childFilesArray)

  const added: FileChange[] = []
  const modified: FileChange[] = []
  const deleted: FileChange[] = []
  const unchanged: string[] = []

  // Calculate total for progress
  const allFiles = new Set([...baseFiles, ...childFiles])
  const totalFiles = allFiles.size
  let processedFiles = 0

  // Create default progress reporter if none provided
  const progress = onProgress || createProgressReporter('Comparing files...')

  // Files in child but not in base → added
  for (const file of childFiles) {
    if (!baseFiles.has(file)) {
      const childPath = path.join(childDir, file)
      const lineCount = isBinaryFile(childPath)
        ? 1
        : (readFileSafe(childPath)?.split('\n').length || 0)

      added.push({
        relativePath: file,
        status: 'added',
        linesAdded: lineCount,
        linesRemoved: 0,
        sizeBase: 0,
        sizeChild: getFileSize(childPath),
      })

      processedFiles++
      progress(processedFiles, totalFiles, file)
    }
  }

  // Files in base but not in child → deleted
  for (const file of baseFiles) {
    if (!childFiles.has(file)) {
      const basePath = path.join(baseDir, file)
      const lineCount = isBinaryFile(basePath)
        ? 1
        : (readFileSafe(basePath)?.split('\n').length || 0)

      deleted.push({
        relativePath: file,
        status: 'deleted',
        linesAdded: 0,
        linesRemoved: lineCount,
        sizeBase: getFileSize(basePath),
        sizeChild: 0,
      })

      processedFiles++
      progress(processedFiles, totalFiles, file)
    }
  }

  // Files in both → compare (with fast hash skip)
  for (const file of childFiles) {
    if (baseFiles.has(file)) {
      const basePath = path.join(baseDir, file)
      const childPath = path.join(childDir, file)

      processedFiles++
      progress(processedFiles, totalFiles, file)

      const comparison = compareFiles(basePath, childPath)

      if (comparison.identical) {
        unchanged.push(file)
      }
      else {
        modified.push({
          relativePath: file,
          status: 'modified',
          linesAdded: comparison.linesAdded,
          linesRemoved: comparison.linesRemoved,
          sizeBase: getFileSize(basePath),
          sizeChild: getFileSize(childPath),
          // Store whitespace-only flag as metadata
          ...(comparison.whitespaceOnly ? { whitespaceOnly: true } as any : {}),
        })
      }
    }
  }

  const summary = {
    totalFiles: baseFiles.size + added.length,
    addedCount: added.length,
    modifiedCount: modified.length,
    deletedCount: deleted.length,
    unchangedCount: unchanged.length,
    totalLinesAdded: [...added, ...modified].reduce((sum, f) => sum + f.linesAdded, 0),
    totalLinesRemoved: [...deleted, ...modified].reduce((sum, f) => sum + f.linesRemoved, 0),
  }

  return { added, modified, deleted, unchanged, summary }
}

/**
 * Copy files from source to target, creating directories as needed
 */
export function copyFiles(
  files: string[],
  sourceDir: string,
  targetDir: string,
  dryRun = false,
): { copied: number, skipped: number } {
  let copied = 0
  let skipped = 0

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file)
    const targetPath = path.join(targetDir, file)

    if (!fs.existsSync(sourcePath)) {
      skipped++
      continue
    }

    if (!dryRun) {
      const dir = path.dirname(targetPath)
      fs.mkdirSync(dir, { recursive: true })
      fs.copyFileSync(sourcePath, targetPath)
    }
    copied++
  }

  return { copied, skipped }
}

/**
 * Copy an entire directory, respecting exclude patterns
 */
export async function copyDirectory(
  sourceDir: string,
  targetDir: string,
  exclude: string[],
  dryRun = false,
): Promise<{ copied: number, total: number }> {
  const files = await walkDir(sourceDir, exclude)

  if (!dryRun) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  const result = copyFiles(files, sourceDir, targetDir, dryRun)
  return { copied: result.copied, total: files.length }
}

/**
 * Generate a text diff between two files
 */
export function generateFileDiff(basePath: string, childPath: string): string {
  const baseContent = readFileSafe(basePath) || ''
  const childContent = readFileSafe(childPath) || ''
  const changes = diffLines(baseContent, childContent)

  let output = ''
  for (const change of changes) {
    const prefix = change.added ? '+' : change.removed ? '-' : ' '
    const lines = change.value.split('\n')
    for (const line of lines) {
      if (line)
        output += `${prefix} ${line}\n`
    }
  }
  return output
}

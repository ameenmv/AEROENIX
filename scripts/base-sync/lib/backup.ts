import fs from 'node:fs'
import path from 'node:path'
import consola from 'consola'

// ─── Backup Manager — Safety Net Before Overwrite ────────────────

const BACKUP_DIR = '.basesync-backups'
const MAX_BACKUPS = 5

/**
 * Create a timestamped backup of files before overwrite
 */
export function createBackup(
  files: string[],
  projectDir: string,
): { backupDir: string, count: number } {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const backupRoot = path.join(projectDir, BACKUP_DIR)
  const backupDir = path.join(backupRoot, timestamp)

  let count = 0

  for (const file of files) {
    const sourcePath = path.join(projectDir, file)
    if (!fs.existsSync(sourcePath))
      continue

    const targetPath = path.join(backupDir, file)
    const targetDir = path.dirname(targetPath)

    fs.mkdirSync(targetDir, { recursive: true })
    fs.copyFileSync(sourcePath, targetPath)
    count++
  }

  if (count > 0) {
    consola.info(`[BACKUP] Backed up ${count} files to ${path.relative(projectDir, backupDir)}`)
  }

  // Prune old backups
  pruneBackups(backupRoot)

  return { backupDir, count }
}

/**
 * Keep only the most recent N backups
 */
function pruneBackups(backupRoot: string): void {
  if (!fs.existsSync(backupRoot))
    return

  const entries = fs.readdirSync(backupRoot)
    .filter(e => fs.statSync(path.join(backupRoot, e)).isDirectory())
    .sort()
    .reverse()

  // Remove backups beyond MAX_BACKUPS
  for (let i = MAX_BACKUPS; i < entries.length; i++) {
    const oldBackup = path.join(backupRoot, entries[i])
    fs.rmSync(oldBackup, { recursive: true, force: true })
    consola.debug(`Pruned old backup: ${entries[i]}`)
  }
}

/**
 * Restore files from a backup directory
 */
export function restoreBackup(
  backupDir: string,
  projectDir: string,
): { restored: number } {
  if (!fs.existsSync(backupDir)) {
    consola.error(`Backup not found: ${backupDir}`)
    return { restored: 0 }
  }

  let restored = 0

  function walkRestore(dir: string, relBase: string): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relPath = path.join(relBase, entry.name)

      if (entry.isDirectory()) {
        walkRestore(fullPath, relPath)
      }
      else {
        const targetPath = path.join(projectDir, relPath)
        const targetDir = path.dirname(targetPath)
        fs.mkdirSync(targetDir, { recursive: true })
        fs.copyFileSync(fullPath, targetPath)
        restored++
      }
    }
  }

  walkRestore(backupDir, '')
  consola.success(`[RESTORE] Restored ${restored} files from backup`)
  return { restored }
}

/**
 * List available backups
 */
export function listBackups(projectDir: string): { name: string, date: Date, path: string }[] {
  const backupRoot = path.join(projectDir, BACKUP_DIR)
  if (!fs.existsSync(backupRoot))
    return []

  return fs.readdirSync(backupRoot)
    .filter(e => fs.statSync(path.join(backupRoot, e)).isDirectory())
    .map((name) => {
      const dateStr = name.replace(/-/g, (m, i) => {
        // Convert back from 2026-04-07T15-00-00 to a parseable date
        if (i === 4 || i === 7)
          return '-'
        if (i === 10)
          return 'T'
        if (i === 13 || i === 16)
          return ':'
        return m
      })
      return {
        name,
        date: new Date(dateStr),
        path: path.join(backupRoot, name),
      }
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())
}

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const REPORT_PATH = './i18n-report.json'
const LOCALES_DIR = './src/i18n/locales'

interface UnusedKey {
  path: string
  file: string
  language: string
}

interface I18nReport {
  missingKeys: any[]
  unusedKeys: UnusedKey[]
  maybeDynamicKeys: any[]
}

function deleteNestedKey(obj: Record<string, any>, keys: string[]): boolean {
  if (keys.length === 0)
    return false

  if (keys.length === 1) {
    if (keys[0] in obj) {
      delete obj[keys[0]]
      return true
    }
    return false
  }

  const [first, ...rest] = keys
  if (first in obj && typeof obj[first] === 'object' && obj[first] !== null) {
    const deleted = deleteNestedKey(obj[first], rest)
    // Clean up empty parent objects
    if (deleted && Object.keys(obj[first]).length === 0) {
      delete obj[first]
    }
    return deleted
  }

  return false
}

function main() {
  if (!fs.existsSync(REPORT_PATH)) {
    console.error(`Report file not found: ${REPORT_PATH}`)
    console.error('Run "bun run i18n:report" first to generate the report.')
    process.exit(1)
  }

  const report: I18nReport = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf-8'))
  const unusedKeys = report.unusedKeys

  if (!unusedKeys || unusedKeys.length === 0) {
    console.log('✅ No unused keys found. Nothing to clean up.')
    return
  }

  console.log(`🔍 Found ${unusedKeys.length} unused keys to remove.\n`)

  // Separate top-level namespace keys (no dot = entire file unused) from nested keys
  const namespacesToDelete: Record<string, Set<string>> = {}
  const grouped: Record<string, Record<string, string[]>> = {}

  for (const entry of unusedKeys) {
    const { path: keyPath, language } = entry
    const dotIndex = keyPath.indexOf('.')

    if (dotIndex === -1) {
      // Entire namespace is unused — mark the file for deletion
      if (!namespacesToDelete[language])
        namespacesToDelete[language] = new Set()
      namespacesToDelete[language].add(keyPath)
      continue
    }

    const namespace = keyPath.substring(0, dotIndex)
    const nestedPath = keyPath.substring(dotIndex + 1)

    if (!grouped[language])
      grouped[language] = {}
    if (!grouped[language][namespace])
      grouped[language][namespace] = []
    grouped[language][namespace].push(nestedPath)
  }

  let totalRemoved = 0
  let totalSkipped = 0
  let totalFilesDeleted = 0

  // Delete entire namespace files that are completely unused
  for (const [language, namespaces] of Object.entries(namespacesToDelete)) {
    console.log(`\n🗑️  Language: ${language} — deleting empty namespace files`)
    for (const namespace of namespaces) {
      const filePath = path.join(LOCALES_DIR, language, `${namespace}.json`)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        totalFilesDeleted++
        totalRemoved++
        console.log(`  🗑️  Deleted ${namespace}.json`)
      }
    }
  }

  // Remove nested keys from files that still have some used keys
  for (const [language, namespaces] of Object.entries(grouped)) {
    console.log(`\n📁 Language: ${language}`)

    for (const [namespace, keys] of Object.entries(namespaces)) {
      const filePath = path.join(LOCALES_DIR, language, `${namespace}.json`)

      // Skip if already deleted as an empty namespace
      if (namespacesToDelete[language]?.has(namespace)) {
        continue
      }

      if (!fs.existsSync(filePath)) {
        console.warn(`  ⚠️  File not found: ${filePath} — skipping ${keys.length} keys`)
        totalSkipped += keys.length
        continue
      }

      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      let removedInFile = 0

      for (const key of keys) {
        const keyParts = key.split('.')
        const deleted = deleteNestedKey(content, keyParts)
        if (deleted) {
          removedInFile++
          totalRemoved++
        }
        else {
          console.warn(`  ⚠️  Key not found in ${namespace}.json: ${key}`)
          totalSkipped++
        }
      }

      // If file is now empty, delete it instead of writing an empty object
      if (Object.keys(content).length === 0) {
        fs.unlinkSync(filePath)
        totalFilesDeleted++
        console.log(`  🗑️  ${namespace}.json — removed ${removedInFile} key(s), file now empty — deleted`)
      }
      else {
        fs.writeFileSync(filePath, `${JSON.stringify(content, null, 2)}\n`)
        console.log(`  ✅ ${namespace}.json — removed ${removedInFile} key(s)`)
      }
    }
  }

  console.log(`\n🎉 Done! Removed ${totalRemoved} unused keys. Deleted ${totalFilesDeleted} empty files. Skipped ${totalSkipped}.`)
}

main()

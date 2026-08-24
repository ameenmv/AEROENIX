import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const REPORT_PATH = './i18n-report.json'
const SRC_DIR = './src'
const LOCALES_DIR = './src/i18n/locales'
const LOCALES = ['en', 'ar']

/**
 * Patterns that hold raw i18n key strings which are later translated dynamically.
 * Each regex captures the i18n key in group 1 — only matches dotted keys (namespace.key).
 */
const RAW_KEY_PATTERNS: RegExp[] = [
  /breadcrumbKey:\s*['"]([a-z]\w*\.[a-z][\w.]*)['"]/gi,
  /parentBreadcrumbKey:\s*['"]([a-z]\w*\.[a-z][\w.]*)['"]/gi,
  /label:\s*['"]([a-z]\w*\.[a-z][\w.]*)['"]/gi,
  /description:\s*['"]([a-z]\w*\.[a-z][\w.]*)['"]/gi,
  /placeholder:\s*['"]([a-z]\w*\.[a-z][\w.]*)['"]/gi,
  /title:\s*['"]([a-z]\w*\.[a-z][\w.]*)['"]/gi,
]

interface I18nReport {
  missingKeys: { path: string, file: string, language: string, line?: number }[]
  unusedKeys: { path: string, file: string, language: string }[]
  maybeDynamicKeys: any[]
}

function walkDir(dir: string, exts: string[]): string[] {
  const results: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...walkDir(full, exts))
    }
    else if (exts.some(ext => entry.name.endsWith(ext))) {
      results.push(full)
    }
  }
  return results
}

/** Resolve a dotted key like "users.steps.personal" against a locale's merged data */
function keyExistsInLocale(locale: string, dottedKey: string): boolean {
  const filePath = path.join(LOCALES_DIR, locale)
  if (!fs.existsSync(filePath))
    return false

  // The key format is "namespace.nested.path"
  const parts = dottedKey.split('.')
  const namespace = parts[0]
  const nsFile = path.join(LOCALES_DIR, locale, `${namespace}.json`)

  if (!fs.existsSync(nsFile))
    return false

  try {
    let obj: any = JSON.parse(fs.readFileSync(nsFile, 'utf-8'))
    // Navigate the remaining path (everything after namespace)
    for (let i = 1; i < parts.length; i++) {
      if (obj === null || obj === undefined || typeof obj !== 'object')
        return false
      obj = obj[parts[i]]
    }
    return obj !== undefined
  }
  catch {
    return false
  }
}

function main() {
  if (!fs.existsSync(REPORT_PATH)) {
    console.error(`Report file not found: ${REPORT_PATH}`)
    process.exit(1)
  }

  const report: I18nReport = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf-8'))

  // Collect all raw i18n keys used in source files
  const files = walkDir(SRC_DIR, ['.ts', '.vue', '.js', '.tsx'])
  const usedRawKeys = new Set<string>()

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')

    for (const pattern of RAW_KEY_PATTERNS) {
      pattern.lastIndex = 0
      const matches = Array.from(content.matchAll(pattern))
      for (const match of matches) {
        usedRawKeys.add(match[1])
      }
    }
  }

  if (usedRawKeys.size === 0) {
    console.log('ℹ️  No raw i18n key patterns found in source files.')
    return
  }

  // --- 1. Remove false-positive unused keys ---
  const removedKeys: string[] = []
  if (report.unusedKeys && report.unusedKeys.length > 0) {
    report.unusedKeys = report.unusedKeys.filter((entry) => {
      if (usedRawKeys.has(entry.path)) {
        if (!removedKeys.includes(entry.path))
          removedKeys.push(entry.path)
        return false
      }
      return true
    })
  }

  // --- 2. Detect missing keys (raw keys not present in locale files) ---
  const addedMissing: string[] = []
  const existingMissingPaths = new Set(
    (report.missingKeys || []).map(m => `${m.path}::${m.language}`),
  )

  for (const key of usedRawKeys) {
    for (const locale of LOCALES) {
      const compositeKey = `${key}::${locale}`
      if (existingMissingPaths.has(compositeKey))
        continue

      if (!keyExistsInLocale(locale, key)) {
        if (!report.missingKeys)
          report.missingKeys = []
        report.missingKeys.push({
          path: key,
          file: `(raw key in source)`,
          language: locale,
        })
        existingMissingPaths.add(compositeKey)
        if (!addedMissing.includes(key))
          addedMissing.push(key)
      }
    }
  }

  // Write updated report
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`)

  // --- Logging ---
  if (removedKeys.length > 0) {
    console.log(`\n🔧 Post-process: removed ${removedKeys.length} false-positive unused key(s):`)
    for (const key of removedKeys) {
      console.log(`   ✓ ${key}`)
    }
  }

  if (addedMissing.length > 0) {
    console.log(
      `\n⚠️  Post-process: found ${addedMissing.length} missing raw key(s) not in locale files:`,
    )
    for (const key of addedMissing) {
      console.log(`   ✗ ${key}`)
    }
  }

  if (removedKeys.length === 0 && addedMissing.length === 0) {
    console.log('ℹ️  Post-process: no adjustments needed.')
  }
}

main()

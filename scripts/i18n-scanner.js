import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Resolve dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DIR = path.join(__dirname, '../src')

// Configuration
const EXCLUDE_DIRS = ['node_modules', 'i18n', 'assets']
const TARGET_EXTS = ['.vue', '.ts']

// We look for Arabic characters or English words with at least 2 letters
const isTranslateableText = (text) => {
  if (!text) return false
  const trimmed = text.trim()
  if (trimmed.length < 2) return false
  
  // Skip strings that look like paths, URLs, camelCase code, variables
  if (trimmed.startsWith('http')) return false
  if (trimmed.includes('/') && !trimmed.includes(' ')) return false
  if (/^[A-Za-z0-9_-]+$/.test(trimmed) && !trimmed.includes(' ') && trimmed.length < 5) return false
  
  // Skip if it contains Vue bindings, template literals, or i18n calls
  if (trimmed.includes('{{') || trimmed.includes('}}')) return false
  if (trimmed.includes('$t(') || trimmed.includes('t(')) return false
  
  // Has Arabic characters?
  const hasArabic = /[\u0600-\u06FF]/.test(trimmed)
  // Has typical English sentence/word structure?
  const hasEnglishWords = /[A-Za-z]{3,}/.test(trimmed)

  return hasArabic || hasEnglishWords
}

function walk(dir) {
  let results = []
  const list = fs.readdirSync(dir)
  list.forEach(file => {
    if (EXCLUDE_DIRS.includes(file)) return
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath))
    } else {
      if (TARGET_EXTS.includes(path.extname(file))) {
        results.push(filePath)
      }
    }
  })
  return results
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  let findings = []
  
  if (filePath.endsWith('.vue')) {
    // 1. Find text between HTML tags: >Text<
    const tagTextRegex = />([^<{]+)</g
    let match
    while ((match = tagTextRegex.exec(content)) !== null) {
      if (isTranslateableText(match[1])) {
        findings.push({ type: 'text_node', text: match[1].trim(), index: match.index })
      }
    }

    // 2. Find attributes like placeholder="..." label="..." title="..."
    const attrRegex = /\b(?:placeholder|label|title|description)="([^"]+)"/g
    while ((match = attrRegex.exec(content)) !== null) {
      if (isTranslateableText(match[1])) {
        findings.push({ type: 'attribute', text: match[1], index: match.index })
      }
    }
  }

  return findings
}

function main() {
  const files = walk(DIR)
  let totalFindings = 0
  const report = []

  files.forEach(file => {
    const findings = scanFile(file)
    if (findings.length > 0) {
      report.push({ file: path.relative(path.join(__dirname, '..'), file), findings })
      totalFindings += findings.length
    }
  })

  if (totalFindings === 0) {
    console.log('✅ No hardcoded translatable strings found!')
    return
  }

  console.log(`⚠️  Found ${totalFindings} potential hardcoded strings in ${report.length} files:\n`)
  
  report.forEach(item => {
    console.log(`\n📄 ${item.file}`)
    item.findings.forEach(f => {
      console.log(`  - [${f.type}] "${f.text}"`)
    })
  })
  
  console.log(`\nNote: Review the list above. To auto-extract them, implement the --fix logic.`)
}

main()

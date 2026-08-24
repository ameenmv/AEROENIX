import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import inquirer from 'inquirer'

// ─── CLI Flags ──────────────────────────────────────────────────
const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const YES = args.includes('-y') || args.includes('--yes')
const nameArg = args.find(a => !a.startsWith('-'))

// ─── Naming Helpers ──────────────────────────────────────────────
const toCamelCase = (str: string) => str.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
const toSnakeCase = (str: string) => str.replace(/-/g, '_')
const toPlural = (str: string) => (str.endsWith('s') ? str : `${str}s`)

// ─── Main ────────────────────────────────────────────────────────
async function main() {
  const ROOT = process.cwd()

  console.warn('')
  console.warn('  ╔══════════════════════════════════════╗')
  console.warn('  ║   🗑️  Module Removal Wizard           ║')
  console.warn('  ╚══════════════════════════════════════╝')
  console.warn('')

  // ── Detect existing modules ────────────────────────────────────
  const modulesDir = path.join(ROOT, 'src', 'modules')
  const existingModules = fs.readdirSync(modulesDir)
    .filter(f => fs.statSync(path.join(modulesDir, f)).isDirectory())
    .filter(f => f !== '_shared')

  if (existingModules.length === 0) {
    console.warn('  ⚠️  No modules found in src/modules/')
    return
  }

  // ── Select module ──────────────────────────────────────────────
  let resourceName: string

  if (nameArg && existingModules.includes(nameArg)) {
    resourceName = nameArg
  }
  else if (nameArg) {
    // Try camelCase variant
    const camel = toCamelCase(nameArg)
    if (existingModules.includes(camel)) {
      resourceName = camel
    }
    else {
      console.warn(`  ⚠️  Module "${nameArg}" not found.`)
      console.warn(`  Available: ${existingModules.join(', ')}`)
      return
    }
  }
  else {
    const { selected } = await inquirer.prompt([
      {
        type: 'rawlist',
        name: 'selected',
        message: 'Select module to remove:',
        choices: existingModules.map(m => ({ name: m, value: m })),
      },
    ])
    resourceName = selected
  }

  const camelName = resourceName
  const pluralName = toPlural(resourceName)
  const pluralSnake = toSnakeCase(pluralName)

  // ── Collect files to remove ────────────────────────────────────
  const filesToRemove = [
    path.join(ROOT, 'src', 'modules', camelName),
    path.join(ROOT, 'src', 'views', 'admin', camelName),
    path.join(ROOT, 'src', 'services', `${camelName}Service.ts`),
    path.join(ROOT, 'src', 'services', 'mock', `${camelName}Mock.ts`),
    path.join(ROOT, 'src', 'types', 'entities', `${resourceName}.ts`),
    path.join(ROOT, 'src', 'i18n', 'locales', 'en', `${pluralSnake}.json`),
    path.join(ROOT, 'src', 'i18n', 'locales', 'ar', `${pluralSnake}.json`),
  ]

  const existing = filesToRemove.filter(f => fs.existsSync(f))
  const refsToClean = [
    `src/router/index.ts      → import '../modules/${camelName}'`,
    `src/types/index.ts        → export * from './entities/${resourceName}'`,
    `src/config/navigation.ts  → nav item '${pluralSnake}'`,
    `src/i18n/locales/en/menu.json → "${pluralSnake}"`,
    `src/i18n/locales/ar/menu.json → "${pluralSnake}"`,
  ]

  console.warn('')
  console.warn('  ┌─────────────────────────────────────┐')
  console.warn('  │         🗑️  Removal Summary           │')
  console.warn('  ├─────────────────────────────────────┤')
  console.warn(`  │  Module: ${camelName}`)
  console.warn('  │')
  console.warn('  │  Files to delete:')
  for (const f of existing) {
    console.warn(`  │    🔴 ${path.relative(ROOT, f)}`)
  }
  console.warn('  │')
  console.warn('  │  References to clean:')
  for (const r of refsToClean) {
    console.warn(`  │    🧹 ${r}`)
  }
  console.warn('  └─────────────────────────────────────┘')
  console.warn('')

  // ── Confirm ────────────────────────────────────────────────────
  if (!YES) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Remove module "${camelName}" and all its files?`,
        default: false,
      },
    ])
    if (!confirm) {
      console.warn('  Aborted.')
      return
    }
  }

  if (DRY_RUN) {
    console.warn('\n  🔍 Dry run — no changes will be made\n')
    return
  }

  // ═══ DELETE FILES ══════════════════════════════════════════════
  for (const f of existing) {
    const rel = path.relative(ROOT, f)
    try {
      const stat = fs.statSync(f)
      if (stat.isDirectory()) {
        fs.rmSync(f, { recursive: true, force: true })
      }
      else {
        fs.unlinkSync(f)
      }
      console.warn(`  🗑️  Deleted ${rel}`)
    }
    catch {
      console.warn(`  ⚠️  Failed to delete ${rel}`)
    }
  }

  // ═══ CLEAN REFERENCES ═════════════════════════════════════════

  // 1. Router — remove import line
  const routerPath = path.join(ROOT, 'src', 'router', 'index.ts')
  if (fs.existsSync(routerPath)) {
    let content = fs.readFileSync(routerPath, 'utf-8')
    const importLine = `import '../modules/${camelName}'`
    content = content.split('\n').filter(line => !line.includes(importLine)).join('\n')
    fs.writeFileSync(routerPath, content)
    console.warn('  🧹 Cleaned src/router/index.ts')
  }

  // 2. Types index — remove entity export
  const typesPath = path.join(ROOT, 'src', 'types', 'index.ts')
  if (fs.existsSync(typesPath)) {
    let content = fs.readFileSync(typesPath, 'utf-8')
    const exportLine = `./entities/${resourceName}`
    content = content.split('\n').filter(line => !line.includes(exportLine)).join('\n')
    fs.writeFileSync(typesPath, content)
    console.warn('  🧹 Cleaned src/types/index.ts')
  }

  // 3. Navigation — remove nav item
  const navPath = path.join(ROOT, 'src', 'config', 'navigation.ts')
  if (fs.existsSync(navPath)) {
    let content = fs.readFileSync(navPath, 'utf-8')
    const targetName = pluralSnake
    const nameMatch = content.match(new RegExp(`name:\\s*'${targetName}'`))

    if (nameMatch && nameMatch.index !== undefined) {
      // Find start of object {
      let braceLevel = 0
      let startIndex = -1
      for (let i = nameMatch.index; i >= 0; i--) {
        if (content[i] === '}')
          braceLevel++
        if (content[i] === '{') {
          if (braceLevel === 0) {
            startIndex = i
            break
          }
          braceLevel--
        }
      }

      if (startIndex !== -1) {
        // Find end of balancing object }
        let braceLevel = 1
        let endIndex = -1
        for (let i = startIndex + 1; i < content.length; i++) {
          if (content[i] === '{')
            braceLevel++
          if (content[i] === '}') {
            braceLevel--
            if (braceLevel === 0) {
              endIndex = i
              break
            }
          }
        }

        if (endIndex !== -1) {
          // Include trailing comma and whitespace
          let finalEndIndex = endIndex + 1
          while (finalEndIndex < content.length && /[\s,]/.test(content[finalEndIndex])) {
            const char = content[finalEndIndex]
            finalEndIndex++
            if (char === '\n')
              break
          }

          content = content.substring(0, startIndex) + content.substring(finalEndIndex)
          fs.writeFileSync(navPath, content)
          console.warn('  🧹 Cleaned src/config/navigation.ts')
        }
      }
    }
  }

  // 4. Menu JSON (en) — remove key
  const menuEnPath = path.join(ROOT, 'src', 'i18n', 'locales', 'en', 'menu.json')
  cleanMenuJson(menuEnPath, pluralSnake, 'en')

  // 5. Menu JSON (ar) — remove key
  const menuArPath = path.join(ROOT, 'src', 'i18n', 'locales', 'ar', 'menu.json')
  cleanMenuJson(menuArPath, pluralSnake, 'ar')

  console.warn('')
  console.warn(`  ✨ Module "${camelName}" removed successfully!`)
  console.warn('')
}

function cleanMenuJson(filePath: string, key: string, lang: string) {
  if (!fs.existsSync(filePath))
    return
  try {
    const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    if (key in json) {
      delete json[key]
      fs.writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`)
      console.warn(`  🧹 Cleaned src/i18n/locales/${lang}/menu.json`)
    }
  }
  catch {
    console.warn(`  ⚠️  Failed to clean menu.json (${lang})`)
  }
}

main().catch(console.error)

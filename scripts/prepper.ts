#!/usr/bin/env bun
/**
 * prepper - Environment and project setup helper
 *
 * This script:
 * 1. Ensures GEMINI.local.md exists
 * 2. Creates .env from .env.example if .env doesn't exist
 * 3. Otherwise, compares .env.example with .env to show differences
 */

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = import.meta.dir.slice(0, import.meta.dir.lastIndexOf('/scripts'))
const GEMINI_LOCAL = join(ROOT, 'GEMINI.local.md')
const ENV_EXAMPLE = join(ROOT, '.env.example')
const ENV = join(ROOT, '.env')

// ANSI colors
const green = (text: string) => `\x1B[32m${text}\x1B[0m`
const yellow = (text: string) => `\x1B[33m${text}\x1B[0m`
const red = (text: string) => `\x1B[31m${text}\x1B[0m`
const blue = (text: string) => `\x1B[34m${text}\x1B[0m`
const dim = (text: string) => `\x1B[2m${text}\x1B[0m`

function ensureGeminilocal() {
  console.log(blue('📋 Checking GEMINI.local.md...'))

  if (!existsSync(GEMINI_LOCAL)) {
    const content = `# Personal Overrides (gitignored)

## Environment
- API Base: \`VITE_API_BASE_URL\` — set in \`.env\`
- Mock Mode: \`VITE_USE_MOCK_DATA=true\` — use Faker mock data without a backend
- Default Locale: \`en\` (supported: \`en\`, \`ar\`)
- Default Theme: Dark mode

## Personal Preferences
<!-- Add your personal overrides here, e.g.: -->
<!-- - Preferred editor font size -->
<!-- - Custom keybindings -->
<!-- - Local API endpoint overrides -->
`
    writeFileSync(GEMINI_LOCAL, content, 'utf-8')
    console.log(green('  ✓ Created GEMINI.local.md'))
    return true
  }
  console.log(dim('  ✓ GEMINI.local.md already exists'))
  return false
}

function handleEnv() {
  console.log(blue('🔧 Checking .env file...'))

  if (!existsSync(ENV_EXAMPLE)) {
    console.log(red('  ✗ .env.example not found!'))
    return
  }

  if (!existsSync(ENV)) {
    copyFileSync(ENV_EXAMPLE, ENV)
    console.log(green('  ✓ Created .env from .env.example'))
    console.log(yellow('  → Edit .env with your values'))
    return
  }

  // Compare files
  const exampleContent = readFileSync(ENV_EXAMPLE, 'utf-8')
  const envContent = readFileSync(ENV, 'utf-8')

  const exampleKeys = extractKeys(exampleContent)
  const envKeys = extractKeys(envContent)

  const missingInEnv = exampleKeys.filter(k => !envKeys.includes(k))
  const extraInEnv = envKeys.filter(k => !exampleKeys.includes(k))

  if (missingInEnv.length === 0 && extraInEnv.length === 0) {
    console.log(green('  ✓ .env is in sync with .env.example'))
    return
  }

  console.log(yellow('  ⚠ Differences found:'))

  if (missingInEnv.length > 0) {
    console.log(red('    Missing in .env:'))
    missingInEnv.forEach(k => console.log(dim(`      - ${k}`)))
  }

  if (extraInEnv.length > 0) {
    console.log(yellow('    Extra in .env (not in example):'))
    extraInEnv.forEach(k => console.log(dim(`      - ${k}`)))
  }
}

function extractKeys(content: string): string[] {
  return content
    .split('\n')
    .filter(line => line.trim() && !line.trim().startsWith('#'))
    .map(line => line.split('=')[0])
}

console.log(dim('🚀 Running prepper...\n'))

const geminiCreated = ensureGeminilocal()
console.log()
handleEnv()

console.log()
if (geminiCreated) {
  console.log(green('✨ Setup complete! Edit GEMINI.local.md with your personal preferences.'))
}
else {
  console.log(green('✨ Check complete!'))
}

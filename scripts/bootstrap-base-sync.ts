#!/usr/bin/env bun
/**
 * bootstrap-base-sync.ts
 *
 * Pulls the `scripts/base-sync`, `scripts/neop-logo` folders and
 * `.basesync.json` from the `dev` branch of dashboard-base-vue on GitHub,
 * then installs the required dependencies into your project.
 *
 * Usage:
 *   bun scripts/bootstrap-base-sync.ts
 *   # or add to package.json scripts:
 *   #   "bootstrap": "bun scripts/bootstrap-base-sync.ts"
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

// ── Config ────────────────────────────────────────────────────────
const REPO = 'neop-planet/dashboard-base-vue'
const BRANCH = 'develop'
const CLONE_URL = `https://github.com/${REPO}.git`

/** Folders to pull from the repo */
const FOLDERS_TO_COPY = ['scripts/base-sync', 'scripts/neop-logo', 'scripts/jira-to-md', 'scripts/postman', 'scripts/unused-assets', 'scripts/svg-to-vue']

/** Individual files to pull from the repo */
const FILES_TO_COPY = ['.basesync.json', 'scripts/bootstrap-base-sync.ts', 'scripts/i18n-prep.ts', 'scripts/i18n-post-process.ts']

/** Dev-dependencies required by base-sync + neop-logo */
const REQUIRED_DEV_DEPS = [
  'consola',
  'diff',
  'fast-glob',
  'simple-git',
  '@inquirer/prompts',
  'commander',
  'chalk',
  'dotenv',
  'vue-i18n-extract',
] as const

/** The package.json scripts that should exist */
const REQUIRED_SCRIPTS: Record<string, string> = {
  'base-sync': 'bun scripts/base-sync/index.ts',
  'bootstrap': 'bun scripts/bootstrap-base-sync.ts',
  'jira': 'bun scripts/jira-to-md/index.ts',
  'jira:fetch': 'bun scripts/jira-to-md/index.ts fetch',
  'jira:list': 'bun scripts/jira-to-md/index.ts list-projects',
  'postman': 'node scripts/postman/index.js',
  'assets:scan': 'bun scripts/unused-assets/index.ts',
  'assets:report': 'bun scripts/unused-assets/index.ts --report',
  'assets:clean': 'bun scripts/unused-assets/index.ts --auto',
  'svg:convert': 'bun scripts/svg-to-vue/index.ts',
  'svg:report': 'bun scripts/svg-to-vue/index.ts --report',
  'svg:analyze': 'bun scripts/svg-to-vue/index.ts --analyze',
  'svg:all': 'bun scripts/svg-to-vue/index.ts --all',
  'svg:refactor': 'bun scripts/svg-to-vue/index.ts --all --refactor',
  'i18n:prep': 'bun scripts/i18n-prep.ts',
  'i18n:report': "bun run i18n:prep && bun x vue-i18n-extract report --vueFiles './src/**/*.?(js|vue|ts|tsx)' --languageFiles './.i18n-temp/*.json' --output i18n-report.json && bun scripts/i18n-post-process.ts",
}

/** Entries to ensure exist in .gitignore */
const GITIGNORE_ENTRIES = [
  '.basesync-bootstrap-tmp/',
  '.basesync-tmp/',
  '.basesync-backups/',
  '.basesync-registry.json',
  '.unused-assets/',
  'i18n-report.json',
  'i18n-report.jsonc',
  '.i18n-temp/',
]

// ── Helpers ───────────────────────────────────────────────────────

const ROOT = process.cwd()
const TEMP_DIR = path.join(ROOT, '.basesync-bootstrap-tmp')

const c = {
  green: (s: string) => `\x1B[32m${s}\x1B[0m`,
  red: (s: string) => `\x1B[31m${s}\x1B[0m`,
  cyan: (s: string) => `\x1B[36m${s}\x1B[0m`,
  dim: (s: string) => `\x1B[2m${s}\x1B[0m`,
  bold: (s: string) => `\x1B[1m${s}\x1B[0m`,
}

function log(msg: string) {
  console.log(`  ${msg}`)
}
function step(msg: string) {
  console.log(`\n  ${c.cyan('›')} ${c.bold(msg)}`)
}
function ok(msg: string) {
  console.log(`  ${c.green('✓')} ${msg}`)
}
function fail(msg: string) {
  console.error(`  ${c.red('✗')} ${msg}`)
}

function run(cmd: string, opts?: { cwd?: string }) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf-8', ...opts }).trim()
}

function copyDirRecursive(src: string, dest: string) {
  if (!fs.existsSync(src))
    return
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath)
    }
    else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────

async function main() {
  console.log()
  console.log(`  ${c.bold(c.cyan('┌──────────────────────────────────────────┐'))}`)
  console.log(`  ${c.bold(c.cyan('│'))}  ${c.bold('Bootstrap Base-Sync')}                    ${c.bold(c.cyan('│'))}`)
  console.log(`  ${c.bold(c.cyan('│'))}  ${c.dim(`from ${REPO}@${BRANCH}`)}  ${c.bold(c.cyan('│'))}`)
  console.log(`  ${c.bold(c.cyan('└──────────────────────────────────────────┘'))}`)

  // ── Step 1: Shallow clone ──────────────────────────────────────
  step('Cloning repository (sparse checkout)...')

  // Clean up any previous temp dir
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true })
  }

  try {
    // Use sparse checkout to only grab what we need
    run(`git clone --depth 1 --branch ${BRANCH} --no-checkout ${CLONE_URL} ${TEMP_DIR}`)
    run(`git sparse-checkout init --cone`, { cwd: TEMP_DIR })

    const sparsePatterns = [...FOLDERS_TO_COPY, ...FILES_TO_COPY].join(' ')
    run(`git sparse-checkout set ${sparsePatterns}`, { cwd: TEMP_DIR })
    run(`git checkout`, { cwd: TEMP_DIR })

    ok('Repository cloned successfully')
  }
  catch (err: any) {
    fail(`Clone failed: ${err.message}`)
    fail('Make sure you have git installed and can access the repository.')
    cleanup()
    process.exit(1)
  }

  // ── Step 2: Remove old files ───────────────────────────────────
  step('Removing old script folders...')

  for (const folder of FOLDERS_TO_COPY) {
    const dest = path.join(ROOT, folder)
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true })
      ok(`Removed ${folder}`)
    }
  }

  for (const file of FILES_TO_COPY) {
    const dest = path.join(ROOT, file)
    if (fs.existsSync(dest)) {
      fs.unlinkSync(dest)
      ok(`Removed ${file}`)
    }
  }

  // ── Step 3: Copy fresh files ──────────────────────────────────
  step('Copying fresh scripts and config files...')

  for (const folder of FOLDERS_TO_COPY) {
    const src = path.join(TEMP_DIR, folder)
    const dest = path.join(ROOT, folder)

    if (!fs.existsSync(src)) {
      fail(`Folder not found in repo: ${folder}`)
      continue
    }

    copyDirRecursive(src, dest)
    ok(`${folder}`)
  }

  for (const file of FILES_TO_COPY) {
    const src = path.join(TEMP_DIR, file)
    const dest = path.join(ROOT, file)

    if (!fs.existsSync(src)) {
      fail(`File not found in repo: ${file}`)
      continue
    }

    const destDir = path.dirname(dest)
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
    }

    fs.copyFileSync(src, dest)
    ok(`${file}`)
  }

  // ── Step 4: Install dependencies ───────────────────────────────
  step('Checking dependencies...')

  const pkgPath = path.join(ROOT, 'package.json')
  if (!fs.existsSync(pkgPath)) {
    fail('No package.json found in current directory.')
    cleanup()
    process.exit(1)
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  const allDeps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
  }

  const missingDeps = REQUIRED_DEV_DEPS.filter(dep => !allDeps[dep])

  if (missingDeps.length > 0) {
    log(`Installing ${c.bold(String(missingDeps.length))} missing develop dependencies...`)
    log(c.dim(missingDeps.join(', ')))

    try {
      run(`bun add -D ${missingDeps.join(' ')}`, { cwd: ROOT })
      ok(`Installed: ${missingDeps.join(', ')}`)
    }
    catch (err: any) {
      fail(`Dependency install failed: ${err.message}`)
      fail(`You can install manually: bun add -D ${missingDeps.join(' ')}`)
    }
  }
  else {
    ok('All dependencies already installed')
  }

  // ── Step 5: Add scripts to package.json ────────────────────────
  step('Updating package.json scripts...')

  // Re-read in case bun add modified it
  const updatedPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  const scripts = updatedPkg.scripts || {}
  let scriptsAdded = 0

  for (const [key, value] of Object.entries(REQUIRED_SCRIPTS)) {
    if (!scripts[key]) {
      scripts[key] = value
      scriptsAdded++
      ok(`Added script: "${key}"`)
    }
    else {
      log(c.dim(`Script "${key}" already exists — skipping`))
    }
  }

  if (scriptsAdded > 0) {
    updatedPkg.scripts = scripts
    fs.writeFileSync(pkgPath, `${JSON.stringify(updatedPkg, null, 2)}\n`)
    ok('package.json updated')
  }

  // ── Step 6: Ensure .gitignore has bootstrap temp dir ──────────
  step('Updating .gitignore...')

  const gitignorePath = path.join(ROOT, '.gitignore')
  let gitignoreContent = fs.existsSync(gitignorePath)
    ? fs.readFileSync(gitignorePath, 'utf-8')
    : ''

  let gitignoreChanged = false
  for (const entry of GITIGNORE_ENTRIES) {
    if (!gitignoreContent.includes(entry)) {
      gitignoreContent = `${gitignoreContent.trimEnd()}\n${entry}\n`
      gitignoreChanged = true
      ok(`Added "${entry}" to .gitignore`)
    }
  }

  if (gitignoreChanged) {
    fs.writeFileSync(gitignorePath, gitignoreContent)
  }
  else {
    log(c.dim('.gitignore already up to date'))
  }

  // ── Cleanup ────────────────────────────────────────────────────
  cleanup()

  // ── Done ───────────────────────────────────────────────────────
  console.log()
  console.log(`  ${c.bold(c.green('Done!'))} Base-sync has been bootstrapped.`)
  console.log()
  console.log(`  ${c.dim('Get started:')}`)
  console.log(`    ${c.cyan('bun run base-sync')}`)
  console.log()
}

function cleanup() {
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true })
  }
}

// Handle interrupts
process.on('SIGINT', () => {
  cleanup()
  process.exit(0)
})

main().catch((err) => {
  fail(err.message)
  cleanup()
  process.exit(1)
})

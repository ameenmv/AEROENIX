import type { BaseSyncConfig } from './types'
import fs from 'node:fs'
import path from 'node:path'
import consola from 'consola'
import { z } from 'zod'

// ─── Zod Schema ──────────────────────────────────────────────────

const configSchema = z.object({
  role: z.enum(['base', 'child']).default('base'),
  base: z.string().nullable().default(null),
  exclude: z.array(z.string()).default([
    'node_modules',
    '.git',
    'dist',
    'dist-ssr',
    '.env',
    '.env.*',
    '!.env.example',
    '*.local',
    '.gemini',
    'GEMINI.local.md',
    'bun.lock',
    '.basesync-registry.json',
    '.basesync-backups',
    'docs/.vitepress/cache',
    'docs/.vitepress/dist',
    '.i18n-temp',
    'i18n-report.json',
    'eslint-report.json',
  ]),
  defaultBranch: z.string().default('dev'),
  registry: z.string().default('.basesync-registry.json'),
  github: z.object({
    org: z.string().default('neop-planet'),
    useCLI: z.boolean().default(true),
  }).default({}),
  lastSync: z.string().optional(),
  baseBranch: z.string().optional(),
})

// ─── Default Config ──────────────────────────────────────────────

export const DEFAULT_CONFIG: BaseSyncConfig = {
  role: 'base',
  base: null,
  exclude: [
    'node_modules',
    '.git',
    'dist',
    'dist-ssr',
    '.env',
    '.env.*',
    '!.env.example',
    '*.local',
    '.gemini',
    'GEMINI.local.md',
    'bun.lock',
    '.basesync-registry.json',
    '.basesync-backups',
    'docs/.vitepress/cache',
    'docs/.vitepress/dist',
    '.i18n-temp',
    'i18n-report.json',
    'eslint-report.json',
  ],
  defaultBranch: 'dev',
  registry: '.basesync-registry.json',
  github: {
    org: 'neop-planet',
    useCLI: true,
  },
}

// ─── Config Loader ───────────────────────────────────────────────

export function findConfigFile(startDir?: string): string | null {
  const dir = startDir || process.cwd()
  const configPath = path.join(dir, '.basesync.json')
  if (fs.existsSync(configPath))
    return configPath

  // Walk up to find it
  const parent = path.dirname(dir)
  if (parent === dir)
    return null
  return findConfigFile(parent)
}

export function loadConfig(configPath?: string): BaseSyncConfig {
  const resolvedPath = configPath || findConfigFile()

  if (!resolvedPath || !fs.existsSync(resolvedPath)) {
    consola.info('No .basesync.json found, using defaults')
    return DEFAULT_CONFIG
  }

  try {
    const raw = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'))
    const parsed = configSchema.parse(raw)
    return parsed as BaseSyncConfig
  }
  catch (err) {
    consola.warn(`Invalid config at ${resolvedPath}, using defaults:`, err)
    return DEFAULT_CONFIG
  }
}

export function saveConfig(config: BaseSyncConfig, targetDir?: string): void {
  const dir = targetDir || process.cwd()
  const configPath = path.join(dir, '.basesync.json')
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`)
  consola.success(`Config saved to ${configPath}`)
}

// ─── Registry Loader ─────────────────────────────────────────────

export function loadRegistry(config: BaseSyncConfig): { baseProject: string, children: any[] } {
  const registryPath = path.join(process.cwd(), config.registry)
  if (!fs.existsSync(registryPath)) {
    return { baseProject: path.basename(process.cwd()), children: [] }
  }
  try {
    return JSON.parse(fs.readFileSync(registryPath, 'utf-8'))
  }
  catch {
    return { baseProject: path.basename(process.cwd()), children: [] }
  }
}

export function saveRegistry(config: BaseSyncConfig, registry: { baseProject: string, children: any[] }): void {
  const registryPath = path.join(process.cwd(), config.registry)
  fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`)
}

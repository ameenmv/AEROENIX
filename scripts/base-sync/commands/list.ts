import type { BaseSyncConfig } from '../types'
import path from 'node:path'
import consola from 'consola'
import { loadRegistry } from '../config'
import { detectCurrentRepo } from '../lib/github'

// ─── List Command ────────────────────────────────────────────────

export async function executeList(config: BaseSyncConfig, json = false): Promise<void> {
  const registry = loadRegistry(config)
  const currentRepo = detectCurrentRepo()
  const baseName = currentRepo
    ? `${currentRepo.owner}/${currentRepo.repo}`
    : path.basename(process.cwd())

  if (json) {
    console.log(JSON.stringify({
      base: baseName,
      children: registry.children,
    }, null, 2))
    return
  }

  console.log('')
  console.log(`  [BAS] Base Project: ${baseName}`)
  if (currentRepo) {
    console.log(`  [URL] GitHub:       https://github.com/${currentRepo.owner}/${currentRepo.repo}`)
  }
  console.log(`  [REG] Registry:     ${config.registry}`)

  if (registry.children.length === 0) {
    console.log('')
    consola.info('No child projects registered yet.')
    consola.info('Use "bun base-sync scaffold" to create one.')
    return
  }

  console.log('')
  console.log('  ┌───────────────────────────────────────────────────────────────────────────┐')
  console.log('  │  #  │ Name                  │ Remote                │ Branch │ Last Sync   │')
  console.log('  ├───────────────────────────────────────────────────────────────────────────┤')

  for (let i = 0; i < registry.children.length; i++) {
    const child = registry.children[i]
    const num = String(i + 1).padStart(2, ' ')
    const name = (child.name || '').padEnd(20, ' ').slice(0, 20)
    const remote = (child.remote || 'local').padEnd(20, ' ').slice(0, 20)
    const branch = (child.branch || 'dev').padEnd(6, ' ').slice(0, 6)
    const lastSync = child.lastSync
      ? new Date(child.lastSync).toLocaleDateString()
      : 'never'
    const syncStr = lastSync.padEnd(11, ' ').slice(0, 11)
    console.log(`  │ ${num}  │ ${name} │ ${remote}  │ ${branch} │ ${syncStr} │`)
  }
  console.log('  └───────────────────────────────────────────────────────────────────────────┘')
  console.log('')
}

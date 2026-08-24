#!/usr/bin/env bun
import path from 'node:path'
import process from 'node:process'
import consola from 'consola'
import { renderAnimatedLogo } from '../neop-logo'
import { diffInteractive, executeDiff } from './commands/diff'
import { executeList } from './commands/list'
import { executeScaffold, scaffoldInteractive } from './commands/scaffold'
import { executeStatus, statusInteractive } from './commands/status'
import { executeSync, syncInteractive } from './commands/sync'
import { loadConfig } from './config'
import { cleanupTempClones } from './lib/github'
import { promptCommand } from './lib/prompts'

import { printBanner } from './lib/reporter'

// ─── Parse CLI Arguments ─────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2)
  const command = args[0] && !args[0].startsWith('-') ? args[0] : null
  const flags: Record<string, string | boolean> = {}

  for (let i = command ? 1 : 0; i < args.length; i++) {
    const arg = args[i]
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const nextArg = args[i + 1]
      if (nextArg && !nextArg.startsWith('-')) {
        flags[key] = nextArg
        i++
      }
      else {
        flags[key] = true
      }
    }
    else if (arg.startsWith('-')) {
      flags[arg.slice(1)] = true
    }
  }

  return { command, flags }
}

// ─── Help Text ───────────────────────────────────────────────────

function printHelp(): void {
  printBanner()
  console.log(`  ${bold('Usage:')}`)
  console.log(`    bun base-sync [command] [options]`)
  console.log(`    bun base-sync                       ${dim('Interactive wizard (no args)')}`)
  console.log('')
  console.log(`  ${bold('Commands:')}`)
  console.log(`    scaffold     Create a new child project from base`)
  console.log(`    diff         Compare a child project against a repo`)
  console.log(`    status       See drift between this project and a repo`)
  console.log(`    sync         Pull repo updates into this project`)
  console.log(`    list         List all known child projects`)
  console.log(`    cleanup      Remove temporary clone cache`)
  console.log('')
  console.log(`  ${bold('Scaffold Options:')}`)
  console.log(`    --name <name>       Name of the new project`)
  console.log(`    --output <path>     Where to create the project`)
  console.log(`    --git-init          Initialize a Git repo`)
  console.log(`    --push              Push to GitHub after creation`)
  console.log(`    --branch <name>     Branch name (default:develop)`)
  console.log(`    --dry-run           Preview without writing`)
  console.log(`    --exclude <pat>     Extra exclude patterns`)
  console.log('')
  console.log(`  ${bold('Diff / Status / Sync Options:')}`)
  console.log(`    --base <owner/repo> GitHub repo to compare against`)
  console.log(`    --branch <name>     Branch to compare (default:develop)`)
  console.log(`    --strategy <mode>   merge | patch | overwrite (sync only)`)
  console.log(`    --dry-run           Preview without writing`)
  console.log(`    --local-only        Skip all remote operations (default: true in diff)`)
  console.log(`    --json              JSON output (status only)`)
  console.log('')
  console.log(`  ${bold('Global Options:')}`)
  console.log(`    --config <path>     Custom .basesync.json path`)
  console.log(`    --verbose           Detailed logging`)
  console.log(`    --help, -h          Show this help`)
  console.log('')
}

function bold(s: string): string { return `\x1B[1m${s}\x1B[0m` }
function dim(s: string): string { return `\x1B[2m${s}\x1B[0m` }

// ─── Interactive Wizard ──────────────────────────────────────────

async function interactiveWizard(): Promise<void> {
  printBanner()

  const config = loadConfig()
  const command = await promptCommand()

  switch (command) {
    case 'scaffold':
      await scaffoldInteractive(config)
      break

    case 'diff':
      await diffInteractive(config)
      break

    case 'status':
      await statusInteractive(config)
      break

    case 'sync':
      await syncInteractive(config)
      break

    case 'list':
      await executeList(config)
      break
  }
}

// ─── CLI (Non-Interactive) Handler ───────────────────────────────

async function handleCLI(command: string, flags: Record<string, string | boolean>): Promise<void> {
  const configPath = typeof flags.config === 'string' ? flags.config : undefined
  const config = loadConfig(configPath)

  if (flags.verbose) {
    consola.level = 5
  }

  switch (command) {
    case 'scaffold': {
      if (!flags.name) {
        await scaffoldInteractive(config)
        return
      }

      const outputBase = typeof flags.output === 'string' ? flags.output : '../'
      const name = flags.name as string

      await executeScaffold(config, {
        name,
        output: path.resolve(outputBase, name),
        gitInit: !!flags['git-init'],
        push: !!flags.push,
        branch: typeof flags.branch === 'string' ? flags.branch : config.defaultBranch,
        dryRun: !!flags['dry-run'],
        exclude: typeof flags.exclude === 'string'
          ? [...config.exclude, ...flags.exclude.split(',')]
          : config.exclude,
      })
      break
    }

    case 'diff': {
      if (!flags.base) {
        await diffInteractive(config)
        return
      }

      await executeDiff(config, {
        base: flags.base as string,
        output: typeof flags.output === 'string' ? flags.output : '',
        branch: typeof flags.branch === 'string' ? flags.branch : undefined,
        report: !!flags.report,
        addedOnly: !!flags.added,
        modifiedOnly: !!flags.modified,
        deletedOnly: !!flags.deleted,
        push: !!flags.push,
        interactive: false,
        dryRun: !!flags['dry-run'],
        localOnly: !!flags['local-only'],
      })
      break
    }

    case 'status': {
      if (!flags.base) {
        await statusInteractive(config)
        return
      }
      await executeStatus(config, {
        base: flags.base as string,
        json: !!flags.json,
      })
      break
    }

    case 'sync': {
      if (!flags.base) {
        await syncInteractive(config)
        return
      }
      const strategy = (typeof flags.strategy === 'string' ? flags.strategy : 'merge') as any
      await executeSync(config, {
        base: flags.base as string,
        strategy,
        dryRun: !!flags['dry-run'],
        localOnly: !!flags['local-only'],
        exclude: typeof flags.exclude === 'string'
          ? [...config.exclude, ...flags.exclude.split(',')]
          : config.exclude,
      })
      break
    }

    case 'list':
      await executeList(config, !!flags.json)
      break

    case 'cleanup':
      cleanupTempClones()
      break

    default:
      consola.error(`Unknown command: ${command}`)
      printHelp()
      process.exit(1)
  }
}

// ─── Main ────────────────────────────────────────────────────────

async function main(): Promise<void> {
  await renderAnimatedLogo()

  const { command, flags } = parseArgs()

  if (flags.help || flags.h) {
    printHelp()
    return
  }

  if (!command) {
    await interactiveWizard()
    return
  }

  await handleCLI(command, flags)
}

main().catch((err) => {
  if (err.message?.includes('User force closed')) {
    console.log('\n  Bye!')
    process.exit(0)
  }
  consola.error(err)
  process.exit(1)
})

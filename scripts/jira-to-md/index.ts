#!/usr/bin/env node
import type { JiraBoard, JiraIssue, JiraSprint } from './jira'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { checkbox, input, select } from '@inquirer/prompts'
import { Command } from 'commander'
import consola from 'consola'
import * as dotenv from 'dotenv'
import {
  fetchBacklogIssues,
  fetchBoards,
  fetchIssues,
  fetchSprintIssues,
  fetchSprints,
} from './jira'
import { issueToMarkdown } from './markdown'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// ─── Helpers ─────────────────────────────────────────────────────

function resolveCredentials(opts: any) {
  const host = opts.host || process.env.JIRA_HOST
  const email = opts.email || process.env.JIRA_EMAIL
  const token = opts.token || process.env.JIRA_TOKEN

  if (!host || !email || !token) {
    consola.error('Missing Jira credentials!')
    console.log('')
    console.log('   Set them in your .env file:')
    console.log('')
    console.log('   JIRA_HOST=https://yourcompany.atlassian.net')
    console.log('   JIRA_EMAIL=you@example.com')
    console.log('   JIRA_TOKEN=your_api_token')
    console.log('')
    console.log('   👉 Get your API token at:')
    console.log('   https://id.atlassian.com/manage-profile/security/api-tokens')
    console.log('')
    process.exit(1)
  }

  return { host, email, token }
}

async function fetchProjects(host: string, email: string, token: string): Promise<any[]> {
  const auth = Buffer.from(`${email}:${token}`).toString('base64')
  const res = await fetch(`${host}/rest/api/3/project`, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    const err = new Error(await res.text()) as any
    err.status = res.status
    throw err
  }

  return await res.json() as any[]
}

function cleanOutputDir(outputDir: string): void {
  if (!fs.existsSync(outputDir))
    return
  fs.rmSync(outputDir, { recursive: true, force: true })
}

/** Sanitize a sprint name for use as a folder name */
function sanitizeFolderName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

function writeIssueFiles(issues: JiraIssue[], dir: string): number {
  fs.mkdirSync(dir, { recursive: true })
  let written = 0
  for (const issue of issues) {
    const md = issueToMarkdown(issue)
    const filename = `${issue.key}.md`
    fs.writeFileSync(path.join(dir, filename), md, 'utf8')
    written++
  }
  return written
}

function generateSprintIndex(sprintName: string, issues: JiraIssue[]): string {
  const now = new Date().toISOString().split('T')[0]
  let md = `# ${sprintName}\n\n`
  md += `> Generated on ${now} · ${issues.length} issue(s)\n\n`
  md += `| Key | Type | Status | Summary | Assignee |\n`
  md += `|-----|------|--------|---------|----------|\n`
  for (const issue of issues) {
    const key = `[${issue.key}](./${issue.key}.md)`
    const type = issue.fields.issuetype?.name ?? '-'
    const status = issue.fields.status?.name ?? '-'
    const summary = (issue.fields.summary ?? '').replace(/\|/g, '\\|')
    const assignee = issue.fields.assignee?.displayName ?? 'Unassigned'
    md += `| ${key} | ${type} | ${status} | ${summary} | ${assignee} |\n`
  }
  return md
}

function generateMainIndex(projectKey: string, sections: Array<{ name: string, folder: string, count: number }>): string {
  const now = new Date().toISOString().split('T')[0]
  let md = `# ${projectKey} — Board Overview\n\n`
  md += `> Generated on ${now}\n\n`
  md += `| Sprint / Section | Issues | Status |\n`
  md += `|-----------------|--------|--------|\n`
  for (const s of sections) {
    md += `| [${s.name}](./${s.folder}/INDEX.md) | ${s.count} | ${s.name === 'Backlog' ? '📋 Backlog' : '🏃 Sprint'} |\n`
  }
  md += `\n---\n\n`
  let totalIssues = 0
  for (const s of sections) {
    totalIssues += s.count
  }
  md += `**Total:** ${totalIssues} issues across ${sections.length} sections\n`
  return md
}

// ─── CLI Program ─────────────────────────────────────────────────

const program = new Command()

program
  .name('jira-to-md')
  .description('Fetch Jira issues from sprints & backlog and save them as Markdown files')
  .version('2.0.0')

// ─── fetch command ───────────────────────────────────────────────

program
  .command('fetch')
  .description('Fetch issues from a Jira board (sprints + backlog) and export as Markdown')
  .option('-p, --project <key>', 'Jira project key — if omitted, select interactively')
  .option('-o, --output <dir>', 'Output directory for Markdown files')
  .option('-m, --max <number>', 'Maximum issues per sprint/backlog', '500')
  .option('--host <url>', 'Jira host URL (overrides JIRA_HOST env var)')
  .option('--email <email>', 'Jira email (overrides JIRA_EMAIL env var)')
  .option('--token <token>', 'Jira API token (overrides JIRA_TOKEN env var)')
  .action(async (opts) => {
    const { host, email, token } = resolveCredentials(opts)
    let projectKey = opts.project

    // ── Interactive project selection ──
    if (!projectKey) {
      console.log('')
      consola.start('Loading your Jira projects...\n')
      const projects = await fetchProjects(host, email, token)

      if (projects.length === 0) {
        consola.warn('No projects found on this Jira instance.')
        process.exit(0)
      }

      projectKey = await select({
        message: 'Select a Jira project:',
        choices: projects.map((p: any) => ({
          name: `${p.key.padEnd(12)} ${p.name}`,
          value: p.key,
        })),
      })
    }

    // ── Ask for output folder name ──
    const outputFolderName = await input({
      message: 'Output folder name:',
      default: opts.output || 'business',
    })
    const outputDir = path.resolve(outputFolderName)

    // ── Find the board for this project ──
    consola.start(`Finding boards for project: ${projectKey}...\n`)
    let boards: JiraBoard[]
    try {
      boards = await fetchBoards(host, email, token, projectKey)
    }
    catch {
      consola.warn('Could not fetch boards (Agile API may not be enabled). Falling back to flat issue fetch.')
      await flatFetch({ host, email, token, project: projectKey, output: outputFolderName, max: Number.parseInt(opts.max, 10) })
      return
    }

    if (boards.length === 0) {
      consola.warn('No boards found for this project. Falling back to flat issue fetch.')
      await flatFetch({ host, email, token, project: projectKey, output: outputFolderName, max: Number.parseInt(opts.max, 10) })
      return
    }

    let board: JiraBoard
    if (boards.length === 1) {
      board = boards[0]
    }
    else {
      const boardId = await select({
        message: 'Select a board:',
        choices: boards.map(b => ({
          name: `${b.name} (${b.type})`,
          value: b.id,
        })),
      })
      board = boards.find(b => b.id === boardId)!
    }

    consola.success(`Using board: ${board.name} (ID: ${board.id})\n`)

    // ── Fetch sprints ──
    consola.start('Fetching sprints...')
    let allSprints: JiraSprint[] = []
    try {
      allSprints = await fetchSprints(host, email, token, board.id)
    }
    catch (err: any) {
      consola.warn(`Could not fetch sprints: ${err.message}`)
    }

    // Sort: active first, then future, then closed
    const stateOrder: Record<string, number> = { active: 0, future: 1, closed: 2 }
    allSprints.sort((a, b) => (stateOrder[a.state] ?? 3) - (stateOrder[b.state] ?? 3))

    // ── Ask what to fetch ──
    const fetchMode = await select({
      message: 'What do you want to fetch?',
      choices: [
        { name: '🟢  Active sprints only', value: 'active' },
        { name: '🔵  Active + Future sprints', value: 'active+future' },
        { name: '📦  All sprints (Active + Future + Closed)', value: 'all' },
        { name: '📋  Backlog only', value: 'backlog' },
        { name: '🎯  Pick specific sprints', value: 'pick' },
      ],
    })

    let sprints: JiraSprint[] = []
    let includeBacklog = false

    if (fetchMode === 'active') {
      sprints = allSprints.filter(s => s.state === 'active')
      includeBacklog = false
    }
    else if (fetchMode === 'active+future') {
      sprints = allSprints.filter(s => s.state === 'active' || s.state === 'future')
      includeBacklog = false
    }
    else if (fetchMode === 'all') {
      sprints = allSprints
      includeBacklog = true
    }
    else if (fetchMode === 'backlog') {
      sprints = []
      includeBacklog = true
    }
    else if (fetchMode === 'pick') {
      // Let user pick specific sprints
      const sprintChoices = allSprints.map((s) => {
        const stateIcon = s.state === 'active' ? '🟢' : s.state === 'future' ? '🔵' : '⚪'
        const stateLabel = s.state.charAt(0).toUpperCase() + s.state.slice(1)
        return {
          name: `${stateIcon} ${s.name} (${stateLabel})`,
          value: s.id,
          checked: s.state === 'active', // pre-select active sprints
        }
      })

      // Add backlog as an option
      sprintChoices.push({
        name: '📋 Backlog',
        value: -1,
        checked: false,
      })

      const selectedIds = await checkbox({
        message: 'Select sprints to fetch:',
        choices: sprintChoices,
      })

      sprints = allSprints.filter(s => selectedIds.includes(s.id))
      includeBacklog = selectedIds.includes(-1)
    }

    const maxResults = Number.parseInt(opts.max, 10)

    // ── Clean & recreate output dir ──
    cleanOutputDir(outputDir)
    consola.info(`Cleaned output directory: ${outputDir}`)
    fs.mkdirSync(outputDir, { recursive: true })

    const sections: Array<{ name: string, folder: string, count: number }> = []
    let totalWritten = 0

    // ── Fetch issues per sprint ──
    for (const sprint of sprints) {
      const stateIcon = sprint.state === 'active' ? '🟢' : sprint.state === 'future' ? '🔵' : '⚪'
      const stateLabel = sprint.state.charAt(0).toUpperCase() + sprint.state.slice(1)
      consola.start(`${stateIcon} Fetching sprint: ${sprint.name} (${stateLabel})...`)

      try {
        const issues = await fetchSprintIssues(host, email, token, sprint.id, maxResults)

        if (issues.length === 0) {
          consola.info(`   (empty)`)
          continue
        }

        const folderName = sanitizeFolderName(`${sprint.name} (${stateLabel})`)
        const displayName = `${sprint.name} (${stateLabel})`
        const sprintDir = path.join(outputDir, folderName)
        const written = writeIssueFiles(issues, sprintDir)

        // Write sprint index
        const indexMd = generateSprintIndex(displayName, issues)
        fs.writeFileSync(path.join(sprintDir, 'INDEX.md'), indexMd, 'utf8')

        sections.push({ name: displayName, folder: folderName, count: issues.length })
        totalWritten += written
        consola.success(`   ${displayName}: ${written} issues`)
      }
      catch (err: any) {
        consola.warn(`   Failed to fetch sprint "${sprint.name}": ${err.message}`)
      }
    }

    // ── Fetch backlog ──
    if (includeBacklog) {
      consola.start('📋 Fetching backlog...')
      try {
        const backlogIssues = await fetchBacklogIssues(host, email, token, board.id, maxResults)

        // Filter out issues that are already in a sprint
        const sprintIssueKeys = new Set<string>()
        for (const section of sections) {
          const dir = path.join(outputDir, section.folder)
          if (fs.existsSync(dir)) {
            for (const file of fs.readdirSync(dir)) {
              if (file.endsWith('.md') && file !== 'INDEX.md') {
                sprintIssueKeys.add(file.replace('.md', ''))
              }
            }
          }
        }

        const pureBacklog = backlogIssues.filter(i => !sprintIssueKeys.has(i.key))

        if (pureBacklog.length > 0) {
          const backlogDir = path.join(outputDir, 'Backlog')
          const written = writeIssueFiles(pureBacklog, backlogDir)

          const indexMd = generateSprintIndex('Backlog', pureBacklog)
          fs.writeFileSync(path.join(backlogDir, 'INDEX.md'), indexMd, 'utf8')

          sections.push({ name: 'Backlog', folder: 'Backlog', count: pureBacklog.length })
          totalWritten += written
          consola.success(`   Backlog: ${written} issues`)
        }
        else {
          consola.info('   Backlog: (empty or all issues are in sprints)')
        }
      }
      catch (err: any) {
        consola.warn(`   Failed to fetch backlog: ${err.message}`)
      }
    }

    // ── Write main index ──
    const mainIndex = generateMainIndex(projectKey, sections)
    fs.writeFileSync(path.join(outputDir, 'INDEX.md'), mainIndex, 'utf8')

    console.log('')
    consola.box(`🎉 Done!\n\n${totalWritten} issues written to: ${outputDir}\n${sections.length} sections (sprints + backlog)\n📋 INDEX.md with board overview`)
    console.log('')
  })

// ─── list-projects command ───────────────────────────────────────

program
  .command('list-projects')
  .description('List all Jira projects you have access to')
  .option('--host <url>', 'Jira host URL (overrides JIRA_HOST env var)')
  .option('--email <email>', 'Jira email (overrides JIRA_EMAIL env var)')
  .option('--token <token>', 'Jira API token (overrides JIRA_TOKEN env var)')
  .action(async (opts) => {
    const { host, email, token } = resolveCredentials(opts)

    try {
      console.log('')
      consola.start('Fetching your Jira projects...\n')
      const projects = await fetchProjects(host, email, token)

      if (projects.length === 0) {
        consola.warn('No projects found.')
        return
      }

      console.log('  Available Projects:\n')
      for (const p of projects) {
        console.log(`  ${p.key.padEnd(12)} ${p.name}`)
      }
      console.log('')
    }
    catch (err: any) {
      consola.error(err.message || err)
      process.exit(1)
    }
  })

// ─── Flat fetch fallback (no board/sprint) ───────────────────────

async function flatFetch(opts: {
  host: string
  email: string
  token: string
  project: string
  output: string
  max: number
}) {
  const outputDir = path.resolve(opts.output)
  cleanOutputDir(outputDir)
  consola.info(`Cleaned output directory: ${outputDir}`)

  fs.mkdirSync(outputDir, { recursive: true })

  consola.start(`Fetching all issues from project: ${opts.project}...`)
  const issues = await fetchIssues({
    host: opts.host,
    email: opts.email,
    token: opts.token,
    projectKey: opts.project,
    maxResults: opts.max,
  })

  if (issues.length === 0) {
    consola.warn('No issues found.')
    return
  }

  consola.success(`Found ${issues.length} issue(s). Writing Markdown files...\n`)

  let written = 0
  for (const issue of issues) {
    const md = issueToMarkdown(issue)
    const filename = `${issue.key}.md`
    fs.writeFileSync(path.join(outputDir, filename), md, 'utf8')
    console.log(`   📄 ${filename}  —  ${issue.fields.summary}`)
    written++
  }

  const indexMd = generateSprintIndex(opts.project, issues)
  fs.writeFileSync(path.join(outputDir, 'INDEX.md'), indexMd, 'utf8')

  consola.success(`Done! ${written} files written to: ${outputDir}\n`)
}

// ─── Parse ───────────────────────────────────────────────────────

program.parse(process.argv)

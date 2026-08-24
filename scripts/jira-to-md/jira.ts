// ─── Jira Agile + REST API Client ────────────────────────────────
// Uses /rest/agile/1.0 for boards, sprints, backlogs
// Uses /rest/api/3/search/jql for issue search

/** Sub-task type names to exclude (case-insensitive) */
const SUBTASK_TYPES = new Set(['sub-task', 'subtask', 'sub task'])

/** Filter out subtasks and issues without a description */
function filterIssues(issues: JiraIssue[]): JiraIssue[] {
  return issues.filter((issue) => {
    const typeName = (issue.fields.issuetype?.name ?? '').toLowerCase()
    // Skip subtasks
    if (SUBTASK_TYPES.has(typeName))
      return false
    // Also check the subtask flag on the issuetype
    if ((issue.fields.issuetype as any)?.subtask === true)
      return false
    // Skip issues with no description
    if (!issue.fields.description)
      return false
    return true
  })
}

export interface FetchOptions {
  host: string
  email: string
  token: string
  projectKey: string
  maxResults: number
  statusFilter?: string
  typeFilter?: string
}

export interface JiraIssue {
  id: string
  key: string
  fields: {
    summary: string
    description: any
    status: { name: string }
    issuetype: { name: string }
    priority: { name: string } | null
    assignee: { displayName: string, emailAddress: string } | null
    reporter: { displayName: string, emailAddress: string } | null
    created: string
    updated: string
    duedate: string | null
    labels: string[]
    comment: {
      comments: Array<{
        author: { displayName: string }
        body: any
        created: string
      }>
    }
    subtasks: Array<{ key: string, fields: { summary: string, status: { name: string } } }>
    sprint?: { id: number, name: string, state: string } | null
    [key: string]: any
  }
}

export interface JiraBoard {
  id: number
  name: string
  type: string
  location?: {
    projectKey: string
    projectName: string
  }
}

export interface JiraSprint {
  id: number
  name: string
  state: string // active, closed, future
  startDate?: string
  endDate?: string
  goal?: string
}

export interface SprintWithIssues {
  sprint: JiraSprint | { id: 0, name: 'Backlog', state: 'backlog' }
  issues: JiraIssue[]
}

// ─── Helpers ─────────────────────────────────────────────────────

function makeAuth(email: string, token: string): string {
  return Buffer.from(`${email}:${token}`).toString('base64')
}

async function jiraGet(url: string, auth: string): Promise<any> {
  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    const body = await res.text()
    let parsed: any
    try { parsed = JSON.parse(body) }
    catch {}
    const msg = parsed?.errorMessages?.join(', ') || parsed?.message || body
    const err = new Error(`Jira API error (${res.status}): ${msg}`) as any
    err.status = res.status
    throw err
  }

  return res.json()
}

// ─── Board Discovery ─────────────────────────────────────────────

export async function fetchBoards(host: string, email: string, token: string, projectKey: string): Promise<JiraBoard[]> {
  const auth = makeAuth(email, token)
  const url = `${host}/rest/agile/1.0/board?projectKeyOrId=${projectKey}&maxResults=50`
  const data = await jiraGet(url, auth)
  return (data.values ?? []) as JiraBoard[]
}

// ─── Sprint Discovery ────────────────────────────────────────────

export async function fetchSprints(host: string, email: string, token: string, boardId: number): Promise<JiraSprint[]> {
  const auth = makeAuth(email, token)
  const allSprints: JiraSprint[] = []
  let startAt = 0

  while (true) {
    const url = `${host}/rest/agile/1.0/board/${boardId}/sprint?maxResults=50&startAt=${startAt}`
    const data = await jiraGet(url, auth)
    const sprints = (data.values ?? []) as JiraSprint[]

    if (sprints.length === 0)
      break

    allSprints.push(...sprints)
    startAt += sprints.length

    if (data.isLast !== false)
      break
  }

  return allSprints
}

// ─── Sprint Issues ───────────────────────────────────────────────

export async function fetchSprintIssues(host: string, email: string, token: string, sprintId: number, maxResults = 500): Promise<JiraIssue[]> {
  const auth = makeAuth(email, token)
  const allIssues: JiraIssue[] = []
  let startAt = 0

  while (startAt < 10000) {
    const url = `${host}/rest/agile/1.0/sprint/${sprintId}/issue?maxResults=50&startAt=${startAt}&fields=summary,description,status,issuetype,priority,assignee,reporter,created,updated,duedate,labels,comment,subtasks,fixVersions,components,sprint`
    const data = await jiraGet(url, auth)
    const rawIssues = (data.issues ?? []) as JiraIssue[]
    const filtered = filterIssues(rawIssues)

    if (rawIssues.length === 0)
      break

    allIssues.push(...filtered)
    startAt += rawIssues.length

    if (startAt >= (data.total ?? 0))
      break
  }

  return allIssues
}

// ─── Backlog Issues ──────────────────────────────────────────────

export async function fetchBacklogIssues(host: string, email: string, token: string, boardId: number, maxResults = 500): Promise<JiraIssue[]> {
  const auth = makeAuth(email, token)
  const allIssues: JiraIssue[] = []
  let startAt = 0

  while (startAt < 10000) {
    const url = `${host}/rest/agile/1.0/board/${boardId}/backlog?maxResults=50&startAt=${startAt}&fields=summary,description,status,issuetype,priority,assignee,reporter,created,updated,duedate,labels,comment,subtasks,fixVersions,components,sprint`
    const data = await jiraGet(url, auth)
    const rawIssues = (data.issues ?? []) as JiraIssue[]
    const filtered = filterIssues(rawIssues)

    if (rawIssues.length === 0)
      break

    allIssues.push(...filtered)
    startAt += rawIssues.length

    if (startAt >= (data.total ?? 0))
      break
  }

  return allIssues
}

// ─── Flat issue search (legacy, kept as fallback) ────────────────

export async function fetchIssues(opts: FetchOptions): Promise<JiraIssue[]> {
  const { host, email, token, projectKey, maxResults, statusFilter, typeFilter } = opts
  const auth = makeAuth(email, token)

  const conditions: string[] = [`project = "${projectKey}"`]
  if (statusFilter)
    conditions.push(`status = "${statusFilter}"`)
  if (typeFilter)
    conditions.push(`issuetype = "${typeFilter}"`)
  const jql = `${conditions.join(' AND ')} ORDER BY created DESC`

  const fields = 'summary,description,status,issuetype,priority,assignee,reporter,created,updated,duedate,labels,comment,subtasks,fixVersions,components,sprint'

  const allIssues: JiraIssue[] = []
  let nextPageToken: string | undefined

  while (allIssues.length < maxResults) {
    const url = new URL(`${host}/rest/api/3/search/jql`)
    url.searchParams.set('jql', jql)
    url.searchParams.set('fields', fields)
    url.searchParams.set('maxResults', String(Math.min(100, maxResults - allIssues.length)))
    if (nextPageToken)
      url.searchParams.set('nextPageToken', nextPageToken)

    const data = await jiraGet(url.toString(), auth)
    const issues = (data.issues ?? []) as JiraIssue[]

    if (issues.length === 0)
      break

    allIssues.push(...issues)

    if (data.nextPageToken)
      nextPageToken = data.nextPageToken
    else
      break
  }

  return allIssues
}

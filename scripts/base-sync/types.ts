// ─── Base-Sync Types ─────────────────────────────────────────────

export type ProjectRole = 'base' | 'child'
export type SyncStrategy = 'merge' | 'patch' | 'overwrite'
export type FileStatus = 'added' | 'modified' | 'deleted' | 'unchanged'
export type ApplyMode = 'new-branch' | 'existing-branch' | 'ref-folder' | 'merge-ref-folder'
export type Direction = 'base-to-project' | 'project-to-base'

export interface BaseSyncConfig {
  role: ProjectRole
  base: string | null
  exclude: string[]
  defaultBranch: string
  registry: string
  github: {
    org: string
    useCLI: boolean
  }
  lastSync?: string
  baseBranch?: string
}

export interface FileChange {
  relativePath: string
  status: FileStatus
  linesAdded: number
  linesRemoved: number
  sizeBase: number
  sizeChild: number
}

export interface DiffResult {
  added: FileChange[]
  modified: FileChange[]
  deleted: FileChange[]
  unchanged: string[]
  summary: {
    totalFiles: number
    addedCount: number
    modifiedCount: number
    deletedCount: number
    unchangedCount: number
    totalLinesAdded: number
    totalLinesRemoved: number
  }
}

export interface RegistryEntry {
  name: string
  path: string
  remote?: string
  branch: string
  lastSync: string
  driftScore: number
  createdAt: string
}

export interface Registry {
  baseProject: string
  children: RegistryEntry[]
}

export interface ScaffoldOptions {
  name: string
  output: string
  gitInit: boolean
  push: boolean
  branch: string
  dryRun: boolean
  exclude: string[]
}

export interface DiffOptions {
  base: string
  output: string
  branch?: string
  report: boolean
  addedOnly: boolean
  modifiedOnly: boolean
  deletedOnly: boolean
  push: boolean
  interactive: boolean
  dryRun: boolean
  localOnly: boolean
  specificPaths?: string[]
}

export interface SyncOptions {
  base: string
  strategy: SyncStrategy
  dryRun: boolean
  localOnly: boolean
  exclude: string[]
  specificPaths?: string[]
}

export interface StatusOptions {
  base: string
  json: boolean
  specificPaths?: string[]
}

export interface GitHubRepo {
  name: string
  url: string
  description: string
  isPrivate: boolean
}

export interface BranchInfo {
  name: string
  current: boolean
  isRemote: boolean
}

export interface LocalProject {
  name: string
  path: string
  hasGit: boolean
  hasBaseSyncConfig: boolean
  role?: ProjectRole
}

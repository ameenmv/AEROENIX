import type { FileChange } from '../types'

// ─── File Categorization & Risk Assessment ───────────────────────

export type RiskLevel = 'high' | 'medium' | 'low'

export interface FileCategory {
  label: string
  icon: string
  risk: RiskLevel
  patterns: (string | RegExp)[]
}

export interface CategorizedChanges {
  category: FileCategory
  files: FileChange[]
  totalLinesAdded: number
  totalLinesRemoved: number
}

// ─── Category Definitions ────────────────────────────────────────

const CATEGORIES: FileCategory[] = [
  {
    label: 'Router / Navigation',
    icon: '',
    risk: 'high',
    patterns: ['router/', 'config/navigation', /\.routes?\./],
  },
  {
    label: 'Config / Environment',
    icon: '',
    risk: 'high',
    patterns: ['config/', '.env', /vite\.config/, /tsconfig/, /eslint/],
  },
  {
    label: 'API Services',
    icon: '',
    risk: 'high',
    patterns: ['services/', /endpoints\.ts/],
  },
  {
    label: 'State Management',
    icon: '',
    risk: 'high',
    patterns: ['stores/'],
  },
  {
    label: 'Composables / Hooks',
    icon: '',
    risk: 'medium',
    patterns: ['composables/'],
  },
  {
    label: 'Components',
    icon: '',
    risk: 'medium',
    patterns: ['components/'],
  },
  {
    label: 'Views / Pages',
    icon: '',
    risk: 'medium',
    patterns: ['views/'],
  },
  {
    label: 'Modules (schema/routes)',
    icon: '',
    risk: 'medium',
    patterns: ['modules/'],
  },
  {
    label: 'Translations (i18n)',
    icon: '',
    risk: 'low',
    patterns: ['i18n/', 'locales/'],
  },
  {
    label: 'Types / Interfaces',
    icon: '',
    risk: 'low',
    patterns: ['types/', /\.d\.ts$/],
  },
  {
    label: 'Styles (CSS)',
    icon: '',
    risk: 'low',
    patterns: [/\.css$/, /\.scss$/, /style\./],
  },
  {
    label: 'Scripts / Tooling',
    icon: '',
    risk: 'low',
    patterns: ['scripts/', /\.sh$/],
  },
  {
    label: 'Documentation',
    icon: '',
    risk: 'low',
    patterns: [/\.md$/, 'docs/'],
  },
  {
    label: 'Tests',
    icon: '',
    risk: 'low',
    patterns: [/\.test\./, /\.spec\./, '__tests__/'],
  },
  {
    label: 'Assets / Static',
    icon: '',
    risk: 'low',
    patterns: ['public/', 'assets/', /\.(png|jpg|svg|ico|woff|woff2|ttf|eot)$/],
  },
  {
    label: 'Package / Dependencies',
    icon: '',
    risk: 'medium',
    patterns: [/package\.json$/, /bun\.lock$/, /yarn\.lock$/, /pnpm-lock/],
  },
]

const UNCATEGORIZED: FileCategory = {
  label: 'Other Files',
  icon: '',
  risk: 'low',
  patterns: [],
}

// ─── Risk Weights for Merge Analysis ─────────────────────────────

export const RISK_WEIGHTS: Record<RiskLevel, number> = {
  high: 4.0,
  medium: 2.0,
  low: 0.5,
}

// ─── Categorization Logic ────────────────────────────────────────

function matchesCategory(filePath: string, category: FileCategory): boolean {
  return category.patterns.some((pattern) => {
    if (typeof pattern === 'string') {
      return filePath.includes(pattern)
    }
    return pattern.test(filePath)
  })
}

function categorizeFile(file: FileChange): FileCategory {
  for (const category of CATEGORIES) {
    if (matchesCategory(file.relativePath, category)) {
      return category
    }
  }
  return UNCATEGORIZED
}

/**
 * Group file changes into categories with aggregated stats
 */
export function categorizeChanges(files: FileChange[]): CategorizedChanges[] {
  const groups = new Map<string, CategorizedChanges>()

  for (const file of files) {
    const category = categorizeFile(file)
    const key = category.label

    if (!groups.has(key)) {
      groups.set(key, {
        category,
        files: [],
        totalLinesAdded: 0,
        totalLinesRemoved: 0,
      })
    }

    const group = groups.get(key)!
    group.files.push(file)
    group.totalLinesAdded += file.linesAdded
    group.totalLinesRemoved += file.linesRemoved
  }

  // Sort by risk (high → low), then by file count
  const riskOrder: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 }

  return Array.from(groups.values()).sort((a, b) => {
    const riskDiff = riskOrder[a.category.risk] - riskOrder[b.category.risk]
    if (riskDiff !== 0)
      return riskDiff
    return b.files.length - a.files.length
  })
}

/**
 * Calculate a weighted risk score for a single file
 * Returns a number where higher = riskier
 */
export function calculateFileRisk(file: FileChange): number {
  const category = categorizeFile(file)
  const weight = RISK_WEIGHTS[category.risk]
  const changeMagnitude = file.linesAdded + file.linesRemoved
  return changeMagnitude * weight
}

/**
 * Determine if a file change is safe to auto-merge
 * Uses weighted risk instead of naive line count
 */
export function isSafeToAutoMerge(file: FileChange, threshold = 20): boolean {
  return calculateFileRisk(file) < threshold
}

/**
 * Get the risk level badge string
 */
export function getRiskBadge(risk: RiskLevel): string {
  switch (risk) {
    case 'high': return '[!!!]'
    case 'medium': return '[!!]'
    case 'low': return '[.]'
  }
}

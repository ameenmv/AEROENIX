#!/usr/bin/env bun
/**
 * svg-to-vue/index.ts
 *
 * Converts SVG files into Vue SFC icon components with props for size & color.
 * Can source SVGs from:
 *   - public/icons/            (active project icons)
 *   - .unused-assets/          (previously moved unused assets)
 *   - Any custom path
 *
 * Generated components go to: src/components/icons/
 *
 * Features:
 *   - Smart SVG cleanup (strips hardcoded dimensions, applies currentColor)
 *   - Generates Vue 3 SFC with size/color props
 *   - Auto-creates barrel export (index.ts)
 *   - Finds & replaces <img src="/icons/..."> usages with the new component
 *   - Interactive mode: pick which SVGs to convert
 *
 * Usage:
 *   bun scripts/svg-to-vue/index.ts                    # Interactive mode
 *   bun scripts/svg-to-vue/index.ts --all              # Convert all SVGs found
 *   bun scripts/svg-to-vue/index.ts --source <path>    # Custom source folder
 *   bun scripts/svg-to-vue/index.ts --report           # Report only, no conversion
 *   bun scripts/svg-to-vue/index.ts --refactor         # Also refactor <img> usages
 *   bun scripts/svg-to-vue/index.ts --analyze          # Analyze existing icon components
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import chalk from 'chalk'
import fg from 'fast-glob'
import { renderAnimatedLogo } from '../neop-logo/index'

// ── Types ─────────────────────────────────────────────────────────

interface SvgFile {
  /** Absolute path to the SVG */
  absolutePath: string
  /** Relative path from source dir */
  relativePath: string
  /** Original filename */
  filename: string
  /** File size in bytes */
  sizeBytes: number
  /** The raw SVG markup */
  rawContent: string
  /** Generated component name (PascalCase + Icon suffix) */
  componentName: string
  /** Output path for the Vue SFC */
  outputPath: string
  /** Whether a component already exists for this SVG */
  alreadyConverted: boolean
}

interface RefactorMatch {
  file: string
  line: number
  original: string
  replacement: string
  svgPath: string
  componentName: string
}

// ── Config ────────────────────────────────────────────────────────

const ROOT = process.cwd()
const OUTPUT_DIR = path.join(ROOT, 'src/components/icons')
const DEFAULT_SOURCES = [
  'public/icons',
  '.unused-assets/public/icons',
  'src/assets',
  '.unused-assets/src/assets',
]

// ── Helpers ───────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)
  return `${size} ${units[i]}`
}

/**
 * Converts a filename like "Guard-Male.svg" or "arrow_icon.svg"
 * into PascalCase component name with "Icon" suffix: "GuardMaleIcon"
 */
function toComponentName(filename: string): string {
  const base = filename
    .replace(/\.svg$/i, '')
    .replace(/[-_\s]+/g, '-') // normalize separators
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')

  // Ensure it ends with "Icon" for clarity
  return base.endsWith('Icon') ? base : `${base}Icon`
}

/**
 * Clean and optimize SVG for inline Vue component usage.
 * - Strip width/height from root <svg> (we'll use props instead)
 * - Replace hardcoded fill/stroke colors with currentColor
 *   (smart: preserves colors inside <defs> for gradients/patterns)
 * - Remove XML declarations & comments
 */
function cleanSvg(raw: string): {
  cleaned: string
  viewBox: string
  hasGradients: boolean
  originalWidth: string | null
  originalHeight: string | null
} {
  let svg = raw.trim()

  // Remove XML declaration
  svg = svg.replace(/<\?xml[^?]*\?>\s*/gi, '')
  // Remove comments
  svg = svg.replace(/<!--[\s\S]*?-->/g, '')
  // Remove extra whitespace/newlines
  svg = svg.replace(/\n\s*\n/g, '\n')

  // Extract viewBox
  const viewBoxMatch = svg.match(/viewBox=["']([^"']+)["']/)
  let viewBox = viewBoxMatch?.[1] ?? ''

  // Extract original width/height
  const widthMatch = svg.match(/<svg[^>]*\bwidth=["']([^"']+)["']/)
  const heightMatch = svg.match(/<svg[^>]*\bheight=["']([^"']+)["']/)
  const originalWidth = widthMatch?.[1] ?? null
  const originalHeight = heightMatch?.[1] ?? null

  // If no viewBox, try to construct one from width/height
  if (!viewBox && originalWidth && originalHeight) {
    const w = parseFloat(originalWidth)
    const h = parseFloat(originalHeight)
    if (!isNaN(w) && !isNaN(h)) {
      viewBox = `0 0 ${w} ${h}`
    }
  }
  if (!viewBox) {
    viewBox = '0 0 24 24' // fallback
  }

  // Strip width/height from <svg> tag
  svg = svg.replace(/(<svg[^>]*)\s+width=["'][^"']*["']/i, '$1')
  svg = svg.replace(/(<svg[^>]*)\s+height=["'][^"']*["']/i, '$1')

  // Check for gradients (we protect colors inside <defs> since gradients use stop-color)
  const hasGradients = /gradient|url\(#/i.test(svg)

  // Replace hardcoded colors with currentColor — but protect <defs> content
  // Strategy: extract <defs>, replace colors in the rest, then stitch back
  const defsMatch = svg.match(/(<defs>[\s\S]*?<\/defs>)/i)
  const defsBlock = defsMatch?.[1] ?? ''
  let svgWithoutDefs = defsBlock ? svg.replace(defsBlock, '___DEFS_PLACEHOLDER___') : svg

  // Replace fill colors (but not fill="none" or fill="url(...)")
  svgWithoutDefs = svgWithoutDefs.replace(/fill=["'](?!none["']|url)[^"']*["']/gi, 'fill="currentColor"')
  // Replace stroke colors (but not stroke="none" or stroke="url(...)")
  svgWithoutDefs = svgWithoutDefs.replace(/stroke=["'](?!none["']|url)[^"']*["']/gi, 'stroke="currentColor"')

  // Stitch defs back
  svg = defsBlock ? svgWithoutDefs.replace('___DEFS_PLACEHOLDER___', defsBlock) : svgWithoutDefs

  // Ensure viewBox is set on <svg>
  if (!svg.includes('viewBox')) {
    svg = svg.replace(/<svg/, `<svg viewBox="${viewBox}"`)
  }

  return { cleaned: svg, viewBox, hasGradients, originalWidth, originalHeight }
}

/**
 * Generate the Vue SFC content for an icon component.
 */
function generateVueComponent(svg: SvgFile, cleanedSvg: string, viewBox: string, hasGradients: boolean): string {
  // Extract inner content of <svg> tag
  const innerMatch = cleanedSvg.match(/<svg[^>]*>([\s\S]*)<\/svg>/i)
  const innerContent = innerMatch?.[1]?.trim() ?? ''

  // Extract <svg> attributes (minus viewBox, width, height, xmlns)
  const svgTagMatch = cleanedSvg.match(/<svg([^>]*)>/)
  let extraAttrs = svgTagMatch?.[1] ?? ''
  extraAttrs = extraAttrs
    .replace(/\s*viewBox=["'][^"']*["']/i, '')
    .replace(/\s*xmlns=["'][^"']*["']/i, '')
    .replace(/\s*width=["'][^"']*["']/i, '')
    .replace(/\s*height=["'][^"']*["']/i, '')
    .replace(/\s*fill=["']none["']/i, '')
    .trim()

  const fillAttr = hasGradients
    ? '' // Gradients define their own fills
    : '\n      fill="none"'

  const extraAttrStr = extraAttrs ? `\n      ${extraAttrs}` : ''

  return `<script setup lang="ts">
/**
 * ${svg.componentName}
 * Auto-generated from: ${svg.relativePath}
 * Use: <${svg.componentName} /> or <${svg.componentName} :size="32" color="red" />
 */
withDefaults(defineProps<{
  /** Icon size in pixels (applied to both width and height) */
  size?: number | string
  /** Icon color — uses currentColor by default, inheriting from parent */
  color?: string
}>(), {
  size: 24,
  color: 'currentColor',
})
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="${viewBox}"${fillAttr}${extraAttrStr}
    :style="{ color }"
  >
    ${innerContent}
  </svg>
</template>
`
}

// ── Core: Discover SVGs ───────────────────────────────────────────

async function discoverSvgs(sourceDirs: string[]): Promise<SvgFile[]> {
  const svgs: SvgFile[] = []
  const seenNames = new Set<string>()

  for (const dir of sourceDirs) {
    const absDir = path.join(ROOT, dir)
    if (!fs.existsSync(absDir)) continue

    const files = await fg(['**/*.svg'], {
      cwd: absDir,
      absolute: false,
      dot: false,
      onlyFiles: true,
    })

    for (const file of files) {
      const absolutePath = path.join(absDir, file)
      const filename = path.basename(file)
      const componentName = toComponentName(filename)

      // Skip duplicates (prefer first found)
      if (seenNames.has(componentName)) continue
      seenNames.add(componentName)

      const stat = fs.statSync(absolutePath)
      const rawContent = fs.readFileSync(absolutePath, 'utf-8')
      const outputPath = path.join(OUTPUT_DIR, `${componentName}.vue`)

      svgs.push({
        absolutePath,
        relativePath: path.relative(ROOT, absolutePath),
        filename,
        sizeBytes: stat.size,
        rawContent,
        componentName,
        outputPath,
        alreadyConverted: fs.existsSync(outputPath),
      })
    }
  }

  return svgs
}

// ── Core: Convert SVGs to Vue Components ──────────────────────────

function convertSvgs(svgs: SvgFile[]): { converted: number; skipped: number; convertedSvgs: SvgFile[] } {
  let converted = 0
  let skipped = 0
  const convertedSvgs: SvgFile[] = []

  // Ensure output dir exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  for (const svg of svgs) {
    if (svg.alreadyConverted) {
      console.log(`  ${chalk.dim('⊘')} Exists: ${chalk.dim(svg.componentName + '.vue')}`)
      skipped++
      continue
    }

    const { cleaned, viewBox, hasGradients } = cleanSvg(svg.rawContent)
    const vueContent = generateVueComponent(svg, cleaned, viewBox, hasGradients)

    fs.writeFileSync(svg.outputPath, vueContent, 'utf-8')
    console.log(`  ${chalk.green('✓')} Created: ${chalk.white.bold(svg.componentName + '.vue')} ${chalk.dim(`← ${svg.filename}`)}`)
    convertedSvgs.push(svg)
    converted++
  }

  return { converted, skipped, convertedSvgs }
}

// ── Core: Delete Source SVGs After Conversion ─────────────────────

function deleteSources(svgs: SvgFile[]): number {
  let deleted = 0

  for (const svg of svgs) {
    try {
      if (fs.existsSync(svg.absolutePath)) {
        fs.unlinkSync(svg.absolutePath)
        console.log(`  ${chalk.red('✗')} Deleted source: ${chalk.dim(svg.relativePath)}`)
        deleted++
      }
    } catch {
      console.log(`  ${chalk.yellow('⚠')} Could not delete: ${chalk.dim(svg.relativePath)}`)
    }
  }

  // Clean up empty directories
  const affectedDirs = new Set(svgs.map(s => path.dirname(s.absolutePath)))
  for (const dir of [...affectedDirs].sort((a, b) => b.length - a.length)) {
    try {
      const entries = fs.readdirSync(dir)
      if (entries.length === 0) {
        fs.rmdirSync(dir)
        console.log(`  ${chalk.dim('🗂️  Removed empty directory:')} ${chalk.dim(path.relative(ROOT, dir))}`)
      }
    } catch {
      // ignore
    }
  }

  return deleted
}

// ── Core: Generate Barrel Export ──────────────────────────────────

function generateBarrelExport(svgs: SvgFile[]): void {
  const indexPath = path.join(OUTPUT_DIR, 'index.ts')

  // Find all existing .vue files in the output dir
  const existingVueFiles = fs.existsSync(OUTPUT_DIR)
    ? fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.vue'))
    : []

  // Combine with newly created
  const allComponents = new Set<string>()
  for (const file of existingVueFiles) {
    allComponents.add(file.replace('.vue', ''))
  }
  for (const svg of svgs) {
    if (fs.existsSync(svg.outputPath)) {
      allComponents.add(svg.componentName)
    }
  }

  const sorted = [...allComponents].sort()

  const lines = [
    '/**',
    ' * Auto-generated barrel export for icon components.',
    ` * Generated: ${new Date().toISOString()}`,
    ` * Total icons: ${sorted.length}`,
    ' *',
    ' * Usage:',
    " *   import { ArrowIcon, HomeIcon } from '@/components/icons'",
    ' */',
    '',
    ...sorted.map(name => `export { default as ${name} } from './${name}.vue'`),
    '',
  ]

  fs.writeFileSync(indexPath, lines.join('\n'), 'utf-8')
  console.log(`  ${chalk.green('✓')} Barrel export: ${chalk.cyan('src/components/icons/index.ts')} ${chalk.dim(`(${sorted.length} icons)`)}`)
}

// ── Core: Find & Refactor Usages ──────────────────────────────────

async function findRefactorTargets(svgs: SvgFile[]): Promise<RefactorMatch[]> {
  const matches: RefactorMatch[] = []

  const sourceFiles = await fg(['src/**/*.vue'], {
    cwd: ROOT,
    absolute: false,
    dot: false,
    ignore: ['**/components/icons/**'],
  })

  // Build a lookup from svg path patterns to component name
  const pathToComponent = new Map<string, string>()
  for (const svg of svgs) {
    const filename = svg.filename
    // Match patterns like: /icons/arrow.svg, icons/arrow.svg
    pathToComponent.set(`/icons/${filename}`, svg.componentName)
    pathToComponent.set(`icons/${filename}`, svg.componentName)
    // Also for assets
    pathToComponent.set(`/assets/${filename}`, svg.componentName)
    pathToComponent.set(`assets/${filename}`, svg.componentName)
    pathToComponent.set(`@/assets/${filename}`, svg.componentName)
  }

  for (const file of sourceFiles) {
    const content = fs.readFileSync(path.join(ROOT, file), 'utf-8')
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Match <img src="/icons/something.svg" ...>
      const imgMatch = line.match(/<img[^>]*\bsrc=["']([^"']*\.svg)["'][^>]*\/?>/i)
      if (imgMatch) {
        const srcPath = imgMatch[1]

        for (const [pattern, componentName] of pathToComponent) {
          if (srcPath.includes(pattern) || srcPath === pattern) {
            // Build replacement: extract class and other attributes
            const classMatch = imgMatch[0].match(/\bclass=["']([^"']*)["']/)
            const classAttr = classMatch ? ` class="${classMatch[1]}"` : ''

            matches.push({
              file,
              line: i + 1,
              original: imgMatch[0],
              replacement: `<${componentName}${classAttr} />`,
              svgPath: srcPath,
              componentName,
            })
            break
          }
        }
      }

      // Match :src="'/icons/something.svg'" or src binding with interpolation
      const bindMatch = line.match(/:src=["']([^"']*\.svg)["']/i)
      if (bindMatch) {
        const srcPath = bindMatch[1]
        for (const [pattern, componentName] of pathToComponent) {
          if (srcPath.includes(pattern)) {
            matches.push({
              file,
              line: i + 1,
              original: line.trim(),
              replacement: `<!-- TODO: Replace with <${componentName} /> -->`,
              svgPath: srcPath,
              componentName,
            })
            break
          }
        }
      }
    }
  }

  return matches
}

function applyRefactoring(matches: RefactorMatch[]): number {
  // Group matches by file
  const byFile = new Map<string, RefactorMatch[]>()
  for (const m of matches) {
    const existing = byFile.get(m.file) ?? []
    existing.push(m)
    byFile.set(m.file, existing)
  }

  let totalReplaced = 0

  for (const [file, fileMatches] of byFile) {
    const filePath = path.join(ROOT, file)
    let content = fs.readFileSync(filePath, 'utf-8')

    // Check which component imports are needed
    const neededImports = new Set<string>()

    for (const match of fileMatches) {
      if (content.includes(match.original)) {
        content = content.replace(match.original, match.replacement)
        neededImports.add(match.componentName)
        totalReplaced++
        console.log(`  ${chalk.green('✓')} ${chalk.dim(`${file}:${match.line}`)} ${chalk.red(match.original.substring(0, 50))} ${chalk.dim('→')} ${chalk.green(match.replacement)}`)
      }
    }

    // Add import if needed (check if not already imported)
    if (neededImports.size > 0) {
      const importNames = [...neededImports].sort().join(', ')
      const importLine = `import { ${importNames} } from '@/components/icons'`

      if (!content.includes(importLine) && !content.includes('@/components/icons')) {
        // Insert after <script setup> tag
        content = content.replace(
          /(<script[^>]*>)\n/,
          `$1\n${importLine}\n`,
        )
      }
    }

    fs.writeFileSync(filePath, content, 'utf-8')
  }

  return totalReplaced
}

// ── Core: Analyze Existing Icon Components ────────────────────────

async function analyzeExistingIcons(): Promise<void> {
  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log(chalk.dim('  No icon components found yet.'))
    return
  }

  const vueFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.vue'))
  if (vueFiles.length === 0) {
    console.log(chalk.dim('  No icon components found yet.'))
    return
  }

  console.log(chalk.bold.cyan('  ┌─────────────────────────────────────────────────────────┐'))
  console.log(chalk.bold.cyan('  │') + chalk.bold('   📋  Existing Icon Components                           ') + chalk.bold.cyan('│'))
  console.log(chalk.bold.cyan('  └─────────────────────────────────────────────────────────┘'))
  console.log()

  // Check usage of each component
  const sourceFiles = await fg(['src/**/*.{vue,ts,tsx}'], {
    cwd: ROOT,
    absolute: false,
    dot: false,
    ignore: ['**/components/icons/**', '**/*.d.ts'],
  })

  const sourceContents = new Map<string, string>()
  for (const f of sourceFiles) {
    sourceContents.set(f, fs.readFileSync(path.join(ROOT, f), 'utf-8'))
  }

  let usedCount = 0
  let unusedCount = 0

  for (const file of vueFiles.sort()) {
    const componentName = file.replace('.vue', '')
    const stat = fs.statSync(path.join(OUTPUT_DIR, file))

    // Search for usage
    const usages: string[] = []
    for (const [srcFile, content] of sourceContents) {
      if (content.includes(componentName)) {
        usages.push(srcFile)
      }
    }

    if (usages.length > 0) {
      usedCount++
      console.log(`  ${chalk.green('●')} ${chalk.white.bold(componentName)} ${chalk.dim(`(${formatSize(stat.size)})`)}`)
      for (const u of usages.slice(0, 3)) {
        console.log(`    ${chalk.dim('└─')} ${chalk.cyan(u)}`)
      }
      if (usages.length > 3) {
        console.log(`    ${chalk.dim(`   ... and ${usages.length - 3} more`)}`)
      }
    } else {
      unusedCount++
      console.log(`  ${chalk.red('○')} ${chalk.dim(componentName)} ${chalk.dim(`(${formatSize(stat.size)})`)} ${chalk.red('— unused')}`)
    }
  }

  console.log()
  console.log(chalk.dim('  ─────────────────────────────────────────────────────────'))
  console.log(`  ${chalk.bold('Total')}     ${chalk.white.bold(vueFiles.length)} icon components`)
  console.log(`  ${chalk.green('Used')}      ${chalk.green.bold(usedCount)}`)
  console.log(`  ${chalk.red('Unused')}    ${chalk.red.bold(unusedCount)}`)
  console.log(chalk.dim('  ─────────────────────────────────────────────────────────'))
  console.log()
}

// ── Display ───────────────────────────────────────────────────────

function printDiscoveredSvgs(svgs: SvgFile[]): void {
  console.log(chalk.bold.cyan('  ┌─────────────────────────────────────────────────────────┐'))
  console.log(chalk.bold.cyan('  │') + chalk.bold(`   📦  Discovered SVGs (${svgs.length} files)`) + ' '.repeat(Math.max(0, 35 - String(svgs.length).length)) + chalk.bold.cyan('│'))
  console.log(chalk.bold.cyan('  └─────────────────────────────────────────────────────────┘'))
  console.log()

  const totalSize = svgs.reduce((sum, s) => sum + s.sizeBytes, 0)
  const newCount = svgs.filter(s => !s.alreadyConverted).length
  const existingCount = svgs.filter(s => s.alreadyConverted).length

  console.log(`  ${chalk.bold('Total')}         ${chalk.white.bold(svgs.length)} SVGs  ${chalk.dim(`(${formatSize(totalSize)})`)}`)
  console.log(`  ${chalk.green('New')}           ${chalk.green.bold(newCount)} ${chalk.dim('to convert')}`)
  console.log(`  ${chalk.dim('Existing')}      ${chalk.dim(String(existingCount))} ${chalk.dim('already converted')}`)
  console.log()

  for (const svg of svgs.sort((a, b) => a.componentName.localeCompare(b.componentName))) {
    const status = svg.alreadyConverted ? chalk.dim('⊘') : chalk.green('●')
    const name = svg.alreadyConverted ? chalk.dim(svg.componentName) : chalk.white.bold(svg.componentName)
    console.log(`  ${status} ${name} ${chalk.dim(`← ${svg.relativePath}`)} ${chalk.dim(`(${formatSize(svg.sizeBytes)})`)}`)
  }
  console.log()
}

// ── Main ──────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const isAll = args.includes('--all')
  const isReport = args.includes('--report')
  const isRefactor = args.includes('--refactor')
  const isAnalyze = args.includes('--analyze')
  const sourceIdx = args.indexOf('--source')
  const customSource = sourceIdx >= 0 ? args[sourceIdx + 1] : null

  // Show the NEOP logo animation
  await renderAnimatedLogo()

  console.log(chalk.bold.cyan('  ┌─────────────────────────────────────────────────────────┐'))
  console.log(chalk.bold.cyan('  │') + chalk.bold('   🎨  SVG → Vue Component Converter                      ') + chalk.bold.cyan('│'))
  console.log(chalk.bold.cyan('  │') + chalk.dim('   Convert SVG files into reusable Vue icon components     ') + chalk.bold.cyan('│'))
  console.log(chalk.bold.cyan('  └─────────────────────────────────────────────────────────┘'))
  console.log()

  // Analyze existing icons
  if (isAnalyze) {
    await analyzeExistingIcons()
    return
  }

  // Determine source dirs
  const sourceDirs = customSource ? [customSource] : DEFAULT_SOURCES

  console.log(chalk.dim('  Scanning for SVGs in:'))
  for (const dir of sourceDirs) {
    const exists = fs.existsSync(path.join(ROOT, dir))
    console.log(`    ${exists ? chalk.green('✓') : chalk.red('✗')} ${dir}/`)
  }
  console.log()

  // Step 1: Discover
  console.log(`  ${chalk.cyan('›')} ${chalk.bold('Discovering SVG files...')}`)
  const svgs = await discoverSvgs(sourceDirs)

  if (svgs.length === 0) {
    console.log(chalk.yellow('  ⚠ No SVG files found in any source directory.'))
    console.log(chalk.dim(`  Searched: ${sourceDirs.join(', ')}`))
    return
  }

  console.log(`  ${chalk.green('✓')} Found ${chalk.bold(String(svgs.length))} SVGs`)
  console.log()

  // Show report
  printDiscoveredSvgs(svgs)

  // Report-only mode
  if (isReport) {
    console.log(chalk.dim('  ℹ️  Report mode — no files were created.'))
    console.log(chalk.dim('  Run without --report to convert SVGs to Vue components.'))
    console.log()
    return
  }

  // Select which SVGs to convert
  let toConvert: SvgFile[]

  if (isAll) {
    toConvert = svgs.filter(s => !s.alreadyConverted)
  } else {
    // Interactive selection
    const { checkbox, select } = await import('@inquirer/prompts')

    const action = await select({
      message: 'What would you like to do?',
      choices: [
        { name: `🔄  Convert SVGs to Vue components ${chalk.dim(`(${svgs.filter(s => !s.alreadyConverted).length} new)`)}`, value: 'convert' as const },
        { name: `📋  Analyze existing icon components`, value: 'analyze' as const },
        { name: `❌  Cancel`, value: 'cancel' as const },
      ],
    })

    if (action === 'cancel') {
      console.log(chalk.dim('  Cancelled.'))
      return
    }

    if (action === 'analyze') {
      await analyzeExistingIcons()
      return
    }

    const newSvgs = svgs.filter(s => !s.alreadyConverted)
    if (newSvgs.length === 0) {
      console.log(chalk.green('  ✨ All SVGs are already converted!'))
      await analyzeExistingIcons()
      return
    }

    const choices = newSvgs
      .sort((a, b) => a.componentName.localeCompare(b.componentName))
      .map(s => ({
        name: `${s.componentName}  ${chalk.dim(`← ${s.filename} (${formatSize(s.sizeBytes)})`)}`,
        value: s.componentName,
        checked: true,
      }))

    const selected = await checkbox({
      message: 'Select SVGs to convert',
      choices,
      pageSize: 20,
    })

    if (selected.length === 0) {
      console.log(chalk.dim('  No SVGs selected. Exiting.'))
      return
    }

    toConvert = newSvgs.filter(s => selected.includes(s.componentName))
  }

  if (toConvert.length === 0) {
    console.log(chalk.green('  ✨ Nothing new to convert!'))
    return
  }

  // Step 2: Convert
  console.log()
  console.log(`  ${chalk.cyan('›')} ${chalk.bold(`Converting ${toConvert.length} SVGs to Vue components...`)}`)
  console.log()

  const { converted, skipped, convertedSvgs } = convertSvgs(toConvert)

  console.log()
  console.log(`  ${chalk.green('✓')} Converted ${chalk.bold(String(converted))} new components ${skipped > 0 ? chalk.dim(`(${skipped} skipped)`) : ''}`)

  // Step 2b: Delete source SVGs
  if (convertedSvgs.length > 0) {
    console.log()
    console.log(`  ${chalk.cyan('›')} ${chalk.bold('Cleaning up source SVG files...')}`)
    const deleted = deleteSources(convertedSvgs)
    console.log(`  ${chalk.green('✓')} Removed ${chalk.bold(String(deleted))} source SVGs`)
  }

  // Step 3: Generate barrel export
  console.log()
  console.log(`  ${chalk.cyan('›')} ${chalk.bold('Generating barrel export...')}`)
  generateBarrelExport(svgs)

  // Step 4: Find refactor targets
  console.log()
  console.log(`  ${chalk.cyan('›')} ${chalk.bold('Scanning for <img> usages to refactor...')}`)
  const refactorTargets = await findRefactorTargets(svgs)

  if (refactorTargets.length > 0) {
    console.log(`  ${chalk.yellow('!')} Found ${chalk.bold(String(refactorTargets.length))} <img> usages that can use the new components:`)
    console.log()
    for (const t of refactorTargets) {
      console.log(`    ${chalk.dim(`${t.file}:${t.line}`)}`)
      console.log(`      ${chalk.red(t.original.substring(0, 80))}`)
      console.log(`      ${chalk.dim('→')} ${chalk.green(t.replacement)}`)
    }
    console.log()

    if (isRefactor) {
      console.log(`  ${chalk.cyan('›')} ${chalk.bold('Applying refactoring...')}`)
      const replaced = applyRefactoring(refactorTargets)
      console.log(`  ${chalk.green('✓')} Replaced ${chalk.bold(String(replaced))} usages`)
    } else {
      console.log(chalk.dim('  ℹ️  Run with --refactor to auto-replace these usages.'))
    }
  } else {
    console.log(`  ${chalk.green('✓')} No <img> usages found to refactor`)
  }

  // Done!
  console.log()
  console.log(chalk.bold.green('  ┌─────────────────────────────────────────────────────────┐'))
  console.log(chalk.bold.green('  │') + chalk.bold.green('   ✨  Done!                                               ') + chalk.bold.green('│'))
  console.log(chalk.bold.green('  └─────────────────────────────────────────────────────────┘'))
  console.log()
  console.log(chalk.dim('  Usage in your Vue files:'))
  console.log()
  console.log(chalk.cyan(`    import { ArrowIcon } from '@/components/icons'`))
  console.log()
  console.log(chalk.dim('  In template:'))
  console.log(chalk.cyan(`    <ArrowIcon />                    ${chalk.dim('<!-- default 24px, currentColor -->')}`))
  console.log(chalk.cyan(`    <ArrowIcon :size="32" />         ${chalk.dim('<!-- custom size -->')}`))
  console.log(chalk.cyan(`    <ArrowIcon color="#ff0000" />    ${chalk.dim('<!-- custom color -->')}`))
  console.log()
  console.log(chalk.dim('  Components are auto-imported via unplugin-vue-components.'))
  console.log()
}

main().catch((err) => {
  console.error(chalk.red(`  ✗ Error: ${err.message}`))
  process.exit(1)
})

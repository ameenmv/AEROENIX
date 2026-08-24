#!/usr/bin/env bun
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'

const DIRS = ['src']
const EXTENSIONS = new Set(['.ts', '.vue'])

/**
 * Recursively get all files in a directory
 */
function getFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir)

  for (const file of files) {
    const filePath = join(dir, file)
    const stat = statSync(filePath)

    if (stat.isDirectory()) {
      // Skip node_modules and hidden dirs
      if (file !== 'node_modules' && !file.startsWith('.')) {
        getFiles(filePath, fileList)
      }
    }
    else if (EXTENSIONS.has(extname(file))) {
      fileList.push(filePath)
    }
  }

  return fileList
}

/**
 * Remove empty lines and trailing whitespace
 */
function stripEmptyLines(code: string): string {
  return code
    .split('\n')
    .map(line => line.trimEnd())
    .filter(line => line.length > 0)
    .join('\n')
}

/**
 * Process a single file
 */
function processFile(filePath: string): void {
  try {
    const content = readFileSync(filePath, 'utf8')
    const cleanedContent = stripEmptyLines(content)

    if (content !== cleanedContent) {
      writeFileSync(filePath, cleanedContent, 'utf8')
      console.warn(`✓ Cleaned empty lines from: ${filePath}`)
    }
  }
  catch (err) {
    console.error(`✗ Error processing ${filePath}: ${(err as Error).message}`)
  }
}

/**
 * Main execution
 */
function main(): void {
  console.warn('🧹 Removing empty lines from .ts files in src/...')

  let totalFiles = 0
  for (const dir of DIRS) {
    try {
      const files = getFiles(dir)
      totalFiles += files.length
      for (const file of files) {
        processFile(file)
      }
    }
    catch (err) {
      console.error(`Error reading directory ${dir}: ${(err as Error).message}`)
    }
  }

  console.warn(`\n✅ Processed ${totalFiles} .ts files.`)
}

main()

#!/usr/bin/env bun
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import process from 'node:process'

// const DIRS = ['src']  // Unused variable removed
const EXTENSIONS = new Set(['.vue'])

/**
 * Recursively get all files in a directory
 */
function getFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir)

  for (const file of files) {
    const filePath = join(dir, file)
    const stat = statSync(filePath)

    if (stat.isDirectory()) {
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

interface Block {
  type: string
  full: string
  index: number
}

/**
 * Find top-level blocks in a Vue SFC
 */
function findBlocks(content: string): { blocks: Block[], header: string } {
  const blocks: Block[] = []
  // const targetTags = ['script', 'template', 'style']  // Unused variable removed

  // Regex to find start of any target tag at start of line
  // Using \n? before ^ to handle different environments if needed, but ^ + m flag is standard
  const startRegex = /^<(script|template|style)(\s[^>]*)?>/gm
  let match
  let firstBlockIndex = -1

  while (true) {
    const tempMatch = startRegex.exec(content)
    if (tempMatch === null)
      break
    match = tempMatch
    const tagName = match[1]
    const startIndex = match.index
    if (firstBlockIndex === -1)
      firstBlockIndex = startIndex
    const openTag = match[0]

    // Depth counting for balancing tags (especially for <template>)
    let depth = 1
    const combinedRegex = new RegExp(`(<${tagName}(?:\\s[^>]*)?>)|(</${tagName}>)`, 'g')
    combinedRegex.lastIndex = startIndex + openTag.length

    let innerMatch
    // let foundEnd = false  // Unused variable removed
    while (true) {
      const tempInnerMatch = combinedRegex.exec(content)
      if (tempInnerMatch === null)
        break
      innerMatch = tempInnerMatch
      if (innerMatch[1]) {
        depth++
      }
      else if (innerMatch[2]) {
        depth--
      }

      if (depth === 0) {
        const endIndex = innerMatch.index + innerMatch[0].length
        blocks.push({
          type: tagName,
          full: content.substring(startIndex, endIndex),
          index: startIndex,
        })
        // foundEnd = true  // Unused variable removed
        break
      }
    } // End of inner while loop
  }

  const header = firstBlockIndex > 0 ? content.substring(0, firstBlockIndex) : ''
  return { blocks, header }
}

/**
 * Reorder Vue top-level tags: script -> template -> style
 */
function reorderVueFile(content: string): string {
  const { blocks, header } = findBlocks(content)
  if (blocks.length === 0)
    return content

  const typeOrder: Record<string, number> = {
    script: 1,
    template: 2,
    style: 3,
  }

  const sortedBlocks = [...blocks].sort((a, b) => {
    const orderA = typeOrder[a.type] || 99
    const orderB = typeOrder[b.type] || 99
    return orderA - orderB
  })

  // Reconstruct with double newlines between blocks, ensuring header is preserved exactly
  let result = header
  if (header && !header.endsWith('\n'))
    result += '\n'

  result += `${sortedBlocks.map(b => b.full).join('\n\n')}\n`
  return result
}

/**
 * Process a single file
 */
function processFile(filePath: string): void {
  try {
    const content = readFileSync(filePath, 'utf8')
    const reorderedContent = reorderVueFile(content)

    if (content.trim() !== reorderedContent.trim()) {
      writeFileSync(filePath, reorderedContent, 'utf8')
      console.warn(`✓ Reordered tags in: ${filePath}`)
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
  const target = process.argv[2]
  if (target) {
    if (statSync(target).isDirectory()) {
      const files = getFiles(target)
      for (const file of files) processFile(file)
    }
    else {
      processFile(target)
    }
  }
  else {
    console.warn('🔄 Reordering Vue tags (<script>, <template>, <style>) in src/...')
    const files = getFiles('src')
    for (const file of files) {
      processFile(file)
    }
    console.warn(`\n✅ Processed ${files.length} .vue files.`)
  }
}

main()

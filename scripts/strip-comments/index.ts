#!/usr/bin/env bun

/**
 * Strip Comments Script
 * Removes all JavaScript/TypeScript comments (.js, .ts, .tsx, .jsx, .vue files)
 * Removes Vue template comments (<!-- -->) from <template> sections
 * Also removes empty lines and trailing whitespace
 * Preserves JSDoc comments, shebangs, and template literals
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import process from 'node:process'
import { parse } from '@vue/compiler-sfc'
import decomment from 'decomment'
import strip from 'strip-comments'

// File extensions to process
const EXTENSIONS = new Set(['.js', '.ts', '.tsx', '.jsx', '.vue'])

// Directories to process (default: src)
const DIRS: string[] = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ['src']

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
function cleanLines(code: string): string {
  return code
    .split('\n')
    .map(line => line.trimEnd())
    .filter(line => line.trim().length > 0)
    .join('\n')
}

/**
 * Process a single file
 */
function processFile(filePath: string): void {
  try {
    const code = readFileSync(filePath, 'utf8')
    let newContent = ''

    if (filePath.endsWith('.vue')) {
      const { descriptor } = parse(code)
      const blocks: { start: number, content: string }[] = []

      // ---- TEMPLATE ----
      if (descriptor.template) {
        let templateContent = cleanLines(descriptor.template.content)
        // Remove HTML comments: <!-- comment -->
        templateContent = templateContent.replace(/<!--[\s\S]*?-->/g, '')
        blocks.push({
          start: descriptor.template.loc.start.offset,
          content: `<template>\n${cleanLines(templateContent)}\n</template>`,
        })
      }

      // ---- SCRIPT ----
      if (descriptor.script || descriptor.scriptSetup) {
        const scriptBlock = (descriptor.script || descriptor.scriptSetup)!
        const scriptContent = decomment(scriptBlock.content)

        const tag = descriptor.scriptSetup ? 'script setup' : 'script'
        const lang = scriptBlock.lang ? ` lang="${scriptBlock.lang}"` : ''

        blocks.push({
          start: scriptBlock.loc.start.offset,
          content: `<${tag}${lang}>\n${cleanLines(scriptContent)}\n</script>`,
        })
      }

      // ---- STYLES ----
      descriptor.styles.forEach((style) => {
        const styleContent = strip(style.content)
        const lang = style.lang ? ` lang="${style.lang}"` : ''
        const scoped = style.scoped ? ' scoped' : ''

        blocks.push({
          start: style.loc.start.offset,
          content: `<style${lang}${scoped}>\n${cleanLines(styleContent)}\n</style>`,
        })
      })

      // ---- CUSTOM BLOCKS ----
      descriptor.customBlocks.forEach((block) => {
        blocks.push({
          start: block.loc.start.offset,
          content: `<${block.type}>\n${cleanLines(block.content)}\n</${block.type}>`,
        })
      })

      // Sort blocks by their original start position to preserve order
      blocks.sort((a, b) => a.start - b.start)
      newContent = blocks.map(b => b.content).join('\n\n')

      if (newContent.trim()) {
        writeFileSync(filePath, `${newContent.trim()}\n`, 'utf8')
      }
    }
    else {
      // Regular JS/TS files
      const stripped = decomment(code)
      writeFileSync(filePath, `${cleanLines(stripped)}\n`, 'utf8')
    }
    console.warn(`✓ ${filePath}`)
  }
  catch (err) {
    const error = err as Error
    console.error(`✗ ${filePath}: ${error.message}`)
  }
}

/**
 * Main execution
 */
function main(): void {
  for (const path of DIRS) {
    try {
      const stat = statSync(path)
      if (stat.isDirectory()) {
        const files = getFiles(path)
        for (const file of files) {
          processFile(file)
        }
      }
      else {
        processFile(path)
      }
    }
    catch (err) {
      const error = err as Error
      console.error(`Error processing path ${path}: ${error.message}`)
    }
  }
}

main()

import type { DiffResult, FileChange } from '../types'
import fs from 'node:fs'
import path from 'node:path'
import { serve } from 'bun'
import { createTwoFilesPatch } from 'diff'
import { openBrowser } from './browser'
import { isBinaryFile, readFileSafe } from './files'

function generateUnifiedDiff(
  baseDir: string,
  childDir: string,
  relativePath: string,
  status: 'added' | 'modified' | 'deleted',
): string {
  const basePath = path.join(baseDir, relativePath)
  const childPath = path.join(childDir, relativePath)

  let oldStr = ''
  let newStr = ''

  if (status === 'modified' || status === 'deleted') {
    oldStr = fs.existsSync(basePath) && !isBinaryFile(basePath) ? readFileSafe(basePath) || '' : ''
  }
  if (status === 'modified' || status === 'added') {
    newStr
      = fs.existsSync(childPath) && !isBinaryFile(childPath) ? readFileSafe(childPath) || '' : ''
  }

  // Handle binary visual feedback
  if (
    (fs.existsSync(basePath) && isBinaryFile(basePath))
    || (fs.existsSync(childPath) && isBinaryFile(childPath))
  ) {
    return `Binary files differ\n--- Base Blueprint\n+++ Local Project\n@@ -0,0 +0,0 @@\nBinary file structure`
  }

  // We ensure there's a trailing newline if it lacked one, although createTwoFilesPatch usually handles it.
  return createTwoFilesPatch(
    relativePath,
    relativePath,
    oldStr,
    newStr,
    `Base Blueprint (Incoming)`,
    `Local Project (Current)`,
  )
}

function generateHtml() {
  return fs.readFileSync(path.join(import.meta.dir, 'webDiff.html'), 'utf-8')
}

/**
 * Launch Web Server for Diff Preview and Selection, then return selected file paths
 */
export async function launchWebDiffViewer(
  diff: DiffResult,
  baseDir: string,
  childDir: string,
): Promise<{ selectedFiles: string[], mixedEdits: Record<string, string> }> {
  return new Promise((resolve) => {
    // 1. Prepare Data Payload
    const fileItems = {
      added: diff.added.map((f: FileChange) => ({
        ...f,
        status: 'added',
        diffText: generateUnifiedDiff(baseDir, childDir, f.relativePath, 'added'),
      })),
      modified: diff.modified.map((f: FileChange) => ({
        ...f,
        status: 'modified',
        diffText: generateUnifiedDiff(baseDir, childDir, f.relativePath, 'modified'),
      })),
      deleted: diff.deleted.map((f: FileChange) => ({
        ...f,
        status: 'deleted',
        diffText: generateUnifiedDiff(baseDir, childDir, f.relativePath, 'deleted'),
      })),
    }

    // 2. Setup standard HTTP server using Bun
    const server = serve({
      port: 0, // Random open port
      async fetch(req: Request) {
        const url = new URL(req.url)

        // API Endpoint: Get the Diff data
        if (url.pathname === '/api/diff') {
          return new Response(JSON.stringify(fileItems), {
            headers: { 'Content-Type': 'application/json' },
          })
        }

        // API Endpoint: Get the exact raw file
        if (url.pathname === '/api/file') {
          const relativePath = url.searchParams.get('path')
          const source = url.searchParams.get('source')
          if (!relativePath || !source)
            return new Response(JSON.stringify({ error: 'Missing path or source' }), { status: 400 })

          const targetDir = source === 'base' ? baseDir : childDir
          const fullPath = path.join(targetDir, relativePath)

          if (!fs.existsSync(fullPath) || isBinaryFile(fullPath)) {
            return new Response(JSON.stringify({ error: 'File not found or is binary' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
          }

          const content = readFileSafe(fullPath) || ''

          return new Response(JSON.stringify({ content }), {
            headers: { 'Content-Type': 'application/json' },
          })
        }

        // API Endpoint: Submit checked files and mixed edits
        if (url.pathname === '/api/submit' && req.method === 'POST') {
          const body = await req.json()

          // Respond to the browser
          const res = new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' },
          })

          // Gracefully shutdown and resolve promise
          setTimeout(() => {
            server.stop()
            resolve({
              selectedFiles: body.selected || [],
              mixedEdits: body.mixedEdits || {},
            })
          }, 500)

          return res
        }

        // Root path serves the frontend HTML app
        if (url.pathname === '/') {
          return new Response(generateHtml(), {
            headers: { 'Content-Type': 'text/html' },
          })
        }

        // 404
        return new Response('Not found', { status: 404 })
      },
    })

    const localUrl = `http://localhost:${server.port}`
    console.log()
    console.log(`       Opening Diff Viewer in your browser: ${localUrl}`)
    console.log()
    openBrowser(localUrl)
  })
}

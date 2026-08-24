#!/usr/bin/env node

/**
 * Postman Collection Exporter CLI
 * Fetches all collections from across all your Postman workspaces and exports selected ones to JSON
 * Uses POSTMAN_API_KEY from .env or asks for it.
 */

import fs from 'node:fs'
import path from 'node:path'
import { checkbox, confirm, input } from '@inquirer/prompts'
import 'dotenv/config'
// ─── api calls ────────────────────────────────────────────────────────────────

async function fetchFromApi(apiKey, endpoint) {
  const url = `https://api.getpostman.com${endpoint}`
  const res = await fetch(url, {
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
  })
  const data = await res.json()
  if (res.ok) {
    return data
  }
  else {
    throw new Error(
      data?.error?.message || `HTTP ${res.status}: ${JSON.stringify(data).slice(0, 200)}`,
    )
  }
}

async function fetchAllCollectionsAcrossWorkspaces(apiKey) {
  process.stdout.write('Fetching workspaces from Postman...\n')
  let wsData
  try {
    wsData = await fetchFromApi(apiKey, '/workspaces')
  }
  catch (err) {
    throw new Error(`Failed to fetch workspaces: ${err.message}`)
  }

  const workspaces = wsData.workspaces || []

  const allCollections = []
  const seenIds = new Set()

  for (const ws of workspaces) {
    process.stdout.write(`  Fetching collections for workspace: ${ws.name} ... `)
    try {
      const details = await fetchFromApi(apiKey, `/workspaces/${ws.id}`)
      const collections = details.workspace?.collections || []
      console.log(`found ${collections.length}`)

      for (const col of collections) {
        if (!seenIds.has(col.uid)) {
          seenIds.add(col.uid)
          allCollections.push({
            id: col.id || col.uid,
            name: col.name || 'Untitled',
            uid: col.uid,
            workspaceName: ws.name,
          })
        }
      }
    }
    catch (err) {
      console.log(`failed (${err.message})`)
    }
  }

  // Also fetch default /collections just in case some are personal/unassigned
  try {
    const allData = await fetchFromApi(apiKey, '/collections')
    for (const col of allData.collections || []) {
      const uid = col.uid
      if (!seenIds.has(uid)) {
        seenIds.add(uid)
        allCollections.push({
          id: col.id || uid,
          name: col.name || 'Untitled',
          uid,
          workspaceName: 'Personal/Other',
        })
      }
    }
  }
  catch (err) {
    // Ignore error here if we already have workspace collections
  }

  return allCollections
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔═════════════════════════════════════════════════════════════╗')
  console.log('║           Postman Collection Exporter  v2.0                 ║')
  console.log('╚═════════════════════════════════════════════════════════════╝\n')

  let apiKey = process.env.POSTMAN_API_KEY

  if (!apiKey) {
    console.log('No POSTMAN_API_KEY found in environment variables.\n')
    console.log('To get your Postman API Key:')
    console.log('  1. Go to https://go.postman.co/settings/me/api-keys')
    console.log('  2. Click "Generate API Key", give it a name, copy the key\n')

    apiKey = await input({
      message: 'Paste your Postman API Key:',
      validate: val => val.trim().length > 0 || 'API Key is required.',
    })
  }
  else {
    console.log('Using POSTMAN_API_KEY from environment.\n')
  }

  apiKey = apiKey.trim()

  let collections
  try {
    collections = await fetchAllCollectionsAcrossWorkspaces(apiKey)
  }
  catch (err) {
    console.error('\n❌ Failed to fetch collections:', err.message)
    console.error('   Double-check your API key and try again.\n')
    process.exit(1)
  }

  if (!collections.length) {
    console.log('No collections found in your workspaces.')
    return
  }

  console.log(`\nFound a total of ${collections.length} collections.\n`)

  const selected = []
  let continueSelecting = true

  while (continueSelecting) {
    const searchTerm = await input({
      message: 'Filter collections by name or workspace (leave empty to show all):',
    })

    const lowerTerm = searchTerm.trim().toLowerCase()
    const filtered = collections.filter(c =>
      c.name.toLowerCase().includes(lowerTerm)
      || c.workspaceName.toLowerCase().includes(lowerTerm),
    )

    if (filtered.length === 0) {
      console.log('No collections match your search.')
    }
    else {
      const choices = filtered
        .filter(c => !selected.find(s => s.uid === c.uid))
        .map(c => ({
          name: `${c.name} (Workspace: ${c.workspaceName})`,
          value: c,
          checked: false,
        }))

      if (choices.length === 0) {
        console.log('You have already selected all matching collections from this search.')
      }
      else {
        const batch = await checkbox({
          message: 'Select collections to export (Space to select, Enter to confirm):',
          pageSize: 15,
          choices,
        })

        if (batch && batch.length > 0) {
          selected.push(...batch)
        }
      }
    }

    if (selected.length > 0) {
      continueSelecting = await confirm({
        message: `You have selected ${selected.length} collections so far. Do you want to search and select more?`,
        default: false,
      })
    }
    else {
      continueSelecting = await confirm({
        message: `You haven't selected any collections yet. Do you want to try searching again?`,
        default: true,
      })
    }
  }

  if (!selected.length) {
    console.log('\nNothing selected. Exiting.')
    return
  }

  const outDir = await input({
    message: 'Output folder path to save the collections:',
    default: './postman',
  })

  fs.mkdirSync(outDir, { recursive: true })

  console.log(`\nExporting ${selected.length} collection(s) to ${outDir}/ …\n`)

  const manifest = []

  for (let i = 0; i < selected.length; i++) {
    const col = selected[i]

    process.stdout.write(`  [${i + 1}/${selected.length}] ${col.name.slice(0, 55).padEnd(56)} … `)

    try {
      // Actually fetch the full collection body
      const fullRes = await fetchFromApi(apiKey, `/collections/${col.id}`)
      const full = fullRes.collection

      const safe = col.name.replace(/[^\w\-]/g, '_').slice(0, 60)
      const collectionDir = path.join(outDir, safe)
      
      fs.mkdirSync(collectionDir, { recursive: true })

      const items = full.item || []
      const savedFiles = []

      function processNode(node, currentDir, relativeDir, namePrefix) {
        const nodeSafe = node.name ? node.name.replace(/[^\w\-]/g, '_').slice(0, 60) : 'Unnamed'
        const isFolder = node.item && Array.isArray(node.item)
        
        if (isFolder) {
          const hasSubFolders = node.item.some(child => child.item && Array.isArray(child.item))
          
          if (hasSubFolders) {
            // Structural folder: make dir and recurse
            const nextDir = path.join(currentDir, nodeSafe)
            const nextRelDir = path.join(relativeDir, nodeSafe)
            fs.mkdirSync(nextDir, { recursive: true })
            
            for (const child of node.item) {
              processNode(child, nextDir, nextRelDir, `${namePrefix} - ${node.name}`)
            }
          } else {
            // Module folder (contains only requests): save as JSON
            const itemFilename = `${nodeSafe}.postman_collection.json`
            const subCollection = {
              info: { ...full.info, name: `${namePrefix} - ${node.name || 'Unnamed'}` },
              item: [node],
              event: full.event,
              variable: full.variable,
              auth: full.auth,
            }
            if (subCollection.info._postman_id) delete subCollection.info._postman_id
            if (subCollection.info.uid) delete subCollection.info.uid

            fs.writeFileSync(path.join(currentDir, itemFilename), JSON.stringify(subCollection, null, 2), 'utf8')
            savedFiles.push(path.join(relativeDir, itemFilename))
          }
        } else {
          // It is a request or empty node, export as a file
          const itemFilename = `${nodeSafe}_req.postman_collection.json`
          const subCollection = {
            info: { ...full.info, name: `${namePrefix} - ${node.name || 'Unnamed'}` },
            item: [node],
            event: full.event,
            variable: full.variable,
            auth: full.auth,
          }
          if (subCollection.info._postman_id) delete subCollection.info._postman_id
          if (subCollection.info.uid) delete subCollection.info.uid

          fs.writeFileSync(path.join(currentDir, itemFilename), JSON.stringify(subCollection, null, 2), 'utf8')
          savedFiles.push(path.join(relativeDir, itemFilename))
        }
      }

      const hasRootFolders = items.some(child => child.item && Array.isArray(child.item))
      if (items.length > 0) {
        if (hasRootFolders) {
          for (const child of items) {
            processNode(child, collectionDir, safe, full.info.name)
          }
        } else {
          // Fallback: If no sub-folders at all, just save the whole thing as one file
          const itemFilename = `${safe}.postman_collection.json`
          fs.writeFileSync(path.join(collectionDir, itemFilename), JSON.stringify(full, null, 2), 'utf8')
          savedFiles.push(path.join(safe, itemFilename))
        }
      }

      manifest.push({ name: col.name, folder: safe, files: savedFiles, id: col.id, workspace: col.workspaceName })
      console.log(`✓ (split into ${savedFiles.length} files)`)
    }
    catch (err) {
      console.log(`✗  (${err.message})`)
    }
  }

  // write manifest
  fs.writeFileSync(
    path.join(outDir, 'manifest.json'),
    JSON.stringify(
      {
        exported_at: new Date().toISOString(),
        collections: manifest,
      },
      null,
      2,
    ),
    'utf8',
  )

  console.log(`\n✅ Done! Files saved to: ${path.resolve(outDir)}`)
  console.log(`   Each .json file can be imported directly into Postman.\n`)
}

main().catch((err) => {
  if (err.name === 'ExitPromptError') {
    console.log('\nExited.')
  }
  else {
    console.error('Unexpected error:', err)
  }
  process.exit(1)
})

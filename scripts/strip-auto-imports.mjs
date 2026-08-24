import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(__dirname, '../src')

const autoImportedLibs = ['vue', 'vue-router', 'pinia', 'vue-i18n', '@vueuse/core']

function walkDir(dir) {
  let results = []
  const list = fs.readdirSync(dir)
  list.forEach(file => {
    file = path.resolve(dir, file)
    const stat = fs.statSync(file)
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file))
    } else if (file.endsWith('.vue') || file.endsWith('.ts')) {
      results.push(file)
    }
  })
  return results
}

const files = walkDir(srcDir)

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8')
  let changed = false

  // Regex to match imports from autoImportedLibs
  // This matches both single line: import { foo } from 'vue'
  // and multiline: import {\n  foo\n} from 'vue'
  autoImportedLibs.forEach(lib => {
    // Regex explanation:
    // ^\s*import\s+(?:type\s+)?\{[^}]*\}\s+from\s+['"]${lib}['"];?\s*$
    // We also want to remove `import { defineComponent, h, ref } from 'vue'`
    const regex = new RegExp(`^\\s*import\\s+(?:type\\s+)?\\{?[^}]*\\}?\\s+from\\s+['"]${lib}['"];?\\s*$`, 'gm')
    
    // For multiline imports (very basic handling):
    // import {
    //   ...
    // } from 'vue'
    const multiLineRegex = new RegExp(`^\\s*import\\s+(?:type\\s+)?\\{[\\s\\S]*?\\}\\s+from\\s+['"]${lib}['"];?\\s*$`, 'gm')

    if (multiLineRegex.test(content)) {
      content = content.replace(multiLineRegex, '')
      changed = true
    }
    if (regex.test(content)) {
      content = content.replace(regex, '')
      changed = true
    }
  })

  // Also strip local @/composables imports since they are auto-imported
  // e.g. import { useAdmins } from '@/composables'
  const composablesRegex = /^\s*import\s+\{[^}]*\}\s+from\s+['"]@\/composables(?:.*)?['"];?\s*$/gm
  if (composablesRegex.test(content)) {
    content = content.replace(composablesRegex, '')
    changed = true
  }

  // Also strip local stores imports
  // e.g. import { useAuthStore } from '@/stores'
  const storesRegex = /^\s*import\s+\{[^}]*\}\s+from\s+['"]@\/stores(?:.*)?['"];?\s*$/gm
  if (storesRegex.test(content)) {
    content = content.replace(storesRegex, '')
    changed = true
  }

  if (changed) {
    // remove multiple empty lines that might have been created
    content = content.replace(/\n{3,}/g, '\n\n')
    fs.writeFileSync(file, content, 'utf-8')
    console.log('Stripped auto-imports in', file)
  }
})

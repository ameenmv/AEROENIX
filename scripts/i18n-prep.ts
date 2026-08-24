import fs from 'node:fs'
import path from 'node:path'

const LOCALES_DIR = './src/i18n/locales'
const TEMP_DIR = './.i18n-temp'

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR)
}

const locales = ['en', 'ar']

for (const lang of locales) {
  const langDir = path.join(LOCALES_DIR, lang)
  if (!fs.existsSync(langDir))
    continue

  const merged: Record<string, any> = {}
  const files = fs.readdirSync(langDir)

  for (const file of files) {
    if (!file.endsWith('.json'))
      continue
    const namespace = file.replace('.json', '')
    const filePath = path.join(langDir, file)
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      merged[namespace] = content
    }
    catch (e) {
      console.error(`Error parsing ${filePath}:`, e)
    }
  }

  fs.writeFileSync(path.join(TEMP_DIR, `${lang}.json`), JSON.stringify(merged, null, 2))
}

console.warn('Locales merged to .i18n-temp/ for reporting.')

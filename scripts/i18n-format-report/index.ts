import fs from 'node:fs'
import path from 'node:path'

const REPORT_PATH = './i18n-report.json'

function main() {
  if (!fs.existsSync(REPORT_PATH)) {
    console.error(`Report file not found: ${REPORT_PATH}`)
    process.exit(1)
  }

  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf-8'))

  const formattedReport: any = {}

  if (report.missingKeys && Array.isArray(report.missingKeys)) {
    const missingByLang: Record<string, string[]> = {}
    
    for (const item of report.missingKeys) {
      if (!item.language || !item.path) continue
      
      if (!missingByLang[item.language]) {
        missingByLang[item.language] = []
      }
      
      if (!missingByLang[item.language].includes(item.path)) {
        missingByLang[item.language].push(item.path)
      }
    }
    
    // Sort arrays for easier reading
    for (const lang of Object.keys(missingByLang)) {
      missingByLang[lang].sort()
    }
    
    formattedReport.missingKeys = missingByLang
  }

  if (report.unusedKeys && Array.isArray(report.unusedKeys)) {
    const unusedByLang: Record<string, string[]> = {}
    
    for (const item of report.unusedKeys) {
      if (!item.language || !item.path) continue
      
      if (!unusedByLang[item.language]) {
        unusedByLang[item.language] = []
      }
      
      if (!unusedByLang[item.language].includes(item.path)) {
        unusedByLang[item.language].push(item.path)
      }
    }
    
    // Sort arrays for easier reading
    for (const lang of Object.keys(unusedByLang)) {
      unusedByLang[lang].sort()
    }
    
    formattedReport.unusedKeys = unusedByLang
  }

  // Keep maybeDynamicKeys if they exist
  if (report.maybeDynamicKeys) {
    formattedReport.maybeDynamicKeys = report.maybeDynamicKeys
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify(formattedReport, null, 2) + '\n')
  console.log('✅ Successfully formatted i18n-report.json to group by language.')
}

main()

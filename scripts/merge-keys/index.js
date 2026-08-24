const fs = require('node:fs')

const path = require('node:path')

const extracted = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'extracted-en.json'), 'utf8'))

const enPath = path.resolve(__dirname, '..', 'src/i18n/locales/en/common.json')
const arPath = path.resolve(__dirname, '..', 'src/i18n/locales/ar/common.json')

let enObj = {}
let arObj = {}

if (fs.existsSync(enPath))
  enObj = JSON.parse(fs.readFileSync(enPath, 'utf8'))
if (fs.existsSync(arPath))
  arObj = JSON.parse(fs.readFileSync(arPath, 'utf8'))

for (const [key, value] of Object.entries(extracted)) {
  if (!enObj[key])
    enObj[key] = value
  if (!arObj[key])
    arObj[key] = `[AR] ${value}`
}

fs.writeFileSync(enPath, `${JSON.stringify(enObj, null, 2)}\n`)
fs.writeFileSync(arPath, `${JSON.stringify(arObj, null, 2)}\n`)

console.log('Merged keys to en.json and ar.json')

const fs = require('node:fs')

let report = []
try {
  report = JSON.parse(fs.readFileSync(require('node:path').resolve(__dirname, '..', 'eslint-report.json'), 'utf8'))
}
catch {
  console.error('No report found or invalid json')
  require('node:process').exit(1)
}

const extractedStrings = {}
let changedFilesCount = 0

function escapeKey(str) {
  return str.trim().replace(/'/g, '\\\'').replace(/\n/g, ' ').replace(/\s+/g, ' ')
}

function generateObjectKey(str) {
  return str.trim().replace(/\n/g, ' ').replace(/\s+/g, ' ')
}

report.forEach((fileResult) => {
  const filePath = fileResult.filePath
  const targetWarnings = fileResult.messages.filter(m => m.ruleId === '@intlify/vue-i18n/no-raw-text')

  if (targetWarnings.length === 0)
    return

  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  let fileChanged = false

  // Sort from bottom to top so line replacements don't shift earlier line numbers
  targetWarnings.sort((a, b) => b.line - a.line || b.column - a.column)

  targetWarnings.forEach((warn) => {
    const startL = warn.line - 1
    const endL = warn.endLine ? warn.endLine - 1 : startL
    const startC = warn.column - 1
    const endC = warn.endColumn ? warn.endColumn - 1 : (lines[endL] || '').length

    // Bounds check
    if (!lines[startL] || !lines[endL])
      return

    let textToReplace = ''
    if (startL === endL) {
      textToReplace = lines[startL].substring(startC, endC)
    }
    else {
      textToReplace = `${lines[startL].substring(startC)}\n`
      for (let i = startL + 1; i < endL; i++) {
        textToReplace += `${lines[i]}\n`
      }
      textToReplace += lines[endL].substring(0, endC)
    }

    // Check if textToReplace has surrounding quotes
    const hasQuotes = (textToReplace.startsWith('"') && textToReplace.endsWith('"')) || (textToReplace.startsWith('\'') && textToReplace.endsWith('\''))
    const unquotedText = hasQuotes ? textToReplace.slice(1, -1) : textToReplace

    const keyString = unquotedText.trim()
    if (!keyString)
      return

    const cleanKey = escapeKey(unquotedText)
    const jsonKey = generateObjectKey(unquotedText)
    extractedStrings[jsonKey] = keyString

    const fullLine = lines[startL]
    const beforeStr = fullLine.substring(0, startC)

    // Check if we are inside a vue interpolation {{ }} by scanning backwards
    // This is a naive check but works for most single line cases
    const lastOpenBrace = beforeStr.lastIndexOf('{{')
    const lastCloseBrace = beforeStr.lastIndexOf('}}')
    const insideMustache = lastOpenBrace > lastCloseBrace

    // Case 1: We are already inside a mustache tag. e.g. {{ sending ? 'Sending...' : 'Send Message' }}
    // We just replace the string literal with $t('...')
    if (insideMustache) {
      lines[startL] = `${beforeStr}$t('common.${cleanKey}')${lines[endL].substring(endC)}`
      if (startL !== endL) {
        for (let i = startL + 1; i <= endL; i++) lines[i] = '!!DELETE!!'
      }
      fileChanged = true
      return
    }

    // Case 2: Attribute match. e.g. placeholder="something" or placeholder=something
    // Check if beforeStr ends with an attribute like ` placeholder="` or ` placeholder=`
    const attrMatch = beforeStr.match(/([a-z-]+)=["']?$/i)

    if (attrMatch) {
      const attrName = attrMatch[1]
      const attrFullMatch = attrMatch[0] // e.g. `placeholder="` or `placeholder=`
      const isQuotedInBefore = attrFullMatch.endsWith('"') || attrFullMatch.endsWith('\'')

      const lastAttrIndex = beforeStr.lastIndexOf(attrFullMatch)
      const newBefore = `${beforeStr.substring(0, lastAttrIndex)}:${attrName}=`

      // If the quote was in beforeStr, the closing quote is in lines[endL].substring(endC)
      // So the replacement should be exactly `$t('common.${cleanKey}')` and we put double quotes around it if it lacked it
      if (isQuotedInBefore) {
        let remainder = lines[endL].substring(endC)
        if (remainder.startsWith('"') || remainder.startsWith('\'')) {
          remainder = remainder.substring(1)
        }
        lines[startL] = `${newBefore}"$t('common.${cleanKey}')"${remainder}`
      }
      else {
        lines[startL] = `${newBefore}"$t('common.${cleanKey}')"${lines[endL].substring(endC)}`
      }

      if (startL !== endL) {
        for (let i = startL + 1; i <= endL; i++) lines[i] = '!!DELETE!!'
      }
      fileChanged = true
    }
    // Case 3: Text node match.
    else {
      if (startL === endL) {
        lines[startL] = `${beforeStr}{{ $t('common.${cleanKey}') }}${lines[startL].substring(endC)}`
      }
      else {
        lines[startL] = `${beforeStr}{{ $t('common.${cleanKey}') }}`
        for (let i = startL + 1; i < endL; i++) lines[i] = '!!DELETE!!'
        lines[endL] = lines[endL].substring(endC)

        if (lines[endL].trim() === '') {
          lines[endL] = '!!DELETE!!'
        }
      }
      fileChanged = true
    }
  })

  if (fileChanged) {
    fs.writeFileSync(filePath, lines.filter(l => l !== '!!DELETE!!').join('\n'))
    changedFilesCount++
    console.log('Fixed translations in:', filePath)
  }
})

console.log('Total files changed:', changedFilesCount)

fs.writeFileSync(require('node:path').resolve(__dirname, '..', 'extracted-en.json'), JSON.stringify(extractedStrings, null, 2))

console.log('Extracted keys saved.')

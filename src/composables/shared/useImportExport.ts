import type {
  ImportExportColumn,
  ImportExportConfig,
  ImportFileError,
  ImportPreview,
  ImportResult,
  ImportValidationError,
} from '@/types/composables/import-export'

/**
 * useImportExport
 *
 * Composable for handling data import/export with:
 * - Client-side CSV parsing and generation
 * - Column mapping and validation
 * - Required column enforcement
 * - Row-level validation with custom rules
 * - File preview before submission
 * - File size and extension validation
 * - Progress tracking and error reporting
 * - Integration with the resource service layer
 *
 * @example
 * ```ts
 * const ie = useImportExport({
 *   resourceName: 'users',
 *   service: usersService,
 *   columns: [
 *     { key: 'name', label: 'Name', required: true },
 *     { key: 'email', label: 'Email', type: 'email', required: true },
 *     { key: 'phone', label: 'Phone' },
 *   ],
 * })
 *
 * // Export
 * await ie.exportData()
 *
 * // Import with preview
 * const preview = await ie.parseFile(file)
 * if (preview.hasRequiredColumns) {
 *   const result = await ie.importData(file)
 * }
 * ```
 */
export function useImportExport(config: ImportExportConfig) {
  const sonarStore = useSonarStore()
  // ── Defaults ───────────────────────────────────────────────────────
  const delimiter = config.delimiter ?? ','
  const maxFileSize = config.maxFileSize ?? 5 * 1024 * 1024 // 5MB
  const maxRows = config.maxRows ?? 10000
  const allowedExtensions = config.allowedExtensions ?? ['.csv']
  const skipEmptyRows = config.skipEmptyRows ?? true
  // ── State ──────────────────────────────────────────────────────────
  const importing: Ref<boolean> = ref(false)
  const exporting: Ref<boolean> = ref(false)
  const progress: Ref<number> = ref(0)
  const importResult: Ref<ImportResult | null> = ref(null)
  const importPreview: Ref<ImportPreview | null> = ref(null)
  const fileErrors: Ref<ImportFileError[]> = ref([])
  const validationErrors: Ref<ImportValidationError[]> = ref([])
  // ── Computed ───────────────────────────────────────────────────────
  const exportableColumns = computed(() => config.columns.filter(c => c.exportable !== false))
  const importableColumns = computed(() => config.columns.filter(c => c.importable !== false))
  const requiredColumns = computed(() => importableColumns.value.filter(c => c.required))
  const hasErrors = computed(() => fileErrors.value.length > 0 || validationErrors.value.length > 0)
  const errorSummary = computed(() => {
    const fileCount = fileErrors.value.length
    const rowCount = validationErrors.value.length
    if (fileCount === 0 && rowCount === 0)
      return null
    const parts: string[] = []
    if (fileCount > 0)
      parts.push(`${fileCount} file error(s)`)
    if (rowCount > 0)
      parts.push(`${rowCount} row error(s)`)
    return parts.join(', ')
  })
  // ╔══════════════════════════════════════════════════════════════════╗
  // ║ CSV PARSING                                                       ║
  // ╚══════════════════════════════════════════════════════════════════╝
  /**
   * Parse a CSV string into rows.
   * Handles quoted fields, escaped quotes, newlines inside quotes.
   */
  function parseCSV(text: string): string[][] {
    const rows: string[][] = []
    let current = ''
    let inQuotes = false
    let row: string[] = []
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const next = text[i + 1]
      if (inQuotes) {
        if (char === '"' && next === '"') {
          current += '"'
          i++ // skip escaped quote
        }
        else if (char === '"') {
          inQuotes = false
        }
        else {
          current += char
        }
      }
      else {
        if (char === '"') {
          inQuotes = true
        }
        else if (char === delimiter) {
          row.push(current.trim())
          current = ''
        }
        else if (char === '\n' || (char === '\r' && next === '\n')) {
          row.push(current.trim())
          current = ''
          if (row.some(cell => cell !== '') || !skipEmptyRows) {
            rows.push(row)
          }
          row = []
          if (char === '\r')
            i++ // skip \n after \r
        }
        else {
          current += char
        }
      }
    }
    // Last row
    if (current !== '' || row.length > 0) {
      row.push(current.trim())
      if (row.some(cell => cell !== '') || !skipEmptyRows) {
        rows.push(row)
      }
    }
    return rows
  }
  /**
   * Generate CSV string from data.
   */
  function generateCSV(data: Record<string, any>[], columns: ImportExportColumn[]): string {
    // Header row
    const headers = columns.map(c => escapeCSVField(c.label))
    const lines = [headers.join(delimiter)]
    // Data rows
    for (const row of data) {
      const values = columns.map((col) => {
        const val = row[col.key]
        return escapeCSVField(val == null ? '' : String(val))
      })
      lines.push(values.join(delimiter))
    }
    return lines.join('\n')
  }
  function escapeCSVField(value: string): string {
    if (value.includes(delimiter) || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }
  // ╔══════════════════════════════════════════════════════════════════╗
  // ║ FILE VALIDATION                                                   ║
  // ╚══════════════════════════════════════════════════════════════════╝
  function validateFile(file: File): ImportFileError[] {
    const errors: ImportFileError[] = []
    // Extension check
    const ext = `.${file.name.split('.').pop()?.toLowerCase()}`
    if (!allowedExtensions.includes(ext)) {
      errors.push({
        type: 'invalid_extension',
        message: `Invalid file type "${ext}". Allowed: ${allowedExtensions.join(', ')}`,
      })
    }
    // Size check
    if (file.size > maxFileSize) {
      const maxMB = (maxFileSize / (1024 * 1024)).toFixed(1)
      const fileMB = (file.size / (1024 * 1024)).toFixed(1)
      errors.push({
        type: 'file_too_large',
        message: `File is too large (${fileMB}MB). Maximum allowed: ${maxMB}MB`,
      })
    }
    // Empty file check
    if (file.size === 0) {
      errors.push({
        type: 'empty_file',
        message: 'File is empty',
      })
    }
    return errors
  }
  // ╔══════════════════════════════════════════════════════════════════╗
  // ║ COLUMN VALIDATION                                                 ║
  // ╚══════════════════════════════════════════════════════════════════╝
  function validateColumns(headers: string[]): {
    mapped: Record<string, string>
    missing: string[]
    errors: ImportFileError[]
  } {
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim())
    const mapped: Record<string, string> = {}
    const errors: ImportFileError[] = []
    // Map headers to column keys
    for (const col of importableColumns.value) {
      const headerIndex = normalizedHeaders.findIndex(
        h => h === col.key.toLowerCase() || h === col.label.toLowerCase(),
      )
      if (headerIndex !== -1) {
        mapped[headers[headerIndex]!] = col.key
      }
    }
    // Check required columns
    const missing = requiredColumns.value
      .filter(col => !Object.values(mapped).includes(col.key))
      .map(col => col.label)
    if (missing.length > 0) {
      errors.push({
        type: 'missing_columns',
        message: `Missing required columns: ${missing.join(', ')}`,
        details: missing,
      })
    }
    return { mapped, missing, errors }
  }
  // ╔══════════════════════════════════════════════════════════════════╗
  // ║ ROW VALIDATION                                                    ║
  // ╚══════════════════════════════════════════════════════════════════╝
  function validateRow(row: Record<string, any>, rowIndex: number): ImportValidationError[] {
    const errors: ImportValidationError[] = []
    for (const col of importableColumns.value) {
      const value = row[col.key]
      const isEmpty = value === undefined || value === null || value === ''
      // Required check
      if (col.required && isEmpty) {
        errors.push({
          row: rowIndex + 1,
          column: col.key,
          columnLabel: col.label,
          message: `"${col.label}" is required`,
          value,
        })
        continue
      }
      if (isEmpty)
        continue
      // Type validation
      if (col.type) {
        const typeError = validateType(value, col.type, col.label, rowIndex)
        if (typeError) {
          errors.push(typeError)
          continue
        }
      }
      // Custom validation
      if (col.validate) {
        const customError = col.validate(value, row, rowIndex)
        if (customError) {
          errors.push({
            row: rowIndex + 1,
            column: col.key,
            columnLabel: col.label,
            message: customError,
            value,
          })
        }
      }
    }
    return errors
  }
  function validateType(
    value: any,
    type: string,
    label: string,
    rowIndex: number,
  ): ImportValidationError | null {
    const strValue = String(value).trim()
    switch (type) {
      case 'number': {
        if (Number.isNaN(Number(strValue))) {
          return {
            row: rowIndex + 1,
            column: '',
            columnLabel: label,
            message: `"${label}" must be a valid number, got "${strValue}"`,
            value,
          }
        }
        break
      }
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
        if (!emailRegex.test(strValue)) {
          return {
            row: rowIndex + 1,
            column: '',
            columnLabel: label,
            message: `"${label}" must be a valid email, got "${strValue}"`,
            value,
          }
        }
        break
      }
      case 'date': {
        const date = new Date(strValue)
        if (Number.isNaN(date.getTime())) {
          return {
            row: rowIndex + 1,
            column: '',
            columnLabel: label,
            message: `"${label}" must be a valid date, got "${strValue}"`,
            value,
          }
        }
        break
      }
      case 'boolean': {
        const valid = ['true', 'false', '1', '0', 'yes', 'no']
        if (!valid.includes(strValue.toLowerCase())) {
          return {
            row: rowIndex + 1,
            column: '',
            columnLabel: label,
            message: `"${label}" must be a boolean (true/false/1/0/yes/no), got "${strValue}"`,
            value,
          }
        }
        break
      }
    }
    return null
  }
  // ╔══════════════════════════════════════════════════════════════════╗
  // ║ PARSE & PREVIEW                                                   ║
  // ╚══════════════════════════════════════════════════════════════════╝
  /**
   * Parse a file and return a preview without submitting.
   * This validates the file, headers, and returns sample rows.
   */
  async function parseFile(file: File): Promise<ImportPreview | null> {
    clearState()
    // File-level validation
    const fErrors = validateFile(file)
    if (fErrors.length > 0) {
      fileErrors.value = fErrors
      fErrors.forEach(e => sonarStore.error('Import Error', e.message))
      return null
    }
    try {
      const text = await file.text()
      const rows = parseCSV(text)
      if (rows.length === 0) {
        fileErrors.value = [{ type: 'empty_file', message: 'No data rows found in the file' }]
        sonarStore.error('Import Error', 'No data rows found')
        return null
      }
      const headers: string[] = rows[0] as string[]
      const dataRows: string[][] = rows.slice(1)
      // Row count check
      if (dataRows.length > maxRows) {
        fileErrors.value = [
          {
            type: 'too_many_rows',
            message: `File contains ${dataRows.length} rows. Maximum allowed: ${maxRows}`,
          },
        ]
        sonarStore.error('Import Error', `Too many rows (${dataRows.length}). Max: ${maxRows}`)
        return null
      }
      // Column mapping
      const { mapped, missing, errors: colErrors } = validateColumns(headers as string[])
      if (colErrors.length > 0) {
        fileErrors.value = colErrors
      }
      // Build preview rows (first 5)
      const previewData = dataRows
        .slice(0, 5)
        .map((row: string[]) => mapRowToObject(row, headers as string[], mapped))
      const preview: ImportPreview = {
        headers,
        mappedColumns: mapped,
        totalRows: dataRows.length,
        previewRows: previewData,
        hasRequiredColumns: missing.length === 0,
        missingColumns: missing,
      }
      importPreview.value = preview
      return preview
    }
    catch (e) {
      const error: ImportFileError = {
        type: 'parse_error',
        message: `Failed to parse file: ${e instanceof Error ? e.message : 'Unknown error'}`,
      }
      fileErrors.value = [error]
      sonarStore.error('Parse Error', error.message)
      return null
    }
  }
  /**
   * Map a CSV row array to a keyed object using header → column mapping.
   */
  function mapRowToObject(
    row: string[],
    headers: string[],
    mapped: Record<string, string>,
  ): Record<string, any> {
    const obj: Record<string, any> = {}
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!
      const colKey = mapped[header]
      if (colKey) {
        const col = importableColumns.value.find(c => c.key === colKey)
        let value: any = row[i] ?? ''
        // Apply transform
        if (col?.transform) {
          value = col.transform(value)
        }
        // Apply type coercion
        if (col?.type === 'number' && value !== '') {
          value = Number(value)
        }
        else if (col?.type === 'boolean') {
          value = ['true', '1', 'yes'].includes(String(value).toLowerCase())
        }
        // Apply default
        if (
          (value === '' || value === undefined || value === null)
          && col?.defaultValue !== undefined
        ) {
          value = col.defaultValue
        }
        obj[colKey] = value
      }
    }
    return obj
  }
  // ╔══════════════════════════════════════════════════════════════════╗
  // ║ IMPORT                                                            ║
  // ╚══════════════════════════════════════════════════════════════════╝
  /**
   * Import data from a CSV file.
   *
   * 1. Validates file (extension, size)
   * 2. Parses CSV content
   * 3. Validates columns (required headers)
   * 4. Validates each row (required fields, types, custom rules)
   * 5. If valid, submits to the service (or returns parsed data)
   */
  async function importData(file: File): Promise<ImportResult> {
    clearState()
    importing.value = true
    progress.value = 0
    const result: ImportResult = {
      success: false,
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      data: [],
      validationErrors: [],
      fileErrors: [],
    }
    try {
      // Step 1: File validation
      const fErrors = validateFile(file)
      if (fErrors.length > 0) {
        result.fileErrors = fErrors
        fileErrors.value = fErrors
        fErrors.forEach(e => sonarStore.error('Import Error', e.message))
        return result
      }
      progress.value = 10
      // Step 2: Parse CSV
      const text = await file.text()
      const rows = parseCSV(text)
      if (rows.length < 2) {
        const error: ImportFileError = { type: 'empty_file', message: 'File has no data rows' }
        result.fileErrors = [error]
        fileErrors.value = [error]
        sonarStore.error('Import Error', 'No data rows found')
        return result
      }
      progress.value = 25
      const headers: string[] = rows[0] as string[]
      const dataRows: string[][] = rows.slice(1)
      result.totalRows = dataRows.length
      // Row count check
      if (dataRows.length > maxRows) {
        const error: ImportFileError = {
          type: 'too_many_rows',
          message: `Too many rows (${dataRows.length}). Maximum: ${maxRows}`,
        }
        result.fileErrors = [error]
        fileErrors.value = [error]
        sonarStore.error('Import Error', error.message)
        return result
      }
      // Step 3: Column validation
      const { mapped, errors: colErrors } = validateColumns(headers)
      if (colErrors.length > 0) {
        result.fileErrors = colErrors
        fileErrors.value = colErrors
        colErrors.forEach(e => sonarStore.error('Column Error', e.message))
        return result
      }
      progress.value = 40
      // Step 4: Row validation
      const allErrors: ImportValidationError[] = []
      const validData: Record<string, any>[] = []
      for (let i = 0; i < dataRows.length; i++) {
        const obj = mapRowToObject(dataRows[i]!, headers, mapped)
        const rowErrors = validateRow(obj, i)
        if (rowErrors.length > 0) {
          allErrors.push(...rowErrors)
        }
        else {
          validData.push(obj)
        }
        // Update progress (40-80% range)
        progress.value = 40 + Math.round((i / dataRows.length) * 40)
      }
      result.validRows = validData.length
      result.invalidRows = dataRows.length - validData.length
      result.validationErrors = allErrors
      result.data = validData
      validationErrors.value = allErrors
      if (allErrors.length > 0) {
        sonarStore.warning(
          'Validation Issues',
          `${allErrors.length} error(s) found in ${result.invalidRows} row(s)`,
        )
      }
      // Step 5: Submit to service (if available and has valid data)
      if (validData.length > 0 && config.service?.import) {
        progress.value = 85
        try {
          await config.service.import(file)
          result.success = true
          sonarStore.success(
            'Import Complete',
            `${validData.length} of ${dataRows.length} row(s) imported successfully`,
          )
          config.onRefresh?.()
        }
        catch (e) {
          sonarStore.error(
            'Import Failed',
            e instanceof Error ? e.message : 'Server error during import',
          )
        }
      }
      else if (validData.length > 0) {
        // No service — just return the parsed data
        result.success = true
        sonarStore.success(
          'Import Parsed',
          `${validData.length} of ${dataRows.length} row(s) validated successfully`,
        )
      }
      else {
        sonarStore.error(
          'Import Failed',
          'No valid rows to import — all rows have validation errors',
        )
      }
      progress.value = 100
      importResult.value = result
      if (result.success) {
        config.onImportSuccess?.(result)
      }
      else if (allErrors.length > 0) {
        config.onImportError?.(allErrors)
      }
      return result
    }
    catch (e) {
      const error: ImportFileError = {
        type: 'parse_error',
        message: e instanceof Error ? e.message : 'Unknown error during import',
      }
      result.fileErrors = [error]
      fileErrors.value = [error]
      sonarStore.error('Import Error', error.message)
      return result
    }
    finally {
      importing.value = false
    }
  }
  // ╔══════════════════════════════════════════════════════════════════╗
  // ║ EXPORT                                                            ║
  // ╚══════════════════════════════════════════════════════════════════╝
  /**
   * Export data to CSV.
   *
   * If a service.export() exists, uses the server-side export. Otherwise,
   * generates a client-side CSV from the provided data.
   */
  async function exportData(
    data?: Record<string, any>[],
    params?: Record<string, unknown>,
  ): Promise<void> {
    exporting.value = true
    try {
      let blob: Blob
      if (config.service?.export) {
        // Server-side export
        const result = await config.service.export(params)
        blob = result
      }
      else if (data && data.length > 0) {
        // Client-side CSV generation
        const csv = generateCSV(data, exportableColumns.value)
        blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      }
      else {
        sonarStore.warning('Export', 'No data available to export')
        return
      }
      // Download the file
      const filename
        = config.exportFilename
          ?? `${config.resourceName}_export_${new Date().toISOString().split('T')[0]}.csv`
      downloadBlob(blob, filename)
      sonarStore.success('Export Complete', `${config.resourceName} data exported successfully`)
      config.onExportSuccess?.()
    }
    catch (e) {
      sonarStore.error('Export Failed', e instanceof Error ? e.message : 'Unknown error')
    }
    finally {
      exporting.value = false
    }
  }
  /**
   * Export a template CSV with only column headers — useful for users
   * who want to fill in data manually.
   */
  function exportTemplate(): void {
    const cols = importableColumns.value
    const headers = cols.map(c => escapeCSVField(c.label))
    const requiredNote = cols.map(c => (c.required ? '(required)' : '(optional)'))
    const csv = [headers.join(delimiter), requiredNote.join(delimiter)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    downloadBlob(blob, `${config.resourceName}_template.csv`)
    sonarStore.info('Template', 'Import template downloaded')
  }
  function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  // ╔══════════════════════════════════════════════════════════════════╗
  // ║ FILE PICKER                                                       ║
  // ╚══════════════════════════════════════════════════════════════════╝
  /**
   * Open a native file picker and return the selected file.
   */
  function openFilePicker(): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = allowedExtensions.join(',')
      input.onchange = (e: any) => {
        const file = e.target.files?.[0]
        resolve(file ?? null)
      }
      input.click()
    })
  }
  /**
   * Open file picker → parse → validate → import.
   * One-liner for simple use cases.
   */
  async function pickAndImport(): Promise<ImportResult | null> {
    const file = await openFilePicker()
    if (!file)
      return null
    return importData(file)
  }
  /**
   * Open file picker → parse → preview (no submit).
   */
  async function pickAndPreview(): Promise<ImportPreview | null> {
    const file = await openFilePicker()
    if (!file)
      return null
    return parseFile(file)
  }
  // ╔══════════════════════════════════════════════════════════════════╗
  // ║ UTILITIES                                                         ║
  // ╚══════════════════════════════════════════════════════════════════╝
  function clearState(): void {
    importResult.value = null
    importPreview.value = null
    fileErrors.value = []
    validationErrors.value = []
    progress.value = 0
  }
  return {
    // State
    importing,
    exporting,
    progress,
    importResult,
    importPreview,
    fileErrors,
    validationErrors,
    hasErrors,
    errorSummary,
    // Column info
    exportableColumns,
    importableColumns,
    requiredColumns,
    // Core actions
    importData,
    exportData,
    exportTemplate,
    parseFile,
    // Convenience
    openFilePicker,
    pickAndImport,
    pickAndPreview,
    // Utilities
    clearState,
    generateCSV,
    parseCSV,
  }
}

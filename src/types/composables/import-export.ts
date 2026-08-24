/**
 * Import/Export column definition.
 * Each column represents a field that can be exported/imported.
 */
export interface ImportExportColumn {
  /** Column key — maps to the data field */
  key: string
  /** Display label for the column header */
  label: string
  /** Whether this column is required in import files */
  required?: boolean
  /** Data type for client-side validation */
  type?: 'string' | 'number' | 'email' | 'date' | 'boolean'
  /** Custom validation function — return error string on failure, null on success */
  validate?: (value: any, row: Record<string, any>, rowIndex: number) => string | null
  /** Transform value during import (e.g. trim, lowercase) */
  transform?: (value: any) => any
  /** Default value if column is missing or empty */
  defaultValue?: any
  /** Whether to include this column in exports (default: true) */
  exportable?: boolean
  /** Whether this column can be imported (default: true) */
  importable?: boolean
}
/**
 * Configuration options for useImportExport composable.
 */
export interface ImportExportConfig {
  /** Column definitions */
  columns: ImportExportColumn[]
  /** Resource name — used in filenames and toast messages */
  resourceName: string
  /** Service with optional export() and import() methods */
  service?: {
    export?: (params?: Record<string, unknown>) => Promise<Blob>
    import?: (file: File) => Promise<any>
  }
  /** File format: 'csv' (default) or 'xlsx' */
  format?: 'csv' | 'xlsx'
  /** CSV delimiter (default: ',') */
  delimiter?: string
  /** Maximum rows allowed in a single import */
  maxRows?: number
  /** Maximum file size in bytes (default: 5MB) */
  maxFileSize?: number
  /** Allowed file extensions (default: ['.csv']) */
  allowedExtensions?: string[]
  /** Whether to skip empty rows during import (default: true) */
  skipEmptyRows?: boolean
  /** Custom filename for export (default: resourceName_export_YYYY-MM-DD) */
  exportFilename?: string
  /** Callback after successful import */
  onImportSuccess?: (data: ImportResult) => void
  /** Callback after import error */
  onImportError?: (errors: ImportValidationError[]) => void
  /** Callback after successful export */
  onExportSuccess?: () => void
  /** Callback to refresh table after import */
  onRefresh?: () => void
}
/**
 * A single row-level validation error.
 */
export interface ImportValidationError {
  /** 1-based row number in the file */
  row: number
  /** Column key that failed */
  column: string
  /** Column label (for display) */
  columnLabel: string
  /** Human-readable error message */
  message: string
  /** The offending value */
  value?: any
}
/**
 * File-level validation error.
 */
export interface ImportFileError {
  type:
    | 'file_too_large'
    | 'invalid_extension'
    | 'empty_file'
    | 'too_many_rows'
    | 'missing_columns'
    | 'parse_error'
  message: string
  details?: string[]
}
/**
 * Result of an import operation.
 */
export interface ImportResult {
  /** Whether the import succeeded */
  success: boolean
  /** Number of rows successfully processed */
  totalRows: number
  /** Number of rows that passed validation */
  validRows: number
  /** Number of rows that failed validation */
  invalidRows: number
  /** Parsed and validated data ready for API submission */
  data: Record<string, any>[]
  /** Row-level validation errors */
  validationErrors: ImportValidationError[]
  /** File-level errors */
  fileErrors: ImportFileError[]
}
/**
 * Preview of parsed file data before submission.
 */
export interface ImportPreview {
  /** Column headers found in the file */
  headers: string[]
  /** Mapped columns (header → column key) */
  mappedColumns: Record<string, string>
  /** Total row count */
  totalRows: number
  /** First N rows for preview */
  previewRows: Record<string, any>[]
  /** Whether all required columns are present */
  hasRequiredColumns: boolean
  /** Missing required column keys */
  missingColumns: string[]
}

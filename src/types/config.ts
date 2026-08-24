import type { Formatter } from '@/composables/useFormatter'

export interface FormField {
  key: string
  label: string
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'date'
    | 'textarea'
    | 'select'
    | 'async-select'
    | 'file'
    | 'checkbox'
    | 'checkbox-group'
    | 'custom'
  required?: boolean
  options?: { value: any, label: string }[]
  optionsLoader?: (params?: {
    page?: number
    search?: string
  }) => Promise<{ data: { value: any, label: string }[], totalPages?: number }>
  optionsMap?: (item: any) => { value: any, label: string }
  groups?: { label: string, options: { value: any, label: string }[] }[]
  placeholder?: string
  rows?: number
  gridCols?: number
  requiredOnCreate?: boolean
  hideOnEdit?: boolean
  hideOnCreate?: boolean
  disabledOnEdit?: boolean
  disabledOnCreate?: boolean
  component?: any
  componentProps?: Record<string, any> | ((formData: Record<string, any>) => Record<string, any>)
  class?: string
  step?: number
}
export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  type?: 'text' | 'date' | 'currency' | 'badge' | 'boolean' | 'number'
  align?: 'left' | 'center' | 'right'
  component?: any
  props?: Record<string, any>
  formatter?: (value: any, row: any) => any
  className?: string
  hidden?: boolean
  editable?: boolean
}
export interface ViewField {
  key: string
  label: string
  type?: 'text' | 'date' | 'badge' | 'boolean' | 'image' | 'link' | 'currency' | 'list'
  format?: (value: any) => string
  options?: Record<string, any>
  to?: (value: any, item?: any) => string
  class?: string
}
export interface ViewSection {
  title: string
  fields?: ViewField[]
  cols?: 1 | 2 | 3
  component?: any
  props?: Record<string, any> | ((item: any) => Record<string, any>)
  className?: string
}
export interface ViewConfig {
  sections: ViewSection[]
  titleKey?: string
  headerActions?: any[]
  parentView?: () => ViewConfig
}
export interface FilterOption {
  label: string
  value: any
}
export interface FilterField {
  key: string
  label: string
  type:
    | 'text'
    | 'select'
    | 'multiselect'
    | 'date'
    | 'dateRange'
    | 'checkbox'
    | 'toggle'
    | 'range'
    | 'number'
  options?: FilterOption[]
  optionsLoader?: () => Promise<{ data: any[] }>
  placeholder?: string
  alias?: string
  transform?: (value: any) => any
}
export interface FilterConfig {
  fields: FilterField[]
  resource: string
}
export interface ActiveFilters {
  [key: string]: any
}
export interface ResourceAction {
  key: string
  label: string
  icon?: any
  variant?: 'default' | 'delete'
  show?: (row: any) => boolean
  handler?: (row: any) => void | Promise<void>
  to?: (row: any) => string | object
}
export interface StepConfig {
  label: string
  description?: string
  icon?: any
}
export interface ResourceConfig {
  /** Unified multi-step configuration */
  steps?: StepConfig[]
  /** Whether to show the stepper component for multi-step forms */
  showStepper?: boolean
  permissionKey?: string
  columns: TableColumn[]
  fields: FormField[]
  formatter?: Formatter
  view?: ViewConfig
  filters?: FilterConfig
  statusOptions?: { label: string, value: string }[]
  modalWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full'
  modalNoPadding?: boolean
  searchable?: boolean
  hideStatusFilters?: boolean
  actions?: {
    canAdd?: boolean
    canView?: boolean
    canEdit?: boolean
    canDelete?: boolean
    canArchive?: boolean
    custom?: ResourceAction[]
  }
  analytics?: {
    enabled: boolean
    widgets?: { label: string, value: string | number, trend?: string, trendUp?: boolean }[]
  }
  exportImport?: {
    canExport?: boolean
    canImport?: boolean
  }
  tableEnhancements?: {
    columnVisibility?: boolean
    rowSelection?: boolean
    inlineEditing?: boolean
    bulkActions?: {
      label: string
      action: (selectedIds: (string | number)[]) => void | Promise<void>
    }[]
  }
  dragAndDrop?: {
    enabled?: boolean
    onReorder?: (newOrder: any[]) => void | Promise<void>
  }
  auditTrail?: {
    enabled?: boolean
  }
}

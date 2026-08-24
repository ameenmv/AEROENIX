import type { ComputedRef, Ref } from 'vue'
import type { FormField } from '@/types'

export interface ValidationField {
  key: string
  label: string
  required?: boolean
  type?: string
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: unknown) => string | null
}
export interface FormTransform {
  /** Transform API item into form-friendly data when loading */
  toForm?: (item: unknown) => Record<string, unknown>
  /** Transform form data into API-ready payload before submit */
  toApi?: (data: Record<string, unknown>, mode: 'create' | 'edit') => Record<string, unknown>
}
export interface UseFormOptions<T = unknown> {
  /** Function to create an entity */
  createFn?: (data: Partial<T>) => Promise<T>
  /** Function to update an entity */
  updateFn?: (id: number | string, data: Partial<T>) => Promise<T>
  /** Function to get an entity by ID */
  getFn?: (id: number | string) => Promise<T>
  /**
   * Auto-fetch item when a route parameter is present.
   * `true` = defaults to route.params.id
   * `string` = custom route param key (e.g., 'userId')
   * `Ref` = reactive custom ID
   */
  autoLoadId?: boolean | string | Ref<string | number>
  /** Resource name for toast messages and query key */
  resourceName: string
  /** TanStack Query keys to invalidate on successful mutation */
  queryKey?: string[]
  /** Zod schema for validation */
  schema?: unknown
  /** Field-based validation rules (alternative to Zod) */
  validationFields?: ValidationField[]
  /** Form field definitions (for FormContainer integration) */
  fields?: FormField[]
  /**
   * When `true`, skips all internal validation.
   * Use this when managing validation externally (e.g. vee-validate).
   */
  disableNativeValidation?: boolean
  /** Data transform functions */
  transform?: FormTransform
  /** Called on successful create/update/load */
  onSuccess?: (action: 'create' | 'update' | 'load', data: T) => void
  /** Called on error */
  onError?: (action: string, error: unknown) => void
}
export interface MutationResult<T> {
  success: boolean
  data: T | null
  error?: unknown
}
export interface UseFormReturn<T> {
  // Form Data
  formData: Ref<Record<string, unknown>>
  setField: (key: string, value: unknown) => void
  getField: (key: string, defaultValue?: unknown) => unknown
  setFields: (data: Record<string, unknown>) => void
  resetForm: () => void
  clearForm: () => void
  // Mode
  mode: Ref<'create' | 'edit'>
  startCreate: () => void
  startEdit: (data: T) => void
  // Item
  item: Ref<T | null>
  loadItem: (id: number | string) => Promise<void>
  // Mutations
  submit: () => Promise<MutationResult<T>>
  create: (data?: Partial<T>) => Promise<MutationResult<T>>
  update: (id: number | string, data?: Partial<T>) => Promise<MutationResult<T>>
  // Validation
  errors: Ref<Record<string, string[]>>
  isValid: Ref<boolean>
  validate: (data?: Record<string, unknown>) => boolean
  clearErrors: () => void
  setError: (key: string, messages: string | string[]) => void
  hasError: (key: string) => boolean
  // State
  saving: ComputedRef<boolean>
  isCreating: ComputedRef<boolean>
  isUpdating: ComputedRef<boolean>
  hasChanges: () => boolean
  // Files
  files: Ref<Record<string, File>>
  handleFileChange: (event: Event, fileKey: string) => void
  // Fields (for FormContainer)
  computedFields: ComputedRef<FormField[]>
}

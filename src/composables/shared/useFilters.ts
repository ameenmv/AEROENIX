import type { FilterConfig, FilterField, FilterOption } from '@/types'

/**
 * Shorthand field definition for `defineFilters`.
 * - `label` auto-derived from `{resource}.fields.{key}` when omitted.
 * - `values` is a string[] shorthand for select/multiselect options;
 *   each value auto-generates `{ value, label: '{resource}.{key}s.{value}' }`.
 * - `endpoint` loads options from an API endpoint (uses the service's `dropdown` method).
 * - All other FilterField properties are passed through.
 */
export interface FilterFieldShorthand {
  key: string
  type: FilterField['type']
  /** Override the auto-generated i18n label */
  label?: string
  /** Shorthand: string values auto-expand to `{ value, label }` with i18n keys */
  values?: string[]
  /** Full options — takes priority over `values` */
  options?: FilterOption[]
  /** Optional key for deriving option labels (defaults to plural of key, e.g. 'role' → 'roles') */
  optionPrefix?: string
  /**
   * Load options from an API endpoint. Pass a function that returns `{ data: T[] }`.
   * You must also provide `valueKey` and `labelKey` to map the response to filter options.
   *
   * @example
   * ```ts
   * { key: 'city_id', type: 'select', endpoint: () => citiesService.dropdown(), labelKey: 'name', valueKey: 'id' }
   * ```
   */
  endpoint?: () => Promise<{ data: any[] }>
  /** Key to use as the option value from the endpoint response items. Default: 'id' */
  valueKey?: string
  /** Key to use as the option label from the endpoint response items. Default: 'name' */
  labelKey?: string
  placeholder?: string
  alias?: string
  optionsLoader?: FilterField['optionsLoader']
  transform?: FilterField['transform']
}

/**
 * Build a `FilterConfig` from a concise shorthand.
 *
 * @example
 * ```ts
 * const filters = defineFilters('users', [
 *   // Static options (values auto-derive i18n labels)
 *   { key: 'role', type: 'select', values: ['admin', 'editor', 'viewer', 'user'] },
 *   { key: 'status', type: 'select', values: ['active', 'inactive'] },
 *
 *   // Boolean toggle
 *   { key: 'is_verified', type: 'toggle' },
 *
 *   // Date range
 *   { key: 'created_at', type: 'dateRange' },
 *
 *   // API endpoint options
 *   { key: 'city_id', type: 'select', endpoint: () => citiesService.dropdown(), labelKey: 'name' },
 * ])
 * ```
 */
export function defineFilters(resource: string, fields: FilterFieldShorthand[]): FilterConfig {
  return {
    resource,
    fields: fields.map((f): FilterField => {
      // Auto-derive label from resource.fields.key
      const label = f.label ?? `${resource}.fields.${f.key}`

      // Auto-derive options from values[] shorthand
      let options = f.options
      if (!options && f.values) {
        const prefix = f.optionPrefix ?? `${f.key}s`
        options = f.values.map(
          (v): FilterOption => ({
            value: v,
            label: `${resource}.${prefix}.${v}`,
          }),
        )
      }

      // Build an optionsLoader from the endpoint shorthand
      let optionsLoader = f.optionsLoader
      if (!optionsLoader && f.endpoint) {
        const valueKey = f.valueKey ?? 'id'
        const labelKey = f.labelKey ?? 'name'
        const endpointFn = f.endpoint
        optionsLoader = async () => {
          const result = await endpointFn()
          return {
            data: result.data.map((item: any) => {
              const raw = item[labelKey]
              // Handle i18n objects like { en: "Admin", ar: "مدير" }
              const label
                = raw && typeof raw === 'object' && !Array.isArray(raw)
                  ? raw.en || raw.ar || String(raw)
                  : String(raw ?? '')
              return { value: item[valueKey], label }
            }),
          }
        }
      }

      return {
        key: f.key,
        label,
        type: f.type,
        ...(options && { options }),
        ...(f.placeholder && { placeholder: f.placeholder }),
        ...(f.alias && { alias: f.alias }),
        ...(optionsLoader && { optionsLoader }),
        ...(f.transform && { transform: f.transform }),
      }
    }),
  }
}

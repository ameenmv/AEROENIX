/**
 * Formatter — Adapter interface between API data and frontend components.
 *
 * Each transform is optional. If not provided, data passes through unchanged.
 *
 * @template TApi The raw entity type returned by the API
 */
export interface Formatter<TApi = any> {
  /**
   * Transform an API item for **table** display.
   * Runs on each item before it reaches the DataTable component.
   */
  toTable?: (item: TApi) => Record<string, unknown>
  /**
   * Transform an API item into **form** shape.
   * Called when loading an existing item into a create/edit form.
   * Use this to flatten nested objects, rename keys, omit read-only fields, etc.
   */
  toForm?: (item: TApi) => Record<string, unknown>
  /**
   * Transform form data back into **API** shape before submission.
   * Called before create/update mutations.
   *
   * @param formData The current form state
   * @param mode Whether this is a 'create' or 'edit' operation
   */
  toApi?: (formData: Record<string, unknown>, mode: 'create' | 'edit') => Record<string, unknown>
}
/**
 * Options for the useFormatter composable.
 */
export interface UseFormatterOptions<TApi = any> {
  /** The formatter definition. If undefined, all transforms are identity. */
  formatter?: Formatter<TApi>
}
/**
 * Composable that wraps a Formatter and provides transform utilities.
 *
 * All transforms are safe to call even when the formatter or individual
 * transform functions are undefined — data passes through unchanged.
 *
 * @example
 * ```ts
 * const { formatForTable, formatForForm, formatForApi } = useFormatter({
 *   formatter: clientsFormatter,
 * })
 *
 * const tableItems = formatForTable(rawApiItems)
 * const formData = formatForForm(rawApiItem)
 * const payload = formatForApi(formData, 'create')
 * ```
 */
export function useFormatter<TApi = any>(options: UseFormatterOptions<TApi> = {}) {
  const { formatter } = options
  /**
   * Transform an array of API items for table display.
   * If no `toTable` is defined, returns items unchanged.
   */
  const formatForTable = <T = TApi>(items: T[]): Record<string, unknown>[] => {
    if (!formatter?.toTable)
      return items as unknown as Record<string, unknown>[]
    return items.map(item => formatter.toTable!(item as unknown as TApi))
  }
  /**
   * Transform a single API item into form-friendly data.
   * If no `toForm` is defined, returns the item unchanged.
   */
  const formatForForm = <T = TApi>(item: T): Record<string, unknown> => {
    if (!formatter?.toForm)
      return item as unknown as Record<string, unknown>
    return formatter.toForm(item as unknown as TApi)
  }
  /**
   * Transform form data back into API-ready shape.
   * If no `toApi` is defined, returns data unchanged.
   */
  const formatForApi = (
    formData: Record<string, unknown>,
    mode: 'create' | 'edit',
  ): Record<string, unknown> => {
    if (!formatter?.toApi)
      return formData
    return formatter.toApi(formData, mode)
  }
  /**
   * Whether this formatter has any transforms defined.
   */
  const hasFormatter = !!formatter
  return {
    formatForTable,
    formatForForm,
    formatForApi,
    hasFormatter,
    formatter,
  }
}

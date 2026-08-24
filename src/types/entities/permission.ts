import type { TranslatableField } from './shared'

/**
 * Permission entity — matches backend PermissionResource scope definitions.
 *
 * Scopes:
 * - micro: id, name
 * - mini:  + guard_name, module, label (bilingual translated action)
 */
export interface Permission {
  id: number
  name: string
  guard_name: string
  module: string
  label: TranslatableField
}

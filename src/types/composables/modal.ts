import type { MutationResult } from './form'

export interface UseModalOptions<T = unknown> {
  onCreate?: (data: Partial<T>) => Promise<MutationResult<T>>
  onEdit?: (id: number | string, data: Partial<T>) => Promise<MutationResult<T>>
  onFetchOne?: (id: number | string) => Promise<void>
  getFormData?: () => Record<string, unknown>
  clearErrors?: () => void
}

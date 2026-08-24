import type { ComputedRef, Ref } from 'vue'

export interface UseDetailsOptions<T> {
  resourceName: string
  getFn: (id: string | number) => Promise<T>
  id?:
    | string
    | number
    | Ref<string | number | undefined | null>
    | ComputedRef<string | number | undefined | null>
  autoLoadId?: boolean
  queryKey?: unknown[]
}
export interface UseDetailsReturn<T> {
  item: Ref<T | undefined>
  loading: Ref<boolean>
  error: Ref<any>
  refresh: () => Promise<void>
}

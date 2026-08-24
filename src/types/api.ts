export interface ApiResponse<T = any> {
  data: T
  meta?: {
    total?: number
    per_page?: number
    current_page?: number
    last_page?: number
  }
  message?: string
  errors?: Record<string, string[]>
}
export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  per_page: number
  current_page: number
  last_page: number
}
/**
 * Standard CRUD service contract.
 *
 * All services (real + mock) implement this interface so they can be
 * used interchangeably with `useTable`, `useForm`, and `useDetails`.
 */
export interface ResourceService<T = any> {
  list: (params?: Record<string, unknown>) => Promise<{ data: T[], total: number }>
  get: (id: string | number) => Promise<T>
  create: (data: Record<string, unknown>) => Promise<T>
  update: (id: string | number, data: Record<string, unknown>) => Promise<T>
  delete: (id: string | number) => Promise<void>
}

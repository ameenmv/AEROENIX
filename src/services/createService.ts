import type {
  ApiListParams,
  ApiPaginatedResponse,
  ApiSuccessResponse,
  ExportResponse,
  ImportResponse,
  ServiceDropdownResult,
  ServiceListResult,
} from '@/types/services/api'
import api from './api'
import { createMockService } from './mock/createMockService'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Service Factory — createService<T>
 *
 * Generates a fully typed CRUD+ service matching all 10 backend operations
 * from neop-backend-base's BaseCrudController concerns:
 *
 *   HasIndex     → list()      — paginated listing with scope/filters
 *   HasDropdown  → dropdown()  — micro-scoped list for select inputs
 *   HasShow      → get()       — single resource by ID
 *   HasStore     → create()    — create new resource
 *   HasUpdate    → update()    — update existing resource
 *   HasDestroy   → delete()    — delete resource
 *   HasToggle    → toggle()    — toggle boolean/enum column
 *   HasExport    → export()    — export to xlsx/csv
 *   HasImport    → import()    — import from xlsx/csv file
 *
 * Usage:
 *   const usersService = createService<User>('/admin/v1/users')
 *   const { data, meta } = await usersService.list({ paginate: true, limit: 15 })
 *
 * All methods respect the backend's standard response envelope:
 *   Success: { success: true, message, data }
 *   Paginated: { success: true, message, data: [...], meta: {...}, links: {...} }
 * ──────────────────────────────────────────────────────────────────────────────
 */

export interface ResourceService<T> {
  /** GET /{resource} — Paginated list with scope/filters/sorting */
  list: (params?: ApiListParams) => Promise<ServiceListResult<T>>
  /** GET /{resource}/dropdown — Micro-scoped list for select inputs */
  dropdown: (params?: ApiListParams) => Promise<ServiceDropdownResult<T>>
  /** GET /{resource}/{id} — Single resource by ID */
  get: (id: string | number, params?: Pick<ApiListParams, 'scope' | 'include'>) => Promise<T>
  /** POST /{resource} — Create new resource */
  create: (data: Partial<T> | FormData) => Promise<T>
  /** PUT /{resource}/{id} — Update existing resource */
  update: (id: string | number, data: Partial<T> | FormData) => Promise<T>
  /** DELETE /{resource}/{id} — Delete resource */
  delete: (id: string | number) => Promise<void>
  /** PATCH /{resource}/{id}/toggle — Toggle boolean/enum column */
  toggle: (id: string | number, column?: string) => Promise<T>
  /** GET /{resource}/export — Export to file */
  export: (params?: ApiListParams & { format?: 'xlsx' | 'csv' }) => Promise<ExportResponse>
  /** POST /{resource}/import — Import from file */
  import: (file: File) => Promise<ImportResponse>
}

/** Configuration for createService */
export interface ServiceConfig {
  /**
   * Response data path for list operations.
   * Default: 'data' (backend returns { data: [...], meta, links })
   */
  dataPath?: string
  /**
   * Default scope for list operations.
   * Default: undefined (backend uses 'mini' via HasIndex::setIndexScope)
   */
  defaultListScope?: string
  /**
   * Default scope for dropdown operations.
   * Default: 'micro' (matches HasDropdown::setDropdownScope)
   */
  defaultDropdownScope?: string
  /**
   * Default pagination limit.
   * Default: 15 (matches backend BaseController::getPaginationParams)
   */
  defaultLimit?: number

  // ── Mock Configuration ──────────────────────────────────────────────────

  /**
   * When true, bypass API and use auto-generated mock data.
   * The service returns a fully functional mock that uses Faker.js to generate
   * realistic data based on `mockFields`. Toggle this to `false` when the
   * real API is ready.
   *
   * @example
   * ```ts
   * const service = createService<User>('/admin/v1/users', {
   *   useMock: true,
   *   mockFields: mockFieldsFromKeys(['id', 'name', 'email', 'status', 'created_at']),
   * })
   * ```
   */
  useMock?: boolean
  /**
   * Field generators for mock data. Each key is a field name, each value
   * is a function that returns a fake value.
   * Use `mockFieldsFromKeys()` from `@/services/mock` for zero-config setup.
   * Only used when `useMock` is `true`.
   */
  mockFields?: Record<string, () => unknown>
  /**
   * Number of mock records to generate. Default: 25.
   * Only used when `useMock` is `true`.
   */
  mockCount?: number
  /**
   * Simulated network delay in ms. Default: 200.
   * Only used when `useMock` is `true`.
   */
  mockDelay?: number
}

/**
 * Create a typed resource service for a given API endpoint.
 *
 * @param endpoint - API endpoint path (e.g. '/admin/v1/users')
 * @param config   - Optional service configuration
 * @returns        - Fully typed ResourceService<T>
 *
 * @example
 * ```ts
 * import type { User } from '@/types/entities/user'
 * const usersService = createService<User>('/admin/v1/users')
 *
 * // List with pagination
 * const { data, meta } = await usersService.list({
 *   paginate: true,
 *   limit: 15,
 *   include: 'roles,profile',
 *   filters: { status: 'active' },
 * })
 *
 * // Dropdown (micro scope, for select inputs)
 * const { data: options } = await usersService.dropdown({ search: 'john' })
 *
 * // CRUD
 * const user = await usersService.get(1, { include: 'roles' })
 * const created = await usersService.create({ name: 'John', email: 'john@example.com' })
 * const updated = await usersService.update(1, { name: 'Jane' })
 * await usersService.delete(1)
 *
 * // Toggle status
 * const toggled = await usersService.toggle(1, 'status')
 *
 * // Export/Import
 * const { download_url } = await usersService.export({ format: 'xlsx', filters: { status: 'active' } })
 * const { import_id } = await usersService.import(file)
 * ```
 */
export function createService<T = unknown>(
  endpoint: string,
  config: ServiceConfig = {},
): ResourceService<T> {
  // ── Mock Mode ─────────────────────────────────────────────────────────
  // When useMock is true, return a mock service instead of hitting the API.
  // The mock service implements the full ResourceService<T> interface.
  if (config.useMock && config.mockFields) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info(`[🧪 Mock] ${endpoint} → using auto-generated mock data`)
    }
    return createMockService<T & Record<string, unknown>>({
      fields: config.mockFields,
      count: config.mockCount,
      delay: config.mockDelay,
    }) as unknown as ResourceService<T>
  }

  const { dataPath = 'data', defaultDropdownScope = 'micro', defaultLimit = 15 } = config

  /**
   * Extract data from the backend response envelope.
   * Backend uses: { success, message, data: T } for single items
   * and { success, message, data: T[], meta, links } for lists.
   */

  function extractData(response: { data: any }): unknown {
    const body = response.data
    // If body has a 'data' key, extract it (standard envelope)
    if (dataPath in body) {
      return body[dataPath]
    }
    return body
  }

  return {
    // ── List (HasIndex) ───────────────────────────────────────────────
    async list(params: ApiListParams = {}): Promise<ServiceListResult<T>> {
      const queryParams = {
        paginate: params.paginate ?? true,
        limit: params.limit ?? defaultLimit,
        page: params.page,
        scope: params.scope,
        fields: params.fields,
        exclude: params.exclude,
        include: params.include,
        search: params.search,
        sort_by: params.sort_by,
        sort_dir: params.sort_dir,
        ...(params.filters ? { filters: params.filters } : {}),
      }

      const response = await api.get<ApiPaginatedResponse<T>>(endpoint, {
        params: queryParams,
      })

      return {
        data: response.data.data || [],
        meta: response.data.meta,
        links: response.data.links,
      }
    },

    // ── Dropdown (HasDropdown) ─────────────────────────────────────────
    async dropdown(params: ApiListParams = {}): Promise<ServiceDropdownResult<T>> {
      const queryParams = {
        paginate: params.paginate ?? true,
        limit: params.limit ?? defaultLimit,
        scope: params.scope ?? defaultDropdownScope,
        search: params.search,
        ...(params.filters ? { filters: params.filters } : {}),
      }

      const response = await api.get<ApiPaginatedResponse<T>>(`${endpoint}/dropdown`, {
        params: queryParams,
      })

      return {
        data: response.data.data || [],
        meta: response.data.meta,
        links: response.data.links,
      }
    },

    // ── Get (HasShow) ─────────────────────────────────────────────────
    async get(id, params = {}): Promise<T> {
      const response = await api.get<ApiSuccessResponse<T>>(`${endpoint}/${id}`, {
        params: {
          scope: params.scope,
          include: params.include,
        },
      })
      return extractData(response) as T
    },

    // ── Create (HasStore) ─────────────────────────────────────────────
    async create(data): Promise<T> {
      const isFormData = data instanceof FormData
      const response = await api.post<ApiSuccessResponse<T>>(endpoint, data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
      })
      return extractData(response) as T
    },

    // ── Update (HasUpdate) ────────────────────────────────────────────
    async update(id, data): Promise<T> {
      const isFormData = data instanceof FormData
      // FormData with PUT requires _method override (Laravel convention)
      if (isFormData) {
        data.append('_method', 'PUT')
        const response = await api.post<ApiSuccessResponse<T>>(`${endpoint}/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        return extractData(response) as T
      }
      const response = await api.put<ApiSuccessResponse<T>>(`${endpoint}/${id}`, data)
      return extractData(response) as T
    },

    // ── Delete (HasDestroy) ───────────────────────────────────────────
    async delete(id): Promise<void> {
      await api.delete(`${endpoint}/${id}`)
    },

    // ── Toggle (HasToggle) ────────────────────────────────────────────
    async toggle(id, column = 'status'): Promise<T> {
      const response = await api.patch<ApiSuccessResponse<T>>(`${endpoint}/${id}/toggle`, {
        column,
      })
      return extractData(response) as T
    },

    // ── Export (HasExport) ────────────────────────────────────────────
    async export(params = {}): Promise<ExportResponse> {
      const { format = 'xlsx', ...rest } = params
      const response = await api.get<ApiSuccessResponse<ExportResponse>>(`${endpoint}/export`, {
        params: { format, ...rest },
      })
      return extractData(response) as ExportResponse
    },

    // ── Import (HasImport) ────────────────────────────────────────────
    async import(file: File): Promise<ImportResponse> {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post<ApiSuccessResponse<ImportResponse>>(
        `${endpoint}/import`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      )
      return extractData(response) as ImportResponse
    },
  }
}

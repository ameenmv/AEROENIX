import type { ResourceService } from '@/services/createService'
import type {
  ApiListParams,
  ExportResponse,
  ImportResponse,
  PaginationLinks,
  PaginationMeta,
  ServiceDropdownResult,
  ServiceListResult,
} from '@/types/services/api'
import { generateMockRecords, generateSingleRecord } from './mockFromType'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Mock Service Factory — createMockService<T>
 *
 * Generates a fully typed ResourceService<T>-compatible mock that operates
 * against an in-memory array. All CRUD operations mutate the local store,
 * so creates/updates/deletes persist during the session.
 *
 * Usage:
 *   const service = createMockService<User>({
 *     fields: mockFieldsFromKeys(['id', 'name', 'email', 'status', 'created_at']),
 *     count: 25,
 *     delay: 300,
 *   })
 *
 * The returned service matches the ResourceService<T> interface 1:1,
 * so it can be used as a drop-in replacement for createService<T>().
 * ──────────────────────────────────────────────────────────────────────────────
 */

export interface MockServiceConfig {
  /** Field generators — key = field name, value = () => value */
  fields: Record<string, () => unknown>
  /** Number of records to generate. Default: 25 */
  count?: number
  /** Delay to simulate network latency (ms). Default: 200 */
  delay?: number
}

/** Simulate network latency */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** Build mock pagination meta */
function buildMeta(
  total: number,
  page: number,
  perPage: number,
  basePath = '/mock',
): { meta: PaginationMeta, links: PaginationLinks } {
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  return {
    meta: {
      current_page: page,
      from: total > 0 ? (page - 1) * perPage + 1 : null,
      last_page: lastPage,
      path: basePath,
      per_page: perPage,
      to: total > 0 ? Math.min(page * perPage, total) : null,
      total,
    },
    links: {
      first: `${basePath}?page=1`,
      last: `${basePath}?page=${lastPage}`,
      prev: page > 1 ? `${basePath}?page=${page - 1}` : null,
      next: page < lastPage ? `${basePath}?page=${page + 1}` : null,
    },
  }
}

/**
 * Create a fully typed mock service that operates on in-memory data.
 *
 * @param config - Mock configuration with field generators
 * @returns A ResourceService<T> compatible mock
 *
 * @example
 * ```ts
 * import { mockFieldsFromKeys } from './mockFromType'
 *
 * const usersService = createMockService<User>({
 *   fields: mockFieldsFromKeys(['id', 'name', 'email', 'phone', 'status', 'created_at']),
 *   count: 50,
 *   delay: 300,
 * })
 *
 * // Works exactly like a real service:
 * const { data, meta } = await usersService.list({ page: 1, limit: 10 })
 * const user = await usersService.get(1)
 * const created = await usersService.create({ name: 'John' })
 * await usersService.delete(1)
 * ```
 */
export function createMockService<T extends Record<string, unknown> = Record<string, unknown>>(
  config: MockServiceConfig,
): ResourceService<T> {
  const {
    fields,
    count = 25,
    delay = 200,
  } = config

  // ── In-memory store ─────────────────────────────────────────────────────
  let store: T[] = generateMockRecords<T>(fields, count)
  let nextId = count + 1

  // ── Helpers ─────────────────────────────────────────────────────────────

  /** Apply search, filter, sort to the store */
  function queryStore(params: ApiListParams): T[] {
    let items = [...store]

    // Search — match against all string values
    if (params.search) {
      const q = params.search.toLowerCase()
      items = items.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(q),
        ),
      )
    }

    // Filters
    if (params.filters) {
      for (const [key, value] of Object.entries(params.filters)) {
        if (value !== null && value !== undefined && value !== '') {
          items = items.filter((item) => {
            const itemValue = item[key]
            if (Array.isArray(value)) {
              return value.includes(itemValue)
            }
            return String(itemValue) === String(value)
          })
        }
      }
    }

    // Sort
    if (params.sort_by) {
      const dir = params.sort_dir === 'desc' ? -1 : 1
      items.sort((a, b) => {
        const aVal = a[params.sort_by!]
        const bVal = b[params.sort_by!]
        if (aVal == null)
          return 1
        if (bVal == null)
          return -1
        if (aVal < bVal)
          return -1 * dir
        if (aVal > bVal)
          return 1 * dir
        return 0
      })
    }

    return items
  }

  /** Paginate an array */
  function paginate(items: T[], page: number, limit: number): T[] {
    const start = (page - 1) * limit
    return items.slice(start, start + limit)
  }

  // ── Service Implementation ──────────────────────────────────────────────

  return {
    // ── List (HasIndex) ─────────────────────────────────────────────────
    async list(params: ApiListParams = {}): Promise<ServiceListResult<T>> {
      await sleep(delay)

      const page = params.page ?? 1
      const limit = params.limit ?? 15
      const filtered = queryStore(params)
      const paginateEnabled = params.paginate !== false
      const data = paginateEnabled ? paginate(filtered, page, limit) : filtered
      const { meta, links } = buildMeta(filtered.length, page, limit)

      return { data, meta, links }
    },

    // ── Dropdown (HasDropdown) ──────────────────────────────────────────
    async dropdown(params: ApiListParams = {}): Promise<ServiceDropdownResult<T>> {
      await sleep(delay)

      const filtered = queryStore(params)
      const limit = params.limit ?? 15
      const page = params.page ?? 1
      const data = paginate(filtered, page, limit)
      const { meta, links } = buildMeta(filtered.length, page, limit)

      return { data, meta, links }
    },

    // ── Get (HasShow) ──────────────────────────────────────────────────
    async get(id): Promise<T> {
      await sleep(delay)

      const item = store.find(r => (r as any).id === Number(id))
      if (!item) {
        throw Object.assign(new Error(`Mock: Record #${id} not found`), {
          status: 404,
          error_code: 'NOT_FOUND',
          errors: {},
        })
      }
      return { ...item }
    },

    // ── Create (HasStore) ──────────────────────────────────────────────
    async create(data): Promise<T> {
      await sleep(delay)

      const newRecord = generateSingleRecord<T>(fields, {
        ...(data instanceof FormData ? Object.fromEntries(data.entries()) : data),
        id: nextId++,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Partial<T>)

      store.unshift(newRecord)
      return { ...newRecord }
    },

    // ── Update (HasUpdate) ─────────────────────────────────────────────
    async update(id, data): Promise<T> {
      await sleep(delay)

      const index = store.findIndex(r => (r as any).id === Number(id))
      if (index === -1) {
        throw Object.assign(new Error(`Mock: Record #${id} not found`), {
          status: 404,
          error_code: 'NOT_FOUND',
          errors: {},
        })
      }

      const updateData = data instanceof FormData
        ? Object.fromEntries(data.entries())
        : data

      const updated = {
        ...store[index],
        ...updateData,
        updated_at: new Date().toISOString(),
      } as unknown as T

      store[index] = updated
      return { ...updated }
    },

    // ── Delete (HasDestroy) ────────────────────────────────────────────
    async delete(id): Promise<void> {
      await sleep(delay)

      const index = store.findIndex(r => (r as any).id === Number(id))
      if (index !== -1) {
        store.splice(index, 1)
      }
    },

    // ── Toggle (HasToggle) ─────────────────────────────────────────────
    async toggle(id, column = 'status'): Promise<T> {
      await sleep(delay)

      const index = store.findIndex(r => (r as any).id === Number(id))
      if (index === -1) {
        throw Object.assign(new Error(`Mock: Record #${id} not found`), {
          status: 404,
          error_code: 'NOT_FOUND',
          errors: {},
        })
      }

      const item = store[index]!
      const currentValue = item[column]

      // Toggle logic: boolean → flip, 'active'/'inactive' → swap
      let newValue: unknown
      if (typeof currentValue === 'boolean') {
        newValue = !currentValue
      }
      else if (currentValue === 'active') {
        newValue = 'inactive'
      }
      else if (currentValue === 'inactive') {
        newValue = 'active'
      }
      else {
        newValue = currentValue
      }

      const updated = {
        ...item,
        [column]: newValue,
        updated_at: new Date().toISOString(),
      } as T

      store[index] = updated
      return { ...updated }
    },

    // ── Export (HasExport) ──────────────────────────────────────────────
    async export(): Promise<ExportResponse> {
      await sleep(delay)
      return { download_url: 'https://mock.example.com/export/mock-data.xlsx' }
    },

    // ── Import (HasImport) ──────────────────────────────────────────────
    async import(): Promise<ImportResponse> {
      await sleep(delay)

      // Simulate adding 5 new records from "import"
      const imported = generateMockRecords<T>(fields, 5)
      for (const record of imported) {
        ;(record as any).id = nextId++
      }
      store = [...imported, ...store]

      return { import_id: `mock-import-${Date.now()}` }
    },
  }
}

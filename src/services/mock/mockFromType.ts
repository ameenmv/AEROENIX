import { resolveField } from './fakerFieldMap'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Mock Record Generator
 *
 * Generates arrays of typed mock records by mapping field names to Faker
 * generators. Works hand-in-hand with `fakerFieldMap.ts` for zero-config
 * field resolution.
 *
 * @example
 * ```ts
 * // Quick usage — auto-resolve all fields from names
 * const records = generateMockRecords(
 *   mockFieldsFromKeys(['id', 'name', 'email', 'status', 'created_at']),
 *   25,
 * )
 *
 * // Custom overrides
 * const records = generateMockRecords({
 *   ...mockFieldsFromKeys(['id', 'name', 'created_at']),
 *   role: () => faker.helpers.arrayElement(['admin', 'moderator']),
 * })
 * ```
 * ──────────────────────────────────────────────────────────────────────────────
 */

/**
 * Generate an array of mock records using field generator functions.
 *
 * @param fields - Map of field name → generator function
 * @param count  - Number of records to generate (default: 25)
 * @returns Array of generated records typed as T
 */
export function generateMockRecords<T = Record<string, unknown>>(
  fields: Record<string, () => unknown>,
  count = 25,
): T[] {
  return Array.from({ length: count }, (_, index) => {
    const record: Record<string, unknown> = {}
    for (const [key, generator] of Object.entries(fields)) {
      // Special handling for 'id' — ensure sequential IDs
      if (key === 'id') {
        record[key] = index + 1
      }
      else {
        record[key] = generator()
      }
    }
    return record as T
  })
}

/**
 * Create a field generator map from an array of field name strings.
 *
 * Each field name is resolved against the smart `fakerFieldMap` which
 * uses exact match → prefix match → suffix match → fallback.
 *
 * @param keys - Array of field names (e.g. ['id', 'name', 'email', 'status'])
 * @returns Map of field name → generator function
 *
 * @example
 * ```ts
 * const fields = mockFieldsFromKeys(['id', 'name', 'email', 'phone', 'status', 'created_at'])
 * // { id: () => 1, name: () => "John Doe", email: () => "john@...", ... }
 *
 * // Use directly with createService:
 * const service = createService<User>('/api/users', {
 *   useMock: true,
 *   mockFields: mockFieldsFromKeys(['id', 'name', 'email', 'status', 'created_at']),
 * })
 * ```
 */
export function mockFieldsFromKeys(keys: string[]): Record<string, () => unknown> {
  const fields: Record<string, () => unknown> = {}
  for (const key of keys) {
    fields[key] = resolveField(key)
  }
  return fields
}

/**
 * Generate a single mock record from field generators.
 * Useful for mock `get()`, `create()`, and `update()` responses.
 *
 * @param fields - Map of field name → generator function
 * @param overrides - Optional partial record to merge (e.g. incoming create/update data)
 * @returns A single generated record typed as T
 */
export function generateSingleRecord<T = Record<string, unknown>>(
  fields: Record<string, () => unknown>,
  overrides?: Partial<T>,
): T {
  const record: Record<string, unknown> = {}
  for (const [key, generator] of Object.entries(fields)) {
    record[key] = generator()
  }
  if (overrides) {
    Object.assign(record, overrides)
  }
  return record as T
}

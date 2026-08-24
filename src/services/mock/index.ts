/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Mock Service System — Barrel Export
 *
 * Usage:
 *   import { createMockService, mockFieldsFromKeys } from '@/services/mock'
 *
 *   const service = createMockService<User>({
 *     fields: mockFieldsFromKeys(['id', 'name', 'email', 'status', 'created_at']),
 *   })
 * ──────────────────────────────────────────────────────────────────────────────
 */

// Core factory
export { createMockService } from './createMockService'
export type { MockServiceConfig } from './createMockService'

// Field resolution (for advanced/custom usage)
export { FIELD_MAP, resolveField } from './fakerFieldMap'

// Record generators
export { generateMockRecords, generateSingleRecord, mockFieldsFromKeys } from './mockFromType'

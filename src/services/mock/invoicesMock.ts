/**
 * Legacy mock data file.
 * Prefer using `useMock: true` + `mockFieldsFromKeys()` in the service config.
 * This file is kept for backwards compatibility with direct `mockData` prop usage.
 */
import { generateMockRecords, mockFieldsFromKeys } from '@/services/mock'

export const invoicesMockData = generateMockRecords(
  mockFieldsFromKeys(['id', 'created_at']),
  // TODO: Add your entity field names:
  // mockFieldsFromKeys(['id', 'name', 'email', 'status', 'created_at']),
  25,
)

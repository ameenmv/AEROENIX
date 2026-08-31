/**
 * Permission entity — aligned with Aeroenix backend.
 *
 * Backend: app/Http/Controllers/V1/Platform/PermissionController.php
 *
 * GET /platform/permissions returns:
 *   data.permissions: [{ id: number, action: string }]
 *
 * Permissions use dot-notation actions: "hotel.manage", "bookings.view", etc.
 */
export interface Permission {
  id: number
  /** Dot-notation permission action, e.g. "hotel.manage", "bookings.view" */
  action: string
}

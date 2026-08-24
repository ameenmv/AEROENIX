// ─── Admin Status ───────────────────────────────────────────────────────────
// Backend: App\Enums\Admins\AdminStatusEnum
export const AdminStatus = {
  ACTIVE: 1,
  INACTIVE: 2,
  SUSPENDED: 3,
} as const

// eslint-disable-next-line ts/no-redeclare
export type AdminStatus = (typeof AdminStatus)[keyof typeof AdminStatus]

// ─── Admin Status Colors ────────────────────────────────────────────────────
// Mirrors AdminStatusEnum::metadata() color values
export const AdminStatusColor: Record<AdminStatus, string> = {
  [AdminStatus.ACTIVE]: 'green',
  [AdminStatus.INACTIVE]: 'gray',
  [AdminStatus.SUSPENDED]: 'red',
}

// ─── Admin Status Labels ────────────────────────────────────────────────────
export const AdminStatusLabel: Record<AdminStatus, string> = {
  [AdminStatus.ACTIVE]: 'Active',
  [AdminStatus.INACTIVE]: 'Inactive',
  [AdminStatus.SUSPENDED]: 'Suspended',
}

// ─── User Status ────────────────────────────────────────────────────────────
// Backend: App\Enums\UserStatusEnum
export const UserStatus = {
  ACTIVE: 1,
  INACTIVE: 2,
  SUSPENDED: 3,
  PENDING: 4,
} as const

// eslint-disable-next-line ts/no-redeclare
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]

// ─── User Status Colors ────────────────────────────────────────────────────
// Mirrors UserStatusEnum::metadata() color values
export const UserStatusColor: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'green',
  [UserStatus.INACTIVE]: 'gray',
  [UserStatus.SUSPENDED]: 'red',
  [UserStatus.PENDING]: 'yellow',
}

// ─── User Status Labels ────────────────────────────────────────────────────
export const UserStatusLabel: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'Active',
  [UserStatus.INACTIVE]: 'Inactive',
  [UserStatus.SUSPENDED]: 'Suspended',
  [UserStatus.PENDING]: 'Pending',
}

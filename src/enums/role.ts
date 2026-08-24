// ─── Role Status ────────────────────────────────────────────────────────────
// Backend: App\Enums\Roles\RoleStatusEnum
export const RoleStatus = {
  INACTIVE: 0,
  ACTIVE: 1,
} as const

// eslint-disable-next-line ts/no-redeclare
export type RoleStatus = (typeof RoleStatus)[keyof typeof RoleStatus]

// ─── Role Type ──────────────────────────────────────────────────────────────
// Backend: App\Enums\Roles\RoleTypeEnum
export const RoleType = {
  OWNER: 1,
  ADMIN: 2,
  AGENT: 3,
  CUSTOM: 4,
} as const

// eslint-disable-next-line ts/no-redeclare
export type RoleType = (typeof RoleType)[keyof typeof RoleType]

// ─── Invitation Status ──────────────────────────────────────────────────────
// Backend: App\Enums\Roles\InvitationStatusEnum
export const InvitationStatus = {
  PENDING: 1,
  ACCEPTED: 2,
  EXPIRED: 3,
  REVOKED: 4,
} as const

// eslint-disable-next-line ts/no-redeclare
export type InvitationStatus = (typeof InvitationStatus)[keyof typeof InvitationStatus]

// ─── Membership Status ──────────────────────────────────────────────────────
// Backend: App\Enums\Roles\MembershipStatusEnum
export const MembershipStatus = {
  ACTIVE: 1,
  SUSPENDED: 2,
} as const

// eslint-disable-next-line ts/no-redeclare
export type MembershipStatus = (typeof MembershipStatus)[keyof typeof MembershipStatus]

// ─── Team Status ────────────────────────────────────────────────────────────
// Backend: App\Enums\Teams\TeamStatusEnum
export const TeamStatus = {
  ACTIVE: 1,
  INACTIVE: 2,
} as const

// eslint-disable-next-line ts/no-redeclare
export type TeamStatus = (typeof TeamStatus)[keyof typeof TeamStatus]

// ─── Notification Status ────────────────────────────────────────────────────
// Backend: App\Enums\Notifications\NotificationStatusEnum
export const NotificationStatus = {
  DRAFT: 0,
  PENDING: 1,
  SUCCESS: 2,
  FAIL: 3,
} as const

// eslint-disable-next-line ts/no-redeclare
export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus]

export const NotificationStatusColor: Record<number, string> = {
  [NotificationStatus.DRAFT]: 'gray',
  [NotificationStatus.PENDING]: 'yellow',
  [NotificationStatus.SUCCESS]: 'green',
  [NotificationStatus.FAIL]: 'red',
}

export const NotificationStatusLabel: Record<number, string> = {
  [NotificationStatus.DRAFT]: 'Draft',
  [NotificationStatus.PENDING]: 'Pending',
  [NotificationStatus.SUCCESS]: 'Success',
  [NotificationStatus.FAIL]: 'Failed',
}

// ─── Notification Type ──────────────────────────────────────────────────────
// Backend: App\Enums\Notifications\NotificationTypeEnum
export const NotificationType = {
  GENERAL: 1,
  MARKET: 2,
  WALLET: 3,
  OPERATIONS: 4,
} as const

// eslint-disable-next-line ts/no-redeclare
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

// ─── Notification Channel ───────────────────────────────────────────────────
// Backend: App\Enums\Notifications\ChannelEnum
export const NotificationChannel = {
  EMAIL: 1,
  IN_APP: 2,
  PUSH: 3,
  SMS: 4,
} as const

// eslint-disable-next-line ts/no-redeclare
export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel]

// ─── Audience Type ──────────────────────────────────────────────────────────
// Backend: App\Enums\Notifications\AudienceTypeEnum
export const AudienceType = {
  ADMINS: 1,
  USERS: 2,
} as const

// eslint-disable-next-line ts/no-redeclare
export type AudienceType = (typeof AudienceType)[keyof typeof AudienceType]

// ─── Send To ────────────────────────────────────────────────────────────────
// Backend: App\Enums\Notifications\SendToEnum
export const SendTo = {
  ALL: 1,
  SPECIFIC_USER: 2,
  SPECIFIC_ROLE: 3,
  SPECIFIC_ADMIN: 4,
} as const

// eslint-disable-next-line ts/no-redeclare
export type SendTo = (typeof SendTo)[keyof typeof SendTo]

// ─── Recipient Status ───────────────────────────────────────────────────────
// Backend: App\Enums\Notifications\RecipientStatusEnum
export const RecipientStatus = {
  PENDING: 0,
  SUCCESS: 1,
  FAIL: 2,
} as const

// eslint-disable-next-line ts/no-redeclare
export type RecipientStatus = (typeof RecipientStatus)[keyof typeof RecipientStatus]

export const RecipientStatusColor: Record<number, string> = {
  [RecipientStatus.PENDING]: 'yellow',
  [RecipientStatus.SUCCESS]: 'green',
  [RecipientStatus.FAIL]: 'red',
}

// ─── Notification Target ────────────────────────────────────────────────────
// Backend: App\Enums\Notifications\NotificationTargetEnum (string-backed)
export const NotificationTarget = {
  MANUAL: 'manual',
  TICKET: 'ticket',
} as const

// eslint-disable-next-line ts/no-redeclare
export type NotificationTarget = (typeof NotificationTarget)[keyof typeof NotificationTarget]

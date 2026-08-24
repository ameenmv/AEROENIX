// ─── Email Status ───────────────────────────────────────────────────────────
// Backend: App\Enums\EmailStatusEnum
export const EmailStatus = {
  SENT: 1,
  FAILED: 2,
} as const

// eslint-disable-next-line ts/no-redeclare
export type EmailStatus = (typeof EmailStatus)[keyof typeof EmailStatus]

export const EmailStatusColor: Record<EmailStatus, string> = {
  [EmailStatus.SENT]: 'green',
  [EmailStatus.FAILED]: 'red',
}

export const EmailStatusLabel: Record<EmailStatus, string> = {
  [EmailStatus.SENT]: 'Sent',
  [EmailStatus.FAILED]: 'Failed',
}

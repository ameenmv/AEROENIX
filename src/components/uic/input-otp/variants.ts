/**
 * InputOTP variants — one-time password / code input.
 *
 * Uses vue-input-otp under the hood.
 *
 * Sub-components:
 *  - InputOTP (root)
 *  - InputOTPGroup (groups slots together)
 *  - InputOTPSlot (individual character slot)
 *  - InputOTPSeparator (visual separator between groups)
 *
 * Common props:
 *  - numInputs: number (number of OTP digits)
 *  - separator: string
 */
export const inputOtpDefaults = {
  numInputs: 6,
} as const

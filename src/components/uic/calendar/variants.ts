/**
 * Calendar variants — styling presets for the calendar component.
 *
 * The Calendar uses reka-ui Calendar under the hood with shadcn styling.
 *
 * Common props:
 *  - mode: 'single' | 'range'
 *  - weekStartsOn: 0 (Sunday) | 1 (Monday)
 *  - fixedWeeks: boolean
 *  - numberOfMonths: number
 */
export const calendarDefaults = {
  weekStartsOn: 0,
  fixedWeeks: true,
  numberOfMonths: 1,
} as const

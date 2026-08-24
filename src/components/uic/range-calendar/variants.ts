/**
 * RangeCalendar variants — calendar for selecting date ranges.
 *
 * Based on reka-ui RangeCalendar with shadcn styling.
 *
 * Common props:
 *  - numberOfMonths: number (side-by-side months)
 *  - weekStartsOn: 0-6
 *  - fixedWeeks: boolean
 */
export const rangeCalendarDefaults = {
  numberOfMonths: 2,
  weekStartsOn: 0,
  fixedWeeks: true,
} as const

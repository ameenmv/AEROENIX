/**
 * PinInput variants — PIN / code entry field.
 *
 * Sub-components:
 *  - PinInput (root)
 *  - PinInputGroup (slot container)
 *  - PinInputSlot (individual character slot)
 *  - PinInputSeparator (visual separator)
 *
 * Common props:
 *  - length: number
 *  - type: 'text' | 'number'
 *  - mask: boolean (hide input like password)
 *  - placeholder: string
 */
export const pinInputDefaults = {
  length: 4,
  type: 'text' as const,
  mask: false,
  placeholder: '○',
} as const

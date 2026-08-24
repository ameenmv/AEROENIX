/**
 * DropdownMenu variants — dropdown triggered by a button.
 *
 * Sub-components:
 *  - DropdownMenu (root)
 *  - DropdownMenuTrigger (button trigger)
 *  - DropdownMenuContent (dropdown panel)
 *  - DropdownMenuItem (action item)
 *  - DropdownMenuCheckboxItem / DropdownMenuRadioItem / DropdownMenuRadioGroup
 *  - DropdownMenuLabel (section label)
 *  - DropdownMenuSeparator (divider)
 *  - DropdownMenuSub / DropdownMenuSubTrigger / DropdownMenuSubContent (nested)
 *  - DropdownMenuShortcut (keyboard shortcut text)
 */
export const dropdownMenuDefaults = {
  align: 'end' as const,
  sideOffset: 4,
} as const

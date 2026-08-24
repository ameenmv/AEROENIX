/**
 * ContextMenu variants — right-click context menu.
 *
 * Sub-components:
 *  - ContextMenu (root)
 *  - ContextMenuTrigger (element that triggers on right-click)
 *  - ContextMenuContent (dropdown content)
 *  - ContextMenuItem (menu item)
 *  - ContextMenuCheckboxItem / ContextMenuRadioItem (selectable items)
 *  - ContextMenuLabel (section label)
 *  - ContextMenuSeparator (divider)
 *  - ContextMenuSub / ContextMenuSubTrigger / ContextMenuSubContent (nested menus)
 */
export const contextMenuDefaults = {
  alignOffset: -4,
} as const

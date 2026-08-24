/**
 * Drawer variants — sliding panel from an edge of the screen.
 * Uses vaul-vue under the hood.
 *
 * Common props:
 *  - direction: 'top' | 'right' | 'bottom' | 'left'
 *  - shouldScaleBackground: boolean
 *  - snapPoints: number[]
 *
 * Sub-components:
 *  - Drawer (root)
 *  - DrawerTrigger / DrawerClose (open/close controls)
 *  - DrawerContent (main sliding panel)
 *  - DrawerHeader / DrawerFooter (layout sections)
 *  - DrawerTitle / DrawerDescription (accessible labels)
 */
export const drawerDefaults = {
  direction: 'bottom' as const,
  shouldScaleBackground: true,
}

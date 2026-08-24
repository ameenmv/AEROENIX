/**
 * Resizable variants — resizable panel layout.
 *
 * Sub-components:
 *  - ResizablePanelGroup (container for panels)
 *  - ResizablePanel (individual resizable panel)
 *  - ResizableHandle (drag handle between panels)
 *
 * Common props on ResizablePanelGroup:
 *  - direction: 'horizontal' | 'vertical'
 *
 * Common props on ResizablePanel:
 *  - defaultSize: number (percentage)
 *  - minSize / maxSize: number
 *  - collapsible: boolean
 */
export const resizableDefaults = {
  direction: 'horizontal' as const,
} as const

/**
 * Script to generate variants.ts files for all uic components that don't have them.
 * Run with: bun src/scripts/generate-variants.ts
 */
import { existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const UIC_DIR = join(__dirname, '../components/uic')

// Components and their meaningful variants
const componentVariants: Record<string, string> = {
  'accordion': `import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const accordionVariants = cva('w-full', {
  variants: {
    variant: {
      default: '',
      bordered: 'border rounded-lg divide-y',
      separated: 'space-y-2 [&>*]:rounded-lg [&>*]:border',
    },
    size: {
      sm: '[&_[data-slot=accordion-trigger]]:py-2 [&_[data-slot=accordion-trigger]]:text-sm',
      default: '[&_[data-slot=accordion-trigger]]:py-4',
      lg: '[&_[data-slot=accordion-trigger]]:py-5 [&_[data-slot=accordion-trigger]]:text-lg',
    },
  },
  defaultVariants: { variant: 'default', size: 'default' },
})

export type AccordionVariants = VariantProps<typeof accordionVariants>
`,

  'alert-dialog': `import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const alertDialogVariants = cva('', {
  variants: {
    size: {
      sm: 'max-w-sm',
      default: 'max-w-lg',
      lg: 'max-w-2xl',
      full: 'max-w-[90vw]',
    },
  },
  defaultVariants: { size: 'default' },
})

export type AlertDialogVariants = VariantProps<typeof alertDialogVariants>
`,

  'aspect-ratio': `/**
 * AspectRatio variants — ratio presets for common use cases.
 * This component wraps reka-ui AspectRatio and accepts a \`ratio\` number prop.
 *
 * Common ratios:
 *  - 1      → Square (1:1)
 *  - 16/9   → Widescreen video
 *  - 4/3    → Standard display
 *  - 21/9   → Ultra-wide
 *  - 3/2    → Classic photo
 *  - 2/3    → Portrait photo
 */
export const aspectRatioPresets = {
  square: 1,
  video: 16 / 9,
  photo: 4 / 3,
  ultrawide: 21 / 9,
  classic: 3 / 2,
  portrait: 2 / 3,
} as const

export type AspectRatioPreset = keyof typeof aspectRatioPresets
`,

  'avatar': `import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-[10px]',
        sm: 'h-8 w-8 text-xs',
        default: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
        '2xl': 'h-20 w-20 text-xl',
      },
      shape: {
        circle: 'rounded-full',
        square: 'rounded-md',
      },
    },
    defaultVariants: { size: 'default', shape: 'circle' },
  },
)

export type AvatarVariants = VariantProps<typeof avatarVariants>
`,

  'breadcrumb': `/**
 * Breadcrumb variants — typically unstyled, uses link styles.
 *
 * Available sub-components:
 *  - Breadcrumb (root wrapper)
 *  - BreadcrumbList (ol container)
 *  - BreadcrumbItem (li item)
 *  - BreadcrumbLink (anchor/link)
 *  - BreadcrumbPage (current page — non-interactive)
 *  - BreadcrumbSeparator (divider between items)
 */
export const breadcrumbDefaults = {
  separator: '/',
  maxItems: Infinity,
} as const
`,

  'calendar': `/**
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
`,

  'card': `import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const cardVariants = cva(
  'rounded-xl text-card-foreground',
  {
    variants: {
      variant: {
        default: 'bg-card border shadow-sm',
        outline: 'border bg-transparent',
        ghost: 'bg-transparent border-none shadow-none',
        elevated: 'bg-card shadow-md',
        filled: 'bg-muted border-none',
      },
      padding: {
        none: '',
        sm: '[&_[data-slot=card-content]]:p-4',
        default: '[&_[data-slot=card-content]]:p-6',
        lg: '[&_[data-slot=card-content]]:p-8',
      },
    },
    defaultVariants: { variant: 'default', padding: 'default' },
  },
)

export type CardVariants = VariantProps<typeof cardVariants>
`,

  'carousel': `/**
 * Carousel variants — configuration presets for the carousel component.
 *
 * The Carousel wraps embla-carousel-vue and supports:
 *  - orientation: 'horizontal' | 'vertical'
 *  - loop: boolean (infinite scrolling)
 *  - autoplay: via embla-carousel-autoplay plugin
 *
 * Sub-components:
 *  - Carousel (root container)
 *  - CarouselContent (slides wrapper)
 *  - CarouselItem (individual slide)
 *  - CarouselNext / CarouselPrevious (navigation buttons)
 */
export const carouselDefaults = {
  orientation: 'horizontal' as const,
  loop: false,
}
`,

  'checkbox': `import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const checkboxVariants = cva(
  'peer shrink-0 rounded-[4px] border border-primary shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        default: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
      variant: {
        default: 'data-[state=checked]:bg-primary',
        success: 'data-[state=checked]:bg-success data-[state=checked]:border-success',
        destructive: 'data-[state=checked]:bg-destructive data-[state=checked]:border-destructive',
      },
    },
    defaultVariants: { size: 'default', variant: 'default' },
  },
)

export type CheckboxVariants = VariantProps<typeof checkboxVariants>
`,

  'collapsible': `/**
 * Collapsible variants — a single collapsible section.
 *
 * Sub-components:
 *  - Collapsible (root — manages open/close state)
 *  - CollapsibleTrigger (toggle button)
 *  - CollapsibleContent (animated content area)
 *
 * Common props:
 *  - open: boolean (controlled)
 *  - defaultOpen: boolean (uncontrolled)
 *  - disabled: boolean
 */
export const collapsibleDefaults = {
  defaultOpen: false,
  disabled: false,
} as const
`,

  'combobox': `/**
 * Combobox variants — searchable select with autocomplete.
 *
 * Sub-components:
 *  - Combobox (root)
 *  - ComboboxAnchor (trigger anchor)
 *  - ComboboxInput (search input)
 *  - ComboboxTrigger (dropdown trigger button)
 *  - ComboboxList / ComboboxViewport (scrollable list area)
 *  - ComboboxGroup / ComboboxItem (grouping and items)
 *  - ComboboxItemIndicator (check mark)
 *  - ComboboxEmpty (empty state)
 *  - ComboboxSeparator (divider)
 */
export const comboboxDefaults = {
  placeholder: 'Search...',
  emptyText: 'No results found.',
} as const
`,

  'command': `/**
 * Command variants — command palette (cmdk-style).
 *
 * Sub-components:
 *  - Command (root)
 *  - CommandInput (search input)
 *  - CommandList (results list)
 *  - CommandEmpty (no results)
 *  - CommandGroup (grouped items)
 *  - CommandItem (selectable item)
 *  - CommandSeparator (divider)
 *  - CommandShortcut (keyboard shortcut display)
 */
export const commandDefaults = {
  placeholder: 'Type a command or search...',
} as const
`,

  'context-menu': `/**
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
`,

  'dialog': `import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const dialogVariants = cva('', {
  variants: {
    size: {
      sm: '[&_[data-slot=dialog-content]]:max-w-sm',
      default: '[&_[data-slot=dialog-content]]:max-w-lg',
      lg: '[&_[data-slot=dialog-content]]:max-w-2xl',
      xl: '[&_[data-slot=dialog-content]]:max-w-4xl',
      full: '[&_[data-slot=dialog-content]]:max-w-[90vw]',
    },
  },
  defaultVariants: { size: 'default' },
})

export type DialogVariants = VariantProps<typeof dialogVariants>
`,

  'drawer': `/**
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
`,

  'dropdown-menu': `/**
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
`,

  'file-upload': `/**
 * FileUpload variants — file upload with drag & drop.
 *
 * Props:
 *  - accept: string (MIME types, e.g. 'image/*')
 *  - multiple: boolean
 *  - maxSize: number (in bytes)
 *  - disabled: boolean
 */
export const fileUploadDefaults = {
  accept: '*/*',
  multiple: false,
  maxSize: 10 * 1024 * 1024, // 10MB
} as const
`,

  'form': `/**
 * Form variants — vee-validate + zod form system.
 *
 * Sub-components:
 *  - FormItem (wrapper with field context)
 *  - FormLabel (accessible label)
 *  - FormControl (wraps the input element)
 *  - FormDescription (help text)
 *  - FormMessage (validation error message)
 *
 * Usage with useFormField() composable for field-level state.
 */
export const formDefaults = {
  validateOnMount: false,
  validateOnInput: true,
} as const
`,

  'hover-card': `/**
 * HoverCard variants — card that appears on hover.
 *
 * Sub-components:
 *  - HoverCard (root)
 *  - HoverCardTrigger (element that triggers the card)
 *  - HoverCardContent (the card content)
 *
 * Common props:
 *  - openDelay: number (ms before showing)
 *  - closeDelay: number (ms before hiding)
 */
export const hoverCardDefaults = {
  openDelay: 200,
  closeDelay: 100,
  align: 'center' as const,
  sideOffset: 4,
} as const
`,

  'input': `import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const inputVariants = cva(
  'flex w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
  {
    variants: {
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-9',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-5 text-lg',
      },
      variant: {
        default: 'border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        search: 'pl-9 bg-card border-none ring-1 ring-border shadow-none h-9 text-xs',
        ghost: 'border-none shadow-none bg-transparent focus-visible:ring-0',
        error: 'border-destructive focus-visible:ring-destructive focus-visible:ring-[3px] focus-visible:ring-destructive/20',
      },
    },
    defaultVariants: { size: 'default', variant: 'default' },
  },
)

export type InputVariants = VariantProps<typeof inputVariants>
`,

  'input-otp': `/**
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
`,

  'kbd': `/**
 * Kbd variants — keyboard shortcut display.
 *
 * Sub-components:
 *  - Kbd (single key)
 *  - KbdGroup (multiple keys joined together)
 *
 * Usage: <Kbd>⌘</Kbd><Kbd>K</Kbd>
 */
export const kbdDefaults = {
  separator: '+',
} as const
`,

  'label': `/**
 * Label variants — accessible form label.
 *
 * Wraps reka-ui Label with shadcn styling.
 *
 * Default styles: text-sm font-medium leading-none
 * Disabled state: peer-disabled:cursor-not-allowed peer-disabled:opacity-70
 */
export const labelDefaults = {} as const
`,

  'menubar': `/**
 * Menubar variants — horizontal menu bar with dropdowns.
 *
 * Sub-components:
 *  - Menubar (root bar)
 *  - MenubarMenu (individual menu)
 *  - MenubarTrigger (menu trigger button)
 *  - MenubarContent (dropdown content)
 *  - MenubarItem (action item)
 *  - MenubarCheckboxItem / MenubarRadioItem / MenubarRadioGroup
 *  - MenubarLabel / MenubarSeparator
 *  - MenubarSub / MenubarSubTrigger / MenubarSubContent (nested menus)
 *  - MenubarShortcut (keyboard shortcut display)
 */
export const menubarDefaults = {} as const
`,

  'native-select': `import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const nativeSelectVariants = cva(
  'flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-colors focus:border-ring focus:ring-ring/50 focus:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-8 text-xs',
        default: 'h-9',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: { size: 'default' },
  },
)

export type NativeSelectVariants = VariantProps<typeof nativeSelectVariants>
`,

  'number-field': `/**
 * NumberField variants — numeric input with increment/decrement buttons.
 *
 * Sub-components (reka-ui based):
 *  - NumberField (root)
 *  - NumberFieldContent (input wrapper)
 *  - NumberFieldDecrement (- button)
 *  - NumberFieldIncrement (+ button)
 *  - NumberFieldInput (the input field)
 *
 * Common props:
 *  - min / max: number
 *  - step: number
 *  - formatOptions: Intl.NumberFormatOptions
 */
export const numberFieldDefaults = {
  step: 1,
} as const
`,

  'pagination': `/**
 * Pagination variants — page navigation.
 *
 * Sub-components:
 *  - Pagination (root)
 *  - PaginationList / PaginationListItem
 *  - PaginationFirst / PaginationPrevious / PaginationNext / PaginationLast
 *  - PaginationItem (page number button)
 *  - PaginationEllipsis (...)
 *
 * Common props:
 *  - total: number (total items)
 *  - pageSize: number
 *  - siblingCount: number (pages around current)
 */
export const paginationDefaults = {
  pageSize: 10,
  siblingCount: 1,
} as const
`,

  'pin-input': `/**
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
`,

  'popover': `/**
 * Popover variants — floating content panel triggered by a button.
 *
 * Sub-components:
 *  - Popover (root)
 *  - PopoverTrigger (trigger element)
 *  - PopoverContent (floating panel)
 *  - PopoverAnchor (optional custom anchor element)
 *
 * Common props on PopoverContent:
 *  - side: 'top' | 'right' | 'bottom' | 'left'
 *  - align: 'start' | 'center' | 'end'
 *  - sideOffset: number
 */
export const popoverDefaults = {
  side: 'bottom' as const,
  align: 'center' as const,
  sideOffset: 4,
} as const
`,

  'progress': `import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const progressVariants = cva(
  'relative w-full overflow-hidden rounded-full bg-primary/20',
  {
    variants: {
      size: {
        xs: 'h-1',
        sm: 'h-1.5',
        default: 'h-2',
        lg: 'h-3',
        xl: 'h-4',
      },
      color: {
        default: '[&>[data-slot=progress-indicator]]:bg-primary',
        success: '[&>[data-slot=progress-indicator]]:bg-success',
        warning: '[&>[data-slot=progress-indicator]]:bg-warning',
        destructive: '[&>[data-slot=progress-indicator]]:bg-destructive',
        info: '[&>[data-slot=progress-indicator]]:bg-info',
      },
    },
    defaultVariants: { size: 'default', color: 'default' },
  },
)

export type ProgressVariants = VariantProps<typeof progressVariants>
`,

  'radio-group': `/**
 * RadioGroup variants — single-select radio button group.
 *
 * Sub-components:
 *  - RadioGroup (root — manages selection state)
 *  - RadioGroupItem (individual radio button)
 *
 * Common props:
 *  - orientation: 'horizontal' | 'vertical'
 *  - defaultValue: string
 *  - disabled: boolean
 */
export const radioGroupDefaults = {
  orientation: 'vertical' as const,
} as const
`,

  'range-calendar': `/**
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
`,

  'resizable': `/**
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
`,

  'scroll-area': `/**
 * ScrollArea variants — custom scrollbar container.
 *
 * Sub-components:
 *  - ScrollArea (root container with custom scrollbars)
 *  - ScrollBar (the scrollbar thumb and track)
 *
 * Common props:
 *  - type: 'auto' | 'always' | 'scroll' | 'hover'
 *  - scrollHideDelay: number (ms)
 *  - orientation: 'horizontal' | 'vertical'
 */
export const scrollAreaDefaults = {
  type: 'hover' as const,
  scrollHideDelay: 600,
} as const
`,

  'select': `import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const selectTriggerVariants = cva(
  'flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus:ring-ring/50 focus:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-9',
        md: 'h-10 px-4',
        lg: 'h-12 px-5 text-base',
      },
      variant: {
        default: 'bg-accent border-border',
        search: 'bg-card border-none ring-1 ring-border shadow-none h-9 text-xs',
        filter: 'bg-card border-border h-7 text-xs px-3 hover:bg-muted',
        ghost: 'border-none shadow-none bg-transparent',
      },
    },
    defaultVariants: { size: 'default', variant: 'default' },
  },
)

export type SelectTriggerVariants = VariantProps<typeof selectTriggerVariants>
`,

  'separator': `/**
 * Separator variants — horizontal or vertical divider.
 *
 * Common props:
 *  - orientation: 'horizontal' | 'vertical'
 *  - decorative: boolean (if true, not announced to screen readers)
 *
 * Horizontal: shrink-0 bg-border h-px w-full
 * Vertical: shrink-0 bg-border h-full w-px
 */
export const separatorDefaults = {
  orientation: 'horizontal' as const,
  decorative: true,
} as const
`,

  'sheet': `import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const sheetVariants = cva(
  'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom: 'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
        right: 'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
      },
    },
    defaultVariants: { side: 'right' },
  },
)

export type SheetVariants = VariantProps<typeof sheetVariants>
`,

  'skeleton': `import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const skeletonVariants = cva('animate-pulse rounded-md bg-muted', {
  variants: {
    shape: {
      default: 'rounded-md',
      circle: 'rounded-full',
      square: 'rounded-none',
    },
    size: {
      xs: 'h-3',
      sm: 'h-4',
      default: 'h-5',
      lg: 'h-8',
      xl: 'h-12',
    },
  },
  defaultVariants: { shape: 'default', size: 'default' },
})

export type SkeletonVariants = VariantProps<typeof skeletonVariants>
`,

  'slider': `/**
 * Slider variants — range slider input.
 *
 * Based on reka-ui Slider with shadcn styling.
 *
 * Common props:
 *  - min / max: number
 *  - step: number
 *  - orientation: 'horizontal' | 'vertical'
 *  - inverted: boolean
 *  - minStepsBetweenThumbs: number (for range sliders)
 */
export const sliderDefaults = {
  min: 0,
  max: 100,
  step: 1,
  orientation: 'horizontal' as const,
} as const
`,

  'sonner': `/**
 * Sonner (toast) variants — notification toast system.
 *
 * Uses vue-sonner under the hood.
 *
 * Toaster props:
 *  - position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
 *  - expand: boolean
 *  - richColors: boolean
 *  - duration: number (ms)
 *
 * Toast types: success, error, warning, info, loading, promise
 */
export const sonnerDefaults = {
  position: 'bottom-right' as const,
  expand: false,
  richColors: true,
  duration: 4000,
} as const
`,

  'spinner': `import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const spinnerVariants = cva('animate-spin text-muted-foreground', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      default: 'h-5 w-5',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
  },
  defaultVariants: { size: 'default' },
})

export type SpinnerVariants = VariantProps<typeof spinnerVariants>
`,

  'stepper': `/**
 * Stepper variants — step-by-step progress indicator.
 *
 * Sub-components:
 *  - Stepper (root)
 *  - StepperItem (individual step)
 *  - StepperTrigger (clickable step button)
 *  - StepperTitle / StepperDescription (step labels)
 *  - StepperSeparator (connector line between steps)
 *  - StepperIndicator (step number/icon)
 *
 * Common props:
 *  - orientation: 'horizontal' | 'vertical'
 *  - linear: boolean (must complete steps in order)
 */
export const stepperDefaults = {
  orientation: 'horizontal' as const,
  linear: true,
} as const
`,

  'switch': `import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const switchVariants = cva(
  'peer inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-4 w-7 [&_[data-slot=switch-thumb]]:size-3',
        default: 'h-[1.15rem] w-8 [&_[data-slot=switch-thumb]]:size-4',
        lg: 'h-6 w-11 [&_[data-slot=switch-thumb]]:size-5',
      },
      color: {
        default: 'data-[state=checked]:bg-primary focus-visible:border-ring focus-visible:ring-ring/50',
        success: 'data-[state=checked]:bg-success focus-visible:ring-success/50',
        destructive: 'data-[state=checked]:bg-destructive focus-visible:ring-destructive/50',
      },
    },
    defaultVariants: { size: 'default', color: 'default' },
  },
)

export type SwitchVariants = VariantProps<typeof switchVariants>
`,

  'table': `/**
 * Table variants — data table components.
 *
 * Sub-components:
 *  - Table (root wrapper with overflow)
 *  - TableHeader / TableBody / TableFooter (sections)
 *  - TableRow (tr)
 *  - TableHead (th)
 *  - TableCell (td)
 *  - TableCaption (caption)
 *
 * For advanced use with @tanstack/vue-table, see the useTable composable.
 */
export const tableDefaults = {} as const
`,

  'table-action': `/**
 * TableAction variants — action buttons/menus for table rows.
 *
 * Sub-components:
 *  - TableAction (container for row actions)
 *  - TableActionItem (individual action item)
 *
 * Common usage: edit, delete, view, duplicate actions per row.
 */
export const tableActionDefaults = {} as const
`,

  'tabs': `import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const tabsListVariants = cva(
  'inline-flex items-center justify-center text-muted-foreground',
  {
    variants: {
      variant: {
        default: 'h-9 rounded-lg bg-muted p-[3px] gap-1',
        underline: 'bg-transparent border-b rounded-none gap-0 p-0 h-auto',
        pills: 'bg-transparent gap-2 p-0',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'rounded-md px-3 py-1 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        underline: 'rounded-none px-4 py-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground',
        pills: 'rounded-full px-4 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export type TabsListVariants = VariantProps<typeof tabsListVariants>
export type TabsTriggerVariants = VariantProps<typeof tabsTriggerVariants>
`,

  'tags-input': `/**
 * TagsInput variants — input with tag/chip support.
 *
 * Sub-components:
 *  - TagsInput (root)
 *  - TagsInputItem (individual tag)
 *  - TagsInputItemText (tag label)
 *  - TagsInputItemDelete (remove button)
 *  - TagsInputInput (text input for new tags)
 *
 * Common props:
 *  - delimiter: string (character to split tags, e.g. ',')
 *  - max: number (max number of tags)
 *  - addOnPaste: boolean
 */
export const tagsInputDefaults = {
  delimiter: ',',
  addOnPaste: true,
} as const
`,

  'textarea': `import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export const textareaVariants = cva(
  'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
  {
    variants: {
      size: {
        sm: 'min-h-[40px] text-xs',
        default: 'min-h-[60px]',
        lg: 'min-h-[120px] text-base',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
    },
    defaultVariants: { size: 'default', resize: 'none' },
  },
)

export type TextareaVariants = VariantProps<typeof textareaVariants>
`,

  'toggle-group': `/**
 * ToggleGroup variants — inherits from Toggle variants.
 *
 * Sub-components:
 *  - ToggleGroup (root — manages single/multiple selection)
 *  - ToggleGroupItem (individual toggle button)
 *
 * Common props:
 *  - type: 'single' | 'multiple'
 *  - variant: 'default' | 'outline' (inherited from Toggle)
 *  - size: 'default' | 'sm' | 'lg' (inherited from Toggle)
 *  - disabled: boolean
 */
export const toggleGroupDefaults = {
  type: 'single' as const,
  variant: 'default' as const,
  size: 'default' as const,
} as const
`,

  'tooltip': `/**
 * Tooltip variants — hover tooltip for any element.
 *
 * Sub-components:
 *  - Tooltip (root — manages state)
 *  - TooltipTrigger (element that triggers the tooltip)
 *  - TooltipContent (the tooltip bubble)
 *  - TooltipProvider (wraps a group of tooltips for shared delay)
 *
 * Common props on TooltipContent:
 *  - side: 'top' | 'right' | 'bottom' | 'left'
 *  - align: 'start' | 'center' | 'end'
 *  - sideOffset: number
 *
 * Common props on TooltipProvider:
 *  - delayDuration: number (ms before showing)
 *  - skipDelayDuration: number (ms to skip delay between consecutive tooltips)
 */
export const tooltipDefaults = {
  delayDuration: 300,
  sideOffset: 4,
} as const
`,
}

// Generate files
let created = 0
for (const [name, content] of Object.entries(componentVariants)) {
  const filePath = join(UIC_DIR, name, 'variants.ts')
  if (!existsSync(filePath)) {
    writeFileSync(filePath, content)
    created++
    console.warn(`✅ Created: ${name}/variants.ts`)
  }
  else {
    console.warn(`⏭️  Skipped: ${name}/variants.ts (already exists)`)
  }
}

console.warn(`\nDone! Created ${created} variants files.`)

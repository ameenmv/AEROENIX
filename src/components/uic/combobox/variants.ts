/**
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

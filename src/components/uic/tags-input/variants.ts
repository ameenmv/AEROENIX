/**
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

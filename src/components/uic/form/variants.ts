/**
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

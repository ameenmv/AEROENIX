/**
 * All *Field input wrapper components — accessible form field primitives.
 *
 * Each component wraps a raw input with Field + FieldLabel + FieldDescription + FieldError
 * for proper accessibility (label linking, error states, screen readers).
 *
 * Usage:
 *   import { InputField, SwitchField, DatePickerField } from '@/components/uic/inputs'
 */

// Text inputs
export { default as BilingualInputField } from './BilingualInputField.vue'
// Toggle / Boolean inputs
export { default as CheckboxField } from './CheckboxField.vue'
// Color
export { default as ColorInputField } from './ColorInputField.vue'
// Date inputs
export { default as DatePickerField } from './DatePickerField.vue'
export { default as DateRangePickerField } from './DateRangePickerField.vue'

export { default as InputField } from './InputField.vue'
// Code / OTP inputs
export { default as InputOTPField } from './InputOTPField.vue'

// Numeric inputs
export { default as NumberInputField } from './NumberInputField.vue'

export { default as PinInputField } from './PinInputField.vue'
// Selection inputs
export { default as RadioGroupField } from './RadioGroupField.vue'

export { default as RichTextInputField } from './RichTextInputField.vue'
export { default as SliderField } from './SliderField.vue'

export { default as SwitchField } from './SwitchField.vue'

// Collection inputs
export { default as TagsInputField } from './TagsInputField.vue'

export { default as TextareaField } from './TextareaField.vue'
export { default as TranslatableInputField } from './TranslatableInputField.vue'

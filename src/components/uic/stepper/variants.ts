/**
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

import type { ZodTypeAny } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm as useVeeForm } from 'vee-validate'

export interface UseFormOptions<T = any> {
  /** The resource name, used for success/error messages and query invalidation */
  resourceName: string
  /** The zod schema used for validation */
  schema?: ZodTypeAny
  /** Optional initial values */
  initialValues?: Record<string, any>
  /** The action being performed (create, update, custom) */
  action?: 'create' | 'update' | 'custom'
  /** The API function that performs the action */
  mutationFn: (data: any) => Promise<T | void>
  /** Called when the mutation succeeds */
  onSuccess?: (data: T | void) => void
  /** Called when the mutation fails */
  onError?: (err: unknown) => void
  /** Custom success message (overrides default) */
  successMessage?: string
  /** Whether to show sonar toast notifications (default: true). Set to false for views with inline error UI. */
  showNotifications?: boolean
  /** Show confirmation dialog before submitting */
  confirmBeforeSubmit?: boolean
  /** Custom title for confirmation dialog */
  confirmTitle?: string
  /** Custom message for confirmation dialog */
  confirmMessage?: string
  /** Label for confirm button in dialog */
  confirmLabel?: string
  /** Label for cancel button in dialog */
  cancelLabel?: string
}
/**
 * A unified form composable that wraps vee-validate and tanstack/vue-query.
 * It provides reactivity, zod validation, API mutation, standardized notifications,
 * and automatic API error-to-field mapping.
 */
export function useForm<T = any>(options: UseFormOptions<T>) {
  const {
    resourceName,
    schema,
    initialValues,
    action = 'create',
    mutationFn,
    onSuccess,
    onError,
    successMessage: _successMessage,
    showNotifications = true,
    confirmBeforeSubmit = false,
    confirmTitle,
    confirmMessage,
    confirmLabel,
    cancelLabel,
  } = options
  const queryClient = useQueryClient()
  const sonarStore = useSonarStore()
  const { t } = useI18n()
  // 1. Initialize vee-validate Form
  const veeForm = useVeeForm({
    validationSchema: schema ? toTypedSchema(schema) : undefined,
    initialValues,
  })
  // 2. Notification Helpers
  const defaultErrorMessage = () => {
    switch (action) {
      case 'create':
        return `Failed to create ${resourceName}`
      case 'update':
        return `Failed to update ${resourceName}`
      default:
        return `Failed action on ${resourceName}`
    }
  }
  // 3. Setup tanstack mutation
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return await mutationFn(data)
    },
    onSuccess: (data) => {
      // Invalidate list queries for this resource to keep table updated
      queryClient.invalidateQueries({ queryKey: [resourceName] })
      
      if (showNotifications) {
        const msg = (data as any)?.message || _successMessage || `${resourceName} saved successfully.`
        sonarStore.success('Success', msg)
      }
      
      onSuccess?.(data)
    },
    onError: (err: unknown) => {
      // Debug: trace mutation error
      const errMessage
        = (err as any)?.response?.data?.message
          || (err instanceof Error ? err.message : 'Unknown error')
      const errStatus = (err as any)?.response?.status || (err as any)?.status

      if (showNotifications) {
        // SV2-3233: Always show a toast for validation errors so users get feedback
        // The Axios interceptor skips 422 toasts when field-level errors exist,
        // but the user still needs a top-level notification
        if (errStatus === 422 && errMessage) {
          sonarStore.error('Validation Error', errMessage)
        }
        else {
          // For non-HTTP errors (e.g. network failures, mock errors)
          const isHttpError = !!errStatus
          if (!isHttpError) {
            sonarStore.error('Error', `${defaultErrorMessage()}: ${errMessage}`)
          }
        }
      }

      // Scroll to top so user sees error notification
      window.scrollTo({ top: 0, behavior: 'smooth' })

      onError?.(err)
    },
  })
  // 4. API Error Mapping
  const mapApiErrors = (
    err: unknown,
    setErrors: (errors: Record<string, string | string[]>) => void,
  ) => {
    if ((err as any)?.response?.data?.errors) {
      const apiErrors = (err as any).response.data.errors
      const formattedErrors: Record<string, string> = {}
      Object.entries(apiErrors).forEach(([key, messages]) => {
        // SV2-3239: Map API error keys (dot notation) to form field keys (bracket notation)
        // e.g., 'buttons.0.value' → 'buttons[0].url' or 'buttons[0].phone'
        let formKey = key
        const buttonValueMatch = key.match(/^buttons\.(\d+)\.value$/)
        if (buttonValueMatch) {
          const idx = buttonValueMatch[1]
          // Try to determine the button type from current form values to map to the right field
          const buttons = (veeForm.values as any)?.buttons as any[]
          const btn = buttons?.[Number(idx)]
          const btnType = Number(btn?.type || (veeForm.values as any)?.buttonType)
          if (btnType === 3) {
            // PhoneNumber
            formKey = `buttons[${idx}].phone`
          }
          else if (btnType === 2) {
            // URL
            formKey = `buttons[${idx}].url`
          }
          else {
            // Generic fallback
            formKey = `buttons[${idx}].value`
          }
        }
        else {
          // Convert any remaining dot notation to bracket notation for arrays
          // e.g., 'buttons.0.label' → 'buttons[0].label'
          formKey = key.replace(/(\w+)\.(\d+)/g, '$1[$2]')
        }
        formattedErrors[formKey] = Array.isArray(messages) ? messages[0] : (messages as string)
      })
      setErrors(formattedErrors)
    }
  }
  // 5. Connect Submit Handler
  const submitted = ref(false)
  const showConfirmDialog = ref(false)

  // Stores the schema-validated values between handleSubmit and executeSubmit
  let pendingValidatedValues: any = null

  // Default confirmation messages based on action
  function getDefaultConfirmTitle() {
    switch (action) {
      case 'create':
        return `Create ${resourceName}?`
      case 'update':
        return `Save Changes?`
      default:
        return 'Confirm Action'
    }
  }

  function getDefaultConfirmMessage() {
    switch (action) {
      case 'create':
        return `Are you sure you want to create this ${resourceName}?`
      case 'update':
        return `Are you sure you want to save these changes to the ${resourceName}?`
      default:
        return 'Are you sure you want to proceed?'
    }
  }

  /**
   * Shared mutable state for confirmation dialog.
   * validatedSubmit reads from this at call-time, and the returned object
   * exposes getter/setters that proxy to this — so external overrides
   * (e.g. `form.hasConfirmBeforeSubmit = computed(...)`) propagate correctly.
   */
  const _confirm: Record<string, any> = {
    enabled: confirmBeforeSubmit,
    title: confirmTitle || getDefaultConfirmTitle(),
    message: confirmMessage || getDefaultConfirmMessage(),
    confirmLabel:
      confirmLabel
      || (action === 'create' ? t('common.create', 'Create') : t('common.save', 'Save')),
    cancelLabel: cancelLabel || t('common.cancel', 'Cancel'),
  }

  /** Resolve a value that may be a plain value, a ref, or a computed */
  function unref(val: any): any {
    return val?.value !== undefined ? val.value : val
  }

  const validatedSubmit = veeForm.handleSubmit((values) => {
    // Read from the shared _confirm object at call-time so dynamic overrides work
    const shouldConfirm = unref(_confirm.enabled)
    if (shouldConfirm) {
      pendingValidatedValues = values
      showConfirmDialog.value = true
      return
    }
    // Otherwise submit directly
    mutation.mutate(values, {
      onError: err => mapApiErrors(err, veeForm.setErrors),
    })
  })

  const executeSubmit = () => {
    // Use schema-validated values if available, otherwise fall back to raw values
    const values = pendingValidatedValues ?? veeForm.values
    pendingValidatedValues = null
    mutation.mutate(values, {
      onError: err => mapApiErrors(err, veeForm.setErrors),
    })
    showConfirmDialog.value = false
  }

  const cancelSubmit = () => {
    pendingValidatedValues = null
    showConfirmDialog.value = false
  }

  const onSubmit = () => {
    submitted.value = true
    validatedSubmit()
  }
  // 6. Display errors only after first submit attempt, then reactively clear as user fixes
  const displayErrors = computed(() => {
    if (!submitted.value)
      return {}
    return veeForm.errors.value
  })

  // 7. Silent validation — reactively check if form is valid without showing errors.
  //    Used to disable submit buttons proactively.
  const canSubmit = computed(() => {
    if (!schema)
      return true
    const result = schema.safeParse(veeForm.values)
    return result.success
  })

  // Build the return object with getter/setters for confirm state
  // so that external overrides propagate back into the closure
  const result = {
    ...veeForm,
    action,
    mutate: mutation.mutate,
    onSubmit,
    executeSubmit,
    cancelSubmit,
    mapApiErrors,
    submitted,
    displayErrors,
    canSubmit,
    showConfirmDialog,
    // Placeholder values — immediately overridden by defineProperties below
    isPending: false as any,
    hasConfirmBeforeSubmit: _confirm.enabled as any,
    confirmTitle: _confirm.title as any,
    confirmMessage: _confirm.message as any,
    confirmLabel: _confirm.confirmLabel as any,
    cancelLabel: _confirm.cancelLabel as any,
  }

  // Override with getter/setters that proxy to the shared _confirm object
  // This ensures external assignments (e.g. form.hasConfirmBeforeSubmit = computed(...))
  // propagate into the closure that validatedSubmit reads from
  Object.defineProperties(result, {
    isPending: {
      get: () => mutation.isPending.value ?? (mutation as any).isPending,
      enumerable: true,
      configurable: true,
    },
    hasConfirmBeforeSubmit: {
      get: () => _confirm.enabled,
      set: (v: any) => {
        _confirm.enabled = v
      },
      enumerable: true,
      configurable: true,
    },
    confirmTitle: {
      get: () => _confirm.title,
      set: (v: any) => {
        _confirm.title = v
      },
      enumerable: true,
      configurable: true,
    },
    confirmMessage: {
      get: () => _confirm.message,
      set: (v: any) => {
        _confirm.message = v
      },
      enumerable: true,
      configurable: true,
    },
    confirmLabel: {
      get: () => _confirm.confirmLabel,
      set: (v: any) => {
        _confirm.confirmLabel = v
      },
      enumerable: true,
      configurable: true,
    },
    cancelLabel: {
      get: () => _confirm.cancelLabel,
      set: (v: any) => {
        _confirm.cancelLabel = v
      },
      enumerable: true,
      configurable: true,
    },
  })

  return result
}

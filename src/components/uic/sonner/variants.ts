/**
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

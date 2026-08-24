import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import NProgress from 'nprogress'
/**
 * ──────────────────────────────────────────────────────────────────────────────
 * HTTP Client — Aligned with neop-backend-base
 *
 * Features:
 *   1. NProgress progress bar on every request
 *   2. Request counter for global loading state
 *   3. Dynamic i18n locale headers (Accept-Language + X-Locale)
 *   4. Client device headers (X-Client-Id + X-Client-Secret)
 *   5. Permission injection from current route meta
 *   6. Multi-strategy auth (Bearer token OR cookie-based)
 *   7. Rich error handling: 401→redirect, 403→forbidden, 422→validation,
 *      429→rate-limit, 409→conflict, 5xx→server error
 * ──────────────────────────────────────────────────────────────────────────────
 */
// ── NProgress Configuration ─────────────────────────────────────────────────
NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.15 })
// ── Request Counter (global loading state) ──────────────────────────────────
// Reactive-safe — no Pinia dependency to avoid circular imports.
// Components can import httpLoading.isLoading directly.
let activeRequests = 0
export const httpLoading = {
  get isLoading() {
    return activeRequests > 0
  },
}
function incrementRequests(): void {
  if (activeRequests === 0)
    NProgress.start()
  activeRequests++
}
function decrementRequests(): void {
  activeRequests = Math.max(0, activeRequests - 1)
  if (activeRequests === 0)
    NProgress.done()
}
// ── Axios Instance ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Cookie-based auth support (Sanctum SPA)
  withCredentials: import.meta.env.VITE_AUTH_STRATEGY === 'cookie',
})
// ── Request Interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    incrementRequests()
    // ── Auth: Bearer token ────────────────────────────────────────────────
    const token = localStorage.getItem('auth_token')
    if (token && import.meta.env.VITE_AUTH_STRATEGY !== 'cookie') {
      config.headers.Authorization = `Bearer ${token}`
    }
    // ── i18n Headers ──────────────────────────────────────────────────────
    // Backend reads Accept-Language for response translations
    // and X-Locale for switching application locale.
    const locale = localStorage.getItem('locale') || 'en'
    config.headers['Accept-Language'] = locale
    config.headers['X-Locale'] = locale
    // ── Client Device Headers ─────────────────────────────────────────────
    // Matches AuthenticateClient middleware (X-Client-Id + X-Client-Secret)
    const clientId = localStorage.getItem('client_id')
    const clientSecret = localStorage.getItem('client_secret')
    if (clientId && clientSecret) {
      config.headers['X-Client-Id'] = clientId
      config.headers['X-Client-Secret'] = clientSecret
    }
    // ── Permission Injection ──────────────────────────────────────────────
    // Sends current route permission so backend can audit/log the action.
    const permission = localStorage.getItem('_current_permission')
    if (permission && config.params === undefined) {
      config.params = { permission }
    }
    else if (permission && config.params) {
      config.params.permission = permission
    }
    return config
  },
  (error) => {
    decrementRequests()
    return Promise.reject(error)
  },
)
// ── Response Interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    decrementRequests()
    return response
  },
  async (
    error: AxiosError<{
      success: boolean
      message?: string
      error_code?: string
      errors?: Record<string, string[]>
    }>,
  ) => {
    decrementRequests()
    const status = error.response?.status
    const data = error.response?.data
    // Lazy-import sonar store to break circular dependency
    // (api.ts → sonar.ts → api.ts)
    const showToast = async (
      type: 'error' | 'warning' | 'info',
      title: string,
      description: string,
    ) => {
      try {
        const { useSonarStore } = await import('@/stores/sonar')
        const sonar = useSonarStore()
        sonar[type](title, description)
      }
      catch {
        // Fallback if store not available (e.g. during SSR)
        console.warn(`[HTTP ${status}] ${title}: ${description}`)
      }
    }
    // Check if the request is targeting an auth endpoint (login, OTP, password reset)
    // These endpoints return 401/422 for invalid credentials/codes — we should NOT
    // redirect to login or clear state in those cases.
    const requestUrl = error.config?.url || ''
    const isAuthRequest = requestUrl.includes('/auth/')

    switch (status) {
      // ── 401 Unauthenticated ─────────────────────────────────────────
      case 401: {
        if (import.meta.env.VITE_MOCK_AUTH === 'true') {
          console.warn('[Mock Auth] Ignored 401 Unauthorized from real API.')
          break
        }
        // Skip redirect for auth-flow requests (login, OTP verify, password reset)
        // These return 401 for invalid credentials/codes, not expired sessions
        if (isAuthRequest) {
          break
        }
        localStorage.removeItem('auth_token')
        localStorage.removeItem('permissions')
        localStorage.removeItem('_current_permission')
        const locale = localStorage.getItem('locale') || 'en'

        await showToast('warning', 'Session Expired', 'Please log in again to continue.')

        if (!window.location.pathname.includes('/login')) {
          window.location.href = `/${locale}/admin/login`
        }
        break
      }
      // ── 403 Forbidden ───────────────────────────────────────────────
      case 403:
        await showToast(
          'error',
          'Forbidden',
          data?.message || 'You do not have permission to perform this action.',
        )
        break
      // ── 404 Not Found ───────────────────────────────────────────────
      case 404:
        await showToast(
          'warning',
          'Not Found',
          data?.message || 'The requested resource was not found.',
        )
        break
      // ── 409 Conflict ────────────────────────────────────────────────
      case 409:
        await showToast(
          'warning',
          'Conflict',
          data?.message || 'A conflict occurred with the current state.',
        )
        break
      // ── 422 Validation Error ────────────────────────────────────────
      // Let forms handle their own validation errors via vee-validate.
      // Only show toast if no field-level errors exist.
      case 422:
        if (!data?.errors || Object.keys(data.errors).length === 0) {
          await showToast(
            'warning',
            'Validation Error',
            data?.message || 'Please check your input.',
          )
        }
        break
      // ── 429 Rate Limited ────────────────────────────────────────────
      case 429: {
        const retryAfter = error.response?.headers?.['retry-after']
        const seconds = retryAfter ? Number.parseInt(retryAfter, 10) : 60
        await showToast(
          'warning',
          'Too Many Requests',
          `Please wait ${seconds} seconds before trying again.`,
        )
        break
      }
      // ── 5xx Server Error ────────────────────────────────────────────
      default:
        if (status && status >= 500) {
          await showToast(
            'error',
            'Server Error',
            'Something went wrong on our end. Please try again later.',
          )
        }
        else if (status) {
          await showToast(
            'error',
            'Request Failed',
            data?.message || 'An unexpected error occurred.',
          )
        }
        break
    }
    // Normalize error for consumers
    // Attach the original response so stores can read e.response.data.message
    const normalized: any = new Error(data?.message || error.message || 'Unknown Error')
    normalized.response = error.response
    normalized.error_code = data?.error_code || 'UNKNOWN'
    normalized.errors = data?.errors || {}
    normalized.status = status
    return Promise.reject(normalized)
  },
)
export default api

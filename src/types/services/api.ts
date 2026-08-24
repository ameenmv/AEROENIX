/**
 * ──────────────────────────────────────────────────────────────────────────────
 * API Response Types — Aligned with neop-backend-base
 *
 * Matches the response envelope produced by:
 *   - App\Core\Traits\ApiResponse  (success/error envelope)
 *   - App\Core\Base\BaseResource   (pagination + scoping)
 * ──────────────────────────────────────────────────────────────────────────────
 */

// ── Success Envelope ────────────────────────────────────────────────────────

/** Standard success response from ApiResponse trait */
export interface ApiSuccessResponse<T = unknown> {
  success: true
  message: string
  data: T
}

/** Paginated list response from BaseResource::paginate() */
export interface ApiPaginatedResponse<T = unknown> {
  success: true
  message: string
  data: T[]
  meta: PaginationMeta
  links: PaginationLinks
}

// ── Error Envelope ──────────────────────────────────────────────────────────

/** Standard error response from ApiResponse trait */
export interface ApiErrorResponse {
  success: false
  message: string
  error_code: string
  errors: Record<string, string[]> | null
  meta: Record<string, unknown>
}

// ── Pagination ──────────────────────────────────────────────────────────────

/** Pagination metadata from BaseResource::paginate() */
export interface PaginationMeta {
  current_page: number
  from: number | null
  last_page: number
  path: string
  per_page: number
  to: number | null
  total: number
}

/** Navigation links from BaseResource::paginate() */
export interface PaginationLinks {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}

// ── Query Parameters ────────────────────────────────────────────────────────

/**
 * Standard list query parameters.
 *
 * Matches BaseController::getPaginationParams(), parseIncludes(),
 * and BaseResource query params (?scope, ?fields, ?exclude, ?include).
 */
export interface ApiListParams {
  /** Enable pagination (default: true in frontend, false in backend) */
  paginate?: boolean
  /** Items per page (default: 15) */
  limit?: number
  /** Current page number */
  page?: number
  /** Resource scope level: micro | mini | full (per-model: user.full) */
  scope?: string
  /** Comma-separated field names to include (overrides scope) */
  fields?: string
  /** Comma-separated field names to exclude */
  exclude?: string
  /** Comma-separated relation names to eager-load */
  include?: string
  /** Filters object — keys are field names, values are filter values */
  filters?: Record<string, unknown>
  /** Search query */
  search?: string
  /** Sort field */
  sort_by?: string
  /** Sort direction */
  sort_dir?: 'asc' | 'desc'
}

// ── Service Types ───────────────────────────────────────────────────────────

/** Return type for list operations (from createService) */
export interface ServiceListResult<T> {
  data: T[]
  meta: PaginationMeta
  links: PaginationLinks
}

/** Return type for dropdown operations (from createService) */
export interface ServiceDropdownResult<T> {
  data: T[]
  meta?: PaginationMeta
  links?: PaginationLinks
}

/** Export response */
export interface ExportResponse {
  download_url: string
}

/** Import response */
export interface ImportResponse {
  import_id: string
}

// ── Utility Types ───────────────────────────────────────────────────────────

/** Extract the data payload from an API response */
export type ExtractData<T> = T extends ApiSuccessResponse<infer D> ? D : never

/** Any API response */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

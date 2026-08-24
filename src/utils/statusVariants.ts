// ─── Status Badge Variant Utility ────────────────────────────────────────────
// Base color palette and helpers for status badge styling.
// Variant maps live in each enum file alongside the enum they describe.
//
// Usage:
//   import { StatusVariant, VARIANTS, getVariantByColor } from '@/utils/statusVariants'
//   import { WhatsAppTemplateStatusVariants } from '@/enums'
// ─────────────────────────────────────────────────────────────────────────────

export interface StatusVariant {
  /** Dot indicator class */
  dotColor: string
  /** Text class */
  textColor: string
  /** Subtle background */
  bgColor: string
  /** Full badge class (bg + text combined) for inline use */
  badgeClass: string
}

/** Shorthand type for a value → variant map exported from enum files */
export type StatusVariantMap = Record<number, StatusVariant>

// ═══════════════════════════════════════════════════════════════════════════════
// Base color palette — the only place colors are defined
// ═══════════════════════════════════════════════════════════════════════════════

export const VARIANTS = {
  green: {
    dotColor: 'bg-emerald-500 dark:bg-emerald-400',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/8',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  },
  yellow: {
    dotColor: 'bg-yellow-500 dark:bg-yellow-400',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-500/8',
    badgeClass: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  },
  amber: {
    dotColor: 'bg-amber-500 dark:bg-amber-400',
    textColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/8',
    badgeClass: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  },
  red: {
    dotColor: 'bg-red-500 dark:bg-red-400',
    textColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-500/8',
    badgeClass: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  },
  orange: {
    dotColor: 'bg-orange-500 dark:bg-orange-400',
    textColor: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-500/8',
    badgeClass: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  },
  blue: {
    dotColor: 'bg-blue-500 dark:bg-blue-400',
    textColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/8',
    badgeClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  },
  violet: {
    dotColor: 'bg-violet-500 dark:bg-violet-400',
    textColor: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-500/8',
    badgeClass: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
  },
  teal: {
    dotColor: 'bg-teal-500 dark:bg-teal-400',
    textColor: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-500/8',
    badgeClass: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
  },
  slate: {
    dotColor: 'bg-slate-400 dark:bg-slate-400',
    textColor: 'text-slate-500 dark:text-slate-400',
    bgColor: 'bg-slate-400/8',
    badgeClass: 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300',
  },
  gray: {
    dotColor: 'bg-gray-400 dark:bg-gray-400',
    textColor: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-400/8',
    badgeClass: 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400',
  },
} as const satisfies Record<string, StatusVariant>

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════

/** Get a variant by its semantic color name (from backend `color` field). */
export function getVariantByColor(color: string): StatusVariant {
  const key = color?.toLowerCase() as keyof typeof VARIANTS
  return VARIANTS[key] ?? VARIANTS.slate
}

/**
 * Resolve a variant from a backend status object.
 * If a `variants` map is provided, uses `status.value` to look up.
 * Otherwise falls back to `status.color`.
 */
export function resolveStatusVariant(
  status: { value?: number, label?: string, color?: string, badge?: string } | string | null | undefined,
  variants?: StatusVariantMap,
): StatusVariant {
  if (!status)
    return VARIANTS.slate

  if (typeof status === 'string') {
    return getVariantByColor(status)
  }

  // Try numeric value in the provided variants map
  if (variants && status.value != null) {
    const v = variants[status.value]
    if (v)
      return v
  }

  // Fall back to color field
  if (status.color) {
    return getVariantByColor(status.color)
  }

  return VARIANTS.slate
}

/**
 * Shared API types used across entity interfaces.
 *
 * Backend enums with HasEnumMetadata return a toOption() object
 * with this shape in API resources.
 */

/** Status object returned by backend enum toOption() */
export interface ApiStatus {
  value: number
  label: string
  color?: string
  icon?: string
  badge?: string
  description?: string
}

/** Translatable field object { en: string, ar: string, [key]: string } */
export interface TranslatableField {
  [key: string]: string
  en: string
  ar: string
}

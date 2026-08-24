import { faker } from '@faker-js/faker'

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Faker Field Map — Auto-Mock Field Resolution
 *
 * Maps common entity field names to their Faker generator functions.
 * Used by `mockFieldsFromKeys()` and `createMockService()` to auto-generate
 * realistic mock data without any manual configuration.
 *
 * Resolution order:
 *   1. Exact match in FIELD_MAP (e.g. "email" → faker.internet.email())
 *   2. Suffix match (e.g. "user_email" → matches "_email" suffix)
 *   3. Pattern match via PATTERN_MAP (e.g. "is_*" → boolean)
 *   4. Fallback → faker.lorem.word()
 * ──────────────────────────────────────────────────────────────────────────────
 */

// ── Exact Field Name Map ────────────────────────────────────────────────────

export const FIELD_MAP: Record<string, () => unknown> = {
  // ── Identity ──────────────────────────────────────────────────────────────
  id: (() => {
    let counter = 0
    return () => ++counter
  })(),
  uuid: () => faker.string.uuid(),

  // ── Person ────────────────────────────────────────────────────────────────
  name: () => faker.person.fullName(),
  first_name: () => faker.person.firstName(),
  last_name: () => faker.person.lastName(),
  full_name: () => faker.person.fullName(),
  username: () => faker.internet.username(),
  email: () => faker.internet.email(),
  phone: () => faker.phone.number(),
  phone_number: () => faker.phone.number(),
  mobile: () => faker.phone.number(),
  avatar: () => faker.image.avatar(),
  avatar_url: () => faker.image.avatar(),
  profile_image: () => faker.image.avatar(),
  bio: () => faker.lorem.sentence(),
  age: () => faker.number.int({ min: 18, max: 80 }),
  gender: () => faker.helpers.arrayElement(['male', 'female']),
  role: () => faker.helpers.arrayElement(['admin', 'editor', 'viewer', 'user']),

  // ── Text Content ──────────────────────────────────────────────────────────
  title: () => faker.lorem.sentence({ min: 3, max: 8 }),
  subtitle: () => faker.lorem.sentence({ min: 3, max: 6 }),
  description: () => faker.lorem.paragraph(),
  body: () => faker.lorem.paragraphs(3),
  content: () => faker.lorem.paragraphs(2),
  summary: () => faker.lorem.sentence(),
  excerpt: () => faker.lorem.sentence(),
  slug: () => faker.helpers.slugify(faker.lorem.words(3)).toLowerCase(),
  label: () => faker.lorem.words(2),
  note: () => faker.lorem.sentence(),
  notes: () => faker.lorem.sentence(),
  comment: () => faker.lorem.sentence(),
  message: () => faker.lorem.sentence(),
  reason: () => faker.lorem.sentence(),

  // ── Numbers / Finance ─────────────────────────────────────────────────────
  price: () => Number(faker.commerce.price({ min: 10, max: 500 })),
  amount: () => faker.number.float({ min: 1, max: 10000, fractionDigits: 2 }),
  total: () => faker.number.float({ min: 10, max: 5000, fractionDigits: 2 }),
  subtotal: () => faker.number.float({ min: 10, max: 5000, fractionDigits: 2 }),
  discount: () => faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
  tax: () => faker.number.float({ min: 0, max: 50, fractionDigits: 2 }),
  balance: () => faker.number.float({ min: 0, max: 10000, fractionDigits: 2 }),
  quantity: () => faker.number.int({ min: 1, max: 100 }),
  count: () => faker.number.int({ min: 0, max: 500 }),
  order: () => faker.number.int({ min: 1, max: 100 }),
  sort_order: () => faker.number.int({ min: 0, max: 50 }),
  position: () => faker.number.int({ min: 1, max: 20 }),
  duration: () => faker.number.int({ min: 1, max: 120 }),
  rating: () => faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
  percentage: () => faker.number.int({ min: 0, max: 100 }),
  currency: () => faker.helpers.arrayElement(['SAR', 'USD', 'EUR', 'GBP']),

  // ── Status / Booleans ─────────────────────────────────────────────────────
  status: () => faker.helpers.arrayElement(['active', 'inactive']),
  is_active: () => faker.datatype.boolean(),
  is_enabled: () => faker.datatype.boolean(),
  is_verified: () => faker.datatype.boolean(),
  is_published: () => faker.datatype.boolean(),
  is_featured: () => faker.datatype.boolean(),
  is_default: () => faker.datatype.boolean(),
  is_visible: () => faker.datatype.boolean(),
  is_locked: () => faker.datatype.boolean(),
  is_paid: () => faker.datatype.boolean(),
  is_free: () => faker.datatype.boolean(),
  active: () => faker.datatype.boolean(),
  enabled: () => faker.datatype.boolean(),
  verified: () => faker.datatype.boolean(),
  published: () => faker.datatype.boolean(),
  type: () => faker.helpers.arrayElement(['standard', 'premium', 'basic']),
  priority: () => faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
  severity: () => faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),

  // ── Dates ─────────────────────────────────────────────────────────────────
  created_at: () => faker.date.past().toISOString(),
  updated_at: () => faker.date.recent().toISOString(),
  deleted_at: () => null,
  published_at: () => faker.date.past().toISOString(),
  expired_at: () => faker.date.future().toISOString(),
  expires_at: () => faker.date.future().toISOString(),
  start_date: () => faker.date.past().toISOString(),
  end_date: () => faker.date.future().toISOString(),
  due_date: () => faker.date.future().toISOString(),
  date: () => faker.date.past().toISOString(),
  birth_date: () => faker.date.birthdate().toISOString(),
  last_login_at: () => faker.date.recent().toISOString(),
  last_seen_at: () => faker.date.recent().toISOString(),

  // ── Location / Address ────────────────────────────────────────────────────
  address: () => faker.location.streetAddress(),
  street: () => faker.location.street(),
  city: () => faker.location.city(),
  state: () => faker.location.state(),
  country: () => faker.location.country(),
  country_code: () => faker.location.countryCode(),
  zip: () => faker.location.zipCode(),
  zip_code: () => faker.location.zipCode(),
  postal_code: () => faker.location.zipCode(),
  lat: () => faker.location.latitude(),
  lng: () => faker.location.longitude(),
  latitude: () => faker.location.latitude(),
  longitude: () => faker.location.longitude(),

  // ── Media / URLs ──────────────────────────────────────────────────────────
  url: () => faker.internet.url(),
  website: () => faker.internet.url(),
  image: () => faker.image.url(),
  image_url: () => faker.image.url(),
  thumbnail: () => faker.image.url(),
  logo: () => faker.image.url(),
  icon: () => faker.image.url(),
  cover: () => faker.image.url(),
  cover_image: () => faker.image.url(),
  file: () => faker.system.filePath(),
  file_url: () => faker.internet.url(),
  video_url: () => faker.internet.url(),

  // ── References / IDs ──────────────────────────────────────────────────────
  user_id: () => faker.number.int({ min: 1, max: 100 }),
  parent_id: () => faker.helpers.arrayElement([null, faker.number.int({ min: 1, max: 50 })]),
  category_id: () => faker.number.int({ min: 1, max: 20 }),
  project_id: () => faker.number.int({ min: 1, max: 50 }),
  order_id: () => faker.number.int({ min: 1000, max: 99999 }),
  invoice_id: () => faker.number.int({ min: 1000, max: 99999 }),
  code: () => faker.string.alphanumeric(8).toUpperCase(),
  reference: () => `REF-${faker.string.alphanumeric(8).toUpperCase()}`,
  reference_number: () => `REF-${faker.string.alphanumeric(8).toUpperCase()}`,
  tracking_code: () => `TRK-${faker.string.alphanumeric(8).toUpperCase()}`,
  transaction_id: () => faker.string.uuid(),

  // ── Bilingual (AR/EN) ─────────────────────────────────────────────────────
  name_en: () => faker.person.fullName(),
  name_ar: () =>
    faker.helpers.arrayElement([
      'محمد أحمد',
      'فاطمة علي',
      'عبدالله سعود',
      'نور الهدى',
      'خالد العمري',
    ]),
  title_en: () => faker.lorem.sentence({ min: 3, max: 8 }),
  title_ar: () =>
    faker.helpers.arrayElement(['عنوان تجريبي', 'عنوان اختباري', 'مقالة جديدة', 'تقرير شامل']),
  description_en: () => faker.lorem.paragraph(),
  description_ar: () =>
    faker.helpers.arrayElement([
      'هذا وصف تجريبي للاختبار والتطوير',
      'محتوى تجريبي يستخدم لأغراض العرض',
      'نص وصفي لعرض المحتوى في الواجهة',
    ]),
  label_en: () => faker.lorem.words(2),
  label_ar: () => faker.helpers.arrayElement(['تسمية', 'عنوان فرعي', 'بيانات']),
  content_en: () => faker.lorem.paragraphs(2),
  content_ar: () =>
    faker.helpers.arrayElement([
      'محتوى تجريبي باللغة العربية يستخدم لأغراض التطوير والاختبار',
      'نص عربي تجريبي يمثل المحتوى الفعلي في التطبيق',
    ]),

  // ── Misc ───────────────────────────────────────────────────────────────────
  color: () => faker.color.rgb(),
  hex_color: () => faker.color.rgb(),
  ip: () => faker.internet.ip(),
  ip_address: () => faker.internet.ip(),
  user_agent: () => faker.internet.userAgent(),
  locale: () => faker.helpers.arrayElement(['en', 'ar']),
  language: () => faker.helpers.arrayElement(['en', 'ar']),
  timezone: () => faker.location.timeZone(),
  platform: () => faker.helpers.arrayElement(['web', 'ios', 'android']),
  device: () => faker.helpers.arrayElement(['desktop', 'mobile', 'tablet']),
  browser: () => faker.helpers.arrayElement(['Chrome', 'Firefox', 'Safari', 'Edge']),
  os: () => faker.helpers.arrayElement(['Windows', 'macOS', 'Linux', 'iOS', 'Android']),
  version: () => faker.system.semver(),
}

// ── Suffix Patterns ───────────────────────────────────────────────────────

const SUFFIX_MAP: [string, () => unknown][] = [
  ['_id', () => faker.number.int({ min: 1, max: 100 })],
  ['_uuid', () => faker.string.uuid()],
  ['_url', () => faker.internet.url()],
  ['_email', () => faker.internet.email()],
  ['_phone', () => faker.phone.number()],
  ['_date', () => faker.date.past().toISOString()],
  ['_at', () => faker.date.recent().toISOString()],
  ['_count', () => faker.number.int({ min: 0, max: 500 })],
  ['_name', () => faker.person.fullName()],
  ['_code', () => faker.string.alphanumeric(8).toUpperCase()],
  ['_color', () => faker.color.rgb()],
  ['_image', () => faker.image.url()],
  ['_path', () => faker.system.filePath()],
  ['_en', () => faker.lorem.words(3)],
  ['_ar', () => faker.helpers.arrayElement(['نص تجريبي', 'بيانات اختبارية', 'محتوى عربي'])],
]

// ── Prefix Patterns ───────────────────────────────────────────────────────

const PREFIX_MAP: [string, () => unknown][] = [
  ['is_', () => faker.datatype.boolean()],
  ['has_', () => faker.datatype.boolean()],
  ['can_', () => faker.datatype.boolean()],
  ['total_', () => faker.number.int({ min: 0, max: 1000 })],
  ['max_', () => faker.number.int({ min: 1, max: 100 })],
  ['min_', () => faker.number.int({ min: 0, max: 50 })],
  ['num_', () => faker.number.int({ min: 0, max: 500 })],
]

/**
 * Resolve a field name to a Faker generator function.
 *
 * @param fieldName - The entity field name (e.g. "email", "user_name", "is_active")
 * @returns A function that generates a fake value for this field
 *
 * @example
 * ```ts
 * const gen = resolveField('email')
 * gen() // "john.doe@example.com"
 *
 * const gen2 = resolveField('company_email')
 * gen2() // matches "_email" suffix → faker.internet.email()
 * ```
 */
export function resolveField(fieldName: string): () => unknown {
  // 1. Exact match
  if (FIELD_MAP[fieldName]) {
    return FIELD_MAP[fieldName]!
  }

  // 2. Prefix match (is_, has_, can_, total_, etc.)
  for (const [prefix, gen] of PREFIX_MAP) {
    if (fieldName.startsWith(prefix)) {
      return gen
    }
  }

  // 3. Suffix match (_id, _url, _email, etc.)
  for (const [suffix, gen] of SUFFIX_MAP) {
    if (fieldName.endsWith(suffix)) {
      return gen
    }
  }

  // 4. Fallback — generic string
  return () => faker.lorem.word()
}

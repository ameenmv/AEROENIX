import { createI18n } from 'vue-i18n'

const localesEn = import.meta.glob('./locales/en/**/*.json', { eager: true, import: 'default' })
const localesAr = import.meta.glob('./locales/ar/**/*.json', { eager: true, import: 'default' })
const messages: Record<string, any> = {
  en: {},
  ar: {},
}
function buildMessages(locales: Record<string, any>, lang: string) {
  for (const path in locales) {
    const name = path.split('/').pop()?.replace('.json', '')
    if (name) {
      messages[lang][name] = locales[path]
    }
  }
}
buildMessages(localesEn, 'en')
buildMessages(localesAr, 'ar')
export const SUPPORTED_LOCALES = ['en', 'ar']
export const DEFAULT_LOCALE = 'en'
function getInitialLocale() {
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
    return savedLocale
  }
  return DEFAULT_LOCALE
}
const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages,
})
export function setLocale(locale: string) {
  if (SUPPORTED_LOCALES.includes(locale)) {
    i18n.global.locale.value = locale as any
    localStorage.setItem('locale', locale)
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = locale
  }
}
if (typeof window !== 'undefined') {
  document.documentElement.dir = i18n.global.locale.value === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = i18n.global.locale.value
}
export default i18n

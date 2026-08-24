import CryptoJS from 'crypto-js'
import Cookies from 'js-cookie'

const SECRET_KEY = import.meta.env.VITE_APP_SECRET || 'neop-default-secret-key-2026'

export function encryptAndSetCookie(
  name: string,
  value: string,
  options?: Cookies.CookieAttributes,
) {
  if (!value) {
    Cookies.remove(name, options)
    return
  }
  const encrypted = CryptoJS.AES.encrypt(value, SECRET_KEY).toString()
  Cookies.set(name, encrypted, options)
}

export function decryptAndGetCookie(name: string): string | null {
  const encrypted = Cookies.get(name)
  if (!encrypted)
    return null
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    return decrypted || null
  }
  catch {
    return null
  }
}

export function removeCookie(name: string, options?: Cookies.CookieAttributes) {
  Cookies.remove(name, options)
}

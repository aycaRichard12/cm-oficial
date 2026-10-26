import esES from './es-ES'
import enUS from './en-US'

export const DEFAULT_LOCALE = 'es-ES'
export const SUPPORTED_LOCALES = ['es-ES', 'en-US']

const STORAGE_KEY = 'cm-locale'

export function getStoredLocale() {
  if (typeof window === 'undefined' || !window.localStorage) return DEFAULT_LOCALE
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return SUPPORTED_LOCALES.includes(stored) ? stored : DEFAULT_LOCALE
}

export function storeLocale(locale) {
  if (typeof window === 'undefined' || !window.localStorage) return
  if (SUPPORTED_LOCALES.includes(locale)) {
    window.localStorage.setItem(STORAGE_KEY, locale)
  }
}

export default {
  'es-ES': esES,
  'en-US': enUS,
}

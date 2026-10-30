import { safeTranslate } from './safeTranslate'

// Runtime access to the active vue-i18n instance for strings used outside
// templates (dialogs, notifications, validation rules, table column labels).
let i18nInstance = null

export function registerI18n(instance) {
  i18nInstance = instance
}

export function t(key, params) {
  if (!i18nInstance) return key
  return safeTranslate(i18nInstance, key, params)
}

export const THEME_STORAGE_KEY = 'mistersofts-cm-theme'

export function resolveTheme(storedValue, systemPrefersDark) {
  if (storedValue === 'light' || storedValue === 'dark') {
    return { mode: storedValue, source: 'manual' }
  }

  return { mode: systemPrefersDark ? 'dark' : 'light', source: 'system' }
}

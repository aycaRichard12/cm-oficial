import { THEME_STORAGE_KEY, resolveTheme } from './theme-resolver'

export function createThemeController({
  storage,
  media,
  apply,
  eventTarget,
  storageKey = THEME_STORAGE_KEY,
}) {
  let state = { mode: 'light', source: 'system' }

  const readStored = () => {
    try {
      return storage ? storage.getItem(storageKey) : null
    } catch {
      return null
    }
  }

  const persist = (mode) => {
    try {
      if (storage) storage.setItem(storageKey, mode)
      return true
    } catch {
      return false
    }
  }

  const systemPrefersDark = () => Boolean(media && media.matches)

  const resolve = () => resolveTheme(readStored(), systemPrefersDark())

  const applyResolved = (next) => {
    state = next
    if (typeof apply === 'function') apply(next.mode, next.source)
    return { ...state }
  }

  const setMode = (mode) => {
    if (mode !== 'light' && mode !== 'dark') return { ...state }
    persist(mode)
    return applyResolved({ mode, source: 'manual' })
  }

  const onMediaChange = () => {
    if (state.source === 'system') applyResolved(resolve())
  }

  const onStorage = (event) => {
    if (!event || !event.key || event.key === storageKey) applyResolved(resolve())
  }

  if (media && typeof media.addEventListener === 'function') {
    media.addEventListener('change', onMediaChange)
  }
  if (eventTarget && typeof eventTarget.addEventListener === 'function') {
    eventTarget.addEventListener('storage', onStorage)
  }

  applyResolved(resolve())

  return {
    getState: () => ({ ...state }),
    setMode,
    resolve,
    destroy() {
      if (media && typeof media.removeEventListener === 'function') {
        media.removeEventListener('change', onMediaChange)
      }
      if (eventTarget && typeof eventTarget.removeEventListener === 'function') {
        eventTarget.removeEventListener('storage', onStorage)
      }
    },
  }
}

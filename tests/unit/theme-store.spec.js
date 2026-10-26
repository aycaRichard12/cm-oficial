// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const { darkSet } = vi.hoisted(() => ({ darkSet: vi.fn() }))
vi.mock('quasar', () => ({ Dark: { set: darkSet } }))

import { useThemeStore } from '../../src/stores/theme.js'

function stubSystem(dark) {
  window.matchMedia = vi.fn(() => ({
    matches: dark,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

describe('theme store', () => {
  beforeEach(() => {
    localStorage.clear()
    darkSet.mockClear()
    setActivePinia(createPinia())
  })

  it('initializes from the system preference', () => {
    stubSystem(true)
    const store = useThemeStore()
    store.init()

    expect(store.mode).toBe('dark')
    expect(store.source).toBe('system')
    expect(store.isDark).toBe(true)
    expect(darkSet).toHaveBeenCalledWith(true)
  })

  it('restores a stored manual preference', () => {
    stubSystem(false)
    localStorage.setItem('mistersofts-cm-theme', 'dark')
    const store = useThemeStore()
    store.init()

    expect(store.mode).toBe('dark')
    expect(store.source).toBe('manual')
  })

  it('toggles and persists the new mode', () => {
    stubSystem(false)
    const store = useThemeStore()
    store.init()
    store.toggle()

    expect(store.mode).toBe('dark')
    expect(store.source).toBe('manual')
    expect(localStorage.getItem('mistersofts-cm-theme')).toBe('dark')
    expect(darkSet).toHaveBeenLastCalledWith(true)
  })

  it('is idempotent on repeated init', () => {
    stubSystem(false)
    const store = useThemeStore()
    store.init()
    store.init()

    expect(darkSet).toHaveBeenCalledTimes(1)
  })
})

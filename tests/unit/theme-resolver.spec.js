import { describe, it, expect } from 'vitest'
import { resolveTheme, THEME_STORAGE_KEY } from '../../src/utils/theme-resolver.js'

describe('resolveTheme', () => {
  it('uses a stored manual choice over the system preference', () => {
    expect(resolveTheme('dark', false)).toEqual({ mode: 'dark', source: 'manual' })
    expect(resolveTheme('light', true)).toEqual({ mode: 'light', source: 'manual' })
  })

  it('follows the system when there is no stored value', () => {
    expect(resolveTheme(null, true)).toEqual({ mode: 'dark', source: 'system' })
    expect(resolveTheme(null, false)).toEqual({ mode: 'light', source: 'system' })
  })

  it('ignores unrecognised stored values and falls back to the system', () => {
    expect(resolveTheme('blue', true)).toEqual({ mode: 'dark', source: 'system' })
    expect(resolveTheme('', false)).toEqual({ mode: 'light', source: 'system' })
  })

  it('exposes the stable storage key', () => {
    expect(THEME_STORAGE_KEY).toBe('mistersofts-cm-theme')
  })
})

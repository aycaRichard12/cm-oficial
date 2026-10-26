import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const themeScss = readFileSync(resolve('src/css/theme.scss'), 'utf8')
const appScss = readFileSync(resolve('src/css/app.scss'), 'utf8')

describe('theme tokens', () => {
  it('defines every token in both themes', () => {
    for (const token of [
      '--cm-bg',
      '--cm-surface',
      '--cm-surface-2',
      '--cm-text',
      '--cm-text-muted',
      '--cm-border',
      '--cm-header',
    ]) {
      expect(themeScss).toContain(token)
    }
    expect(themeScss).toContain('body.body--dark')
  })

  it('is imported by the global stylesheet', () => {
    expect(appScss).toContain("theme.scss")
  })

  it('forces a light document when printing', () => {
    expect(themeScss).toMatch(/@media print[\s\S]*background:\s*#fff\s*!important/i)
  })

  it('provides the light-capture guard and tour theming', () => {
    expect(themeScss).toContain('cm-light-capture')
    expect(themeScss).toContain('driver-popover')
  })
})

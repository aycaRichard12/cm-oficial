import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const quasarConfig = readFileSync(resolve('quasar.config.js'), 'utf8')
const indexHtml = readFileSync(resolve('index.html'), 'utf8')

describe('theme wiring', () => {
  it('registers the theme boot file and the Quasar Dark plugin', () => {
    expect(quasarConfig).toMatch(/boot:\s*\[[^\]]*'theme'/s)
    expect(quasarConfig).toMatch(/plugins:\s*\[[^\]]*'Dark'/s)
    expect(existsSync(resolve('src/boot/theme.js'))).toBe(true)
  })

  it('sets the dark class before the app entry point', () => {
    const body = indexHtml.slice(indexHtml.indexOf('<body>'))
    const scriptIndex = body.indexOf('mistersofts-cm-theme')
    const entryIndex = body.indexOf('quasar:entry-point')

    expect(scriptIndex).toBeGreaterThan(-1)
    expect(entryIndex).toBeGreaterThan(-1)
    expect(scriptIndex).toBeLessThan(entryIndex)
    expect(body).toContain('body--dark')
  })
})

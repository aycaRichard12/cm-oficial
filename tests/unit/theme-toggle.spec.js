import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const toggle = readFileSync(resolve('src/components/ThemeToggle.vue'), 'utf8')
const header = readFileSync(resolve('src/layouts/HeaderLayout.vue'), 'utf8')

describe('ThemeToggle', () => {
  it('uses the shared store and exposes an accessible button', () => {
    expect(toggle).toContain('useThemeStore')
    expect(toggle).toContain('aria-label')
    expect(toggle).toContain('aria-pressed')
    expect(toggle).toContain('@click')
  })

  it('is mounted in the authenticated header', () => {
    expect(header).toContain('ThemeToggle')
  })
})

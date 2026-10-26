import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const css = readFileSync('src/css/theme.scss', 'utf8')

function tokens(block) {
  const result = {}
  for (const [, name, value] of block.matchAll(/--cm-([\w-]+):\s*(#[0-9a-f]{3,8})/gi)) {
    result[name] = value
  }
  return result
}

const lightBlock = css.slice(css.indexOf(':root'), css.indexOf('body.body--dark'))
const darkBlock = css.slice(css.indexOf('body.body--dark'), css.indexOf('body {'))

function luminance(hex) {
  let value = hex.replace('#', '')
  if (value.length === 3) value = [...value].map((c) => c + c).join('')
  const [r, g, b] = [0, 2, 4].map((i) => {
    const channel = parseInt(value.slice(i, i + 2), 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a, b) {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (high + 0.05) / (low + 0.05)
}

const light = tokens(lightBlock)
const dark = tokens(darkBlock)

const pairs = [
  ['light text on page', light.text, light.bg],
  ['light text on surface', light.text, light.surface],
  ['light muted on page', light['text-muted'], light.bg],
  ['light muted on surface', light['text-muted'], light.surface],
  ['dark text on page', dark.text, dark.bg],
  ['dark text on surface', dark.text, dark.surface],
  ['dark muted on page', dark['text-muted'], dark.bg],
  ['dark muted on surface', dark['text-muted'], dark.surface],
  ['on-primary on brand', light['on-primary'], light.brand],
]

describe('theme contrast', () => {
  it.each(pairs)('%s meets WCAG AA 4.5:1', (_name, foreground, background) => {
    expect(foreground).toMatch(/^#/)
    expect(background).toMatch(/^#/)
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5)
  })
})

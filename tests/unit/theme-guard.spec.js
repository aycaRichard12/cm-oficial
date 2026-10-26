import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = 'src'
const EXTENSIONS = new Set(['.js', '.vue', '.scss', '.css'])
const ALLOWLIST = [
  'src/css/theme.scss',
  'src/css/app.scss',
  'src/css/quasar.variables.scss',
  'src/css/quasar.variables.css',
  'src/composables/useChartTheme.js',
  'src/utils/pdfs/',
  'src/modules/pdf/',
]
const ALLOWLIST_PATTERNS = [/src\/modules\/[^/]+\/services\/[^/]*PdfService\.js$/]

const FORBIDDEN = [
  /#eeebe2/i,
  /#fff(?:fff)?\b/i,
  /\bwhite\b(?!-)/i,
  /#fafafa/i,
  /#f5f7fa/i,
  /#e9ecef/i,
  /#e0e0e0/i,
  /#f0f0f0/i,
  /#333\b/,
  /#2c3e50/i,
  /#004d40/i,
  /#777\b/,
  /#aaa\b/,
  /#ddd\b/,
  /text-grey-9/,
  /text-grey-8/,
  /bg-white/,
]

const IGNORE_LINE = /^\s*(\/\/|\/\*|\*|<!--)/

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) return walk(path)
    const dot = entry.lastIndexOf('.')
    if (dot < 0 || !EXTENSIONS.has(entry.slice(dot))) return []
    return [path]
  })
}

function isAllowed(path) {
  const normalized = relative('.', path).split('\\').join('/')
  return (
    ALLOWLIST.some((allowed) => normalized.startsWith(allowed)) ||
    ALLOWLIST_PATTERNS.some((pattern) => pattern.test(normalized))
  )
}

function isLineAllowed(line) {
  if (IGNORE_LINE.test(line)) return true
  if (line.includes('theme-allow')) return true
  if (/\b(color|spinner-color)="white"/.test(line)) return true
  if (/\btext-white\b/.test(line) && /\bbg-(primary|secondary|warning|negative|positive|info|dark)\b/.test(line)) {
    return true
  }
  return false
}

describe('theme literal guard', () => {
  it('has no hardcoded light-only colours outside the allowlist', () => {
    const offences = []

    for (const path of walk(ROOT)) {
      if (isAllowed(path)) continue

      readFileSync(path, 'utf8')
        .split('\n')
        .forEach((line, index) => {
          if (isLineAllowed(line)) return
          if (FORBIDDEN.some((pattern) => pattern.test(line))) {
            offences.push(`${relative('.', path)}:${index + 1}: ${line.trim()}`)
          }
        })
    }

    expect(offences, offences.slice(0, 40).join('\n')).toEqual([])
  })
})

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import messages, { DEFAULT_LOCALE, SUPPORTED_LOCALES, getStoredLocale, storeLocale } from '../../src/i18n'

const ROOT = 'src'
const EXTENSIONS = new Set(['.vue', '.js'])

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) return walk(path)
    const dot = entry.lastIndexOf('.')
    if (dot < 0 || !EXTENSIONS.has(entry.slice(dot))) return []
    return [path]
  })
}

function flatten(value, prefix = '') {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (child && typeof child === 'object' && !Array.isArray(child)) return flatten(child, path)
    return [[path, child]]
  })
}

function hasKey(messages, path) {
  return path.split('.').every((part) => (messages = messages?.[part]) !== undefined)
}

const SOURCE_FILES = walk(ROOT)

describe('cobertura global de i18n', () => {
  it('es-ES y en-US tienen exactamente las mismas claves y ninguna vacía', () => {
    const es = flatten(messages['es-ES']).sort(([a], [b]) => a.localeCompare(b))
    const en = flatten(messages['en-US']).sort(([a], [b]) => a.localeCompare(b))
    expect(en.map(([key]) => key)).toEqual(es.map(([key]) => key))
    for (const [key, value] of [...es, ...en]) {
      expect(typeof value, key).toBe('string')
      expect(value.trim().length, key).toBeGreaterThan(0)
    }
  })

  it('todas las claves referenciadas por $t/i18nT/t existen en ambos idiomas', () => {
    const used = new Set()
    for (const file of SOURCE_FILES) {
      const source = readFileSync(file, 'utf8')
      for (const match of source.matchAll(/(?<![.\w$])(?:\$t|i18nT|t)\(\s*['"]([^'"]+)['"]/g)) {
        if (!match[1].includes('${')) used.add(match[1])
      }
    }
    expect(used.size).toBeGreaterThan(500)
    for (const key of used) {
      expect(hasKey(messages['es-ES'], key), `es-ES falta ${key}`).toBe(true)
      expect(hasKey(messages['en-US'], key), `en-US falta ${key}`).toBe(true)
    }
  })

  it('el selector de idioma persiste la preferencia', () => {
    const storage = new Map()
    const previous = globalThis.window
    globalThis.window = {
      localStorage: {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
      },
    }
    try {
      expect(SUPPORTED_LOCALES).toEqual(['es-ES', 'en-US'])
      expect(DEFAULT_LOCALE).toBe('es-ES')
      storeLocale('en-US')
      expect(getStoredLocale()).toBe('en-US')
      storeLocale('fr-FR')
      expect(getStoredLocale()).toBe('en-US')
    } finally {
      globalThis.window = previous
    }
  })
})

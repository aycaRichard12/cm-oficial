import { describe, it, expect, vi, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createI18n } from 'vue-i18n'
import messages, {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  getStoredLocale,
  storeLocale,
} from '../../src/i18n'

function flattenKeys(value, prefix = '') {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (child && typeof child === 'object' && !Array.isArray(child)) {
      return flattenKeys(child, path)
    }
    return [path]
  })
}

describe('i18n de Configuración → General', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('mantiene el español como idioma predeterminado', () => {
    expect(DEFAULT_LOCALE).toBe('es-ES')
    expect(getStoredLocale()).toBe('es-ES')
  })

  it('admite español e inglés', () => {
    expect(SUPPORTED_LOCALES).toEqual(['es-ES', 'en-US'])
    expect(Object.keys(messages).sort()).toEqual(['en-US', 'es-ES'])
  })

  it('ambos idiomas tienen exactamente las mismas claves', () => {
    const esKeys = flattenKeys(messages['es-ES']).sort()
    const enKeys = flattenKeys(messages['en-US']).sort()
    expect(enKeys).toEqual(esKeys)
  })

  it('ninguna traducción queda vacía', () => {
    for (const locale of SUPPORTED_LOCALES) {
      for (const [key, value] of Object.entries(messages[locale])) {
        void key
        expect(JSON.stringify(value).includes('""')).toBe(false)
      }
    }
  })

  it('traduce las cuatro páginas del grupo General', () => {
    const tabs = ['tipodealmacen', 'divisas', 'leyendaproforma', 'tipokardex']
    for (const tab of tabs) {
      expect(messages['es-ES'].configGeneral.tabs[tab]).toBeTruthy()
      expect(messages['en-US'].configGeneral.tabs[tab]).toBeTruthy()
    }

    const titles = [
      ['tipoAlmacen', 'Registrar Tipo de Almacén', 'Register Warehouse Type'],
      ['divisas', 'Gestión de Divisas', 'Currency Management'],
      ['leyenda', 'Leyenda Proforma', 'Proforma Legend'],
      ['kardex', 'Configuración de Kardex', 'Kardex Configuration'],
    ]

    for (const [section, es, en] of titles) {
      expect(messages['es-ES'].configGeneral[section].title).toBe(es)
      expect(messages['en-US'].configGeneral[section].title).toBe(en)
    }
  })

  it('cambia de idioma sin recargar y persiste la elección', () => {
    const storage = new Map()
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
      },
    })

    const i18n = createI18n({
      legacy: false,
      locale: getStoredLocale(),
      fallbackLocale: DEFAULT_LOCALE,
      messages,
    })

    expect(i18n.global.t('configGeneral.divisas.title')).toBe('Gestión de Divisas')

    i18n.global.locale.value = 'en-US'
    storeLocale('en-US')

    expect(i18n.global.t('configGeneral.divisas.title')).toBe('Currency Management')
    expect(getStoredLocale()).toBe('en-US')
  })
})

describe('Cableado de i18n en las páginas de Configuración → General', () => {
  const pages = [
    'src/pages/General/tipoAlmacenGeneral.vue',
    'src/pages/General/divisasGeneral.vue',
    'src/pages/General/leyendaProformaGeneral.vue',
    'src/pages/cotizacion/configuraciontipoKardexPage.vue',
  ]

  const components = [
    'src/components/general/tipoAlmacen/FormTipoAlmacen.vue',
    'src/components/general/tipoAlmacen/TableTipoAlmacen.vue',
    'src/components/general/divisa/FormDivisa.vue',
    'src/components/general/divisa/TableDivisa.vue',
    'src/components/general/Leyenda/FormLeyenda.vue',
    'src/components/general/Leyenda/TableLeyenda.vue',
  ]

  it('cada página usa useI18n y el selector vive solo en la cabecera', () => {
    for (const page of pages) {
      const source = readFileSync(resolve(page), 'utf8')
      expect(source, page).toContain('useI18n')
      expect(source, page).not.toContain('LanguageSwitcher')
    }

    const header = readFileSync(resolve('src/layouts/HeaderLayout.vue'), 'utf8')
    expect(header).toContain('LanguageSwitcher')
    expect(header).toContain('<LanguageSwitcher color="white" />')
  })

  it('los formularios y tablas usan claves de traducción', () => {
    for (const component of components) {
      const source = readFileSync(resolve(component), 'utf8')
      expect(source, component).toContain('useI18n')
      expect(source, component).toContain("t('")
    }
  })

  it('las pestañas del grupo General se traducen en la cabecera', () => {
    const header = readFileSync(resolve('src/layouts/HeaderLayout.vue'), 'utf8')
    for (const key of ['tipodealmacen', 'divisas', 'leyendaproforma', 'tipokardex']) {
      expect(header).toContain(`configGeneral.tabs.${key}`)
    }
  })
})

describe('Cobertura de claves usadas por Configuración → General', () => {
  const sources = [
    'src/layouts/HeaderLayout.vue',
    'src/components/general/LanguageSwitcher.vue',
    'src/pages/General/tipoAlmacenGeneral.vue',
    'src/pages/General/divisasGeneral.vue',
    'src/pages/General/leyendaProformaGeneral.vue',
    'src/pages/cotizacion/configuraciontipoKardexPage.vue',
    'src/components/general/tipoAlmacen/FormTipoAlmacen.vue',
    'src/components/general/tipoAlmacen/TableTipoAlmacen.vue',
    'src/components/general/divisa/FormDivisa.vue',
    'src/components/general/divisa/TableDivisa.vue',
    'src/components/general/Leyenda/FormLeyenda.vue',
    'src/components/general/Leyenda/TableLeyenda.vue',
  ]

  const usedKeys = new Set()
  for (const source of sources) {
    const text = readFileSync(resolve(source), 'utf8')
    for (const match of text.matchAll(/\bt\(['"]([^'"]+)['"]/g)) {
      usedKeys.add(match[1])
    }
  }

  const hasKey = (messages, path) =>
    path.split('.').every((part) => (messages = messages?.[part]) !== undefined)

  it('todas las claves usadas existen en español y en inglés', () => {
    expect(usedKeys.size).toBeGreaterThan(20)
    for (const key of usedKeys) {
      expect(hasKey(messages['es-ES'], key), `es-ES falta ${key}`).toBe(true)
      expect(hasKey(messages['en-US'], key), `en-US falta ${key}`).toBe(true)
    }
  })
})

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

describe('i18n de Configuración → Producto y Servicio', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('admite español e inglés con estructura idéntica en configProducto', () => {
    expect(SUPPORTED_LOCALES).toEqual(['es-ES', 'en-US'])
    const esKeys = flattenKeys(messages['es-ES'].configProducto).sort()
    const enKeys = flattenKeys(messages['en-US'].configProducto).sort()
    expect(enKeys).toEqual(esKeys)
    expect(esKeys.length).toBeGreaterThan(50)
  })

  it('ninguna traducción queda vacía en configProducto', () => {
    for (const locale of SUPPORTED_LOCALES) {
      for (const [key, value] of Object.entries(messages[locale].configProducto)) {
        void key
        expect(JSON.stringify(value).includes('""')).toBe(false)
      }
    }
  })

  it('traduce las siete pestañas del grupo Producto en el header', () => {
    const tabs = [
      'categoriadeproducto',
      'estadodeproducto',
      'unidaddeproducto',
      'caracteristicadeproducto',
      'parametrosdeobsolescencia',
      'configuracionproductounico',
      'configuracionproductovariante',
    ]
    for (const tab of tabs) {
      expect(messages['es-ES'].configProducto.tabs[tab]).toBeTruthy()
      expect(messages['en-US'].configProducto.tabs[tab]).toBeTruthy()
    }

    const titles = [
      ['categoriaProducto', 'Categoría de Producto', 'Product Category'],
      ['estadoProducto', 'Estado de Producto', 'Product Status'],
      ['unidadProducto', 'Unidad de Producto', 'Product Unit'],
      ['caracteristicaProducto', 'Característica de Producto', 'Product Feature'],
      ['parametroObsolescencia', 'Parámetros de Obsolescencia', 'Obsolescence Parameters'],
      ['configuracionProductoUnico', 'Configuración de Producto Único', 'Unique Product Configuration'],
      ['configuracionProductoVariante', 'Configuración de Producto Variante', 'Product Variant Configuration'],
    ]

    for (const [section, es, en] of titles) {
      expect(messages['es-ES'].configProducto[section].title).toBe(es)
      expect(messages['en-US'].configProducto[section].title).toBe(en)
    }
  })

  it('cambia de idioma sin recargar y persiste la elección para configProducto', () => {
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

    expect(i18n.global.t('configProducto.categoriaProducto.title')).toBe('Categoría de Producto')

    i18n.global.locale.value = 'en-US'
    storeLocale('en-US')

    expect(i18n.global.t('configProducto.categoriaProducto.title')).toBe('Product Category')
    expect(getStoredLocale()).toBe('en-US')
  })
})

describe('Cableado de i18n en las páginas y componentes de Configuración → Producto', () => {
  const pages = [
    'src/pages/ProductoConf/categoriaProducto.vue',
    'src/pages/ProductoConf/estadoProducto.vue',
    'src/pages/ProductoConf/unidadProducto.vue',
    'src/pages/ProductoConf/caracteristicaProducto.vue',
    'src/pages/ProductoConf/parametroObsolescencia.vue',
  ]

  const components = [
    'src/components/productoConf/categoria/categoriaForm.vue',
    'src/components/productoConf/categoria/categoriaTable.vue',
    'src/components/productoConf/estadoProducto/estadoForm.vue',
    'src/components/productoConf/estadoProducto/estadoTable.vue',
    'src/components/productoConf/unidadProducto/unidadForm.vue',
    'src/components/productoConf/unidadProducto/unidadTable.vue',
    'src/components/productoConf/caracteristicas/caracteristicaForm.vue',
    'src/components/productoConf/caracteristicas/caracteristicaTable.vue',
    'src/components/productoConf/ParametrosObsolescencia/parametrosObsolescenciaForm.vue',
    'src/components/productoConf/ParametrosObsolescencia/parametrosObsolescenciaTable.vue',
    'src/components/productoUnico/configuracioPU.vue',
    'src/modules/config/components/ConfiguracionProductoVariante.vue',
  ]

  it('cada página usa useI18n y no incrusta selectores de idioma locales', () => {
    for (const page of pages) {
      const source = readFileSync(resolve(page), 'utf8')
      expect(source, page).toContain('useI18n')
      expect(source, page).not.toContain('LanguageSwitcher')
    }
  })

  it('los formularios y tablas usan claves de traducción', () => {
    for (const component of components) {
      const source = readFileSync(resolve(component), 'utf8')
      expect(source, component).toContain('useI18n')
      expect(source, component).toMatch(/\bt\(['"]/)
    }
  })

  it('las pestañas del grupo Producto se traducen en la cabecera', () => {
    const header = readFileSync(resolve('src/layouts/HeaderLayout.vue'), 'utf8')
    for (const key of [
      'categoriadeproducto',
      'estadodeproducto',
      'unidaddeproducto',
      'caracteristicadeproducto',
      'parametrosdeobsolescencia',
      'configuracionproductounico',
      'configuracionproductovariante',
    ]) {
      expect(header).toContain(`configProducto.tabs.${key}`)
    }
  })
})

describe('Cobertura de claves usadas por Configuración → Producto', () => {
  const sources = [
    'src/layouts/HeaderLayout.vue',
    'src/pages/ProductoConf/categoriaProducto.vue',
    'src/pages/ProductoConf/estadoProducto.vue',
    'src/pages/ProductoConf/unidadProducto.vue',
    'src/pages/ProductoConf/caracteristicaProducto.vue',
    'src/pages/ProductoConf/parametroObsolescencia.vue',
    'src/components/productoConf/categoria/categoriaForm.vue',
    'src/components/productoConf/categoria/categoriaTable.vue',
    'src/components/productoConf/estadoProducto/estadoForm.vue',
    'src/components/productoConf/estadoProducto/estadoTable.vue',
    'src/components/productoConf/unidadProducto/unidadForm.vue',
    'src/components/productoConf/unidadProducto/unidadTable.vue',
    'src/components/productoConf/caracteristicas/caracteristicaForm.vue',
    'src/components/productoConf/caracteristicas/caracteristicaTable.vue',
    'src/components/productoConf/ParametrosObsolescencia/parametrosObsolescenciaForm.vue',
    'src/components/productoConf/ParametrosObsolescencia/parametrosObsolescenciaTable.vue',
    'src/components/productoUnico/configuracioPU.vue',
    'src/modules/config/components/ConfiguracionProductoVariante.vue',
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

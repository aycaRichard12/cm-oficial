import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const FIXTURES = resolve(HERE, '..', 'fixtures', 'api')
const load = (name) => JSON.parse(readFileSync(resolve(FIXTURES, name), 'utf8'))

const TYPE = (v) => (Array.isArray(v) ? 'array' : typeof v)

function assertShape(obj, { required = [], types = {} } = {}) {
  for (const k of required) {
    expect(obj, `campo requerido '${k}'`).toHaveProperty(k)
  }
  for (const [k, t] of Object.entries(types)) {
    if (obj[k] !== undefined) {
      expect(TYPE(obj[k]), `tipo de '${k}'`).toBe(t)
    }
  }
}

describe('Contract: POST /api/detectar_intencion', () => {
  it('fixture cumple la forma consumida por src/layouts/ComandoVoz.vue:88', () => {
    const body = load('detectar_intencion.ok.json')
    assertShape(body, {
      required: ['intencion', 'respuestaPorVoz'],
      types: { intencion: 'string', respuestaPorVoz: 'string' },
    })
    // Campos opcionales que ComandoVoz desestructura
    expect(body).toHaveProperty('parametros')
    expect(body.parametros).toHaveProperty('menu')
  })
})

describe('Contract: GET /api/getNotificaciones/:idUsuario/:idEmpresa', () => {
  it('fixture es un array con id, codigo, title', () => {
    const body = load('get_notificaciones.ok.json')
    expect(Array.isArray(body)).toBe(true)
    expect(body.length).toBeGreaterThan(0)
    for (const n of body) {
      assertShape(n, {
        required: ['id', 'codigo', 'title'],
        types: { id: 'number', codigo: 'string', title: 'string' },
      })
    }
  })
})

describe('Contract: GET /api/listarOperaciones/:idEmpresa', () => {
  it('fixture tiene wrapper data y campos consumidos por IndexPage.vue:153-157', () => {
    const body = load('listar_operaciones.ok.json')
    expect(body).toHaveProperty('data')
    expect(Array.isArray(body.data)).toBe(true)
    for (const op of body.data) {
      assertShape(op, {
        required: ['codigo', 'estado'],
        types: { codigo: 'string', estado: 'number' },
      })
    }
  })
})

describe('Contract: modo live (opcional)', () => {
  const base = process.env.API_BASE
  const maybe = base ? it : it.skip
  maybe('detectar_intencion responde con la forma esperada contra la API real', async () => {
    const res = await fetch(`${base}/detectar_intencion`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ comando: 'abre ventas', sessionId: 'contract-test' }),
    })
    const body = await res.json()
    expect(res.ok).toBe(true)
    expect(body).toHaveProperty('intencion')
    expect(body).toHaveProperty('respuestaPorVoz')
  })
})

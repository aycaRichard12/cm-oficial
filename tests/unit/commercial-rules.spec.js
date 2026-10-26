import { describe, it, expect } from 'vitest'
import {
  computeSaleTotal,
  validateReturn,
  accountsReceivableBalance,
  canWriteModule,
} from '../../src/utils/commercialRules.js'

describe('INV-S-03 computeSaleTotal', () => {
  it('suma líneas sin impuestos', () => {
    expect(computeSaleTotal([{ qty: 2, unitPrice: 10 }, { qty: 3, unitPrice: 5.5 }])).toBe(36.5)
  })
  it('aplica descuento antes de impuestos y redondea a 2 decimales', () => {
    const total = computeSaleTotal([{ qty: 1, unitPrice: 100 }], { discount: 10, taxRate: 0.16 })
    expect(total).toBe(104.4)
  })
  it('nunca devuelve total negativo', () => {
    expect(computeSaleTotal([{ qty: 1, unitPrice: 5 }], { discount: 999 })).toBe(0)
  })
})

describe('INV-S-02 validateReturn', () => {
  it('acepta devolución dentro de lo vendido', () => {
    expect(validateReturn({ soldQty: 10, returnedQty: 3 }).ok).toBe(true)
  })
  it('rechaza devolución que excede lo vendido', () => {
    const r = validateReturn({ soldQty: 10, returnedQty: 11 })
    expect(r.ok).toBe(false)
    expect(r.reason).toBe('exceeds_available_to_return')
    expect(r.available).toBe(10)
  })
  it('considera devoluciones previas', () => {
    const r = validateReturn({ soldQty: 10, returnedQty: 4, alreadyReturned: 7 })
    expect(r.ok).toBe(false)
    expect(r.available).toBe(3)
  })
  it('rechaza cantidades no positivas', () => {
    expect(validateReturn({ soldQty: 10, returnedQty: 0 }).ok).toBe(false)
  })
})

describe('INV-A-02 accountsReceivableBalance', () => {
  it('saldo = facturas - pagos - notas de crédito', () => {
    const bal = accountsReceivableBalance({
      invoices: [{ amount: 1000 }, { amount: 500 }],
      payments: [{ amount: 300 }],
      creditNotes: [{ amount: 100 }],
    })
    expect(bal).toBe(1100)
  })
})

describe('INV-P-01 canWriteModule', () => {
  it('VENTAS escribe en sales pero no en accounting', () => {
    expect(canWriteModule({ module: 'sales', role: 'VENTAS' })).toBe(true)
    expect(canWriteModule({ module: 'accounting', role: 'VENTAS' })).toBe(false)
  })
  it('ALMACEN escribe en inventory pero no en sales', () => {
    expect(canWriteModule({ module: 'inventory', role: 'ALMACEN' })).toBe(true)
    expect(canWriteModule({ module: 'sales', role: 'ALMACEN' })).toBe(false)
  })
  it('ADMINISTRADOR escribe en todos los módulos', () => {
    for (const m of ['sales', 'inventory', 'accounting']) {
      expect(canWriteModule({ module: m, role: 'ADMINISTRADOR' })).toBe(true)
    }
  })
})

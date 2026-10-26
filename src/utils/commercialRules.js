// Reglas comerciales puras (INV-S-02, INV-S-03, INV-A-02, INV-P-01).
// Deben permanecer libres de dependencias para poder probarse sin DOM ni red.

export function computeSaleTotal(lines = [], { discount = 0, taxRate = 0 } = {}) {
  const subtotal = lines.reduce((acc, l) => {
    const qty = Number(l.qty) || 0
    const price = Number(l.unitPrice) || 0
    return acc + qty * price
  }, 0)
  const discounted = Math.max(0, subtotal - Number(discount || 0))
  const total = discounted * (1 + Number(taxRate || 0))
  return Math.round(total * 100) / 100
}

export function validateReturn({ soldQty, returnedQty, alreadyReturned = 0 }) {
  const max = Number(soldQty) - Number(alreadyReturned)
  const req = Number(returnedQty)
  if (!Number.isFinite(req) || req <= 0) {
    return { ok: false, reason: 'returned_qty_must_be_positive' }
  }
  if (req > max) {
    return { ok: false, reason: 'exceeds_available_to_return', available: max }
  }
  return { ok: true, available: max - req }
}

export function accountsReceivableBalance({ invoices = [], payments = [], creditNotes = [] } = {}) {
  const sum = (arr, f) => arr.reduce((a, x) => a + (Number(f(x)) || 0), 0)
  const total = sum(invoices, (x) => x.amount)
    - sum(payments, (x) => x.amount)
    - sum(creditNotes, (x) => x.amount)
  return Math.round(total * 100) / 100
}

const MODULE_ROLES = {
  sales: ['ADMINISTRADOR', 'VENTAS', 'PRODUCCION'],
  inventory: ['ADMINISTRADOR', 'ALMACEN'],
  accounting: ['ADMINISTRADOR'],
}

export function canWriteModule({ module, role }) {
  return (MODULE_ROLES[module] || []).includes(role)
}

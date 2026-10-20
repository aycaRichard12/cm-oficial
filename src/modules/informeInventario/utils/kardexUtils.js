// src/modules/informeInventario/utils/kardexUtils.js

const LOCALE = 'es-BO'

/**
 * Convierte cualquier valor a numero finito.
 */
export function toNumber(v) {
  if (v == null || v === '') return 0
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  const n = Number(v)
  if (Number.isFinite(n)) return n
  const cleaned = String(v).replace(/\./g, '').replace(',', '.')
  const n2 = Number(cleaned)
  return Number.isFinite(n2) ? n2 : 0
}

/**
 * Formatea una cantidad con 2 decimales fijos (locale es-BO).
 * Ej: 1471 -> "1.471,00"
 */
export function fmtCantidad(v) {
  const n = toNumber(v)
  return n.toLocaleString(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Formatea un valor monetario con 2 decimales fijos.
 */
export function fmtMoneda(v) {
  return fmtCantidad(v)
}

/**
 * Calcula P. Unit. = P. Total / Cantidad. Respeta pUnitHint si ya viene del API.
 */
export function calcularPrecioUnitario(cantidad, total, pUnitHint) {
  const hinted = toNumber(pUnitHint)
  if (hinted > 0) return hinted
  const c = toNumber(cantidad)
  const t = toNumber(total)
  if (c === 0) return 0
  return t / c
}

/**
 * Transforma una fila del API a un shape PLANO con 12 columnas numericas.
 * Idempotente.
 */
export function transformarFilaKardex(row, index = 0) {
  if (!row || typeof row !== 'object') return null
  if (row.__kardexTransformed) return row

  const siCantidad = toNumber(row?.saldoInicial?.cantidad)
  const siPTotal = toNumber(row?.saldoInicial?.valor)
  const entCantidad = toNumber(row?.comprasPeriodo?.cantidad)
  const entPTotal = toNumber(row?.comprasPeriodo?.valor)
  const salCantidad = toNumber(row?.salidasPeriodo?.cantidad)
  const salPTotal = toNumber(row?.salidasPeriodo?.valor)
  const sfCantidad = toNumber(row?.saldoFinal?.cantidad)
  const sfPTotal = toNumber(row?.saldoFinal?.valor)

  return {
    ...row,
    __kardexTransformed: true,
    __id: row.idProductoAlmacen != null ? row.idProductoAlmacen : `kdx-${index}`,
    siCantidad,
    siPUnit: calcularPrecioUnitario(siCantidad, siPTotal, row?.saldoInicial?.pUnit),
    siPTotal,
    entCantidad,
    entPUnit: calcularPrecioUnitario(entCantidad, entPTotal, row?.comprasPeriodo?.pUnit),
    entPTotal,
    salCantidad,
    salPUnit: calcularPrecioUnitario(salCantidad, salPTotal, row?.salidasPeriodo?.pUnit),
    salPTotal,
    sfCantidad,
    sfPUnit: calcularPrecioUnitario(sfCantidad, sfPTotal, row?.saldoFinal?.pUnit),
    sfPTotal,
  }
}

/**
 * Suma los P. Total de las 4 secciones.
 */
export function calcularTotales(filas) {
  const t = { siPTotal: 0, entPTotal: 0, salPTotal: 0, sfPTotal: 0 }
  if (!Array.isArray(filas)) return t
  for (const r of filas) {
    t.siPTotal += toNumber(r.siPTotal)
    t.entPTotal += toNumber(r.entPTotal)
    t.salPTotal += toNumber(r.salPTotal)
    t.sfPTotal += toNumber(r.sfPTotal)
  }
  return t
}

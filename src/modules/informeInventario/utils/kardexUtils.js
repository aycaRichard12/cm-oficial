// src/modules/informeInventario/utils/kardexUtils.js

/**
 * Convierte cualquier valor a numero finito.
 */
// [kdx-fix-number-format-v2] toNumber y fmtCantidad deterministas:
// eliminan la dependencia de ICU y desambiguan cadenas patologicas
// ("19.100.00" -> 19100, "191.00.." -> 19100, "1.366,00" -> 1366).
export function toNumber(v) {
  if (v == null || v === '') return 0
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0

  let s = String(v).trim()
  if (!s) return 0

  s = s.replace(/[^\d.,-]/g, '')
  if (!s) return 0

  const hasDot = s.includes('.')
  const hasComma = s.includes(',')

  if (hasDot && hasComma) {
    s = s.replace(/\./g, '').replace(',', '.')
  } else if (hasComma && !hasDot) {
    s = s.replace(',', '.')
  } else if (hasDot && !hasComma) {
    const parts = s.split('.')
    if (parts.length === 2) {
      // "123.45" -> decimal
    } else if (parts.length > 2) {
      const last = parts[parts.length - 1]
      if (last.length <= 2) {
        s = parts.slice(0, -1).join('') + '.' + last
      } else {
        s = parts.join('')
      }
    }
  }

  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

/**
 * Formatea un numero al estilo espanol de forma DETERMINISTA:
 * punto para miles, coma para decimales. No depende de ICU ni locale del runtime.
 */
export function formatNumberEs(n, decimals = 2) {
  if (!Number.isFinite(n)) n = 0
  const negative = n < 0
  const abs = Math.abs(n)
  const fixed = abs.toFixed(decimals)
  const [intPart, decPart] = fixed.split('.')
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return (negative ? '-' : '') + withThousands + (decPart ? ',' + decPart : '')
}

/**
 * Formatea una cantidad con 2 decimales fijos (formato espanol determinista).
 * Ej: 1471 -> "1.471,00"
 */
export function fmtCantidad(v) {
  const n = toNumber(v)
  return formatNumberEs(n, 2)
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

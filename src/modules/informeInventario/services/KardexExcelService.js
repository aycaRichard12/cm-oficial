// src/modules/informeInventario/services/KardexExcelService.js
import { fmtCantidad, fmtMoneda, calcularTotales } from '../utils/kardexUtils'
import { KARDEX_COLORS as C } from '../utils/kardexColors'

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]))
}

export class KardexExcelService {
  generate({ filas, titulo = 'Reporte de Inventario Físico - Valorado', almacenNombre = '', fechaInicio = '', fechaFin = '', divisaActiva = '' }) {
    const totales = calcularTotales(filas)
    const fechaIni = this._fmtFecha(fechaInicio)
    const fechaF = this._fmtFecha(fechaFin)

    const headHtml = `
      <tr>
        <th rowspan="2" class="th-base">Ítem</th>
        <th rowspan="2" class="th-base th-desc">Descripción</th>
        <th colspan="3" style="background:${C.saldoInicial.hex}">Saldo Inicial</th>
        <th colspan="3" style="background:${C.entradas.hex}">Entradas</th>
        <th colspan="3" style="background:${C.salidas.hex}">Salidas</th>
        <th colspan="3" style="background:${C.saldoFinal.hex}">Saldo Final</th>
      </tr>
      <tr>
        ${this._thNum('Cantidad', C.saldoInicial.hex)}
        ${this._thNum('P. Unit.', C.saldoInicial.hex)}
        ${this._thNum('P. Total', C.saldoInicial.hex)}
        ${this._thNum('Cantidad', C.entradas.hex)}
        ${this._thNum('P. Unit.', C.entradas.hex)}
        ${this._thNum('P. Total', C.entradas.hex)}
        ${this._thNum('Cantidad', C.salidas.hex)}
        ${this._thNum('P. Unit.', C.salidas.hex)}
        ${this._thNum('P. Total', C.salidas.hex)}
        ${this._thNum('Cantidad', C.saldoFinal.hex)}
        ${this._thNum('P. Unit.', C.saldoFinal.hex)}
        ${this._thNum('P. Total', C.saldoFinal.hex)}
      </tr>
    `

    const bodyRows = (filas || [])
      .map((r, i) => {
        const bgSi = `background:${C.saldoInicial.hexBody}`
        const bgEn = `background:${C.entradas.hexBody}`
        const bgSa = `background:${C.salidas.hexBody}`
        const bgSf = `background:${C.saldoFinal.hexBody}`
        return `
          <tr>
            <td class="td-num">${i + 1}</td>
            <td class="td-desc">${escapeHtml(r.descripcion)}</td>
            <td class="td-num" style="${bgSi}">${fmtCantidad(r.siCantidad)}</td>
            <td class="td-num" style="${bgSi}">${fmtMoneda(r.siPUnit)}</td>
            <td class="td-num" style="${bgSi}">${fmtMoneda(r.siPTotal)}</td>
            <td class="td-num" style="${bgEn}">${fmtCantidad(r.entCantidad)}</td>
            <td class="td-num" style="${bgEn}">${fmtMoneda(r.entPUnit)}</td>
            <td class="td-num" style="${bgEn}">${fmtMoneda(r.entPTotal)}</td>
            <td class="td-num" style="${bgSa}">${fmtCantidad(r.salCantidad)}</td>
            <td class="td-num" style="${bgSa}">${fmtMoneda(r.salPUnit)}</td>
            <td class="td-num" style="${bgSa}">${fmtMoneda(r.salPTotal)}</td>
            <td class="td-num" style="${bgSf}">${fmtCantidad(r.sfCantidad)}</td>
            <td class="td-num" style="${bgSf}">${fmtMoneda(r.sfPUnit)}</td>
            <td class="td-num" style="${bgSf}">${fmtMoneda(r.sfPTotal)}</td>
          </tr>`
      })
      .join('')

    const totalRow = `
      <tr class="totales">
        <td colspan="2" class="td-num">TOTALES</td>
        <td class="td-num"></td><td class="td-num"></td>
        <td class="td-num" style="background:${C.saldoInicial.hex}">${fmtMoneda(totales.siPTotal)}</td>
        <td class="td-num"></td><td class="td-num"></td>
        <td class="td-num" style="background:${C.entradas.hex}">${fmtMoneda(totales.entPTotal)}</td>
        <td class="td-num"></td><td class="td-num"></td>
        <td class="td-num" style="background:${C.salidas.hex}">${fmtMoneda(totales.salPTotal)}</td>
        <td class="td-num"></td><td class="td-num"></td>
        <td class="td-num" style="background:${C.saldoFinal.hex}">${fmtMoneda(totales.sfPTotal)}</td>
      </tr>`

    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<style>
  table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px; }
  th, td { border: 1px solid #BDBDBD; padding: 4px 6px; }
  .th-base { background: #F5F5F5; font-weight: bold; }
  .th-desc { text-align: left; }
  th { text-align: right; }
  th[colspan], th[rowspan] { text-align: center; }
  .td-num { text-align: right; }
  .td-desc { text-align: left; }
  .totales td { font-weight: bold; background: ${C.totales.hex}; }
  .titulo { font-size: 16px; font-weight: bold; }
  .subtitulo { font-size: 11px; color: #555; }
</style>
</head>
<body>
<table>
  <tr><td colspan="14" class="titulo">${escapeHtml(titulo)}</td></tr>
  <tr><td colspan="14" class="subtitulo">Almacén: ${escapeHtml(almacenNombre || '-')} | Rango: ${escapeHtml(fechaIni)} al ${escapeHtml(fechaF)} | Divisa: ${escapeHtml(divisaActiva || '-')}</td></tr>
  <tr><td colspan="14"></td></tr>
  <thead>${headHtml}</thead>
  <tbody>${bodyRows}${totalRow}</tbody>
</table>
</body></html>`

    return new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel;charset=utf-8' })
  }

  _thNum(label, bg) {
    return `<th style="background:${bg}; text-align:right">${label}</th>`
  }

  _fmtFecha(iso) {
    // [kdx-fix-timezone] _fmtFecha (Excel) — normaliza offsets antes de formatear.
    if (!iso) return ''
    let s = ''
    if (iso instanceof Date) {
      if (Number.isNaN(iso.getTime())) return ''
      s = iso.toISOString().slice(0, 10)
    } else if (typeof iso === 'number') {
      const dt = new Date(iso)
      if (Number.isNaN(dt.getTime())) return ''
      s = dt.toISOString().slice(0, 10)
    } else {
      s = String(iso).trim()
    }
    if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
      const dt = new Date(s)
      if (!Number.isNaN(dt.getTime())) {
        s = dt.toISOString().slice(0, 10)
      }
    }
    const m = s.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/)
    if (m) return `${m[3]}/${m[2]}/${m[1]}`
    return s
  }
}

// src/modules/informeInventario/services/KardexPdfService.js
import autoTable from 'jspdf-autotable'
import { PdfDocumentBuilder } from 'src/modules/pdf/builders/PdfDocumentBuilder'
import { ReportDataService } from 'src/modules/pdf/services/ReportDataService'
import { KARDEX_COLORS as C } from '../utils/kardexColors'
import { fmtCantidad, fmtMoneda, calcularTotales } from '../utils/kardexUtils'

export class KardexPdfService {
  constructor() {
    this.dataService = new ReportDataService()
  }

  async generate(options = {}) {
    const {
      filas = [],
      titulo = 'Reporte de Inventario Físico - Valorado',
      almacenNombre = '-',
      fechaInicio = '',
      fechaFin = '',
      divisaActiva = '-',
      orientation = 'landscape',
      format = 'a4',
      userData: udOpt = null,
    } = options

    const userData = udOpt || (await this.dataService.getUserData())
    const docBuilder = new PdfDocumentBuilder(userData, { orientation, format })
    const doc = docBuilder.doc

    const datosIzquierda = {
      titulo: 'DATOS DEL REPORTE',
      campos: [
        { label: 'Almacén', valor: almacenNombre || '-' },
        { label: 'Rango', valor: `Del ${this._fmtFecha(fechaInicio)} al ${this._fmtFecha(fechaFin)}` },
        { label: 'Divisa', valor: divisaActiva || '-' },
      ],
    }

    docBuilder.addEncabezado()
    docBuilder.addEncabezadoInfo(titulo, null, datosIzquierda, null, false, null)

    const totales = calcularTotales(filas)

    const head = [
      [
        { content: 'Ítem', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [245, 245, 245] } },
        { content: 'Descripción', rowSpan: 2, styles: { halign: 'left', valign: 'middle', fillColor: [245, 245, 245] } },
        { content: 'Saldo Inicial', colSpan: 3, styles: { halign: 'center', fillColor: C.saldoInicial.rgb } },
        { content: 'Entradas', colSpan: 3, styles: { halign: 'center', fillColor: C.entradas.rgb } },
        { content: 'Salidas', colSpan: 3, styles: { halign: 'center', fillColor: C.salidas.rgb } },
        { content: 'Saldo Final', colSpan: 3, styles: { halign: 'center', fillColor: C.saldoFinal.rgb } },
      ],
      [
        { content: 'Cantidad', styles: { halign: 'right', fillColor: C.saldoInicial.rgb } },
        { content: 'P. Unit.', styles: { halign: 'right', fillColor: C.saldoInicial.rgb } },
        { content: 'P. Total', styles: { halign: 'right', fillColor: C.saldoInicial.rgb } },
        { content: 'Cantidad', styles: { halign: 'right', fillColor: C.entradas.rgb } },
        { content: 'P. Unit.', styles: { halign: 'right', fillColor: C.entradas.rgb } },
        { content: 'P. Total', styles: { halign: 'right', fillColor: C.entradas.rgb } },
        { content: 'Cantidad', styles: { halign: 'right', fillColor: C.salidas.rgb } },
        { content: 'P. Unit.', styles: { halign: 'right', fillColor: C.salidas.rgb } },
        { content: 'P. Total', styles: { halign: 'right', fillColor: C.salidas.rgb } },
        { content: 'Cantidad', styles: { halign: 'right', fillColor: C.saldoFinal.rgb } },
        { content: 'P. Unit.', styles: { halign: 'right', fillColor: C.saldoFinal.rgb } },
        { content: 'P. Total', styles: { halign: 'right', fillColor: C.saldoFinal.rgb } },
      ],
    ]

    const body = filas.map((r, i) => [
      String(i + 1),
      String(r.descripcion || ''),
      fmtCantidad(r.siCantidad), fmtMoneda(r.siPUnit), fmtMoneda(r.siPTotal),
      fmtCantidad(r.entCantidad), fmtMoneda(r.entPUnit), fmtMoneda(r.entPTotal),
      fmtCantidad(r.salCantidad), fmtMoneda(r.salPUnit), fmtMoneda(r.salPTotal),
      fmtCantidad(r.sfCantidad), fmtMoneda(r.sfPUnit), fmtMoneda(r.sfPTotal),
    ])

    body.push([
      { content: 'TOTALES', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fillColor: C.totales.rgb } },
      { content: '', styles: { fillColor: C.saldoInicial.rgb } },
      { content: '', styles: { fillColor: C.saldoInicial.rgb } },
      { content: fmtMoneda(totales.siPTotal), styles: { halign: 'right', fontStyle: 'bold', fillColor: C.saldoInicial.rgb } },
      { content: '', styles: { fillColor: C.entradas.rgb } },
      { content: '', styles: { fillColor: C.entradas.rgb } },
      { content: fmtMoneda(totales.entPTotal), styles: { halign: 'right', fontStyle: 'bold', fillColor: C.entradas.rgb } },
      { content: '', styles: { fillColor: C.salidas.rgb } },
      { content: '', styles: { fillColor: C.salidas.rgb } },
      { content: fmtMoneda(totales.salPTotal), styles: { halign: 'right', fontStyle: 'bold', fillColor: C.salidas.rgb } },
      { content: '', styles: { fillColor: C.saldoFinal.rgb } },
      { content: '', styles: { fillColor: C.saldoFinal.rgb } },
      { content: fmtMoneda(totales.sfPTotal), styles: { halign: 'right', fontStyle: 'bold', fillColor: C.saldoFinal.rgb } },
    ])

    const startY = orientation === 'landscape' ? 42 : 58

    autoTable(doc, {
      head,
      body,
      startY,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 1,
        overflow: 'linebreak',
        textColor: [30, 30, 30],
        lineColor: [120, 120, 120],
        lineWidth: 0.15,
      },
      headStyles: {
        fontSize: 7,
        fontStyle: 'bold',
        textColor: [33, 33, 33],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 60, halign: 'left' },
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          const lastIdx = filas.length
          if (data.row.index === lastIdx) {
            data.cell.styles.fontStyle = 'bold'
            return
          }
          const col = data.column.index
          let bg = null
          if (col >= 2 && col <= 4) bg = C.saldoInicial.rgbBody
          else if (col >= 5 && col <= 7) bg = C.entradas.rgbBody
          else if (col >= 8 && col <= 10) bg = C.salidas.rgbBody
          else if (col >= 11 && col <= 13) bg = C.saldoFinal.rgbBody
          if (bg) data.cell.styles.fillColor = bg
        }
      },
      didDrawPage: (data) => {
        if (data.pageNumber > 1) {
          docBuilder.addEncabezado()
          docBuilder.addEncabezadoInfo(titulo, null, datosIzquierda, null, false, null)
        }
      },
    })

    docBuilder.addFooterInfo()
    docBuilder.addPieDePagina()

    return doc
  }

  _fmtFecha(iso) {
    if (!iso) return ''
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (!m) return iso
    return `${m[3]}/${m[2]}/${m[1]}`
  }
}

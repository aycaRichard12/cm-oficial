// src/utils/pdfs/Kardex/reporte.js
import { PdfDocumentBuilder } from 'src/modules/pdf/builders/PdfDocumentBuilder'
import { ReportDataService } from 'src/modules/pdf/services/ReportDataService'
import autoTable from 'jspdf-autotable'

/**
 * Genera el PDF del Kardex Físico Valorado usando los modulos PDF del proyecto.
 *
 * @param {Array}  kardex          Movimientos filtrados (posteriores a fechaIni)
 * @param {string} almacenLabel    Nombre del almacén
 * @param {string} productoLabel   "codigo - descripcion"
 * @param {string} fechaiR         Fecha inicial (YYYY-MM-DD)
 * @param {string} fechafR         Fecha final   (YYYY-MM-DD)
 * @param {string} metodoValoracion PEPS | UEPS | PROMEDIO
 * @param {Object} extra           { saldosIniciales, unidadMedida, stockMax, stockMin, divisa }
 * @returns {import('jspdf').jsPDF}
 */
export async function PDFKardex(
  kardex,
  almacenLabel,
  productoLabel,
  fechaiR,
  fechafR,
  metodoValoracion,
  extra = {},
) {
  const {
    saldosIniciales = [],
    divisa = '',
    //unidadMedida = '',
    //stockMax = '',
    //stockMin = '',
  } = extra || {}

  // Normaliza la divisa: acepta string, ref de Vue, objeto {simbolo|nombre|codigosin} o null.
  const divisaTexto = (() => {
    let v = divisa
    if (v && typeof v === 'object' && 'value' in v) v = v.value
    if (v && typeof v === 'object') {
      v = v.simbolo || v.nombre || v.codigosin || ''
    }
    return typeof v === 'string' ? v.trim() : ''
  })()

  const safeKardex = Array.isArray(kardex) ? kardex : []
  const safeSaldos = Array.isArray(saldosIniciales) ? saldosIniciales : []

  const dataService = new ReportDataService()
  let userData = null
  try {
    userData = await dataService.getUserData()
  } catch (e) {
    console.warn('[PDFKardex] No se pudo cargar la información de la empresa:', e)
    userData = { nombreEmpresa: '', logoBase64: null }
  }

  const docBuilder = new PdfDocumentBuilder(userData, {
    orientation: 'landscape',
    format: 'a4',
  })
  const doc = docBuilder.doc
  const pageWidth = doc.internal.pageSize.getWidth()

  const fmtFecha = (v) => {
    if (!v) return ''
    const s = String(v).trim()
    const m = s.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/)
    if (m) return `${m[3]}/${m[2]}/${m[1]}`
    return s
  }

  const datosIzquierda = {
    titulo: 'DATOS DEL KARDEX',
    campos: [
      { label: 'Producto', valor: productoLabel || '-' },
      { label: 'Almacén', valor: almacenLabel || '-' },
      //{ label: 'Periodo', valor: `Del ${fmtFecha(fechaiR)} al ${fmtFecha(fechafR)}` },
     // ...(divisaTexto ? [{ label: '', valor: `Expresado en ${divisaTexto}` }] : []),
      { label: 'Método', valor: metodoValoracion || '-' },
    ],
  }
  const fecha={
    inicio : fechaiR,
    final: fechafR
  }
  const extras  = {
    expresadoDivisa: divisaTexto,
  }
  const drawHeader = () => {
    docBuilder.addEncabezado()
    docBuilder.addEncabezadoInfo('KARDEX FÍSICO VALORADO', fecha, datosIzquierda, null, false, extras)
  }

  drawHeader()

  const filas = [...safeSaldos, ...safeKardex]

  const obtenerNumeroDocumento = (mov) =>
    mov?.NroDcto ??
    mov?.['Nº Dcto.'] ??
    mov?.nroDcto ??
    mov?.numerodocumento ??
    mov?.nrodocumento ??
    mov?.documento ??
    mov?.idstock ??
    ''

  const body = filas.map((mov) => [
    mov?.Fecha ? fmtFecha(mov.Fecha) : '',
    mov?.Concepto || mov?.Detalle || '',
    String(obtenerNumeroDocumento(mov)),
    mov?.Entrada ?? '',
    mov?.Salida ?? '',
    mov?.Existencia ?? '',
    mov?.['C.Unit'] ?? '',
    mov?.Debe ?? '',
    mov?.Haber ?? '',
    mov?.Saldo ?? '',
  ])

  const head = [
    [
      { content: 'Fecha', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      { content: 'Descripción', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      { content: 'Nº Dcto.', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      {
        content: 'Control físico',
        colSpan: 3,
        styles: { halign: 'center', fontStyle: 'bold' },
      },
      {
        content: 'Costo Unitario',
        rowSpan: 2,
        styles: { valign: 'middle', halign: 'center' },
      },
      {
        content: 'Control Valorado',
        colSpan: 3,
        styles: { halign: 'center', fontStyle: 'bold' },
      },
    ],
    ['Entrada', 'Salida', 'Saldo', 'Ingreso', 'Egreso', 'Saldo'],
  ]

  const columnWidths = [22, 95, 22, 16, 16, 18, 22, 22, 22, 24]
  const tableWidth = columnWidths.reduce((a, b) => a + b, 0)
  const marginLeft = Math.max(10, (pageWidth - tableWidth) / 2)

  const marginTop = 62
  autoTable(doc, {
    head,
    body,
    startY: marginTop,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 1.4,
      overflow: 'linebreak',
      textColor: [0, 0, 0],
      lineColor: [80, 80, 80],
      lineWidth: 0.1,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [211, 211, 211],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      lineColor: [0, 0, 0],
      lineWidth: 0.15,
    },
    columnStyles: {
      0: { cellWidth: 22, halign: 'center' },
      1: { cellWidth: 95, halign: 'left' },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 16, halign: 'right' },
      4: { cellWidth: 16, halign: 'right' },
      5: { cellWidth: 18, halign: 'right' },
      6: { cellWidth: 22, halign: 'right' },
      7: { cellWidth: 22, halign: 'right' },
      8: { cellWidth: 22, halign: 'right' },
      9: { cellWidth: 24, halign: 'right' },
    },
    margin: { top: marginTop, bottom: 20, left: marginLeft, right: marginLeft },
    willDrawPage: () => {
      drawHeader()
    },
  })

  docBuilder.addFooterInfo()
  docBuilder.addPieDePagina()

  return doc
}

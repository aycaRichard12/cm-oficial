// src/modules/sincronizarAlmacenes/services/SincronizacionPdfService.js
import autoTable from 'jspdf-autotable'
import { PdfDocumentBuilder } from 'src/modules/pdf/builders/PdfDocumentBuilder'
import { ReportDataService } from 'src/modules/pdf/services/ReportDataService'

export class SincronizacionPdfService {
  constructor() {
    this.dataService = new ReportDataService()
  }

  async generate(options = {}) {
    const {
      resultado = {},
      almacenNombre = '-',
      orientation = 'landscape',
      format = 'a4',
      userData: udOpt = null,
    } = options

    const userData = udOpt || (await this.dataService.getUserData())
    const docBuilder = new PdfDocumentBuilder(userData, { orientation, format })
    const doc = docBuilder.doc
    const pageWidth = doc.internal.pageSize.getWidth()
    const marginTop = orientation === 'landscape' ? 52 : 62

    const datosIzquierda = {
      titulo: 'DATOS DEL REPORTE',
      campos: [
        { label: 'Almacén', valor: almacenNombre || `ID ${resultado.id_almacen ?? '-'}` },
        { label: 'Modo', valor: String(resultado.modo || '-') },
        { label: 'Método', valor: String(resultado.metodo || '-') },
      ],
    }

    const drawHeader = () => {
      docBuilder.addEncabezado()
      docBuilder.addEncabezadoInfo(
        'REPORTE DE SINCRONIZACIÓN DE KARDEX',
        null,
        datosIzquierda,
        null,
        true,
        null,
      )
    }

    const resumen = [
      ['Estado', String(resultado.estado ?? '-')],
      ['Empresa (ID)', String(resultado.idempresa ?? '-')],
      ['Almacén (ID)', String(resultado.id_almacen ?? '-')],
      ['Recrear', resultado.recrear ? 'Sí' : 'No'],
      ['Tolerar salidas sin stock', resultado.tolerar_salidas_sin_stock ? 'Sí' : 'No'],
      ['Total productos', String(resultado.total_productos ?? 0)],
      ['Sincronizados', String(resultado.sincronizados ?? 0)],
      ['Omitidos ya sincronizados', String(resultado.omitidos_ya_sincronizados ?? 0)],
      ['Sin movimientos', String(resultado.sin_movimientos ?? 0)],
      ['Total movimientos', String(resultado.total_movimientos ?? 0)],
      ['Total entradas', String(resultado.total_entradas ?? 0)],
      ['Total salidas', String(resultado.total_salidas ?? 0)],
      ['Productos con fallback de costo', String(resultado.productos_con_fallback_costo ?? 0)],
      ['Errores', String((resultado.errores || []).length)],
      ['Advertencias', String((resultado.advertencias || []).length)],
    ]

    const resumenWidth = 130
    const resumenLeft = Math.max(8, (pageWidth - resumenWidth) / 2)

    autoTable(doc, {
      startY: marginTop,
      head: [
        [
          {
            content: 'RESUMEN GENERAL',
            colSpan: 2,
            styles: { halign: 'center', fontStyle: 'bold' },
          },
        ],
      ],
      body: resumen,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 1.5,
        lineColor: [120, 120, 120],
        lineWidth: 0.15,
        textColor: [30, 30, 30],
      },
      headStyles: { fillColor: [224, 224, 224], textColor: [33, 33, 33] },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 70, halign: 'right' },
      },
      margin: { top: marginTop, bottom: 20, left: resumenLeft, right: resumenLeft },
      willDrawPage: drawHeader,
    })

    let y = doc.lastAutoTable.finalY + 6

    const advertencias = Array.isArray(resultado.advertencias) ? resultado.advertencias : []
    if (advertencias.length) {
      const headAdv = [['#', 'Tipo', 'Código', 'Delta', 'ID producto-almacén', 'Mensaje']]
      const bodyAdv = advertencias.map((a, i) => [
        String(i + 1),
        String(a.tipo || ''),
        String(a.codigo || ''),
        String(a.delta ?? ''),
        String(a.id_producto_almacen ?? ''),
        String(a.mensaje || ''),
      ])

      autoTable(doc, {
        startY: y,
        head: headAdv,
        body: bodyAdv,
        theme: 'grid',
        styles: {
          fontSize: 7.5,
          cellPadding: 1.2,
          overflow: 'linebreak',
          lineColor: [120, 120, 120],
          lineWidth: 0.15,
          textColor: [30, 30, 30],
        },
        headStyles: { fillColor: [255, 183, 77], textColor: [33, 33, 33], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 30 },
          2: { cellWidth: 20 },
          3: { cellWidth: 15, halign: 'right' },
          4: { cellWidth: 30, halign: 'right' },
          5: { cellWidth: 'auto' },
        },
        margin: { top: marginTop, bottom: 20, left: 8, right: 8 },
        willDrawPage: drawHeader,
      })
      y = doc.lastAutoTable.finalY + 6
    }

    const detalles = Array.isArray(resultado.detalles) ? resultado.detalles : []
    if (detalles.length) {
      const headDet = [
        [
          'ID producto-almacén',
          'Estado',
          'Movimientos',
          'Entradas',
          'Salidas',
          'Fallback costo',
          'Advertencias',
        ],
      ]
      const bodyDet = detalles.map((d) => [
        String(d.id_producto_almacen ?? ''),
        String(d.estado || ''),
        String(d.movimientos ?? 0),
        String(d.entradas ?? 0),
        String(d.salidas ?? 0),
        d.fallback_costo ? 'Sí' : 'No',
        String(d.advertencias ?? 0),
      ])

      autoTable(doc, {
        startY: y,
        head: headDet,
        body: bodyDet,
        theme: 'striped',
        styles: {
          fontSize: 7.5,
          cellPadding: 1.1,
          lineColor: [120, 120, 120],
          lineWidth: 0.1,
          textColor: [30, 30, 30],
        },
        headStyles: { fillColor: [179, 229, 252], textColor: [33, 33, 33], fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 40, halign: 'center' },
          1: { cellWidth: 30 },
          2: { cellWidth: 25, halign: 'right' },
          3: { cellWidth: 25, halign: 'right' },
          4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 30, halign: 'center' },
          6: { cellWidth: 25, halign: 'right' },
        },
        margin: { top: marginTop, bottom: 20, left: 8, right: 8 },
        willDrawPage: drawHeader,
      })
    }

    if (resultado.mensaje) {
      const yFinal = doc.lastAutoTable ? doc.lastAutoTable.finalY + 6 : marginTop
      doc.setFontSize(8).setFont(undefined, 'italic')
      doc.text(String(resultado.mensaje), 10, yFinal, { maxWidth: pageWidth - 20 })
    }

    docBuilder.addFooterInfo()
    docBuilder.addPieDePagina()
    return doc
  }
}

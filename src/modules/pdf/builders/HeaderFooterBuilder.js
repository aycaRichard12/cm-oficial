// src/modules/pdf/builders/HeaderFooterBuilder.js
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'

export class HeaderFooterBuilder {
  constructor(doc, userData) {
    this.doc = doc
    this.data = userData
  }

  drawEncabezado() {
    const { doc, data } = this
    const pageWidth = doc.internal.pageSize.getWidth()
    const startY = 5

    if (data.logoBase64) {
      const imgProps = doc.getImageProperties(data.logoBase64)
      const maxWidth = 36
      const maxHeight = 21
      const ratio = imgProps.width / imgProps.height
      let imgW = maxWidth
      let imgH = maxWidth / ratio
      if (imgH > maxHeight) {
        imgH = maxHeight
        imgW = maxHeight * ratio
      }
      const xPos = (pageWidth - imgW) / 2
      const format = data.logoBase64.includes('png') ? 'PNG' : 'JPEG'
      doc.addImage(data.logoBase64, format, xPos, startY, imgW, imgH)
    }

    // Izquierda
    doc.setFontSize(9).setFont(undefined, 'bold')
    doc.text(data.nombreEmpresa || '', 10, 10)
    doc.setFontSize(8).setFont(undefined, 'normal')
    doc.text(data.direccionEmpresa || '', 10, 13)
    doc.text(data.estado || '', 10, 16)
    doc.text(data.ciudad || '', 10, 19)
    doc.text(data.pais || '', 10, 22)

    // Derecha
    doc.setFontSize(9).setFont(undefined, 'bold')
    doc.text(`NIT: ${data.nit || ''}`, pageWidth - 10, 10, { align: 'right' })
    doc.setFontSize(8).setFont(undefined, 'normal')
    doc.text(`Telf.: ${data.telefono || ''}`, pageWidth - 10, 13, { align: 'right' })
    doc.text(`Cel.: ${data.celular || ''}`, pageWidth - 10, 16, { align: 'right' })
    doc.text(data.email || '', pageWidth - 10, 19, { align: 'right' })
    doc.text(data.web || '', pageWidth - 10, 22, { align: 'right' })

    doc.setDrawColor(0).setLineWidth(0.2)
    doc.line(10, 25, pageWidth - 10, 25)
  }

  /**
   * Dibuja el bloque de información variable del reporte:
   * título, número de factura, divisa, datos del cliente (izquierda)
   * y datos del vendedor/encargado (derecha).
   *
   * @param {string} titulo - Título del documento (ej. "COTIZACIÓN")
   * @param {Object|null} fechas - { inicio, final } para reportes por rango
   * @param {Object|null} datosIzquierda - { titulo, campos: [{label, valor}] }
   * @param {Object|null} datosDerecho - { titulo, campos: [{label, valor}] }
   * @param {boolean|null} conImpresionEncargado - Mostrar datos del encargado de sesión
   * @param {Object|null} extras - { numFactura, expresadoDivisa, centreado, ... }
   */
  drawEncabezadoInfo(titulo, fechas, datosIzquierda, datosDerecho, conImpresionEncargado, extras) {
    const { doc, data } = this
    const pageWidth = doc.internal.pageSize.getWidth()

    // ── Título centrado ──────────────────────────────────────────────────────
    doc.setFontSize(11).setFont(undefined, 'bold')
    doc.text(titulo || '', pageWidth / 2, 30, { align: 'center' })

    // ── Rango de fechas ──────────────────────────────────────────────────────
    if (fechas) {
      doc.setFontSize(8).setFont(undefined, 'normal')
      doc.text(
        `Entre ${cambiarFormatoFecha(fechas.inicio)} Y ${cambiarFormatoFecha(fechas.final)}`,
        pageWidth / 2,
        33,
        { align: 'center' },
      )
    }

    // ── Extras: número de factura, divisa, campos centrados ──────────────────
    if (extras) {
      if (extras.numFactura) {
        doc.setFontSize(8).setFont(undefined, 'normal')
        doc.text(`Nro. ${extras.numFactura}`, pageWidth / 2, 33, { align: 'center' })
      }
      if (extras.expresadoDivisa) {
        doc.setFontSize(8).setFont(undefined, 'normal')
        doc.text(`(Expresados en ${extras.expresadoDivisa})`, pageWidth / 2, 36, {
          align: 'center',
        })
      }
      if (extras.centreado) {
        doc.setFontSize(8).setFont(undefined, 'normal')
        let yC = 36
        extras.centreado.campos.forEach((campo) => {
          const texto =
            campo.label && campo.label.trim() !== ''
              ? `${campo.label}: ${campo.valor}`
              : String(campo.valor)
          doc.text(texto, pageWidth / 2, yC, { align: 'center' })
          yC += 3
        })
      }
    }

    // ── Bloque izquierdo (datos del cliente) ─────────────────────────────────
    if (datosIzquierda) {
      const maxWidthLeft = 80
      doc.setFontSize(9).setFont(undefined, 'bold')
      doc.text(`${datosIzquierda.titulo}:`, 10, 33)

      let yL = 36
      doc.setFontSize(8)

      datosIzquierda.campos.forEach((campo) => {
        const fullText =
          campo.label && campo.label.trim() !== ''
            ? `${campo.label}: ${campo.valor}`
            : String(campo.valor)

        const lines = doc.splitTextToSize(fullText, maxWidthLeft)

        if (campo.label && campo.label.trim() !== '') {
          doc.setFont(undefined, 'bold')
          doc.text(lines[0], 10, yL)
          doc.setFont(undefined, 'normal')
          for (let i = 1; i < lines.length; i++) {
            yL += 4
            doc.text(lines[i], 10, yL)
          }
        } else {
          doc.setFont(undefined, 'normal')
          lines.forEach((line, idx) => {
            if (idx > 0) yL += 4
            doc.text(line, 10, yL)
          })
        }
        yL += 4
      })
    }

    // ── Bloque derecho (datos del vendedor / encargado) ───────────────────────
    if (datosDerecho) {
      doc.setFontSize(9).setFont(undefined, 'bold')
      doc.text(datosDerecho.titulo, pageWidth - 10, 33, { align: 'right' })

      let yR = 36
      doc.setFontSize(8)

      datosDerecho.campos.forEach((campo) => {
        const xRight = pageWidth - 10

        if (campo.label && campo.label.trim() !== '') {
          const labelText = `${campo.label}: `
          const valueText = String(campo.valor)

          doc.setFont(undefined, 'bold')
          const labelWidth = doc.getTextWidth(labelText)
          doc.setFont(undefined, 'normal')
          const valueWidth = doc.getTextWidth(valueText)
          const xStart = xRight - labelWidth - valueWidth

          doc.setFont(undefined, 'bold')
          doc.text(labelText, xStart, yR)
          doc.setFont(undefined, 'normal')
          doc.text(valueText, xStart + labelWidth, yR)
        } else {
          doc.setFont(undefined, 'normal')
          doc.text(String(campo.valor), xRight, yR, { align: 'right' })
        }
        yR += 3
      })
    } else if (conImpresionEncargado && data) {
      doc.setFontSize(9).setFont(undefined, 'bold')
      doc.text('DATOS DEL ENCARGADO:', pageWidth - 10, 33, { align: 'right' })
      doc.setFontSize(8).setFont(undefined, 'normal')
      doc.text(data.encargadoNombre || '', pageWidth - 10, 36, { align: 'right' })
      doc.text(data.cargo || '', pageWidth - 10, 39, { align: 'right' })
    }
  }

  /**
   * Dibuja el pie de página en todas las páginas del documento
   * con el número de página actual y el total.
   */
  drawPieDePagina() {
    const { doc } = this
    const totalPages = doc.internal.getNumberOfPages()
    const pageWidth = doc.internal.pageSize.getWidth()

    doc.setFontSize(8).setFont(undefined, 'bold')
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.text(`Pagina N° ${i} de ${totalPages}`, pageWidth - 10, 53, { align: 'right' })
    }
  }
}

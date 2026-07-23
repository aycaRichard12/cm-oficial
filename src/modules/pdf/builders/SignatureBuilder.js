// src/modules/pdf/builders/SignatureBuilder.js

/**
 * Responsable de renderizar la imagen de firma en el documento PDF.
 */
export class SignatureBuilder {
  /**
   * @param {import('jspdf').jsPDF} doc - Instancia de jsPDF activa
   */
  constructor(doc) {
    this.doc = doc
  }

  /**
   * Dibuja la firma como imagen en el pie del documento.
   *
   * @param {string} firmaBase64 - Imagen de la firma en formato base64 (data URL o raw base64)
   * @param {number} y - Posición Y desde donde se coloca la firma
   */
  draw(firmaBase64, y) {
    if (!firmaBase64) return

    const { doc } = this
    const pageWidth = doc.internal.pageSize.getWidth()

    const imgW = 40
    const imgH = 20
    const x = (pageWidth - imgW) / 2

    const yFirma = y + 5

    try {
      const format = firmaBase64.toLowerCase().includes('png') ? 'PNG' : 'JPEG'
      doc.addImage(firmaBase64, format, x, yFirma, imgW, imgH)
    } catch (e) {
      console.warn('SignatureBuilder: no se pudo agregar la firma al PDF', e)
    }

    // Línea debajo de la firma
    const lineY = yFirma + imgH + 2
    doc.setDrawColor(0)
    doc.setLineWidth(0.3)
    doc.line(x - 5, lineY, x + imgW + 5, lineY)

    // Etiqueta "Firma"
    doc.setFontSize(7)
    doc.setFont(undefined, 'normal')
    doc.text('Firma', pageWidth / 2, lineY + 4, { align: 'center' })
  }
}

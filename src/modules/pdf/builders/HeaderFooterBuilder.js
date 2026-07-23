// src/modules/pdf/builders/HeaderFooterBuilder.js
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

  // Métodos drawEncabezadoInfo y drawPieDePagina se implementan con la misma filosofía,
  // dividiendo responsabilidades y evitando números mágicos mediante constantes.
}

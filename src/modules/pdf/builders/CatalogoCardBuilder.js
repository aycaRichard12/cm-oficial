// src/modules/pdf/builders/CatalogoCardBuilder.js

/**
 * Dibuja tarjetas de producto para el catálogo (imagen + datos + descripción).
 */
export class CatalogoCardBuilder {
  constructor(doc, options = {}) {
    this.doc = doc
    this.anchoTarjeta = options.anchoTarjeta ?? 85
    this.altoTarjeta = options.altoTarjeta ?? 55
    this.margenIzquierdo = options.margenIzquierdo ?? 15
    this.separacionHorizontal = options.separacionHorizontal ?? 10
    this.separacionVertical = options.separacionVertical ?? 8
    this.imagenAncho = options.imagenAncho ?? 35
    this.imagenAlto = options.imagenAlto ?? 30
  }

  cabeEnPagina(y, pageHeight, margenInferior = 15) {
    return y + this.altoTarjeta <= pageHeight - margenInferior
  }

  draw(item, x, y, divisaActiva = '') {
    const { doc, anchoTarjeta, altoTarjeta, imagenAncho, imagenAlto } = this

    doc.setDrawColor(200, 200, 200)
    doc.setFillColor(252, 252, 252)
    doc.roundedRect(x, y, anchoTarjeta, altoTarjeta, 3, 3, 'FD')

    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(30, 30, 30)
    const nombre = item.producto || 'Producto sin nombre'
    const titulo = nombre.length > 40 ? nombre.substring(0, 37) + '...' : nombre
    doc.text(titulo, x + 3, y + 6)

    doc.setDrawColor(220, 220, 220)
    doc.line(x, y + 8, x + anchoTarjeta, y + 8)

    if (item.imagenBase64) {
      try {
        doc.addImage(
          item.imagenBase64,
          'JPEG',
          x + 3,
          y + 12,
          imagenAncho,
          imagenAlto,
          undefined,
          'FAST',
        )
      } catch (e) {
        console.error('Error al agregar imagen al PDF:', e)
        doc.setFillColor(240, 240, 240)
        doc.rect(x + 3, y + 12, imagenAncho, imagenAlto, 'F')
        doc.setFontSize(7)
        doc.text('Error Img', x + 10, y + 27)
      }
    } else {
      doc.setFillColor(240, 240, 240)
      doc.rect(x + 3, y + 12, imagenAncho, imagenAlto, 'F')
      doc.setFontSize(7)
      doc.text('Sin Imagen', x + 10, y + 27)
    }

    const txtX = x + 40
    let txtY = y + 15
    doc.setFontSize(7)
    doc.setTextColor(60, 60, 60)
    doc.setFont(undefined, 'normal')
    doc.text('Cod: ' + (item.codigo || '-'), txtX, txtY)
    doc.text('Cat: ' + (item.categoria || '-'), txtX, txtY + 4)
    doc.text('Sub: ' + (item.subcategoria || '-'), txtX, txtY + 8)
    doc.text('Und: ' + (item.unidad || '-'), txtX, txtY + 12)
    doc.text('Estado: ' + (Number(item.estado) === 1 ? 'Activo' : 'Inactivo'), txtX, txtY + 16)

    doc.setFont(undefined, 'bold')
    doc.text('Stock: ' + (item.stock ?? 0), txtX, txtY + 22)
    doc.setTextColor(0, 100, 0)
    const precio = Number(item.precioSugerido || 0).toFixed(2)
    doc.text(`Precio Sugerido: ${divisaActiva} ${precio}`, txtX, txtY + 26)

    doc.setTextColor(110, 110, 110)
    doc.setFont(undefined, 'italic')
    doc.setFontSize(6)
    const desc =
      item.descripcion && item.descripcion !== 'null'
        ? String(item.descripcion)
        : 'Sin descripción particular'
    let lineas = doc.splitTextToSize(desc, anchoTarjeta - 6)
    if (lineas.length > 2) lineas = [lineas[0], lineas[1] + '...']
    doc.text(lineas, x + 3, y + 46)

    doc.setTextColor(0, 0, 0)
  }
}

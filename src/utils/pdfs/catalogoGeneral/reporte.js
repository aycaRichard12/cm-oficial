import { validarUsuario } from 'src/composables/FuncionesGenerales'
import jsPDF from 'jspdf'
import { getLogoBase64 } from '../dibujar'
import { imagen } from 'src/boot/url'

// Valida si la ruta de la imagen es potencialmente válida
const esRutaImagenValida = (ruta) => {
  if (!ruta || ruta === 'null' || ruta === 'undefined' || ruta.trim() === '') {
    return false
  }
  // Evita rutas que claramente no son imágenes (p.ej. ./imagen/null.png)
  if (ruta.includes('null') || ruta.includes('undefined')) {
    return false
  }
  return true
}

// Convierte una URL de imagen a base64 solo si la ruta es válida
function convertirImagenARutaBase64(url) {
  return new Promise((resolve, reject) => {
    if (!esRutaImagenValida(url)) {
      reject('Ruta de imagen no válida')
      return
    }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const dataURL = canvas.toDataURL('image/jpeg')
        resolve(dataURL)
      } catch (e) {
        console.log(e)
        reject('Error al convertir imagen a base64')
      }
    }
    img.onerror = () => reject('Error al cargar imagen')
    img.src = url
  })
}

// Prepara las imágenes en base64 a partir de un array
const prepararImagenesDesdeArray = async (productos) => {
  return await Promise.all(
    productos.map(async (item) => {
      // Si la ruta de imagen no es válida, no intentamos cargarla
      if (!esRutaImagenValida(item.imagen)) {
        return { ...item, imagenBase64: null }
      }
      try {
        const base64 = await convertirImagenARutaBase64(`${imagen}${item.imagen}`)
        return { ...item, imagenBase64: base64 }
      } catch (e) {
        console.warn(`No se pudo cargar imagen para ${item.codigo}: ${e}`)
        return { ...item, imagenBase64: null }
      }
    }),
  )
}

export const PDF_vistaCatalogoSimple = async (processedRows) => {
  try {
    const contenidousuario = validarUsuario()
    const doc = new jsPDF({ orientation: 'portrait' })

    const productos = await prepararImagenesDesdeArray(processedRows)

    const idempresa = contenidousuario[0]
    const empresa = idempresa.empresa

    const pageWidth = doc.internal.pageSize.getWidth()

    // LOGO centrado (con fallback silencioso)
    try {
      const logo = getLogoBase64()
      if (logo) {
        const imgWidth = 20
        const imgHeight = 20
        const xPos = (pageWidth - imgWidth) / 2
        doc.addImage(logo, 'PNG', xPos, 5, imgWidth, imgHeight, undefined, 'FAST')
      }
    } catch (e) {
      console.warn('No se pudo agregar el logo:', e)
    }

    // Datos de la empresa (izquierda)
    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(empresa.nombre || '', 10, 10)

    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    doc.text(empresa.direccion || '', 10, 13)
    doc.text(empresa.oestado || '', 10, 16)
    doc.text(empresa.ociudad || '', 10, 19)
    doc.text(empresa.opais || '', 10, 22)

    // Datos derecha
    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.text('NIT:' + (empresa.nit || ''), pageWidth - 10, 10, { align: 'right' })

    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    doc.text('Telf.: ' + (empresa.telefono || ''), pageWidth - 10, 13, { align: 'right' })
    doc.text('Cel.: ' + (empresa.ocelular || ''), pageWidth - 10, 16, { align: 'right' })
    doc.text(empresa.email || '', pageWidth - 10, 19, { align: 'right' })
    doc.text(empresa.ositioweb || '', pageWidth - 10, 22, { align: 'right' })

    // Línea separadora
    doc.setDrawColor(0)
    doc.setLineWidth(0.2)
    doc.line(10, 25, pageWidth - 10, 25)

    // Título
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.text('CATÁLOGO DE PRODUCTOS', pageWidth / 2, 30, { align: 'center' })

    // Datos del encargado
    doc.setFontSize(8)
    doc.setFont(undefined, 'bold')
    doc.text('DATOS DEL ENCARGADO:', pageWidth / 2 + 57, 39)
    doc.setFont(undefined, 'normal')
    doc.text(idempresa.nombre || '', pageWidth / 2 + 57, 42)
    doc.text(idempresa.cargo || '', pageWidth / 2 + 57, 45)

    // Parámetros de las tarjetas
    let startY = 55
    const anchoTarjeta = 85
    const altoTarjeta = 55
    let colIndex = 0

    productos.forEach((item) => {
      // Control de paginación
      if (startY + altoTarjeta > doc.internal.pageSize.getHeight() - 10) {
        doc.addPage()
        startY = 20
        colIndex = 0
      }

      const x = colIndex === 0 ? 15 : 110
      const y = startY

      // Contenedor de la tarjeta
      doc.setDrawColor(200, 200, 200)
      doc.setFillColor(252, 252, 252)
      doc.roundedRect(x, y, anchoTarjeta, altoTarjeta, 3, 3, 'FD')

      // Título del producto
      doc.setFontSize(9)
      doc.setFont(undefined, 'bold')
      doc.setTextColor(30, 30, 30)
      const productoNombre = item.nombre || 'Producto sin nombre'
      const tituloExt =
        productoNombre.length > 40 ? productoNombre.substring(0, 37) + '...' : productoNombre
      doc.text(tituloExt, x + 3, y + 6)
      doc.setDrawColor(220, 220, 220)
      doc.line(x, y + 8, x + anchoTarjeta, y + 8)

      // Detalles
      doc.setFontSize(7)
      doc.setTextColor(60, 60, 60)

      // Imagen o placeholder (con protección extra)
      try {
        if (item.imagenBase64) {
          doc.addImage(item.imagenBase64, 'JPEG', x + 3, y + 12, 35, 30, undefined, 'FAST')
        } else {
          throw new Error('Sin imagen')
        }
      } catch (e) {
        console.log(e)
        // Fallback visual: rectángulo gris y texto "Sin Imagen"
        doc.setFillColor(240, 240, 240)
        doc.rect(x + 3, y + 12, 35, 30, 'F')
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text('Sin Imagen', x + 6, y + 28)
        doc.setFontSize(7)
        doc.setTextColor(60, 60, 60)
      }

      // Información textual
      let txtX = x + 40
      let txtY = y + 15
      doc.setFont(undefined, 'normal')
      doc.text('Cod: ' + (item.codigo || '-'), txtX, txtY)
      doc.text('Cat: ' + (item.categoria || '-'), txtX, txtY + 4)
      doc.text('Sub: ' + (item.subcategoria || '-'), txtX, txtY + 8)
      doc.text('Und: ' + (item.unidad || '-'), txtX, txtY + 12)
      doc.text('Estado: ' + (Number(item.estado) === 1 ? 'Activo' : 'Inactivo'), txtX, txtY + 16)

      // Stock y costo
      doc.setFont(undefined, 'bold')
      doc.text('Stock: ' + (item.stock || 0), txtX, txtY + 22)
      doc.setTextColor(0, 100, 0)
      doc.text('Costo U.: ' + (item.costounitario || 0), txtX, txtY + 26)

      // Descripción
      doc.setTextColor(110, 110, 110)
      doc.setFont(undefined, 'italic')
      doc.setFontSize(6)
      let desc =
        item.descripcion && item.descripcion !== 'null'
          ? item.descripcion
          : 'Sin descripción particular'
      let textLines = doc.splitTextToSize(desc, anchoTarjeta - 6)
      if (textLines.length > 2) {
        textLines = [textLines[0], textLines[1] + '...']
      }
      doc.text(textLines, x + 3, y + 46)

      // Avanzar columna
      colIndex++
      if (colIndex > 1) {
        colIndex = 0
        startY += altoTarjeta + 8
      }
    })

    // Devolver el PDF como data URL
    return doc.output('dataurlstring')
  } catch (error) {
    console.error('Error crítico al generar el catálogo PDF:', error)
    // En caso de fallo total, se puede devolver un PDF vacío con un mensaje de error
    const errorDoc = new jsPDF()
    errorDoc.text('Error al generar el catálogo. Consulte la consola.', 10, 10)
    return errorDoc.output('dataurlstring')
  }
}

import { validarUsuario } from 'src/composables/FuncionesGenerales'
import jsPDF from 'jspdf'
import { getLogoBase64 } from '../dibujar'
import { imagen } from 'src/boot/url'

function convertirImagenARutaBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const dataURL = canvas.toDataURL('image/jpeg')
      resolve(dataURL)
    }
    img.onerror = () => reject('Error al cargar imagen')
    img.src = url
  })
}
const prepararImagenes = async (processedRows) => {
  const productosConImagenes = await Promise.all(
    processedRows.value.map(async (item) => {
      try {
        console.log(`${imagen}${item.imagen}`)
        const base64 = await convertirImagenARutaBase64(`${imagen}${item.imagen}`)
        console.log(base64)
        return { ...item, imagenBase64: base64 }
      } catch (e) {
        console.warn('No se pudo cargar imagen para', item.codigo + e)
        return { ...item, imagenBase64: null }
      }
    }),
  )
  console.log(productosConImagenes)
  return productosConImagenes
}
export const PDF_vistaCatalogo = async (processedRows, almacenes, divisaActiva, form) => {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })
  const productos = await prepararImagenes(processedRows) // ahora tienen `imagenBase64`

  const idempresa = contenidousuario[0]
  const empresa = idempresa.empresa

  const pageWidth = doc.internal.pageSize.getWidth()

  // LOGO de la Empresa (Centrado)
  const logo = getLogoBase64()
  if (logo) {
    const imgWidth = 20
    const imgHeight = 20
    const xPos = (pageWidth - imgWidth) / 2
    doc.addImage(logo, 'PNG', xPos, 5, imgWidth, imgHeight, undefined, 'FAST')
  }

  // Textos de Empresa (Lado Izquierdo)
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

  // Datos Derecho
  doc.setFontSize(9)
  doc.setFont(undefined, 'bold')
  doc.text('NIT:' + (empresa.nit || ''), pageWidth - 10, 10, { align: 'right' })

  doc.setFontSize(8)
  doc.setFont(undefined, 'normal')
  doc.text('Telf.: ' + (empresa.telefono || ''), pageWidth - 10, 13, { align: 'right' })
  doc.text('Cel.: ' + (empresa.ocelular || ''), pageWidth - 10, 16, { align: 'right' })
  doc.text(empresa.email || '', pageWidth - 10, 19, { align: 'right' })
  doc.text(empresa.ositioweb || '', pageWidth - 10, 22, { align: 'right' })

  // Línea Recta de la Cabecera
  doc.setDrawColor(0)
  doc.setLineWidth(0.2)
  doc.line(10, 25, pageWidth - 10, 25)

  // -------------------------
  // TÍTULO CENTRADO
  // -------------------------
  doc.setFontSize(11)
  doc.setFont(undefined, 'bold')
  doc.text('CATÁLOGO DE PRODUCTOS', pageWidth / 2, 30, { align: 'center' })

  // -------------------------
  // DATOS DEL REPORTE (Izquierda)
  // -------------------------
  doc.setFontSize(8)
  doc.setFont(undefined, 'bold')
  doc.text('DATOS DEL REPORTE:', 10, 39)

  doc.setFont(undefined, 'normal')
  let almacenName =
    almacenes.value.find((a) => a.value === form.value.almacen)?.label || 'Todos los Almacenes'
  doc.text(`Almacén: ${almacenName}`, 10, 42)

  // -------------------------
  // DATOS DEL ENCARGADO
  // -------------------------
  doc.setFont(undefined, 'bold')
  const xRight = pageWidth / 2 + 57

  doc.text('DATOS DEL ENCARGADO:', xRight, 39)
  doc.setFont(undefined, 'normal')
  doc.text(idempresa.nombre || '', xRight, 42)
  doc.text(idempresa.cargo || '', xRight, 45)
  // Parametros Grilla
  let startY = 55
  let anchoTarjeta = 85
  let altoTarjeta = 55
  let colIndex = 0

  productos.forEach((item) => {
    // Control de paginado
    if (startY + altoTarjeta > doc.internal.pageSize.getHeight() - 10) {
      doc.addPage()
      startY = 20
      colIndex = 0
    }

    let x = colIndex === 0 ? 15 : 110
    let y = startY

    // 1. Contenedor de Tarjeta (Borde Suave y Fondo)
    doc.setDrawColor(200, 200, 200)
    doc.setFillColor(252, 252, 252)
    doc.roundedRect(x, y, anchoTarjeta, altoTarjeta, 3, 3, 'FD')

    // 2. Título de Tarjeta
    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(30, 30, 30)
    let productoNombre = item.producto || 'Producto sin nombre'
    let tituloExt =
      productoNombre.length > 40 ? productoNombre.substring(0, 37) + '...' : productoNombre
    doc.text(tituloExt, x + 3, y + 6)
    doc.setDrawColor(220, 220, 220)
    doc.line(x, y + 8, x + anchoTarjeta, y + 8)

    // 3. Contenido Detalles
    doc.setFontSize(7)
    doc.setTextColor(60, 60, 60)

    // 4. Imagen o Placeholder
    if (item.imagenBase64) {
      try {
        doc.addImage(item.imagenBase64, 'JPEG', x + 3, y + 12, 35, 30, undefined, 'FAST')
      } catch (e) {
        doc.setFillColor(240, 240, 240)
        doc.rect(x + 3, y + 12, 35, 30, 'F')
        doc.text('Error Img', x + 10, y + 27)
        console.warn('Error al agregar imagen al PDF:', e)
      }
    } else {
      doc.setFillColor(240, 240, 240)
      doc.rect(x + 3, y + 12, 35, 30, 'F')
      doc.text('Sin Imagen', x + 10, y + 27)
    }

    // 5. Textos al lado de la imagen
    let txtX = x + 40
    let txtY = y + 15
    doc.setFont(undefined, 'normal')
    doc.text('Cod: ' + (item.codigo || '-'), txtX, txtY)
    doc.text('Cat: ' + (item.categoria || '-'), txtX, txtY + 4)
    doc.text('Sub: ' + (item.subcategoria || '-'), txtX, txtY + 8)
    doc.text('Und: ' + (item.unidad || '-'), txtX, txtY + 12)
    doc.text('Estado: ' + (Number(item.estado) === 1 ? 'Activo' : 'Inactivo'), txtX, txtY + 16)

    // Destacar Stock y Precio
    doc.setFont(undefined, 'bold')
    doc.text('Stock: ' + (item.stock || 0), txtX, txtY + 22)
    doc.setTextColor(0, 100, 0) // verde para coste
    doc.text(
      'Costo U.: ' + (divisaActiva || '') + ' ' + (item.costounitario || 0),
      txtX,
      txtY + 26,
    )

    // 6. Descripción abajo
    doc.setTextColor(110, 110, 110)
    doc.setFont(undefined, 'italic')
    doc.setFontSize(6)
    let desc =
      item.descripcion && item.descripcion !== 'null'
        ? item.descripcion
        : 'Sin descripción particular'
    let textLines = doc.splitTextToSize(desc, anchoTarjeta - 6)
    // Mostramos máximo 2 líneas para no desbordar la tarjeta
    if (textLines.length > 2) textLines = [textLines[0], textLines[1] + '...']
    doc.text(textLines, x + 3, y + 46)

    // 7. Actualizar indices
    colIndex++
    if (colIndex > 1) {
      // 2 columnas
      colIndex = 0
      startY += altoTarjeta + 8
    }
  })

  return doc.output('dataurlstring')
}

import jsPDF from 'jspdf'
import { verificarTamanoPantallaYRedirigir } from '../dibujar'
import { decimas, redondear } from 'src/composables/FuncionesG'

export function PDFreporteStockProductosIndividual_img(processedRows) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const arrRows = Array.isArray(processedRows) ? processedRows : processedRows.value || []

  // Configuración de la tabla
  let x = 10 // Margen izquierdo
  let y = 20 // Margen superior inicial
  const rowHeight = 25 // Altura de fila (más alta para que luzca la imagen)
  const colWidths = [12, 30, 30, 35, 30, 45, 20, 15, 20, 40] // Anchos de columna
  const headers = [
    'N°',
    'Código',
    'Prod.',
    'Cat.',
    'SubCat.',
    'Desc.',
    'Unidad',
    'Stk',
    'Costo',
    'Imagen',
  ]

  // --- Dibujar Encabezado ---
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')

  headers.forEach((header, i) => {
    const currentWidth = colWidths[i]
    doc.rect(x, y, currentWidth, 10) // Dibujar celda del header
    doc.text(header, x + currentWidth / 2, y + 7, { align: 'center' })
    x += currentWidth
  })

  // Reset de X y bajar Y para empezar las filas
  x = 10
  y += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  // --- Dibujar Filas de Datos ---
  arrRows.forEach((item, indice) => {
    // Control de salto de página manual
    if (y > 180) {
      doc.addPage()
      y = 20
    }

    let currentX = x
    const datosFila = [
      (indice + 1).toString(),
      item.codigo,
      item.producto,
      item.categoria,
      item.subcategoria,
      item.descripcion,
      item.unidad,
      item.stock.toString(),
      decimas(redondear(parseFloat(item.costounitario) * parseFloat(item.stock))),
    ]

    // Dibujar celdas de texto
    datosFila.forEach((texto, i) => {
      const w = colWidths[i]
      doc.rect(currentX, y, w, rowHeight)

      // Truncar texto si es muy largo para que no se salga de la celda
      const textLine = doc.splitTextToSize(texto || '', w - 2)
      doc.text(textLine, currentX + 2, y + rowHeight / 2, { baseline: 'middle' })
      currentX += w
    })

    // --- Dibujar Celda de Imagen ---
    const imgWidth = colWidths[9]
    doc.rect(currentX, y, imgWidth, rowHeight)

    if (item.imagenBase64) {
      try {
        // Ajustamos la imagen con un pequeño margen interno (padding) de 2mm
        doc.addImage(item.imagenBase64, 'JPEG', currentX + 2, y + 2, imgWidth - 4, rowHeight - 4)
      } catch (e) {
        console.error(e)
        doc.setFontSize(7)
        doc.text('Error Imagen', currentX + imgWidth / 2, y + rowHeight / 2, { align: 'center' })
      }
    } else {
      doc.setFontSize(7)
      doc.text('Sin Imagen', currentX + imgWidth / 2, y + rowHeight / 2, { align: 'center' })
    }

    y += rowHeight // Mover hacia abajo para la siguiente fila
  })

  const docResult = verificarTamanoPantallaYRedirigir(doc)
  if (!docResult) return
  return docResult
}

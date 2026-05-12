import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { decimas } from 'src/composables/FuncionesG'
import autoTable from 'jspdf-autotable'
import { Platform } from 'quasar'

import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { obtenerFechaActualDato } from 'src/composables/FuncionesG'
import { cargarLogoBase64 } from 'src/composables/FuncionesG'
// import { getComercialImagenProducto } from 'src/composables/FuncionesG'
// import { convertirAMayusculas } from 'src/composables/FuncionesG'
import { obtenerHora } from 'src/composables/FuncionesG'
export function verificarTamanoPantallaYRedirigir(doc) {
  if (Platform.is.mobile || window.innerWidth < 768) {
    const blobUrl = doc.output('bloburl')
    window.open(blobUrl, '_blank')
    return null
  }
  return doc
}
// Variables globales
let logoBase64 = null
let contenidousuario = null
let datosUsuario = null
let logoEmpresa = null
let nombreEmpresa = null
let direccionEmpresa = null
let encargadoNombre = null
let cargo = null
let estado = null
let ciudad = null
//let region = null
let pais = null
let nit = null
let telefono = null
let celular = null
let email = null
let web = null

let fontSize = 8
let cellPadding = 1
//let ColoEncabezadoTabla = [128, 128, 128] // Negro

async function initPdfReportGenerator() {
  contenidousuario = validarUsuario()
  datosUsuario = contenidousuario[0]
  logoEmpresa = datosUsuario.empresa.logo
  logoBase64 = await cargarLogoBase64(logoEmpresa)
  nombreEmpresa = datosUsuario.empresa.nombre
  direccionEmpresa = datosUsuario.empresa.direccion
  encargadoNombre = datosUsuario.nombre
  cargo = datosUsuario.cargo
  pais = datosUsuario.empresa.opais
  estado = datosUsuario.empresa.oestado
  //region = datosUsuario.region
  ciudad = datosUsuario.empresa.ociudad
  nit = datosUsuario.empresa.nit
  telefono = datosUsuario.empresa.telefono
  celular = datosUsuario.empresa.ocelular
  email = datosUsuario.empresa.email
  web = datosUsuario.empresa.ositioweb
}

export function getLogoBase64() {
  return logoBase64
}

initPdfReportGenerator()

/**
 * Crea una fila de total general con formato de colSpan para jsPDF-autoTable
 *
 * @param {string} label - Texto del label (ej: "TOTAL GENERAL")
 * @param {Array<{valor: number, halign?: string}>} columnasTotales - Array de objetos con los valores de totales
 * @param {number} colSpan - Número de columnas que ocupará el label (default: 6)
 * @returns {Array} Fila formateada para jsPDF-autoTable con colSpan
 *
 * @example
 * // Ejemplo básico con 2 columnas de totales
 * const filaTota = crearFilaTotalGeneral(
 *   `TOTAL GENERAL (${divisaActiva})`,
 *   [
 *     { valor: 123.50, halign: 'center' },
 *     { valor: 980.00, halign: 'center' }
 *   ],
 *   6
 * )
 * datos.push(filaTota)
 */
export function crearFilaTotalGeneral(label, columnasTotales, colSpan) {
  const fila = [
    {
      content: label,
      colSpan: colSpan || 6,
      styles: {
        halign: 'right',
        fontStyle: 'bold',
        // fillColor: [240, 230, 240],
        lineWidth: { top: 0.3, bottom: 0.3 },
        lineColor: [0, 0, 0],
      },
    },
  ]

  // Agregar las columnas de totales
  columnasTotales.forEach((columna) => {
    fila.push({
      content: decimas(columna.valor),
      styles: {
        halign: columna.halign || 'center',
        fontStyle: 'bold',
        // pintar bordes una sola vez
        lineWidth: { top: 0.3, bottom: 0.3 }, // left: 0.3  top: 0.3,
        lineColor: [0, 0, 0],
      },
    })
  })

  return fila
}

export function dibujarCuerpoTabla(
  doc,
  columns,
  datos,
  tituloReporte,
  columnStyles,
  headerColumnStyles,
  datosIzquierda = null,
  datosDerecho = null,
  conImpresionEncargado = null,
  fechas = null,
  extras = null,
  firma = null,
) {
  // Definición de estilos de columna específicos para este reporte (pueden generalizarse)
  let ultimaPaginaTabla = 0

  //CENTRADO DINÁMICO: Calcular el margen para que la tabla siempre esté al centro
  let sumWidths = 0
  let allHaveFixed = true
  columns.forEach((col) => {
    const key = col.dataKey
    const style = columnStyles[key]
    if (style && style.cellWidth && typeof style.cellWidth === 'number') {
      sumWidths += style.cellWidth
    } else {
      allHaveFixed = false
    }
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  let marginLeft = 10
  if (allHaveFixed && sumWidths < pageWidth && sumWidths > 0) {
    marginLeft = (pageWidth - sumWidths) / 2
  }

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: fontSize,
      cellPadding: cellPadding,
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: false,
      textColor: [0, 0, 0],
      fontSize: fontSize,
      halign: 'center',
    }, // ❌ ELIMINADO: startY: 55, // Se elimina para usar margin.top en su lugar

    // ✅ CORRECCIÓN: Definir el margen superior para reservar espacio para el encabezado
    margin: { top: 55, bottom: 20, left: marginLeft, right: marginLeft },
    tableWidth: allHaveFixed && sumWidths > 0 ? sumWidths : 'auto',
    theme: 'plain',

    didParseCell: function (data) {
      const key = data.column.dataKey
      if (data.section === 'head') {
        // aplicar estilos específicos de la columna
        if (headerColumnStyles[key]) {
          Object.assign(data.cell.styles, headerColumnStyles[key])
        }

        if (extras && extras.cabezeraVertical) {
          data.cell.text = ['']
        }
      }

      if (data.section === 'body') {
        // aplica los estilos personalizados del body por columna
        if (columnStyles[key]) {
          Object.assign(data.cell.styles, columnStyles[key])
        }

        // Soporte para texto en negrita mediante etiquetas <b>
        if (Array.isArray(data.cell.text)) {
          data.cell.text.forEach((text, i) => {
            if (typeof text === 'string' && text.includes('<b>')) {
              data.cell.text[i] = text.replace(/<b>/g, '').replace(/<\/b>/g, '')
              data.cell.styles.fontStyle = 'bold'
            }
          })
        }

        // Aplicar altura minima dinamicamente solo si existe la imagen en esta fila
        if (key === 'imagen' && data.row.raw && data.row.raw.rawImagenBase64) {
          data.cell.styles.minCellHeight = 25
        }
      }
    },

    didDrawCell: function (data) {
      // ... Lógica para dibujar la imagen y bordes de encabezado (sin cambios) ...

      if (data.column.dataKey === 'imagen' && data.cell.section === 'body') {
        if (data.row.raw && data.row.raw.rawImagenBase64) {
          try {
            // Ajustamos el tamaño de la imagen dentro de la celda, con margen de 2px
            doc.addImage(
              data.row.raw.rawImagenBase64,
              'JPEG',
              data.cell.x + 2,
              data.cell.y + 2,
              data.cell.width - 4,
              data.cell.height - 4,
              undefined,
              'FAST',
            )
          } catch (e) {
            console.warn('Error adjuntando imagen sobre layout de body', e)
          }
        }
      }

      if (data.section === 'head') {
        const cell = data.cell // Configura color y grosor de línea

        doc.setDrawColor(0, 0, 0) // Negro
        doc.setLineWidth(0.2) // Grosor
        // ---- LÍNEA SUPERIOR ----

        doc.line(cell.x, cell.y, cell.x + cell.width, cell.y) // ---- LÍNEA INFERIOR ----

        doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height)
      }
      ultimaPaginaTabla = data.table.pageNumber
    }, // ENCABEZADO Y PIE DE PÁGINA: Se dibuja en cada página.

    didDrawPage: () => {
      // Dibuja el encabezado fijo del documento (Logo, etc.)
      agregarEncabezado(doc) // Dibuja la información variable del reporte (Título, fechas, datos adicionales)
      agregarEncabezadoInfo(
        doc,
        tituloReporte,
        fechas,
        datosIzquierda,
        datosDerecho,
        conImpresionEncargado,
        extras,
      ) // Dibuja el pie de página en cada página
    },
  }) // Solo insertar contenido en la página donde la tabla termina

  doc.setPage(ultimaPaginaTabla) // Coordenada exacta debajo de la tabla

  const y = doc.lastAutoTable.finalY + 5

  doc.setFontSize(8)
  const fechaGeneracion = cambiarFormatoFecha(obtenerFechaActualDato())
  doc.text(`Fecha hora reporte: ${fechaGeneracion} ${obtenerHora()}`, 14, y, {
    align: 'left',
  })
  if (firma) {
    const imgW = 30
    const imgH = 15
    const pageWidth = doc.internal.pageSize.getWidth()
    // Colocarla a la derecha, arriba de "Firma del Cliente"
    const xPos = pageWidth - imgW - 10

    firma = firma.replace('data:image/jpeg', 'data:image/png')

    try {
      doc.addImage(firma, 'PNG', xPos, y, imgW, imgH)

      doc.setFontSize(7)
      // El texto debe estar centrado respecto a la IMAGEN, no a la página
      doc.text('Firma del Cliente', xPos + imgW / 2, y + imgH + 3, { align: 'center' })
    } catch (e) {
      console.error('Error al dibujar firma en el PDF', e)
    }
  }

  agregarPieDePagina(doc)
}

// 1. ENCABEZADO (HEADER) - REUTILIZABLE
function agregarEncabezado(doc) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const startY = 5

  //LOGO
  if (logoBase64) {
    const imgProps = doc.getImageProperties(logoBase64)

    const maxWidth = 36
    const maxHeight = 21

    const aspectRatio = imgProps.width / imgProps.height

    let imgWidth = maxWidth
    let imgHeight = maxWidth / aspectRatio

    if (imgHeight > maxHeight) {
      imgHeight = maxHeight
      imgWidth = maxHeight * aspectRatio
    }

    const xPos = (pageWidth - imgWidth) / 2
    const yPos = startY

    const format = logoBase64.includes('png') ? 'PNG' : 'JPEG'

    doc.addImage(logoBase64, format, xPos, yPos, imgWidth, imgHeight)
  }
  //Datos Izquierda
  doc.setFontSize(9)
  doc.setFont(undefined, 'bold')
  doc.text(nombreEmpresa, 10, 10)

  doc.setFontSize(8)
  doc.setFont(undefined, 'normal')
  doc.text(direccionEmpresa, 10, 13)
  doc.text(estado, 10, 16)
  doc.text(ciudad, 10, 19)
  doc.text(pais, 10, 22)
  //Datos Derecho
  doc.setFontSize(9)
  doc.setFont(undefined, 'bold')
  doc.text('NIT:' + nit, pageWidth - 10, 10, { align: 'right' })

  doc.setFontSize(8)
  doc.setFont(undefined, 'normal')
  doc.text('Telf.: ' + telefono, pageWidth - 10, 13, { align: 'right' })
  doc.text('Cel.: ' + celular, pageWidth - 10, 16, { align: 'right' })
  doc.text(email, pageWidth - 10, 19, { align: 'right' })
  doc.text(web, pageWidth - 10, 22, { align: 'right' })

  doc.setDrawColor(0)
  doc.setLineWidth(0.2)
  doc.line(10, 25, pageWidth - 10, 25)
}

function agregarEncabezadoInfo(
  doc,
  titulo,
  fechas,
  datosIzquierda,
  datosDerecho = null,
  conImpresionEncargado = null,
  extras = null,
) {
  const pageWidth = doc.internal.pageSize.getWidth()

  // -------------------------
  // TÍTULO CENTRADO
  // -------------------------
  doc.setFontSize(11)
  doc.setFont(undefined, 'bold')
  doc.text(titulo, pageWidth / 2, 30, { align: 'center' })
  console.log(datosIzquierda)

  if (fechas) {
    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    doc.text(
      'Entre ' + cambiarFormatoFecha(fechas.inicio) + ' Y ' + cambiarFormatoFecha(fechas.final),
      pageWidth / 2,
      33,
      {
        align: 'center',
      },
    )
  }

  if (extras) {
    if (extras.numFactura) {
      doc.setFontSize(8)
      doc.setFont(undefined, 'normal')
      doc.text('Nro. ' + extras.numFactura, pageWidth / 2, 33, {
        align: 'center',
      })
    }
    if (extras.expresadoDivisa) {
      doc.setFontSize(8)
      doc.setFont(undefined, 'normal')
      doc.text('(Expresados en ' + extras.expresadoDivisa + ')', pageWidth / 2, 36, {
        align: 'center',
      })
    }
    if (extras.centreado) {
      // Título
      doc.setFontSize(8)
      doc.setFont(undefined, 'normal')

      // Valores dinámicos
      let y = 36 // posición inicial

      extras.centreado.campos.forEach((campo) => {
        let texto = campo.valor
        if (campo.label && campo.label.trim() !== '') {
          texto = `${campo.label}: ${campo.valor}`
        }
        doc.text(texto, pageWidth / 2, y, {
          align: 'center',
        })
        y += 3 // separación entre líneas
      })
    }
  }

  // -------------------------
  // DATOS DEL REPORTE (Izquierda)
  // -------------------------
  if (datosIzquierda) {
    // Título
    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.text(datosIzquierda.titulo + ':', 10, 33)

    let y = 36

    doc.setFontSize(8)

    datosIzquierda.campos.forEach((campo) => {
      let x = 10

      if (campo.label && campo.label.trim() !== '') {
        // LABEL en negrilla
        doc.setFont(undefined, 'bold')
        doc.text(`${campo.label}:`, x, y)

        // calcular ancho del label para continuar el texto
        const anchoLabel = doc.getTextWidth(`${campo.label}: `)
        x += anchoLabel

        // VALOR normal
        doc.setFont(undefined, 'normal')
        doc.text(String(campo.valor), x, y)
      } else {
        // si no hay label, todo normal
        doc.setFont(undefined, 'normal')
        doc.text(String(campo.valor), x, y)
      }

      y += 3
    })
  }

  // -------------------------
  // DATOS DEL ENCARGADO (Derecha)
  // -------------------------
  if (datosDerecho) {
    // Título
    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.text(datosDerecho.titulo, pageWidth - 10, 33, { align: 'right' })

    let y = 36
    doc.setFontSize(8)

    datosDerecho.campos.forEach((campo) => {
      const xRight = pageWidth - 10

      if (campo.label && campo.label.trim() !== '') {
        const labelText = `${campo.label}: `
        const valueText = String(campo.valor)

        // medir anchos
        doc.setFont(undefined, 'bold')
        const labelWidth = doc.getTextWidth(labelText)

        doc.setFont(undefined, 'normal')
        const valueWidth = doc.getTextWidth(valueText)

        const totalWidth = labelWidth + valueWidth

        // posición inicial para que todo quede alineado a la derecha
        let xStart = xRight - totalWidth

        // LABEL en negrilla
        doc.setFont(undefined, 'bold')
        doc.text(labelText, xStart, y)

        // VALOR normal
        doc.setFont(undefined, 'normal')
        doc.text(valueText, xStart + labelWidth, y)
      } else {
        // sin label → todo normal alineado a la derecha
        doc.setFont(undefined, 'normal')
        doc.text(String(campo.valor), xRight, y, { align: 'right' })
      }

      y += 3
    })
  } else if (conImpresionEncargado) {
    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.text('DATOS DEL ENCARGADO:', pageWidth - 10, 33, { align: 'right' })

    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    doc.text(encargadoNombre, pageWidth - 10, 36, { align: 'right' })

    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    doc.text(cargo, pageWidth - 10, 39, { align: 'right' })
  }
}

function agregarPieDePagina(doc) {
  const finalPageCount = doc.internal.getNumberOfPages()
  doc.setFontSize(8)
  doc.setFont(undefined, 'bold')
  for (let i = 1; i <= finalPageCount; i++) {
    doc.setPage(i)
    const finalFullText = `Pagina N° ${i} de ${finalPageCount}`
    doc.text(finalFullText, doc.internal.pageSize.getWidth() - 10, 53, {
      align: 'right',
    })
  }
}

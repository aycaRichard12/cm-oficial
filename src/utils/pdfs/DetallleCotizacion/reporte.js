import { PdfGeneratorService } from 'src/modules/pdf/services/PdfGeneratorService'
import { verificarTamanoPantallaYRedirigir } from 'src/modules/pdf/utils/screenUtils'
import { cargarFirmaBase64, decimas, redondear, numeroALetras } from 'src/composables/FuncionesG'

/**
 * Genera el PDF de una cotización a partir de los datos recibidos.
 * @param {Array|Object} data - Datos de la cotización (puede venir como array de un elemento)
 * @returns {jsPDF|undefined} Documento PDF o undefined si se redirige en móvil
 */
export async function generarPdfCotizacion(data) {
  // Normalizar: la API entrega un array con la cotización en la primera posición
  const cotizacion = Array.isArray(data) ? data[0] : data

  // 1. Preparar datos estructurados
  const reportData = await prepararDatosCotizacion(cotizacion)

  // 2. Generar PDF mediante el servicio
  const pdfService = new PdfGeneratorService()
  const doc = await pdfService.generateReport({
    columns: reportData.columns,
    datos: reportData.datos,
    titulo: 'COTIZACIÓN',
    columnStyles: reportData.columnStyles,
    headerColumnStyles: reportData.headerColumnStyles,
    datosIzquierda: reportData.datosIzquierda,
    datosDerecho: reportData.datosDerecho,
    conImpresionEncargado: false, // se usa datosDerecho personalizado
    extras: reportData.extras,
    firma: reportData.base64Firma,
    añadirDescricionAdcional: { columna: 'descripcion', campo: 'descripcionAdicional' },
  })

  // 3. Aplicar marca de agua si la cotización está anulada (condición == 2)
  const condicion = cotizacion.cotizacion.condicion
  if (condicion == 2) {
    aplicarMarcaAnulado(doc)
  }

  // 4. Verificar tamaño de pantalla y redirigir si es necesario
  const docResult = verificarTamanoPantallaYRedirigir(doc)
  if (!docResult) return
  return docResult
}

/**
 * Prepara todos los datos necesarios para el reporte PDF de cotización.
 * @param {Object} cot - Objeto con la cotización completa (empresa, cliente, detalle, etc.)
 * @returns {Object} Datos estructurados para PdfGeneratorService
 */
async function prepararDatosCotizacion(cot) {
  const { usuario, cliente, cotizacion, cotiz, divisa, almacen } = cot

  // --- Procesar detalle de productos ---
  const detalle = cotizacion.detalle.map((item) => ({
    ...item,
    total: redondear(item.cantidad * item.precio),
  }))

  // Calcular montos
  const subtotal = detalle.reduce(
    (sum, item) => sum + redondear(parseFloat(item.cantidad) * parseFloat(item.precio)),
    0,
  )
  const descuento = parseFloat(cotiz.descuento) || 0
  const montoTotal = redondear(subtotal - descuento)

  // --- Columnas de la tabla ---
  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
    { header: 'Precio', dataKey: 'precio' },
    { header: 'Total', dataKey: 'total' },
  ]

  // --- Filas de datos ---
  const datos = detalle.map((item, indice) => ({
    indice: indice + 1,
    descripcion: item.descripcion,
    cantidad: decimas(item.cantidad),
    precio: decimas(item.precio),
    total: decimas(item.total),
    descripcionAdicional: item.descripcionAdicional,
  }))

  // Filas de totales (mantienen la misma estructura que el código original)
  const montoTexto = numeroALetras(montoTotal, divisa.divisa)
  datos.push({ precio: 'SUBTOTAL', total: decimas(subtotal) })
  datos.push({ precio: 'DESCUENTO', total: decimas(descuento) })
  datos.push({
    precio: 'MONTO TOTAL',
    total: decimas(montoTotal),
    descripcion: montoTexto, // aparece en la columna "Descripción"
  })

  // --- Estilos de columnas ---
  const columnStyles = {
    indice: { cellWidth: 15, halign: 'center' },
    descripcion: { cellWidth: 50, halign: 'left' },
    cantidad: { cellWidth: 40, halign: 'right' },
    precio: { cellWidth: 40, halign: 'right' },
    total: { cellWidth: 50, halign: 'right' },
  }
  const headerColumnStyles = { ...columnStyles } // mismos anchos, alineación central por defecto

  // --- Datos del cliente (bloque izquierdo) ---
  const datosIzquierda = {
    titulo: 'DATOS DEL CLIENTE',
    campos: [
      { label: '', valor: `${cliente.nombre} - ${cliente.nombrecomercial} - ${cliente.sucursal}` },
      { label: '', valor: cliente.direccion || '' },
      { label: '', valor: cliente.email || '' },
      { label: 'Fecha de Venta', valor: cotiz.fecha || '' },
    ],
  }

  // --- Datos del vendedor (bloque derecho) ---
  const datosDerecho = {
    titulo: 'DATOS DEL VENDEDOR',
    campos: [
      { label: '', valor: almacen.almacen },
      { label: '', valor: usuario.usuario || '' },
      { label: '', valor: usuario.cargo || '' },
    ],
  }

  // --- Información extra para el encabezado ---
  const extras = {
    expresadoDivisa: divisa.divisa,
    numFactura: cotiz.nfactura || '',
  }

  // --- Cargar firma en base64 si existe ---
  let base64Firma = ''
  if (cotiz.firma_url) {
    const nombreArchivo = cotiz.firma_url.split('/').pop()
    base64Firma = await cargarFirmaBase64(nombreArchivo)
  }

  return {
    columns,
    datos,
    columnStyles,
    headerColumnStyles,
    datosIzquierda,
    datosDerecho,
    extras,
    base64Firma,
  }
}

/**
 * Aplica una marca de agua diagonal "ANULADO" sobre el documento.
 * @param {jsPDF} doc - Documento PDF
 */
function aplicarMarcaAnulado(doc) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const centerX = pageWidth / 2
  const centerY = pageHeight / 2

  doc.setFontSize(70)
  doc.setTextColor(255, 0, 0)
  doc.setGState(new doc.GState({ opacity: 0.15 }))
  doc.setFont(undefined, 'bold')
  doc.text('ANULADO', centerX, centerY, { angle: 45, align: 'center' })

  // Restaurar opacidad y tamaño de fuente
  doc.setGState(new doc.GState({ opacity: 1 }))
  doc.setFontSize(6)
  doc.setTextColor(0)
}

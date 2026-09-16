import { PdfGeneratorService } from 'src/modules/pdf/services/PdfGeneratorService'
import { verificarTamanoPantallaYRedirigir } from 'src/modules/pdf/utils/screenUtils'
import {
  cargarLogoBase64,
  cargarFirmaBase64,
  decimas,
  redondear,
  numeroALetras,
} from 'src/composables/FuncionesG'
import QRCode from 'qrcode'

/**
 * Genera el PDF de una cotización a partir de los datos recibidos.
 * @param {Array|Object} data - Datos de la cotización (puede venir como array de un elemento)
 * @returns {jsPDF|undefined} Documento PDF o undefined si se redirige en móvil
 */
export async function generarPdfCotizacion(data) {
  // Normalizar: la API entrega un array con la cotización en la primera posición
  const cotizacion = Array.isArray(data) ? data[0] : data
  console.log(cotizacion)

  // 1. Preparar datos estructurados
  const reportData = await prepararDatosCotizacion(cotizacion)

  // 2. Generar PDF mediante el servicio
  const pdfService = new PdfGeneratorService()
  const doc = await pdfService.generateReport({
    userData: reportData.userData,
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

  // 3. Pegar el QR en el PDF (ubicación inferior izquierda)
  if (reportData.base64Qr) {
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 200
    const x = 14
    const y = finalY + 10
    const ancho = 25
    const alto = 25
    doc.addImage(reportData.base64Qr, 'PNG', x, y, ancho, alto)
  }

  // 4. Aplicar marca de agua si la cotización está anulada (condición == 2)
  const condicion = cotizacion.cotizacion.condicion
  if (condicion == 2) {
    aplicarMarcaAnulado(doc)
  }

  // 5. Verificar tamaño de pantalla y redirigir si es necesario
  const mobileBlobUrl = verificarTamanoPantallaYRedirigir(doc)
  //if (!docResult) return
  return { doc, mobileBlobUrl }
}

/**
 * Prepara todos los datos necesarios para el reporte PDF de cotización.
 * @param {Object} cot - Objeto con la cotización completa (empresa, cliente, detalle, etc.)
 * @returns {Object} Datos estructurados para PdfGeneratorService
 */
async function prepararDatosCotizacion(cot) {
  const { usuario, cliente, cotizacion, divisa, almacen, detalle, empresa } = cot

  // --- Cargar logo y preparar datos de la empresa para encabezado (sin depender de sesión) ---
  let logoBase64 = ''
  if (empresa?.logo) {
    logoBase64 = await cargarLogoBase64(empresa.logo)
  }

  const userData = {
    logoBase64,
    nombreEmpresa: empresa?.nombre || '',
    direccionEmpresa: empresa?.direccion || '',
    encargadoNombre: usuario?.usuario || usuario?.nombre || '',
    cargo: usuario?.cargo || '',
    pais: empresa?.opais || '',
    estado: empresa?.oestado || '',
    ciudad: empresa?.ociudad || '',
    nit: empresa?.nit || '',
    telefono: empresa?.telefono || '',
    celular: empresa?.ocelular || '',
    email: empresa?.email || '',
    web: empresa?.ositioweb || '',
  }

  // --- Generar código QR con la URL del .env, ID y MD5 ---
  let base64Qr = ''
  try {
    const baseUrl = import.meta.env.VITE_QR || ''
    const idCotizacion = cotizacion.id
    const md5Empresa = empresa?.md5 || ''

    const urlQr = `${baseUrl}${idCotizacion}/${md5Empresa}`

    base64Qr = await QRCode.toDataURL(urlQr, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 200,
    })
  } catch (error) {
    console.error('Error al generar el código QR:', error)
  }

  // --- Procesar detalle de productos ---
  const d = detalle.map((item) => ({
    ...item,
    total: redondear(item.cantidad * item.precio),
  }))

  // Calcular montos
  const subtotal = d.reduce(
    (sum, item) => sum + redondear(parseFloat(item.cantidad) * parseFloat(item.precio)),
    0,
  )
  const descuento = parseFloat(cotizacion.descuento) || 0
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
  const datos = d.map((item, indice) => ({
    indice: indice + 1,
    descripcion: item.descripcion,
    cantidad: decimas(item.cantidad),
    precio: decimas(item.precio),
    total: decimas(item.total),
    descripcionAdicional: item.descripcionAdicional,
  }))

  // Filas de totales
  const montoTexto = numeroALetras(montoTotal, divisa.divisa)

  datos.push({ precio: '<b>SUBTOTAL</b>', total: '<b>' + decimas(subtotal) + '</b>' })
  datos.push({ precio: '<b>DESCUENTO</b>', total: '<b>' + decimas(descuento) + '</b>' })
  datos.push({
    precio: '<b>MONTO TOTAL</b>',
    total: '<b>' + decimas(montoTotal) + '</b>',
    descripcion: '<b>' + montoTexto + '</b>',
  })

  // --- Estilos de columnas ---
  const columnStyles = {
    indice: { cellWidth: 15, halign: 'center' },
    descripcion: { cellWidth: 50, halign: 'left' },
    cantidad: { cellWidth: 40, halign: 'right' },
    precio: { cellWidth: 40, halign: 'right' },
    total: { cellWidth: 50, halign: 'right' },
  }
  const headerColumnStyles = { ...columnStyles }

  // --- Datos del cliente (bloque izquierdo) ---
  const datosIzquierda = {
    titulo: 'DATOS DEL CLIENTE',
    campos: [
      { label: '', valor: `${cliente.nombre} - ${cliente.nombrecomercial} - ${cliente.sucursal}` },
      { label: '', valor: cliente.direccion || '' },
      { label: '', valor: cliente.email || '' },
      { label: 'Fecha de Venta', valor: cotizacion.fecha || '' },
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
    numFactura: cotizacion.nfactura || '',
  }

  // --- Cargar firma en base64 si existe ---
  let base64Firma = ''
  if (cotizacion.firma_url) {
    const nombreArchivo = cotizacion.firma_url.split('/').pop()
    base64Firma = await cargarFirmaBase64(nombreArchivo)
  }

  return {
    userData,
    columns,
    datos,
    columnStyles,
    headerColumnStyles,
    datosIzquierda,
    datosDerecho,
    extras,
    base64Firma,
    base64Qr,
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

import { PdfGeneratorService } from 'src/modules/pdf/services/PdfGeneratorService'
import { verificarTamanoPantallaYRedirigir } from 'src/modules/pdf/utils/screenUtils'
import { decimas } from 'src/composables/FuncionesG'
import { crearFilaTotalGeneral } from 'src/modules/pdf/utils/rowUtils'
import { ReportDataService } from 'src/modules/pdf/services/ReportDataService'
/**
 * Genera el PDF del reporte de cotizaciones usando el servicio optimizado.
 * @param {Array|Ref} cotizaciones - Lista de cotizaciones (puede ser un ref())
 * @param {Object} almacen - Datos del almacén
 * @param {string} divisa - Símbolo o nombre de la divisa
 * @param {Object} [empresa] - (Opcional) Datos de la empresa para el encabezado
 * @returns {jsPDF|undefined}
 */
export async function PDFReporteCompras(Compras, divisa, fechaInicio, fechaFinal) {
  const lista = Array.isArray(Compras) ? Compras : Compras && Compras.value ? Compras.value : []

  // Ordenar por fecha...
  const ordenados = lista
    .map((item) => ({ ...item, _fechaOrden: item.fecha }))
    .sort((a, b) => a._fechaOrden - b._fechaOrden)

  const datos = ordenados.map((item, index) => ({
    nro: index + 1,
    fecha: item.fecha,
    cliente: item.cliente,
    sucursal: item.sucursal,
    monto: decimas(parseFloat(item.monto)),
    descuento: decimas(parseFloat(item.descuento)),
    total_sumatorias: decimas(parseFloat(item.total_sumatorias)),
  }))

  const cotizaciontotal = datos.reduce((sum, u) => sum + parseFloat(u.total_sumatorias || 0), 0)
  const descuentoTotal = datos.reduce((sum, u) => sum + parseFloat(u.descuento || 0), 0)
  const total = datos.reduce((sum, u) => sum + parseFloat(u.monto || 0), 0)

  // Agregar fila de totales al array de datos antes de construir la tabla PDF
  datos.push(
    crearFilaTotalGeneral(
      `TOTAL GENERAL (${divisa})`,
      [
        { valor: cotizaciontotal, halign: 'right' },
        { valor: descuentoTotal, halign: 'right' },
        { valor: total, halign: 'right' },
      ],
      4,
    ),
  )

  const columns = [
    { header: 'N', dataKey: 'num' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Codigo', dataKey: 'codigo' },
    { header: 'Nombre Lote', dataKey: 'nombrelote' },
    { header: `Proveedor`, dataKey: 'proveedor' },
    { header: `Importe Compra (${divisa})`, dataKey: 'total' },
    { header: `Autorización`, dataKey: 'autorizacionTexto' },
    { header: `Factura`, dataKey: 'nfactura' },
    { header: `Almacén`, dataKey: 'almacen' },
  ]
  const columnStyles = {
    num: { cellWidth: 10, halign: 'center' },
    fecha: { cellWidth: 25, halign: 'center' },
    codigo: { cellWidth: 50, halign: 'left' },
    nombrelote: { cellWidth: 35, halign: 'left' },
    proveedor: { cellWidth: 25, halign: 'right' },
    total: { cellWidth: 25, halign: 'right' },
    autorizacionTexto: { cellWidth: 25, halign: 'right' },
    nfactura: { cellWidth: 25, halign: 'right' },
    almacen: { cellWidth: 25, halign: 'right' },
  }
  const headerColumnStyles = { ...columnStyles }

  // ─── OBTENER DATOS DE EMPRESA ─────────────────────
  let userData
  try {
    // Si no, cargamos desde la sesión con ReportDataService
    const reportService = new ReportDataService()
    userData = await reportService.getUserData()
  } catch (error) {
    console.warn('No se pudieron obtener datos de empresa. Se usará info mínima.', error)
    // Fallback mínimo con el nombre del almacén
    userData = {
      logoBase64: '',
      nombreEmpresa: 'Sin empresa',
      direccionEmpresa: '',
      encargadoNombre: '',
      cargo: '',
      pais: '',
      estado: '',
      ciudad: '',
      nit: '',
      telefono: '',
      celular: '',
      email: '',
      web: '',
    }
  }

  // ─── GENERAR PDF ──────────────────────────────────
  const pdfService = new PdfGeneratorService()
  const doc = await pdfService.generateReport({
    userData,
    columns,
    datos,
    titulo: 'REPORTE COTIZACIONES',
    columnStyles,
    headerColumnStyles,
    datosIzquierda: null,
    datosDerecho: null,
    conImpresionEncargado: true,
    fechas: { inicio: fechaInicio, final: fechaFinal },
    extras: undefined,
    firma: '',
    añadirDescricionAdcional: undefined,
  })

  const mobileBlobUrl = verificarTamanoPantallaYRedirigir(doc)
  return { doc, mobileBlobUrl }
}

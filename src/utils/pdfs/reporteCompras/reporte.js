import { PdfGeneratorService } from 'src/modules/pdf/services/PdfGeneratorService'
import { verificarTamanoPantallaYRedirigir } from 'src/modules/pdf/utils/screenUtils'
import { crearFilaTotalGeneral } from 'src/modules/pdf/utils/rowUtils'
import { ReportDataService } from 'src/modules/pdf/services/ReportDataService'
/**

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
    codigo: item.codigo,
    nombrelote: item.nombrelote,
    proveedor: item.proveedor,
    total: Number(item.total).toFixed(2),
    autorizacionTexto: item.autorizacionTexto,
    nfactura: item.nfactura,
    almacen: item.almacen,
  }))

  const total = ordenados.reduce((sum, u) => sum + parseFloat(u.total || 0), 0)

  // Agregar fila de totales al array de datos antes de construir la tabla PDF
  datos.push(
    crearFilaTotalGeneral(`TOTAL GENERAL (${divisa})`, [{ valor: total, halign: 'right' }], 5),
  )

  const columns = [
    { header: 'N', dataKey: 'nro' },
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
    nro: { cellWidth: 10, halign: 'center' },
    fecha: { cellWidth: 20, halign: 'center' },
    codigo: { cellWidth: 30, halign: 'left' },
    nombrelote: { cellWidth: 30, halign: 'left' },
    proveedor: { cellWidth: 30, halign: 'right' },
    total: { cellWidth: 15, halign: 'right' },
    autorizacionTexto: { cellWidth: 25, halign: 'right' },
    nfactura: { cellWidth: 10, halign: 'right' },
    almacen: { cellWidth: 20, halign: 'right' },
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
    titulo: 'REPORTE COMPRAS',
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

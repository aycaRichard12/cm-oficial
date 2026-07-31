import { PdfGeneratorService } from 'src/modules/pdf/services/PdfGeneratorService'
import { verificarTamanoPantallaYRedirigir } from 'src/modules/pdf/utils/screenUtils'
import { decimas } from 'src/composables/FuncionesG'
import { crearFilaTotalGeneral } from 'src/modules/pdf/utils/rowUtils'
import { cargarLogoBase64 } from 'src/composables/FuncionesG'
import { ReportDataService } from 'src/modules/pdf/services/ReportDataService'
/**
 * Genera el PDF del reporte de cotizaciones usando el servicio optimizado.
 * @param {Array|Ref} cotizaciones - Lista de cotizaciones (puede ser un ref())
 * @param {Object} almacen - Datos del almacén
 * @param {string} divisa - Símbolo o nombre de la divisa
 * @param {Object} [empresa] - (Opcional) Datos de la empresa para el encabezado
 * @returns {jsPDF|undefined}
 */
export async function DPFReporteCotizacion(
  cotizaciones,
  almacen,
  divisa,
  fechaInicio,
  fechaFinal,
  empresa = null,
) {
  const lista = Array.isArray(cotizaciones) ? cotizaciones : cotizaciones.value

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

  const cotizaciontotal = datos.reduce((sum, u) => sum + parseFloat(u.total_sumatorias), 0)
  const descuentoTotal = datos.reduce((sum, u) => sum + parseFloat(u.descuento), 0)
  const total = datos.reduce((sum, u) => sum + parseFloat(u.monto), 0)

  const columns = [
    /* igual que antes */
  ]
  const columnStyles = {
    /* igual */
  }
  const headerColumnStyles = { ...columnStyles }

  const datosIzquierda = {
    titulo: 'DATOS REPORTE',
    campos: [{ label: 'Almacén', valor: almacen.almacen || 'Todos los Almacenes' }],
  }

  // ─── OBTENER DATOS DE EMPRESA ─────────────────────
  let userData
  try {
    if (empresa) {
      // Si se pasó una empresa, usamos sus datos (logo se carga con cargarLogoBase64)
      const logoBase64 = empresa.logo ? await cargarLogoBase64(empresa.logo) : ''
      userData = {
        logoBase64,
        nombreEmpresa: empresa.nombre || '',
        direccionEmpresa: empresa.direccion || '',
        encargadoNombre: empresa.encargado || '',
        cargo: '',
        pais: empresa.opais || '',
        estado: empresa.oestado || '',
        ciudad: empresa.ociudad || '',
        nit: empresa.nit || '',
        telefono: empresa.telefono || '',
        celular: empresa.ocelular || '',
        email: empresa.email || '',
        web: empresa.ositioweb || '',
      }
    } else {
      // Si no, cargamos desde la sesión con ReportDataService
      const reportService = new ReportDataService()
      userData = await reportService.getUserData()
    }
  } catch (error) {
    console.warn('No se pudieron obtener datos de empresa. Se usará info mínima.', error)
    // Fallback mínimo con el nombre del almacén
    userData = {
      logoBase64: '',
      nombreEmpresa: almacen.almacen || 'Sin empresa',
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
    datosIzquierda,
    datosDerecho: null,
    conImpresionEncargado: false,
    fechas: { inicio: fechaInicio, final: fechaFinal },
    extras: undefined,
    firma: '',
    añadirDescricionAdcional: undefined,
  })

  // Agregar fila de totales...
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 150
  crearFilaTotalGeneral(
    doc,
    columns,
    finalY + 2,
    `TOTAL GENERAL (${divisa})`,
    [
      { valor: cotizaciontotal, halign: 'right' },
      { valor: descuentoTotal, halign: 'right' },
      { valor: total, halign: 'right' },
    ],
    4,
  )

  const mobileBlobUrl = verificarTamanoPantallaYRedirigir(doc)
  return { doc, mobileBlobUrl }
}

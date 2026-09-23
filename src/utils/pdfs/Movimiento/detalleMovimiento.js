import { PdfGeneratorService } from 'src/modules/pdf/services/PdfGeneratorService'
import { verificarTamanoPantallaYRedirigir } from 'src/modules/pdf/utils/screenUtils'
import { decimas, cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { getDatosUsuario } from '../datos'

/**
 * Genera el PDF de un comprobante de movimiento.
 * @param {Object} detalleMovimiento - Datos del movimiento (plano o con .datos anidado)
 * @returns {Object} { doc, mobileBlobUrl }
 */
export async function PDFComprobanteMovimiento(detalleMovimiento) {
  console.log('PDFComprobanteMovimiento received:', detalleMovimiento)

  // 1. Preparar datos estructurados
  const reportData = await prepararDatosMovimiento(detalleMovimiento)

  // 2. Generar PDF mediante el servicio
  const pdfService = new PdfGeneratorService()
  const doc = await pdfService.generateReport({
    userData: reportData.userData,
    columns: reportData.columns,
    datos: reportData.datos,
    titulo: 'COMPROBANTE DE MOVIMIENTO',
    columnStyles: reportData.columnStyles,
    headerColumnStyles: reportData.headerColumnStyles,
    datosIzquierda: reportData.datosIzquierda,
    datosDerecho: reportData.datosDerecho,
    conImpresionEncargado: false, // se usa datosDerecho personalizado
    extras: reportData.extras,
  })

  // 3. Verificar tamaño de pantalla y redirigir si es necesario
  const mobileBlobUrl = verificarTamanoPantallaYRedirigir(doc)
  return { doc, mobileBlobUrl }
}

/**
 * Prepara todos los datos necesarios para el reporte PDF de movimiento.
 * @param {Object} detalleMovimiento - Datos del movimiento
 * @returns {Object} Datos estructurados para PdfGeneratorService
 */
async function prepararDatosMovimiento(detalleMovimiento) {
  // Handle structure variations (flat vs .datos wrapper)
  const isNested = !!detalleMovimiento?.datos
  const dataRoot = isNested ? detalleMovimiento.datos : detalleMovimiento

  const detalleArray = dataRoot.detalle || []
  console.log('Detalle array:', detalleArray)

  // --- Columnas de la tabla ---
  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'codigo', dataKey: 'codigo' },
    { header: 'Descripción', dataKey: 'descripcion' },

    { header: 'Cantidad', dataKey: 'cantidad' },
  ]

  // --- Filas de datos ---
  const datos = detalleArray.map((item, indice) => ({
    indice: indice + 1,
    codigo: item.codigo,

    descripcion: item.descripcion,
    cantidad: decimas(item.cantidad),
  }))

  // --- Estilos de columnas ---
  const columnStyles = {
    indice: { cellWidth: 15, halign: 'center' },
    codigo: { cellWidth: 30, halign: 'center' },

    descripcion: { cellWidth: 70, halign: 'left' },
    cantidad: { cellWidth: 80, halign: 'right' },
  }
  const headerColumnStyles = {
    indice: { cellWidth: 15, halign: 'center' },
    codigo: { cellWidth: 30, halign: 'center' },

    descripcion: { cellWidth: 70, halign: 'left' },
    cantidad: { cellWidth: 80, halign: 'right' },
  }

  // --- Datos del movimiento (bloque izquierdo) ---
  const datosIzquierda = {
    titulo: 'DATOS MOVIMIENTO',
    campos: [
      { label: 'Almacén Origen', valor: dataRoot.almacenorigen || '' },
      { label: 'Almacén Destino', valor: dataRoot.almacendestino || '' },
      { label: 'Fecha', valor: cambiarFormatoFecha(dataRoot.fecha) || '' },
    ],
  }

  // --- Datos del usuario (bloque derecho) ---
  // Handle Usuario structure variations (object vs array)
  let nombreUsuario = ''
  let cargoUsuario = ''

  if (dataRoot.usuario) {
    if (Array.isArray(dataRoot.usuario) && dataRoot.usuario.length > 0) {
      nombreUsuario = dataRoot.usuario[0].usuario || ''
      cargoUsuario = dataRoot.usuario[0].cargo || ''
    } else if (typeof dataRoot.usuario === 'object') {
      nombreUsuario = dataRoot.usuario.nombre || dataRoot.usuario.usuario || ''
      cargoUsuario = dataRoot.usuario.cargo || ''
    }
  }

  const datosDerecho = {
    titulo: 'DATOS DEL USUARIO',
    campos: [
      { label: 'Usuario', valor: nombreUsuario },
      { label: 'Cargo', valor: cargoUsuario },
    ],
  }

  // --- Información extra para el encabezado ---
  const extras = {}

  // --- userData (encabezado de empresa) ---
  // Este reporte no maneja empresa/logo; se deja vacío.
  const userData = await getDatosUsuario()
  console.log(userData)

  return {
    userData,
    columns,
    datos,
    columnStyles,
    headerColumnStyles,
    datosIzquierda,
    datosDerecho,
    extras,
  }
}

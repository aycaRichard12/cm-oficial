import { PdfGeneratorService } from 'src/modules/pdf/services/PdfGeneratorService'
import { verificarTamanoPantallaYRedirigir } from 'src/modules/pdf/utils/screenUtils'
import { decimas, cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { cargarLogoBase64 } from 'src/composables/FuncionesG'
/**
 * Genera el PDF de un detalle de compra a proveedor.
 * @param {Array|Object} detalleCompra - Datos del detalle de compra (puede venir como array de un elemento)
 * @param {string} divisa - Código/símbolo de la divisa
 * @returns {Object} { doc, mobileBlobUrl }
 */
export async function PDF_DETALLE_COMPRA_PROVEEDOR(detalleCompra, divisa) {
  // Normalizar: la API entrega un array con el detalle en la primera posición
  const detalle = Array.isArray(detalleCompra) ? detalleCompra[0] : detalleCompra

  // 1. Preparar datos estructurados
  const reportData = await prepararDatosCompra(detalle, divisa)

  // 2. Generar PDF mediante el servicio
  const pdfService = new PdfGeneratorService()
  const doc = await pdfService.generateReport({
    userData: reportData.userData,
    columns: reportData.columns,
    datos: reportData.datos,
    titulo: 'COMPRA',
    columnStyles: reportData.columnStyles,
    headerColumnStyles: reportData.headerColumnStyles,
    datosIzquierda: reportData.datosIzquierda,
    datosDerecho: reportData.datosDerecho,
    conImpresionEncargado: false, // se usa datosDerecho personalizado (proveedor)
    extras: reportData.extras,
  })

  // 3. Verificar tamaño de pantalla y redirigir si es necesario
  const mobileBlobUrl = verificarTamanoPantallaYRedirigir(doc)
  return { doc, mobileBlobUrl }
}

/**
 * Prepara todos los datos necesarios para el reporte PDF de compra.
 * @param {Object} detalle - Objeto con el detalle de la compra
 * @param {string} divisa - Código/símbolo de la divisa
 * @returns {Object} Datos estructurados para PdfGeneratorService
 */
async function prepararDatosCompra(detalle, divisa) {
  // --- Columnas de la tabla ---
  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Código', dataKey: 'codigo' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Unidad', dataKey: 'unidad' },
    { header: 'Cantidad', dataKey: 'cantidad' },
    { header: `Precio (${divisa})`, dataKey: 'precio' },
    { header: `Subtotal (${divisa})`, dataKey: 'subTotal' },
  ]

  // --- Filas de datos ---
  const datos = (detalle.detalle || []).map((item, index) => ({
    indice: index + 1,
    codigo: item.codigo || '-',
    descripcion: item.descripcion || '-',
    unidad: item.unidad || '-',
    cantidad: item.cantidad || '0',
    precio: decimas(item.precio || item.precioUnitario || 0),
    subTotal: decimas(item.subTotal || item.subtotal || item.total || 0),
  }))

  // --- Calcular totales ---
  const totalGeneral = (detalle.detalle || []).reduce(
    (sum, item) => sum + parseFloat(item.subTotal || item.subtotal || item.total || 0),
    0,
  )

  const precioUnitario = (detalle.detalle || []).reduce(
    (sum, item) => sum + parseFloat(item.precio || item.precioUnitario || 0),
    0,
  )

  // Fila de total general (formato objeto simple compatible con el servicio)
  // El label se ubica en la columna "producto" y los valores en precio/subTotal
  datos.push({
    producto: `TOTAL GENERAL (${divisa})`,
    precio: decimas(precioUnitario),
    subTotal: decimas(totalGeneral),
  })

  // --- Estilos de columnas ---
  const columnStyles = {
    indice: { cellWidth: 6, halign: 'center' },
    codigo: { cellWidth: 20, halign: 'center' },
    //producto: { cellWidth: 35, halign: 'left' },
    descripcion: { cellWidth: 75, halign: 'left' },
    unidad: { cellWidth: 20, halign: 'center' },
    cantidad: { cellWidth: 20, halign: 'center' },
    precio: { cellWidth: 30, halign: 'center' },
    subTotal: { cellWidth: 25, halign: 'center' },
  }

  const headerColumnStyles = {
    indice: { halign: 'center' },
    codigo: { halign: 'center' },
    //producto: { halign: 'left' },
    descripcion: { halign: 'left' },
    unidad: { halign: 'center' },
    cantidad: { halign: 'center' },
    precio: { halign: 'center' },
    subTotal: { halign: 'center' },
  }

  // --- Datos de la compra (bloque izquierdo) ---
  const datosIzquierda = {
    titulo: 'DATOS DE LA COMPRA',
    campos: [
      { label: 'Fecha', valor: cambiarFormatoFecha(detalle.fechaIngreso) || '' },
      { label: 'N° Factura', valor: detalle.nfactura || '' },
      { label: 'Nombre Lote', valor: detalle.nombreIngreso || '' },
      { label: 'Almacen', valor: detalle.almacen || '' },
    ],
  }

  // --- Datos del proveedor (bloque derecho) ---
  const datosDerecho = {
    titulo: 'PROVEEDOR',
    campos: [
      { label: 'Cod. Proveedor', valor: detalle.proveedor?.codigo || '' },
      { label: 'Proveedor', valor: detalle.proveedor?.nombre || '' },
      { label: 'Pedido', valor: detalle.CodigoPedido || '' },
    ],
  }

  // --- Información extra para el encabezado ---
  // Nota: la API de este reporte no expone datos de empresa/usuario.
  // Si en el futuro se requieren logo/nombre de empresa, agregarlos aquí.
  const empresa = detalle.empresa || {}
  const usuario = detalle.usuario || {}
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

  const extras = {}

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

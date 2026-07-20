import jsPDF from 'jspdf'
import { dibujarCuerpoTabla } from '../dibujar'
import { verificarTamanoPantallaYRedirigir } from '../dibujar'
import { decimas } from 'src/composables/FuncionesG'
import { crearFilaTotalGeneral } from '../dibujar'

/**
 * Genera un reporte de ventas por período en PDF.
 *
 * @param {Ref|Array} filteredCompra - Ref o array con los datos de ventas.
 * @param {Object} almacen - Objeto con la propiedad .label (nombre del almacén).
 * @param {String} fecha_inicio - Fecha de inicio (YYYY-MM-DD).
 * @param {String} fecha_final - Fecha de fin (YYYY-MM-DD).
 * @param {String} cliente - Nombre del cliente (filtro).
 * @param {String} sucursal - Nombre de la sucursal (filtro).
 * @returns {jsPDF|null} - Documento PDF o null si no hay datos.
 */
export function PDFreporteVentasPeriodoCompacta(
  filteredCompra,
  fecha_inicio,
  fecha_final,
  almacen,
  cliente,
  sucursal,
) {
  // 1. Obtener el array de datos (soporta ref o array directo)
  const datosOriginales = Array.isArray(filteredCompra)
    ? filteredCompra
    : filteredCompra?.value || []

  if (!datosOriginales.length) {
    console.warn('No hay datos para generar el reporte')
    return null
  }

  // 2. Mapear cada objeto al formato esperado por el PDF
  const datosMapeados = datosOriginales.map((item) => {
    const totalVenta = Number(item.totalventa) || 0
    const descuento = Number(item.descuento) || 0
    const subtotal = totalVenta + descuento

    return {
      fecha: item.fecha,
      cliente: item.cliente,
      sucursal: item.sucursalc || item.idsucursal || '',
      tipoventa: Number(item.tipoventa), // 1 o 0
      tipopago: item.tipopago,
      nfactura: item.nrofactura || item.nfactura || '',
      canal: item.canal,
      total: subtotal, // bruto (sin descuento)
      descuento: descuento, // monto descontado
      ventatotal: totalVenta, // neto
      codigo: item.codigo, // neto
      codigobarra: item.codigobarra, // neto
      descripcion: item.descripcion, // neto
      cantidad: item.cantidad, // neto
      preciounitario: item.preciounitario, // neto
    }
  })

  // 3. Ordenar por fecha (ascendente) y agregar índice
  const datos = datosMapeados
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .map((item, indice) => ({
      indice: indice + 1,
      fecha: item.fecha,
      cliente: item.cliente,
      sucursal: item.sucursal,
      tipoventa: Number(item.tipoventa) === 1 ? 'Factura Compra-Venta' : 'Comprobante Venta',
      tipopago: item.tipopago,
      nfactura: item.nfactura,
      canal: item.canal,
      total: decimas(item.total),
      descuento: decimas(item.descuento),
      ventatotal: decimas(item.ventatotal),
      CodigoProducto: item.codigo,
      CodigoBarra: item.codigobarra,
      DescripciondeProducto: item.descripcion,
      cantidad: item.cantidad,
      preciounitario: decimas(item.preciounitario),
    }))

  // 4. Calcular totales globales
  const descuentoTotal = datosOriginales.reduce((sum, row) => sum + (Number(row.descuento) || 0), 0)

  const totalBruto = datosOriginales.reduce(
    (sum, row) => sum + (Number(row.totalventa) || 0) + (Number(row.descuento) || 0),
    0,
  )

  // 5. Agregar fila de totales al final
  datos.push(
    crearFilaTotalGeneral(
      'Total Sumatorias',
      [
        { valor: totalBruto, halign: 'right' },
        { valor: descuentoTotal, halign: 'right' },
        { valor: totalBruto, halign: 'right' }, // Monto = total bruto (ajusta según tu necesidad)
      ],
      7, // índice de la columna donde va el texto "Total Sumatorias" (0‑based)
    ),
  )

  // 6. Configurar columnas y estilos
  const columns = [
    { header: 'N', dataKey: 'indice' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Nro. Doc', dataKey: 'nfactura' },
    { header: 'Razon Social', dataKey: 'cliente' },
    { header: 'Cod.', dataKey: 'CodigoProducto' },
    { header: 'Descripción', dataKey: 'DescripciondeProducto' },
    { header: 'Cant.', dataKey: 'cantidad' },
    { header: 'Precio U.', dataKey: 'preciounitario' },
    { header: 'Dscto.', dataKey: 'descuento' },
    { header: 'Total', dataKey: 'ventatotal' },
  ]

  const columnStyles = {
    indice: { cellWidth: 10, halign: 'center' },
    fecha: { cellWidth: 18, halign: 'left' },
    cliente: { cellWidth: 20, halign: 'left' },
    nfactura: { cellWidth: 15, halign: 'center' },
    cantidad: { cellWidth: 10, halign: 'right' },
    preciounitario: { cellWidth: 15, halign: 'right' },
    descuento: { cellWidth: 15, halign: 'right' },
    ventatotal: { cellWidth: 15, halign: 'right' },
  }

  // 7. Preparar datos para la cabecera (filtros)
  const Izquierda = {
    titulo: 'DATOS DEL REPORTE',
    campos: [
      { label: 'Almacen', valor: almacen?.label || '' },
      { label: 'Cliente', valor: cliente || '' },
      { label: 'Sucursal', valor: sucursal || '' },
    ],
  }

  const fechas = {
    inicio: fecha_inicio,
    final: fecha_final,
  }

  // 8. Inicializar el documento PDF
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  // 9. Dibujar la tabla
  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE VENTAS',
    columnStyles,
    columnStyles, // o un objeto diferente para el encabezado
    Izquierda,
    null, // lado derecho (opcional)
    true, // mostrar totales en la tabla
    fechas,
    null,
  )

  // 10. Verificar tamaño y redirigir (o mostrar)
  const docResult = verificarTamanoPantallaYRedirigir(doc)
  return docResult || null
}

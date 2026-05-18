import jsPDF from 'jspdf'
import { verificarTamanoPantallaYRedirigir } from '../dibujar'
import { decimas } from 'src/composables/FuncionesG'
import { useCurrencyStore } from 'src/stores/currencyStore'
import { dibujarCuerpoTabla } from '../dibujar'
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'

const divisaActiva = useCurrencyStore().simbolo

function crearFilaTotalGeneral(label, columnasTotales, colSpan) {
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

export function PDF_DETALLE_COMPRA_PROVEEDOR(detalleCompra) {
  console.log('esto son las divisas', detalleCompra)
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  // Extraer el primer elemento del array (según la estructura de la API)
  const detalle = Array.isArray(detalleCompra) ? detalleCompra[0] : detalleCompra

  // Columnas para la tabla de productos
  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Código', dataKey: 'codigo' },
    { header: 'Producto', dataKey: 'producto' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Unidad', dataKey: 'unidad' },
    { header: 'Cantidad', dataKey: 'cantidad' },
    { header: 'Precio (' + divisaActiva + ')', dataKey: 'precio' },
    { header: 'Subtotal (' + divisaActiva + ')', dataKey: 'subTotal' },
  ]

  // Mapear datos de productos
  const datos = (detalle.detalle || []).map((item, index) => ({
    indice: index + 1,
    codigo: item.codigo || '-',
    producto: item.producto || '-',
    descripcion: item.descripcion || '-',
    unidad: item.unidad || '-',
    cantidad: item.cantidad || '0',
    precio: decimas(item.precio || item.precioUnitario || 0),
    subTotal: decimas(item.subTotal || item.subtotal || item.total || 0),
  }))

  // Calcular total
  const totalGeneral = (detalle.detalle || []).reduce(
    (sum, item) => sum + parseFloat(item.subTotal || item.subtotal || item.total || 0),
    0,
  )

  //calcular precio unitario
  const precioUnitario = (detalle.detalle || []).reduce(
    (sum, item) => sum + parseFloat(item.precio || item.precioUnitario || 0),
    0,
  )

  datos.push(
    crearFilaTotalGeneral(
      `TOTAL GENERAL (${divisaActiva})`,
      [
        { valor: precioUnitario, halign: 'center' },
        { valor: totalGeneral, halign: 'center' },
      ],
      6,
    ),
  )

  // Estilos de columnas
  const columnStyles = {
    indice: { cellWidth: 6, halign: 'center' },
    codigo: { cellWidth: 20, halign: 'center' },
    producto: { cellWidth: 35, halign: 'left' },
    descripcion: { cellWidth: 40, halign: 'left' },
    unidad: { cellWidth: 20, halign: 'center' },
    cantidad: { cellWidth: 20, halign: 'center' },
    precio: { cellWidth: 30, halign: 'center' },
    subTotal: { cellWidth: 25, halign: 'center' },
  }

  const headerColumnStyles = {
    indice: { halign: 'center' },
    codigo: { halign: 'center' },
    producto: { halign: 'left' },
    descripcion: { halign: 'left' },
    unidad: { halign: 'center' },
    cantidad: { halign: 'center' },
    precio: { halign: 'center' },
    subTotal: { halign: 'center' },
  }

  // Información izquierda - Datos de la compra
  const Izquierda = {
    titulo: 'DATOS DE LA COMPRA',
    campos: [
      { label: 'Fecha', valor: cambiarFormatoFecha(detalle.fechaIngreso) || '' },
      { label: 'N° Factura', valor: detalle.nfactura || '' },
      // {
      //   label: 'Autorización',
      //   valor: detalle.autorizacion == '1' ? 'Autorizado' : 'No Autorizado',
      // },
      // { label: 'Almacén', valor: detalle.almacen || '' },
      { label: 'Nombre Lote', valor: detalle.nombreIngreso || '' },
      { label: 'Almacen', valor: detalle.almacen || '' },
    ],
  }

  // Información derecha - Proveedor
  const derecho = {
    titulo: 'PROVEEDOR',
    campos: [
      { label: 'Cod. Proveedor', valor: detalle.proveedor?.codigo || '' },
      { label: 'Proveedor', valor: detalle.proveedor?.nombre || '' },
      { label: 'Pedido', valor: detalle.CodigoPedido || '' },
    ],
  }

  // Información adicional centrada - Usuario y Empresa
  const extras = {
    // centreado: {
    //   campos: [
    //     { label: '', valor: detalle.usuario?.usuario || '' },
    //     { label: '', valor: detalle.usuario?.cargo || '' },
    //   ],
    // },
  }

  // Dibujar el PDF
  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE DE COMPRA',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    derecho,
    true, // con impresión de encargado
    null,
    extras,
  )

  const docResult = verificarTamanoPantallaYRedirigir(doc)
  if (!docResult) return
  return docResult
}

import jsPDF from 'jspdf'
import { verificarTamanoPantallaYRedirigir } from '../dibujar'
import { decimas, redondear } from 'src/composables/FuncionesG'
//import { useCurrencyStore } from 'src/stores/currencyStore'
import { dibujarCuerpoTabla } from '../dibujar'
import { numeroALetras } from 'src/composables/FuncionesG'

//const divisaActiva = useCurrencyStore().simbolo

// function crearFilaTotalGeneral(label, columnasTotales, colSpan) {
//   const fila = [
//     {
//       content: label,
//       colSpan: colSpan || 6,
//       styles: {
//         halign: 'right',
//         fontStyle: 'bold',
//         // fillColor: [240, 230, 240],
//         lineWidth: { top: 0.3, bottom: 0.3 },
//         lineColor: [0, 0, 0],
//       },
//     },
//   ]

//   // Agregar las columnas de totales
//   columnasTotales.forEach((columna) => {
//     fila.push({
//       content: decimas(columna.valor),
//       styles: {
//         halign: columna.halign || 'center',
//         fontStyle: 'bold',
//         // pintar bordes una sola vez
//         lineWidth: { top: 0.3, bottom: 0.3 }, // left: 0.3  top: 0.3,
//         lineColor: [0, 0, 0],
//       },
//     })
//   })

//   return fila
// }

export function PDFComprovanteVenta(detalleVenta) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
    { header: 'Precio', dataKey: 'precio' },
    { header: 'Total', dataKey: 'total' },
  ]

  const detallePlano = JSON.parse(JSON.stringify(detalleVenta.value))

  const punto_venta = detallePlano[0].nombre_punto_venta
  console.log(punto_venta)
  detallePlano[0].detalle[0].map((item) => {
    console.log(item)
  })
  const datos = detallePlano[0].detalle[0].map((item, indice) => ({
    indice: indice + 1,
    descripcion:
      item.descripcion +
      (item.descripcionAdicional ? '\n (' + item.descripcionAdicional + ')' : ''),
    cantidad: decimas(item.cantidad),
    precio: decimas(item.precio),
    total: decimas(redondear(parseFloat(item.cantidad) * parseFloat(item.precio))),
    descripcionAdicional: item.descripcionAdicional,
  }))
  const subtotal = detallePlano[0].detalle[0].reduce(
    (sum, dato) => sum + redondear(parseFloat(dato.cantidad) * parseFloat(dato.precio)),
    0,
  )
  let montototal = decimas(redondear(parseFloat(subtotal) - parseFloat(detallePlano[0].descuento)))

  const descuento = decimas(detallePlano[0].descuento || 0)
  const montoTexto = numeroALetras(montototal, detallePlano[0].divisa)

  datos.push(
    { precio: 'SUBTOTAL', total: decimas(subtotal) },
    { precio: 'DESCUENTO', total: decimas(descuento) },
    { precio: 'MONTO TOTAL', total: decimas(montototal), descripcion: montoTexto },
  )

  const columnStyles = {
    indice: { cellWidth: 15, halign: 'center' },
    descripcion: { cellWidth: 50, halign: 'left' },
    cantidad: { cellWidth: 40, halign: 'right' },
    precio: { cellWidth: 40, halign: 'right' },
    total: { cellWidth: 50, halign: 'right' },
  }
  const headerColumnStyles = {
    indice: { cellWidth: 15, halign: 'center' },
    descripcion: { cellWidth: 50, halign: 'left' },
    cantidad: { cellWidth: 40, halign: 'right' },
    precio: { cellWidth: 40, halign: 'right' },
    total: { cellWidth: 50, halign: 'right' },
  }
  const Izquierda = {
    titulo: 'DATOS DEL CLIENTE',
    campos: [
      {
        label: '',
        valor:
          detallePlano[0].cliente +
          ' ' +
          detallePlano[0].nombrecomercial +
          ' ' +
          detallePlano[0].sucursal,
      },
      {
        label: '',
        valor: detallePlano[0].direccion || '',
      },
      {
        label: '',
        valor: detallePlano[0].email || '',
      },
    ],
  }
  const derecho = {
    titulo: 'DATOS DEL VENDEDOR',
    campos: [
      {
        label: '',
        valor: detallePlano[0].usuario[0].usuario || 'Todos los Almacenes',
      },
      {
        label: '',
        valor: detallePlano[0].usuario[0].cargo || '',
      },
      {
        label: '',
        valor: 'Venta a' + detallePlano[0].tipopago || '',
      },
      {
        label: 'Punto Venta',
        valor: punto_venta || '',
      },
    ],
  }
  const nfactura = detallePlano[0].nfactura || ''
  const divisa = detallePlano[0].divisa || ''
  const extras = {
    expresadoDivisa: divisa,
    numFactura: nfactura,
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'COMPROBANTE DE VENTA',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    derecho,
    false,
    null,
    extras,
    null,
    { columna: 'descripcion', campo: 'descripcionAdicional' },
  )

  const docResult = verificarTamanoPantallaYRedirigir(doc)
  if (!docResult) return
  return docResult
}

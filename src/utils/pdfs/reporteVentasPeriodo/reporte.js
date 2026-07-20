import jsPDF from 'jspdf'
import { dibujarCuerpoTabla } from '../dibujar'
import { verificarTamanoPantallaYRedirigir } from '../dibujar'
import { decimas, redondear } from 'src/composables/FuncionesG'
import { crearFilaTotalGeneral } from '../dibujar'
export function PDFreporteVentasPeriodo(
  filteredCompra,
  almacen,
  fecha_inicio,
  fecha_final,
  divisaActiva,
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const columns = [
    { header: 'N', dataKey: 'indice' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Cliente', dataKey: 'cliente' },
    { header: 'Sucursal', dataKey: 'sucursal' },
    { header: 'Tipo-Venta', dataKey: 'tipoventa' },
    { header: 'Pago', dataKey: 'tipopago' },
    { header: 'Nro. Factura', dataKey: 'nfactura' },
    { header: 'Canal', dataKey: 'canal' },
    { header: 'Total', dataKey: 'total' },
    { header: 'Dscto', dataKey: 'descuento' },
    { header: 'Monto', dataKey: 'ventatotal' },
  ]
  // filteredCompra.value.reduce((sum, row) => sum + Number(row.total), 0)
  const datos = [...filteredCompra.value]
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .map((item, indice) => ({
      indice: indice + 1,
      fecha: item.fecha,
      cliente: item.cliente,
      sucursal: item.sucursal,
      //si tipo venta es 1 tonces Factura Compra-Venta si es 0 es Comprobante Venta
      tipoventa: Number(item.tipoventa) === 1 ? 'Factura Compra-Venta' : 'Comprobante Venta',
      tipopago: item.tipopago,
      nfactura: item.nfactura,
      canal: item.canal,
      total: decimas(item.total),
      descuento: decimas(item.descuento),
      ventatotal: decimas(item.ventatotal),
    }))

  const descuento = filteredCompra.value.reduce(
    (sum, row) => sum + redondear(parseFloat(row.descuento)),
    0,
  )

  const total = filteredCompra.value.reduce(
    (sum, row) =>
      sum + redondear(parseFloat(row.ventatotal)) + redondear(parseFloat(row.descuento)),
    0,
  )

  // datos.push({
  //   canal: 'Total Sumatorias',
  //   total: decimas(total),
  //   descuento: decimas(descuento),
  //   ventatotal: decimas(total + descuento),
  // })

  datos.push(
    crearFilaTotalGeneral(
      `Total Sumatorias (${divisaActiva})`,
      [
        { valor: total, halign: 'right' },
        { valor: descuento, halign: 'right' },
        { valor: total + descuento, halign: 'right' },
      ],
      8,
    ),
  )

  const columnStyles = {
    indice: { cellWidth: 10, halign: 'center' },
    fecha: { cellWidth: 20, halign: 'left' },
    cliente: { cellWidth: 20, halign: 'left' },
    sucursal: { cellWidth: 25, halign: 'left' },
    tipoventa: { cellWidth: 25, halign: 'center' },
    tipopago: { cellWidth: 15, halign: 'center' },
    nfactura: { cellWidth: 15, halign: 'center' },
    canal: { cellWidth: 20, halign: 'left' },
    total: { cellWidth: 15, halign: 'right' },
    descuento: { cellWidth: 15, halign: 'right' },
    ventatotal: { cellWidth: 15, halign: 'right' },
  }
  const headerColumnStyles = {
    indice: { cellWidth: 10, halign: 'center' },
    fecha: { cellWidth: 20, halign: 'left' },
    cliente: { cellWidth: 20, halign: 'left' },
    sucursal: { cellWidth: 25, halign: 'left' },
    tipoventa: { cellWidth: 25, halign: 'center' },
    tipopago: { cellWidth: 15, halign: 'center' },
    nfactura: { cellWidth: 15, halign: 'center' },
    canal: { cellWidth: 20, halign: 'left' },
    total: { cellWidth: 15, halign: 'right' },
    descuento: { cellWidth: 15, halign: 'right' },
    ventatotal: { cellWidth: 15, halign: 'right' },
  }
  const alm = almacen.label
  console.log(alm)
  const Izquierda = {
    titulo: 'DATOS DEL REPORTE',
    campos: [
      {
        label: 'Almacen',
        valor: alm || '',
      },
    ],
  }
  const fechas = {
    inicio: fecha_inicio,

    final: fecha_final,
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE VENTAS',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    null,
    true,
    fechas,
    null,
  )

  const docResult = verificarTamanoPantallaYRedirigir(doc)
  if (!docResult) return
  return docResult
}

import jsPDF from 'jspdf'
import { verificarTamanoPantallaYRedirigir } from '../dibujar'
import { decimas } from 'src/composables/FuncionesG'
import { dibujarCuerpoTabla } from '../dibujar'
import { cargarFirmaBase64 } from 'src/composables/FuncionesG'
import { redondear } from 'src/composables/FuncionesG'
export async function generarPdfCotizacion(data) {
  console.log(data)
  const comprobanteData = []
  const cotizacionDetalle = data[0]

  const empresaInfo = cotizacionDetalle.empresa
  const usuarioInfo = cotizacionDetalle.usuario
  const clienteInfo = cotizacionDetalle.cliente
  const cotizacionInfo = cotizacionDetalle.cotizacion
  const divisaCotizacion = cotizacionDetalle.divisa
  const almacen = cotizacionDetalle.almacen
  console.log(divisaCotizacion.divisa)

  comprobanteData.empresa = {
    nombre: empresaInfo.nombre,
    direccion: empresaInfo.direccion,
    celular: empresaInfo.celular,
    email: empresaInfo.email,
    logoUrl: `.././em/${empresaInfo.logo}`, // Ajusta la URL de la imagen según tu configuración
  }
  comprobanteData.Nro = cotizacionInfo.Nro || '' // Si existe un número de cotización
  comprobanteData.clienteDisplay = `${clienteInfo.nombre} - ${clienteInfo.nombrecomercial} - ${clienteInfo.sucursal}`
  comprobanteData.nit = clienteInfo.nit
  comprobanteData.direccion = clienteInfo.direccion
  comprobanteData.email = clienteInfo.email
  comprobanteData.fecha = cotizacionInfo.fecha
  comprobanteData.usuario = usuarioInfo.usuario
  comprobanteData.cargo = usuarioInfo.cargo // Asumo que hay un campo rol en usuario
  const condicion = cotizacionInfo.condicion
  const estado = cotizacionInfo.estado
  console.log(estado)
  let currentSubtotal = 0
  let firma = cotizacionInfo.firma_url
  const detalleProductos = cotizacionDetalle.detalle.map((item) => {
    const totalProducto = redondear(item.cantidad * item.precio)
    currentSubtotal += totalProducto
    return {
      ...item,
      total: totalProducto,
    }
  })
  if (firma) {
    firma = firma.split('/').pop()
  }

  let base64 = ''
  if (firma) {
    base64 = await cargarFirmaBase64(firma)
  }
  comprobanteData.detalle = detalleProductos
  comprobanteData.descuento = cotizacionInfo.descuento
  comprobanteData.subtotal = redondear(currentSubtotal)
  comprobanteData.montoTotal = redondear(currentSubtotal - cotizacionInfo.descuento)
  const detallePlano = comprobanteData

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
    { header: 'Precio', dataKey: 'precio' },
    { header: 'Total', dataKey: 'total' },
  ]

  const datos = detallePlano.detalle.map((item, indice) => ({
    indice: indice + 1,
    descripcion: item.descripcion,
    cantidad: decimas(item.cantidad),
    precio: decimas(item.precio),
    total: decimas(redondear(parseFloat(item.cantidad) * parseFloat(item.precio))),
  }))
  const subtotal = detallePlano.detalle.reduce(
    (sum, dato) => sum + redondear(parseFloat(dato.cantidad) * parseFloat(dato.precio)),
    0,
  )
  let montototal = decimas(redondear(parseFloat(subtotal) - parseFloat(detallePlano.descuento)))

  const descuento = decimas(detallePlano.descuento || 0)

  // Fila para Subtotal
  datos.push({ precio: 'SUBTOTAL', total: decimas(subtotal) })
  // Fila para Descuento
  datos.push({ precio: 'DESCUENTO', total: decimas(descuento) })
  // Fila para Monto Total
  datos.push({ precio: 'MONTO TOTAL', total: decimas(montototal) })

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
        valor: detallePlano.clienteDisplay,
      },
      {
        label: '',
        valor: detallePlano.direccion || '',
      },
      {
        label: '',
        valor: detallePlano.email || '',
      },
      {
        label: 'Fecha de Venta',
        valor: detallePlano.fecha || '',
      },
    ],
  }
  const derecho = {
    titulo: 'DATOS DEL VENDEDOR',
    campos: [
      {
        label: '',
        valor: almacen.almacen,
      },
      {
        label: '',
        valor: detallePlano.usuario || '',
      },
      {
        label: '',
        valor: detallePlano.cargo || '',
      },
    ],
  }
  const nfactura = cotizacionInfo.nfactura || ''
  const divisa = divisaCotizacion.divisa || ''
  const extras = {
    expresadoDivisa: divisa,
    numFactura: nfactura,
    descripcionAdicional: 'descripcionAdicional',
    descripcion: 'descripcion',
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'COTIZACIÓN',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    derecho,
    false,
    null,
    extras,
    base64,
  )

  // --- Lógica para el Watermark "Anulado" ---
  if (condicion == 2) {
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const centerX = pageWidth / 2
    const centerY = pageHeight / 2

    // Texto diagonal grande simulando transparencia
    doc.setFontSize(70)
    doc.setTextColor(255, 0, 0) // rojo puro
    doc.setGState(new doc.GState({ opacity: 0.15 })) // 🔥 usa opacidad real
    doc.setFont(undefined, 'bold')

    doc.text('ANULADO', centerX, centerY, {
      angle: 45,
      align: 'center',
    })

    // Restablecer
    doc.setGState(new doc.GState({ opacity: 1 }))
    doc.setFontSize(6)
    doc.setTextColor(0)
  }

  const docResult = verificarTamanoPantallaYRedirigir(doc)
  if (!docResult) return
  return docResult
}

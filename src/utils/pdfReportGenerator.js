import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { decimas, redondear } from 'src/composables/FuncionesG'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { obtenerFechaActualDato } from 'src/composables/FuncionesG'
import { numeroALetras } from 'src/composables/FuncionesG'
import { api } from 'src/boot/axios'
import { cargarLogoBase64 } from 'src/composables/FuncionesG'
import { getComercialImagenProducto } from 'src/composables/FuncionesG'
// import { convertirAMayusculas } from 'src/composables/FuncionesG'
import { useCurrencyStore } from 'src/stores/currencyStore'
import { obtenerHora } from 'src/composables/FuncionesG'
const divisaActiva = useCurrencyStore().simbolo

// Variables globales
let logoBase64 = null
let contenidousuario = null
let idempresa = null
let datosUsuario = null
let logoEmpresa = null
let nombreEmpresa = null
let direccionEmpresa = null
let telefonoEmpresa = null
let encargadoNombre = null
let cargo = null
let email_emizor = null
let estado = null
let ciudad = null
//let region = null
let pais = null
let nit = null
let telefono = null
let celular = null
let email = null
let web = null

let fontSize = 8
let fontSizeCabezal = 9
let cellPadding = 1
//let ColoEncabezadoTabla = [128, 128, 128] // Negro

console.log(fontSizeCabezal)
const tipo = { 1: 'Pedido Compra', 2: 'Pedido Movimiento' }

async function initPdfReportGenerator() {
  contenidousuario = validarUsuario()
  datosUsuario = contenidousuario[0]
  logoEmpresa = datosUsuario.empresa.logo
  logoBase64 = await cargarLogoBase64(logoEmpresa)
  nombreEmpresa = datosUsuario.empresa.nombre
  direccionEmpresa = datosUsuario.empresa.direccion
  telefonoEmpresa = datosUsuario.empresa.telefono
  encargadoNombre = datosUsuario.nombre
  cargo = datosUsuario.cargo
  email_emizor = datosUsuario.empresa.email
  pais = datosUsuario.empresa.opais
  estado = datosUsuario.empresa.oestado
  //region = datosUsuario.region
  ciudad = datosUsuario.empresa.ociudad
  nit = datosUsuario.empresa.nit
  telefono = datosUsuario.empresa.telefono
  celular = datosUsuario.empresa.ocelular
  email = datosUsuario.empresa.email
  web = datosUsuario.empresa.ositioweb
}

export function getLogoBase64() {
  return logoBase64
}

initPdfReportGenerator()
function getEstadoText(estado) {
  const estados = {
    1: 'Activo',
    2: 'Finalizado',
    3: 'Atrasado',
    4: 'Anulado',
  }
  return estados[Number(estado)] || ''
}

export function PDF_REPORTE_PROVEEDORES(filtrarProveedores) {
  const doc = new jsPDF({ orientation: 'landscape' })

  // Ruta relativa o base64
  const columns = [
    { header: 'Nombre', dataKey: 'nombre' },
    { header: 'Código', dataKey: 'codigo' },
    { header: 'NIT', dataKey: 'nit' },
    { header: 'Detalle', dataKey: 'detalle' },
    { header: 'Dirección', dataKey: 'direccion' },
    { header: 'Teléfono', dataKey: 'telefono' },
    { header: 'Móvil', dataKey: 'mobil' },
    { header: 'Email', dataKey: 'email' },
    { header: 'Web', dataKey: 'web' },
    { header: 'País', dataKey: 'pais' },
    { header: 'Ciudad', dataKey: 'ciudad' },
    { header: 'Zona', dataKey: 'zona' },
    { header: 'Contacto', dataKey: 'contacto' },
  ]

  const datos = filtrarProveedores.map((item) => ({
    nombre: item.nombre,
    codigo: item.codigo,
    nit: item.nit,
    detalle: item.detalle,
    direccion: item.direccion,
    telefono: item.telefono,
    mobil: item.mobil,
    email: item.email,
    web: item.web,
    pais: item.pais,
    ciudad: item.ciudad,
    zona: item.zona,
    contacto: item.contacto,
  }))
  const columnStyles = {
    nombre: { cellWidth: 20, halign: 'left' },
    codigo: { cellWidth: 15, halign: 'left' },
    nit: { cellWidth: 20, halign: 'right' },
    detalle: { cellWidth: 30, halign: 'left' },
    direccion: { cellWidth: 30, halign: 'left' },
    telefono: { cellWidth: 18, halign: 'center' },
    mobil: { cellWidth: 15, halign: 'center' },
    email: { cellWidth: 20, halign: 'left' },
    web: { cellWidth: 25, halign: 'left' },
    pais: { cellWidth: 20, halign: 'center' },
    ciudad: { cellWidth: 20, halign: 'center' },
    zona: { cellWidth: 20, halign: 'center' },
    contacto: { cellWidth: 25, halign: 'left' },
  }
  const headerColumnStyles = {
    nombre: { cellWidth: 20, halign: 'left' },
    codigo: { cellWidth: 15, halign: 'left' },
    nit: { cellWidth: 20, halign: 'right' },
    detalle: { cellWidth: 30, halign: 'left' },
    direccion: { cellWidth: 30, halign: 'left' },
    telefono: { cellWidth: 18, halign: 'center' },
    mobil: { cellWidth: 15, halign: 'center' },
    email: { cellWidth: 20, halign: 'left' },
    web: { cellWidth: 25, halign: 'left' },
    pais: { cellWidth: 20, halign: 'center' },
    ciudad: { cellWidth: 20, halign: 'center' },
    zona: { cellWidth: 20, halign: 'center' },
    contacto: { cellWidth: 25, halign: 'left' },
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'PROVEEDORES',
    columnStyles,
    headerColumnStyles,
    null,
    null,
    true,
    null,
    null,
  )
  return doc
}
export function PDF_PRECIOS_SUGERIDOS(filtrados, filtroAlmacen) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Código', dataKey: 'codigo' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Precio', dataKey: 'precio' },
  ]

  const datos = filtrados.map((item, indice) => ({
    indice: indice + 1,
    codigo: item.codigo,
    descripcion: item.descripcion,
    precio: decimas(item.precio),
  }))

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
    titulo: 'DATOS DEL REPORTE',
    campos: [
      {
        label: 'Nombre del Almacén',
        valor: filtroAlmacen || 'Todos los Almacenes',
      },
    ],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'PRECIOS SUGERIDOS',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    null,
    true,
    null,
    null,
  )

  return doc
}
export function PDF_REPORTE_COSTO_UNITARIO_X_ALMACEN(filtrados, filtroAlmacen) {
  console.log(filtroAlmacen)
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Código', dataKey: 'codigo' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Precio', dataKey: 'precio' },
  ]

  const datos = filtrados.map((item, indice) => ({
    indice: indice + 1,
    codigo: item.codigo,
    descripcion: item.descripcion,
    precio: decimas(item.precio),
  }))

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
    titulo: 'DATOS DEL REPORTE',
    campos: [
      {
        label: 'Nombre del Almacén',
        valor: filtroAlmacen || 'Todos los Almacenes',
      },
    ],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'COSTOS UNITARIOS',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    null,
    true,
    null,
    null,
  )
  return doc
}

export const PDF_REPORTE_CATEGORIA_PRECIO_X_ALMACEN = (filtradas, filtroAlmacen) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Nombre', dataKey: 'nombre' },
    { header: 'Porcentaje', dataKey: 'porcentaje' },
  ]
  const datos = filtradas.map((item, indice) => ({
    indice: indice + 1,
    nombre: item.nombre,
    porcentaje: item.porcentaje,
  }))

  const columnStyles = {
    indice: { cellWidth: 20, halign: 'center' },
    nombre: { cellWidth: 90, halign: 'left' },
    porcentaje: { cellWidth: 85, halign: 'right' },
  }
  const headerColumnStyles = {
    indice: { cellWidth: 20, halign: 'center' },
    nombre: { cellWidth: 90, halign: 'left' },
    porcentaje: { cellWidth: 85, halign: 'right' },
  }
  const Izquierda = {
    titulo: 'DATOS DEL REPORTE',
    campos: [
      {
        label: 'Nombre del Almacén',
        valor: filtroAlmacen || 'Todos los Almacenes',
      },
    ],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'COSTOS UNITARIOS',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    null,
    true,
    null,
    null,
  )

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  return doc
}
export default function imprimirReporte(detallePedido) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
  ]

  const detallePlano = JSON.parse(JSON.stringify(detallePedido.value))

  const datos = detallePlano[0].detalle.map((item, indice) => ({
    indice: indice + 1,
    descripcion: item.descripcion,
    cantidad: decimas(item.cantidad),
  }))

  const columnStyles = {
    indice: { cellWidth: 15, halign: 'center' },
    descripcion: { cellWidth: 90, halign: 'left' },
    cantidad: { cellWidth: 85, halign: 'right' },
  }

  //   ,angle: 90, valign: 'middle'
  const headerColumnStyles = {
    indice: { cellWidth: 15, halign: 'center' },
    descripcion: { cellWidth: 90, halign: 'left' },
    cantidad: { cellWidth: 85, halign: 'right' },
  }
  const Izquierda = {
    titulo: 'DATOS ORDEN',
    campos: [
      {
        label: '',
        valor: detallePlano[0].empresa.direccion || '',
      },
      {
        label: '',
        valor: detallePlano[0].empresa.email || '',
      },
      {
        label: 'Fecha de Orden',
        valor: cambiarFormatoFecha(detallePlano[0].fecha) || '',
      },
    ],
  }
  const derecho = {
    titulo: 'DATOS DEL USUARIO',
    campos: [
      {
        label: '',
        valor: detallePlano[0].usuarios[0].usuario || '',
      },
      {
        label: '',
        valor: detallePlano[0].usuarios[0].cargo || '',
      },
      {
        label: '',
        valor: 'Tipo ' + tipo[detallePlano[0].tipopedido] || '',
      },
    ],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'ORDEN PEDIDO',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    derecho,
    true,
    null,
    null,
  )
  return doc
}
export function PDFreporteCuentasXCobrarPeriodo(reportData, startDate, endDate) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  // Columns for jsPDF-autoTable
  const columns = [
    { header: 'N', dataKey: 'indice' },
    { header: 'Fecha', dataKey: 'fecha_actual' }, // Match actual field names from API
    { header: 'Cliente', dataKey: 'nombre_cliente' },
    { header: 'Comercial', dataKey: 'nombre_comercial' },
    { header: 'Monto Venta', dataKey: 'monto_total_venta' },
    { header: 'Desc.', dataKey: 'descuento_venta' },
    { header: 'Saldo Cobro', dataKey: 'saldo_estado_cobro' },
    { header: 'Monto Cobrado', dataKey: 'monto_detalle_cobro' },
    // { header: 'Foto', dataKey: 'foto_detalle_cobro' }, // Images in autoTable are more complex
  ]

  // Data for jsPDF-autoTable - map from `reportData.value`
  const datos = reportData.value.map((item, indice) => ({
    indice: indice + 1,
    fecha_actual: item.fecha_actual,
    nombre_cliente: item.nombre_cliente,
    nombre_comercial: item.nombre_comercial,
    monto_total_venta: item.monto_total_venta.toFixed(2), // Format for display
    descuento_venta: item.descuento_venta.toFixed(2),
    saldo_estado_cobro: item.saldo_estado_cobro.toFixed(2),
    monto_detalle_cobro: item.monto_detalle_cobro.toFixed(2),
    // foto_detalle_cobro: item.foto_detalle_cobro, // Handle separately if needed
  }))

  const monto_total_venta = datos.reduce((sum, u) => {
    return sum + Number(u.monto_total_venta)
  }, 0)
  const saldo_estado_cobro = datos.reduce((sum, u) => {
    return sum + Number(u.saldo_estado_cobro)
  }, 0)
  const monto_detalle_cobro = datos.reduce((sum, u) => {
    return sum + Number(u.monto_detalle_cobro)
  }, 0)
  const descuento_venta = datos.reduce((sum, u) => {
    return sum + Number(u.descuento_venta)
  }, 0)
  const pieTable = {
    nombre_comercial: 'Total:',
    monto_total_venta: monto_total_venta.toFixed(2),
    descuento_venta: descuento_venta.toFixed(2),
    saldo_estado_cobro: saldo_estado_cobro.toFixed(2),
    monto_detalle_cobro: monto_detalle_cobro.toFixed(2),
  }
  datos.push(pieTable)

  const columnStyles = {
    indice: { cellWidth: 15, halign: 'center' }, // Adjusted width
    fecha_actual: { cellWidth: 20, halign: 'center' },
    nombre_cliente: { cellWidth: 40, halign: 'left' },
    nombre_comercial: { cellWidth: 30, halign: 'left' },
    monto_total_venta: { cellWidth: 20, halign: 'right' },
    descuento_venta: { cellWidth: 20, halign: 'right' },
    saldo_estado_cobro: { cellWidth: 20, halign: 'right' },
    monto_detalle_cobro: { cellWidth: 25, halign: 'right' },
  }

  //   ,angle: 90, valign: 'middle'
  const headerColumnStyles = {
    indice: { cellWidth: 15, halign: 'center' }, // Adjusted width
    fecha_actual: { cellWidth: 20, halign: 'center' },
    nombre_cliente: { cellWidth: 40, halign: 'left' },
    nombre_comercial: { cellWidth: 30, halign: 'left' },
    monto_total_venta: { cellWidth: 20, halign: 'right' },
    descuento_venta: { cellWidth: 20, halign: 'right' },
    saldo_estado_cobro: { cellWidth: 20, halign: 'right' },
    monto_detalle_cobro: { cellWidth: 25, halign: 'right' },
  }

  const fechas = {
    inicio: startDate.value,

    final: endDate.value,
  }
  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE DE COBROS DIARIOS',
    columnStyles,
    headerColumnStyles,
    null,
    null,
    true,
    fechas,
    null,
  )
  return doc
}

export function PDFreporteCreditos(
  reportData,
  startDate,
  endDate,
  clienteSeleccionado = null,
  sucursalSeleccionada = null,
) {
  const doc = new jsPDF({
    orientation: 'landscape', // Usamos horizontal para más columnas
    unit: 'mm',
  })

  // Datos de la empresa

  // Configuración de columnas
  const columns = [
    { header: 'N°', dataKey: 'numero' },
    { header: 'Fecha Crédito', dataKey: 'fechaventa' },
    { header: 'Cliente', dataKey: 'razonsocial' },
    { header: 'Sucursal', dataKey: 'sucursal' },
    { header: 'Fecha Límite', dataKey: 'fechalimite' },
    { header: 'Cuotas', dataKey: 'ncuotas' },
    { header: 'Cuotas Procesadas', dataKey: 'cuotasprocesadas' },
    { header: 'Valor Cuota', dataKey: 'valorcuotas' },
    { header: 'Total Venta', dataKey: 'totalventa' },
    { header: 'Total Cobrado', dataKey: 'totalcobrado' },
    { header: 'Saldo', dataKey: 'saldo' },
    { header: 'Total Atrasado', dataKey: 'totalatrasado' },
    { header: 'Total Anulado', dataKey: 'totalanulado' },

    { header: 'Mora Días', dataKey: 'moradias' },
    { header: 'Estado', dataKey: 'estado' },
  ]
  console.log(reportData)
  // Mapeo de datos
  const datos = reportData.map((row) => ({
    idventa: row.idventa,
    idcredito: row.idcredito,
    idcliente: row.idcliente,
    numero: row.numero,
    fechaventa: row.fechaventa,
    razonsocial: row.razonsocial,
    sucursal: row.sucursal,
    fechalimite: row.fechalimite,
    ncuotas: row.ncuotas,
    cuotasprocesadas: row.cuotasprocesadas,
    valorcuotas: row.valorcuotas,
    totalventa: row.totalventa,
    totalcobrado: row.totalcobrado,
    saldo: row.saldo,
    totalatrasado: row.totalatrasado,
    totalanulado: row.totalanulado,
    moradias: row.moradias,
    estado: getEstadoText(row.estado),
    idalmacen: row.idalmacen,
    montoventa: row.montoventa,
    cuotaspagadas: row.cuotaspagadas,
    idsucursal: row.idsucursal,
  }))

  const columnStyles = {
    numero: { cellWidth: 10, halign: 'center' },
    fechaventa: { cellWidth: 20, halign: 'left', angle: 45 },
    razonsocial: { cellWidth: 25, halign: 'left' },
    sucursal: { cellWidth: 25, halign: 'left' },
    fechalimite: { cellWidth: 20, halign: 'left' },
    ncuotas: { cellWidth: 15, halign: 'right' },
    cuotasprocesadas: { cellWidth: 25, halign: 'right' },
    valorcuotas: { cellWidth: 18, halign: 'right' },
    totalventa: { cellWidth: 18, halign: 'right' },
    totalcobrado: { cellWidth: 18, halign: 'right' },
    saldo: { cellWidth: 18, halign: 'right' },
    totalatrasado: { cellWidth: 18, halign: 'right' },
    totalanulado: { cellWidth: 18, halign: 'right' },

    moradias: { cellWidth: 15, halign: 'right' },
    estado: { cellWidth: 15, halign: 'right' },
  }

  //   ,angle: 90, valign: 'middle'
  const headerColumnStyles = {
    numero: { cellWidth: 10, halign: 'center', angle: 45, valign: 'middle' },
    fechaventa: { cellWidth: 20, halign: 'left', angle: 90, valign: 'middle' },
    razonsocial: { cellWidth: 25, halign: 'left', angle: 90, valign: 'middle' },
    sucursal: { cellWidth: 25, halign: 'left', angle: 90, valign: 'middle' },
    fechalimite: { cellWidth: 20, halign: 'left', angle: 90, valign: 'middle' },
    ncuotas: { cellWidth: 15, halign: 'right', angle: 90, valign: 'middle' },
    cuotasprocesadas: { cellWidth: 25, halign: 'right', angle: 90, valign: 'middle' },
    valorcuotas: { cellWidth: 18, halign: 'right', angle: 45, valign: 'middle' },
    totalventa: { cellWidth: 18, halign: 'right', angle: 90, valign: 'middle' },
    totalcobrado: { cellWidth: 18, halign: 'right', angle: 90, valign: 'middle' },
    saldo: { cellWidth: 18, halign: 'right', angle: 90, valign: 'middle' },
    totalatrasado: { cellWidth: 18, halign: 'right', angle: 90, valign: 'middle' },
    totalanulado: { cellWidth: 18, halign: 'right', angle: 90, valign: 'middle' },

    moradias: { cellWidth: 15, halign: 'right', angle: 90, valign: 'middle' },
    estado: { cellWidth: 15, halign: 'right', angle: 90, valign: 'middle' },
  }

  let filtrosText = ''
  if (clienteSeleccionado) {
    filtrosText += `Cliente: ${clienteSeleccionado.nombre} `
  }
  if (sucursalSeleccionada) {
    filtrosText += `Sucursal: ${sucursalSeleccionada.nombre}`
  }
  const Izquierda = {
    titulo: 'DATOS DEL CLIENTE',
    campos: [
      {
        label: 'Filtros',
        valor: filtrosText || 'Todos los Clientes',
      },
    ],
  }

  const fechas = {
    inicio: startDate,

    final: endDate,
  }
  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE DE CRÉDITOS',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    null,
    true,
    fechas,
    null,
  )
  return doc
}

export function PDFreporteStockProductosIndividual(processedRows) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Fecha Registro', dataKey: 'fecha' },
    { header: 'Almacén', dataKey: 'almacen' },
    { header: 'Código', dataKey: 'codigo' },
    { header: 'Producto', dataKey: 'producto' },
    { header: 'Categoría', dataKey: 'categoria' },
    { header: 'Sub Categoría', dataKey: 'subcategoria' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Unidad', dataKey: 'unidad' },
    { header: 'Stock', dataKey: 'stock' },
    { header: 'Costo total', dataKey: 'costo' },
  ]

  const datos = processedRows.value.map((item, indice) => ({
    indice: indice + 1,
    fecha: cambiarFormatoFecha(item.fecha),
    almacen: item.almacen,
    codigo: item.codigo,
    producto: item.producto,
    categoria: item.categoria,
    subcategoria: item.subcategoria,
    descripcion: item.descripcion,
    unidad: item.unidad,
    stock: item.stock,
    costo: decimas(redondear(parseFloat(item.costounitario) * parseFloat(item.stock))),
  }))
  const totalstock = processedRows.value.reduce(
    (sum, dato) => sum + redondear(parseFloat(dato.stock)),
    0,
  )

  const costoTotal = processedRows.value.reduce(
    (sum, dato) => sum + redondear(parseFloat(dato.stock) * parseFloat(dato.costounitario)),
    0,
  )

  datos.push({ unidad: 'Total:', stock: totalstock, costo: decimas(costoTotal) })

  const columnStyles = {
    indice: { cellWidth: 10, halign: 'center' },
    fecha: { cellWidth: 20, halign: 'center' },
    almacen: { cellWidth: 15, halign: 'left' },
    codigo: { cellWidth: 15, halign: 'left' },
    producto: { cellWidth: 25, halign: 'left' },
    categoria: { cellWidth: 15, halign: 'left' },
    subcategoria: { cellWidth: 15, halign: 'left' },
    descripcion: { cellWidth: 30, halign: 'left' },
    unidad: { cellWidth: 15, halign: 'center' },
    stock: { cellWidth: 15, halign: 'right' },
    costo: { cellWidth: 15, halign: 'right' },
  }
  const headerColumnStyles = {
    indice: { cellWidth: 10, halign: 'center' },
    fecha: { cellWidth: 20, halign: 'center' },
    almacen: { cellWidth: 15, halign: 'left' },
    codigo: { cellWidth: 15, halign: 'left' },
    producto: { cellWidth: 25, halign: 'left' },
    categoria: { cellWidth: 15, halign: 'left' },
    subcategoria: { cellWidth: 15, halign: 'left' },
    descripcion: { cellWidth: 30, halign: 'left' },
    unidad: { cellWidth: 15, halign: 'center' },
    stock: { cellWidth: 15, halign: 'right' },
    costo: { cellWidth: 15, halign: 'right' },
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE PRODUCTOS STOCK INDIVIDUAL',
    columnStyles,
    headerColumnStyles,
    null,
    null,
    true,
    null,
    null,
  )

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  return doc
}

export function PDFreporteStockProductosIndividual_img(processedRows) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Código', dataKey: 'codigo' },
    { header: 'Producto', dataKey: 'producto' },
    { header: 'Categoría', dataKey: 'categoria' },
    { header: 'Sub Categoría', dataKey: 'subcategoria' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Unidad', dataKey: 'unidad' },
    { header: 'Stock', dataKey: 'stock' },
    { header: 'Costo total', dataKey: 'costo' },
    { header: 'Imagen', dataKey: 'imagen' },
  ]

  const datos = processedRows.value.map((item, indice) => ({
    indice: indice + 1,
    codigo: item.codigo,
    producto: item.producto,
    categoria: item.categoria,
    subcategoria: item.subcategoria,
    descripcion: item.descripcion,
    unidad: item.unidad,
    stock: item.stock,
    costo: decimas(redondear(parseFloat(item.costounitario) * parseFloat(item.stock))),
    imagen: getComercialImagenProducto(item.imagen), // Handle cases where image might be missing
  }))

  console.log(datos)
  const totalstock = processedRows.value.reduce(
    (sum, dato) => sum + redondear(parseFloat(dato.stock)),
    0,
  )

  const costoTotal = processedRows.value.reduce(
    (sum, dato) => sum + redondear(parseFloat(dato.stock) * parseFloat(dato.costounitario)),
    0,
  )
  datos.push({
    indice: '',
    codigo: '',
    producto: '',
    categoria: '',
    subcategoria: '',
    descripcion: '',
    unidad: 'Total:',
    stock: totalstock,
    costo: decimas(costoTotal),
    imagen: '',
  })

  const columnStyles = {
    indice: { cellWidth: 12, halign: 'center' },
    codigo: { cellWidth: 30, halign: 'left' },
    producto: { cellWidth: 30, halign: 'left' },
    categoria: { cellWidth: 35, halign: 'left' },
    subcategoria: { cellWidth: 30, halign: 'left' },
    descripcion: { cellWidth: 50, halign: 'left' },
    unidad: { cellWidth: 20, halign: 'center' },
    stock: { cellWidth: 15, halign: 'right' },
    costo: { cellWidth: 15, halign: 'right' },
    imagen: { cellWidth: 40, halign: 'center' },
  }
  const headerColumnStyles = {
    indice: { cellWidth: 12, halign: 'center' },
    codigo: { cellWidth: 30, halign: 'left' },
    producto: { cellWidth: 30, halign: 'left' },
    categoria: { cellWidth: 35, halign: 'left' },
    subcategoria: { cellWidth: 30, halign: 'left' },
    descripcion: { cellWidth: 50, halign: 'left' },
    unidad: { cellWidth: 20, halign: 'center' },
    stock: { cellWidth: 15, halign: 'right' },
    costo: { cellWidth: 15, halign: 'right' },
    imagen: { cellWidth: 40, halign: 'center' },
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE PRODUCTOS',
    columnStyles,
    headerColumnStyles,
    null,
    null,
    true,
    null,
    null,
  )

  return doc
}

export function generarPdfCotizacion(data) {
  console.log(data)
  const comprobanteData = []
  const cotizacionDetalle = data[0]

  const empresaInfo = cotizacionDetalle.empresa
  const usuarioInfo = cotizacionDetalle.usuario
  const clienteInfo = cotizacionDetalle.cliente
  const cotizacionInfo = cotizacionDetalle.cotizacion
  const divisaCotizacion = cotizacionDetalle.divisa
  console.log(divisaCotizacion.divisa)

  comprobanteData.empresa = {
    nombre: empresaInfo.nombre,
    direccion: empresaInfo.direccion,
    celular: empresaInfo.celular,
    email: empresaInfo.email,
    logoUrl: `.././em/${empresaInfo.logo}`, // Ajusta la URL de la imagen según tu configuración
  }
  comprobanteData.Nro = cotizacionInfo.Nro || '' // Si existe un número de cotización
  comprobanteData.clienteDisplay = `${clienteInfo.cliente} - ${clienteInfo.nombrecomercial} - ${clienteInfo.sucursal}`
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
  const detalleProductos = cotizacionDetalle.detalle.map((item) => {
    const totalProducto = redondear(item.cantidad * item.precio)
    currentSubtotal += totalProducto
    return {
      ...item,
      total: totalProducto,
    }
  })

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
        valor: detallePlano.usuario || 'Todos los Almacenes',
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

  return doc
}

export function PDFfacturaCorreo(detalleVenta) {
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
  const datos = detallePlano[0].detalle[0].map((item, indice) => ({
    indice: indice + 1,
    descripcion: item.descripcion,
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
          detallePlano[0].cliente ||
          '' + ' ' + detallePlano[0].nombrecomercial ||
          '' + ' ' + detallePlano[0].sucursal ||
          '',
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
    descripcionAdicional: 'descripcionAdicional',
    descripcion: 'descripcion',
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
  )

  return doc
}

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
    descripcionAdicional: 'descripcionAdicional',
    descripcion: 'descripcion',
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
  )

  return doc
}

export function PDFreporteVentasPeriodo(filteredCompra, almacen) {
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
  const datos = filteredCompra.value.map((item, indice) => ({
    indice: indice + 1,
    fecha: item.fecha,
    cliente: item.cliente,
    sucursal: item.sucursal,
    tipoventa: item.tipoventa,
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

  datos.push({
    canal: 'Total Sumatorias',
    total: decimas(total),
    descuento: decimas(descuento),
    ventatotal: decimas(total + descuento),
  })
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
    null,
    null,
  )

  return doc
}

export async function PDFenviarFacturaCorreo(
  idcliente,
  detalleVenta,
  $q,
  linkFactPdf = null,
  correo = null,
) {
  const detallePlano = JSON.parse(JSON.stringify(detalleVenta.value))
  let pdfBlob

  // 1️⃣ Obtener documento PDF desde link o generarlo
  if (linkFactPdf) {
    console.log('📎 PDF recibido mediante link:', linkFactPdf)

    const fetchPdf = await fetch(linkFactPdf)
    if (!fetchPdf.ok) throw new Error('No se pudo descargar el PDF')
    pdfBlob = await fetchPdf.blob()
  } else {
    console.log('🧾 Generando PDF desde función PDFfacturaCorreo...')

    const doc = PDFfacturaCorreo(detalleVenta) // jsPDF instance
    pdfBlob = doc.output('blob')
  }

  console.log(linkFactPdf)
  try {
    let clientEmail = correo

    if (clientEmail == null) {
      const response = await api.get(`obtenerEmailCliente/${idcliente}`) // Cambia a tu ruta real
      clientEmail = response.data.email
    }

    if (!clientEmail) {
      $q.notify({
        type: 'negative',
        message: 'No se encontró el email del cliente.',
      })
      return
    }

    console.log(detallePlano[0])
    const formData = new FormData()
    // 'pdf' es el nombre del campo que PHP recibirá ($_FILES['pdf'])
    formData.append('ver', 'enviar_factura_email')
    formData.append('pdf', pdfBlob, `factura-${detallePlano[0].nfactura}.pdf`)
    formData.append('recipientEmail', clientEmail)
    formData.append('invoiceNumber', detallePlano[0].nfactura)
    formData.append('clientName', detallePlano[0].cliente)
    formData.append('nombreEmpresa', nombreEmpresa)
    formData.append('direccionEmpresa', direccionEmpresa)
    formData.append('telefonoEmpresa', telefonoEmpresa)
    formData.append('myEmail', email_emizor)
    formData.append('idempresa', idempresa)
    console.log(email_emizor)
    const emailSendResponse = await api.post('', formData, {
      // Add a timeout property here (e.g., 30 seconds = 30000ms)
      timeout: 30000, // Increase to 30 seconds
      headers: {
        'Content-Type': 'multipart/form-data', // Important for FormData
      },
    })
    console.log(emailSendResponse.data)
    if (emailSendResponse.status === 200) {
      $q.notify({
        type: 'positive',
        message: 'Factura enviada al correo del cliente exitosamente.',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Hubo un error al enviar la factura por correo.',
      })
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo cargar el email del Cliente',
    })
  }
}

export async function PDFenviarComprobanteCorreo(idcliente, data, $q) {
  console.log(data)
  const cotizacionDetalle = data[0]
  const cotizacionInfo = cotizacionDetalle.cotizacion
  const clienteInfo = cotizacionDetalle.cliente

  const doc = generarPdfCotizacion(data)
  try {
    const response = await api.get(`obtenerEmailCliente/${idcliente}`) // Cambia a tu ruta real
    console.log(response.data) // res { email: 'ClienteVarios@one.com' }
    const clientEmail = response.data.email

    if (!clientEmail) {
      $q.notify({
        type: 'negative',
        message: 'No se encontró el email del cliente.',
      })
      return
    }

    const pdfBlob = doc.output('blob')

    const formData = new FormData()
    // 'pdf' es el nombre del campo que PHP recibirá ($_FILES['pdf'])
    formData.append('ver', 'enviar_factura_email')
    formData.append('pdf', pdfBlob, `Comprobante.pdf`)
    formData.append('recipientEmail', clientEmail)
    formData.append('invoiceNumber', cotizacionInfo.nfactura || '')
    formData.append('clientName', clienteInfo.nombrecomercial || '')
    formData.append('nombreEmpresa', nombreEmpresa)
    formData.append('direccionEmpresa', direccionEmpresa)
    formData.append('telefonoEmpresa', telefonoEmpresa)
    formData.append('myEmail', email_emizor)
    formData.append('idempresa', idempresa)
    console.log(email_emizor)
    const emailSendResponse = await api.post('', formData, {
      // Add a timeout property here (e.g., 30 seconds = 30000ms)
      timeout: 30000, // Increase to 30 seconds
      headers: {
        'Content-Type': 'multipart/form-data', // Important for FormData
      },
    })
    console.log(emailSendResponse.data)
    if (emailSendResponse.status === 200) {
      $q.notify({
        type: 'positive',
        message: 'Comprobante enviada al correo del cliente exitosamente.',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Hubo un error al enviar Comproante por correo.',
      })
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo cargar el email del Cliente',
    })
  }
}

export async function PDFdetalleVentaInicio(detalleVenta) {
  console.log(detalleVenta)
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
    { header: 'Precio', dataKey: 'precio' },
    { header: 'Total', dataKey: 'total' },
  ]

  const detallePlano = detalleVenta.value

  // detallePlano[0].detalle[0].map((item) => {
  //   console.log(item)
  // })

  const datos = detallePlano[0].detalle[0].map((item, indice) => ({
    indice: indice + 1,
    descripcion: item.descripcion,
    cantidad: decimas(item.cantidad),
    precio: decimas(item.precio),
    total: decimas(redondear(parseFloat(item.cantidad) * parseFloat(item.precio))),
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
          detallePlano[0].cliente ||
          '' + ' ' + detallePlano[0].nombrecomercial ||
          '' + ' ' + detallePlano[0].sucursal ||
          '',
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
  )

  return doc
}

export async function PDFenviarFacturaCorreoAlInicio(idcliente, detalleVenta, $q) {
  const detallePlano = detalleVenta

  const doc = await PDFdetalleVentaInicio(detalleVenta)
  try {
    const response = await api.get(`obtenerEmailCliente/${idcliente}`) // Cambia a tu ruta real
    console.log(response.data) // res { email: 'ClienteVarios@one.com' }
    const clientEmail = response.data.email

    if (!clientEmail) {
      $q.notify({
        type: 'negative',
        message: 'No se encontró el email del cliente.',
      })
      return
    }

    const pdfBlob = doc.output('blob')

    const formData = new FormData()
    // 'pdf' es el nombre del campo que PHP recibirá ($_FILES['pdf'])
    formData.append('ver', 'enviar_factura_email')
    formData.append('pdf', pdfBlob, `factura-${detallePlano[0].nfactura}.pdf`)
    formData.append('recipientEmail', clientEmail)
    formData.append('invoiceNumber', detallePlano[0].nfactura)
    formData.append('clientName', detallePlano[0].cliente)
    formData.append('nombreEmpresa', nombreEmpresa)
    formData.append('direccionEmpresa', direccionEmpresa)
    formData.append('telefonoEmpresa', telefonoEmpresa)
    formData.append('myEmail', email_emizor)
    formData.append('idempresa', idempresa)
    console.log(email_emizor)
    const emailSendResponse = await api.post('', formData, {
      // Add a timeout property here (e.g., 30 seconds = 30000ms)
      timeout: 30000, // Increase to 30 seconds
      headers: {
        'Content-Type': 'multipart/form-data', // Important for FormData
      },
    })
    console.log(emailSendResponse.data)
    if (emailSendResponse.status === 200) {
      $q.notify({
        type: 'positive',
        message: 'Factura enviada al correo del cliente exitosamente.',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Hubo un error al enviar la factura por correo.',
      })
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo cargar el email del Cliente',
    })
  }
}

export function DPFReporteCotizacion(cotizaciones, almacen) {
  console.log(cotizaciones.value)
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  // Columns for jsPDF-autoTable
  const columns = [
    { header: 'N', dataKey: 'nro' },
    { header: 'Fecha', dataKey: 'fecha' }, // Match actual field names from API
    { header: 'Cliente', dataKey: 'cliente' },
    { header: 'Comercial', dataKey: 'sucursal' },
    { header: 'Monto', dataKey: 'monto' },
    { header: 'Desc.', dataKey: 'descuento' },
    { header: 'Total.', dataKey: 'total_sumatorias' },

    // { header: 'Foto', dataKey: 'foto_detalle_cobro' }, // Images in autoTable are more complex
  ]
  const datos = cotizaciones.value.map((key) => ({
    nro: key.nro,
    fecha: key.fecha,
    cliente: key.cliente,
    sucursal: key.sucursal,
    monto: decimas(parseFloat(key.monto)),
    descuento: decimas(parseFloat(key.descuento)),
    total_sumatorias: decimas(parseFloat(key.total_sumatorias)),
  }))
  // Data for jsPDF-autoTable - map from `reportData.
  // value`

  const cotizaciontotal = datos.reduce((sum, u) => {
    return decimas(parseFloat(sum) + parseFloat(u.monto))
  }, 0)
  console.log(cotizaciontotal)
  const descuento = datos.reduce((sum, u) => {
    return decimas(parseFloat(sum) + parseFloat(u.descuento))
  }, 0)
  const total = datos.reduce((sum, u) => {
    return decimas(parseFloat(sum) + parseFloat(u.total_sumatorias))
  }, 0)

  console.log(total)
  const pieTable = {
    sucursal: 'Total:',
    monto: cotizaciontotal,
    descuento: descuento,
    total_sumatorias: total,
  }
  datos.push(pieTable)
  console.log(datos)

  const columnStyles = {
    nro: { cellWidth: 15, halign: 'center' }, // Adjusted width
    fecha: { cellWidth: 20, halign: 'left' },
    cliente: { cellWidth: 50, halign: 'left' },
    sucursal: { cellWidth: 50, halign: 'left' },
    monto: { cellWidth: 20, halign: 'right' },

    descuento: { cellWidth: 20, halign: 'right' },
    total_sumatorias: { cellWidth: 20, halign: 'right' },
  }
  const headerColumnStyles = {
    nro: { cellWidth: 15, halign: 'center' }, // Adjusted width
    fecha: { cellWidth: 20, halign: 'left' },
    cliente: { cellWidth: 50, halign: 'left' },
    sucursal: { cellWidth: 50, halign: 'left' },
    monto: { cellWidth: 20, halign: 'right' },
    descuento: { cellWidth: 20, halign: 'right' },

    total_sumatorias: { cellWidth: 20, halign: 'right' },
  }
  const Izquierda = {
    titulo: 'DATOS REPORTE',
    campos: [
      {
        label: 'Almacén',
        valor: almacen.almacen || 'Todos los Almacenes',
      },
    ],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE COTIZACIONES',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    null,
    true,
    null,
  )

  return doc
}

export function PDFConprovanteCotizacion(cotizacion) {
  console.log(cotizacion[0].detalle)
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  return doc
}

export function PDFextrabiosRobos(extravios, almacen) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  // Columns for jsPDF-autoTable
  const columns = [
    { header: 'N', dataKey: 'nro' },
    { header: 'Fecha', dataKey: 'fecha' }, // Match actual field names from API
    { header: 'Almacén', dataKey: 'almacen' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Estado', dataKey: 'autorizacion' },

    // { header: 'Foto', dataKey: 'foto_detalle_cobro' }, // Images in autoTable are more complex
  ]
  const datos = extravios.value.map((key, index) => ({
    nro: index + 1,
    fecha: cambiarFormatoFecha(key.fecha),
    almacen: key.almacen,
    descripcion: key.descripcion,
    autorizacion: Number(key.autorizacion) === 1 ? 'Autorizado' : 'No Autorizado',
  }))

  const columnStyles = {
    nro: { cellWidth: 15, halign: 'center' }, // Adjusted width
    fecha: { cellWidth: 30, halign: 'center' },
    almacen: { cellWidth: 50, halign: 'left' },
    descripcion: { cellWidth: 75, halign: 'left' },
    autorizacion: { cellWidth: 25, halign: 'left' },
  }
  const headerColumnStyles = {
    nro: { cellWidth: 15, halign: 'center' }, // Adjusted width
    fecha: { cellWidth: 30, halign: 'center' },
    almacen: { cellWidth: 50, halign: 'left' },
    descripcion: { cellWidth: 75, halign: 'left' },
    autorizacion: { cellWidth: 25, halign: 'left' },
  }

  const Izquierda = {
    titulo: 'DATOS REPORTE',
    campos: [
      {
        label: 'Almacén',
        valor: almacen.label || 'Todos los Almacenes',
      },
    ],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE DE EXTRAVIO',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    null,
    true,
    null,
  )

  // Set the PDF data URL and show the modal didParseCell
  return doc
}

export function PDFComprovanteExtravio(detalleExtravio, robo) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Codigo', dataKey: 'codigo' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
  ]

  const datos = detalleExtravio.map((item, indice) => ({
    indice: indice + 1,
    ...item,
  }))
  const columnStyles = {
    indice: { cellWidth: 15, halign: 'center' },
    codigo: { cellWidth: 50, halign: 'left' },
    descripcion: { cellWidth: 70, halign: 'left' },
    cantidad: { cellWidth: 60, halign: 'right' },
  }
  const headerColumnStyles = {
    indice: { cellWidth: 15, halign: 'center' },
    codigo: { cellWidth: 50, halign: 'left' },
    descripcion: { cellWidth: 70, halign: 'left' },
    cantidad: { cellWidth: 60, halign: 'right' },
  }

  const Izquierda = {
    titulo: 'DATOS MERMA',
    campos: [
      {
        label: 'Almacén',
        valor: robo.almacen || 'Todos los Almacenes',
      },
      {
        label: 'Fecha de Registro',
        valor: cambiarFormatoFecha(robo.fecha) || '',
      },
      {
        label: 'Almacén',
        valor: (robo.autorizacion == 1 ? 'Autorizado' : 'No Autorizado') || '',
      },
    ],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'COMPROBANTE DE EXTRAVIO',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    null,
    true,
    null,
  )

  return doc
}

export function PDFreporteMermas(mermas, almacen) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  // Columns for jsPDF-autoTable
  const columns = [
    { header: 'N', dataKey: 'nro' },
    { header: 'Fecha', dataKey: 'fecha' }, // Match actual field names from API
    { header: 'Almacén', dataKey: 'almacen' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Estado', dataKey: 'autorizacion' },

    // { header: 'Foto', dataKey: 'foto_detalle_cobro' }, // Images in autoTable are more complex
  ]
  const datos = mermas.value.map((key, index) => ({
    nro: index + 1,
    fecha: cambiarFormatoFecha(key.fecha),
    almacen: key.almacen,
    descripcion: key.descripcion,
    autorizacion: Number(key.autorizacion) === 1 ? 'Autorizado' : 'No Autorizado',
  }))

  const columnStyles = {
    nro: { cellWidth: 15, halign: 'center' }, // Adjusted width
    fecha: { cellWidth: 30, halign: 'center' },
    almacen: { cellWidth: 50, halign: 'left' },
    descripcion: { cellWidth: 75, halign: 'left' },
    autorizacion: { cellWidth: 25, halign: 'left' },
  }
  const headerColumnStyles = {
    nro: { cellWidth: 15, halign: 'center' }, // Adjusted width
    fecha: { cellWidth: 30, halign: 'center' },
    almacen: { cellWidth: 50, halign: 'left' },
    descripcion: { cellWidth: 75, halign: 'left' },
    autorizacion: { cellWidth: 25, halign: 'left' },
  }

  const Izquierda = {
    titulo: 'DATOS DEL REPORTE',
    campos: [
      {
        label: 'Almacén',
        valor: almacen.label || 'Todos los Almacenes',
      },
    ],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE DE MERMAS',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    null,
    true,
    null,
  )

  // Set the PDF data URL and show the modal didParseCell
  return doc
}

export function PDFComprovanteMerma(detallemerma, merma) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Codigo', dataKey: 'codigo' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
  ]

  const datos = detallemerma.map((item, indice) => ({
    indice: indice + 1,
    ...item,
  }))

  const columnStyles = {
    indice: { cellWidth: 15, halign: 'center' },
    codigo: { cellWidth: 50, halign: 'left' },
    descripcion: { cellWidth: 70, halign: 'left' },
    cantidad: { cellWidth: 60, halign: 'right' },
  }
  const headerColumnStyles = {
    indice: { cellWidth: 15, halign: 'center' },
    codigo: { cellWidth: 50, halign: 'left' },
    descripcion: { cellWidth: 70, halign: 'left' },
    cantidad: { cellWidth: 60, halign: 'right' },
  }

  const Izquierda = {
    titulo: 'DATOS DEL REPORTE',
    campos: [
      {
        label: 'Almacén',
        valor: merma.almacen || 'Todos los Almacenes',
      },
      {
        label: 'Fecha de Registro',
        valor: merma.fecha || '-',
      },
      {
        label: 'Estado',
        valor: (merma.autorizacion == 1 ? 'Autorizado' : 'No Autorizado') || '',
      },
    ],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'COMPROBANTE DE MERMA',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    null,
    true,
    null,
  )

  return doc
}

export function PDFKardex(kardex, almacenLabel, productoLabel, fechaiR, fechafR) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const columns = [
    { header: 'N', dataKey: 'c' },
    { header: 'Fecha', dataKey: 'Fecha' },
    { header: 'Concepto', dataKey: 'Concepto' },
    { header: 'Entrada', dataKey: 'Entrada' },
    { header: 'Salida', dataKey: 'Salida' },
    { header: 'Existencia', dataKey: 'Existencia' },
    { header: 'C.Unit', dataKey: 'costouniario' },
    { header: 'Debe', dataKey: 'Debe' },
    { header: 'Haber', dataKey: 'Haber' },
    { header: 'Saldo', dataKey: 'Saldo' },
  ]
  // filteredCompra.value.reduce((sum, row) => sum + Number(row.total), 0)
  const datos = kardex.map((item, index) => ({
    c: index + 1,
    Fecha: cambiarFormatoFecha(item.Fecha),
    Concepto: item.Concepto,
    Entrada: item.Entrada,
    Salida: item.Salida,
    Existencia: item.Existencia,
    costouniario: divisaActiva + ' ' + parseFloat(item['C.Unit']).toFixed(2),
    Debe: divisaActiva + ' ' + parseFloat(item.Debe).toFixed(2),
    Haber: divisaActiva + ' ' + parseFloat(item.Haber).toFixed(2),
    Saldo: divisaActiva + ' ' + parseFloat(item.Saldo).toFixed(2),
  }))

  const columnStyles = {
    c: { cellWidth: 10, halign: 'center' },
    Fecha: { cellWidth: 20, halign: 'center' },
    Concepto: { cellWidth: 25, halign: 'left' },
    Entrada: { cellWidth: 15, halign: 'right' },
    Salida: { cellWidth: 15, halign: 'right' },
    Existencia: { cellWidth: 20, halign: 'right' },
    costouniario: { cellWidth: 20, halign: 'right' },
    Debe: { cellWidth: 20, halign: 'right' },
    Haber: { cellWidth: 25, halign: 'right' },
    Saldo: { cellWidth: 25, halign: 'right' },
  }
  const headerColumnStyles = {
    c: { cellWidth: 10, halign: 'center' },
    Fecha: { cellWidth: 20, halign: 'center' },
    Concepto: { cellWidth: 25, halign: 'left' },
    Entrada: { cellWidth: 15, halign: 'right' },
    Salida: { cellWidth: 15, halign: 'right' },
    Existencia: { cellWidth: 20, halign: 'right' },
    costouniario: { cellWidth: 20, halign: 'right' },
    Debe: { cellWidth: 20, halign: 'right' },
    Haber: { cellWidth: 25, halign: 'right' },
    Saldo: { cellWidth: 25, halign: 'right' },
  }

  const Izquierda = {
    titulo: 'DATOS DEL REPORTE',
    campos: [
      {
        label: 'Almacén',
        valor: almacenLabel || 'Todos los Almacenes',
      },
      {
        label: 'Producto',
        valor: productoLabel || '',
      },
    ],
  }

  const fechas = {
    inicio: fechaiR,

    final: fechafR,
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE KARDEX',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    null,
    true,
    fechas,
  )
  return doc
}

export function PDFCierreCaja(datosCierreCaja) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  // === Información del Encabezado ===
  if (logoBase64) {
    const pageWidth = doc.internal.pageSize.getWidth()
    const imgWidth = 20
    const imgHeight = 20
    const xPos = pageWidth - imgWidth - 10
    const yPos = 5
    doc.addImage(logoBase64, 'JPEG', xPos, yPos, imgWidth, imgHeight)
  }
  doc.setFontSize(7)
  doc.setFont(undefined, 'bold')
  doc.text(nombreEmpresa, 5, 10)
  doc.setFontSize(6)
  doc.setFont(undefined, 'normal')
  doc.text(direccionEmpresa, 5, 13)
  doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

  doc.setFontSize(10)
  doc.setFont(undefined, 'bold')
  doc.text('CIERRE PUNTO VENTA', doc.internal.pageSize.getWidth() / 2, 15, {
    align: 'center',
  })
  doc.setFontSize(6)
  doc.setFont(undefined, 'normal')
  doc.text('Creado ' + datosCierreCaja.creado_en, doc.internal.pageSize.getWidth() / 2, 18, {
    align: 'center',
  })

  doc.setDrawColor(0)
  doc.setLineWidth(0.2)
  doc.line(5, 30, 200, 30)

  doc.setFontSize(7)
  doc.setFont(undefined, 'bold')
  doc.text('DATOS DEL REPORTE', 5, 35)
  doc.setFontSize(6)
  doc.setFont(undefined, 'normal')
  doc.text('Fecha Apertura : ' + datosCierreCaja.fecha_inicio, 5, 38)
  doc.text('Fecha Cierre : ' + datosCierreCaja.fecha_fin, 5, 41)
  doc.text('Punto de Venta: ' + datosCierreCaja.punto_venta, 5, 44)
  doc.text('Fecha de Impresión: ' + cambiarFormatoFecha(obtenerFechaActualDato()), 5, 47)

  doc.setFontSize(7)
  doc.setFont(undefined, 'bold')
  doc.text('DATOS DEL ENCARGADO:', 200, 35, { align: 'right' })
  doc.setFontSize(6)
  doc.setFont(undefined, 'normal')
  doc.text(encargadoNombre, 200, 38, { align: 'right' })
  doc.text(cargo, 200, 41, { align: 'right' })

  // === TABLA 1: Conceptos ===
  const conceptos = datosCierreCaja.conceptos.map((item) => ({
    concepto: item.concepto,
    sistema: item.sistema,
    contado: item.contado,
    diferencia: item.diferencia,
  }))

  autoTable(doc, {
    head: [['', 'Según Sistema', 'Según Arqueo', 'Diferencia']],
    body: conceptos.map((c) => [c.concepto, c.sistema, c.contado, c.diferencia]),
    startY: 55,
    margin: { horizontal: 5 },
    theme: 'striped',
    styles: { fontSize: 7, cellPadding: 2, halign: 'right' },
    headStyles: { fillColor: [128, 128, 128], textColor: 255, halign: 'center' },
    columnStyles: {
      0: { halign: 'left' },
    },
  })

  // === TABLA 2: Métodos de Pago ===
  const metodos = datosCierreCaja.metodos_pago.map((m) => ({
    metodo: m.metodo + ' (' + m.tipo + ')',
    sistema: m.total_sistema,
    contado: m.total_contado,
    diferencia: m.diferencia,
  }))

  autoTable(doc, {
    head: [['Método', 'Total Sistema', 'Total Contado', 'Diferencia']],
    body: metodos.map((m) => [m.metodo, m.sistema, m.contado, m.diferencia]),
    startY: doc.lastAutoTable.finalY + 10,
    margin: { horizontal: 5 },
    theme: 'striped',
    styles: { fontSize: 7, cellPadding: 2, halign: 'right' },
    headStyles: { fillColor: [128, 128, 128], textColor: 255, halign: 'center' },
    columnStyles: {
      0: { halign: 'left' },
    },
  })

  // === TABLA 3: Arqueo Físico ===
  const arqueo = datosCierreCaja.arqueo_fisico.map((a) => {
    const subtotal = (parseFloat(a.valor_moneda) * parseInt(a.cantidad || 0)).toFixed(2)
    return {
      label: a.label,
      valor: a.valor_moneda,
      cantidad: a.cantidad,
      subtotal: subtotal,
    }
  })

  autoTable(doc, {
    head: [['Denominación', 'Valor', 'Cantidad', 'Subtotal']],
    body: arqueo.map((a) => [a.label, a.valor, a.cantidad, a.subtotal]),
    startY: doc.lastAutoTable.finalY + 10,
    margin: { horizontal: 5 },
    theme: 'striped',
    styles: { fontSize: 7, cellPadding: 2, halign: 'right' },
    headStyles: { fillColor: [128, 128, 128], textColor: 255, halign: 'center' },
    columnStyles: {
      0: { halign: 'left' },
    },
  })

  // === TABLA 4: Totales ===
  const totalConceptos = datosCierreCaja.conceptos.reduce(
    (acc, item) => acc + parseFloat(item.diferencia),
    0,
  )
  const totalMetodosPago = datosCierreCaja.metodos_pago.reduce(
    (acc, item) => acc + parseFloat(item.diferencia),
    0,
  )
  const totalArqueoFisico = datosCierreCaja.arqueo_fisico.reduce(
    (acc, item) => acc + parseFloat(item.cantidad * item.valor_moneda),
    0,
  )

  const totales = [
    ['Total Diferencia Conceptos', '', '', totalConceptos],
    ['Total Diferencia Métodos de Pago', '', '', totalMetodosPago],
    ['Total Arqueo Físico', '', '', totalArqueoFisico],
  ]

  autoTable(doc, {
    head: [['Resumen de Totales', '', '', '']],
    body: totales,
    startY: doc.lastAutoTable.finalY + 10,
    margin: { horizontal: 5 },
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, fontStyle: 'bold', halign: 'right' },
    headStyles: { fillColor: [128, 128, 128], textColor: 255, halign: 'center' },
    columnStyles: {
      0: { halign: 'left' },
    },
  })

  // Observaciones
  const finalY = doc.lastAutoTable.finalY + 5
  doc.setFontSize(8)
  doc.setFont(undefined, 'bold')
  doc.text('Observaciones:', 5, finalY + 5)
  doc.setFontSize(7)
  doc.setFont(undefined, 'normal')
  const splitText = doc.splitTextToSize(datosCierreCaja.observacion || 'Sin observaciones.', 190)
  doc.text(splitText, 5, finalY + 10)

  return doc
}

export function PDFpedidos(ordenados, tipoestados, filtroAlmacen) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const columns = [
    { header: 'N', dataKey: 'indice' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Almacén Destino', dataKey: 'almacen' },
    { header: 'Almacén Origen', dataKey: 'almacenorigen' },

    { header: 'Código', dataKey: 'codigo' },
    { header: 'Nro.Pedido', dataKey: 'nropedido' },
    { header: 'Tipo', dataKey: 'tipopedido' },

    { header: 'Observación', dataKey: 'observacion' },
    { header: 'Autorización', dataKey: 'autorizacion' },
    { header: 'Estado', dataKey: 'estado' },
  ]

  const datos = ordenados.value.map((item, indice) => ({
    indice: indice + 1,
    fecha: cambiarFormatoFecha(item.fecha),
    codigo: item.codigo,
    nropedido: item.nropedido,
    tipopedido: Number(item.tipopedido) === 1 ? 'Pedido Compra' : 'Pedido Movimiento',
    almacenorigen: item.almacenorigen,
    almacen: item.almacen,
    observacion: item.observacion,
    estado: tipoestados[Number(item.estado)],
    autorizacion: item.autorizacion == 2 ? 'No Autorizado' : 'Autorizado',
  }))

  const columnStyles = {
    indice: { cellWidth: 10, halign: 'center' },
    fecha: { cellWidth: 15, halign: 'left' },
    codigo: { cellWidth: 25, halign: 'left' },
    nropedido: { cellWidth: 10, halign: 'center' },
    tipopedido: { cellWidth: 25, halign: 'left' },
    almacenorigen: { cellWidth: 20, halign: 'left' },
    almacen: { cellWidth: 20, halign: 'left' },
    observacion: { cellWidth: 30, halign: 'left' },
    estado: { cellWidth: 20, halign: 'left' },
    autorizacion: { cellWidth: 20, halign: 'left' },
  }
  const headerColumnStyles = {
    indice: { cellWidth: 10, halign: 'center' },
    fecha: { cellWidth: 15, halign: 'left' },
    codigo: { cellWidth: 25, halign: 'left' },
    nropedido: { cellWidth: 10, halign: 'center' },
    tipopedido: { cellWidth: 25, halign: 'left' },
    almacenorigen: { cellWidth: 20, halign: 'left' },
    almacen: { cellWidth: 20, halign: 'left' },
    observacion: { cellWidth: 30, halign: 'left' },
    estado: { cellWidth: 20, halign: 'left' },
    autorizacion: { cellWidth: 20, halign: 'left' },
  }

  const almacen = filtroAlmacen.value
  const Izquierda = {
    titulo: 'DATOS DEL REPORTE',
    campos: [
      {
        label: 'Almacén',
        valor: almacen.label || 'Todos los Almacenes',
      },
    ],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'PEDIDOS',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    null,
    true,
    null,
  )
  return doc
}

export function PDFalmacenes(props) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Nombre', dataKey: 'nombre' },
    { header: 'Codigo', dataKey: 'codigo' },
    { header: 'Dirección', dataKey: 'direccion' },
    { header: 'Tipo almacén', dataKey: 'tipoalmacen' },
    { header: 'Stock min', dataKey: 'stockmin' },
    { header: 'Stock max', dataKey: 'stockmax' },
    { header: 'Sucursal', dataKey: 'sucursal' },
    { header: 'Estado', dataKey: 'estado' },
  ]

  const datos = props.rows.map((item, indice) => ({
    indice: indice + 1,
    nombre: item.nombre,
    codigo: item.codigo,
    direccion: item.direccion,
    tipoalmacen: item.tipoalmacen,
    stockmin: item.stockmin,
    stockmax: item.stockmax,
    sucursal: item.sucursales?.[0]?.nombre || '-', // en caso de tener relación
    estado: Number(item.estado) === 1 ? 'Activo' : 'Inactivo',
  }))

  const columnStyles = {
    indice: { cellWidth: 10, halign: 'center' },
    nombre: { cellWidth: 25, halign: 'left' },
    codigo: { cellWidth: 15, halign: 'left' },
    direccion: { cellWidth: 45, halign: 'left' },
    tipoalmacen: { cellWidth: 20, halign: 'left' },
    stockmin: { cellWidth: 15, halign: 'right' },
    stockmax: { cellWidth: 15, halign: 'right' },
    sucursal: { cellWidth: 35, halign: 'left' },
    estado: { cellWidth: 15, halign: 'left' },
  }
  const headerColumnStyles = {
    indice: { cellWidth: 10, halign: 'center' },
    nombre: { cellWidth: 25, halign: 'left' },
    codigo: { cellWidth: 15, halign: 'left' },
    direccion: { cellWidth: 45, halign: 'left' },
    tipoalmacen: { cellWidth: 20, halign: 'left' },
    stockmin: { cellWidth: 15, halign: 'right' },
    stockmax: { cellWidth: 15, halign: 'right' },
    sucursal: { cellWidth: 35, halign: 'left' },
    estado: { cellWidth: 15, halign: 'left' },
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'ALMACENES',
    columnStyles,
    headerColumnStyles,
    null,
    null,
    true,
    null,
  )

  return doc
}
export function PDF_REPORTE_DE_ROTACION_POR_ALMACEN(reporte, datosFormulario) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const columns = [
    { header: 'N°', dataKey: 'index' },
    { header: 'Codigo', dataKey: 'codigo' },
    { header: 'Producto', dataKey: 'producto' },
    { header: 'Categoría', dataKey: 'categoria' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Unidad', dataKey: 'unidad' },
    { header: 'Cant. Ventas', dataKey: 'cantidadventas' },
    { header: 'Inv. Externo', dataKey: 'cantidadIE' },
    { header: 'Rotación', dataKey: 'r' },
  ]

  const datos = reporte.map((item) => ({
    index: item.index,
    codigo: item.codigo,
    producto: item.producto,
    categoria: item.categoria,
    descripcion: item.descripcion,
    unidad: item.unidad,
    cantidadventas: item.cantidadventas,
    cantidadIE: item.cantidadIE,
    r: item.r,
  }))

  const columnStyles = {
    index: { cellWidth: 10, halign: 'center' },
    codigo: { cellWidth: 20, halign: 'left' },
    producto: { cellWidth: 30, halign: 'left' },
    categoria: { cellWidth: 20, halign: 'left' },
    descripcion: { cellWidth: 40, halign: 'left' },
    unidad: { cellWidth: 20, halign: 'left' },
    cantidadventas: { cellWidth: 15, halign: 'right' },
    cantidadIE: { cellWidth: 20, halign: 'right' },
    r: { cellWidth: 20, halign: 'right' },
  }
  const headerColumnStyles = {
    index: { cellWidth: 10, halign: 'center' },
    codigo: { cellWidth: 20, halign: 'left' },
    producto: { cellWidth: 30, halign: 'left' },
    categoria: { cellWidth: 20, halign: 'left' },
    descripcion: { cellWidth: 40, halign: 'left' },
    unidad: { cellWidth: 20, halign: 'left' },
    cantidadventas: { cellWidth: 15, halign: 'right' },
    cantidadIE: { cellWidth: 20, halign: 'right' },
    r: { cellWidth: 20, halign: 'right' },
  }

  const Izquierda = {
    titulo: 'DATOS DEL REPORTE',
    campos: [
      {
        label: 'Almacén',
        valor: datosFormulario.almacen || '',
      },
    ],
  }
  const fechas = {
    inicio: datosFormulario.fechaInicio,

    final: datosFormulario.fechaFin,
  }
  const derecho = {
    titulo: 'DATOS DEL ENCARGADO',
    campos: [
      { label: '', valor: datosFormulario.usuario.nombre },
      { label: '', valor: datosFormulario.usuario.cargo },
    ],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE DE INDICE DE ROTACION POR ALMACEN',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    derecho,
    false,
    fechas,
  )

  return doc
}

export function PDF_REPORTE_DE_ROTACION_POR_CLIENTE(reporte, datosFormulario) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  const columns = [
    { header: 'N°', dataKey: 'index' },
    { header: 'Codigo', dataKey: 'codigo' },
    { header: 'Producto', dataKey: 'producto' },
    { header: 'Categoría', dataKey: 'categoria' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Unidad', dataKey: 'unidad' },
    { header: 'Cant. Ventas', dataKey: 'cantidadventas' },
    { header: 'Inv. Externo', dataKey: 'cantidadIE' },
    { header: 'Rotación', dataKey: 'r' },
  ]

  const datos = reporte.map((item) => ({
    index: item.index,
    codigo: item.codigo,
    producto: item.producto,
    categoria: item.categoria,
    descripcion: item.descripcion,
    unidad: item.unidad,
    cantidadventas: item.cantidadventas,
    cantidadIE: item.cantidadIE,
    r: item.r,
  }))

  const columnStyles = {
    index: { cellWidth: 10, halign: 'center' },
    codigo: { cellWidth: 20, halign: 'left' },
    producto: { cellWidth: 30, halign: 'left' },
    categoria: { cellWidth: 20, halign: 'left' },
    descripcion: { cellWidth: 40, halign: 'left' },
    unidad: { cellWidth: 20, halign: 'left' },
    cantidadventas: { cellWidth: 15, halign: 'right' },
    cantidadIE: { cellWidth: 20, halign: 'right' },
    r: { cellWidth: 20, halign: 'right' },
  }
  const headerColumnStyles = {
    index: { cellWidth: 10, halign: 'center' },
    codigo: { cellWidth: 20, halign: 'left' },
    producto: { cellWidth: 30, halign: 'left' },
    categoria: { cellWidth: 20, halign: 'left' },
    descripcion: { cellWidth: 40, halign: 'left' },
    unidad: { cellWidth: 20, halign: 'left' },
    cantidadventas: { cellWidth: 15, halign: 'right' },
    cantidadIE: { cellWidth: 20, halign: 'right' },
    r: { cellWidth: 20, halign: 'right' },
  }

  const cliente = datosFormulario.cliente + ' / ' + datosFormulario.sucursal
  const Izquierda = {
    titulo: 'DATOS DEL REPORTE',
    campos: [
      {
        label: 'Razon Social: ',
        valor: cliente || '',
      },
    ],
  }
  const fechas = {
    inicio: datosFormulario.fechaInicio,

    final: datosFormulario.fechaFin,
  }
  const derecho = {
    titulo: 'DATOS DEL ENCARGADO',
    campos: [
      { label: '', valor: datosFormulario.usuario.nombre },
      { label: '', valor: datosFormulario.usuario.cargo },
    ],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE DE INDICE DE ROTACION POR CLIENTE',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    derecho,
    false,
    fechas,
  )

  return doc
}

export function PDF_REPORTE_DE_ROTACION_POR_GLOBAL(reporte, datosFormulario) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const columns = [
    { header: 'N°', dataKey: 'index' },
    { header: 'Codigo', dataKey: 'codigo' },
    { header: 'Producto', dataKey: 'producto' },
    { header: 'Categoría', dataKey: 'categoria' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Unidad', dataKey: 'unidad' },
    { header: 'Cant. Ventas', dataKey: 'cantidadventas' },
    { header: 'Inv. Externo', dataKey: 'cantidadIE' },
    { header: 'Rotación', dataKey: 'r' },
  ]

  const datos = reporte.map((item) => ({
    index: item.index,
    codigo: item.codigo,
    producto: item.producto,
    categoria: item.categoria,
    descripcion: item.descripcion,
    unidad: item.unidad,
    cantidadventas: item.cantidadventas,
    cantidadIE: item.cantidadIE,
    r: item.r,
  }))

  const columnStyles = {
    index: { cellWidth: 10, halign: 'center' },
    codigo: { cellWidth: 20, halign: 'left' },
    producto: { cellWidth: 30, halign: 'left' },
    categoria: { cellWidth: 20, halign: 'left' },
    descripcion: { cellWidth: 40, halign: 'left' },
    unidad: { cellWidth: 20, halign: 'left' },
    cantidadventas: { cellWidth: 15, halign: 'right' },
    cantidadIE: { cellWidth: 20, halign: 'right' },
    r: { cellWidth: 20, halign: 'right' },
  }
  const headerColumnStyles = {
    index: { cellWidth: 10, halign: 'center' },
    codigo: { cellWidth: 20, halign: 'left' },
    producto: { cellWidth: 30, halign: 'left' },
    categoria: { cellWidth: 20, halign: 'left' },
    descripcion: { cellWidth: 40, halign: 'left' },
    unidad: { cellWidth: 20, halign: 'left' },
    cantidadventas: { cellWidth: 15, halign: 'right' },
    cantidadIE: { cellWidth: 20, halign: 'right' },
    r: { cellWidth: 20, halign: 'right' },
  }

  const Izquierda = {
    titulo: 'DATOS DEL REPORTE',
    campos: [{ label: 'Almacen', valor: datosFormulario.almacen || '' }],
  }
  const fechas = {
    inicio: datosFormulario.fechaInicio,

    final: datosFormulario.fechaFin,
  }
  const derecho = {
    titulo: 'DATOS DEL ENCARGADO',
    campos: [
      { label: '', valor: datosFormulario.usuario.nombre },
      { label: '', valor: datosFormulario.usuario.cargo },
    ],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE DE INDICE DE ROTACION GLOBAL',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    derecho,
    false,
    fechas,
  )

  return doc
}
export function PDF_REPORTE_CAMPANAS(reporte, datosFormulario) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  const columns = [
    { header: 'N°', dataKey: 'n' },
    { header: 'Almacén', dataKey: 'almacen' },
    { header: 'Campaña', dataKey: 'nombre' },
    { header: 'Porcentaje', dataKey: 'porcentaje' },
    { header: 'Fecha Inicio', dataKey: 'fechainicio' },
    { header: 'Fecha Final', dataKey: 'fechafinal' },
    { header: 'Estado', dataKey: 'est' },
  ]

  const datos = reporte.map((item) => ({
    n: item.n,
    almacen: item.almacen,
    nombre: item.nombre,
    porcentaje: item.porcentaje,
    fechainicio: item.fechainicio,
    fechafinal: item.fechafinal,
    est: item.est,
  }))

  const columnStyles = {
    n: { cellWidth: 10, halign: 'center' },
    almacen: { cellWidth: 30, halign: 'left' },
    nombre: { cellWidth: 40, halign: 'left' },
    porcentaje: { cellWidth: 30, halign: 'left' },
    fechainicio: { cellWidth: 30, halign: 'left' },
    fechafinal: { cellWidth: 30, halign: 'left' },
    est: { cellWidth: 25, halign: 'right' },
  }
  const headerColumnStyles = {
    n: { cellWidth: 10, halign: 'center' },
    almacen: { cellWidth: 30, halign: 'left' },
    nombre: { cellWidth: 40, halign: 'left' },
    porcentaje: { cellWidth: 30, halign: 'left' },
    fechainicio: { cellWidth: 30, halign: 'left' },
    fechafinal: { cellWidth: 30, halign: 'left' },
    est: { cellWidth: 25, halign: 'right' },
  }

  const Izquierda = {
    titulo: 'DATOS DEL REPORTE',
    campos: [{ label: 'Almacen', valor: datosFormulario.almacen || '' }],
  }
  const fechas = {
    inicio: datosFormulario.fechaInicio,

    final: datosFormulario.fechaFin,
  }
  const derecho = {
    titulo: 'DATOS DEL ENCARGADO',
    campos: [
      { label: '', valor: datosFormulario.usuario.nombre },
      { label: '', valor: datosFormulario.usuario.cargo },
    ],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTES CAMPAÑAS',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    derecho,
    false,
    fechas,
  )

  return doc
}
export function PDF_REPORTE_CAMPANAS_VENTAS(reporte, datosFormulario) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const columns = [
    { header: 'N°', dataKey: 'n' },
    { header: 'Almacén', dataKey: 'almacen' },
    { header: 'Campaña', dataKey: 'nombre' },
    { header: 'Fecha Inicio', dataKey: 'fechainicio' },
    { header: 'Fecha Final', dataKey: 'fechafinal' },
    { header: 'Cantidad de Ventas', dataKey: 'nventas' },
  ]

  const datos = reporte.map((item) => ({
    n: item.n,
    almacen: item.almacen,
    nombre: item.nombre,
    fechainicio: item.fechainicio,
    fechafinal: item.fechafinal,
    nventas: item.nventas,
  }))

  const columnStyles = {
    n: { cellWidth: 10, halign: 'center' },
    almacen: { cellWidth: 40, halign: 'left' },
    nombre: { cellWidth: 40, halign: 'left' },
    fechainicio: { cellWidth: 35, halign: 'left' },
    fechafinal: { cellWidth: 30, halign: 'left' },
    nventas: { cellWidth: 40, halign: 'right' },
  }
  const headerColumnStyles = {
    n: { cellWidth: 10, halign: 'center' },
    almacen: { cellWidth: 40, halign: 'left' },
    nombre: { cellWidth: 40, halign: 'left' },
    fechainicio: { cellWidth: 35, halign: 'left' },
    fechafinal: { cellWidth: 30, halign: 'left' },
    nventas: { cellWidth: 40, halign: 'right' },
  }

  const Izquierda = {
    titulo: 'DATOS DEL REPORTE',
    campos: [{ label: 'Almacen', valor: datosFormulario.almacen || '' }],
  }
  const fechas = {
    inicio: datosFormulario.fechaInicio,

    final: datosFormulario.fechaFin,
  }
  const derecho = {
    titulo: 'DATOS DEL ENCARGADO',
    campos: [
      { label: '', valor: datosFormulario.usuario.nombre },
      { label: '', valor: datosFormulario.usuario.cargo },
    ],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTES CAMPAÑA VENTA',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    derecho,
    false,
    fechas,
  )

  return doc
}
export function PDF_REPORTE_MOVIMIENTOS(reporte, datosFormulario) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  const columns = [
    { header: 'N°', dataKey: 'n' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Almacén Origen', dataKey: 'almacenorigen' },
    { header: 'Almacén Destino', dataKey: 'almacendestino' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Autorizacion', dataKey: 'aut' },
  ]

  const datos = reporte.map((item) => ({
    n: item.n,
    fecha: item.fecha,
    almacenorigen: item.almacenorigen,
    almacendestino: item.almacendestino,
    descripcion: item.descripcion,
    aut: item.aut,
  }))

  const columnStyles = {
    n: { cellWidth: 10, halign: 'center' },
    fecha: { cellWidth: 35, halign: 'left' },
    almacenorigen: { cellWidth: 40, halign: 'left' },
    almacendestino: { cellWidth: 40, halign: 'left' },
    descripcion: { cellWidth: 30, halign: 'left' },
    aut: { cellWidth: 40, halign: 'right' },
  }
  const headerColumnStyles = {
    n: { cellWidth: 10, halign: 'center' },
    fecha: { cellWidth: 35, halign: 'left' },
    almacenorigen: { cellWidth: 40, halign: 'left' },
    almacendestino: { cellWidth: 40, halign: 'left' },
    descripcion: { cellWidth: 30, halign: 'left' },
    aut: { cellWidth: 40, halign: 'right' },
  }

  const Izquierda = {
    titulo: 'DATOS DEL REPORTE',
    campos: [{ label: 'Almacen', valor: datosFormulario.almacen || '' }],
  }
  const fechas = {
    inicio: datosFormulario.fechaInicio,

    final: datosFormulario.fechaFin,
  }
  const derecho = {
    titulo: 'DATOS DEL ENCARGADO',
    campos: [
      { label: '', valor: datosFormulario.usuario.nombre },
      { label: '', valor: datosFormulario.usuario.cargo },
    ],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE MOVIMIENTOS',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    derecho,
    false,
    fechas,
  )

  return doc
}
export function PDF_REPORTE_PEDIDOS(reporte, datosFormulario) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  })

  const columns = [
    { header: 'N°', dataKey: 'n' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Codigo', dataKey: 'codigo' },
    { header: 'Nro.Pedido', dataKey: 'nropedido' },
    { header: 'Tipo', dataKey: 'tipopedido' },
    { header: 'Almacen Origen', dataKey: 'almacenorigen' },
    { header: 'Almacen', dataKey: 'almacen' },
    { header: 'Observación', dataKey: 'observacion' },
    { header: 'Estado', dataKey: 'estado' },
  ]

  const datos = reporte.map((item) => ({
    n: item.n,
    fecha: item.fecha,
    codigo: item.codigo,
    nropedido: item.nropedido,
    tipopedido: item.tipopedido,
    almacenorigen: item.almacenorigen,
    almacen: item.almacen,
    observacion: item.observacion,
    estado: item.estado,
  }))

  const columnStyles = {
    n: { cellWidth: 10, halign: 'center' },
    fecha: { cellWidth: 20, halign: 'left' },
    codigo: { cellWidth: 25, halign: 'left' },
    nropedido: { cellWidth: 15, halign: 'center' },
    tipopedido: { cellWidth: 20, halign: 'left' },
    almacenorigen: { cellWidth: 20, halign: 'left' },
    almacen: { cellWidth: 20, halign: 'left' },
    observacion: { cellWidth: 45, halign: 'left' },
    estado: { cellWidth: 20, halign: 'left' },
  }
  const headerColumnStyles = {
    n: { cellWidth: 10, halign: 'center' },
    fecha: { cellWidth: 15, halign: 'left' },
    codigo: { cellWidth: 25, halign: 'left' },
    nropedido: { cellWidth: 15, halign: 'center' },
    tipopedido: { cellWidth: 20, halign: 'left' },
    almacenorigen: { cellWidth: 20, halign: 'left' },
    almacen: { cellWidth: 20, halign: 'left' },
    observacion: { cellWidth: 45, halign: 'left' },
    estado: { cellWidth: 20, halign: 'left' },
  }

  const Izquierda = {
    titulo: 'DATOS DEL REPORTE',
    campos: [{ label: 'Almacen', valor: datosFormulario.almacen || '' }],
  }
  const fechas = {
    inicio: datosFormulario.fechaInicio,

    final: datosFormulario.fechaFin,
  }
  const derecho = {
    titulo: 'DATOS DEL ENCARGADO',
    campos: [
      { label: '', valor: datosFormulario.usuario.nombre },
      { label: '', valor: datosFormulario.usuario.cargo },
    ],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE PEDIDOS',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    derecho,
    false,
    fechas,
  )

  return doc
}
export function PDF_REPORTE_PRECIO_BASE(reporte, datosFormulario) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const columns = [
    { header: 'N°', dataKey: 'n' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Código', dataKey: 'codigo' },
    { header: 'producto', dataKey: 'producto' },
    { header: 'categoria', dataKey: 'categoria' },
    { header: 'Caracteristica', dataKey: 'caracteristica' },
    { header: 'Medida', dataKey: 'medida' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Unidad', dataKey: 'unidad' },
    { header: 'Precio Base', dataKey: 'preciobase' },
  ]

  const datos = reporte.map((item) => ({
    n: item.n,
    fecha: cambiarFormatoFecha(item.fecha),
    codigo: item.codigo,
    producto: item.producto,
    categoria: item.categoria,
    caracteristica: item.caracteristica,
    medida: item.medida,
    descripcion: item.descripcion,
    unidad: item.unidad,
    preciobase: item.preciobase,
  }))

  const columnStyles = {
    n: { cellWidth: 10, halign: 'left' },
    fecha: { cellWidth: 20, halign: 'left' },
    codigo: { cellWidth: 20, halign: 'left' },
    producto: { cellWidth: 20, halign: 'left' },
    categoria: { cellWidth: 20, halign: 'left' },
    caracteristica: { cellWidth: 20, halign: 'left' },
    medida: { cellWidth: 20, halign: 'left' },
    descripcion: { cellWidth: 35, halign: 'left' },
    unidad: { cellWidth: 15, halign: 'left' },
    preciobase: { cellWidth: 15, halign: 'right' },
  }
  const headerColumnStyles = {
    n: { cellWidth: 10, halign: 'left' },
    fecha: { cellWidth: 20, halign: 'left' },
    codigo: { cellWidth: 20, halign: 'left' },
    producto: { cellWidth: 20, halign: 'left' },
    categoria: { cellWidth: 20, halign: 'left' },
    caracteristica: { cellWidth: 20, halign: 'left' },
    medida: { cellWidth: 20, halign: 'left' },
    descripcion: { cellWidth: 35, halign: 'left' },
    unidad: { cellWidth: 15, halign: 'left' },
    preciobase: { cellWidth: 15, halign: 'right' },
  }

  const Izquierda = {
    titulo: 'DATOS DEL REPORTE',
    campos: [{ label: 'Almacen', valor: datosFormulario.almacen || '' }],
  }

  const derecho = {
    titulo: 'DATOS DEL ENCARGADO',
    campos: [
      { label: null, valor: datosFormulario.usuario.nombre },
      { label: null, valor: datosFormulario.usuario.cargo },
    ],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE DE COSTO UNITARIO',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    derecho,
    false,
    null,
  )

  return doc
}
export function PDF_REPORTE_CATEGORIA_PRECIO(reporte, datosFormulario) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const columns = [
    { header: 'N°', dataKey: 'n' },
    { header: 'Categoria', dataKey: 'nombre' },
    { header: 'Porcentaje', dataKey: 'porcentaje' },
    { header: 'Almacén', dataKey: 'almacen' },
    { header: 'Estado', dataKey: 'estado' },
  ]

  const datos = reporte.map((item) => ({
    n: item.n,
    nombre: item.nombre,
    porcentaje: item.porcentaje,
    almacen: item.almacen,
    estado: item.estado,
  }))
  const columnStyles = {
    n: { cellWidth: 10, halign: 'center' },
    nombre: { cellWidth: 60, halign: 'left' },
    porcentaje: { cellWidth: 40, halign: 'right' },
    almacen: { cellWidth: 55, halign: 'LEFT' },
    estado: { cellWidth: 30, halign: 'center' },
  }
  const headerColumnStyles = {
    n: { cellWidth: 10, halign: 'center' },
    nombre: { cellWidth: 60, halign: 'left' },
    porcentaje: { cellWidth: 40, halign: 'right' },
    almacen: { cellWidth: 55, halign: 'LEFT' },
    estado: { cellWidth: 30, halign: 'center' },
  }

  const Izquierda = {
    titulo: 'DATOS DEL REPORTE',
    campos: [{ label: 'Almacen', valor: datosFormulario.almacen || '' }],
  }

  const derecho = {
    titulo: 'DATOS DEL ENCARGADO',
    campos: [
      { label: '', valor: datosFormulario.usuario.nombre },
      { label: '', valor: datosFormulario.usuario.cargo },
    ],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE DE PRECIOS BASE',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    derecho,
    false,
    null,
  )

  return doc
}
export function PDF_REPORTE_EXTRAVIO(reporte, datosFormulario) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const columns = [
    { header: 'N°', dataKey: 'index' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Almacén', dataKey: 'almacen' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Autorizacion', dataKey: 'autorizacion' },
  ]

  const datos = reporte.map((item) => ({
    index: item.index,
    fecha: item.fecha,
    almacen: item.almacen,
    descripcion: item.descripcion,
    autorizacion: item.autorizacion,
  }))
  const columnStyles = {
    index: { cellWidth: 10, halign: 'center' },
    fecha: { cellWidth: 20, halign: 'left' },
    almacen: { cellWidth: 50, halign: 'left' },
    descripcion: { cellWidth: 85, halign: 'left' },
    autorizacion: { cellWidth: 30, halign: 'left' },
  }
  const headerColumnStyles = {
    index: { cellWidth: 10, halign: 'center' },
    fecha: { cellWidth: 20, halign: 'left' },
    almacen: { cellWidth: 50, halign: 'left' },
    descripcion: { cellWidth: 85, halign: 'left' },
    autorizacion: { cellWidth: 30, halign: 'left' },
  }

  const Izquierda = {
    titulo: 'DATOS DEL REPORTE',
    campos: [{ label: 'Almacen', valor: datosFormulario.almacen || '' }],
  }
  const fechas = {
    inicio: datosFormulario.fechaInicio,

    final: datosFormulario.fechaFin,
  }
  const derecho = {
    titulo: 'DATOS DEL ENCARGADO',
    campos: [
      { label: '', valor: datosFormulario.usuario.nombre },
      { label: '', valor: datosFormulario.usuario.cargo },
    ],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE DE EXTRABIO',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    derecho,
    false,
    fechas,
  )

  return doc
}
export function PDF_REPORTE_MERMA(reporte, datosFormulario) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const columns = [
    { header: 'N°', dataKey: 'index' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Almacén', dataKey: 'almacen' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Autorizacion', dataKey: 'autorizacion' },
  ]

  const datos = reporte.map((item) => ({
    index: item.index,
    fecha: item.fecha,
    almacen: item.almacen,
    descripcion: item.descripcion,
    autorizacion: item.autorizacion,
  }))

  const columnStyles = {
    index: { cellWidth: 10, halign: 'center' },
    fecha: { cellWidth: 20, halign: 'left' },
    almacen: { cellWidth: 45, halign: 'left' },
    descripcion: { cellWidth: 90, halign: 'left' },
    autorizacion: { cellWidth: 30, halign: 'left' },
  }

  const headerColumnStyles = {
    index: { cellWidth: 10, halign: 'center' },
    fecha: { cellWidth: 20, halign: 'left' },
    almacen: { cellWidth: 45, halign: 'left' },
    descripcion: { cellWidth: 90, halign: 'left' },
    autorizacion: { cellWidth: 30, halign: 'left' },
  }

  const Izquierda = {
    titulo: 'DATOS DEL REPORTE',
    campos: [{ label: 'Almacen', valor: datosFormulario.almacen || '' }],
  }
  const fechas = {
    inicio: datosFormulario.fechaInicio,

    final: datosFormulario.fechaFin,
  }
  const derecho = {
    titulo: 'DATOS DEL ENCARGADO',
    campos: [
      { label: '', valor: datosFormulario.usuario.nombre },
      { label: '', valor: datosFormulario.usuario.cargo },
    ],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE DE MERMAS',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    derecho,
    false,
    fechas,
  )

  return doc
}
export function DPF_REPORTE_PRODUCTO_ASIGNADOS(productoLista, almacen) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Código', dataKey: 'codigo' },
    { header: 'Codigo Barra', dataKey: 'codigobarra' },
    { header: 'Categoria', dataKey: 'categoria' },
    { header: 'Sub Categoria', dataKey: 'subcategoria' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Unidad', dataKey: 'unidad' },
    { header: 'Característica', dataKey: 'medida' },
    { header: 'Otras características', dataKey: 'caracteristica' },
    { header: 'Estado', dataKey: 'estadoproducto' },
    { header: 'Stock', dataKey: 'stock' },
    { header: 'Stock min', dataKey: 'stockminimo' },
    { header: 'Stock max', dataKey: 'stockmaximo' },
  ]

  const datos = productoLista.value.map((item, indice) => ({
    indice: indice + 1,
    codigo: item.codigo,
    codigobarra: item.codigobarra,
    categoria: item.categoria,
    subcategoria: item.subcategoria,
    descripcion: item.descripcion,
    unidad: item.unidad,
    medida: item.medida,
    caracteristica: item.caracteristica,
    estadoproducto: item.estadoproducto,
    stock: item.stock,
    stockminimo: item.stockminimo,
    stockmaximo: item.stockmaximo,
  }))

  const columnStyles = {
    indice: { cellWidth: 8, halign: 'center' },
    codigo: { cellWidth: 15, halign: 'left' },
    codigobarra: { cellWidth: 15, halign: 'left' },
    categoria: { cellWidth: 15, halign: 'left' },
    subcategoria: { cellWidth: 15, halign: 'left' },
    descripcion: { cellWidth: 20, halign: 'left' },
    unidad: { cellWidth: 20, halign: 'center' },
    medida: { cellWidth: 18, halign: 'center' },
    caracteristica: { cellWidth: 18, halign: 'left' },
    estadoproducto: { cellWidth: 15, halign: 'left' },
    stock: { cellWidth: 12, halign: 'right' },
    stockminimo: { cellWidth: 12, halign: 'right' },
    stockmaximo: { cellWidth: 12, halign: 'right' },
  }

  const headerColumnStyles = {
    indice: { cellWidth: 8, halign: 'center' },
    codigo: { cellWidth: 15, halign: 'left' },
    codigobarra: { cellWidth: 15, halign: 'left' },
    categoria: { cellWidth: 15, halign: 'left' },
    subcategoria: { cellWidth: 15, halign: 'left' },
    descripcion: { cellWidth: 20, halign: 'left' },
    detalle: { cellWidth: 15, halign: 'left' },
    unidad: { cellWidth: 20, halign: 'center' },
    medida: { cellWidth: 18, halign: 'center' },
    caracteristica: { cellWidth: 18, halign: 'left' },
    estadoproducto: { cellWidth: 10, halign: 'left' },
    stock: { cellWidth: 8, halign: 'right' },
    stockminimo: { cellWidth: 8, halign: 'right' },
    stockmaximo: { cellWidth: 8, halign: 'right' },
  }

  const Izquierda = {
    titulo: 'DATOS ALMACEN',
    campos: [{ label: '', valor: almacen.label || '' }],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'PRODUCTOS ASIGNADOS',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    null,
    true,
    null,
  )

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  return doc
}

export function PDF_REPORTE_GESTIPO_PEDIDOS_DETALLE(detallePedido) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
  ]

  const detallePlano = JSON.parse(JSON.stringify(detallePedido.value))

  const datos = detallePlano[0].detalle.map((item, indice) => ({
    indice: indice + 1,
    descripcion: item.descripcion,
    cantidad: decimas(item.cantidad),
  }))

  const columnStyles = {
    indice: { cellWidth: 15, halign: 'center' },
    descripcion: { cellWidth: 100, halign: 'left' },
    cantidad: { cellWidth: 80, halign: 'right' },
  }
  const headerColumnStyles = {
    indice: { halign: 'center' },
    descripcion: { halign: 'left' },
    cantidad: { halign: 'right' },
  }
  const cliente = `${detallePlano[0].almacen}`
  const Izquierda = {
    titulo: 'DATOS ORDEN',
    campos: [
      { label: 'Cliente', valor: cliente || '' },
      { label: 'Fecha de Orden', valor: detallePlano[0].fecha || '' },
    ],
  }
  const derecho = {
    titulo: 'DATOS DEL USUARIO',
    campos: [
      { label: '', valor: detallePlano[0].usuarios[0].usuario || '' },
      { label: '', valor: detallePlano[0].usuarios[0].cargo || '' },
      { label: 'Tipo', valor: tipo[detallePlano[0].tipopedido] || '' },
    ],
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'ORDEN PEDIDO',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    derecho,
    false,
    null,
  )

  return doc
}

export const PDF_REPORTE_GESTION_PEDIDOS = (filterPedido, tipoestados, fechai, fechaf, almacen) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  const columns = [
    { header: 'N', dataKey: 'indice' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Código', dataKey: 'codigo' },
    { header: 'Nro. Pedido', dataKey: 'nropedido' },
    { header: 'Tipo', dataKey: 'tipopedido' },
    { header: 'Almacén Origen', dataKey: 'almacenorigen' },
    { header: 'Almacén Destino', dataKey: 'almacen' },
    { header: 'Observación', dataKey: 'observacion' },
    { header: 'Estado', dataKey: 'estado' },
  ]
  // filterPedido.value.reduce((sum, row) => sum + Number(row.total), 0)
  const datos = filterPedido.value.map((item, indice) => ({
    indice: indice + 1,
    fecha: item.fecha,
    codigo: item.codigo,
    nropedido: item.nropedido,
    tipopedido: tipo[Number(item.tipopedido)],
    almacenorigen: item.almacenorigen,
    almacen: item.almacen,
    observacion: item.observacion,
    estado: tipoestados[Number(item.estado)],
  }))

  const columnStyles = {
    indice: { cellWidth: 10, halign: 'center' },
    fecha: { cellWidth: 20, halign: 'left' },
    codigo: { cellWidth: 25, halign: 'left' },
    nropedido: { cellWidth: 15, halign: 'right' },
    tipopedido: { cellWidth: 25, halign: 'left' },
    almacenorigen: { cellWidth: 25, halign: 'left' },
    almacen: { cellWidth: 25, halign: 'left' },
    observacion: { cellWidth: 35, halign: 'left' },
    estado: { cellWidth: 20, halign: 'left' },
  }
  const headerColumnStyles = {
    indice: { halign: 'center' },
    fecha: { halign: 'left' },
    codigo: { halign: 'left' },
    nropedido: { halign: 'right' },
    tipopedido: { halign: 'left' },
    almacenorigen: { halign: 'left' },
    almacen: { halign: 'left' },
    observacion: { halign: 'left' },
    estado: { halign: 'left' },
  }

  const nombreAlmacen = almacen.value
  const Izquierda = {
    titulo: 'DATOS DEL REPORTE',
    campos: [{ label: 'Nombre del Almacen', valor: nombreAlmacen.label || 'Todos' }],
  }
  //
  const fechas = {
    inicio: fechai.value,

    final: fechaf.value,
  }

  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE DE PEDIDOS',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    null,
    true,
    fechas,
  )
  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  return doc
}

// FUNCIÓN PRINCIPAL DEL REPORTE (PUNTO DE ENTRADA ESPECÍFICO)

export function PDF_REPORTE_COMPRAS(filteredCompra, filtroAlmacen) {
  console.log(filteredCompra)

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Proveedor', dataKey: 'proveedor' },
    { header: 'Lote', dataKey: 'lote' },
    { header: 'Código', dataKey: 'codigo' },
    { header: 'N° Factura', dataKey: 'nfactura' },
    { header: 'Tipo', dataKey: 'tipocompra' },
    { header: 'Total Compra', dataKey: 'total' },
    { header: 'Estado', dataKey: 'autorizacion' },
  ]
  const columnStyles = {
    indice: { cellWidth: 10, halign: 'center' },
    fecha: { cellWidth: 20, halign: 'center' },
    proveedor: { cellWidth: 30, halign: 'left' },
    lote: { cellWidth: 30, halign: 'left' },
    codigo: { cellWidth: 30, halign: 'left' },
    nfactura: { cellWidth: 15, halign: 'right' },
    tipocompra: { cellWidth: 15, halign: 'left' },
    total: { cellWidth: 25, halign: 'right' },
    autorizacion: { cellWidth: 20, halign: 'left' },
  }
  // const headerColumnStyles = {
  //   indice: { fillColor: [255, 0, 0], textColor: 255, fontStyle: 'bold', halign: 'center' },
  //   fecha: { fillColor: [0, 120, 255], textColor: 255, halign: 'center' },
  //   proveedor: { fillColor: [0, 180, 90], textColor: 0, halign: 'left' },
  //   lote: { fillColor: [255, 200, 0], textColor: 0, halign: 'left' },
  //   codigo: { fillColor: [200, 0, 255], textColor: 255, halign: 'left' },
  //   nfactura: { fillColor: [240, 240, 240], textColor: 0, halign: 'right' },
  //   tipocompra: { fillColor: [90, 90, 90], textColor: 255, halign: 'center' },
  //   total: { fillColor: [0, 150, 0], textColor: 255, fontStyle: 'bold', halign: 'right' },
  //   autorizacion: { fillColor: [180, 0, 0], textColor: 255, halign: 'center' },
  // }
  const headerColumnStyles = {
    indice: { halign: 'center' },
    fecha: { halign: 'center' },
    proveedor: { halign: 'left' },
    lote: { halign: 'left' },
    codigo: { halign: 'left' },
    nfactura: { halign: 'right' },
    tipocompra: { halign: 'left' },
    total: { halign: 'right' },
    autorizacion: { halign: 'left' },
  }
  // 3. Mapeo y Preparación de Datos Específicos del Reporte de Compras
  const datos =
    filteredCompra?.value?.map((item, indice) => ({
      indice: indice + 1,
      fecha: cambiarFormatoFecha(item.fecha),
      proveedor: item.proveedor,
      lote: item.lote,
      codigo: item.codigo,
      nfactura: item.nfactura,
      tipocompra: item.tipocompra == 2 ? 'Contado' : 'Credito',
      total: item.total == null ? 'Lista Vacia' : decimas(redondear(parseFloat(item.total))),
      autorizacion: item.autorizacion == 2 ? 'No Autorizado' : 'Autorizado',
    })) || []
  const almacen = filtroAlmacen.value

  const Izquierda = {
    titulo: 'DATOS DEL REPORTE',
    campos: [{ label: 'Nombre del almacén', valor: almacen.label || 'Todos' }],
  }

  // 4. Delegar el dibujo del cuerpo, encabezado y pie de página
  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE DE COMPRAS',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    null,
    true,
    null,
  )

  // doc.save('reporte_compras.pdf');
  return doc
}

// 2. CUERPO (BODY) - COMPONENTE ESCALABLE
// function dibujarCuerpoTabla(
//   doc,
//   columns,
//   datos,
//   tituloReporte,
//   columnStyles,
//   headerColumnStyles,
//   datosIzquierda = null,
//   datosDerecho = null,
//   conImpresionEncargado = null,
//   fechas = null,
//   extras = null,
// ) {
//   // Definición de estilos de columna específicos para este reporte (pueden generalizarse)
//   let ultimaPaginaTabla = 0

//   autoTable(doc, {
//     columns,
//     body: datos,
//     styles: {
//       overflow: 'linebreak',
//       fontSize: fontSize,
//       cellPadding: cellPadding,
//       textColor: [0, 0, 0],
//     },
//     headStyles: {
//       fillColor: false,
//       textColor: [0, 0, 0],
//       fontSize: fontSize,
//       halign: 'center',
//     },
//     // headStyles: {
//     //   fillColor: false,
//     //   textColor: [0, 0, 0],
//     //   halign: 'center',
//     //   fontSize: fontSize,
//     //   lineWidth: 0.3,
//     //   lineColor: [0, 0, 0],
//     // },

//     // columnStyles: columnStyles,
//     // Posición inicial de la tabla, justo debajo del encabezado
//     startY: 55,
//     margin: { horizontal: 10, bottom: 20 },
//     tableWidth: 'auto',
//     theme: 'plain',
//     didParseCell: function (data) {
//       const key = data.column.dataKey
//       // for (const styleName in data.cell.styles) {
//       //   // Aseguramos que la propiedad es propia del objeto y no heredada
//       //   if (Object.prototype.hasOwnProperty.call(data.cell.styles, styleName)) {
//       //     // styleName es el nombre de la propiedad (ej: 'color', 'fontSize')
//       //     const styleValue = data.cell.styles[styleName]

//       //     console.log(`Nombre del Estilo: ${styleName}`)
//       //     console.log(`Valor del Estilo: ${styleValue}`)
//       //     // console.log(styleName, ':', styleValue);
//       //   }
//       // }

//       if (data.section === 'head') {
//         // aplicar estilos específicos de la columna

//         if (headerColumnStyles[key]) {
//           Object.assign(data.cell.styles, headerColumnStyles[key])
//         }

//         if (extras && extras.cabezeraVertical) {
//           data.cell.text = ['']
//         }
//       }

//       if (data.section === 'body') {
//         // aplica los estilos personalizados del body por columna
//         if (columnStyles[key]) {
//           Object.assign(data.cell.styles, columnStyles[key])
//         }
//       }
//     },
//     didDrawCell: function (data) {
//       console.log(data)
//       // if (extras) {
//       //   if (data.column.dataKey === extras.descripcion && data.cell.section === 'body') {
//       //     const item = datos[data.row.index]
//       //     if (extras && extras.descripcionAdicional && extras.descripcionAdicional != '') {
//       //       if (item[extras.descripcionAdicional]) {
//       //         const text = convertirAMayusculas(
//       //           doc.splitTextToSize('(' + item[extras.descripcionAdicional] + ')', 45),
//       //         )
//       //         doc.setFontSize(6)
//       //         doc.setTextColor(0)
//       //         doc.text(
//       //           text,
//       //           data.cell.x + 40,
//       //           data.cell.y + data.cell.height - 1, // justo debajo del texto principal
//       //         )
//       //         doc.setTextColor(0)
//       //       }
//       //     }
//       //   }
//       // }
//       // if (extras && extras.cabezeraVertical) {
//       //   if (data.section === 'head') {
//       //     const cell = data.cell
//       //     const text = data.column.raw.header || '' // El texto del encabezado
//       //     console.log(data.cell)
//       //     console.log(data.column.raw.header)

//       //     if (!text) return // Evitar errores si el texto es nulo

//       //     // 1. Opciones de Rotación y Posición:
//       //     // Posición X: Desplazamos un poco a la izquierda (restamos 2-3mm)
//       //     // para que el texto rotado a 45° no se salga por el borde derecho.
//       //     //const offsetX = 3
//       //     const textX = cell.x + cell.width // Cerca del borde derecho, desplazado

//       //     // Posición Y: Cerca de la parte inferior de la celda
//       //     const textY = cell.y + cell.height // -2mm desde el final

//       //     // 2. Configurar el estilo
//       //     doc.setFont(doc.getFont().fontName, 'bold')
//       //     doc.setFontSize(8)
//       //     doc.setTextColor(0, 0, 0)

//       //     // 3. Aplicar la rotación y dibujar el texto
//       //     doc.text(text, textX, textY, {
//       //       // *** CAMBIO CLAVE: 45 grados ***
//       //       angle: 45,
//       //       align: 'right', // Alineación a la derecha para que el punto de anclaje sea el borde
//       //       baseline: 'bottom',
//       //     })
//       //     data.row.height = 15
//       //   }
//       // }
//       if (data.column.dataKey === 'imagen' && data.cell.section === 'body') {
//         console.log(data.column.dataKey)
//         const imageData = data.cell.text[0] // La celda contiene el string Base64
//         console.log(data.cell.raw)

//         // Verifica que el string no esté vacío (no es la fila de Total)
//         if (imageData && imageData.startsWith('data:image/')) {
//           const cell = data.cell

//           // Definir el tamaño y posición de la imagen dentro de la celda
//           const imageWidth = 12 // Ancho deseado de la imagen en mm
//           const imageHeight = 12 // Altura deseada de la imagen en mm

//           // Calcular la posición central para centrar la imagen
//           const x = cell.x + cell.width / 2 - imageWidth / 2
//           const y = cell.y + cell.height / 2 - imageHeight / 2

//           // El formato Base64 debe ser 'data:image/jpeg;base64,...' o similar.
//           // La función addImage lo maneja automáticamente si el prefijo es correcto.
//           console.log(imageData)
//           doc.addImage(imageData, 'auto', x, y, imageWidth, imageHeight)
//         }

//         // Borra el texto de la celda después de dibujar la imagen
//         data.cell.text = []
//       }
//       if (data.section === 'head') {
//         const cell = data.cell

//         // Configura color y grosor de línea
//         doc.setDrawColor(0, 0, 0) // Negro
//         doc.setLineWidth(0.2) // Grosor

//         // ---- LÍNEA SUPERIOR ----
//         doc.line(cell.x, cell.y, cell.x + cell.width, cell.y)

//         // ---- LÍNEA INFERIOR ----
//         doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height)
//       }
//       ultimaPaginaTabla = data.table.pageNumber
//     },
//     // ENCABEZADO Y PIE DE PÁGINA: Se dibuja en cada página.
//     didDrawPage: (data) => {
//       agregarEncabezado(doc)
//       agregarEncabezadoInfo(
//         doc,
//         tituloReporte,
//         fechas,
//         datosIzquierda,
//         datosDerecho,
//         conImpresionEncargado,
//         extras,
//       )

//       // Dibuja el encabezado en cada página

//       // Dibuja el pie de página en cada página
//       agregarPieDePagina(doc, data)
//     },
//   })

//   // Solo insertar contenido en la página donde la tabla termina
//   doc.setPage(ultimaPaginaTabla)

//   // Coordenada exacta debajo de la tabla
//   const y = doc.lastAutoTable.finalY + 5

//   doc.setFontSize(8)
//   const fechaGeneracion = cambiarFormatoFecha(obtenerFechaActualDato())
//   //doc.text('FUSTO: Información debajo de la tabla', 14, y)
//   doc.text(`Fecha hora reporte: ${fechaGeneracion} ${obtenerHora()}`, 14, y, {
//     align: 'left',
//   })
// }
function dibujarCuerpoTabla(
  doc,
  columns,
  datos,
  tituloReporte,
  columnStyles,
  headerColumnStyles,
  datosIzquierda = null,
  datosDerecho = null,
  conImpresionEncargado = null,
  fechas = null,
  extras = null,
) {
  // Definición de estilos de columna específicos para este reporte (pueden generalizarse)
  let ultimaPaginaTabla = 0

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: fontSize,
      cellPadding: cellPadding,
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: false,
      textColor: [0, 0, 0],
      fontSize: fontSize,
      halign: 'center',
    }, // ❌ ELIMINADO: startY: 55, // Se elimina para usar margin.top en su lugar

    // ✅ CORRECCIÓN: Definir el margen superior para reservar espacio para el encabezado
    margin: { top: 55, horizontal: 10, bottom: 20 },

    tableWidth: 'auto',
    theme: 'plain',

    didParseCell: function (data) {
      const key = data.column.dataKey
      if (data.section === 'head') {
        // aplicar estilos específicos de la columna
        if (headerColumnStyles[key]) {
          Object.assign(data.cell.styles, headerColumnStyles[key])
        }

        if (extras && extras.cabezeraVertical) {
          data.cell.text = ['']
        }
      }

      if (data.section === 'body') {
        // aplica los estilos personalizados del body por columna
        if (columnStyles[key]) {
          Object.assign(data.cell.styles, columnStyles[key])
        }
      }
    },

    didDrawCell: function (data) {
      // ... Lógica para dibujar la imagen y bordes de encabezado (sin cambios) ...

      if (data.column.dataKey === 'imagen' && data.cell.section === 'body') {
        // Lógica de dibujo de imagen
      }

      if (data.section === 'head') {
        const cell = data.cell // Configura color y grosor de línea

        doc.setDrawColor(0, 0, 0) // Negro
        doc.setLineWidth(0.2) // Grosor
        // ---- LÍNEA SUPERIOR ----

        doc.line(cell.x, cell.y, cell.x + cell.width, cell.y) // ---- LÍNEA INFERIOR ----

        doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height)
      }
      ultimaPaginaTabla = data.table.pageNumber
    }, // ENCABEZADO Y PIE DE PÁGINA: Se dibuja en cada página.

    didDrawPage: () => {
      // Dibuja el encabezado fijo del documento (Logo, etc.)
      agregarEncabezado(doc) // Dibuja la información variable del reporte (Título, fechas, datos adicionales)
      agregarEncabezadoInfo(
        doc,
        tituloReporte,
        fechas,
        datosIzquierda,
        datosDerecho,
        conImpresionEncargado,
        extras,
      ) // Dibuja el pie de página en cada página
    },
  }) // Solo insertar contenido en la página donde la tabla termina

  doc.setPage(ultimaPaginaTabla) // Coordenada exacta debajo de la tabla

  const y = doc.lastAutoTable.finalY + 5

  doc.setFontSize(8)
  const fechaGeneracion = cambiarFormatoFecha(obtenerFechaActualDato())
  doc.text(`Fecha hora reporte: ${fechaGeneracion} ${obtenerHora()}`, 14, y, {
    align: 'left',
  })

  agregarPieDePagina(doc)
}

// 1. ENCABEZADO (HEADER) - REUTILIZABLE
function agregarEncabezado(doc) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const startY = 5

  //LOGO
  if (logoBase64) {
    const imgWidth = 20
    const imgHeight = 20

    const pageWidth = doc.internal.pageSize.getWidth()

    const xPos = (pageWidth - imgWidth) / 2 // ← CENTRAR
    const yPos = startY // tu altura elegida

    doc.addImage(logoBase64, 'JPEG', xPos, yPos, imgWidth, imgHeight)
  }
  //Datos Izquierda
  doc.setFontSize(9)
  doc.setFont(undefined, 'bold')
  doc.text(nombreEmpresa, 10, 10)

  doc.setFontSize(8)
  doc.setFont(undefined, 'normal')
  doc.text(direccionEmpresa, 10, 13)
  doc.text(estado, 10, 16)
  doc.text(ciudad, 10, 19)
  doc.text(pais, 10, 22)
  //Datos Derecho
  doc.setFontSize(9)
  doc.setFont(undefined, 'bold')
  doc.text('NIT:' + nit, pageWidth - 10, 10, { align: 'right' })

  doc.setFontSize(8)
  doc.setFont(undefined, 'normal')
  doc.text('Telf.: ' + telefono, pageWidth - 10, 13, { align: 'right' })
  doc.text('Cel.: ' + celular, pageWidth - 10, 16, { align: 'right' })
  doc.text(email, pageWidth - 10, 19, { align: 'right' })
  doc.text(web, pageWidth - 10, 22, { align: 'right' })

  doc.setDrawColor(0)
  doc.setLineWidth(0.2)
  doc.line(10, 25, pageWidth - 10, 25)
}

function agregarEncabezadoInfo(
  doc,
  titulo,
  fechas,
  datosIzquierda,
  datosDerecho = null,
  conImpresionEncargado = null,
  extras = null,
) {
  const pageWidth = doc.internal.pageSize.getWidth()

  // -------------------------
  // TÍTULO CENTRADO
  // -------------------------
  doc.setFontSize(11)
  doc.setFont(undefined, 'bold')
  doc.text(titulo, pageWidth / 2, 30, { align: 'center' })
  console.log(datosIzquierda)

  if (fechas) {
    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    doc.text(
      'Entre ' + cambiarFormatoFecha(fechas.inicio) + ' Y ' + cambiarFormatoFecha(fechas.final),
      pageWidth / 2,
      33,
      {
        align: 'center',
      },
    )
  }
  if (extras) {
    if (extras.numFactura) {
      doc.setFontSize(8)
      doc.setFont(undefined, 'normal')
      doc.text('Nro. ' + extras.numFactura, pageWidth / 2, 33, {
        align: 'center',
      })
    }
    if (extras.expresadoDivisa) {
      doc.setFontSize(8)
      doc.setFont(undefined, 'normal')
      doc.text('(Expresados en ' + extras.expresadoDivisa + ')', pageWidth / 2, 36, {
        align: 'center',
      })
    }
  }

  // -------------------------
  // DATOS DEL REPORTE (Izquierda)
  // -------------------------
  if (datosIzquierda) {
    // Título
    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.text(datosIzquierda.titulo + ':', 10, 33)

    // Valores dinámicos
    let y = 36 // posición inicial

    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')

    datosIzquierda.campos.forEach((campo) => {
      let texto = campo.valor
      if (campo.label && campo.label.trim() !== '') {
        texto = `${campo.label}: ${campo.valor}`
      }
      doc.text(texto, 10, y)
      y += 3 // separación entre líneas
    })
  }

  // -------------------------
  // DATOS DEL ENCARGADO (Derecha)
  // -------------------------
  if (datosDerecho) {
    // Título
    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.text(datosDerecho.titulo, pageWidth - 10, 33, { align: 'right' })

    // Imprimir campos dinámicos
    let y = 36 // posición inicial

    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')

    datosDerecho.campos.forEach((campo) => {
      let texto = campo.valor
      if (campo.label && campo.label.trim() !== '') {
        texto = `${campo.label}: ${campo.valor}`
      }
      doc.text(texto, pageWidth - 10, y, { align: 'right' })
      y += 3 // separación vertical
    })
  } else if (conImpresionEncargado) {
    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.text('DATOS DEL ENCARGADO:', pageWidth - 10, 33, { align: 'right' })

    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    doc.text(encargadoNombre, pageWidth - 10, 36, { align: 'right' })

    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    doc.text(cargo, pageWidth - 10, 39, { align: 'right' })
  }
}

// 3. PIE DE PÁGINA (FOOTER) - REUTILIZABLE
function agregarPieDePagina(doc) {
  const finalPageCount = doc.internal.getNumberOfPages()
  doc.setFontSize(8)
  doc.setFont(undefined, 'bold')
  for (let i = 1; i <= finalPageCount; i++) {
    doc.setPage(i)
    const finalFullText = `Pagina N° ${i} de ${finalPageCount}`
    doc.text(finalFullText, doc.internal.pageSize.getWidth() - 10, 53, {
      align: 'right',
    })
  }
}

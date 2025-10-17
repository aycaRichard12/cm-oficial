import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { decimas, redondear } from 'src/composables/FuncionesG'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { obtenerFechaActualDato } from 'src/composables/FuncionesG'
import { numeroALetras } from 'src/composables/FuncionesG'
import { imagen } from 'src/boot/url'
import { api } from 'src/boot/axios'
import { cargarLogoBase64 } from 'src/composables/FuncionesG'
import { convertirAMayusculas } from 'src/composables/FuncionesG'

// Variables globales
let logoBase64 = null
let contenidousuario = null
let idempresa = null
let logoEmpresa = null
let ColoEncabezadoTabla = [128, 128, 128] // Negro
const tipo = { 1: 'Pedido Compra', 2: 'Pedido Movimiento' }

async function initPdfReportGenerator() {
  contenidousuario = validarUsuario()
  idempresa = contenidousuario[0]
  logoEmpresa = idempresa.empresa.logo
  logoBase64 = await cargarLogoBase64(logoEmpresa)
}

export function getLogoBase64() {
  return logoBase64
}

initPdfReportGenerator()

export default function imprimirReporte(detallePedido) {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo

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

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      indice: { cellWidth: 15, halign: 'center' },
      descripcion: { cellWidth: 100, halign: 'left' },
      cantidad: { cellWidth: 80, halign: 'right' },
    },
    didParseCell: function (data) {
      if (data.row.index >= datos.length - 3) {
        data.cell.styles.halign = 'left'
      }
    },
    startY: 50,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoEmpresa) {
          //doc.addImage(`${URL_APIE}/${logoEmpresa}`, 'PNG', 180, 8, 20, 20)
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
        doc.text('ORDEN PEDIDO', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })

        doc.setDrawColor(0)
        doc.setLineWidth(0.2)
        doc.line(5, 30, 200, 30)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS ORDEN:', 5, 35)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        const cliente = `${detallePlano[0].almacen}`
        doc.text(cliente, 5, 38)

        doc.text(detallePlano[0].empresa.direccion, 5, 41)
        doc.text(detallePlano[0].empresa.email, 5, 44)
        doc.text('Fecha de Orden: ' + cambiarFormatoFecha(detallePlano[0].fecha), 5, 47)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL USUARIO:', 200, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].usuarios[0].usuario, 200, 38, { align: 'right' })
        doc.text(detallePlano[0].usuarios[0].cargo, 200, 41, { align: 'right' })
        doc.text('Tipo ' + tipo[detallePlano[0].tipopedido], 200, 44, { align: 'right' })
      }
    },
  })
  return doc
}
export function PDFreporteCuentasXCobrarPeriodo(reportData, startDate, endDate) {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Base64 string or URL
  const nombre = idempresa.nombre
  const cargo = idempresa.cargo

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

  autoTable(doc, {
    columns: columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 6, // Slightly increased for readability
      cellPadding: 1, // Reduced padding to fit more columns
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
      fontSize: 7, // Header font size
    },
    columnStyles: {
      indice: { cellWidth: 15, halign: 'center' }, // Adjusted width
      fecha_actual: { cellWidth: 20, halign: 'center' },
      nombre_cliente: { cellWidth: 40, halign: 'left' },
      nombre_comercial: { cellWidth: 40, halign: 'left' },
      monto_total_venta: { cellWidth: 20, halign: 'right' },
      descuento_venta: { cellWidth: 20, halign: 'right' },
      saldo_estado_cobro: { cellWidth: 20, halign: 'right' },
      monto_detalle_cobro: { cellWidth: 25, halign: 'right' },
      // photo_detalle_cobro: { cellWidth: 20, halign: 'center' }, // If you re-add photo, adjust width
    },
    startY: 45,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      // Use 'data' parameter provided by autoTable
      // Only draw header on the first page
      // Or draw on every page: if (doc.internal.getNumberOfPages() === 1) { ... }
      // This header will appear on every page for multi-page reports
      doc.setFontSize(7)
      doc.setFont(undefined, 'normal') // Reset font style

      // Header content
      doc.setDrawColor(0) // Black
      doc.setLineWidth(0.2) // Line thickness

      // Line before header
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoEmpresa && logoEmpresa.startsWith('data:image')) {
          doc.addImage(logoEmpresa, 'PNG', 180, 8, 20, 20) // Adjust x, y, width, height
        }
        // If logoEmpresa is a URL, it's more complex. Consider using it as Base64.
        // doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 180, 8, 20, 20) // If using URL, uncomment and ensure URL_APIE is defined

        // Company Info (Left)
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        // Report Title (Center)
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('REPORTE DE COBROS DIARIOS', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })

        // Line after header before data section
        doc.line(5, 30, doc.internal.pageSize.getWidth() - 5, 30)

        // Report Data Info (Left below line)
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE', 5, 35)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          `Fecha Inicio: ${cambiarFormatoFecha(startDate.value)} - Fecha Fin: ${cambiarFormatoFecha(endDate.value)}`,
          5,
          38,
        )

        // User Data (Right below line)
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL ENCARGADO:', doc.internal.pageSize.getWidth() - 5, 35, {
          align: 'right',
        })
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(nombre, doc.internal.pageSize.getWidth() - 5, 38, { align: 'right' })
        doc.text(cargo, doc.internal.pageSize.getWidth() - 5, 41, { align: 'right' })
      }
      // Logo (if base64)

      // Footer (Page Number)
      const pageNumber = doc.internal.getNumberOfPages()
      doc.setFontSize(8)
      doc.text(
        `Página ${pageNumber}`,
        doc.internal.pageSize.getWidth() - 15,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'right' },
      )
      doc.text(
        `Fecha de Impresión: ${cambiarFormatoFecha(obtenerFechaActualDato())}`,
        15,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'left' },
      )
    },
  })

  // Set the PDF data URL and show the modal didParseCell
  return doc
}

export function PDFreporteCreditos(
  reportData,
  startDate,
  endDate,
  clienteSeleccionado = null,
  sucursalSeleccionada = null,
) {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({
    orientation: 'landscape', // Usamos horizontal para más columnas
    unit: 'mm',
  })

  // Datos de la empresa
  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const nombreUsuario = idempresa.nombre
  const cargoUsuario = idempresa.cargo

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

  // Configuración de autoTable
  autoTable(doc, {
    columns: columns,
    body: datos,
    styles: {
      fontSize: 7,
      cellPadding: 3,
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [128, 128, 128], // Negro
      textColor: 255,
      halign: 'center',
      fontSize: 7,
      fontStyle: 'bold',
    },
    bodyStyles: {
      halign: 'center',
    },
    columnStyles: {
      numero: { cellWidth: 10 },
      fechaventa: { cellWidth: 20 },
      razonsocial: { cellWidth: 25, halign: 'left' },
      sucursal: { cellWidth: 25, halign: 'left' },
      fechalimite: { cellWidth: 20 },
      ncuotas: { cellWidth: 15 },
      cuotasprocesadas: { cellWidth: 25 },
      valorcuotas: { cellWidth: 18, halign: 'right' },
      totalventa: { cellWidth: 18, halign: 'right' },
      totalcobrado: { cellWidth: 18, halign: 'right' },
      saldo: { cellWidth: 18, halign: 'right' },
      totalatrasado: { cellWidth: 18, halign: 'right' },
      totalanulado: { cellWidth: 18, halign: 'right' },

      moradias: { cellWidth: 15 },
      estado: { cellWidth: 15 },
    },
    startY: 45,
    margin: { horizontal: 10 },
    theme: 'grid',
    didDrawPage: (data) => {
      // Encabezado en cada página
      doc.setFontSize(8)
      doc.setFont(undefined, 'normal')

      // Solo agregar logo en primera página
      if (data.pageNumber === 1) {
        if (logoBase64) {
          const pageWidth = doc.internal.pageSize.getWidth() // Ancho total página
          const imgWidth = 20 // Ancho del logo en mm
          const imgHeight = 20 // Alto del logo en mm
          const xPos = pageWidth - imgWidth - 10 // 10mm de margen derecho
          const yPos = 5 // margen superior

          doc.addImage(logoBase64, 'JPEG', xPos, yPos, imgWidth, imgHeight)
        }

        // Información de la empresa
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 10, 10)
        doc.setFontSize(8)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 10, 15)
        doc.text(`Tel: ${telefonoEmpresa}`, 10, 20)

        // Título del reporte
        doc.setFontSize(12)
        doc.setFont(undefined, 'bold')
        doc.text('REPORTE DE CRÉDITOS', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })

        // Fechas del reporte
        doc.setFontSize(9)
        doc.text(
          `Del ${cambiarFormatoFecha(startDate)} al ${cambiarFormatoFecha(endDate)}`,
          doc.internal.pageSize.getWidth() / 2,
          22,
          { align: 'center' },
        )

        // Filtros aplicados
        let filtrosText = ''
        if (clienteSeleccionado) {
          filtrosText += `Cliente: ${clienteSeleccionado.nombre} `
        }
        if (sucursalSeleccionada) {
          filtrosText += `Sucursal: ${sucursalSeleccionada.nombre}`
        }

        if (filtrosText) {
          doc.setFontSize(8)
          doc.text(`Filtros: ${filtrosText}`, 35, 28)
        }

        // Usuario generador
        doc.setFontSize(8)
        doc.text(
          `Generado por: ${nombreUsuario} - ${cargoUsuario}`,
          doc.internal.pageSize.getWidth() - 10,
          28,
          { align: 'right' },
        )

        // Línea separadora
        doc.setDrawColor(0)
        doc.setLineWidth(0.2)
        doc.line(10, 32, doc.internal.pageSize.getWidth() - 10, 32)
      }

      // Pie de página (número de página)
      const pageCount = doc.internal.getNumberOfPages()
      doc.setFontSize(8)
      doc.text(
        `Página ${data.pageNumber} de ${pageCount}`,
        doc.internal.pageSize.getWidth() - 10,
        doc.internal.pageSize.getHeight() - 5,
        { align: 'right' },
      )
      doc.text(
        `Fecha impresión: ${cambiarFormatoFecha(obtenerFechaActualDato())}`,
        10,
        doc.internal.pageSize.getHeight() - 5,
      )
    },
  })

  return doc
}

// Función auxiliar para obtener texto del estado
function getEstadoText(estado) {
  const estados = {
    1: 'Activo',
    2: 'Finalizado',
    3: 'Atrasado',
    4: 'Anulado',
  }
  return estados[Number(estado)] || ''
}

// Función auxiliar para calcular días de mora

export function PDFreporteStockProductosIndividual(processedRows) {
  console.log(processedRows.value)
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64

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
    { header: 'País', dataKey: 'pais' },
    { header: 'Stock mínimo', dataKey: 'stockminimo' },
    { header: 'Stock', dataKey: 'stock' },
    { header: 'Costo total', dataKey: 'costo' },
    { header: 'Estado', dataKey: 'estado' },
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
    pais: item.pais,
    stockminimo: item.stockminimo,
    stock: item.stock,
    costo: decimas(redondear(parseFloat(item.costounitario) * parseFloat(item.stock))),
    estado: item.estado == 1 ? 'Activo' : 'No activo',
  }))
  const totalstock = processedRows.value.reduce(
    (sum, dato) => sum + redondear(parseFloat(dato.stock)),
    0,
  )

  const costoTotal = processedRows.value.reduce(
    (sum, dato) => sum + redondear(parseFloat(dato.stock) * parseFloat(dato.costounitario)),
    0,
  )

  datos.push({ stockminimo: 'Total:', stock: totalstock, costo: decimas(costoTotal) })
  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      indice: { cellWidth: 10, halign: 'center' },
      fecha: { cellWidth: 15, halign: 'center' },
      almacen: { cellWidth: 25, halign: 'left' },
      codigo: { cellWidth: 20, halign: 'left' },
      producto: { cellWidth: 30, halign: 'left' },
      categoria: { cellWidth: 30, halign: 'left' },
      subcategoria: { cellWidth: 25, halign: 'left' },
      descripcion: { cellWidth: 40, halign: 'left' },
      unidad: { cellWidth: 10, halign: 'center' },
      pais: { cellWidth: 20, halign: 'center' },
      stockminimo: { cellWidth: 15, halign: 'right' },
      stock: { cellWidth: 15, halign: 'right' },
      costo: { cellWidth: 15, halign: 'right' },
      estado: { cellWidth: 15, halign: 'center' },
    },
    // didParseCell: function (data) {
    //   // Ejemplo: destacar la última fila (que contiene el Monto Total)
    //   // if (data.row.index === datos.length - 1) {
    //   //   data.cell.styles.halign = 'left'
    //   // }
    //   // if (data.row.index === datos.length - 2) {
    //   //   data.cell.styles.halign = 'left'
    //   // }
    //   // if (data.row.index === datos.length - 3) {
    //   //   data.cell.styles.halign = 'left'
    //   // }
    //   // También puedes aplicar estilo a una fila específica, por ejemplo la de índice 2:
    //   // if (data.row.index === 2) {
    //   //   data.cell.styles.fontStyle = 'italic'
    //   //   data.cell.styles.fillColor = [255, 240, 200]
    //   // }
    // },
    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 30,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoEmpresa) {
          //console.log(`${URL_APIE}${logoEmpresa}`)
          //doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 180, 8, 20, 20)
        }

        // Nombre y datos de empresa
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        // Título centrado
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('REPORTE PRODUCTOS', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
      }
    },
  })

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  return doc
}

export function PDFreporteStockProductosIndividual_img(processedRows) {
  console.log(processedRows.value)
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64

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

  // Helper function to add images (you might need to adjust this based on your image handling)
  const addImageToCell = (imagePath) => {
    try {
      // This should return an image object or data that jsPDF-autoTable can handle
      // You might need to implement proper image loading logic here
      console.log(imagen + imagePath)
      return { image: imagen + imagePath, width: 15, height: 15 }
    } catch (error) {
      console.error('Error loading image:', error)
      return ''
    }
  }

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
    imagen: item.imagen ? addImageToCell(item.imagen) : '', // Handle cases where image might be missing
  }))

  const totalstock = processedRows.value.reduce(
    (sum, dato) => sum + redondear(parseFloat(dato.stock)),
    0,
  )

  const costoTotal = processedRows.value.reduce(
    (sum, dato) => sum + redondear(parseFloat(dato.stock) * parseFloat(dato.costounitario)),
    0,
  )

  // Add summary row (better approach)
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

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      indice: { cellWidth: 10, halign: 'center' },
      codigo: { cellWidth: 30, halign: 'left' },
      producto: { cellWidth: 40, halign: 'left' },
      categoria: { cellWidth: 40, halign: 'left' },
      subcategoria: { cellWidth: 30, halign: 'left' },
      descripcion: { cellWidth: 50, halign: 'left' },
      unidad: { cellWidth: 20, halign: 'center' },
      stock: { cellWidth: 15, halign: 'right' },
      costo: { cellWidth: 15, halign: 'right' },
      imagen: { cellWidth: 40, halign: 'center' },
    },
    startY: 30,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: (data) => {
      // Only add header on first page
      if (data.pageNumber === 1) {
        // Logo
        if (logoEmpresa) {
          try {
            //doc.addImage(logoEmpresa, 'PNG', 180, 8, 20, 20)
          } catch (error) {
            console.error('Error loading logo:', error)
          }
        }

        // Company info
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        // Title
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('REPORTE PRODUCTOS', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
      }

      // Footer with page number
      const pageCount = doc.internal.getNumberOfPages()
      doc.setFontSize(8)
      doc.text(
        `Página ${data.pageNumber} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' },
      )
    },
  })

  return doc
}

export function generarPdfCotizacion(data) {
  console.log(data)
  const comprobanteData = []
  const cotizacionDetalle = data[0]
  console.log(cotizacionDetalle)

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
  console.log(comprobanteData)
  const detallePlano = comprobanteData
  console.log(detallePlano)
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
    { header: 'Precio', dataKey: 'precio' },
    { header: 'Total', dataKey: 'total' },
  ]

  detallePlano.detalle.map((item) => {
    console.log(item)
  })
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

  datos.push(
    { precio: 'SUBTOTAL', total: decimas(subtotal) },
    { precio: 'DESCUENTO', total: decimas(descuento) },
    { precio: 'MONTO TOTAL', total: decimas(montototal) },
  )
  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      indice: { cellWidth: 15, halign: 'center' },
      descripcion: { cellWidth: 50, halign: 'left' },
      cantidad: { cellWidth: 40, halign: 'right' },
      precio: { cellWidth: 40, halign: 'right' },
      total: { cellWidth: 50, halign: 'right' },
    },
    didParseCell: function (data) {
      // Ejemplo: destacar la última fila (que contiene el Monto Total)
      if (data.row.index === datos.length - 1) {
        data.cell.styles.halign = 'left'
      }
      if (data.row.index === datos.length - 2) {
        data.cell.styles.halign = 'left'
      }
      if (data.row.index === datos.length - 3) {
        data.cell.styles.halign = 'left'
      }
    },
    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 50,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoEmpresa) {
          // doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 180, 8, 20, 20)
        }

        // Nombre y datos de empresa
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        // Título centrado
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('COMPROBANTE', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
        console.log(divisaCotizacion)
        const nfactura = cotizacionInfo.nfactura || ''
        const divisa = divisaCotizacion.divisa || ''
        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text('Nro. ' + nfactura, doc.internal.pageSize.getWidth() / 2, 19, {
          align: 'center',
        })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('(Expresados en ' + divisa + ')', doc.internal.pageSize.getWidth() / 2, 22, {
          align: 'center',
        })

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 200, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL CLIENTE:', 5, 35)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano.clienteDisplay, 5, 38)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano.direccion, 5, 41)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano.email, 5, 44)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Venta: ' + cambiarFormatoFecha(detallePlano.fecha), 5, 47)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL VENDEDOR:', 200, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano.usuario, 200, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano.cargo, 200, 41, { align: 'right' })
      }
    },
  })

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  return doc
}

export function PDFfacturaCorreo(detalleVenta) {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const usuario = contenidousuario[0]
  const nombreEmpresa = usuario.empresa.nombre

  const direccionEmpresa = usuario.empresa.direccion
  const telefonoEmpresa = usuario.empresa.telefono
  const logoEmpresa = usuario.empresa.logo // Ruta relativa o base64

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
    { header: 'Precio', dataKey: 'precio' },
    { header: 'Total', dataKey: 'total' },
  ]

  const detallePlano = JSON.parse(JSON.stringify(detalleVenta.value))

  detallePlano[0].detalle[0].map((item) => {
    console.log(item)
  })
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
  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      indice: { cellWidth: 15, halign: 'center' },
      descripcion: { cellWidth: 50, halign: 'left' },
      cantidad: { cellWidth: 40, halign: 'right' },
      precio: { cellWidth: 40, halign: 'right' },
      total: { cellWidth: 50, halign: 'right' },
    },
    didParseCell: function (data) {
      // Ejemplo: destacar la última fila (que contiene el Monto Total)
      if (data.row.index === datos.length - 1) {
        data.cell.styles.halign = 'left'
      }
      if (data.row.index === datos.length - 2) {
        data.cell.styles.halign = 'left'
      }
      if (data.row.index === datos.length - 3) {
        data.cell.styles.halign = 'left'
      }
    },
    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 50,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoEmpresa) {
          //doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 180, 8, 20, 20)
        }

        // Nombre y datos de empresa
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        // Título centrado
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('COMPROBANTE DE VENTA', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
        const nfactura = detallePlano[0].nfactura || ''
        const divisa = detallePlano[0].divisa || ''
        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text('Nro. ' + nfactura, doc.internal.pageSize.getWidth() / 2, 19, {
          align: 'center',
        })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('(Expresados en ' + divisa + ')', doc.internal.pageSize.getWidth() / 2, 22, {
          align: 'center',
        })

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 200, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL CLIENTE:', 5, 35)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          detallePlano[0].cliente +
            ' ' +
            detallePlano[0].nombrecomercial +
            ' ' +
            detallePlano[0].sucursal,
          5,
          38,
        )
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].direccion, 5, 41)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].email, 5, 44)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Venta: ' + cambiarFormatoFecha(detallePlano[0].fecha), 5, 47)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL VENDEDOR:', 200, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].usuario[0].usuario, 200, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].usuario[0].cargo, 200, 41, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Venta a' + detallePlano[0].tipopago, 200, 44, { align: 'right' })
      }
    },
  })
  return doc
}

export function PDFComprovanteVenta(detalleVenta) {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
    { header: 'Precio', dataKey: 'precio' },
    { header: 'Total', dataKey: 'total' },
  ]

  const detallePlano = JSON.parse(JSON.stringify(detalleVenta.value))

  detallePlano[0].detalle[0].map((item) => {
    console.log(item)
  })
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
  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
      minCellHeight: 7,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      indice: { cellWidth: 15, halign: 'center' },
      descripcion: { cellWidth: 50, halign: 'left' },
      cantidad: { cellWidth: 40, halign: 'right' },
      precio: { cellWidth: 40, halign: 'right' },
      total: { cellWidth: 50, halign: 'right' },
    },
    didDrawCell: function (data) {
      if (data.column.dataKey === 'descripcion' && data.cell.section === 'body') {
        const item = detallePlano[0].detalle[0][data.row.index]
        if (item && item.descripcionAdicional) {
          const text = convertirAMayusculas(doc.splitTextToSize(item.descripcionAdicional, 45))
          doc.setFontSize(4)
          doc.setTextColor(100)
          doc.text(
            text,
            data.cell.x + 2,
            data.cell.y + data.cell.height - 1, // justo debajo del texto principal
          )
          doc.setTextColor(0)
        }
      }
    },
    didParseCell: function (data) {
      // Ejemplo: destacar la última fila (que contiene el Monto Total)
      if (data.row.index === datos.length - 1) {
        data.cell.styles.halign = 'left'
      }
      if (data.row.index === datos.length - 2) {
        data.cell.styles.halign = 'left'
      }
      if (data.row.index === datos.length - 3) {
        data.cell.styles.halign = 'left'
      }
    },
    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 50,
    margin: { horizontal: 5 },
    theme: 'striped',

    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoBase64) {
          const pageWidth = doc.internal.pageSize.getWidth() // Ancho total página
          const imgWidth = 20 // Ancho del logo en mm
          const imgHeight = 20 // Alto del logo en mm
          const xPos = pageWidth - imgWidth - 5 // 10mm de margen derecho
          const yPos = 5 // margen superior
          console.log(logoBase64)
          doc.addImage(logoBase64, 'JPEG', xPos, yPos, imgWidth, imgHeight)
        }

        // Nombre y datos de empresa
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        // Título centrado
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('COMPROBANTE DE VENTA', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
        const nfactura = detallePlano[0].nfactura || ''
        const divisa = detallePlano[0].divisa || ''
        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text('Nro. ' + nfactura, doc.internal.pageSize.getWidth() / 2, 19, {
          align: 'center',
        })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('(Expresados en ' + divisa + ')', doc.internal.pageSize.getWidth() / 2, 22, {
          align: 'center',
        })

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 200, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL CLIENTE:', 5, 35)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          detallePlano[0].cliente +
            ' ' +
            detallePlano[0].nombrecomercial +
            ' ' +
            detallePlano[0].sucursal,
          5,
          38,
        )
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].direccion, 5, 41)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].email, 5, 44)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Venta: ' + cambiarFormatoFecha(detallePlano[0].fecha), 5, 47)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL VENDEDOR:', 200, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].usuario[0].usuario, 200, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].usuario[0].cargo, 200, 41, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Venta a' + detallePlano[0].tipopago, 200, 44, { align: 'right' })
      }
    },
  })
  return doc
}

export function PDFreporteVentasPeriodo(filteredCompra, almacen) {
  console.log(filteredCompra, almacen, almacen.value)
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64
  const nombre = idempresa.nombre
  const cargo = idempresa.cargo
  const columns = [
    { header: 'N', dataKey: 'indice' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Cliente', dataKey: 'cliente' },
    { header: 'Sucursal', dataKey: 'sucursal' },
    { header: 'Tipo-Venta', dataKey: 'tipoventa' },
    { header: 'Tipo-Pago', dataKey: 'tipopago' },
    { header: 'Nro.Factura', dataKey: 'nfactura' },
    { header: 'Canal', dataKey: 'canal' },
    { header: 'Total', dataKey: 'total' },
    { header: 'Dscto', dataKey: 'descuento' },
    { header: 'Monto', dataKey: 'ventatotal' },
  ]
  // filteredCompra.value.reduce((sum, row) => sum + Number(row.total), 0)
  const datos = filteredCompra.value.map((item, indice) => ({
    indice: indice + 1,
    fecha: cambiarFormatoFecha(item.fecha),
    cliente: item.cliente,
    sucursal: item.sucursal,
    tipoventa: tipo[item.tipoventa],
    tipopago: item.tipopago,
    nfactura: item.nfactura,
    canal: item.canal,
    total: item.total,
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

  console.log(almacen.value)
  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      indice: { cellWidth: 10, halign: 'center' },
      fecha: { cellWidth: 15, halign: 'left' },
      cliente: { cellWidth: 25, halign: 'left' },
      sucursal: { cellWidth: 25, halign: 'left' },
      tipoventa: { cellWidth: 25, halign: 'center' },
      tipopago: { cellWidth: 15, halign: 'center' },
      nfactura: { cellWidth: 15, halign: 'center' },
      canal: { cellWidth: 20, halign: 'left' },
      total: { cellWidth: 15, halign: 'right' },
      descuento: { cellWidth: 15, halign: 'right' },
      ventatotal: { cellWidth: 15, halign: 'right' },
    },
    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 45,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoEmpresa) {
          //doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 180, 8, 20, 20)
        }

        // Nombre y datos de empresa
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        // Título centrado
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('REPORTE VENTAS', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' })

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 200, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE', 5, 35)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Nombre del Almacen: ' + (almacen.value?.label || 'Todo los Almacenes'), 5, 38)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Impresion: ' + cambiarFormatoFecha(obtenerFechaActualDato()), 5, 41)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL ENCARGADO:', 200, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(nombre, 200, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(cargo, 200, 41, { align: 'right' })
      }
    },
  })
  return doc
}

export async function PDFenviarFacturaCorreo(idcliente, detalleVenta, $q) {
  const contenidousuario = validarUsuario()
  //const doc = new jsPDF({ orientation: 'portrait' })

  const usuario = contenidousuario[0]
  const nombreEmpresa = usuario.empresa.nombre
  const email_emizor = usuario.empresa.email
  const idempresa = usuario.empresa.idempresa
  const direccionEmpresa = usuario.empresa.direccion
  const telefonoEmpresa = usuario.empresa.telefono

  const detallePlano = JSON.parse(JSON.stringify(detalleVenta.value))
  const doc = PDFfacturaCorreo(detalleVenta)
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

export async function PDFenviarComprobanteCorreo(idcliente, data, $q) {
  const contenidousuario = validarUsuario()
  //const doc = new jsPDF({ orientation: 'portrait' })
  console.log(idcliente)
  const usuario = contenidousuario[0]
  const nombreEmpresa = usuario.empresa.nombre
  const email_emizor = usuario.empresa.email
  const idempresa = usuario.empresa.idempresa
  const direccionEmpresa = usuario.empresa.direccion
  const telefonoEmpresa = usuario.empresa.telefono

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
    formData.append('invoiceNumber', '-')
    formData.append('clientName', data[0]?.cliente)
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
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64

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

  console.log(datos)
  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      indice: { cellWidth: 15, halign: 'center' },
      descripcion: { cellWidth: 50, halign: 'left' },
      cantidad: { cellWidth: 40, halign: 'right' },
      precio: { cellWidth: 40, halign: 'right' },
      total: { cellWidth: 50, halign: 'right' },
    },
    didParseCell: function (data) {
      // Ejemplo: destacar la última fila (que contiene el Monto Total)
      if (data.row.index === datos.length - 1) {
        data.cell.styles.halign = 'left'
      }
      if (data.row.index === datos.length - 2) {
        data.cell.styles.halign = 'left'
      }
      if (data.row.index === datos.length - 3) {
        data.cell.styles.halign = 'left'
      }
      // También puedes aplicar estilo a una fila específica, por ejemplo la de índice 2:
      // if (data.row.index === 2) {
      //   data.cell.styles.fontStyle = 'italic'
      //   data.cell.styles.fillColor = [255, 240, 200]
      // }
    },
    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 50,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoEmpresa) {
          //doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 180, 8, 20, 20)
        }

        // Nombre y datos de empresa
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        // Título centrado
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('COMPROBANTE DE VENTA', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
        const nfactura = detallePlano[0].nfactura || ''
        const divisa = detallePlano[0].divisa || ''
        doc.setFontSize(10)
        doc.setFont(undefined, 'normal')
        doc.text('Nro. ' + nfactura, doc.internal.pageSize.getWidth() / 2, 19, {
          align: 'center',
        })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('(Expresados en ' + divisa + ')', doc.internal.pageSize.getWidth() / 2, 22, {
          align: 'center',
        })

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 200, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL CLIENTE:', 5, 35)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          detallePlano[0].cliente +
            ' ' +
            detallePlano[0].nombrecomercial +
            ' ' +
            detallePlano[0].sucursal,
          5,
          38,
        )
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].direccion, 5, 41)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].email, 5, 44)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Venta: ' + cambiarFormatoFecha(detallePlano[0].fecha), 5, 47)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL VENDEDOR:', 200, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].usuario[0].usuario, 200, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(detallePlano[0].usuario[0].cargo, 200, 41, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Venta a' + detallePlano[0].tipopago, 200, 44, { align: 'right' })
      }
    },
  })

  return doc
}

export async function PDFenviarFacturaCorreoAlInicio(idcliente, detalleVenta, $q) {
  const contenidousuario = validarUsuario()
  //const doc = new jsPDF({ orientation: 'portrait' })

  const usuario = contenidousuario[0]
  const nombreEmpresa = usuario.empresa.nombre
  const email_emizor = usuario.empresa.email
  const idempresa = usuario.empresa.idempresa
  const direccionEmpresa = usuario.empresa.direccion
  const telefonoEmpresa = usuario.empresa.telefono

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

export function DPFReporteCotizacion(cotizaciones) {
  console.log(cotizaciones.value)
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Base64 string or URL

  // Columns for jsPDF-autoTable
  const columns = [
    { header: 'N', dataKey: 'nro' },
    { header: 'Fecha', dataKey: 'fecha' }, // Match actual field names from API
    { header: 'Cliente', dataKey: 'cliente' },
    { header: 'Comercial', dataKey: 'sucursal' },
    { header: 'Monto', dataKey: 'cotizaciontotal' },
    { header: 'Desc.', dataKey: 'descuento' },
    { header: 'Total.', dataKey: 'total' },

    // { header: 'Foto', dataKey: 'foto_detalle_cobro' }, // Images in autoTable are more complex
  ]
  const datos = cotizaciones.value.map((key) => ({
    nro: key.nro,
    fecha: cambiarFormatoFecha(key.fecha),
    cliente: key.cliente,
    sucursal: key.sucursal,
    descuento: decimas(key.descuento),
    cotizaciontotal: decimas(key.cotizaciontotal),
    total: decimas(redondear(parseFloat(key.cotizaciontotal) + parseFloat(key.descuento))),
  }))
  // Data for jsPDF-autoTable - map from `reportData.
  // value`

  const cotizaciontotal = datos.reduce((sum, u) => {
    return decimas(parseFloat(sum) + parseFloat(u.cotizaciontotal))
  }, 0)
  console.log(cotizaciontotal)
  const descuento = datos.reduce((sum, u) => {
    return decimas(parseFloat(sum) + parseFloat(u.descuento))
  }, 0)
  const total = datos.reduce((sum, u) => {
    return decimas(parseFloat(sum) + parseFloat(u.total))
  }, 0)

  const pieTable = {
    sucursal: 'Total:',
    cotizaciontotal: parseFloat(cotizaciontotal).toFixed(2),
    descuento: parseFloat(descuento).toFixed(2),
    total: parseFloat(total).toFixed(2),
  }
  datos.push(pieTable)
  console.log(datos)

  autoTable(doc, {
    columns: columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 6, // Slightly increased for readability
      cellPadding: 1, // Reduced padding to fit more columns
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
      fontSize: 7, // Header font size
    },
    columnStyles: {
      nro: { cellWidth: 15, halign: 'center' }, // Adjusted width
      fecha: { cellWidth: 25, halign: 'center' },
      cliente: { cellWidth: 50, halign: 'left' },
      sucursal: { cellWidth: 50, halign: 'left' },
      descuento: { cellWidth: 20, halign: 'right' },
      cotizaciontotal: { cellWidth: 20, halign: 'right' },
      total: { cellWidth: 20, halign: 'right' },

      // photo_detalle_cobro: { cellWidth: 20, halign: 'center' }, // If you re-add photo, adjust width
    },
    startY: 30,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      // Use 'data' parameter provided by autoTable
      // Only draw header on the first page
      // Or draw on every page: if (doc.internal.getNumberOfPages() === 1) { ... }
      // This header will appear on every page for multi-page reports
      doc.setFontSize(7)
      doc.setFont(undefined, 'normal') // Reset font style

      // Header content
      doc.setDrawColor(0) // Black
      doc.setLineWidth(0.2) // Line thickness

      // Line before header
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoEmpresa && logoEmpresa.startsWith('data:image')) {
          //doc.addImage(logoEmpresa, 'PNG', 180, 8, 20, 20) // Adjust x, y, width, height
        }
        // If logoEmpresa is a URL, it's more complex. Consider using it as Base64.
        // doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 180, 8, 20, 20) // If using URL, uncomment and ensure URL_APIE is defined

        // Company Info (Left)
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        // Report Title (Center)
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('REPORTE COTIZACIONES', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })

        // Line after header before data section

        // Report Data Info (Left below line)
      }
      // Logo (if base64)

      // Footer (Page Number)
      const pageNumber = doc.internal.getNumberOfPages()
      doc.setFontSize(8)
      doc.text(
        `Página ${pageNumber}`,
        doc.internal.pageSize.getWidth() - 15,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'right' },
      )
      doc.text(
        `Fecha de Impresión: ${cambiarFormatoFecha(obtenerFechaActualDato())}`,
        15,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'left' },
      )
    },
  })

  // Set the PDF data URL and show the modal didParseCell
  return doc
}

export function PDFConprovanteCotizacion(cotizacion) {
  console.log(cotizacion[0].detalle)
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const usuario = contenidousuario[0]
  const nombreEmpresa = usuario.empresa.nombre
  const direccionEmpresa = usuario.empresa.direccion
  const telefonoEmpresa = usuario.empresa.telefono
  const logoEmpresa = usuario.empresa.logo

  const columns = [
    { header: 'N°', dataKey: 'nro' },
    { header: 'Codigo', dataKey: 'codigoProducto' },
    { header: 'Producto', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
    { header: 'Precio', dataKey: 'precio' },
    { header: 'SubTotal', dataKey: 'subtotal' },
  ]

  const datos = cotizacion[0].detalle.map((key, indice) => ({
    nro: indice + 1,
    codigoProducto: key.codigoProducto,
    descripcion: key.descripcion,
    cantidad: key.cantidad,
    precio: decimas(parseFloat(key.precio)),
    subtotal: decimas(parseFloat(key.cantidad) * parseFloat(key.precio)),
  }))
  const total = datos.reduce((sum, u) => {
    return decimas(parseFloat(sum) + parseFloat(u.subtotal))
  }, 0)

  const pieTable = {
    precio: 'Total:',
    subtotal: decimas(parseFloat(total)),
  }
  datos.push(pieTable)

  autoTable(doc, {
    columns: columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 6,
      cellPadding: 1,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
      fontSize: 7,
    },

    columnStyles: {
      nro: { cellWidth: 15, halign: 'center' },
      codigoProducto: { cellWidth: 50, halign: 'left' },
      descripcion: { cellWidth: 50, halign: 'left' },
      cantidad: { cellWidth: 30, halign: 'right' },
      precio: { cellWidth: 25, halign: 'right' },
      subtotal: { cellWidth: 30, halign: 'right' },
    },
    startY: 30,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      doc.setFontSize(7)
      doc.setFont(undefined, 'normal')
      doc.setDrawColor(0) // Black
      doc.setLineWidth(0.2) // Line thickness
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoEmpresa && logoEmpresa.startsWith('data:image')) {
          //doc.addImage(logoEmpresa, 'PNG', 180, 8, 20, 20) // Adjust x, y, width, height
        }
        // If logoEmpresa is a URL, it's more complex. Consider using it as Base64.
        // doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 180, 8, 20, 20) // If using URL, uncomment and ensure URL_APIE is defined

        // Company Info (Left)
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        // Report Title (Center)
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('COMPROBANTE', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })

        // Line after header before data section

        // Report Data Info (Left below line)
      }
      // Logo (if base64)

      // Footer (Page Number)
      const pageNumber = doc.internal.getNumberOfPages()
      doc.setFontSize(8)
      doc.text(
        `Página ${pageNumber}`,
        doc.internal.pageSize.getWidth() - 15,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'right' },
      )
      doc.text(
        `Fecha de Impresión: ${cambiarFormatoFecha(obtenerFechaActualDato())}`,
        15,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'left' },
      )
    },
  })
  return doc
}

export function PDFextrabiosRobos(extravios) {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Base64 string or URL

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
  // Data for jsPDF-autoTable - map from `reportData.
  // value

  autoTable(doc, {
    columns: columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 6, // Slightly increased for readability
      cellPadding: 1, // Reduced padding to fit more columns
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
      fontSize: 7, // Header font size
    },
    columnStyles: {
      nro: { cellWidth: 15, halign: 'center' }, // Adjusted width
      fecha: { cellWidth: 30, halign: 'center' },
      almacen: { cellWidth: 50, halign: 'left' },
      descripcion: { cellWidth: 80, halign: 'left' },
      autorizacion: { cellWidth: 20, halign: 'left' },

      // photo_detalle_cobro: { cellWidth: 20, halign: 'center' }, // If you re-add photo, adjust width
    },
    startY: 30,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      // Use 'data' parameter provided by autoTable
      // Only draw header on the first page
      // Or draw on every page: if (doc.internal.getNumberOfPages() === 1) { ... }
      // This header will appear on every page for multi-page reports
      doc.setFontSize(7)
      doc.setFont(undefined, 'normal') // Reset font style

      // Header content
      doc.setDrawColor(0) // Black
      doc.setLineWidth(0.2) // Line thickness

      // Line before header
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoEmpresa && logoEmpresa.startsWith('data:image')) {
          //doc.addImage(logoEmpresa, 'PNG', 180, 8, 20, 20) // Adjust x, y, width, height
        }
        // If logoEmpresa is a URL, it's more complex. Consider using it as Base64.
        // doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 180, 8, 20, 20) // If using URL, uncomment and ensure URL_APIE is defined

        // Company Info (Left)
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        // Report Title (Center)
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('REPORTE DE MERMAS', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })

        // Line after header before data section

        // Report Data Info (Left below line)
      }
      // Logo (if base64)

      // Footer (Page Number)
      const pageNumber = doc.internal.getNumberOfPages()
      doc.setFontSize(8)
      doc.text(
        `Página ${pageNumber}`,
        doc.internal.pageSize.getWidth() - 15,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'right' },
      )
      doc.text(
        `Fecha de Impresión: ${cambiarFormatoFecha(obtenerFechaActualDato())}`,
        15,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'left' },
      )
    },
  })

  // Set the PDF data URL and show the modal didParseCell
  return doc
}

export function PDFComprovanteExtravio(detalleExtravio) {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Codigo', dataKey: 'codigo' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
  ]
  console.log(detalleExtravio)

  const datos = detalleExtravio.map((item, indice) => ({
    indice: indice + 1,
    ...item,
  }))
  console.log(datos)

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      indice: { cellWidth: 15, halign: 'center' },
      codigo: { cellWidth: 50, halign: 'left' },
      descripcion: { cellWidth: 70, halign: 'left' },
      cantidad: { cellWidth: 65, halign: 'right' },
    },

    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 30,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoEmpresa) {
          //doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 180, 8, 20, 20)
        }

        // Nombre y datos de empresa
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        // Título centrado
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('COMPROBANTE DE EXTRAVIO', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
      }
    },
  })
  return doc
}

export function PDFreporteMermas(mermas) {
  console.log(mermas)

  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Base64 string or URL

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
  // Data for jsPDF-autoTable - map from `reportData.
  // value

  autoTable(doc, {
    columns: columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 6, // Slightly increased for readability
      cellPadding: 1, // Reduced padding to fit more columns
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
      fontSize: 7, // Header font size
    },
    columnStyles: {
      nro: { cellWidth: 15, halign: 'center' }, // Adjusted width
      fecha: { cellWidth: 30, halign: 'center' },
      almacen: { cellWidth: 50, halign: 'left' },
      descripcion: { cellWidth: 80, halign: 'left' },
      autorizacion: { cellWidth: 20, halign: 'left' },

      // photo_detalle_cobro: { cellWidth: 20, halign: 'center' }, // If you re-add photo, adjust width
    },
    startY: 30,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      // Use 'data' parameter provided by autoTable
      // Only draw header on the first page
      // Or draw on every page: if (doc.internal.getNumberOfPages() === 1) { ... }
      // This header will appear on every page for multi-page reports
      doc.setFontSize(7)
      doc.setFont(undefined, 'normal') // Reset font style

      // Header content
      doc.setDrawColor(0) // Black
      doc.setLineWidth(0.2) // Line thickness

      // Line before header
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoEmpresa && logoEmpresa.startsWith('data:image')) {
          //doc.addImage(logoEmpresa, 'PNG', 180, 8, 20, 20) // Adjust x, y, width, height
        }
        // If logoEmpresa is a URL, it's more complex. Consider using it as Base64.
        // doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 180, 8, 20, 20) // If using URL, uncomment and ensure URL_APIE is defined

        // Company Info (Left)
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        // Report Title (Center)
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('REPORTE DE MERMAS', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })

        // Line after header before data section

        // Report Data Info (Left below line)
      }
      // Logo (if base64)

      // Footer (Page Number)
      const pageNumber = doc.internal.getNumberOfPages()
      doc.setFontSize(8)
      doc.text(
        `Página ${pageNumber}`,
        doc.internal.pageSize.getWidth() - 15,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'right' },
      )
      doc.text(
        `Fecha de Impresión: ${cambiarFormatoFecha(obtenerFechaActualDato())}`,
        15,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'left' },
      )
    },
  })

  // Set the PDF data URL and show the modal didParseCell
  return doc
}

export function PDFComprovanteMerma(detallemerma) {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Codigo', dataKey: 'codigo' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'Cantidad', dataKey: 'cantidad' },
  ]
  console.log(detallemerma)

  const datos = detallemerma.map((item, indice) => ({
    indice: indice + 1,
    ...item,
  }))
  console.log(datos)

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      indice: { cellWidth: 15, halign: 'center' },
      codigo: { cellWidth: 50, halign: 'left' },
      descripcion: { cellWidth: 70, halign: 'left' },
      cantidad: { cellWidth: 65, halign: 'right' },
    },

    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 30,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoEmpresa) {
          //doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 180, 8, 20, 20)
        }

        // Nombre y datos de empresa
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        // Título centrado
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('COMPROBANTE DE MERMA', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
      }
    },
  })
  return doc
}

export function PDFKardex(kardex, almacenLabel, productoLabel, fechaiR, fechafR) {
  console.log(kardex)
  console.log(almacenLabel, productoLabel, fechaiR, fechafR)
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const nombre = idempresa.nombre
  const cargo = idempresa.cargo
  const columns = [
    { header: 'N', dataKey: 'c' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Descripcion', dataKey: 'descripcion' },
    { header: 'Cant. Entrada', dataKey: 'canentrada' },
    { header: 'Cant. Salida', dataKey: 'cansalida' },
    { header: 'Cant. Saldo', dataKey: 'cansaldo' },
    { header: 'Entrada', dataKey: 'ingreso' },
    { header: 'Salida', dataKey: 'egreso' },
    { header: 'Saldo', dataKey: 'saldoT' },
  ]
  // filteredCompra.value.reduce((sum, row) => sum + Number(row.total), 0)
  const datos = kardex.map((item) => ({
    c: item.c,
    fecha: cambiarFormatoFecha(item.fecha),
    descripcion: item.descripcion,
    canentrada: item.canentrada,
    cansalida: item.cansalida,
    cansaldo: item.cansaldo,
    ingreso: item.ingreso,
    egreso: item.egreso,
    saldoT: item.saldoT,
  }))

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [128, 128, 128], // Negro
      textColor: 255,
      halign: 'center',
      fontSize: 7,
      fontStyle: 'bold',
    },
    columnStyles: {
      c: { cellWidth: 15, halign: 'center' },
      fecha: { cellWidth: 20, halign: 'center' },
      descripcion: { cellWidth: 35, halign: 'left' },
      canentrada: { cellWidth: 20, halign: 'right' },
      cansalida: { cellWidth: 20, halign: 'right' },
      cansaldo: { cellWidth: 20, halign: 'right' },
      ingreso: { cellWidth: 20, halign: 'right' },
      egreso: { cellWidth: 20, halign: 'right' },
      saldoT: { cellWidth: 25, halign: 'right' },
    },
    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 46,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoBase64) {
          const pageWidth = doc.internal.pageSize.getWidth() // Ancho total página
          const imgWidth = 20 // Ancho del logo en mm
          const imgHeight = 20 // Alto del logo en mm
          const xPos = pageWidth - imgWidth - 10 // 10mm de margen derecho
          const yPos = 5 // margen superior

          doc.addImage(logoBase64, 'JPEG', xPos, yPos, imgWidth, imgHeight)
        }

        // Nombre y datos de empresa
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        // Título centrado
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('REPORTE KARDEX', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Entre ' + fechaiR + ' Y ' + fechafR, doc.internal.pageSize.getWidth() / 2, 18, {
          align: 'center',
        })

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 200, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE', 5, 35)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Almacén: ' + almacenLabel, 5, 38)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Producto: ' + productoLabel, 5, 41)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Impresion: ' + cambiarFormatoFecha(obtenerFechaActualDato()), 5, 44)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL ENCARGADO:', 200, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(nombre, 200, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(cargo, 200, 41, { align: 'right' })
      }
    },
  })
  return doc
}

export function PDFCierreCaja(datosCierreCaja) {
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const nombre = idempresa.nombre
  const cargo = idempresa.cargo

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
  doc.text(nombre, 200, 38, { align: 'right' })
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
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const nombre = idempresa.nombre
  const cargo = idempresa.cargo
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
    { header: 'Esatado', dataKey: 'estado' },
  ]

  const datos = ordenados.value.map((item, indice) => ({
    indice: indice + 1,
    fecha: item.fecha,
    codigo: item.codigo,
    nropedido: item.nropedido,
    tipopedido: Number(item.tipopedido) === 1 ? 'Pedido Compra' : 'Pedido Movimiento',
    almacenorigen: item.almacenorigen,
    almacen: item.almacen,
    observacion: item.observacion,
    estado: tipoestados[Number(item.estado)],
    autorizacion: item.autorizacion == 2 ? 'No Autorizado' : 'Autorizado',
  }))

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [128, 128, 128], // Negro
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      indice: { cellWidth: 10, halign: 'center' },
      fecha: { cellWidth: 15, halign: 'left' },
      codigo: { cellWidth: 25, halign: 'left' },
      nropedido: { cellWidth: 10, halign: 'center' },
      tipopedido: { cellWidth: 25, halign: 'left' },
      almacenorigen: { cellWidth: 20, halign: 'left' },
      almacen: { cellWidth: 20, halign: 'left' },
      observacion: { cellWidth: 35, halign: 'left' },
      estado: { cellWidth: 15, halign: 'left' },
      autorizacion: { cellWidth: 20, halign: 'left' },
    },
    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 45,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoBase64) {
          const pageWidth = doc.internal.pageSize.getWidth() // Ancho total página
          const imgWidth = 20 // Ancho del logo en mm
          const imgHeight = 20 // Alto del logo en mm
          const xPos = pageWidth - imgWidth - 10 // 10mm de margen derecho
          const yPos = 5 // margen superior

          doc.addImage(logoBase64, 'JPEG', xPos, yPos, imgWidth, imgHeight)
        }

        // Nombre y datos de empresa
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        // Título centrado
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('PEDIDOS', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' })

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 200, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE', 5, 35)
        console.log(filtroAlmacen.value)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          'Nombre del Almacen: ' + (filtroAlmacen.value?.label || 'Todos los Almacenes'),
          5,
          38,
        )

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Impresion: ' + cambiarFormatoFecha(obtenerFechaActualDato()), 5, 41)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL ENCARGADO:', 200, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(nombre, 200, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(cargo, 200, 41, { align: 'right' })
      }
    },
  })
  return doc
}

export function PDFalmacenes(props) {
  console.log(props.rows) // ✅ Acceso correcto a los datos reactivos

  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Nombre', dataKey: 'nombre' },
    { header: 'Codigo', dataKey: 'codigo' },
    { header: 'Dirección', dataKey: 'direccion' },
    { header: 'Teléfono', dataKey: 'telefono' },
    { header: 'Email', dataKey: 'email' },
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
    telefono: item.telefono,
    email: item.email,
    tipoalmacen: item.tipoalmacen,
    stockmin: item.stockmin,
    stockmax: item.stockmax,
    sucursal: item.sucursales?.[0]?.nombre || '-', // en caso de tener relación
    estado: Number(item.estado) === 1 ? 'Activo' : 'Inactivo',
  }))

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      indice: { cellWidth: 10, halign: 'center' },
      nombre: { cellWidth: 15, halign: 'left' },
      codigo: { cellWidth: 15, halign: 'left' },
      direccion: { cellWidth: 30, halign: 'left' },
      telefono: { cellWidth: 15, halign: 'right' },
      email: { cellWidth: 30, halign: 'left' },
      tipoalmacen: { cellWidth: 15, halign: 'left' },
      stockmin: { cellWidth: 15, halign: 'center' },
      stockmax: { cellWidth: 15, halign: 'center' },
      sucursal: { cellWidth: 25, halign: 'left' },
      estado: { cellWidth: 15, halign: 'center' },
    },
    startY: 45,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoBase64) {
          const pageWidth = doc.internal.pageSize.getWidth() // Ancho total página
          const imgWidth = 20 // Ancho del logo en mm
          const imgHeight = 20 // Alto del logo en mm
          const xPos = pageWidth - imgWidth - 10 // 10mm de margen derecho
          const yPos = 5 // margen superior
          console.log(logoBase64)
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
        doc.text('ALMACENES', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' })
      }
    },
  })

  return doc
}
export function PDF_REPORTE_DE_ROTACION_POR_ALMACEN(reporte, datosFormulario) {
  // ✅ Acceso correcto a los datos reactivos
  console.log(reporte)
  console.log(datosFormulario)

  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono

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

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      index: { cellWidth: 10, halign: 'center' },
      codigo: { cellWidth: 20, halign: 'left' },
      producto: { cellWidth: 30, halign: 'left' },
      categoria: { cellWidth: 20, halign: 'left' },
      descripcion: { cellWidth: 40, halign: 'left' },
      unidad: { cellWidth: 20, halign: 'left' },
      cantidadventas: { cellWidth: 20, halign: 'right' },
      cantidadIE: { cellWidth: 20, halign: 'right' },
      r: { cellWidth: 20, halign: 'right' },
    },
    startY: 45,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoBase64) {
          const pageWidth = doc.internal.pageSize.getWidth() // Ancho total página
          const imgWidth = 20 // Ancho del logo en mm
          const imgHeight = 20 // Alto del logo en mm
          const xPos = pageWidth - imgWidth - 5 // 10mm de margen derecho
          const yPos = 5 // margen superior
          console.log(logoBase64)
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
        doc.text(
          'REPORTE DE INDICE DE ROTACION POR ALMACEN',
          doc.internal.pageSize.getWidth() / 2,
          15,
          { align: 'center' },
        )
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          'ENTRE ' + datosFormulario.fechaInicio + ' Y ' + datosFormulario.fechaFin,
          doc.internal.pageSize.getWidth() / 2,
          18,
          {
            align: 'center',
          },
        )

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 205, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE', 5, 35)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Almacén: ' + datosFormulario.almacen, 5, 38)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Impresion: ' + cambiarFormatoFecha(obtenerFechaActualDato()), 5, 41)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL ENCARGADO:', 205, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(datosFormulario.usuario.nombre, 205, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(datosFormulario.usuario.cargo, 205, 41, { align: 'right' })
      }
    },
  })

  return doc
}

export function PDF_REPORTE_DE_ROTACION_POR_CLIENTE(reporte, datosFormulario) {
  // ✅ Acceso correcto a los datos reactivos
  console.log(reporte)
  console.log(datosFormulario)

  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono

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

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      index: { cellWidth: 10, halign: 'center' },
      codigo: { cellWidth: 20, halign: 'left' },
      producto: { cellWidth: 30, halign: 'left' },
      categoria: { cellWidth: 20, halign: 'left' },
      descripcion: { cellWidth: 40, halign: 'left' },
      unidad: { cellWidth: 20, halign: 'left' },
      cantidadventas: { cellWidth: 20, halign: 'right' },
      cantidadIE: { cellWidth: 20, halign: 'right' },
      r: { cellWidth: 20, halign: 'right' },
    },
    startY: 45,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoBase64) {
          const pageWidth = doc.internal.pageSize.getWidth() // Ancho total página
          const imgWidth = 20 // Ancho del logo en mm
          const imgHeight = 20 // Alto del logo en mm
          const xPos = pageWidth - imgWidth - 5 // 10mm de margen derecho
          const yPos = 5 // margen superior
          console.log(logoBase64)
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
        doc.text(
          'REPORTE DE INDICE DE ROTACION POR CLIENTE',
          doc.internal.pageSize.getWidth() / 2,
          15,
          { align: 'center' },
        )
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          'ENTRE ' + datosFormulario.fechaInicio + ' Y ' + datosFormulario.fechaFin,
          doc.internal.pageSize.getWidth() / 2,
          18,
          {
            align: 'center',
          },
        )

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 205, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE', 5, 35)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          'Razon Social: ' + datosFormulario.cliente + ' / ' + datosFormulario.sucursal,
          5,
          38,
        )

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Impresion: ' + cambiarFormatoFecha(obtenerFechaActualDato()), 5, 41)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL ENCARGADO:', 205, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(datosFormulario.usuario.nombre, 205, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(datosFormulario.usuario.cargo, 205, 41, { align: 'right' })
      }
    },
  })

  return doc
}

export function PDF_REPORTE_DE_ROTACION_POR_GLOBAL(reporte, datosFormulario) {
  // ✅ Acceso correcto a los datos reactivos
  console.log(reporte)
  console.log(datosFormulario)

  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono

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

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      index: { cellWidth: 10, halign: 'center' },
      codigo: { cellWidth: 20, halign: 'left' },
      producto: { cellWidth: 30, halign: 'left' },
      categoria: { cellWidth: 20, halign: 'left' },
      descripcion: { cellWidth: 40, halign: 'left' },
      unidad: { cellWidth: 20, halign: 'left' },
      cantidadventas: { cellWidth: 20, halign: 'right' },
      cantidadIE: { cellWidth: 20, halign: 'right' },
      r: { cellWidth: 20, halign: 'right' },
    },
    startY: 45,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoBase64) {
          const pageWidth = doc.internal.pageSize.getWidth() // Ancho total página
          const imgWidth = 20 // Ancho del logo en mm
          const imgHeight = 20 // Alto del logo en mm
          const xPos = pageWidth - imgWidth - 5 // 10mm de margen derecho
          const yPos = 5 // margen superior
          console.log(logoBase64)
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
        doc.text('REPORTE DE INDICE DE ROTACION GLOBAL', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          'ENTRE ' + datosFormulario.fechaInicio + ' Y ' + datosFormulario.fechaFin,
          doc.internal.pageSize.getWidth() / 2,
          18,
          {
            align: 'center',
          },
        )

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 205, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE', 5, 35)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Almacen: ' + datosFormulario.almacen, 5, 38)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Impresion: ' + cambiarFormatoFecha(obtenerFechaActualDato()), 5, 41)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL ENCARGADO:', 205, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(datosFormulario.usuario.nombre, 205, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(datosFormulario.usuario.cargo, 205, 41, { align: 'right' })
      }
    },
  })

  return doc
}
export function PDF_REPORTE_CAMPANAS(reporte, datosFormulario) {
  // ✅ Acceso correcto a los datos reactivos
  console.log(reporte)
  console.log(datosFormulario)

  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono

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

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      n: { cellWidth: 10, halign: 'center' },
      almacen: { cellWidth: 30, halign: 'left' },
      nombre: { cellWidth: 40, halign: 'left' },
      porcentaje: { cellWidth: 30, halign: 'left' },
      fechainicio: { cellWidth: 30, halign: 'left' },
      fechafinal: { cellWidth: 30, halign: 'left' },
      est: { cellWidth: 30, halign: 'right' },
    },
    startY: 45,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoBase64) {
          const pageWidth = doc.internal.pageSize.getWidth() // Ancho total página
          const imgWidth = 20 // Ancho del logo en mm
          const imgHeight = 20 // Alto del logo en mm
          const xPos = pageWidth - imgWidth - 5 // 10mm de margen derecho
          const yPos = 5 // margen superior
          console.log(logoBase64)
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
        doc.text('REPORTE DE INDICE DE ROTACION GLOBAL', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          'ENTRE ' + datosFormulario.fechaInicio + ' Y ' + datosFormulario.fechaFin,
          doc.internal.pageSize.getWidth() / 2,
          18,
          {
            align: 'center',
          },
        )

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 205, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE', 5, 35)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Almacen: ' + datosFormulario.almacen, 5, 38)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Impresion: ' + cambiarFormatoFecha(obtenerFechaActualDato()), 5, 41)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL ENCARGADO:', 205, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(datosFormulario.usuario.nombre, 205, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(datosFormulario.usuario.cargo, 205, 41, { align: 'right' })
      }
    },
  })

  return doc
}
export function PDF_REPORTE_CAMPANAS_VENTAS(reporte, datosFormulario) {
  // ✅ Acceso correcto a los datos reactivos
  console.log(reporte)
  console.log(datosFormulario)

  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono

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

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      n: { cellWidth: 10, halign: 'center' },
      almacen: { cellWidth: 40, halign: 'left' },
      nombre: { cellWidth: 40, halign: 'left' },
      fechainicio: { cellWidth: 40, halign: 'left' },
      fechafinal: { cellWidth: 30, halign: 'left' },
      nventas: { cellWidth: 40, halign: 'right' },
    },
    startY: 45,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoBase64) {
          const pageWidth = doc.internal.pageSize.getWidth() // Ancho total página
          const imgWidth = 20 // Ancho del logo en mm
          const imgHeight = 20 // Alto del logo en mm
          const xPos = pageWidth - imgWidth - 5 // 10mm de margen derecho
          const yPos = 5 // margen superior
          console.log(logoBase64)
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
        doc.text('REPORTE DE INDICE DE ROTACION GLOBAL', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          'ENTRE ' + datosFormulario.fechaInicio + ' Y ' + datosFormulario.fechaFin,
          doc.internal.pageSize.getWidth() / 2,
          18,
          {
            align: 'center',
          },
        )

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 205, 30) // De (x1=5, y1=25) a (x2=200, y2=25)nventas

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE', 5, 35)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Almacen: ' + datosFormulario.almacen, 5, 38)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Impresion: ' + cambiarFormatoFecha(obtenerFechaActualDato()), 5, 41)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL ENCARGADO:', 205, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(datosFormulario.usuario.nombre, 205, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(datosFormulario.usuario.cargo, 205, 41, { align: 'right' })
      }
    },
  })

  return doc
}
export function PDF_REPORTE_MOVIMIENTOS(reporte, datosFormulario) {
  // ✅ Acceso correcto a los datos reactivos
  console.log(reporte)
  console.log(datosFormulario)

  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono

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

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      n: { cellWidth: 10, halign: 'center' },
      fecha: { cellWidth: 40, halign: 'left' },
      almacenorigen: { cellWidth: 40, halign: 'left' },
      almacendestino: { cellWidth: 40, halign: 'left' },
      descripcion: { cellWidth: 30, halign: 'left' },
      aut: { cellWidth: 40, halign: 'right' },
    },
    startY: 45,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoBase64) {
          const pageWidth = doc.internal.pageSize.getWidth() // Ancho total página
          const imgWidth = 20 // Ancho del logo en mm
          const imgHeight = 20 // Alto del logo en mm
          const xPos = pageWidth - imgWidth - 5 // 10mm de margen derecho
          const yPos = 5 // margen superior
          console.log(logoBase64)
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
        doc.text('REPORTE DE INDICE DE ROTACION GLOBAL', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          'ENTRE ' + datosFormulario.fechaInicio + ' Y ' + datosFormulario.fechaFin,
          doc.internal.pageSize.getWidth() / 2,
          18,
          {
            align: 'center',
          },
        )

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 205, 30) // De (x1=5, y1=25) a (x2=200, y2=25)nventas

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE', 5, 35)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Almacen: ' + datosFormulario.almacen, 5, 38)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Impresion: ' + cambiarFormatoFecha(obtenerFechaActualDato()), 5, 41)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL ENCARGADO:', 205, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(datosFormulario.usuario.nombre, 205, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(datosFormulario.usuario.cargo, 205, 41, { align: 'right' })
      }
    },
  })

  return doc
}
export function PDF_REPORTE_PEDIDOS(reporte, datosFormulario) {
  // ✅ Acceso correcto a los datos reactivos
  console.log(reporte)
  console.log(datosFormulario)

  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono

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

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      n: { cellWidth: 10, halign: 'center' },
      fecha: { cellWidth: 15, halign: 'left' },
      codigo: { cellWidth: 20, halign: 'left' },
      nropedido: { cellWidth: 20, halign: 'center' },
      tipopedido: { cellWidth: 20, halign: 'left' },
      almacenorigen: { cellWidth: 20, halign: 'right' },
      almacen: { cellWidth: 20, halign: 'right' },
      observacion: { cellWidth: 55, halign: 'right' },
      estado: { cellWidth: 20, halign: 'right' },
    },
    startY: 45,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoBase64) {
          const pageWidth = doc.internal.pageSize.getWidth() // Ancho total página
          const imgWidth = 20 // Ancho del logo en mm
          const imgHeight = 20 // Alto del logo en mm
          const xPos = pageWidth - imgWidth - 5 // 10mm de margen derecho
          const yPos = 5 // margen superior
          console.log(logoBase64)
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
        doc.text('REPORTE PEDIDOS', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          'ENTRE ' + datosFormulario.fechaInicio + ' Y ' + datosFormulario.fechaFin,
          doc.internal.pageSize.getWidth() / 2,
          18,
          {
            align: 'center',
          },
        )

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 205, 30) // De (x1=5, y1=25) a (x2=200, y2=25)nventas

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE', 5, 35)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Almacen: ' + datosFormulario.almacen, 5, 38)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Impresion: ' + cambiarFormatoFecha(obtenerFechaActualDato()), 5, 41)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL ENCARGADO:', 205, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(datosFormulario.usuario.nombre, 205, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(datosFormulario.usuario.cargo, 205, 41, { align: 'right' })
      }
    },
  })

  return doc
}
export function PDF_REPORTE_PRECIO_BASE(reporte, datosFormulario) {
  // ✅ Acceso correcto a los datos reactivos
  console.log(reporte)
  console.log(datosFormulario)

  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono

  const columns = [
    { header: 'N°', dataKey: 'n' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Codigo', dataKey: 'codigo' },
    { header: 'producto', dataKey: 'producto' },
    { header: 'categoria', dataKey: 'categoria' },
    { header: 'Caracteristica', dataKey: 'caracteristica' },
    { header: 'Medida', dataKey: 'medida' },
    { header: 'Descripcion', dataKey: 'descripcion' },
    { header: 'Unidad', dataKey: 'unidad' },
    { header: 'Precio Base', dataKey: 'preciobase' },
  ]

  const datos = reporte.map((item) => ({
    n: item.n,
    fecha: item.fecha,
    codigo: item.codigo,
    producto: item.producto,
    categoria: item.categoria,
    caracteristica: item.caracteristica,
    medida: item.medida,
    descripcion: item.descripcion,
    unidad: item.unidad,
    preciobase: item.preciobase,
  }))

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      n: { cellWidth: 10, halign: 'center' },
      fecha: { cellWidth: 15, halign: 'left' },
      codigo: { cellWidth: 20, halign: 'left' },
      producto: { cellWidth: 20, halign: 'center' },
      categoria: { cellWidth: 20, halign: 'left' },
      caracteristica: { cellWidth: 20, halign: 'right' },
      medida: { cellWidth: 20, halign: 'right' },
      descripcion: { cellWidth: 35, halign: 'right' },
      unidad: { cellWidth: 20, halign: 'right' },
      preciobase: { cellWidth: 20, halign: 'right' },
    },
    startY: 45,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoBase64) {
          const pageWidth = doc.internal.pageSize.getWidth() // Ancho total página
          const imgWidth = 20 // Ancho del logo en mm
          const imgHeight = 20 // Alto del logo en mm
          const xPos = pageWidth - imgWidth - 5 // 10mm de margen derecho
          const yPos = 5 // margen superior
          console.log(logoBase64)
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
        doc.text('REPORTE DE COSTO UNITARIO', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 205, 30) // De (x1=5, y1=25) a (x2=200, y2=25)nventas

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE', 5, 35)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Almacen: ' + datosFormulario.almacen, 5, 38)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Impresion: ' + cambiarFormatoFecha(obtenerFechaActualDato()), 5, 41)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL ENCARGADO:', 205, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(datosFormulario.usuario.nombre, 205, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(datosFormulario.usuario.cargo, 205, 41, { align: 'right' })
      }
    },
  })

  return doc
}
export function PDF_REPORTE_CATEGORIA_PRECIO(reporte, datosFormulario) {
  // ✅ Acceso correcto a los datos reactivos
  console.log(reporte)
  console.log(datosFormulario)

  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono

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

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      n: { cellWidth: 10, halign: 'center' },
      nombre: { cellWidth: 60, halign: 'left' },
      porcentaje: { cellWidth: 40, halign: 'right' },
      almacen: { cellWidth: 60, halign: 'LEFT' },
      estado: { cellWidth: 30, halign: 'center' },
    },
    startY: 45,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoBase64) {
          const pageWidth = doc.internal.pageSize.getWidth() // Ancho total página
          const imgWidth = 20 // Ancho del logo en mm
          const imgHeight = 20 // Alto del logo en mm
          const xPos = pageWidth - imgWidth - 5 // 10mm de margen derecho
          const yPos = 5 // margen superior
          console.log(logoBase64)
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
        doc.text('REPORTE DE PRECIOS BASE', doc.internal.pageSize.getWidth() / 2, 15, {
          align: 'center',
        })
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 205, 30) // De (x1=5, y1=25) a (x2=200, y2=25)nventas

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE', 5, 35)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Almacen: ' + datosFormulario.almacen, 5, 38)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Impresion: ' + cambiarFormatoFecha(obtenerFechaActualDato()), 5, 41)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL ENCARGADO:', 205, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(datosFormulario.usuario.nombre, 205, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(datosFormulario.usuario.cargo, 205, 41, { align: 'right' })
      }
    },
  })

  return doc
}
export function PDF_REPORTE_EXTRAVIO(reporte, datosFormulario) {
  // ✅ Acceso correcto a los datos reactivos
  console.log(reporte)
  console.log(datosFormulario)

  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono

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

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      index: { cellWidth: 10, halign: 'center' },
      fecha: { cellWidth: 20, halign: 'left' },
      almacen: { cellWidth: 30, halign: 'left' },
      descripcion: { cellWidth: 110, halign: 'left' },
      autorizacion: { cellWidth: 30, halign: 'left' },
    },
    startY: 45,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoBase64) {
          const pageWidth = doc.internal.pageSize.getWidth() // Ancho total página
          const imgWidth = 20 // Ancho del logo en mm
          const imgHeight = 20 // Alto del logo en mm
          const xPos = pageWidth - imgWidth - 5 // 10mm de margen derecho
          const yPos = 5 // margen superior
          console.log(logoBase64)
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
        doc.text('REPORTE DE ROBOS', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' })
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          'ENTRE ' + datosFormulario.fechaInicio + ' Y ' + datosFormulario.fechaFin,
          doc.internal.pageSize.getWidth() / 2,
          18,
          {
            align: 'center',
          },
        )

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 205, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE', 5, 35)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Almacén: ' + datosFormulario.almacen, 5, 38)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Impresion: ' + cambiarFormatoFecha(obtenerFechaActualDato()), 5, 41)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL ENCARGADO:', 205, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(datosFormulario.usuario.nombre, 205, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(datosFormulario.usuario.cargo, 205, 41, { align: 'right' })
      }
    },
  })

  return doc
}
export function PDF_REPORTE_MERMA(reporte, datosFormulario) {
  // ✅ Acceso correcto a los datos reactivos
  console.log(reporte)
  console.log(datosFormulario)

  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono

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

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: ColoEncabezadoTabla,
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      index: { cellWidth: 10, halign: 'center' },
      fecha: { cellWidth: 20, halign: 'left' },
      almacen: { cellWidth: 30, halign: 'left' },
      descripcion: { cellWidth: 110, halign: 'left' },
      autorizacion: { cellWidth: 30, halign: 'left' },
    },
    startY: 45,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoBase64) {
          const pageWidth = doc.internal.pageSize.getWidth() // Ancho total página
          const imgWidth = 20 // Ancho del logo en mm
          const imgHeight = 20 // Alto del logo en mm
          const xPos = pageWidth - imgWidth - 5 // 10mm de margen derecho
          const yPos = 5 // margen superior
          console.log(logoBase64)
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
        doc.text('REPORTE DE MERMAS', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' })
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          'ENTRE ' + datosFormulario.fechaInicio + ' Y ' + datosFormulario.fechaFin,
          doc.internal.pageSize.getWidth() / 2,
          18,
          {
            align: 'center',
          },
        )

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 205, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE', 5, 35)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Almacén: ' + datosFormulario.almacen, 5, 38)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Impresion: ' + cambiarFormatoFecha(obtenerFechaActualDato()), 5, 41)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL ENCARGADO:', 205, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(datosFormulario.usuario.nombre, 205, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(datosFormulario.usuario.cargo, 205, 41, { align: 'right' })
      }
    },
  })

  return doc
}
export function DPF_REPORTE_PRODUCTO_ASIGNADOS(productoLista) {
  console.log(productoLista.value)
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono

  const columns = [
    { header: 'N°', dataKey: 'indice' },
    { header: 'Código', dataKey: 'codigo' },
    { header: 'Codigo Barra', dataKey: 'codigobarra' },
    { header: 'Categoria', dataKey: 'categoria' },
    { header: 'Sub Categoria', dataKey: 'subcategoria' },
    { header: 'Descripción', dataKey: 'descripcion' },
    { header: 'País', dataKey: 'detalle' },
    { header: 'Unidad', dataKey: 'unidad' },
    { header: 'Característica', dataKey: 'medida' },
    { header: 'Otras características', dataKey: 'caracteristica' },
    { header: 'Estado', dataKey: 'estadoproducto' },
    { header: 'Stock', dataKey: 'stock' },
    { header: 'Stock min', dataKey: 'stockminimo' },
    { header: 'Stock max', dataKey: 'stockmaximo' },
    { header: 'Fecha creación', dataKey: 'fecha' },
  ]

  const datos = productoLista.value.map((item, indice) => ({
    indice: indice + 1,
    codigo: item.codigo,
    codigobarra: item.codigobarra,
    categoria: item.categoria,
    subcategoria: item.subcategoria,
    descripcion: item.descripcion,
    detalle: item.detalle,
    unidad: item.unidad,
    medida: item.medida,
    caracteristica: item.caracteristica,
    estadoproducto: item.estadoproducto,
    stock: item.stock,
    stockminimo: item.stockminimo,
    stockmaximo: item.stockmaximo,
    fecha: cambiarFormatoFecha(item.fecha),
  }))

  autoTable(doc, {
    columns,
    body: datos,
    styles: {
      overflow: 'linebreak',
      fontSize: 5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [22, 160, 133],
      textColor: 255,
      halign: 'center',
    },
    columnStyles: {
      indice: { cellWidth: 8, halign: 'center' },
      codigo: { cellWidth: 15, halign: 'left' },
      codigobarra: { cellWidth: 15, halign: 'left' },
      categoria: { cellWidth: 15, halign: 'left' },
      subcategoria: { cellWidth: 15, halign: 'left' },
      descripcion: { cellWidth: 20, halign: 'left' },
      detalle: { cellWidth: 15, halign: 'left' },
      unidad: { cellWidth: 10, halign: 'center' },
      medida: { cellWidth: 18, halign: 'center' },
      caracteristica: { cellWidth: 18, halign: 'left' },
      estadoproducto: { cellWidth: 10, halign: 'left' },
      stock: { cellWidth: 8, halign: 'right' },
      stockminimo: { cellWidth: 8, halign: 'right' },
      stockmaximo: { cellWidth: 8, halign: 'right' },
      fecha: { cellWidth: 15, halign: 'center' },
    },
    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 30,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        if (logoBase64) {
          const pageWidth = doc.internal.pageSize.getWidth() // Ancho total página
          const imgWidth = 20 // Ancho del logo en mm
          const imgHeight = 20 // Alto del logo en mm
          const xPos = pageWidth - imgWidth - 5 // 10mm de margen derecho
          const yPos = 5 // margen superior
          console.log(logoBase64)
          doc.addImage(logoBase64, 'JPEG', xPos, yPos, imgWidth, imgHeight)
        }

        // Nombre y datos de empresa
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        // Título centrado
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('Productos', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' })
      }
    },
  })

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  return doc
}

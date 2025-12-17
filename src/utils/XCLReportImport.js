import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { validarUsuario } from 'src/composables/FuncionesG'
import * as XLSX from 'xlsx-js-style'

export function exportToXLSX_Reporte_CuentasXCobrarPeriodo(reportData, startDate, endDate) {
  // Prepare data: only include fields that should be in the Excel file
  // and apply any necessary formatting or transformations.
  const datos = reportData.value
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
  const dataForExport = datos.map((row) => {
    return {
      Fecha: row.fecha_actual,

      Cliente: row.nombre_cliente,
      'Nombre Comercial': row.nombre_comercial,

      'Monto Venta': parseFloat(row.monto_total_venta).toFixed(2), // Ensure numeric formatting
      'Descuento Venta': parseFloat(row.descuento_venta).toFixed(2),
      'Saldo Cobro': parseFloat(row.saldo_estado_cobro).toFixed(2),
      'Monto Cobrado': parseFloat(row.monto_detalle_cobro).toFixed(2),
    }
  })

  const worksheet = XLSX.utils.json_to_sheet(dataForExport)

  // Define column widths based on data or sensible defaults
  // Map your data keys to desired widths
  const columnWidths = [
    { wch: 15 }, // Fecha

    { wch: 30 }, // Cliente
    { wch: 30 }, // Nombre Comercial

    { wch: 15 }, // Monto Venta
    { wch: 12 }, // Descuento Venta
    { wch: 15 }, // Saldo Cobro
    { wch: 15 }, // Monto Cobrado
  ]

  worksheet['!cols'] = columnWidths

  // Apply styles to all cells
  const range = XLSX.utils.decode_range(worksheet['!ref'])
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = { c: C, r: R }
      const cell_ref = XLSX.utils.encode_cell(cell_address)
      const cell = worksheet[cell_ref]

      if (!cell) continue // Skip empty cells

      // Default styles for data rows
      let cellStyle = {
        font: {
          name: 'Arial',
          sz: 10,
          color: { rgb: '000000' },
        },
        alignment: {
          horizontal: 'left',
          vertical: 'center',
          wrapText: true,
        },
        border: {
          top: { style: 'thin', color: { rgb: 'D3D3D3' } }, // Light grey borders
          bottom: { style: 'thin', color: { rgb: 'D3D3D3' } },
          left: { style: 'thin', color: { rgb: 'D3D3D3' } },
          right: { style: 'thin', color: { rgb: 'D3D3D3' } },
        },
      }

      // Header row (R === 0) specific styles
      if (R === 0) {
        cellStyle.font = {
          name: 'Arial',
          sz: 11,
          bold: true,
          color: { rgb: 'FFFFFF' }, // White text
        }
        cellStyle.fill = {
          fgColor: { rgb: '4F81BD' }, // Dark blue background for header
        }
        cellStyle.alignment.horizontal = 'center' // Center header text
      } else {
        // Numeric column alignment for data rows
        const numericColumns = ['Monto Venta', 'Descuento Venta', 'Saldo Cobro', 'Monto Cobrado']
        const headerCell = worksheet[XLSX.utils.encode_cell({ c: C, r: 0 })] // Get header cell to check column name
        if (headerCell && numericColumns.includes(headerCell.v)) {
          cellStyle.alignment.horizontal = 'right'
          // Optional: Set number format for currency/decimals
          cell.z = '0.00' // Two decimal places
        }
      }

      cell.s = cellStyle // Apply the determined style
    }
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cobros Diarios')
  const filename = `Reporte_Cobros_Diarios_${startDate.value}_a_${endDate.value}.xlsx`
  XLSX.writeFile(workbook, filename)
}
export function exportToXLSX_Reporte_Creditos(
  reportData,
  startDate,
  endDate,
  clienteSeleccionado = null,
  sucursalSeleccionada = null,
) {
  // Preparar datos excluyendo la fila de totales si ya existe
  const datos = reportData.filter((item) => item.estado !== 5)

  // Calcular totales
  const totalValorCuotas = datos.reduce((sum, u) => sum + parseFloat(u.valorcuotas || 0), 0)
  const totalMontoVenta = datos.reduce((sum, u) => sum + parseFloat(u.montoventa || 0), 0)
  const totalCobrado = datos.reduce((sum, u) => sum + parseFloat(u.totalcobrado || 0), 0)
  const totalSaldo = datos.reduce((sum, u) => sum + parseFloat(u.saldo || 0), 0)
  const totalAtrasado = datos
    .filter((u) => Number(u.estado) === 3)
    .reduce((sum, u) => sum + parseFloat(u.saldo || 0), 0)
  const totalAnulado = datos
    .filter((u) => Number(u.estado) === 4)
    .reduce((sum, u) => sum + parseFloat(u.saldo || 0), 0)

  // Mapear datos para exportación
  const dataForExport = datos.map((row) => ({
    'N°': row.numero,
    'Fecha Crédito': cambiarFormatoFecha(row.fechaventa),
    Cliente: row.razonsocial,
    Sucursal: row.sucursal,
    'Fecha Límite': cambiarFormatoFecha(row.fechalimite),
    Cuotas: row.ncuotas,
    'Cuotas Pagadas': row.cuotaspagadas || '0',
    'Valor Cuota': parseFloat(row.valorcuotas || 0).toFixed(2),
    'Monto Venta': parseFloat(row.montoventa || 0).toFixed(2),
    'Total Cobrado': parseFloat(row.totalcobrado || 0).toFixed(2),
    Saldo: parseFloat(row.saldo || 0).toFixed(2),
    'Días Mora':
      row.fechalimite && Number(row.estado) === 3 ? Math.max(obtenerDias(row.fechalimite), 0) : 0,
    totalAtrasado: totalAtrasado,
    totalAnulado: totalAnulado,
    Estado: getEstadoText(row.estado),
  }))

  // Agregar fila de totales
  dataForExport.push({
    'N°': '',
    'Fecha Crédito': '',
    Cliente: '',
    Sucursal: '',
    'Fecha Límite': '',
    Cuotas: '',
    'Cuotas Pagadas': 'TOTAL:',
    'Valor Cuota': totalValorCuotas.toFixed(2),
    'Monto Venta': totalMontoVenta.toFixed(2),
    'Total Cobrado': totalCobrado.toFixed(2),
    Saldo: totalSaldo.toFixed(2),
    totalAtrasado: totalAtrasado,
    totalAnulado: totalAnulado,
    'Días Mora': '',
    Estado: '',
  })

  // Crear hoja de trabajo
  const worksheet = XLSX.utils.json_to_sheet(dataForExport)

  // Definir anchos de columnas
  const columnWidths = [
    { wch: 5 }, // N°
    { wch: 12 }, // Fecha Crédito
    { wch: 30 }, // Cliente
    { wch: 20 }, // Sucursal
    { wch: 12 }, // Fecha Límite
    { wch: 8 }, // Cuotas
    { wch: 12 }, // Cuotas Pagadas
    { wch: 12 }, // Valor Cuota
    { wch: 12 }, // Monto Venta
    { wch: 12 }, // Total Cobrado
    { wch: 12 }, // Saldo
    { wch: 10 }, // Días Mora
    { wch: 12 }, // Estado
  ]
  worksheet['!cols'] = columnWidths

  // Aplicar estilos a las celdas
  const range = XLSX.utils.decode_range(worksheet['!ref'])
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = { c: C, r: R }
      const cell_ref = XLSX.utils.encode_cell(cell_address)
      const cell = worksheet[cell_ref]

      if (!cell) continue

      // Estilo por defecto
      let cellStyle = {
        font: { name: 'Arial', sz: 10, color: { rgb: '000000' } },
        alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
        border: {
          top: { style: 'thin', color: { rgb: 'D3D3D3' } },
          bottom: { style: 'thin', color: { rgb: 'D3D3D3' } },
          left: { style: 'thin', color: { rgb: 'D3D3D3' } },
          right: { style: 'thin', color: { rgb: 'D3D3D3' } },
        },
      }

      // Estilo para encabezados
      if (R === 0) {
        cellStyle.font = { name: 'Arial', sz: 11, bold: true, color: { rgb: 'FFFFFF' } }
        cellStyle.fill = { fgColor: { rgb: '4F81BD' } } // Azul oscuro
        cellStyle.alignment.horizontal = 'center'
      }
      // Estilo para fila de totales
      else if (R === range.e.r) {
        cellStyle.font = { name: 'Arial', sz: 10, bold: true }
        cellStyle.fill = { fgColor: { rgb: 'F2F2F2' } } // Gris claro
      }
      // Estilo para columnas numéricas
      else {
        const numericColumns = ['Valor Cuota', 'Monto Venta', 'Total Cobrado', 'Saldo', 'Días Mora']
        const headerCell = worksheet[XLSX.utils.encode_cell({ c: C, r: 0 })]
        if (headerCell && numericColumns.includes(headerCell.v)) {
          cellStyle.alignment.horizontal = 'right'
          cell.z = '0.00' // Formato de 2 decimales
        }
      }

      cell.s = cellStyle
    }
  }

  // Crear libro y agregar hoja
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Créditos')

  // Agregar información adicional como encabezado
  const contenidoUsuario = validarUsuario()
  const empresa = contenidoUsuario[0]?.empresa?.nombre || ''
  const usuario = contenidoUsuario[0]?.nombre || ''
  const cargo = contenidoUsuario[0]?.cargo || ''

  // Crear texto de filtros aplicados
  let filtros = `Del ${cambiarFormatoFecha(startDate)} al ${cambiarFormatoFecha(endDate)}`
  if (clienteSeleccionado) filtros += ` | Cliente: ${clienteSeleccionado.nombre}`
  if (sucursalSeleccionada) filtros += ` | Sucursal: ${sucursalSeleccionada.nombre}`

  // Agregar metadatos
  workbook.Props = {
    Title: `Reporte de Créditos - ${empresa}`,
    Subject: 'Reporte de créditos por periodo',
    Author: `${usuario} - ${cargo}`,
    CreatedDate: new Date(),
    Comments: filtros,
  }

  // Generar nombre de archivo
  let filename = `Reporte_Creditos_${startDate}_a_${endDate}`
  if (clienteSeleccionado) filename += `_${clienteSeleccionado.nombre.substring(0, 20)}`
  filename += '.xlsx'

  // Exportar archivo
  XLSX.writeFile(workbook, filename)
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
function obtenerDias(fechalimite) {
  const fecha1 = Math.floor(new Date().getTime() / (1000 * 3600 * 24))
  const fecha2 = Math.floor(new Date(fechalimite).getTime() / (1000 * 3600 * 24))
  return fecha1 - fecha2
}

export function exportToXLSX_Reporte_Productos(
  reportData,
  startDate,
  endDate,
  almacenSeleccionado = null,
  clienteSeleccionado = null,
  sucursalSeleccionada = null,
  almacenesOptions,
  clientesOriginal,
  sucursalesOriginal,
) {
  // Filtrar datos si es necesario (en este caso no filtramos por estado)
  const datos = [...reportData]
  const tipoVenta = {
    0: 'Comprobante Venta',
    1: 'Factura Compra-Venta',
    2: 'Factura Alquileres',
    3: 'Factura Comercial Exportación',
    24: 'Nota de Crédito-Débito',
  }
  // Calcular totales
  const totalCantidad = datos.reduce((sum, item) => sum + parseFloat(item.cantidad || 0), 0)
  const totalImporte = datos.reduce((sum, item) => sum + parseFloat(item.importe || 0), 0)
  const totalDescuento = datos.reduce((sum, item) => sum + parseFloat(item.descuento || 0), 0)
  const totalCosto = datos.reduce((sum, item) => sum + parseFloat(item.totalcosto || 0), 0)
  const totalVenta = datos.reduce((sum, item) => sum + parseFloat(item.totalventa || 0), 0)
  const totalUtilidad = datos.reduce((sum, item) => sum + parseFloat(item.utilidad || 0), 0)

  // Mapear datos para exportación
  const dataForExport = datos.map((row, index) => ({
    'N°': index + 1,
    Fecha: cambiarFormatoFecha(row.fecha),
    'Nro. Doc.': row.nrofactura,
    'Tipo de Venta': tipoVenta[row.tipoventa] || row.tipoventa,
    'Código Producto': row.codigo,
    'Código Barras': row.codigobarra,
    Descripción: row.descripcion,
    'Costo Unitario': parseFloat(row.preciobase || 0).toFixed(2),
    'Precio Unitario': parseFloat(row.preciounitario || 0).toFixed(2),
    Cantidad: parseFloat(row.cantidad || 0).toFixed(2),
    Importe: parseFloat(row.importe || 0).toFixed(2),
    Descuento: parseFloat(row.descuento || 0).toFixed(2),
    'Costo Total': parseFloat(row.totalcosto || 0).toFixed(2),
    'Venta Total': parseFloat(row.totalventa || 0).toFixed(2),
    Utilidad: parseFloat(row.utilidad || 0).toFixed(2),
    'Tipo Pago': row.tipopago,
    Usuario: row.idusuario,
    'Sucursal Cliente': row.sucursalc,
    Almacén: row.almacen,
    Cliente: row.cliente,
    'Tipo Documento': row.tipodocumento,
    'Nro. Doc. Tributario': row.nrodoc,
    'Nombre Comercial': row.nombrecomercial,
    Unidad: row.unidad,
    Categoría: row.categoria,
    Subcategoría: row.subcategoria,
    Canal: row.canal,
    'Tipo Precio': row.tipoprecio,
  }))

  // Agregar fila de totales
  dataForExport.push({
    'N°': '',
    Fecha: '',
    'Nro. Doc.': '',
    'Tipo de Venta': '',
    'Código Producto': '',
    'Código Barras': '',
    Descripción: '',
    'Costo Unitario': '',
    'Precio Unitario': '',
    Cantidad: totalCantidad.toFixed(2),
    Importe: totalImporte.toFixed(2),
    Descuento: totalDescuento.toFixed(2),
    'Costo Total': totalCosto.toFixed(2),
    'Venta Total': totalVenta.toFixed(2),
    Utilidad: totalUtilidad.toFixed(2),
    'Tipo Pago': 'TOTALES:',
    Usuario: '',
    'Sucursal Cliente': '',
    Almacén: '',
    Cliente: '',
    'Tipo Documento': '',
    'Nro. Doc. Tributario': '',
    'Nombre Comercial': '',
    Unidad: '',
    Categoría: '',
    Subcategoría: '',
    Canal: '',
    'Tipo Precio': '',
  })

  // Crear hoja de trabajo
  const worksheet = XLSX.utils.json_to_sheet(dataForExport)

  // Definir anchos de columnas (ajustar según necesidad)
  const columnWidths = [
    { wch: 5 }, // N°
    { wch: 10 }, // Fecha
    { wch: 12 }, // Nro. Doc.
    { wch: 15 }, // Tipo de Venta
    { wch: 12 }, // Código Producto
    { wch: 15 }, // Código Barras
    { wch: 30 }, // Descripción
    { wch: 12 }, // Costo Unitario
    { wch: 12 }, // Precio Unitario
    { wch: 10 }, // Cantidad
    { wch: 12 }, // Importe
    { wch: 10 }, // Descuento
    { wch: 12 }, // Costo Total
    { wch: 12 }, // Venta Total
    { wch: 12 }, // Utilidad
    { wch: 12 }, // Tipo Pago
    { wch: 20 }, // Usuario
    { wch: 20 }, // Sucursal Cliente
    { wch: 15 }, // Almacén
    { wch: 25 }, // Cliente
    { wch: 15 }, // Tipo Documento
    { wch: 18 }, // Nro. Doc. Tributario
    { wch: 25 }, // Nombre Comercial
    { wch: 10 }, // Unidad
    { wch: 15 }, // Categoría
    { wch: 15 }, // Subcategoría
    { wch: 10 }, // Canal
    { wch: 12 }, // Tipo Precio
  ]
  worksheet['!cols'] = columnWidths

  // Aplicar estilos a las celdas
  const range = XLSX.utils.decode_range(worksheet['!ref'])
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = { c: C, r: R }
      const cell_ref = XLSX.utils.encode_cell(cell_address)
      const cell = worksheet[cell_ref]

      if (!cell) continue

      // Estilo por defecto
      let cellStyle = {
        font: { name: 'Arial', sz: 10 },
        alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
        border: {
          top: { style: 'thin', color: { rgb: 'D3D3D3' } },
          bottom: { style: 'thin', color: { rgb: 'D3D3D3' } },
          left: { style: 'thin', color: { rgb: 'D3D3D3' } },
          right: { style: 'thin', color: { rgb: 'D3D3D3' } },
        },
      }

      // Estilo para encabezados
      if (R === 0) {
        cellStyle.font = { name: 'Arial', sz: 11, bold: true, color: { rgb: 'FFFFFF' } }
        cellStyle.fill = { fgColor: { rgb: '4F81BD' } } // Azul oscuro
        cellStyle.alignment = { horizontal: 'center', vertical: 'center' }
      }
      // Estilo para fila de totales
      else if (R === range.e.r) {
        cellStyle.font = { name: 'Arial', sz: 10, bold: true }
        cellStyle.fill = { fgColor: { rgb: 'F2F2F2' } } // Gris claro

        // Alinear columnas numéricas a la derecha
        const numericColumns = [9, 10, 11, 12, 13, 14] // Índices de columnas numéricas
        if (numericColumns.includes(C)) {
          cellStyle.alignment = { horizontal: 'right', vertical: 'center' }
        }
      }
      // Estilo para columnas numéricas
      else {
        const numericColumns = [7, 8, 9, 10, 11, 12, 13, 14] // Índices de columnas numéricas
        if (numericColumns.includes(C)) {
          cellStyle.alignment = { horizontal: 'right', vertical: 'center' }
          cell.z = '#,##0.00' // Formato numérico con 2 decimales
        }
      }

      cell.s = cellStyle
    }
  }

  // Crear libro y agregar hoja
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos Vendidos')

  // Agregar información adicional como encabezado
  const contenidoUsuario = validarUsuario()
  const empresa = contenidoUsuario[0]?.empresa?.nombre || ''
  const usuario = contenidoUsuario[0]?.nombre || ''
  const cargo = contenidoUsuario[0]?.cargo || ''

  // Crear texto de filtros aplicados
  let filtros = `Del ${cambiarFormatoFecha(startDate)} al ${cambiarFormatoFecha(endDate)}`
  if (almacenSeleccionado && almacenSeleccionado !== 0) {
    const almacen = almacenesOptions.value.find((a) => a.value === almacenSeleccionado)
    if (almacen) filtros += ` | Almacén: ${almacen.label}`
  }
  if (clienteSeleccionado) {
    const cliente = clientesOriginal.value.find((c) => c.value === clienteSeleccionado)
    if (cliente) filtros += ` | Cliente: ${cliente.raw.nombre}`
  }
  if (sucursalSeleccionada) {
    const sucursal = sucursalesOriginal.value.find((s) => s.value === sucursalSeleccionada)
    if (sucursal) filtros += ` | Sucursal: ${sucursal.label}`
  }

  // Agregar metadatos
  workbook.Props = {
    Title: `Reporte de Productos Vendidos - ${empresa}`,
    Subject: 'Reporte global de productos vendidos',
    Author: `${usuario} - ${cargo}`,
    CreatedDate: new Date(),
    Comments: filtros,
  }

  // Generar nombre de archivo
  let filename = `Reporte_Productos_Vendidos_${startDate}_a_${endDate}`
  if (almacenSeleccionado && almacenSeleccionado !== 0) {
    const almacen = almacenesOptions.value.find((a) => a.value === almacenSeleccionado)
    if (almacen) filename += `_${almacen.label.substring(0, 20)}`
  }
  filename += '.xlsx'

  // Exportar archivo
  XLSX.writeFile(workbook, filename)
}

export function exportTOXLSX_Reporte_Ventas(filteredVentas, almacen, startDate, endDate) {
  const datos = filteredVentas.value

  // 1. Preparar los datos con formato adecuado
  const datosFormateados = datos.map((item) => {
    const itemCopy = { ...item }
    // Formatear números con separadores de miles y decimales
    if (itemCopy.Total) itemCopy.Total = Number(itemCopy.Total).toFixed(2)
    if (itemCopy.Dscto) itemCopy.Dscto = Number(itemCopy.Dscto).toFixed(2)
    if (itemCopy.Monto) itemCopy.Monto = Number(itemCopy.Monto).toFixed(2)
    return itemCopy
  })

  // 2. Crear la hoja de cálculo
  const worksheet = XLSX.utils.json_to_sheet(datosFormateados)

  // 3. Configurar anchos de columnas
  const columnWidths = [
    { wch: 12 }, // Nro.Factura
    { wch: 18 }, // Fecha
    { wch: 35 }, // Cliente
    { wch: 25 }, // Vendedor
    { wch: 25 }, // Almacén
    { wch: 15 }, // Moneda
    { wch: 15 }, // Estado
    { wch: 18 }, // Total
    { wch: 18 }, // Descuento
    { wch: 18 }, // Monto
    { wch: 15 }, // Tipo
    { wch: 50 }, // Observación
  ]
  worksheet['!cols'] = columnWidths

  // 4. Aplicar estilos
  const range = XLSX.utils.decode_range(worksheet['!ref'])

  // Estilo para la fila de encabezado
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = { c: C, r: 0 }
    const cellRef = XLSX.utils.encode_cell(cellAddress)
    if (!worksheet[cellRef]) continue

    worksheet[cellRef].s = {
      font: {
        name: 'Calibri',
        sz: 12,
        bold: true,
        color: { rgb: 'FFFFFF' },
      },
      fill: {
        patternType: 'solid',
        fgColor: { rgb: '4472C4' }, // Azul corporativo
      },
      alignment: {
        horizontal: 'center',
        vertical: 'center',
        wrapText: true,
      },
      border: {
        top: { style: 'thin', color: { rgb: 'FFFFFF' } },
        bottom: { style: 'thin', color: { rgb: 'FFFFFF' } },
        left: { style: 'thin', color: { rgb: 'FFFFFF' } },
        right: { style: 'thin', color: { rgb: 'FFFFFF' } },
      },
    }
  }

  // Estilos para las filas de datos
  for (let R = 1; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = { c: C, r: R }
      const cellRef = XLSX.utils.encode_cell(cellAddress)
      if (!worksheet[cellRef]) continue

      const isNumeric = ['Total', 'Dscto', 'Monto'].includes(
        worksheet[XLSX.utils.encode_cell({ c: C, r: 0 })].v,
      )

      worksheet[cellRef].s = {
        font: {
          name: 'Calibri',
          sz: 11,
          color: { rgb: '000000' },
        },
        alignment: {
          horizontal: isNumeric ? 'right' : 'left',
          vertical: 'center',
          wrapText: true,
        },
        border: {
          top: { style: 'thin', color: { rgb: 'D9D9D9' } },
          bottom: { style: 'thin', color: { rgb: 'D9D9D9' } },
          left: { style: 'thin', color: { rgb: 'D9D9D9' } },
          right: { style: 'thin', color: { rgb: 'D9D9D9' } },
        },
        numFmt: isNumeric ? '#,##0.00' : undefined,
      }

      // Alternar colores de fila para mejor legibilidad
      if (R % 2 === 0) {
        worksheet[cellRef].s.fill = {
          patternType: 'solid',
          fgColor: { rgb: 'F2F2F2' },
        }
      }
    }
  }

  // 5. Agregar título y metadatos
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Ventas')

  // 6. Configurar propiedades del documento
  workbook.Props = {
    Title: `Reporte de Ventas ${almacen.value}`,
    Subject: `Ventas del ${startDate.value} al ${endDate.value}`,
    Author: 'Sistema de Ventas',
    CreatedDate: new Date(),
  }

  // 7. Generar nombre de archivo más descriptivo
  const almacenFormatted = almacen.value ? almacen.value.replace(/\s+/g, '_') : 'Todos'
  const filename = `Reporte_Ventas_${almacenFormatted}_${startDate.value}_a_${endDate.value}.xlsx`

  // 8. Exportar el archivo
  XLSX.writeFile(workbook, filename, {
    bookType: 'xlsx',
    type: 'array',
    cellStyles: true,
  })
}

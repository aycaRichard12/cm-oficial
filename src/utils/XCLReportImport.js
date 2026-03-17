import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { validarUsuario } from 'src/composables/FuncionesG'
import * as XLSX from 'xlsx-js-style'

export function exportToXLSX_Reporte_CuentasXCobrarPeriodo(
  reportData,
  startDate,
  endDate,
  visibleColumnsFromTable = [],
) {
  // Preparar datos excluyendo la fila de totales si ya existe
  const datos = [...reportData.value].filter(item => item.nombre_comercial !== 'TOTAL:')

  // Definir todas las posibles columnas y sus configuraciones
  const allPossibleColumns = [
    { header: 'Fecha', key: 'fecha_actual', width: 15 },
    { header: 'Cliente', key: 'nombre_cliente', width: 30 },
    { header: 'Nombre Comercial', key: 'nombre_comercial', width: 30 },
    { header: 'Monto Venta', key: 'monto_total_venta', width: 15, numeric: true },
    { header: 'Descuento Venta', key: 'descuento_venta', width: 15, numeric: true },
    { header: 'Saldo Cobro', key: 'saldo_estado_cobro', width: 15, numeric: true },
    { header: 'Monto Cobrado', key: 'monto_detalle_cobro', width: 15, numeric: true },
  ]

  // Filtrar columnas visibles
  let columns = allPossibleColumns
  if (visibleColumnsFromTable && visibleColumnsFromTable.length > 0) {
    const visibleNames = visibleColumnsFromTable.map((c) => c.name)
    columns = allPossibleColumns.filter((c) => visibleNames.includes(c.key))
  }

  // Mapear datos para exportación
  const dataForExport = datos.map((row) => {
    const exportRow = {}
    columns.forEach((col) => {
      if (col.numeric) {
        exportRow[col.header] = parseFloat(row[col.key] || 0).toFixed(2)
      } else {
        exportRow[col.header] = row[col.key] || ''
      }
    })
    return exportRow
  })

  // Calcular totales sumando los valores numéricos
  const totals = {
    monto_total_venta: datos.reduce((sum, u) => sum + Number(u.monto_total_venta || 0), 0),
    descuento_venta: datos.reduce((sum, u) => sum + Number(u.descuento_venta || 0), 0),
    saldo_estado_cobro: datos.reduce((sum, u) => sum + Number(u.saldo_estado_cobro || 0), 0),
    monto_detalle_cobro: datos.reduce((sum, u) => sum + Number(u.monto_detalle_cobro || 0), 0),
  }

  // Agregar fila de totales dinámica
  const totalRow = {}
  let firstStringCol = columns.find(c => !c.numeric)
  columns.forEach(col => {
    if (col === firstStringCol) {
      totalRow[col.header] = 'TOTALES'
    } else if (totals[col.key] !== undefined) {
      totalRow[col.header] = totals[col.key].toFixed(2)
    } else {
      totalRow[col.header] = ''
    }
  })
  dataForExport.push(totalRow)

  const worksheet = XLSX.utils.json_to_sheet(dataForExport)

  // Definir anchos de columnas dinámicamente
  worksheet['!cols'] = columns.map(col => ({ wch: col.width }))

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
  visibleColumnsFromTable = [],
) {
  // Preparar datos excluyendo la fila de totales si ya existe
  const datos = reportData.filter((item) => item.estado !== 5)

  // Definir todas las posibles columnas y sus configuraciones
  const allPossibleColumns = [
    { header: 'N°', key: 'numero', width: 5 },
    { header: 'Fecha Crédito', key: 'fechaventa', width: 12, format: 'date' },
    { header: 'Cliente', key: 'razonsocial', width: 30 },
    { header: 'Sucursal', key: 'sucursal', width: 20 },
    { header: 'Fecha Límite', key: 'fechalimite', width: 12, format: 'date' },
    { header: 'Cuotas', key: 'ncuotas', width: 8 },
    { header: 'Cuotas Procesadas', key: 'cuotasprocesadas', width: 15 },
    { header: 'Valor Cuota', key: 'valorcuotas', width: 12, numeric: true },
    { header: 'Monto Venta', key: 'totalventa', width: 12, numeric: true },
    { header: 'Total Cobrado', key: 'totalcobrado', width: 12, numeric: true },
    { header: 'Saldo', key: 'saldo', width: 12, numeric: true },
    { header: 'Total Atrasado', key: 'totalatrasado', width: 12, numeric: true },
    { header: 'Total Anulado', key: 'totalanulado', width: 12, numeric: true },
    { header: 'Días Mora', key: 'moradias', width: 10, numeric: true },
    { header: 'Estado', key: 'estado', width: 12 },
  ]

  // Filtrar columnas visibles
  let columns = allPossibleColumns
  if (visibleColumnsFromTable && visibleColumnsFromTable.length > 0) {
    const visibleNames = visibleColumnsFromTable.map((c) => c.name)
    columns = allPossibleColumns.filter((c) => visibleNames.includes(c.key))
  }

  // Mapear datos para exportación
  const dataForExport = datos.map((row) => {
    const exportRow = {}
    columns.forEach((col) => {
      if (col.key === 'estado') {
        exportRow[col.header] = getEstadoText(row.estado)
      } else if (col.format === 'date') {
        exportRow[col.header] = cambiarFormatoFecha(row[col.key])
      } else if (col.numeric) {
        exportRow[col.header] = parseFloat(row[col.key] || 0).toFixed(2)
      } else {
        exportRow[col.header] = row[col.key]
      }
    })
    return exportRow
  })

  // Calcular totales para la fila final
  const totals = {
    valorcuotas: datos.reduce((sum, u) => sum + parseFloat(u.valorcuotas || 0), 0),
    totalventa: datos.reduce((sum, u) => sum + parseFloat(u.totalventa || 0), 0),
    totalcobrado: datos.reduce((sum, u) => sum + parseFloat(u.totalcobrado || 0), 0),
    saldo: datos.reduce((sum, u) => sum + parseFloat(u.saldo || 0), 0),
  }

  // Agregar fila de totales dinámica
  const totalRow = {}
  columns.forEach((col, index) => {
    if (index === 0) {
      totalRow[col.header] = 'TOTALES'
    } else if (totals[col.key] !== undefined) {
      totalRow[col.header] = totals[col.key].toFixed(2)
    } else {
      totalRow[col.header] = ''
    }
  })
  dataForExport.push(totalRow)

  // Crear hoja de trabajo
  const worksheet = XLSX.utils.json_to_sheet(dataForExport)

  // Definir anchos de columnas dinámicamente
  worksheet['!cols'] = columns.map(col => ({ wch: col.width }))

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
  // Calcular totales sumando los valores sin procesar strings textules antes.
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
    'Costo Unitario': parseFloat(row.preciobase || 0),
    'Precio Unitario': parseFloat(row.preciounitario || 0),
    Cantidad: parseFloat(row.cantidad || 0),
    Importe: parseFloat(row.importe || 0),
    Descuento: parseFloat(row.descuento || 0),
    'Costo Total': parseFloat(row.totalcosto || 0),
    'Venta Total': parseFloat(row.totalventa || 0),
    Utilidad: parseFloat(row.utilidad || 0),
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
    Cantidad: totalCantidad,
    Importe: totalImporte,
    Descuento: totalDescuento,
    'Costo Total': totalCosto,
    'Venta Total': totalVenta,
    Utilidad: totalUtilidad,
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
        const numericColumns = [9, 10, 11, 12, 13, 14] // Índices de columnas numéricas (Cantidad a Utilidad)
        if (numericColumns.includes(C)) {
          cellStyle.alignment = { horizontal: 'right', vertical: 'center' }
          if (typeof cell.v === 'number') {
            cell.z = '#,##0.00'
          }
        }
      }
      // Estilo para columnas numéricas
      else {
        const numericColumns = [7, 8, 9, 10, 11, 12, 13, 14] // Índices de columnas numéricas
        if (numericColumns.includes(C)) {
          cellStyle.alignment = { horizontal: 'right', vertical: 'center' }
          // Formato numérico con 2 decimales dinámico adaptado a configuración local usando celdas de numero nativo
          if (typeof cell.v === 'number') {
            cell.z = '#,##0.00'
          }
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
  if (almacenSeleccionado && String(almacenSeleccionado) !== '0') {
    const almacen = almacenesOptions.value.find((a) => String(a.value) === String(almacenSeleccionado))
    if (almacen) filtros += ` | Almacén: ${almacen.label}`
  }
  if (clienteSeleccionado) {
    const idCliente = typeof clienteSeleccionado === 'object' ? clienteSeleccionado.value : clienteSeleccionado
    const cliente = clientesOriginal.value.find((c) => String(c.value) === String(idCliente))
    if (cliente) filtros += ` | Cliente: ${cliente.raw.nombre}`
  }
  if (sucursalSeleccionada) {
    const idSucursal = typeof sucursalSeleccionada === 'object' ? sucursalSeleccionada.value : sucursalSeleccionada
    const sucursal = sucursalesOriginal.value.find((s) => String(s.value) === String(idSucursal))
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
  if (almacenSeleccionado && String(almacenSeleccionado) !== '0') {
    const almacen = almacenesOptions.value.find((a) => String(a.value) === String(almacenSeleccionado))
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

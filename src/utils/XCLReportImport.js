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
  const datos = [...reportData].filter((item) => item.nombre_comercial !== 'TOTAL:')

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
      const val = row[col.key]
      if (col.numeric) {
        exportRow[col.header] = Number(val || 0)
      } else if (col.key === 'fecha_actual') {
        // Solo formatear si parece ser una fecha ISO con guiones
        exportRow[col.header] =
          typeof val === 'string' && val.includes('-') ? cambiarFormatoFecha(val) : val || ''
      } else {
        exportRow[col.header] = val || ''
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
  let firstStringCol = columns.find((c) => !c.numeric)
  columns.forEach((col) => {
    if (col === firstStringCol) {
      totalRow[col.header] = 'TOTALES'
    } else if (totals[col.key] !== undefined) {
      totalRow[col.header] = Number(totals[col.key])
    } else {
      totalRow[col.header] = ''
    }
  })
  dataForExport.push(totalRow)

  const worksheet = XLSX.utils.json_to_sheet(dataForExport)

  // Definir anchos de columnas dinámicamente
  worksheet['!cols'] = columns.map((col) => ({ wch: col.width }))

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
        // Numeric column alignment and format for data rows
        const headerCell = worksheet[XLSX.utils.encode_cell({ c: C, r: 0 })]
        const headerText = headerCell ? String(headerCell.v).trim() : ''
        const numericColumns = ['Monto Venta', 'Descuento Venta', 'Saldo Cobro', 'Monto Cobrado']

        if (numericColumns.includes(headerText)) {
          cellStyle.alignment.horizontal = 'right'
          cell.z = '[$-40A]#,##0.00'
          cellStyle.numFmt = '[$-40A]#,##0.00' // Forzar coma decimal y punto de miles (Bolivia)
        }
      }

      cell.s = cellStyle // Apply the determined style
    }
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cobros Diarios')
  const filename = `Reporte_Cobros_Diarios_${startDate}_a_${endDate}.xlsx`
  XLSX.writeFile(workbook, filename, { cellStyles: true })
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
      const val = row[col.key]
      if (col.key === 'estado') {
        exportRow[col.header] = getEstadoText(row.estado)
      } else if (col.format === 'date') {
        // Solo formatear si parece ser una fecha ISO con guiones
        exportRow[col.header] =
          typeof val === 'string' && val.includes('-') ? cambiarFormatoFecha(val) : val || ''
      } else if (col.numeric) {
        exportRow[col.header] = Number(val || 0)
      } else {
        exportRow[col.header] = val || ''
      }
    })
    return exportRow
  })

  // Calcular totales para la fila final
  const totals = {
    valorcuotas: datos.reduce((sum, u) => sum + Number(u.valorcuotas || 0), 0),
    totalventa: datos.reduce((sum, u) => sum + Number(u.totalventa || 0), 0),
    totalcobrado: datos.reduce((sum, u) => sum + Number(u.totalcobrado || 0), 0),
    saldo: datos.reduce((sum, u) => sum + Number(u.saldo || 0), 0),
  }

  // Agregar fila de totales dinámica
  const totalRow = {}
  columns.forEach((col, index) => {
    if (index === 0) {
      totalRow[col.header] = 'TOTALES'
    } else if (totals[col.key] !== undefined) {
      totalRow[col.header] = Number(totals[col.key])
    } else {
      totalRow[col.header] = ''
    }
  })
  dataForExport.push(totalRow)

  // Crear hoja de trabajo
  const worksheet = XLSX.utils.json_to_sheet(dataForExport)

  // Definir anchos de columnas dinámicamente
  worksheet['!cols'] = columns.map((col) => ({ wch: col.width }))

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
        const numericColumns = [
          'Valor Cuota',
          'Monto Venta',
          'Total Cobrado',
          'Saldo',
          'Total Atrasado',
          'Total Anulado',
          'Días Mora',
        ]
        const headerCell = worksheet[XLSX.utils.encode_cell({ c: C, r: 0 })]
        const headerText = headerCell ? String(headerCell.v).trim() : ''
        if (headerCell && numericColumns.includes(headerText)) {
          cellStyle.alignment.horizontal = 'right'
          cell.z = '[$-40A]#,##0.00'
          cellStyle.numFmt = '[$-40A]#,##0.00' // Forzar coma decimal y punto de miles (Bolivia)
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
  XLSX.writeFile(workbook, filename, { cellStyles: true })
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
  const dataForExport = datos.map((row, index) => {
    const fecha = row.fecha
    return {
      'N°': index + 1,
      Fecha:
        typeof fecha === 'string' && fecha.includes('-') ? cambiarFormatoFecha(fecha) : fecha || '',
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
    }
  })

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
            cell.z = '[$-40A]#,##0.00'
            cellStyle.numFmt = '[$-40A]#,##0.00'
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
            cell.z = '[$-40A]#,##0.00'
            cellStyle.numFmt = '[$-40A]#,##0.00'
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
    const almacen = almacenesOptions.value.find(
      (a) => String(a.value) === String(almacenSeleccionado),
    )
    if (almacen) filtros += ` | Almacén: ${almacen.label}`
  }
  if (clienteSeleccionado) {
    const idCliente =
      typeof clienteSeleccionado === 'object' ? clienteSeleccionado.value : clienteSeleccionado
    const cliente = clientesOriginal.value.find((c) => String(c.value) === String(idCliente))
    if (cliente) filtros += ` | Cliente: ${cliente.raw.nombre}`
  }
  if (sucursalSeleccionada) {
    const idSucursal =
      typeof sucursalSeleccionada === 'object' ? sucursalSeleccionada.value : sucursalSeleccionada
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
    const almacen = almacenesOptions.value.find(
      (a) => String(a.value) === String(almacenSeleccionado),
    )
    if (almacen) filename += `_${almacen.label.substring(0, 20)}`
  }
  filename += '.xlsx'

  // Exportar archivo
  XLSX.writeFile(workbook, filename, { cellStyles: true })
}

// export function exportTOXLSX_Reporte_Ventas(filteredVentas, almacen, startDate, endDate) {
//   const datos = filteredVentas.value
//   console.log(filteredVentas.value)
//   console.log(almacen.value)
//   console.log(startDate.value)
//   console.log(endDate.value)

//   // 1. Preparar los datos con formato adecuado
//   const datosFormateados = datos.map((item) => {
//     const itemCopy = { ...item }
//     // Mantener como números para que Excel aplique el formato según la región
//     if (itemCopy.Total) itemCopy.Total = Number(itemCopy.Total)
//     if (itemCopy.Dscto) itemCopy.Dscto = Number(itemCopy.Dscto)
//     if (itemCopy.Monto) itemCopy.Monto = Number(itemCopy.Monto)
//     return itemCopy
//   })

//   // 2. Crear la hoja de cálculo
//   const worksheet = XLSX.utils.json_to_sheet(datosFormateados)

//   // 3. Configurar anchos de columnas
//   const columnWidths = [
//     { wch: 12 }, // Nro.Factura
//     { wch: 18 }, // Fecha
//     { wch: 35 }, // Cliente
//     { wch: 25 }, // Vendedor
//     { wch: 25 }, // Almacén
//     { wch: 15 }, // Moneda
//     { wch: 15 }, // Estado
//     { wch: 18 }, // Total
//     { wch: 18 }, // Descuento
//     { wch: 18 }, // Monto
//     { wch: 15 }, // Tipo
//     { wch: 50 }, // Observación
//   ]
//   worksheet['!cols'] = columnWidths

//   // 4. Aplicar estilos
//   const range = XLSX.utils.decode_range(worksheet['!ref'])

//   // Estilo para la fila de encabezado
//   for (let C = range.s.c; C <= range.e.c; ++C) {
//     const cellAddress = { c: C, r: 0 }
//     const cellRef = XLSX.utils.encode_cell(cellAddress)
//     if (!worksheet[cellRef]) continue

//     worksheet[cellRef].s = {
//       font: {
//         name: 'Calibri',
//         sz: 12,
//         bold: true,
//         color: { rgb: 'FFFFFF' },
//       },
//       fill: {
//         patternType: 'solid',
//         fgColor: { rgb: '4472C4' }, // Azul corporativo
//       },
//       alignment: {
//         horizontal: 'center',
//         vertical: 'center',
//         wrapText: true,
//       },
//       border: {
//         top: { style: 'thin', color: { rgb: 'FFFFFF' } },
//         bottom: { style: 'thin', color: { rgb: 'FFFFFF' } },
//         left: { style: 'thin', color: { rgb: 'FFFFFF' } },
//         right: { style: 'thin', color: { rgb: 'FFFFFF' } },
//       },
//     }
//   }

//   // Estilos para las filas de datos
//   for (let R = 1; R <= range.e.r; R++) {
//     for (let C = range.s.c; C <= range.e.c; C++) {
//       const cellAddress = { c: C, r: R }
//       const cellRef = XLSX.utils.encode_cell(cellAddress)
//       if (!worksheet[cellRef]) continue

//       const isNumeric = ['Total', 'Dscto', 'Monto'].includes(
//         worksheet[XLSX.utils.encode_cell({ c: C, r: 0 })].v,
//       )

//       worksheet[cellRef].s = {
//         font: {
//           name: 'Calibri',
//           sz: 11,
//           color: { rgb: '000000' },
//         },
//         alignment: {
//           horizontal: isNumeric ? 'right' : 'left',
//           vertical: 'center',
//           wrapText: true,
//         },
//         border: {
//           top: { style: 'thin', color: { rgb: 'D9D9D9' } },
//           bottom: { style: 'thin', color: { rgb: 'D9D9D9' } },
//           left: { style: 'thin', color: { rgb: 'D9D9D9' } },
//           right: { style: 'thin', color: { rgb: 'D9D9D9' } },
//         },
//         numFmt: isNumeric ? '[$-40A]#,##0.00' : undefined,
//       }
//       if (isNumeric) {
//         worksheet[cellRef].z = '[$-40A]#,##0.00'
//       }

//       // Alternar colores de fila para mejor legibilidad
//       if (R % 2 === 0) {
//         worksheet[cellRef].s.fill = {
//           patternType: 'solid',
//           fgColor: { rgb: 'F2F2F2' },
//         }
//       }
//     }
//   }

//   // 5. Agregar título y metadatos
//   const workbook = XLSX.utils.book_new()
//   XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Ventas')

//   // 6. Configurar propiedades del documento
//   workbook.Props = {
//     Title: `Reporte de Ventas ${almacen.value}`,
//     Subject: `Ventas del ${startDate.value} al ${endDate.value}`,
//     Author: 'Sistema de Ventas',
//     CreatedDate: new Date(),
//   }

//   // 7. Generar nombre de archivo más descriptivo
//   const almacenFormatted = almacen.value ? almacen.replace(/\s+/g, '_') : 'Todos'
//   const filename = `Reporte_Ventas_${almacenFormatted}_${startDate.value}_a_${endDate.value}.xlsx`

//   // 8. Exportar el archivo
//   XLSX.writeFile(workbook, filename, {
//     bookType: 'xlsx',
//     type: 'array',
//     cellStyles: true,
//   })
// }

export function exportTOXLSX_Reporte_Ventas(filteredVentas, almacen, startDate, endDate) {
  const datos = filteredVentas.value
  const nombreAlmacen = almacen.value || 'Todos los Almacenes'

  // 1. Definir los encabezados de la tabla
  const encabezados = [
    [
      'Nro. Factura',
      'Fecha',
      'Sucursal',
      'Cliente',
      'Vendedor',
      'Almacén',
      'Moneda',
      'Estado',
      'Canal',
      'Tipo pago',
      'Total',
      'Dscto',
      'Monto',
      'Tipo',
      'Observación',
    ],
  ]

  // 2. Formatear los datos del cuerpo
  const cuerpo = datos.map((item) => [
    item.nfactura || '',
    item.fecha || '',
    item.sucursal || '',
    item.cliente || '',
    item.Vendedor || '',
    item.almacen || '',
    item.divisa || '',
    item.estado || '',
    item.canal || '',
    item.tipopago || '',
    Number(item.total || 0),
    Number(item.descuento || 0),
    Number(item.ventatotal || 0),
    item.tipoventa || '',
    item.Observacion || '',
  ])

  // 3. Crear el libro y la hoja con un offset para el título (fila 5 empieza la tabla)
  const worksheet = XLSX.utils.aoa_to_sheet([
    [`REPORTE DE VENTAS DETALLADO`], // Fila 0
    [`Almacén: ${nombreAlmacen}`], // Fila 1
    [`Periodo: ${startDate.value} al ${endDate.value}`], // Fila 2
    [`Fecha de generación: ${new Date().toLocaleString()}`], // Fila 3
    [], // Fila 4 (Espacio en blanco)
    ...encabezados, // Fila 5
    ...cuerpo, // Fila 6 en adelante
  ])

  // 4. Configuración de celdas combinadas para el título
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }, // Título principal
    //{ s: { r: 1, c: 0 }, e: { r: 1, c: 14 } }, // Subtítulo almacén
  ]

  // 5. Configurar anchos de columnas
  worksheet['!cols'] = [
    { wch: 15 },
    { wch: 15 },
    { wch: 35 },
    { wch: 20 },
    { wch: 20 },
    { wch: 10 },
    { wch: 12 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 30 },
    { wch: 15 },
  ]

  // 6. Aplicar Estilos
  const range = XLSX.utils.decode_range(worksheet['!ref'])

  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
      if (!worksheet[cellRef]) continue

      // Estilo base
      worksheet[cellRef].s = {
        font: { name: 'Segoe UI', sz: 10 },
        alignment: { vertical: 'center' },
        fill: {},
      }

      // --- ESTILO TÍTULO PRINCIPAL ---
      if (R === 0) {
        worksheet[cellRef].s = {
          font: { sz: 16, bold: true, color: { rgb: '2F5597' } },
          alignment: { horizontal: 'center' },
        }
      }
      // --- ESTILO METADATOS (Subtítulos) ---
      // --- ESTILO METADATOS (Subtítulos) ---
      else if (R > 0 && R < 4) {
        worksheet[cellRef].s = {
          font: {
            name: 'Segoe UI',
            sz: 10,
            bold: true,
            color: { rgb: '000000' },
          },
          fill: {
            patternType: 'solid',
            fgColor: { rgb: 'FFFFFF' }, // Forzamos fondo blanco para evitar el negro
          },
          alignment: {
            vertical: 'center',
            horizontal: 'left',
          },
        }
      }
      // --- ESTILO ENCABEZADOS DE TABLA (Fila 5) ---
      else if (R === 5) {
        worksheet[cellRef].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { patternType: 'solid', fgColor: { rgb: '2F5597' } },
          alignment: { horizontal: 'center' },
          border: {
            bottom: { style: 'medium', color: { rgb: 'E3E1E1' } },
          },
        }
      }
      // --- ESTILO CUERPO DE DATOS ---
      // --- ESTILO CUERPO DE DATOS (DENTRO DEL BUCLE R > 5) ---
      else if (R > 5) {
        // Ajustamos el índice de columnas numéricas (ahora son Total, Dscto, Monto en las posiciones 10, 11, 12)
        const isNumericCol = C >= 10 && C <= 12

        worksheet[cellRef].s.alignment.horizontal = isNumericCol ? 'right' : 'left'

        if (isNumericCol) {
          worksheet[cellRef].z = '#,##0.00'
        }

        // Filas cebra
        if (R % 2 === 0) {
          worksheet[cellRef].s.fill = { patternType: 'solid', fgColor: { rgb: 'F9F9F9' } }
        } else {
          // Para las filas impares, forzamos el fondo blanco para limpiar cualquier residuo
          worksheet[cellRef].s.fill = {
            patternType: 'solid',
            fgColor: { rgb: 'FFFFFF' },
          }
        }

        // BORDES: Definir el color gris explícitamente para que no salga negro
        const greyColor = { rgb: 'DCDCDC' } // Gris suave
        worksheet[cellRef].s.border = {
          top: { style: 'thin', color: greyColor },
          bottom: { style: 'thin', color: greyColor },
          left: { style: 'thin', color: greyColor },
          right: { style: 'thin', color: greyColor },
        }
      }
    }
  }

  // 7. Generar Archivo
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte')

  const filename = `Ventas_${nombreAlmacen.replace(/\s+/g, '_')}_${startDate.value}.xlsx`

  XLSX.writeFile(workbook, filename)
}
/**
 * Exporta una plantilla de Excel con los encabezados necesarios para importar productos.
 */
export function exportarPlantillaProductos() {
  const headers = [
    { header: 'Código', key: 'codigo', width: 15 },
    { header: 'Nombre', key: 'nombre', width: 25 },
    { header: 'Descripción', key: 'descripcion', width: 35 },
    { header: 'Código de Barras', key: 'codigobarras', width: 20 },
    { header: 'Categoría', key: 'categoria', width: 20 },
    { header: 'Subcategoría', key: 'subcategoria', width: 20 },
    { header: 'Estado', key: 'estadoproducto', width: 15 },
    { header: 'Unidad', key: 'unidad', width: 15 },
    { header: 'Característica', key: 'medida', width: 20 },
    { header: 'Otras Características', key: 'caracteristica', width: 25 },
    { header: 'Código Nandina', key: 'codigonandina', width: 15 },
  ]

  const data = [
    {
      Código: 'PROD-001',
      Nombre: 'Ejemplo Producto',
      Descripción: 'Este es un producto de ejemplo',
      'Código de Barras': '123456789',
      Categoría: 'General',
      Subcategoría: 'Básicos',
      Estado: 'Activo',
      Unidad: 'Unidad',
      Característica: 'Color',
      'Otras Características': 'Rojo, Grande',
      'Código Nandina': '1020.30.00',
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(data)
  worksheet['!cols'] = headers.map((h) => ({ wch: h.width }))

  // Estilos de cabecera
  const range = XLSX.utils.decode_range(worksheet['!ref'])
  for (let C = range.s.c; C <= range.e.c; C++) {
    const cellRef = XLSX.utils.encode_cell({ c: C, r: 0 })
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = {
        fill: { fgColor: { rgb: '4F81BD' } },
        font: { color: { rgb: 'FFFFFF' }, bold: true },
        alignment: { horizontal: 'center' },
      }
    }
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla Productos')
  XLSX.writeFile(workbook, 'Plantilla_Importacion_Productos.xlsx', { cellStyles: true })
}

/**
 * Exporta el catálogo actual de productos a Excel.
 */
export function exportToXLSX_CatalogoProductos(data) {
  const headers = [
    { header: 'N°', key: 'numero', width: 5 },
    { header: 'Fecha', key: 'fecha', width: 15 },
    { header: 'Código', key: 'codigo', width: 15 },
    { header: 'Nombre', key: 'nombre', width: 25 },
    { header: 'Descripción', key: 'descripcion', width: 35 },
    { header: 'Código de Barras', key: 'codigobarras', width: 20 },
    { header: 'Categoría', key: 'categoria', width: 20 },
    { header: 'Subcategoría', key: 'subcategoria', width: 20 },
    { header: 'Estado', key: 'estadoproducto', width: 15 },
    { header: 'Unidad', key: 'unidad', width: 15 },
    { header: 'Característica', key: 'medida', width: 20 },
    { header: 'Otras Características', key: 'caracteristica', width: 25 },
    { header: 'Código Nandina', key: 'codigonandina', width: 15 },
  ]

  const dataForExport = data.map((row, index) => ({
    'N°': index + 1,
    Fecha: row.fecha || '',
    Código: row.codigo || '',
    Nombre: row.nombre || '',
    Descripción: row.descripcion || '',
    'Código de Barras': row.codigobarras || '',
    Categoría: row.categoria || '',
    Subcategoría: row.subcategoria || '',
    Estado: row.estadoproducto || '',
    Unidad: row.unidad || '',
    Característica: row.medida || '',
    'Otras Características': row.caracteristica || '',
    'Código Nandina': row.codigonandina || '',
  }))

  const worksheet = XLSX.utils.json_to_sheet(dataForExport)
  worksheet['!cols'] = headers.map((h) => ({ wch: h.width }))

  // Estilos de cabecera
  const range = XLSX.utils.decode_range(worksheet['!ref'])
  for (let C = range.s.c; C <= range.e.c; C++) {
    const cellRef = XLSX.utils.encode_cell({ c: C, r: 0 })
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = {
        fill: { fgColor: { rgb: '4F81BD' } },
        font: { color: { rgb: 'FFFFFF' }, bold: true },
        alignment: { horizontal: 'center' },
      }
    }
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Catálogo Productos')
  XLSX.writeFile(workbook, 'Catalogo_Productos.xlsx', { cellStyles: true })
}

/**
 * Lee un archivo Excel y retorna los datos mapeados a las claves que el sistema entiende.
 * @param {File} file El archivo seleccionado por el usuario.
 */
export async function importarProductosDesdeExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const bstr = e.target.result
        const workbook = XLSX.read(bstr, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(worksheet)

        // Mapeo de cabeceras en español a claves inglesas
        const headerMap = {
          Código: 'codigo',
          Nombre: 'nombre',
          Descripción: 'descripcion',
          'Código de Barras': 'codigobarras',
          Categoría: 'categoria_nombre',
          Subcategoría: 'subcategoria_nombre',
          Estado: 'estado_nombre',
          Unidad: 'unidad_nombre',
          Característica: 'medida_nombre',
          'Otras Características': 'caracteristica',
          'Código Nandina': 'codigonandina',
        }

        const mappedData = rows.map((row) => {
          const newRow = {}
          Object.keys(row).forEach((key) => {
            const mappedKey = headerMap[key.trim()]
            if (mappedKey) {
              newRow[mappedKey] = row[key]
            }
          })
          return newRow
        })

        resolve(mappedData)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = (err) => reject(err)
    reader.readAsBinaryString(file)
  })
}

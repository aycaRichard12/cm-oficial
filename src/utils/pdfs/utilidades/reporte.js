import jsPDF from 'jspdf'
import { dibujarCuerpoTabla, verificarTamanoPantallaYRedirigir } from '../dibujar'

export function PDFreporteUtilidadesProductos(
  reportData,
  startDate,
  endDate,
  almacen = null,
  cliente = null,
  campana = null,
  categoriaProd = null,
  visibleColumnsFromTable = [],
  orientation = 'landscape',
) {
  const doc = new jsPDF({
    orientation: orientation,
    unit: 'mm',
  })

  // Todas las columnas posibles para la tabla de productos
  const allPossibleColumns = [
    { header: 'Código', dataKey: 'codigo_producto', name: 'codigo_producto' },
    { header: 'Producto', dataKey: 'nombre_producto', name: 'nombre_producto' },
    { header: 'Categ. Precio', dataKey: 'categoria_precio', name: 'categoria_precio' },
    { header: 'Categoría', dataKey: 'categoria', name: 'categoria' },
    { header: 'Cant. Vendida', dataKey: 'cantidad_vendida', name: 'cantidad_vendida' },
    {
      header: 'Prec. Unit. Prom.',
      dataKey: 'precio_unitario_promedio',
      name: 'precio_unitario_promedio',
    },
    { header: 'Total Vendido', dataKey: 'total_vendido', name: 'total_vendido' },
    {
      header: 'Costo Unit. Prom.',
      dataKey: 'costo_unitario_promedio',
      name: 'costo_unitario_promedio',
    },
    { header: 'Costo Total', dataKey: 'costo_total', name: 'costo_total' },
    { header: 'Utilidad', dataKey: 'utilidad', name: 'utilidad' },
    {
      header: 'Margen s/ Venta Neta (%)',
      dataKey: 'margen_sobre_venta_neta',
      name: 'margen_sobre_venta_neta',
    },
    {
      header: 'Margen s/ Venta Bruta (%)',
      dataKey: 'margen_sobre_venta_bruta',
      name: 'margen_sobre_venta_bruta',
    },
  ]

  // Filtrar columnas si vienen desde la tabla visible
  let columns = allPossibleColumns
  if (visibleColumnsFromTable && visibleColumnsFromTable.length > 0) {
    const visibleNames = visibleColumnsFromTable.map((c) => c.name)
    columns = allPossibleColumns.filter((c) => visibleNames.includes(c.name))
  }

  // Calcular totales para las columnas numéricas
  const totales = reportData.reduce(
    (acc, row) => {
      acc.cantidad_vendida += Number(row.cantidad_vendida || 0)
      acc.total_vendido += Number(row.total_vendido || 0)
      acc.costo_total += Number(row.costo_total || 0)
      acc.utilidad += Number(row.utilidad || 0)
      return acc
    },
    {
      cantidad_vendida: 0,
      total_vendido: 0,
      costo_total: 0,
      utilidad: 0,
    },
  )

  // Mapear los datos para el PDF (sin modificar los originales)
  const datos = reportData.map((row) => ({
    codigo_producto: row.codigo_producto,
    nombre_producto: row.nombre_producto,
    categoria_precio: row.categoria_precio,
    categoria: row.categoria,
    cantidad_vendida: row.cantidad_vendida,
    precio_unitario_promedio: row.precio_unitario_promedio,
    total_vendido: row.total_vendido,
    costo_unitario_promedio: row.costo_unitario_promedio,
    costo_total: row.costo_total,
    utilidad: row.utilidad,
    margen_sobre_venta_neta: row.margen_sobre_venta_neta,
    margen_sobre_venta_bruta: row.margen_sobre_venta_bruta,
  }))

  // Fila de totales con formato en negrita
  const rowTotales = {
    cantidad_vendida: `<b>${totales.cantidad_vendida}</b>`,
    total_vendido: `<b>${Number(totales.total_vendido).toFixed(2)}</b>`,
    costo_total: `<b>${Number(totales.costo_total).toFixed(2)}</b>`,
    utilidad: `<b>${Number(totales.utilidad).toFixed(2)}</b>`,
  }

  // Colocar la etiqueta "TOTAL GENERAL" en la última columna no numérica visible
  const totalKeys = [
    'cantidad_vendida',
    'total_vendido',
    'costo_total',
    'utilidad',
    'precio_unitario_promedio',
    'costo_unitario_promedio',
    'margen_sobre_venta_neta',
    'margen_sobre_venta_bruta',
  ]
  const nonTotalColumns = columns.filter((c) => !totalKeys.includes(c.dataKey))
  if (nonTotalColumns.length > 0) {
    const lastNonTotalCol = nonTotalColumns[nonTotalColumns.length - 1]
    rowTotales[lastNonTotalCol.dataKey] = '<b>TOTAL GENERAL</b>'
  }

  datos.push(rowTotales)

  // Estilos de columna para datos
  const columnStyles = {
    codigo_producto: { cellWidth: 20, halign: 'left' },
    nombre_producto: { cellWidth: 40, halign: 'left' },
    categoria_precio: { cellWidth: 22, halign: 'left' },
    categoria: { cellWidth: 22, halign: 'left' },
    cantidad_vendida: { cellWidth: 18, halign: 'right' },
    precio_unitario_promedio: { cellWidth: 18, halign: 'right' },
    total_vendido: { cellWidth: 20, halign: 'right' },
    costo_unitario_promedio: { cellWidth: 18, halign: 'right' },
    costo_total: { cellWidth: 20, halign: 'right' },
    utilidad: { cellWidth: 20, halign: 'right' },
    margen_sobre_venta_neta: { cellWidth: 22, halign: 'right' },
    margen_sobre_venta_bruta: { cellWidth: 22, halign: 'right' },
  }

  // Estilos de encabezado (con rotación para ahorrar espacio)
  const headerColumnStyles = {
    codigo_producto: { cellWidth: 20, halign: 'left', angle: 90, valign: 'middle' },
    nombre_producto: { cellWidth: 40, halign: 'left', angle: 90, valign: 'middle' },
    categoria_precio: { cellWidth: 22, halign: 'left', angle: 90, valign: 'middle' },
    categoria: { cellWidth: 22, halign: 'left', angle: 90, valign: 'middle' },
    cantidad_vendida: { cellWidth: 18, halign: 'right', angle: 90, valign: 'middle' },
    precio_unitario_promedio: { cellWidth: 18, halign: 'right', angle: 90, valign: 'middle' },
    total_vendido: { cellWidth: 20, halign: 'right', angle: 90, valign: 'middle' },
    costo_unitario_promedio: { cellWidth: 18, halign: 'right', angle: 90, valign: 'middle' },
    costo_total: { cellWidth: 20, halign: 'right', angle: 90, valign: 'middle' },
    utilidad: { cellWidth: 20, halign: 'right', angle: 90, valign: 'middle' },
    margen_sobre_venta_neta: { cellWidth: 22, halign: 'right', angle: 90, valign: 'middle' },
    margen_sobre_venta_bruta: { cellWidth: 22, halign: 'right', angle: 90, valign: 'middle' },
  }

  // Construir texto de filtros usando los parámetros reales
  const partesFiltro = []
  if (almacen) {
    const nombreAlmacen = typeof almacen === 'object' ? almacen.nombre : almacen
    partesFiltro.push(`Almacén: ${nombreAlmacen}`)
  }
  if (cliente) {
    const nombreCliente = typeof cliente === 'object' ? cliente.nombre : cliente
    partesFiltro.push(`Cliente: ${nombreCliente}`)
  }
  if (campana) {
    const nombreCampana = typeof campana === 'object' ? campana.nombre : campana
    partesFiltro.push(`Campaña: ${nombreCampana}`)
  }
  if (categoriaProd) {
    const nombreCategoria = typeof categoriaProd === 'object' ? categoriaProd.nombre : categoriaProd
    partesFiltro.push(`Categoría: ${nombreCategoria}`)
  }

  const filtrosText = partesFiltro.length > 0 ? partesFiltro.join(' ') : 'Sin filtros aplicados'

  const Izquierda = {
    titulo: 'DATOS DEL REPORTE',
    campos: [
      {
        label: 'Filtros',
        valor: filtrosText,
      },
    ],
  }

  const fechas = {
    inicio: startDate,
    final: endDate,
  }

  // Llamada a la función que dibuja la tabla
  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE DE UTILIDADES POR PRODUCTO',
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

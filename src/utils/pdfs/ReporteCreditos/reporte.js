import jsPDF from 'jspdf'
import { dibujarCuerpoTabla } from '../dibujar'
import { verificarTamanoPantallaYRedirigir } from '../dibujar'
function getEstadoText(estado) {
  const estados = {
    1: 'Activo',
    2: 'Finalizado',
    3: 'Atrasado',
    4: 'Anulado',
  }
  return estados[Number(estado)] || ''
}
export function PDFreporteCreditosA(
  reportData,
  startDate,
  endDate,
  clienteSeleccionado = null,
  sucursalSeleccionada = null,
  visibleColumnsFromTable = [],
  orientation = 'landscape',
) {
  const doc = new jsPDF({
    orientation: orientation,
    unit: 'mm',
  })

  // Configuración base de todas las posibles columnas
  const allPossibleColumns = [
    { header: 'N°', dataKey: 'numero', name: 'numero' },
    { header: 'Fecha Crédito', dataKey: 'fechaventa', name: 'fechaventa' },
    { header: 'Cliente', dataKey: 'razonsocial', name: 'razonsocial' },
    { header: 'Sucursal', dataKey: 'sucursal', name: 'sucursal' },
    { header: 'Fecha Límite', dataKey: 'fechalimite', name: 'fechalimite' },
    { header: 'Cuotas', dataKey: 'ncuotas', name: 'ncuotas' },
    { header: 'Cuotas Procesadas', dataKey: 'cuotasprocesadas', name: 'cuotasprocesadas' },
    { header: 'Valor Cuota', dataKey: 'valorcuotas', name: 'valorcuotas' },
    { header: 'Total Venta', dataKey: 'totalventa', name: 'totalventa' },
    { header: 'Total Cobrado', dataKey: 'totalcobrado', name: 'totalcobrado' },
    { header: 'Saldo', dataKey: 'saldo', name: 'saldo' },
    { header: 'Total Atrasado', dataKey: 'totalatrasado', name: 'totalatrasado' },
    { header: 'Total Anulado', dataKey: 'totalanulado', name: 'totalanulado' },
    { header: 'Mora Días', dataKey: 'moradias', name: 'moradias' },
    { header: 'Estado', dataKey: 'estado', name: 'estado' },
  ]

  // Filtrar si se proporcionaron columnas visibles desde la tabla
  let columns = allPossibleColumns
  if (visibleColumnsFromTable && visibleColumnsFromTable.length > 0) {
    const visibleNames = visibleColumnsFromTable.map((c) => c.name)
    columns = allPossibleColumns.filter((c) => visibleNames.includes(c.name))
  }
  // Mapeo de datos
  const totales = reportData.reduce(
    (acc, row) => {
      acc.totalventa += Number(row.totalventa || 0)
      acc.totalcobrado += Number(row.totalcobrado || 0)
      acc.saldo += Number(row.saldo || 0)
      acc.totalatrasado += Number(row.totalatrasado || 0)
      acc.totalanulado += Number(row.totalanulado || 0)
      acc.moradias += Number(row.moradias || 0)
      return acc
    },
    {
      totalventa: 0,
      totalcobrado: 0,
      saldo: 0,
      totalatrasado: 0,
      totalanulado: 0,
      moradias: 0,
    },
  )
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
  datos.push({
    totalventa: `<b>${Number(totales.totalventa).toFixed(2)}</b>`,
    totalcobrado: `<b>${Number(totales.totalcobrado).toFixed(2)}</b>`,
    saldo: `<b>${Number(totales.saldo).toFixed(2)}</b>`,
    totalatrasado: `<b>${Number(totales.totalatrasado).toFixed(2)}</b>`,
    totalanulado: `<b>${Number(totales.totalanulado).toFixed(2)}</b>`,
    moradias: `<b>${Number(totales.moradias).toFixed(2)}</b>`,
  })

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
  const docResult = verificarTamanoPantallaYRedirigir(doc)
  if (!docResult) return
  return docResult
}

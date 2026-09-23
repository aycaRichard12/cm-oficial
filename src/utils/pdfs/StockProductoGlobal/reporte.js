import jsPDF from 'jspdf'
import { dibujarCuerpoTabla } from '../dibujar'
import { verificarTamanoPantallaYRedirigir } from '../dibujar'
import { useCurrencyStore } from 'src/stores/currencyStore'
import { decimas, redondear } from 'src/composables/FuncionesG'
import { crearFilaTotalGeneral } from '../dibujar'
const divisaActiva = useCurrencyStore().simbolo

export function PDFreporteStockProductosIndividual(rows, visibleColumnsFromTable = []) {
  console.log(rows)
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // Normalizar entrada: acepta array plano o ref reactiva
  const arrRows = Array.isArray(rows) ? rows : (rows?.value ?? [])

  /* =========================
   * 1. CATÁLOGO COMPLETO DE COLUMNAS
   * Mapa de columnas posibles con sus estilos PDF.
   * La columna 'indice' siempre se incluye.
   ========================= */
  const allPossibleColumns = [
    { header: 'N°', dataKey: 'indice', name: 'numero', width: 10, halign: 'center' },
    { header: 'Código', dataKey: 'codigo', name: 'codigo', width: 15, halign: 'center' },
    { header: 'Producto', dataKey: 'producto', name: 'producto', width: 20, halign: 'left' },
    { header: 'Categoría', dataKey: 'categoria', name: 'categoria', width: 15, halign: 'center' },
    {
      header: 'Sub Categoría',
      dataKey: 'subcategoria',
      name: 'subcategoria',
      width: 25,
      halign: 'center',
    },
    {
      header: 'Descripción',
      dataKey: 'descripcion',
      name: 'descripcion',
      width: 35,
      halign: 'left',
    },
    { header: 'Unidad', dataKey: 'unidad', name: 'unidad', width: 10, halign: 'center' },
    { header: 'Stock', dataKey: 'stock', name: 'stock', width: 15, halign: 'right' },
    { header: 'Estado', dataKey: 'estado', name: 'estado', width: 15, halign: 'center' },
    {
      header: `C.Unit (${divisaActiva})`,
      dataKey: 'costounitario',
      name: 'costounitario',
      width: 20,
      halign: 'right',
    },
    {
      header: `Presio Venta (${divisaActiva})`,
      dataKey: 'precioSugerido',
      name: 'precioSugerido',
      width: 20,
      halign: 'right',
    },
    {
      header: `Total Inventario(${divisaActiva})`,
      dataKey: 'costototal',
      name: 'costototal',
      width: 25,
      halign: 'right',
    },
    {
      header: `Total venta (${divisaActiva})`,
      dataKey: 'costototalventa',
      name: 'costototalventa',
      width: 25,
      halign: 'right',
    },
  ]

  /* =========================
   * 2. FILTRAR COLUMNAS VISIBLES
   * Si se reciben columnas desde la tabla UI, filtrar el catálogo.
   * El índice (N°) siempre se incluye.
   ========================= */
  let columns
  if (visibleColumnsFromTable && visibleColumnsFromTable.length > 0) {
    const visibleNames = new Set(visibleColumnsFromTable.map((c) => c.name))
    columns = allPossibleColumns.filter((c) => c.name === 'numero' || visibleNames.has(c.name))
  } else {
    // Sin información de columnas visibles → mostrar todas excepto 'pais' y 'estado' por defecto
    columns = allPossibleColumns.filter((c) => !['pais', 'estado'].includes(c.name))
  }

  /* =========================
   * 3. MAPEO DE DATOS
   ========================= */
  const datos = arrRows.map((item, indice) => ({
    indice: indice + 1,
    codigo: item.codigo ?? '',
    producto: item.producto ?? '',
    categoria: item.categoria ?? '',
    //subcategoria: item.subcategoria ? item.subcategoria : 'Sin/Subcategoría',
    stock: item.stock ?? '',
    descripcion: item.descripcion ?? '',
    unidad: item.unidad ?? '',
    estado: item.estado ?? '',
    costounitario: decimas(redondear(parseFloat(item.costounitario ?? 0))),
    precioSugerido: decimas(redondear(parseFloat(item.costounitario ?? 0))),
    costototal: item.costototal,
    costototalventa: item.costototalventa,
  }))

  /* =========================
   * 4. FILA DE TOTAL
   * El colSpan se calcula dinámicamente según las columnas visibles.
   * El total monetario solo aparece si la columna 'costototal' es visible.
   ========================= */
  const costoTotal = arrRows.reduce(
    (sum, row) => sum + redondear(parseFloat(row.costounitario ?? 0) * parseFloat(row.stock ?? 0)),
    0,
  )
  const costototalventa = arrRows.reduce(
    (sum, row) => sum + redondear(parseFloat(row.costototalventa ?? 0)),
    0,
  )

  const costoTotalIndex = columns.findIndex((c) => c.dataKey === 'costototal')
  const hasCostoTotal = costoTotalIndex !== -1
  const spanTotal = hasCostoTotal ? costoTotalIndex : columns.length

  datos.push(
    crearFilaTotalGeneral(
      `TOTAL GENERAL (${divisaActiva})`,
      hasCostoTotal
        ? [
            { valor: costoTotal, halign: 'right' },
            { valor: costototalventa, halign: 'right' },
          ]
        : [],
      spanTotal,
    ),
  )

  /* =========================
   * 5. ESTILOS (generados dinámicamente desde el catálogo)
   ========================= */
  const columnStyles = {}
  const headerColumnStyles = {}
  columns.forEach((col) => {
    columnStyles[col.dataKey] = { cellWidth: col.width, halign: col.halign }
    headerColumnStyles[col.dataKey] = { cellWidth: col.width, halign: 'center' }
  })

  /* =========================
   * 6. CABECERA IZQUIERDA
   ========================= */
  const almacenValor = arrRows[0]?.almacen ?? ''
  const Izquierda = {
    titulo: 'DATOS DEL REPORTE',
    campos: almacenValor ? [{ label: 'Almacén', valor: almacenValor }] : [],
  }

  /* =========================
   * 7. DIBUJAR PDF
   ========================= */
  dibujarCuerpoTabla(
    doc,
    columns,
    datos,
    'REPORTE STOCK PRODUCTOS',
    columnStyles,
    headerColumnStyles,
    Izquierda,
    null,
    true,
    null,
    null,
  )

  const docResult = verificarTamanoPantallaYRedirigir(doc)
  if (!docResult) return
  return docResult
}

<template>
  <q-page>
    <div>
      <!-- Botones principales (exportar/imprimir) -->
      <CompraAcciones @exportar-excel="exportarexcel" @imprimirReporte="imprimirReporte" />

      <!-- Tabla de compras -->
      <BaseFilterableTable
        id="tabla"
        ref="refHijo"
        title="Compras"
        :rows="processedRows"
        :columns="columns"
        :arrayHeaders="arrayHeaders"
        :sumColumns="sumColumns"
        nombreColumnaTotales="tipocompra"
        row-key="id"
        :filter="busqueda"
        flat
        dense
      >
        <!-- Columna personalizada: autorización -->

        <!-- Columna personalizada: acciones -->

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="picture_as_pdf"
              @click="$emit('detallePdf', props.row)"
            >
              <q-tooltip>Ver Detalle en PDF</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </BaseFilterableTable>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CompraAcciones from './CompraAcciones.vue'
import { PDFReporteCompras } from 'src/utils/pdfs/reporteCompras/reporte.js'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import * as XLSX from 'xlsx'

// Stores & composables

// Referencias
const refHijo = ref(null)
const busqueda = ref('')

// Props
const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  divisa: {
    type: [String, Object],
    default: 'USD',
  },
  fechaInicio: {
    type: String,
    default: '',
  },
  fechaIncio: {
    type: String,
    default: '',
  },
  fechaFin: {
    type: String,
    default: '',
  },
  // Almacén necesario para el reporte de compras
})

// Emits
defineEmits(['detallePdf'])

// Obtener nombre o símbolo representativo de la divisa
const nombreDivisa = computed(() => {
  if (!props.divisa) return 'USD'
  if (typeof props.divisa === 'object') {
    return props.divisa.tipo || props.divisa.simbolo || props.divisa.nombre || 'USD'
  }
  return props.divisa
})

const fechai = computed(() => {
  const val = props.fechaInicio || props.fechaIncio || ''
  return typeof val === 'string' ? val : ''
})

const fechaf = computed(() => {
  const val = props.fechaFin || ''
  return typeof val === 'string' ? val : ''
})

// Columnas de la tabla (como computed para que reaccione al cargar la divisa)
const columns = computed(() => [
  {
    name: 'num',
    label: 'N°',
    field: 'num',
    align: 'center',
  },
  {
    name: 'fecha',
    label: 'Fecha',
    field: 'fecha',
    align: 'left',
    dataType: 'date',
  },
  {
    name: 'codigo',
    label: 'Codigo',
    field: 'codigo',
    align: 'left',
    dataType: 'text',
  },
  {
    name: 'nombrelote',
    label: 'Nombre Lote',
    field: 'nombrelote',
    align: 'left',
    dataType: 'text',
  },
  {
    name: 'proveedor',
    label: 'Proveedor',
    field: 'proveedor',
    align: 'left',
    dataType: 'text',
  },
  {
    name: 'total',
    label: `Importe Compra (${nombreDivisa.value})`,
    field: 'total',
    align: 'right',
    dataType: 'text',
  },
  {
    name: 'autorizacionTexto',
    label: 'Autorización',
    field: 'autorizacionTexto',
    align: 'left',
    dataType: 'text',
  },
  {
    name: 'nfactura',
    label: 'Factura',
    field: 'nfactura',
    align: 'right',
    dataType: 'number',
  },
  {
    name: 'almacen',
    label: 'Almacén',
    field: 'almacen',
    align: 'left',
    dataType: 'text',
  },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'left',
  },
])

// Cabeceras para exportar (solo los campos relevantes)
const arrayHeaders = computed(() =>
  columns.value.filter((col) => !['num', 'acciones'].includes(col.name)).map((col) => col.name),
)

// Columnas que se suman en el pie de la tabla
const sumColumns = ['total']

// Datos procesados: añade número de fila automático
const processedRows = computed(() =>
  props.rows.map((row, index) => ({
    ...row,
    num: index + 1,
  })),
)

// Función para exportar a Excel (mantenida localmente, o se podría emitir al padre)
// Función para exportar a Excel (adaptada a la estructura del PDF)
const exportarexcel = () => {
  // ── 1. Obtener datos y columnas visibles ─────────────────
  const resultado = refHijo.value.obtenerDatosFiltrados()
  const visibleColumns = refHijo.value?.obtenerColumnasVisibles() || []

  // Normalizar resultado: a veces devuelve un ref, a veces el array directamente
  const lista = (resultado?.value || resultado || []).filter(Boolean)

  // Si no hay datos, no genera el Excel
  if (!lista.length) {
    console.warn('No hay datos para exportar a Excel')
    return
  }

  // ── 2. Ordenar por fecha (como en el PDF) ─────────────────
  const ordenados = [...lista]
    .map((item) => ({ ...item, _fechaOrden: item.fecha }))
    .sort((a, b) => (a._fechaOrden > b._fechaOrden ? 1 : -1))

  // ── 3. Definir todas las columnas posibles (copiado del PDF) ──
  const allPossibleColumns = [
    { header: 'N', dataKey: 'nro', width: 10 },
    { header: 'Fecha', dataKey: 'fecha', width: 20 },
    { header: 'Código', dataKey: 'codigo', width: 30 },
    { header: 'Nombre Lote', dataKey: 'nombrelote', width: 30 },
    { header: 'Proveedor', dataKey: 'proveedor', width: 30 },
    { header: `Importe Compra (${nombreDivisa.value})`, dataKey: 'total', width: 15 },
    { header: 'Autorización', dataKey: 'autorizacionTexto', width: 25 },
    { header: 'Factura', dataKey: 'nfactura', width: 10 },
    { header: 'Almacén', dataKey: 'almacen', width: 20 },
  ]

  // ── 4. Filtrar columnas según visibilidad (igual que en PDF) ──
  let exportColumns = allPossibleColumns
  if (visibleColumns.length > 0) {
    const visibleNames = visibleColumns.map((c) => c.name)
    exportColumns = allPossibleColumns.filter(
      (col) => visibleNames.includes(col.dataKey) || col.dataKey === 'nro', // siempre incluimos Nro
    )
  }

  // ── 5. Construir array de datos SOLO con las columnas seleccionadas ──
  const datos = ordenados.map((item, index) => {
    const fila = {}
    exportColumns.forEach((col) => {
      let valor
      if (col.dataKey === 'nro') {
        valor = index + 1
      } else if (col.dataKey === 'total') {
        valor = Number(item.total || 0).toFixed(2)
      } else {
        valor = item[col.dataKey] || ''
      }
      fila[col.header] = valor
    })
    return fila
  })

  // ── 6. Calcular total general y añadir fila de totales ──
  const total = ordenados.reduce((sum, u) => sum + parseFloat(u.total || 0), 0)
  const filaTotal = {}
  exportColumns.forEach((col) => {
    if (col.dataKey === 'nro') {
      filaTotal[col.header] = `TOTAL GENERAL (${nombreDivisa.value})`
    } else if (col.dataKey === 'total') {
      filaTotal[col.header] = total.toFixed(2)
    } else {
      filaTotal[col.header] = ''
    }
  })
  datos.push(filaTotal)

  // ── 7. Crear hoja de cálculo ─────────────────
  const headers = exportColumns.map((c) => c.header)
  const worksheet = XLSX.utils.json_to_sheet(datos, { header: headers })

  // Anchos de columna
  worksheet['!cols'] = exportColumns.map((c) => ({ wch: c.width }))

  // ── 8. Generar y descargar archivo ────────────
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Compras')
  XLSX.writeFile(workbook, `Reporte_Compras_${new Date().toISOString().split('T')[0]}.xlsx`)
}

// Función para imprimir reporte de compras
const imprimirReporte = async () => {
  try {
    const resultado = refHijo.value.obtenerDatosFiltrados()
    const visibleColumns = refHijo.value?.obtenerColumnasVisibles() || []
    console.log('columnas Visibles:   ' + visibleColumns)

    console.log(fechai.value)
    const { doc, mobileBlobUrl } = await PDFReporteCompras(
      visibleColumns,
      resultado,
      nombreDivisa.value,
      fechai.value,
      fechaf.value,
    )

    // Abrir en ventana nueva (escritorio)
    doc.output('dataurlnewwindow')

    // Opcional: si es móvil y quieres redirigir al blob
    if (mobileBlobUrl) {
      window.location.href = mobileBlobUrl
    }
  } catch (error) {
    console.error('Error al generar el PDF:', error)
    // Notificar al usuario, por ejemplo con un snackbar o toast
  }
}

// Inicialización
onMounted(async () => {})
</script>

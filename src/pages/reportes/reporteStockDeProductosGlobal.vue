<template>
  <q-page class="q-pa-md">
    <!-- Formulario de parámetros -->
    <div class="titulo">Stock Productos Global</div>

    <StockGlobalParams v-model:modelValueFecha="fechaFin" v-model:modelValueAlmacen="almacenSeleccionado"
      :opcionesAlmacenes="opcionesAlmacenes" @generar="generarReporte" @vistaPrevia="mostrarVistaPrevia" />

    <!-- Filtros -->
    <StockGlobalFilters v-model:filtroEstado="filtroEstado" v-model:ordenStock="ordenStock" @generar="generarReporte" />

    <!-- Tabla de resultados -->
    <StockGlobalTable :rows="datosFiltrados" :columns="columnas" :sumatoriaStock="sumatoriaStock"
      :sumatoriaCostoTotal="sumatoriaCostoTotal" />

    <!-- Modal de vista previa PDF -->
    <StockGlobalPdfModal v-model:modelValue="mostrarModal" :pdfData="pdfData" />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { date } from 'quasar'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { obtenerFechaActualDato } from 'src/composables/FuncionesG'
import { PDFreporteStockProductosIndividual } from 'src/utils/pdfReportGenerator'

// Importar componentes refactorizados
import StockGlobalParams from 'src/components/reporte/stockGlobal/StockGlobalParams.vue'
import StockGlobalFilters from 'src/components/reporte/stockGlobal/StockGlobalFilters.vue'
import StockGlobalTable from 'src/components/reporte/stockGlobal/StockGlobalTable.vue'
import StockGlobalPdfModal from 'src/components/reporte/stockGlobal/StockGlobalPdfModal.vue'

const pdfData = ref(null)
const mostrarModal = ref(false)
const fechaFin = ref(obtenerFechaActualDato())
const $q = useQuasar()
const almacenSeleccionado = ref(null)
const opcionesAlmacenes = ref([])
const datosOriginales = ref([])
const datosFiltrados = ref([])
const filtroEstado = ref(0)
const ordenStock = ref(1)
const nombreAlmacenSeleccionado = ref('')
const idempresa = idempresa_md5()

const columnas = [
  { name: 'numero', label: 'N°', align: 'right', field: 'numero' },
  {
    name: 'fecha',
    label: 'Fecha registro',
    field: 'fecha',
    format: (val) => formatearFecha(val),
  },
  { name: 'almacen', label: 'Almacén', field: 'almacen', align: 'left' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'producto', label: 'Producto', field: 'producto', align: 'left' },
  { name: 'categoria', label: 'Categoría', field: 'categoria', align: 'left' },
  { name: 'subcategoria', label: 'Sub categoría', field: 'subcategoria', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'unidad', label: 'Unidad', field: 'unidad', align: 'left' },
  { name: 'pais', label: 'País', field: 'pais', align: 'left' },
  { name: 'stock', label: 'Stock', field: 'stock', align: 'right' },
  {
    name: 'costototal',
    label: 'Costo total',
    align: 'right',
    field: (row) => calcularCostoTotal(row),
    format: (val) => formatearDecimal(val),
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    format: (val) => estadoTexto(val),
    align: 'left',
  },
]

const sumatoriaStock = computed(() => {
  return formatearDecimal(
    datosFiltrados.value.reduce((sum, dato) => sum + parseFloat(dato.stock || 0), 0),
  )
})

const sumatoriaCostoTotal = computed(() => {
  return formatearDecimal(
    datosFiltrados.value.reduce(
      (sum, dato) => sum + parseFloat(dato.costounitario || 0) * parseFloat(dato.stock || 0),
      0,
    ),
  )
})

onMounted(async () => {
  await cargarAlmacenes()
  // await generarReporte()
})

async function cargarAlmacenes() {
  try {
    const response = await api.get(`listaAlmacen/${idempresa}`)
    console.log(response)
    if (Array.isArray(response.data)) {
      opcionesAlmacenes.value = response.data
        .filter((almacen) => Number(almacen.estado) === 1)
        .map((almacen) => ({
          ...almacen,
          label: almacen.nombre,
          value: almacen.id,
        }))
    }
    // No setear por defecto si queremos que el usuario seleccione explícitamente, pero el usuario no pidió remover esto.
    // Mantendré la selección del primer almacén, pero sin generar el reporte.
    if (opcionesAlmacenes.value.length > 0) {
      almacenSeleccionado.value = opcionesAlmacenes.value[0].id // Use .id directly if value is the id
    }


    if (opcionesAlmacenes.value.length > 0) {
      // almacenSeleccionado.value = opcionesAlmacenes.value[0].value
    }
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la lista de almacenes',
    })
  }
}

async function generarReporte() {
  if (!almacenSeleccionado.value) {
    datosOriginales.value = []
    datosFiltrados.value = []
    // $q.notify({
    //   type: 'warning',
    //   message: 'Seleccione un almacén',
    // })
    return
  }

  try {
    const point = `reporteproductoalmacen/${almacenSeleccionado.value}/${idempresa}/${fechaFin.value}`
    const response = await api.get(`${point}`)
    console.log(response.data)

    if (!Array.isArray(response.data)) {
      datosOriginales.value = []
    } else {
      datosOriginales.value = response.data.map((item, index) => ({
        ...item,
        numero: index + 1,
        idstock: item.idstock ?? 0, // reemplaza null por 0
        imagen: item.imagen && item.imagen !== 'undefined' ? item.imagen : '', // reemplaza 'undefined'
      }))
    }

    filtrarYOrdenarDatos()

    // Guardar nombre del almacén seleccionado
    const almacen = opcionesAlmacenes.value.find((a) => a.id === almacenSeleccionado.value)
    nombreAlmacenSeleccionado.value = almacen ? almacen.nombre : ''
  } catch (error) {
    console.error('Error al generar reporte:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar el reporte',
    })
  }
}

function filtrarYOrdenarDatos() {
  // Aplicar filtro
  let datos = [...datosOriginales.value]

  if (filtroEstado.value !== 0) {
    datos = datos.filter((item) => Number(item.estado) === Number(filtroEstado.value))
  }

  // Aplicar orden
  if (ordenStock.value === 2) {
    datos.sort((a, b) => parseFloat(a.stock) - parseFloat(b.stock))
  } else {
    datos.sort((a, b) => parseFloat(b.stock) - parseFloat(a.stock))
  }

  datosFiltrados.value = datos
}

async function mostrarVistaPrevia() {
  if (!almacenSeleccionado.value) {
    $q.notify({
      type: 'warning',
      message: 'Seleccione un almacén',
    })
    return
  }
  await generarReporte()
  if (!datosFiltrados.value.length) {
    if (!almacenSeleccionado.value) {
      // Already handled in generating report but double check
    } else {
      $q.notify({
        type: 'warning',
        message: 'No hay datos para mostrar',
      })
    }
    return
  }
  const doc = PDFreporteStockProductosIndividual(datosFiltrados)
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}

// Funciones de utilidad
function formatearFecha(fecha) {
  return date.formatDate(fecha, 'DD/MM/YYYY')
}

function formatearDecimal(valor) {
  return parseFloat(valor || 0).toFixed(2)
}

function calcularCostoTotal(item) {
  return parseFloat(item.costounitario || 0) * parseFloat(item.stock || 0)
}

function estadoTexto(estado) {
  return Number(estado) === 1 ? 'Activo' : 'Inactivo'
}
</script>


<style scoped>
.invoice {
  position: relative;
  background-color: #fff;
  min-height: 680px;
  padding: 15px;
}

.invoice header {
  padding: 10px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #3989c6;
}

.invoice .company-details {
  text-align: right;
}

.invoice .company-details .name {
  margin-top: 0;
  margin-bottom: 0;
}

.invoice .contacts {
  margin-bottom: 20px;
}

.invoice .invoice-to {
  text-align: left;
}

.invoice .invoice-to .to {
  margin-top: 0;
  margin-bottom: 0;
}

.invoice .invoice-details {
  text-align: right;
}

.invoice .invoice-details .invoice-id {
  margin-top: 0;
  color: #3989c6;
}

.invoice main {
  padding-bottom: 50px;
}

.invoice main .thanks {
  margin-top: -100px;
  font-size: 40px;
  margin-bottom: 50px;
}

.invoice main .notices {
  padding-left: 6px;
  border-left: 6px solid #3989c6;
}

.invoice main .notices .notice {
  font-size: 1.2em;
}

.invoice table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  margin-bottom: 20px;
}

.invoice table td,
.invoice table th {
  padding: 15px;
  background: #eee;
  border-bottom: 1px solid #fff;
}

.invoice table th {
  white-space: nowrap;
  font-weight: 400;
  font-size: 16px;
}

.invoice table td h3 {
  margin: 0;
  font-weight: 400;
  color: #3989c6;
  font-size: 1.2em;
}

.invoice table .qty,
.invoice table .total,
.invoice table .unit {
  text-align: right;
  font-size: 1.2em;
}

.invoice table .no {
  color: #fff;
  font-size: 1.6em;
  background: #3989c6;
}

.invoice table .unit {
  background: #ddd;
}

.invoice table .total {
  background: #3989c6;
  color: #fff;
}

.invoice table tbody tr:last-child td {
  border: none;
}

.invoice table tfoot td {
  background: 0 0;
  border-bottom: none;
  white-space: nowrap;
  text-align: right;
  padding: 10px 20px;
  font-size: 1.2em;
  border-top: 1px solid #aaa;
}

.invoice table tfoot tr:first-child td {
  border-top: none;
}

.invoice table tfoot tr:last-child td {
  color: #3989c6;
  font-size: 1.4em;
  border-top: 1px solid #3989c6;
}

.invoice table tfoot tr td:first-child {
  border: none;
}

.invoice footer {
  width: 100%;
  text-align: center;
  color: #777;
  border-top: 1px solid #aaa;
  padding: 8px 0;
}

@media print {
  .invoice {
    font-size: 11px !important;
    overflow: hidden !important;
  }

  .invoice footer {
    position: absolute;
    bottom: 10px;
    page-break-after: always;
  }

  .invoice>div:last-child {
    page-break-before: always;
  }
}
</style>

<template>
  <q-page class="q-pa-md">
    <!-- Formulario de parámetros -->
    <div class="titulo">Stock Productos Global</div>
    <div class="q-mb-md">
      <q-card-section>
        <div class="row justify-center q-col-gutter-md">
          <div class="col-12 col-md-4">
            <label for="fechafin">Fecha Final*</label>
            <q-input
              v-model="fechaFin"
              id="fechafin"
              type="date"
              outlined
              dense
              @update:model-value="generarReporte"
            />
          </div>
          <div class="col-12 col-md-4">
            <label for="almacen">Almacén*</label>
            <q-select
              v-model="almacenSeleccionado"
              :options="opcionesAlmacenes"
              id="almacen"
              dense=""
              outlined=""
              option-label="nombre"
              option-value="id"
              emit-value
              map-options
              clearable
              required
              @update:model-value="generarReporte"
            />
          </div>
        </div>

        <div class="row justify-center q-mt-md">
          <!-- <q-btn color="primary" label="Generar reporte" class="q-mr-sm" @click="generarReporte" /> -->
          <q-btn
            color="primary"
            label="Vista previa del Reporte"
            @click="mostrarVistaPrevia"
            :disable="!datosFiltrados.length"
          />
        </div>
      </q-card-section>
    </div>

    <!-- Filtros -->

    <div class="row justify-center q-col-gutter-md">
      <div class="col-12 col-md-6">
        <label for="porestado">Filtrar por estado del producto</label>
        <q-select
          v-model="filtroEstado"
          :options="opcionesEstado"
          id="porestado"
          dense
          outlined
          emit-value
          map-options
          @update:model-value="generarReporte"
        />
      </div>
      <div class="col-12 col-md-6">
        <label for="porstock">Ordenar por stock</label>
        <q-select
          v-model="ordenStock"
          :options="opcionesOrden"
          id="porstock"
          dense
          outlined
          emit-value
          map-options
          @update:model-value="generarReporte"
        />
      </div>
    </div>

    <!-- Tabla de resultados -->
    <q-card v-if="datosFiltrados.length" class="q-mt-md">
      <q-table
        title="Stock De Productos"
        :rows="datosFiltrados"
        :columns="columnas"
        row-key="id"
        bordered
        flat
        separator="cell"
      >
        <template v-slot:bottom-row>
          <q-tr>
            <q-td colspan="10" class="text-right">Sumatorias</q-td>
            <q-td class="text-right">{{ sumatoriaStock }}</q-td>
            <q-td class="text-right">{{ sumatoriaCostoTotal }}</q-td>
            <q-td></q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

    <!-- Modal de vista previa PDF -->
    <q-card-section>
      <q-dialog v-model="mostrarModal" full-width full-height>
        <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Vista previa de PDF</div>
            <q-space />
            <q-btn flat round icon="close" @click="mostrarModal = false" />
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-none" style="height: calc(100% - 60px)">
            <iframe
              v-if="pdfData"
              :src="pdfData"
              style="width: 100%; height: 100%; border: none"
            ></iframe>
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-card-section>
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
// const usuario = ref({})
// const empresa = ref({})
const nombreAlmacenSeleccionado = ref('')
const idempresa = idempresa_md5()
const opcionesEstado = [
  { label: 'Todos', value: 0 },
  { label: 'Activos', value: 1 },
  { label: 'Inactivos', value: 2 },
]

const opcionesOrden = [
  { label: 'Descendente', value: 1 },
  { label: 'Ascendente', value: 2 },
]

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
  await generarReporte()
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
    almacenSeleccionado.value = opcionesAlmacenes.value[0]
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
    $q.notify({
      type: 'warning',
      message: 'Seleccione un almacén',
    })
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

function mostrarVistaPrevia() {
  if (!datosFiltrados.value.length) {
    $q.notify({
      type: 'warning',
      message: 'No hay datos para mostrar',
    })
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

  .invoice > div:last-child {
    page-break-before: always;
  }
}
</style>

<template>
  <q-page class="q-pa-md">
    <q-card flat bordered class="shadow-2 rounded-borders">
      <!-- Toolbar Header -->
      <q-toolbar class="bg-primary text-white q-py-sm">
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          to="/costounitario"
          v-tooltip="'Volver'"
        />
        <q-toolbar-title class="text-weight-bold">
          Reporte de Costo Unitario
        </q-toolbar-title>
      </q-toolbar>

      <q-card-section class="q-pa-md">
        <!-- Filters and Controls Row -->
        <div class="row q-col-gutter-md items-center justify-between">
          <!-- Almacen Selector filter -->
          <div class="col-12 col-md-4">
            <q-select
              v-model="almacenSeleccionado"
              :options="opcionesAlmacenes"
              options-dense
              emit-value
              map-options
              outlined
              dense
              label="Filtrar por Almacén"
              :disable="!reporteGenerado"
              bg-color="white"
            >
              <template v-slot:prepend>
                <q-icon name="store" />
              </template>
            </q-select>
          </div>

          <!-- Actions -->
          <div class="col-12 col-md-8 row justify-end items-center q-gutter-sm">
            <q-btn
              label="Vista Previa PDF"
              icon="picture_as_pdf"
              color="negative"
              text-color="white"
              @click="descargarPDF"
              :disable="!reporteGenerado"
              unelevated
            />
            
           <!-- Generate Report Button (Implicitly handled by mount, but good to have explicit control if needed later, 
                for now keeping it simple as per original logic which generates on mount/change) -->
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <!-- Data Table -->
        <q-table
          :rows="datosFiltrados"
          :columns="columnasTabla"
          row-key="id"
          flat
          bordered
          :filter="filter"
          :loading="loading"
          no-data-label="No hay datos disponibles"
          loading-label="Cargando datos..."
          rows-per-page-label="Filas por página"
          separator="horizontal"
          dense
        >
          <!-- Search Slot -->
          <template v-slot:top-right>
            <q-input
              outlined
              dense
              debounce="300"
              v-model="filter"
              placeholder="Buscar..."
              bg-color="grey-1"
              color="primary"
            >
              <template v-slot:append>
                <q-icon name="search" color="primary" />
              </template>
            </q-input>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-md text-grey-8">
              <q-icon name="warning" size="2em" class="q-mr-sm" />
              <span>
                {{
                  reporteGenerado
                    ? 'No se encontraron registros.'
                    : 'Generando reporte...'
                }}
              </span>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- PDF Modal -->
    <q-dialog v-model="mostrarModal" full-width full-height transition-show="slide-up" transition-hide="slide-down">
      <q-card class="column full-height">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>Vista Previa del Reporte</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        
        <q-card-section class="col q-pa-none">
          <iframe
            v-if="pdfData"
            :src="pdfData"
            class="full-width full-height"
            style="border: none"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { cambiarFormatoFecha, obtenerFechaActualDato } from 'src/composables/FuncionesG.js'
import { validarUsuario } from 'src/composables/FuncionesG.js'
import { PDF_REPORTE_PRECIO_BASE } from 'src/utils/pdfReportGenerator'
import { decimas, redondear } from 'src/composables/FuncionesG.js'
import { useCurrencyStore } from 'src/stores/currencyStore'

const currencyStore = useCurrencyStore()
const $q = useQuasar()

// --- UI State ---
const filter = ref('') // Added for table search functionality
const loading = ref(false) // Re-using existing loading ref if present, or defining it. (Original code wrapped loading in functions but didn't expose 'loading' ref properly to template top-level, checking original code...) 
// Checking original code: 'loading' was NOT defined in top level, it was used inside functions like $q.loading.show().
// We need to define a local loading ref for the table to use:
const tableLoading = ref(false) 

//pdf
const pdfData = ref(null)
const mostrarModal = ref(false)

// --- Estados Reactivos ---
const fechaInicio = ref(obtenerFechaActualDato())
const fechaFin = ref(obtenerFechaActualDato())
const almacenSeleccionado = ref({ label: 'Todos los almacenes', value: '0' }) // "0" para "Todos los almacenes"
const opcionesAlmacenes = ref([])
const datosOriginales = ref([])
const datosFiltrados = ref([])
const datosUsuario = reactive({})
const reporteGenerado = ref(false)

// --- Propiedades Calculadas ---
const almacenSeleccionadoTexto = computed(() => {
  const selected = opcionesAlmacenes.value.find((op) => op.value === almacenSeleccionado.value)
  return selected ? selected.label : 'Todos los almacenes'
})

const columnasTabla = [
  { name: 'n', label: 'N°', field: 'n', align: 'center', sortable: true },

  {
    name: 'fecha',
    label: 'Fecha',
    field: 'fecha',
    align: 'left',
    sortable: true
  },

  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'producto', label: 'Producto', field: 'producto', align: 'left', sortable: true, style: 'max-width: 200px; white-space: normal;' },
  {
    name: 'categoria',
    label: 'Categoría',
    field: 'categoria',
    align: 'left',
    sortable: true
  },
  {
    name: 'caracteristica',
    label: 'Característica',
    field: 'caracteristica',
    align: 'left',
    sortable: true
  },
  {
    name: 'medida',
    label: 'Medida',
    field: 'medida',
    align: 'left',
    sortable: true
  },
  {
    name: 'descripcion',
    label: 'Descripción',
    field: 'descripcion',
    align: 'left',
    style: 'max-width: 250px; white-space: normal;'
  },
  {
    name: 'unidad',
    label: 'Unidad',
    field: 'unidad',
    align: 'left',
    sortable: true
  },
  {
    name: 'preciobase',
    label: 'Precio Base',
    field: 'preciobase',
    align: 'right',
    sortable: true,
    format: (val) => (isNaN(val) ? '0.00' : Number(val).toFixed(2) + ' ' + currencyStore.simbolo),
  },
]

// --- Watchers ---
watch(almacenSeleccionado, (newVal) => {
  filtrarYOrdenarDatos(newVal)
})

// --- Funciones ---

/**
 * Carga la lista de almacenes disponibles para el usuario.
 */
async function cargarListaAlmacenes() {
  try {
    const contenidousuario = validarUsuario()
    Object.assign(datosUsuario, contenidousuario[0]) // Asigna los datos del usuario al objeto reactivo
    const idempresa = datosUsuario.empresa?.idempresa
    const idusuario = datosUsuario.idusuario
    const endpoint = `listaResponsableAlmacenReportes/${idempresa}`

    const response = await api.get(endpoint)
    const resultado = response.data
    if (resultado && resultado[0] === 'error') {
      console.error('Error al cargar almacenes:', resultado.error)
      $q.notify({
        type: 'negative',
        message: 'Error al cargar almacenes.',
        position: 'top',
      })
    } else {
      opcionesAlmacenes.value = []
      opcionesAlmacenes.value.push({ label: 'Todos los almacenes', value: '0' })
      const use = resultado.filter((u) => u.idusuario == idusuario)
      use.forEach((key) => {
        opcionesAlmacenes.value.push({
          label: key.almacen,
          value: key.idalmacen,
          dataValue: key.sucursales[0].codigosin,
        })
      })
    }
  } catch (error) {
    console.error('Error en cargarListaAlmacenes:', error)
    $q.notify({
      type: 'negative',
      message: 'Ocurrió un error al cargar los almacenes.',
      position: 'top',
    })
  }
}

/**
 * Genera el reporte de ventas de campaña.
 */
async function generarReporte() {
  // Using tableLoading for UI feedback
  tableLoading.value = true
  
  // Kept original checks
  if (!fechaInicio.value || !fechaFin.value) {
     tableLoading.value = false
    $q.notify({
      type: 'info',
      message: 'Por favor, seleccione ambas fechas para generar el reporte.',
      position: 'top',
    })
    return
  }
  
  // Kept original global loading just in case, or removed if we prefer granular. 
  // User asked "no logica", but adding UI loading state is "UI logic". 
  // I will keep the $q.loading.show from original to be safe regarding "no logic changes", 
  // but also update tableLoading for the table spinner.
  $q.loading.show({
    message: 'Generando reporte...',
  })

  try {
    const idusuario = datosUsuario.idusuario
    const point = `reportepreciobase/${idusuario}`
    const response = await api.get(point)
    const data = response.data.map((item, index) => ({
      n: index + 1,
      fecha: cambiarFormatoFecha(item.fecha),
      codigo: item.codigo,
      producto: item.producto,
      categoria: item.categoria,
      caracteristica: item.caracteristica,
      medida: item.medida,
      descripcion: item.descripcion,
      unidad: item.unidad,
      preciobase: decimas(redondear(parseFloat(item.preciobase))),
      ...item,
    }))

    if (response.status === 200) {
      datosOriginales.value = data
      datosFiltrados.value = data // Inicialmente, los datos filtrados son todos los originales
      reporteGenerado.value = true
      almacenSeleccionado.value = '0' // Reinicia el filtro de almacén
      $q.notify({
        type: 'positive',
        message: 'Reporte generado con éxito.',
        position: 'top',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Error al generar el reporte: ' + (data.error || 'Mensaje desconocido'),
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Error en generarReporte:', error)
    $q.notify({
      type: 'negative',
      message: 'Ocurrió un error al generar el reporte.',
      position: 'top',
    })
  } finally {
    $q.loading.hide()
    tableLoading.value = false
  }
}

/**
 * Filtra los datos del reporte según el almacén seleccionado.
 * @param {string} dato - El ID del almacén o "0" para todos.
 */
function filtrarYOrdenarDatos(dato) {
  if (dato === '0') {
    datosFiltrados.value = [...datosOriginales.value]
  } else {
    datosFiltrados.value = datosOriginales.value.filter((u) => String(u.idalmacen) === String(dato))
  }
}

/**
 * Maneja el clic en el botón "Generar reporte".
 */
async function handleGenerarReporte() {
  await generarReporte()
  if (reporteGenerado.value) {
    await cargarListaAlmacenes() // Recarga los almacenes después de generar el reporte
  }
}

/**
 * Descarga el PDF del reporte.
 */
function descargarPDF() {
  const datosFormulario = {
    fechaInicio: fechaInicio.value,
    fechaFin: fechaFin.value,
    almacen: almacenSeleccionadoTexto.value,
    usuario: datosUsuario,
  }
  const doc = PDF_REPORTE_PRECIO_BASE(datosFiltrados.value, datosFormulario)
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}

// --- Ciclo de Vida ---
onMounted(async () => {
  // Carga inicial de datos de usuario para asegurar que datosUsuario está poblado
  const contenidousuario = validarUsuario()
  if (contenidousuario && contenidousuario.length > 0) {
    Object.assign(datosUsuario, contenidousuario[0])
  }
  handleGenerarReporte()
  // No cargar almacenes aquí, se cargarán después de generar el reporte
})
</script>

<style lang="scss" scoped>

</style>

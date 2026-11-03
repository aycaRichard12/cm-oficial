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
          {{ $t('ui.reporte-de-costo-unitario-81b62b') }}
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
              :label="$t('ui.filtrar-por-almacen-f5828a')"
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
              :label="$t('ui.vista-previa-pdf-9db3ed')"
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
          :no-data-label="$t('ui.no-hay-datos-disponibles-baee26')"
          loading-label="Cargando datos..."
          :rows-per-page-label="$t('ui.filas-por-pagina-d8aabf')"
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
              :placeholder="$t('common.search')"
              bg-color="grey-1"
              color="primary"
            >
              <template v-slot:append>
                <q-icon name="search" color="primary" />
              </template>
            </q-input>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-md cm-text-muted">
              <q-icon name="warning" size="2em" class="q-mr-sm" />
              <span>
                {{
                  reporteGenerado
                    ? $t('ui.no-se-encontraron-registros-ffacf0')
                    : $t('ui.generando-reporte-f36ceb')
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
          <q-toolbar-title>{{ $t('ui.vista-previa-del-reporte-1bfbe4') }}</q-toolbar-title>
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
import { t as i18nT } from 'src/i18n/runtime'
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
const almacenSeleccionado = ref({ label: i18nT('ui.todos-los-almacenes-949f2c'), value: '0' }) // "0" para "Todos los almacenes"
const opcionesAlmacenes = ref([])
const datosOriginales = ref([])
const datosFiltrados = ref([])
const datosUsuario = reactive({})
const reporteGenerado = ref(false)

// --- Propiedades Calculadas ---
const almacenSeleccionadoTexto = computed(() => {
  const selected = opcionesAlmacenes.value.find((op) => op.value === almacenSeleccionado.value)
  return selected ? selected.label : i18nT('ui.todos-los-almacenes-949f2c')
})

const columnasTabla = [
  { name: 'n', label: i18nT('cotizacion.table.number'), field: 'n', align: 'center', sortable: true },

  {
    name: 'fecha',
    label: i18nT('cotizacion.table.date'),
    field: 'fecha',
    align: 'left',
    sortable: true
  },

  { name: 'codigo', label: i18nT('ui.codigo-c35510'), field: 'codigo', align: 'left', sortable: true },
  { name: 'producto', label: i18nT('inventario.product'), field: 'producto', align: 'left', sortable: true, style: 'max-width: 200px; white-space: normal;' },
  {
    name: 'categoria',
    label: i18nT('configProducto.categoriaProducto.types.categoria'),
    field: 'categoria',
    align: 'left',
    sortable: true
  },
  {
    name: 'caracteristica',
    label: i18nT('configProducto.caracteristicaProducto.table.nombre'),
    field: 'caracteristica',
    align: 'left',
    sortable: true
  },
  {
    name: 'medida',
    label: i18nT('ui.medida-dea00a'),
    field: 'medida',
    align: 'left',
    sortable: true
  },
  {
    name: 'descripcion',
    label: i18nT('configuracion.servicios.table.descripcion'),
    field: 'descripcion',
    align: 'left',
    style: 'max-width: 250px; white-space: normal;'
  },
  {
    name: 'unidad',
    label: i18nT('configProducto.unidadProducto.table.nombre'),
    field: 'unidad',
    align: 'left',
    sortable: true
  },
  {
    name: 'preciobase',
    label: i18nT('ui.precio-base-427900'),
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
        message: i18nT('ui.error-al-cargar-almacenes-420531'),
        position: 'top',
      })
    } else {
      opcionesAlmacenes.value = []
      opcionesAlmacenes.value.push({ label: i18nT('ui.todos-los-almacenes-949f2c'), value: '0' })
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
      message: i18nT('ui.ocurrio-un-error-al-cargar-los-almacenes-06e9b8'),
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
      message: i18nT('ui.por-favor-seleccione-ambas-fechas-para-generar-el-re-04ec5a'),
      position: 'top',
    })
    return
  }
  
  // Kept original global loading just in case, or removed if we prefer granular. 
  // User asked "no logica", but adding UI loading state is "UI logic". 
  // I will keep the $q.loading.show from original to be safe regarding "no logic changes", 
  // but also update tableLoading for the table spinner.
  $q.loading.show({
    message: i18nT('ui.generando-reporte-f36ceb'),
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
        message: i18nT('ui.reporte-generado-con-exito-13e8ba'),
        position: 'top',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: i18nT('ui.error-al-generar-el-reporte-596b95') + (data.error || i18nT('ui.mensaje-desconocido-c37e4e')),
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Error en generarReporte:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.ocurrio-un-error-al-generar-el-reporte-eddf13'),
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

<template>
  <q-page padding >
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <q-icon name="campaign" size="lg" color="primary" class="q-mr-sm" />
      <div class="text-h5 text-primary text-weight-bold">Reporte de Campañas</div>
    </div>

    <!-- Filtros y Opciones -->
    <q-card class="q-mb-lg shadow-2 rounded-borders">
      <q-card-section class="bg-primary text-white row items-center q-pb-sm">
        <q-icon name="tune" size="sm" class="q-mr-sm" />
        <div class="text-subtitle1 text-weight-bold">Configuración del Reporte</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="handleGenerarReporte">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input
                v-model="fechaInicio"
                id="fechaIni"
                type="date"
                label="Fecha Inicial *"
                outlined
                dense
                color="primary"
                @update:model-value="validarFechas"
              >
                <template v-slot:prepend>
                  <q-icon name="event" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="fechaFin"
                id="fechafin"
                type="date"
                label="Fecha Final *"
                outlined
                dense
                color="primary"
                @update:model-value="validarFechas"
              >
                <template v-slot:prepend>
                  <q-icon name="event" />
                </template>
              </q-input>
            </div>
          </div>
          <div class="row justify-end q-pt-md q-gutter-sm">
            <q-btn
              label="Generar Reporte"
              icon="search"
              color="primary"
              unelevated
              @click="handleGenerarReporte"
              :loading="cargandoData"
            />
            <q-btn
              label="Exportar PDF"
              icon="picture_as_pdf"
              color="negative"
              unelevated
              @click="descargarPDF"
              :disable="!reporteGenerado || cargandoData"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Resultados -->
    <q-card v-if="reporteGenerado" class="shadow-2 rounded-borders">
      <q-card-section class="q-pb-none">
        <div class="row items-center justify-between">
          <div class="text-h6 text-primary text-weight-bold row items-center q-mb-sm">
            <q-icon name="list_alt" size="sm" class="q-mr-sm" /> Resultados
          </div>
          <!-- Filtro de almacén integrado en la cabecera -->
          <div style="min-width: 250px" class="q-mb-sm">
            <q-select
              v-model="almacenSeleccionado"
              :options="opcionesAlmacenes"
              label="Filtrar por Almacén"
              emit-value
              map-options
              outlined
              dense
              color="primary"
            >
              <template v-slot:prepend>
                <q-icon name="storefront" />
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="datosFiltrados"
          :columns="columnasTabla"
          row-key="id"
          flat
          bordered
          separator="cell"
          table-header-class="bg-blue-grey-1 text-primary text-weight-bold"
          :pagination="{ rowsPerPage: 15 }"
        >
          <template v-slot:no-data>
            <div class="full-width row flex-center q-gutter-sm q-pa-xl text-grey-7">
              <q-icon name="search_off" size="xl" />
              <div class="text-h6">No hay datos para mostrar.</div>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Modal PDF -->
    <q-dialog v-model="mostrarModal" full-width full-height maximized>
      <q-card class="column">
        <q-card-section class="row items-center q-pb-none bg-primary text-white">
          <div class="text-h6">Vista previa de PDF</div>
          <q-space />
          <q-btn flat round dense icon="close" @click="mostrarModal = false" />
        </q-card-section>
        <q-card-section class="col q-pa-none">
          <iframe
            v-if="pdfData"
            :src="pdfData"
            style="width: 100%; height: 100%; border: none"
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
import { PDF_REPORTE_CAMPANAS } from 'src/utils/pdfReportGenerator'
const $q = useQuasar()

//pdf
const pdfData = ref(null)
const mostrarModal = ref(false)

// --- Estados Reactivos ---
const fechaInicio = ref(obtenerFechaActualDato())
const fechaFin = ref(obtenerFechaActualDato())
const almacenSeleccionado = ref('0') // "0" para "Todos los almacenes"
const opcionesAlmacenes = ref([])
const datosOriginales = ref([])
const datosFiltrados = ref([])
const datosUsuario = reactive({})
const reporteGenerado = ref(false)
const cargandoData = ref(false)

// --- Propiedades Calculadas ---
const almacenSeleccionadoTexto = computed(() => {
  const selected = opcionesAlmacenes.value.find((op) => op.value === almacenSeleccionado.value)
  return selected ? selected.label : 'Todos los almacenes'
})

const columnasTabla = [
  { name: 'n', label: 'N°', field: 'n', align: 'left' },
  { name: 'almacen', label: 'Almacén', field: 'almacen', align: 'left' },
  { name: 'nombre', label: 'Campaña', field: 'nombre', align: 'left' },
  { name: 'porcentaje', label: 'Porcentaje', field: 'porcentaje', align: 'left' },
  {
    name: 'fechainicio',
    label: 'Fecha Inicio',
    field: 'fechainicio',
    align: 'left',
    format: (val) => cambiarFormatoFecha(val),
  },
  {
    name: 'fechafinal',
    label: 'Fecha Final',
    field: 'fechafinal',
    align: 'left',
    format: (val) => cambiarFormatoFecha(val),
  },
  { name: 'est', label: 'Estado', field: 'est', align: 'left' },
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
    console.log(response)
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
 * Valida que la fecha de inicio no sea mayor que la fecha final.
 */
function validarFechas() {
  const inicio = new Date(fechaInicio.value)
  const fin = new Date(fechaFin.value)

  if (inicio.getTime() > fin.getTime()) {
    $q.notify({
      type: 'info',
      message: 'La fecha de inicio no puede ser mayor que la fecha de fin.',
      position: 'top',
    })
    // Se podría resetear la fecha o ajustar para corregir el error
    // fechaInicio.value = obtenerFechaActual(); // Ejemplo de reseteo
  }
}

/**
 * Genera el reporte de ventas de campaña.
 */
async function generarReporte() {
  if (!fechaInicio.value || !fechaFin.value) {
    $q.notify({
      type: 'info',
      message: 'Por favor, seleccione ambas fechas para generar el reporte.',
      position: 'top',
    })
    return
  }

  $q.loading.show({
    message: 'Generando reporte...',
  })
  cargandoData.value = true

  try {
    const idusuario = datosUsuario.idusuario
    const point = `reportecampaña/${idusuario}/${fechaInicio.value}/${fechaFin.value}`
    const response = await api.get(point)
    console.log(response.status)
    const data = response.data.map((item, index) => ({
      ...item,
      n: index + 1,
      est: item.est === 1 ? 'Activa' : 'Inactiva',
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
    cargandoData.value = false
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
  console.log(datosFormulario)
  const doc = PDF_REPORTE_CAMPANAS(datosFiltrados.value, datosFormulario)
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
  // No cargar almacenes aquí, se cargarán después de generar el reporte
})
</script>

<style lang="scss" scoped>
</style>

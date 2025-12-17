<template>
  <q-page padding>
    <div class="titulo">Reporte Campañas Ventas</div>
    <q-form @submit.prevent="handleGenerarReporte">
      <div class="row justify-center q-col-gutter-x-md">
        <div class="col-12 col-md-4">
          <label for="fechaIni">Fecha Inicial*</label>
          <q-input
            v-model="fechaInicio"
            id="fechaIni"
            type="date"
            outlined
            dense
            @update:model-value="validarFechas"
          />
        </div>
        <div class="col-12 col-md-4">
          <label for="fechafin">Fecha Final*</label>
          <q-input
            v-model="fechaFin"
            id="fechafin"
            type="date"
            outlined
            dense
            @update:model-value="validarFechas"
          />
        </div>
      </div>
      <div class="row justify-center q-pt-md">
        <q-btn
          label="Generar reporte"
          color="primary"
          @click="handleGenerarReporte"
          class="q-mx-sm"
        />
        <q-btn
          label="Vista previa del Reporte"
          color="primary"
          @click="handleVerReporte"
          class="q-mx-sm"
        />
      </div>
    </q-form>

    <div class="q-mt-lg">
      <q-form>
        <div class="row justify-center q-col-gutter-x-md">
          <div class="col-12 col-md-4">
            <label for="almacen">Almacén*</label>
            <q-select
              v-model="almacenSeleccionado"
              :options="opcionesAlmacenes"
              id="almacen"
              emit-value
              map-options
              class="col-md-4"
              outlined
              dense
              :disable="!reporteGenerado"
            />
          </div>
        </div>
      </q-form>
      <q-table
        :rows="datosFiltrados"
        :columns="columnasTabla"
        row-key="id"
        flat
        bordered
        separator="cell"
        class="q-mt-md"
      >
        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm">
            <span> No hay datos para mostrar. Genere un reporte primero. </span>
          </div>
        </template>
      </q-table>
    </div>
    <q-card-section>
      <q-dialog v-model="mostrarModal" persistent full-width full-height>
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
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { cambiarFormatoFecha, obtenerFechaActualDato } from 'src/composables/FuncionesG.js'
import { validarUsuario } from 'src/composables/FuncionesG.js'
import { PDF_REPORTE_CAMPANAS_VENTAS } from 'src/utils/pdfReportGenerator'

//pedf
const pdfData = ref(null)
const mostrarModal = ref(false)

const $q = useQuasar()

// --- Estados Reactivos ---
const fechaInicio = ref(obtenerFechaActualDato())
const fechaFin = ref(obtenerFechaActualDato())
const almacenSeleccionado = ref('0') // "0" para "Todos los almacenes"
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
  { name: 'n', label: 'N°', field: 'n', align: 'left', format: (val, row, index) => index + 1 },
  { name: 'almacen', label: 'Almacén', field: 'almacen', align: 'left' },
  { name: 'nombre', label: 'Campaña', field: 'nombre', align: 'left' },
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
  { name: 'nventas', label: 'Cantidad de Ventas', field: 'nventas', align: 'left' },
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

  try {
    const idusuario = datosUsuario.idusuario
    const point = `reporteventacampaña/${idusuario}/${fechaInicio.value}/${fechaFin.value}`
    const response = await api.get(point)
    console.log(response.status)
    const data = response.data.map((item, index) => ({
      ...item,
      n: index + 1,
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
 * Maneja el clic en el botón "Vista previa del Reporte".
 */
function handleVerReporte() {
  if (!datosFiltrados.value || datosFiltrados.value.length === 0) {
    $q.notify({
      type: 'info',
      message: 'No se ha generado ningún reporte o el reporte está vacío.',
      position: 'top',
    })
  } else {
    const doc = PDF_REPORTE_CAMPANAS_VENTAS(datosFiltrados.value, {
      fechaInicio: fechaInicio.value,
      fechaFin: fechaFin.value,
      almacen: almacenSeleccionadoTexto.value,
      usuario: validarUsuario()[0],
    })
    console.log(doc)
    pdfData.value = doc.output('dataurlstring')
    mostrarModal.value = true
  }
}

/**
 * Descarga el PDF del reporte.
 */

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
// Estilos para el PDF, adaptados de tu HTML original
.invoice-container {
  padding: 20px;
  background-color: #fff;
  border: 1px solid #ccc;
  min-height: 297mm; /* A4 height for better PDF rendering */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  .invoice-content {
    min-width: 600px;
    font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
    font-size: 12px;
    line-height: 1.6em;
    color: #555;
  }

  header {
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;

    .company-details {
      text-align: left;
    }

    .col {
      padding: 0 10px;
      vertical-align: top;
    }

    img {
      max-width: 100%;
      height: auto;
    }
  }

  main {
    .contacts {
      margin-bottom: 20px;

      .invoice-to,
      .invoice-details {
        vertical-align: top;
      }
    }

    .q-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;

      thead th {
        background-color: #e0f2f1; // Quasar teal light
        color: #004d40; // Quasar teal dark
        font-weight: bold;
        padding: 8px;
        text-align: left;
        border: 1px solid #ccc;
      }

      tbody td {
        padding: 8px;
        border: 1px solid #eee;
      }
    }
  }
}
</style>

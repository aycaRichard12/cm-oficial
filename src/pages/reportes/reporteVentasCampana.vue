<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <q-icon name="point_of_sale" size="lg" color="primary" class="q-mr-sm" />
      <div class="text-h5 text-primary text-weight-bold">Reporte de Ventas por Campaña</div>
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
            <!-- Fecha Inicial -->
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

            <!-- Fecha Final -->
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
              @click="handleVerReporte"
              :disable="!reporteGenerado || cargandoData"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Resultados -->
    <q-card v-if="reporteGenerado" class="shadow-2 rounded-borders">
      <q-card-section class="q-pb-none">
        <div class="row items-center justify-between q-col-gutter-sm">
          <div class="col-12 col-sm-auto text-h6 text-primary text-weight-bold row items-center q-mb-sm">
            <q-icon name="list_alt" size="sm" class="q-mr-sm" /> Resultados
          </div>
          <!-- Filtros de búsqueda (Almacén y Texto) -->
          <div class="col-12 col-sm-auto row q-gutter-sm justify-end">
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
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="storefront" />
                </template>
              </q-select>
            </div>
            
            <div style="min-width: 250px" class="q-mb-sm">
              <q-input
                v-model="busqueda"
                label="Buscar en Resultados..."
                outlined
                dense
                color="primary"
                debounce="300"
                clearable
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <BaseFilterableTable
          ref="tableRef"
          title="Resumen de Ventas por Campaña"
          :rows="datosFiltrados"
          :columns="columnasTabla"
          :arrayHeaders="['n', 'almacen', 'nombre', 'fechainicio', 'fechafinal', 'nventas']"
          :sumColumns="['nventas']"
          rowKey="id"
          :search="busqueda"
          nombreColumnaTotales="fechafinal"
        />
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
import { PDF_REPORTE_CAMPANAS_RESUMEN_VENTAS } from 'src/utils/pdfReportGenerator'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'

//pedf
const pdfData = ref(null)
const mostrarModal = ref(false)

const $q = useQuasar()
const tableRef = ref(null)

// --- Estados Reactivos ---
const fechaInicio = ref(obtenerFechaActualDato())
const fechaFin = ref(obtenerFechaActualDato())
const almacenSeleccionado = ref('0') // "0" para "Todos los almacenes"
const busqueda = ref('') // Nuevo estado para búsqueda de texto
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
  { name: 'nventas', label: 'Cantidad de Ventas', field: 'nventas', align: 'center' },
]

// --- Watchers ---
watch([almacenSeleccionado, busqueda], () => {
  filtrarYOrdenarDatos()
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
    cargandoData.value = false
  }
}

/**
 * Filtra los datos del reporte combinando almacén seleccionado y el texto de búsqueda.
 */
function filtrarYOrdenarDatos() {
  let resultado = [...datosOriginales.value]

  // 1. Filtrar por almacén
  if (almacenSeleccionado.value && almacenSeleccionado.value !== '0') {
    resultado = resultado.filter((u) => String(u.idalmacen) === String(almacenSeleccionado.value))
  }

  // 2. Filtrar por búsqueda de texto
  if (busqueda.value && busqueda.value.trim() !== '') {
    const term = busqueda.value.toLowerCase().trim()
    resultado = resultado.filter((u) => {
      return (
        (u.almacen && u.almacen.toLowerCase().includes(term)) ||
        (u.nombre && u.nombre.toLowerCase().includes(term)) ||
        (u.nventas && String(u.nventas).toLowerCase().includes(term))
      )
    })
  }

  datosFiltrados.value = resultado
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
  const datosFinales = tableRef.value ? tableRef.value.obtenerDatosFiltrados() : datosFiltrados.value
  if (!datosFinales || datosFinales.length === 0) {
    $q.notify({
      type: 'info',
      message: 'No se ha generado ningún reporte o el reporte está vacío.',
      position: 'top',
    })
  } else {
    const doc = PDF_REPORTE_CAMPANAS_RESUMEN_VENTAS(datosFinales, {
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

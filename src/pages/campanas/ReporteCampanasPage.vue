<template>
  <q-page padding id="reporteCampanasGeneral">
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <q-icon name="campaign" size="lg" color="primary" class="q-mr-sm" />
      <div class="text-h5 text-primary text-weight-bold">{{ $t('ui.reporte-de-campanas-9eb026') }}</div>
    </div>

    <!-- Filtros y Opciones -->
    <q-card class="q-mb-lg shadow-2 rounded-borders">
      <q-card-section class="bg-primary text-white row items-center q-pb-sm">
        <q-icon name="tune" size="sm" class="q-mr-sm" />
        <div class="text-subtitle1 text-weight-bold">{{ $t('ui.configuracion-del-reporte-f9eac1') }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="handleGenerarReporte">
          <div id="filtroFechas" class="row q-col-gutter-md">
            <div class="col-12 col-md-4" id="filtroFechaIni">
              <q-input
                v-model="fechaInicio"
                id="fechaIni"
                type="date"
                :label="$t('ui.fecha-inicial-4e1b5c')"
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
            <div class="col-12 col-md-4" id="filtroFechaFin">
              <q-input
                v-model="fechaFin"
                id="fechafin"
                type="date"
                :label="$t('ui.fecha-final-c5ac08')"
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
              id="btnGenerar"
              :label="$t('reportes.generate')"
              
              color="primary"
              unelevated
              @click="handleGenerarReporte"
              :loading="cargandoData"
            />
            <q-btn
              id="btnExportar"
              :label="$t('reportes.exportPdf')"
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
        <div class="row items-center justify-between q-col-gutter-sm">
          
          <div class="col-12 col-sm-auto text-h6 text-primary text-weight-bold row items-center q-mb-sm">
            <q-icon name="list_alt" size="sm" class="q-mr-sm" /> {{ $t('ui.resultados-b164a1') }}
          </div>
          
          <!-- Filtros de búsqueda (Almacén y Texto) -->
          <div class="col-12 col-sm-auto row q-gutter-sm justify-end">
            <div id="filtroAlmacen" style="min-width: 250px" class="q-mb-sm">
              <q-select
                v-model="almacenSeleccionado"
                :options="opcionesAlmacenes"
                :label="$t('ui.filtrar-por-almacen-f5828a')"
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
            
            <div id="filtroBusqueda" style="min-width: 250px" class="q-mb-sm">
              <q-input
                v-model="busqueda"
                :label="$t('ui.buscar-en-resultados-3912df')"
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
        id="tableReporteCampanas"
          ref="tableRef"
          :title="$t('ui.listado-de-campanas-1fb7cc')"
          :rows="datosFiltrados"
          :columns="columnasTabla"
          :arrayHeaders="['n', 'almacen', 'nombre', 'porcentaje', 'fechainicio', 'fechafinal', 'est']"
          rowKey="id"
          :search="busqueda"
        />
      </q-card-section>
    </q-card>

    <!-- Modal PDF -->
    <q-dialog v-model="mostrarModal" full-width full-height maximized>
      <q-card class="column">
        <q-card-section class="row items-center q-pb-none bg-primary text-white">
          <div class="text-h6">{{ $t('ui.vista-previa-de-pdf-978f4e') }}</div>
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
import { t as i18nT } from 'src/i18n/runtime'
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { cambiarFormatoFecha, obtenerFechaActualDato } from 'src/composables/FuncionesG.js'
import { validarUsuario } from 'src/composables/FuncionesG.js'
import { PDF_REPORTE_CAMPANAS } from 'src/utils/pdfReportGenerator'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
const $q = useQuasar()

//pdf
const pdfData = ref(null)
const mostrarModal = ref(false)
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
  return selected ? selected.label : i18nT('ui.todos-los-almacenes-949f2c')
})

const columnasTabla = [
  { name: 'n', label: i18nT('cotizacion.table.number'), field: 'n', align: 'left' },
  { name: 'almacen', label: i18nT('inventario.warehouse'), field: 'almacen', align: 'left' },
  { name: 'nombre', label: i18nT('ui.campana-236ee5'), field: 'nombre', align: 'left' },
  { name: 'porcentaje', label: i18nT('ui.porcentaje-47bcdf'), field: 'porcentaje', align: 'left' },
  {
    name: 'fechainicio',
    label: i18nT('ui.fecha-inicio-cecd90'),
    field: 'fechainicio',
    align: 'left',
    format: (val) => cambiarFormatoFecha(val),
  },
  {
    name: 'fechafinal',
    label: i18nT('ui.fecha-final-fcea71'),
    field: 'fechafinal',
    align: 'left',
    format: (val) => cambiarFormatoFecha(val),
  },
  { name: 'est', label: i18nT('cotizacion.table.status'), field: 'est', align: 'left' },
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
 * Valida que la fecha de inicio no sea mayor que la fecha final.
 */
function validarFechas() {
  const inicio = new Date(fechaInicio.value)
  const fin = new Date(fechaFin.value)

  if (inicio.getTime() > fin.getTime()) {
    $q.notify({
      type: 'info',
      message: i18nT('ui.la-fecha-de-inicio-no-puede-ser-mayor-que-la-fecha-d-48706f'),
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
      message: i18nT('ui.por-favor-seleccione-ambas-fechas-para-generar-el-re-04ec5a'),
      position: 'top',
    })
    return
  }

  $q.loading.show({
    message: i18nT('ui.generando-reporte-f36ceb'),
  })
  cargandoData.value = true

  try {
    const idusuario = datosUsuario.idusuario
    const point = `reportecampaña/${idusuario}/${fechaInicio.value}/${fechaFin.value}`
    console.log('reporte',point)
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
        (u.porcentaje && String(u.porcentaje).toLowerCase().includes(term)) ||
        (u.est && u.est.toLowerCase().includes(term))
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
 * Descarga el PDF del reporte.
 */
function descargarPDF() {
  const datosFinales = tableRef.value ? tableRef.value.obtenerDatosFiltrados() : datosFiltrados.value
  const datosFormulario = {
    fechaInicio: fechaInicio.value,
    fechaFin: fechaFin.value,
    almacen: almacenSeleccionadoTexto.value,
    usuario: datosUsuario,
  }
  console.log(datosFormulario)
  const doc = PDF_REPORTE_CAMPANAS(datosFinales, datosFormulario)
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

<template>
  <q-page padding>
    <div class="col-12 q-mb-md">
      <div class="row items-center">
        <!-- Botón Volver -->
        <q-btn
          color="secondary"
          class="btn-res"
          id="btnregistrarcompra"
          to="/categoriasdeprecio"
          icon="arrow_back"
          :label="$t('ui.volver-84a715')"
          no-caps
        />

        <!-- Título -->
        <div class="titulo q-ma-md">{{ $t('ui.reporte-de-precios-base-3a8ded') }}</div>
      </div>
    </div>

    <q-form @submit.prevent="handleGenerarReporte">
      <div class="row justify-center q-pt-md">
        <!-- <q-btn
          label="Generar reporte"
          color="primary"
          @click="handleGenerarReporte"
          class="q-mx-sm"
        /> -->
        <q-btn
          :label="$t('ui.vista-previa-del-reporte-60d956')"
          color="primary"
          @click="descargarPDF"
          class="q-mx-sm"
        />
      </div>
    </q-form>

    <div class="q-mt-lg">
      <q-form>
        <div class="row justify-center q-col-gutter-x-md">
          <div class="col-12 col-md-4">
            <label for="almacen">{{ $t('ui.almacen-3e3724') }}</label>
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
            <span> {{ $t('ui.no-hay-datos-para-mostrar-genere-un-reporte-primero-358c32') }} </span>
          </div>
        </template>
      </q-table>
    </div>

    <q-card-section>
      <q-dialog v-model="mostrarModal" full-width full-height>
        <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">{{ $t('ui.vista-previa-de-pdf-978f4e') }}</div>
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
import { t as i18nT } from 'src/i18n/runtime'
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { obtenerFechaActualDato } from 'src/composables/FuncionesG.js'
import { validarUsuario } from 'src/composables/FuncionesG.js'
import { PDF_REPORTE_CATEGORIA_PRECIO } from 'src/utils/pdfReportGenerator'
const $q = useQuasar()
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
const autorization = { 1: 'activo', 2: 'inactivo' }

// --- Propiedades Calculadas ---
const almacenSeleccionadoTexto = computed(() => {
  const selected = opcionesAlmacenes.value.find((op) => op.value === almacenSeleccionado.value)
  return selected ? selected.label : i18nT('ui.todos-los-almacenes-949f2c')
})

const columnasTabla = [
  { name: 'n', label: i18nT('cotizacion.table.number'), field: 'n', align: 'center' },
  { name: 'nombre', label: i18nT('ui.categoria-5966b0'), field: 'nombre', align: 'left' },
  { name: 'porcentaje', label: i18nT('ui.porcentaje-47bcdf'), field: 'porcentaje', align: 'left' },
  {
    name: 'almacen',
    label: i18nT('inventario.warehouse'),
    field: 'almacen',
    align: 'left',
  },
  {
    name: 'estado',
    label: i18nT('cotizacion.table.status'),
    field: 'estado',
    align: 'left',
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

  try {
    const idusuario = datosUsuario.idusuario
    const point = `reportecategoriaprecio/${idusuario}`
    const response = await api.get(point)
    console.log(response.status)
    const data = response.data.map((item, index) => ({
      n: index + 1,
      nombre: item.nombre,
      porcentaje: item.porcentaje,
      almacen: item.almacen,
      estado: autorization[Number(item.estado)],
      idalmacen: item.idalmacen,
    }))
    console.log(data)

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
  }
}

/**
 * Filtra los datos del reporte según el almacén seleccionado.
 * @param {string} dato - El ID del almacén o "0" para todos.
 */
function filtrarYOrdenarDatos(dato) {
  console.log(dato)
  if (dato === '0') {
    datosFiltrados.value = [...datosOriginales.value]
  } else {
    console.log(datosFiltrados.value)
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
  const doc = PDF_REPORTE_CATEGORIA_PRECIO(datosFiltrados.value, datosFormulario)
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
// Estilos para el PDF, adaptados de tu HTML original
.invoice-container {
  padding: 20px;
  background-color: var(--cm-surface);
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
        color: var(--cm-brand); // Quasar teal dark
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

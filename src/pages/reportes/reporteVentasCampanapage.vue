<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <q-icon name="point_of_sale" size="lg" color="primary" class="q-mr-sm" />
      <div class="text-h5 text-primary text-weight-bold">Ventas Registradas en Campaña</div>
    </div>

    <!-- Configuración del Reporte -->
    <q-card class="q-mb-lg shadow-2 rounded-borders">
      <q-card-section class="bg-primary text-white row items-center q-pb-sm">
        <q-icon name="tune" size="sm" class="q-mr-sm" />
        <div class="text-subtitle1 text-weight-bold">Configuración del Reporte</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="handleGenerarReporte">
          <div class="row q-col-gutter-md">
            <!-- Campaña -->
            <div class="col-12 col-md-4">
              <q-select
                v-model="campanaSeleccionada"
                :options="opcionesCampanas"
                label="Campaña *"
                emit-value
                map-options
                outlined
                dense
                clearable
                color="primary"
                @update:model-value="reporteGenerado = false"
              >
                <template v-slot:prepend>
                  <q-icon name="campaign" />
                </template>
              </q-select>
            </div>

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
              icon="search"
              color="primary"
              unelevated
              type="submit"
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

    <div v-if="reporteGenerado" class="q-mt-lg">
      <q-card class="shadow-2 rounded-borders q-mb-lg">
        <q-card-section class="q-pb-none">
          <div class="text-h6 text-primary text-weight-bold row items-center q-mb-sm">
            <q-icon name="list" size="sm" class="q-mr-sm" /> Detalle Completo de Ventas
          </div>
        </q-card-section>
        <q-card-section>
          <BaseFilterableTable
            title=""
            :rows="datosFiltrados"
            :columns="columnasTabla"
            row-key="rowKey"
            :arrayHeaders="arrayHeaders"
            :sumColumns="sumColumns"
            nombreColumnaTotales="codigo"
          />
        </q-card-section>
      </q-card>
    </div>

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
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { cambiarFormatoFecha, obtenerFechaActualDato } from 'src/composables/FuncionesG.js'
import { validarUsuario } from 'src/composables/FuncionesG.js'
import { PDF_REPORTE_CAMPANAS_VENTAS } from 'src/utils/pdfReportGenerator'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
const pdfData = ref(null)
const mostrarModal = ref(false)
const $q = useQuasar()

// --- Estados Reactivos ---
const fechaInicio = ref(obtenerFechaActualDato())
const fechaFin = ref(obtenerFechaActualDato())
const campanaSeleccionada = ref(null)
const opcionesCampanas = ref([])
const datosOriginales = ref([])
const datosFiltrados = ref([])
const datosUsuario = reactive({})
const reporteGenerado = ref(false)
const cargandoData = ref(false)

const campanaSeleccionadaTexto = computed(() => {
  const selected = opcionesCampanas.value.find((op) => op.value === campanaSeleccionada.value)
  return selected ? selected.label : ''
})



// --- Columnas de la tabla (coinciden con la respuesta real de la API) ---
const columnasTabla = [
  { name: 'n', label: 'N°', field: 'n', align: 'center', sortable: false, style: 'width: 50px', datatype: 'number'},
  {
    name: 'fecha',
    label: 'Fecha',
    field: 'fecha',
    align: 'left',
    format: (val) => cambiarFormatoFecha(val),
  },
  {
    name: 'nfactura',
    label: 'N° Factura',
    field: 'nfactura',
    align: 'center',
    
    format: (val) => (val === 0 ? '-' : val),
  },
  {
    name: 'almacen',
    label: 'Almacén',
    field: 'almacenNombre',
    align: 'left',
    
  },
  {
    name: 'producto',
    label: 'Producto',
    field: 'productoNombre',
    align: 'left',
    
  },
  { name: 'codigo', label: 'Código', field: 'productoCodigo', align: 'left' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right' },
  {
    name: 'precioOriginal',
    label: 'P. Original',
    field: 'precioOriginal',
    align: 'right',
    
    format: (val) => (Number(val) || 0).toFixed(2),
  },
  {
    name: 'precioCampana',
    label: 'P. Campaña',
    field: 'precioCampana',
    align: 'right',
    
    format: (val) => (Number(val) || 0).toFixed(2),
  },
  {
    name: 'subtotalOriginal',
    label: 'Subtot. Original',
    field: 'subtotalOriginal',
    align: 'right',
    
    format: (val) => (Number(val) || 0).toFixed(2),
  },
  {
    name: 'subtotalCampana',
    label: 'Subtot. Campaña',
    field: 'subtotalCampana',
    align: 'right',
    
    format: (val) => (Number(val) || 0).toFixed(2),
  },
  {
    name: 'descuento',
    label: 'Descuento',
    field: 'descuento',
    align: 'right',
    
    format: (val) => (Number(val) || 0).toFixed(2),
  },
]

const arrayHeaders = ['n', 'fecha', 'nfactura', 'almacen', 'producto', 'codigo', 'cantidad', 'precioOriginal' , 'precioCampana', 'subtotalOriginal', 'subtotalCampana', 'descuento']
const sumColumns = ['cantidad', 'precioOriginal', 'precioCampana', 'subtotalOriginal', 'subtotalCampana', 'descuento']
// --- Funciones ---

/**
 * Carga la lista de campañas disponibles para la empresa del usuario.
 */
async function cargarCampanas() {
  try {
    const contenidousuario = validarUsuario()
    Object.assign(datosUsuario, contenidousuario[0])
    const idempresa = datosUsuario.empresa?.idempresa
    if (!idempresa) return

    const response = await api.get(`campanas/${idempresa}`)
    const resultado = response.data

    if (!resultado || resultado[0] === 'error') {
      $q.notify({
        type: 'negative',
        message: 'Error al cargar la lista de campañas.',
        position: 'top',
      })
      return
    }

    opcionesCampanas.value = resultado.map((c) => ({
      label: `${c.nombre} (${c.porcentaje}%)`,
      value: c.id,
    }))
  } catch (error) {
    console.error('Error en cargarCampanas:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar campañas.', position: 'top' })
  }
}

/**
 * Valida que la fecha de inicio no sea mayor que la fecha final.
 */
function validarFechas() {
  const inicio = new Date(fechaInicio.value)
  const fin = new Date(fechaFin.value)
  if (inicio > fin) {
    $q.notify({
      type: 'info',
      message: 'La fecha de inicio no puede ser mayor que la fecha de fin.',
      position: 'top',
    })
  }
}

/**
 * Deduplica la respuesta de la API eliminando únicamente duplicados EXACTOS.
 * Si un mismo producto está en la misma venta pero con distintos precios,
 * se mantendrán ambas filas, solucionando inconsistencias sin perder datos reales.
 */
function deduplicarDatos(datos) {
  const vistos = new Set()
  return datos.filter((item) => {
    // Usamos JSON.stringify para detectar duplicados idénticos en todas sus propiedades
    const clave = JSON.stringify(item)
    if (vistos.has(clave)) return false
    vistos.add(clave)
    return true
  })
}

/**
 * Genera el reporte de ventas de campaña consultando la API correcta.
 * Endpoint: reporteVentasCampana/{idcampana}/{fechainicio}/{fechafin}
 */
async function generarReporte() {
  if (!campanaSeleccionada.value) {
    $q.notify({ type: 'info', message: 'Por favor, seleccione una campaña.', position: 'top' })
    return
  }
  if (!fechaInicio.value || !fechaFin.value) {
    $q.notify({ type: 'info', message: 'Por favor, seleccione ambas fechas.', position: 'top' })
    return
  }

  $q.loading.show({ message: 'Generando reporte...' })
  cargandoData.value = true

  try {
    const endpoint = `reporteVentasCampana/${campanaSeleccionada.value}/${fechaInicio.value}/${fechaFin.value}`
    const response = await api.get(endpoint)
    console.log('endpoint', endpoint)
    if (response.status === 200) {
      // La API puede devolver el array directamente o envuelto en un objeto
      let rawData = response.data
      console.log('Respuesta API:', rawData)

      if (!Array.isArray(rawData)) {
        // Si viene envuelto, intentar extraer el array
        rawData = rawData?.data ?? rawData?.resultado ?? rawData?.ventas ?? []
      }

      if (!Array.isArray(rawData) || rawData.length === 0) {
        $q.notify({
          type: 'info',
          message: 'No se encontraron ventas para esta campaña en el período indicado.',
          position: 'top',
        })
        datosOriginales.value = []
        datosFiltrados.value = []
        reporteGenerado.value = false
        return
      }

      const deduplicados = deduplicarDatos(rawData)

      // Asignar número de fila
      const data = deduplicados.map((item, index) => ({
        ...item,
        n: index + 1,
        rowKey: `${item.idventa}-${item.producto?.id}-${index}`,
        almacenNombre: item.almacen?.nombre ?? '-',
        productoNombre: item.producto?.nombre ?? '-',
        productoCodigo: item.producto?.codigo ?? '-',
      }))

      datosOriginales.value = data
      datosFiltrados.value = [...data]
      reporteGenerado.value = true

      $q.notify({
        type: 'positive',
        message: `Reporte generado: ${data.length} registros.`,
        position: 'top',
      })
    } else {
      $q.notify({ type: 'negative', message: 'Error al generar el reporte.', position: 'top' })
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
 * Maneja el botón "Generar reporte".
 */
async function handleGenerarReporte() {
  await generarReporte()
}

/**
 * Maneja el botón "Vista previa del Reporte".
 */
function handleVerReporte() {
  if (!datosFiltrados.value || datosFiltrados.value.length === 0) {
    $q.notify({
      type: 'info',
      message: 'No hay datos para mostrar en el reporte.',
      position: 'top',
    })
    return
  }
  const doc = PDF_REPORTE_CAMPANAS_VENTAS(datosFiltrados.value, {
    fechaInicio: fechaInicio.value,
    fechaFin: fechaFin.value,
    campana: campanaSeleccionadaTexto.value,
    usuario: validarUsuario()[0],
  })
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}

// --- Ciclo de Vida ---
onMounted(async () => {
  const contenidousuario = validarUsuario()
  if (contenidousuario && contenidousuario.length > 0) {
    Object.assign(datosUsuario, contenidousuario[0])
  }
  await cargarCampanas()
})
</script>

<style lang="scss" scoped></style>

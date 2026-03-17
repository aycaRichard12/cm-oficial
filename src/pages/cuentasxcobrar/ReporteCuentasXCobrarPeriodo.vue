<template>
  <div class="q-pa-md">
    <q-card flat class="q-mb-md">
      <q-card-section class="q-pb-sm">
        <div class="row q-col-gutter-md items-center">
          <!-- Título y Descripción -->
          <div class="col-12 col-md-4">
            <div class="text-h6 text-primary text-weight-bold flex items-center">
              <q-icon name="payments" size="sm" class="q-mr-sm" />
              Reporte de Cobros
            </div>
            <div class="text-caption text-grey-7">Historial de cobros por periodo y almacén</div>
          </div>

          <!-- Filtros de Fecha -->
          <div class="col-12 col-md-8">
            <div class="row q-col-gutter-sm items-center justify-end">
              <div class="col-6 col-sm-3">
                <q-input
                  v-model="startDate"
                  label="Desde"
                  type="date"
                  dense
                  outlined
                  stack-label
                  hide-bottom-space
                  bg-color="grey-1"
                />
              </div>
              <div class="col-6 col-sm-3">
                <q-input
                  v-model="endDate"
                  label="Hasta"
                  type="date"
                  dense
                  outlined
                  stack-label
                  hide-bottom-space
                  bg-color="grey-1"
                />
              </div>
              <div class="col-12 col-sm-6 text-right q-gutter-xs">
                <q-btn
                  label="Generar"
                  color="primary"
                  icon="refresh"
                  @click="fetchReport"
                  :loading="loading"
                  :disable="!startDate || !endDate"
                  unelevated
                />
                <q-btn
                  v-if="reportData.length > 0"
                  color="info"
                  icon="print"
                  @click="printFilteredTable"
                  unelevated
                  outline
                >
                  <q-tooltip>Imprimir PDF</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="reportData.length > 0"
                  color="positive"
                  icon="file_download"
                  @click="exportToXLSX"
                  unelevated
                  outline
                >
                  <q-tooltip>Exportar Excel</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator inset />

      <!-- Filtros Avanzados (Compacto) -->
      <q-card-section class="q-py-sm">
        <div class="row q-col-gutter-sm items-center">
          <div class="col-12 col-sm-4">
            <q-select
              v-model="selectedAlmacen"
              :options="almacenOptions"
              label="Almacén"
              emit-value
              map-options
              dense
              outlined
              hide-bottom-space
              bg-color="white"
              @update:model-value="updateFilter('almacen', $event !== 0)"
            />
          </div>
          <div class="col-12 col-sm-8 flex justify-between items-center no-wrap q-gutter-sm">
            <q-select
              v-model="clienteStore.clienteSeleccionado"
              use-input
              input-debounce="300"
              :options="clientesFiltrados"
              @filter="filterClientes"
              label="Buscar Cliente..."
              option-label="displayName"
              :loading="loadingClientes"
              clearable
              dense
              outlined
              hide-bottom-space
              bg-color="white"
              class="grow"
              style="flex: 1"
              @update:model-value="updateFilter('cliente', !!$event)"
            />
            <q-btn
              flat
              color="negative"
              icon="backspace"
              label="Limpiar"
              @click="resetAllFilters"
              size="sm"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered v-if="reportData.length > 0" class="shadow-1">
      <BaseFilterableTable
        id="tablareportecobros"
        ref="tablaRef"
        :rows="filteredReportData"
        :array-headers="['fecha_actual', 'nombre_cliente', 'nombre_comercial']"
        :columns="columns"
        :sum-columns="['monto_total_venta', 'saldo_estado_cobro', 'monto_detalle_cobro']"
        nombre-columna-totales="nombre_comercial"
        row-key="id_detalle_cobro"
        :rows-per-page-options="[10, 20, 50, 100]"
      >
        <template v-slot:body-cell-foto_detalle_cobro="props">
          <q-td :props="props">
            <q-btn
              v-if="props.row.foto_detalle_cobro"
              flat
              round
              dense
              color="primary"
              icon="image"
              @click="verImagen(props.row.foto_detalle_cobro)"
            >
              <q-tooltip>Ver comprobante</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </BaseFilterableTable>
    </q-card>

    <q-card flat bordered v-else-if="!loading && reportFetched">
      <q-card-section class="text-center text-grey-7 q-pa-xl">
        <q-icon name="search_off" size="56px" class="q-mb-md" />
        <div class="text-h6">No se encontraron resultados</div>
        <div>Pruebe ajustando las fechas o los filtros para su búsqueda.</div>
      </q-card-section>
    </q-card>

    <q-dialog v-model="mostrarModal" full-width full-height>
      <q-card class="column no-wrap" style="height: 100%">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Vista previa de Reporte</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="col q-pa-none">
          <iframe
            v-if="pdfData"
            :src="pdfData"
            style="width: 100%; height: 100%; border: none"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showImage">
      <q-card style="min-width: 350px">
        <q-img :src="currentImage" />
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-inner-loading :showing="loading">
      <q-spinner-dots color="primary" size="40px" />
    </q-inner-loading>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { api } from 'src/boot/axios'
import { date, useQuasar } from 'quasar'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { PDFreporteCuentasXCobrarPeriodo } from 'src/utils/pdfReportGenerator'
import { exportToXLSX_Reporte_CuentasXCobrarPeriodo } from 'src/utils/XCLReportImport'
import { useAlmacenStore } from 'src/stores/listaResponsableAlmacen'
import { useClienteStore } from 'stores/cliente'
import { primerDiaDelMes } from 'src/composables/FuncionesG'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'

const mostrarModal = ref(false)
const pdfData = ref(null)
const tablaRef = ref(null)
const $q = useQuasar()

// --- State para imágenes ---
const showImage = ref(false)
const currentImage = ref('')
const verImagen = (url) => {
  currentImage.value = url
  showImage.value = true
}

// --- Reactive State ---
const startDate = ref(primerDiaDelMes().toISOString().slice(0, 10))
const endDate = ref(date.formatDate(new Date(), 'YYYY-MM-DD'))
const loading = ref(false) // To show loading spinner
const reportData = ref([]) // To store fetched data
const reportFetched = ref(false) // To indicate if a fetch attempt has been made

// Define table columns
const columns = [
  { name: 'fecha_actual', align: 'left', label: 'Fecha', field: 'fecha_actual', sortable: true, dataType: 'date' },
  {
    name: 'nombre_cliente',
    align: 'left',
    label: 'Cliente',
    field: 'nombre_cliente',
    sortable: true,
    dataType: 'text',
  },
  {
    name: 'nombre_comercial',
    align: 'left',
    label: 'Nombre Comercial',
    field: 'nombre_comercial',
    sortable: true,
    dataType: 'text',
  },

  {
    name: 'monto_total_venta',
    align: 'right',
    label: 'Monto Venta',
    field: 'monto_total_venta',
    format: (val) => `${val ? val.toFixed(2) : '0.00'}`,
    dataType: 'number',
  },
  {
    name: 'saldo_estado_cobro',
    align: 'right',
    label: 'Saldo Cobro',
    field: 'saldo_estado_cobro',
    format: (val) => `${val ? val.toFixed(2) : '0.00'}`,
    dataType: 'number',
  },
  {
    name: 'monto_detalle_cobro',
    align: 'right',
    label: 'Monto Cobrado',
    field: 'monto_detalle_cobro',
    format: (val) => `${val ? val.toFixed(2) : '0.00'}`,
    dataType: 'number',
  },
  { name: 'foto_detalle_cobro', align: 'center', label: 'Foto', field: 'foto_detalle_cobro' },
]

// --- Methods ---


/**
 * Fetches the daily collections report from the API.
 */
const fetchReport = async () => {
  loading.value = true
  reportFetched.value = true
  reportData.value = [] // Clear previous data

  const idusuario = idusuario_md5()

  if (!idusuario) {
    $q.notify({
      type: 'negative',
      message: 'Error: ID de empresa no encontrado en el almacenamiento local. Inicie sesión.',
      position: 'top',
    })
    loading.value = false
    return
  }
  if (!startDate.value || !endDate.value) {
    $q.notify({
      type: 'warning',
      message: 'Por favor, seleccione ambas fechas para generar el reporte.',
      position: 'top',
    })
    loading.value = false
    return
  }

  // Construct your API URL. Adjust this to your actual API endpoint.
  // Example: http://your-api-domain.com/api.php?action=getDailyCollectionsJson&fecha_inicio=...
  // Assuming your API handles routing based on 'action' parameter.

  try {
    const point = `getDailyCollectionsJson/${startDate.value}/${endDate.value}/${idusuario}`
    const response = await api.get(point)
    console.log(response)
    if (response.status === 200 && Array.isArray(response.data)) {
      reportData.value = response.data
      if (response.data.length === 0) {
        $q.notify({
          type: 'info',
          message: 'No se encontraron datos para el rango de fechas especificado.',
          position: 'top',
        })
      } else {
        $q.notify({
          type: 'positive',
          message: 'Reporte generado con éxito.',
          position: 'top',
        })
      }
    } else {
      // Handle cases where API returns non-array or non-200 status for success
      $q.notify({
        type: 'negative',
        message: response.data.error || 'Respuesta inesperada del servidor.',
        position: 'top',
      })
      console.error('API Response Error:', response.data)
    }
  } catch (error) {
    console.error('Error fetching report:', error)
    let errorMessage = 'Hubo un error al conectar con el servidor.'

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage =
        error.response.data.error ||
        `Error del servidor: ${error.response.status} - ${error.response.statusText}`
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No se recibió respuesta del servidor. Verifique su conexión.'
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 5000,
    })
  } finally {
    loading.value = false
  }
}
const printFilteredTable = () => {
  const visibleColumns = tablaRef.value?.obtenerColumnasVisibles() || []
  const doc = PDFreporteCuentasXCobrarPeriodo(reportData, startDate, endDate, visibleColumns)
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}
const exportToXLSX = () => {
  if (reportData.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No hay datos en la tabla para exportar. Genere un reporte primero.',
      position: 'top',
    })
    return
  }

  $q.notify({
    message: 'Exportando a Excel con estilos...',
    color: 'green',
    icon: 'file_download',
  })

  // Prepare data: only include fields that should be in the Excel file
  // and apply any necessary formatting or transformations.
  const visibleColumns = tablaRef.value?.obtenerColumnasVisibles() || []
  exportToXLSX_Reporte_CuentasXCobrarPeriodo(reportData, startDate, endDate, visibleColumns)

  $q.notify({
    type: 'positive',
    message: 'Reporte Excel generado con éxito.',
    position: 'top',
  })
}

// ------------------------------------------------------------------------------- filter ----------
const almacenes = useAlmacenStore()
const clienteStore = useClienteStore()

const selectedAlmacen = ref(0)
const selectedEstado = ref(null)
const loadingClientes = ref(false)
const loadingSucursales = ref(false)
const searchCliente = ref('')
const idmd5 = ref('')
const activeFilters = ref({
  almacen: false,
  cliente: false,
  sucursal: false,
  estado: false,
})
const almacenOptions = computed(() => {
  const options = [{ label: 'Todos los almacenes', value: 0 }]
  almacenes.almacenes.forEach((almacen) => {
    options.push({ label: almacen.almacen, value: Number(almacen.idalmacen) })
  })
  return options
})

const clientesFiltrados = computed(() => {
  if (!searchCliente.value) return clienteStore.clientes
  return clienteStore.clientes.filter((c) =>
    `${c.codigo}${c.nombre}${c.nombrecomercial}${c.ciudad}${c.nit}`
      .toLowerCase()
      .includes(searchCliente.value),
  )
})
const filteredReportData = computed(() => {
  let data = [...reportData.value]

  // Aplicar filtros solo si están activos
  if (activeFilters.value.almacen && selectedAlmacen.value !== 0) {
    data = data.filter((row) => Number(row.idalmacen) === selectedAlmacen.value)
  }

  if (activeFilters.value.cliente && clienteStore.clienteSeleccionado) {
    data = data.filter(
      (row) => Number(row.idcliente) === Number(clienteStore.clienteSeleccionado.id),
    )
  }

  if (activeFilters.value.sucursal && clienteStore.sucursalSeleccionada) {
    data = data.filter(
      (row) => Number(row.idsucursal) === Number(clienteStore.sucursalSeleccionada.id),
    )
  }

  if (activeFilters.value.estado && selectedEstado.value) {
    data = data.filter((row) => Number(row.estado) === Number(selectedEstado.value))
  }

  // Ahora retornamos la data limpia sin procesar totales aquí,
  // ya que BaseFilterableTable los calculará.
  return data.map((row, index) => ({ ...row, numero: index + 1 }))
})

const filterClientes = (val, update) => {
  update(() => {
    searchCliente.value = val.toLowerCase()
  })
}

const updateFilter = (filterName, isActive) => {
  activeFilters.value[filterName] = isActive
}

const applyFilters = () => {
  // Forzar recálculo al cambiar filtros
  filteredReportData.value = [...filteredReportData.value]
}

const resetClientSelection = () => {
  clienteStore.clienteSeleccionado = null
  clienteStore.sucursalSeleccionada = null
  activeFilters.value.cliente = false
  activeFilters.value.sucursal = false
}

const resetAllFilters = () => {
  selectedAlmacen.value = 0
  selectedEstado.value = null
  resetClientSelection()
  applyFilters()
}
watch(
  () => clienteStore.clienteSeleccionado,
  (newVal) => {
    if (newVal) {
      loadingSucursales.value = true
      clienteStore.cargarSucursales(newVal.id).finally(() => {
        loadingSucursales.value = false
      })
    } else {
      clienteStore.sucursales = []
      clienteStore.sucursalSeleccionada = null
    }
  },
)
// --- Lifecycle Hook ---
onMounted(async () => {
  const storedMd5 = idusuario_md5()
  if (storedMd5) {
    idmd5.value = storedMd5
    almacenes.listaAlmacenes()
  } else {
    $q.notify({
      type: 'negative',
      message: 'ID MD5 no encontrado. Asegúrate de iniciar sesión correctamente.',
      timeout: 5000,
    })
  }

  if (clienteStore.clientes.length === 0) {
    loadingClientes.value = true
    try {
      await clienteStore.cargarClientes()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al cargar clientes',
        caption: error.message,
      })
    } finally {
      loadingClientes.value = false
    }
  }
})
</script>

<style scoped>
/* You can add specific styles here if needed */
</style>

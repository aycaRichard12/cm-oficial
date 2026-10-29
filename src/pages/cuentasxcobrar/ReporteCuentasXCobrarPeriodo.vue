<template>
  <div class="q-pa-md">
    <q-card flat class="q-mb-md">
      <q-card-section class="q-pb-sm">
        <div class="row q-col-gutter-md items-center">
          <!-- Título y Descripción -->
          <div class="col-12 col-md-4">
            <div class="text-h6 text-primary text-weight-bold flex items-center">
              <q-icon name="payments" size="sm" class="q-mr-sm" />
              {{ $t('ui.reporte-de-cobros-fe6272') }}
            </div>
            <div class="text-caption text-grey-7">{{ $t('ui.historial-de-cobros-por-periodo-y-almacen-a662b1') }}</div>
          </div>

          <!-- Filtros de Fecha -->
          <div class="col-12 col-md-8">
            <div class="row q-col-gutter-sm items-center justify-end">
              <div class="col-6 col-sm-3">
                <q-input
                  v-model="startDate"
                  :label="$t('ui.desde-966c7c')"
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
                  :label="$t('ui.hasta-ccdaad')"
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
                  :label="$t('ui.generar-1f31a1')"
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
                  <q-tooltip>{{ $t('ui.imprimir-pdf-60263c') }}</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="reportData.length > 0"
                  color="positive"
                  icon="file_download"
                  @click="exportToXLSX"
                  unelevated
                  outline
                >
                  <q-tooltip>{{ $t('reportes.exportExcel') }}</q-tooltip>
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
              :label="$t('inventario.warehouse')"
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
              :label="$t('ui.buscar-cliente-2679bb')"
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
              :label="$t('ui.limpiar-f3b225')"
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
        :array-headers="[
          'fecha_actual',
          'Venta',
          'nombre_cliente',
          'nombre_comercial',
          'nombre_almacen',
          'nombre_sucursal',
          'tipo_cobro',
        ]"
        :columns="columns"
        :sum-columns="['monto_total_venta', 'saldo_estado_cobro', 'monto_detalle_cobro']"
        nombre-columna-totales="nombre_comercial"
        row-key="id_detalle_cobro"
        :rows-per-page-options="[10, 20, 50, 100]"
      >
        <template v-slot:body-cell-tipo_cobro="props">
          <q-td :props="props">
            <q-badge
              v-if="props.value"
              :color="props.value === 'CF' ? 'green-2' : props.value === 'SF' ? 'cyan-2' : 'teal-2'"
              :text-color="
                props.value === 'CF' ? 'green-10' : props.value === 'SF' ? 'cyan-10' : 'teal-10'
              "
              class="text-weight-bold q-px-sm q-py-xs"
              style="font-size: 0.85rem"
            >
              {{ props.value }}
            </q-badge>
          </q-td>
        </template>
        <template v-slot:body-cell-foto_detalle_cobro="props">
          <q-td :props="props">
            <q-btn
              v-if="props.row.foto_detalle_cobro || props.row.urlpdf"
              flat
              round
              dense
              color="primary"
              :icon="
                esArchivoPDF(props.row.foto_detalle_cobro || props.row.urlpdf)
                  ? 'picture_as_pdf'
                  : 'photo'
              "
              @click="verImagen(props.row.foto_detalle_cobro || props.row.urlpdf)"
            >
              <q-tooltip
                >{{ $t('ui.ver-49b372') }}
                {{
                  esArchivoPDF(props.row.foto_detalle_cobro || props.row.urlpdf) ? 'PDF' : $t('ui.imagen-100f99')
                }}</q-tooltip
              >
            </q-btn>
          </q-td>
        </template>
      </BaseFilterableTable>
    </q-card>

    <q-card flat bordered v-else-if="!loading && reportFetched">
      <q-card-section class="text-center text-grey-7 q-pa-xl">
        <q-icon name="search_off" size="56px" class="q-mb-md" />
        <div class="text-h6">{{ $t('ui.no-se-encontraron-resultados-379d80') }}</div>
        <div>{{ $t('ui.pruebe-ajustando-las-fechas-o-los-filtros-para-su-bu-3a3285') }}</div>
      </q-card-section>
    </q-card>

    <q-dialog v-model="mostrarModal" full-width full-height>
      <q-card class="column no-wrap" style="height: 100%">
        <q-card-section class="row items-center q-pb-none bg-primary text-white">
          <div class="text-h6">{{ $t('ui.vista-previa-de-reporte-069956') }}</div>
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

    <!-- Visor de Comprobante (Soporta PDF e Imagen) -->
    <ComprobanteViewerDialog v-model="showImage" :imagen-seleccionada="currentImage" />

    <q-inner-loading :showing="loading">
      <q-spinner-dots color="primary" size="40px" />
    </q-inner-loading>
  </div>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import { api } from 'src/boot/axios'
import { date, useQuasar } from 'quasar'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { PDFreporteCuentasXCobrarPeriodo } from 'src/utils/pdfReportGenerator'
import { exportToXLSX_Reporte_CuentasXCobrarPeriodo } from 'src/utils/XCLReportImport'
import { useAlmacenStore } from 'src/stores/listaResponsableAlmacen'
import { useClienteStore } from 'stores/cliente'
import { primerDiaDelMes, cambiarFormatoFecha } from 'src/composables/FuncionesG'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'
import ComprobanteViewerDialog from './components/ComprobanteViewerDialog.vue'

const mostrarModal = ref(false)
const pdfData = ref(null)
const tablaRef = ref(null)
const $q = useQuasar()

// --- State para imágenes/PDFs ---
const showImage = ref(false)
const currentImage = ref('')

const verImagen = (url) => {
  if (!url) return

  // Si la URL es relativa (ej: uploads/...), concatenamos la base de la API
  if (!url.startsWith('http') && !url.startsWith('blob:')) {
    currentImage.value = `${api.defaults.baseURL}${url}`
  } else {
    currentImage.value = url
  }

  showImage.value = true
}

const esArchivoPDF = (url) => {
  if (!url) return false
  return url.toLowerCase().split('?')[0].endsWith('.pdf')
}

// --- Reactive State ---
const startDate = ref(primerDiaDelMes().toISOString().slice(0, 10))
const endDate = ref(date.formatDate(new Date(), 'YYYY-MM-DD'))
const loading = ref(false) // To show loading spinner
const reportData = ref([]) // To store fetched data
const reportFetched = ref(false) // To indicate if a fetch attempt has been made

// Define table columns
const columns = [
  {
    name: 'fecha_actual',
    align: 'left',
    label: i18nT('cotizacion.table.date'),
    field: 'fecha_actual',
    sortable: true,
    dataType: 'date',
    format: (val) => (val ? cambiarFormatoFecha(String(val).split(' ')[0]) : ''),
  },
  {
    name: 'num_documento',
    align: 'left',
    label: i18nT('ui.n-doc-2a0176'),
    field: 'num_documento',
    sortable: true,
    dataType: 'text',
  },
  {
    name: 'nombre_cliente',
    align: 'left',
    label: i18nT('ui.razon-social-adf906'),
    field: 'nombre_cliente',
    sortable: true,
    dataType: 'text',
  },
  {
    name: 'nombre_comercial',
    align: 'left',
    label: i18nT('ui.nombre-comercial-55a6ae'),
    field: 'nombre_comercial',
    sortable: true,
    dataType: 'text',
  },
  {
    name: 'Venta',
    align: 'left',
    label: i18nT('ui.documento-cobrado-a1e470'),
    field: 'Venta',
    sortable: true,
    dataType: 'text',
  },
  {
    name: 'monto_total_venta',
    align: 'right',
    label: i18nT('ui.monto-venta-f44814'),
    field: 'monto_total_venta',
    format: (val) => `${val ? val.toFixed(2) : '0.00'}`,
    dataType: 'number',
  },
  {
    name: 'saldo_estado_cobro',
    align: 'right',
    label: i18nT('ui.saldo-cobro-2020f5'),
    field: 'saldo_estado_cobro',
    format: (val) => `${val ? val.toFixed(2) : '0.00'}`,
    dataType: 'number',
  },
  {
    name: 'monto_detalle_cobro',
    align: 'right',
    label: i18nT('ui.monto-cobrado-752b90'),
    field: 'monto_detalle_cobro',
    format: (val) => `${val ? val.toFixed(2) : '0.00'}`,
    dataType: 'number',
  },
  {
    name: 'tipo_cobro',
    align: 'center',
    label: i18nT('ui.tipo-cobro-e46562'),
    field: 'tipo_cobro',
    sortable: true,
    dataType: 'text',
  },
  {
    name: 'foto_detalle_cobro',
    align: 'center',
    label: i18nT('ui.comprobante-7f8d58'),
    field: 'foto_detalle_cobro',
  },
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
      message: i18nT('ui.error-id-de-empresa-no-encontrado-en-el-almacenamien-782ab8'),
      position: 'top',
    })
    loading.value = false
    return
  }
  if (!startDate.value || !endDate.value) {
    $q.notify({
      type: 'warning',
      message: i18nT('ui.por-favor-seleccione-ambas-fechas-para-generar-el-re-04ec5a'),
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
          message: i18nT('ui.no-se-encontraron-datos-para-el-rango-de-fechas-espe-199bf2'),
          position: 'top',
        })
      } else {
        $q.notify({
          type: 'positive',
          message: i18nT('ui.reporte-generado-con-exito-13e8ba'),
          position: 'top',
        })
      }
    } else {
      // Handle cases where API returns non-array or non-200 status for success
      $q.notify({
        type: 'negative',
        message: response.data.error || i18nT('ui.respuesta-inesperada-del-servidor-2903c8'),
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
  const data = tablaRef.value?.obtenerDatosFiltrados() || []
  const visibleColumns = tablaRef.value?.obtenerColumnasVisibles() || []
  const doc = PDFreporteCuentasXCobrarPeriodo(data, startDate.value, endDate.value, visibleColumns)

  // Liberar URL anterior si existe
  if (pdfData.value) {
    URL.revokeObjectURL(pdfData.value)
  }

  const blob = doc.output('blob')
  pdfData.value = URL.createObjectURL(blob)
  mostrarModal.value = true
}

// Limpiar la URL de objeto al cerrar el modal o desmontar el componente
watch(mostrarModal, (val) => {
  if (!val && pdfData.value) {
    URL.revokeObjectURL(pdfData.value)
    pdfData.value = null
  }
})

onBeforeUnmount(() => {
  if (pdfData.value) {
    URL.revokeObjectURL(pdfData.value)
  }
})

const exportToXLSX = () => {
  const data = tablaRef.value?.obtenerDatosFiltrados() || []
  if (data.length === 0) {
    $q.notify({
      type: 'warning',
      message: i18nT('ui.no-hay-datos-en-la-tabla-para-exportar-genere-un-rep-6c497e'),
      position: 'top',
    })
    return
  }

  $q.notify({
    message: i18nT('ui.exportando-a-excel-con-estilos-683c44'),
    color: 'green',
    icon: 'file_download',
  })

  // Usar los valores crudos para evitar problemas con Vue Refs en la utilidad
  const visibleColumns = tablaRef.value?.obtenerColumnasVisibles() || []
  exportToXLSX_Reporte_CuentasXCobrarPeriodo(data, startDate.value, endDate.value, visibleColumns)

  $q.notify({
    type: 'positive',
    message: i18nT('ui.reporte-excel-generado-con-exito-2ac7b0'),
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
  const options = [{ label: i18nT('ui.todos-los-almacenes-949f2c'), value: 0 }]
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
      message: i18nT('ui.id-md5-no-encontrado-asegurate-de-iniciar-sesion-cor-e2a61f'),
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
        message: i18nT('ui.error-al-cargar-clientes-3c0d3b'),
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

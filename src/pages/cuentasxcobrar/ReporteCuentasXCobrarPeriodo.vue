<template>
  <div class="q-pa-md">
    <div class="titulo">Reporte de Cobros Diarios</div>

    <q-card-section class="q-pt-none">
      <div class="row q-col-gutter-md">
        <div class="col-xs-12 col-sm-6">
          <label for="fechainicio">Fecha Inicio</label>

          <q-input
            type="date"
            v-model="startDate"
            id="fechaini"
            dense
            outlined
            :rules="[(val) => !!val || 'Seleccione una fecha válida']"
          >
          </q-input>
        </div>

        <div class="col-xs-12 col-sm-6">
          <label for="fechafin">Fecha Fin</label>

          <q-input
            type="date"
            v-model="endDate"
            id="fechaini"
            dense
            outlined
            :rules="[(val) => !!val || 'Seleccione una fecha válida']"
          >
          </q-input>
        </div>
      </div>

      <div class="q-mt-md">
        <q-btn
          label="Generar Reporte"
          color="primary"
          @click="fetchReport"
          :loading="loading"
          :disable="!startDate || !endDate"
          class="q-ma-lg"
        />

        <q-btn
          label="Imprimir Reporte"
          color="info"
          icon="print"
          @click="printFilteredTable"
          :disable="reportData.length === 0"
          class="q-ma-lg"
        />
        <q-btn
          label="Exportar a Excel"
          color="green"
          icon="file_download"
          @click="exportToXLSX"
          :disable="reportData.length === 0"
        />
      </div>
    </q-card-section>
    <q-card-section>
      <q-expansion-item label="Filtros avanzados" icon="filter_list" default-opened class="q-mb-md">
        <!-- Indicador de filtros activos -->

        <div class="row q-col-gutter-md q-pt-md">
          <!-- Filtro por almacén -->
          <div class="col-xs-12 col-sm-6 col-md-3">
            <label for="filtrarporalmacen">Filtrar por Almacén</label>
            <q-select
              v-model="selectedAlmacen"
              :options="almacenOptions"
              id="filtrarporalmacen"
              emit-value
              map-options
              dense
              outlined
              @update:model-value="updateFilter('almacen', $event !== 0)"
            />
          </div>

          <!-- Filtro por cliente -->
          <div class="col-xs-12 col-sm-6 col-md-4">
            <label for="cliente">Buscar cliente</label>
            <q-select
              v-model="clienteStore.clienteSeleccionado"
              use-input
              input-debounce="300"
              :options="clientesFiltrados"
              @filter="filterClientes"
              id="cliente"
              option-label="displayName"
              :loading="loadingClientes"
              :disable="loadingClientes"
              clearable
              dense
              outlined
              @update:model-value="updateFilter('cliente', !!$event)"
              @clear="resetClientSelection"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    {{
                      loadingClientes
                        ? 'Cargando clientes...'
                        : clienteStore.clientes.length === 0
                          ? 'No hay clientes disponibles'
                          : 'No se encontraron coincidencias'
                    }}
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.codigo }} - {{ scope.opt.nombre }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.nombrecomercial }}</q-item-label>
                    <q-item-label caption
                      >{{ scope.opt.ciudad }} - {{ scope.opt.nit }}</q-item-label
                    >
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Filtro por sucursal -->
          <div class="col-xs-12 col-sm-6 col-md-3">
            <label for="seleccionarsucursal">Seleccionar sucursal</label>
            <q-select
              v-if="clienteStore.clienteSeleccionado"
              v-model="clienteStore.sucursalSeleccionada"
              :options="clienteStore.sucursales"
              option-label="nombre"
              id="seleccionarsucursal"
              dense
              outlined
              :loading="loadingSucursales"
              :disable="!clienteStore.sucursales.length || loadingSucursales"
              clearable
              @update:model-value="updateFilter('sucursal', !!$event)"
              @clear="resetSucursalSelection"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    {{
                      loadingSucursales ? 'Cargando sucursales...' : 'No hay sucursales disponibles'
                    }}
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- Filtro por estado (nuevo) -->
          <div class="col-xs-12 col-sm-6 col-md-2">
            <label for="estadocredito">Estado crédito</label>
            <q-select
              v-model="selectedEstado"
              :options="estadoOptions"
              id="estadocredito"
              emit-value
              map-options
              clearable
              dense
              outlined
              @update:model-value="updateFilter('estado', !!$event)"
            />
          </div>

          <!-- Botones de acción -->
          <div class="col-12 row justify-end q-mt-sm">
            <q-btn label="Aplicar Filtros" color="primary" @click="applyFilters" class="q-mr-sm" />
            <q-btn label="Limpiar Todo" color="negative" outline @click="resetAllFilters" />
          </div>
        </div>
      </q-expansion-item>
    </q-card-section>
    <q-separator />

    <q-card-section v-if="reportData.length > 0">
      <q-table
        title="Resultados del Reporte"
        :rows="filteredReportData"
        :columns="columns"
        row-key="id_detalle_cobro"
        flat
        bordered
        :pagination-label="getPaginationLabel"
        :rows-per-page-options="[10, 20, 50, 100]"
        no-data-label="No hay datos disponibles para el rango de fechas seleccionado."
      >
        <template v-slot:body-cell-foto_detalle_cobro="props">
          <q-td :props="props">
            <q-img
              v-if="props.row.foto_detalle_cobro"
              :src="props.row.foto_detalle_cobro"
              alt="Foto de Cobro"
              style="width: 50px; height: 50px; object-fit: cover"
              class="rounded-borders"
            />
            <span v-else></span>
          </q-td>
        </template>
      </q-table>
    </q-card-section>

    <q-card-section v-else-if="!loading && reportFetched">
      <q-banner dense rounded class="bg-grey-3 text-grey-8">
        <template v-slot:avatar>
          <q-icon name="info" />
        </template>
        No se encontraron cobros para el rango de fechas y empresa seleccionados.
      </q-banner>
    </q-card-section>

    <q-inner-loading :showing="loading">
      <q-spinner-hourglass color="primary" size="50px" />
    </q-inner-loading>
    <q-dialog v-model="mostrarModal" full-width full-height>
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
const mostrarModal = ref(false)
const pdfData = ref(null)
const $q = useQuasar()

// --- Reactive State ---
const startDate = ref(primerDiaDelMes().toISOString().slice(0, 10))
const endDate = ref(date.formatDate(new Date(), 'YYYY-MM-DD'))
const loading = ref(false) // To show loading spinner
const reportData = ref([]) // To store fetched data
const reportFetched = ref(false) // To indicate if a fetch attempt has been made

// Define table columns
const columns = [
  { name: 'fecha_actual', align: 'left', label: 'Fecha', field: 'fecha_actual', sortable: true },
  {
    name: 'nombre_cliente',
    align: 'left',
    label: 'Cliente',
    field: 'nombre_cliente',
    sortable: true,
  },
  {
    name: 'nombre_comercial',
    align: 'left',
    label: 'Nombre Comercial',
    field: 'nombre_comercial',
    sortable: true,
  },

  {
    name: 'monto_total_venta',
    align: 'right',
    label: 'Monto Venta',
    field: 'monto_total_venta',
    format: (val) => `${val ? val.toFixed(2) : '0.00'}`,
  },
  {
    name: 'saldo_estado_cobro',
    align: 'right',
    label: 'Saldo Cobro',
    field: 'saldo_estado_cobro',
    format: (val) => `${val ? val.toFixed(2) : '0.00'}`,
  },
  {
    name: 'monto_detalle_cobro',
    align: 'right',
    label: 'Monto Cobrado',
    field: 'monto_detalle_cobro',
    format: (val) => `${val ? val.toFixed(2) : '0.00'}`,
  },
  { name: 'foto_detalle_cobro', align: 'center', label: 'Foto', field: 'foto_detalle_cobro' },
]

// --- Methods ---

/**
 * Custom pagination label for q-table.
 */
const getPaginationLabel = (firstRowIndex, endRowIndex, totalRows) => {
  return `${firstRowIndex}-${endRowIndex} de ${totalRows}`
}

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
  const doc = PDFreporteCuentasXCobrarPeriodo(reportData, startDate, endDate)
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
  exportToXLSX_Reporte_CuentasXCobrarPeriodo(reportData, startDate, endDate)

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

  return processDataWithTotals(data)
})

const processDataWithTotals = (data) => {
  if (data.length === 0) return []

  const numberedData = data.map((row, index) => ({
    ...row,
    numero: index + 1,
  }))

  const totales = {
    fecha_actual: '',
    nombre_cliente: '',
    nombre_comercial: 'TOTAL:',
    monto_total_venta: numberedData.reduce((sum, u) => sum + Number(u.monto_total_venta || 0), 0),
    saldo_estado_cobro: numberedData.reduce((sum, u) => sum + Number(u.saldo_estado_cobro || 0), 0),
    monto_detalle_cobro: numberedData.reduce(
      (sum, u) => sum + Number(u.monto_detalle_cobro || 0),
      0,
    ),

    foto_detalle_cobro: '',
  }

  return [...numberedData, totales]
}

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

const resetSucursalSelection = () => {
  clienteStore.sucursalSeleccionada = null
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

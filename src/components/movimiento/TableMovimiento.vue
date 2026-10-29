<template>
  <div class="q-pa-md">
    <q-card flat bordered class="shadow-1">
      <!-- Header Section -->
      <q-card-section class="q-pb-none">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6 text-primary row items-center">
            <q-icon name="inventory_2" class="q-mr-sm" />
            {{ $t('ui.movimientos-de-almacen-eac050') }}
          </div>
          <div>
            <q-btn
              color="primary"
              unelevated
              @click="$emit('addRecord')"
              class="btn-res"
              id="btnAgregarNuevoMovimiento"
            >
              <q-icon name="add" class="icono" />
              <span class="texto">
                <q-icon name="add" />{{ collapseVisible ? $t('ui.cancelar-registro-2dee20') : $t('common.new') }}</span
              >
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <!-- Filters and Actions Toolbar -->
      <q-card-section class="q-pt-none">
        <div class="row q-col-gutter-md items-center">
          <!-- Almacen Select -->
          <div class="col-12 col-md-4" id="selectAlmacenOrigenSelector">
            <q-select
              v-model="selectedFilterStore"
              :options="filterStores"
              id="almacen"
              :label="$t('ui.seleccione-un-almacen-fc2f9e')"
              map-options
              dense
              outlined
              clearable
              options-dense
              behavior="menu"
            >
              <template v-slot:prepend>
                <q-icon name="store" color="primary" />
              </template>
            </q-select>
          </div>

          <!-- Search Input -->
          <div class="col-12 col-md-4" id="inputBuscarMovimiento">
            <q-input
              v-model="searchQuery"
              :placeholder="$t('ui.buscar-por-descripcion-1b60e5')"
              dense
              outlined
              debounce="300"
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <!-- Action Buttons -->
          <div class="col-12 col-md-4 row justify-end q-gutter-sm">
            <q-btn
              color="secondary"
              icon="assessment"
              :label="$t('ui.reporte-431e46')"
              id="reportedepreciosbase"
              to="/reportedemovimientos"
              outline
              no-caps
              dense
            >
              <q-tooltip>{{ $t('ui.ir-al-reporte-de-movimientos-fe02ee') }}</q-tooltip>
            </q-btn>

            <q-btn
              color="secondary"
              icon="list_alt"
              :label="$t('ui.pedidos-6170d2')"
              id="listaPedidosMOV"
              @click="showOrderList"
              outline
              no-caps
              dense
            >
              <q-tooltip>{{ $t('ui.ver-lista-de-pedidos-ab66e8') }}</q-tooltip>
            </q-btn>

            <q-btn
              color="info"
              icon="picture_as_pdf"
              label="PDF"
              id="generarReporteMOV"
              @click="printFilteredTable"
              outline
              no-caps
              dense
            >
              <q-tooltip>{{ $t('ui.vista-previa-pdf-9db3ed') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Table -->
      <q-card-section class="q-pa-none">
        <q-table
          id="tableMovimientos"
          :rows="filteredRows"
          :columns="columns"
          row-key="id"
          :loading="props.loading || movementStore.isLoadingOriginStores"
          :filter="searchQuery"
          v-model:pagination="pagination"
          flat
          class="no-border"
          wrap-cells
        >
          <!-- Loading Slot (Optional enhancement) -->
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>

          <template v-slot:body-cell-Autorizacion="props">
            <q-td :props="props" class="text-center">
              <q-chip
                :color="props.row.autorizacionStatus === 'Autorizado' ? 'positive' : 'negative'"
                text-color="white"
                size="12px"
                dense
                icon-right="verified"
              >
                {{ props.row.autorizacionStatus }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-Detalle="props">
            <q-td :props="props" class="text-center" id="detalleCarrito">
              <q-btn
                icon="shopping_cart"
                color="blue"
                dense
                flat
                round
                size="sm"
                @click="$emit('viewProductDetails', props.row)"
              >
                <q-tooltip>{{ $t('ui.anadir-productos-carrito-1ddabf') }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:body-cell-Opciones="props">
            <q-td :props="props" class="text-center">
              <div class="row justify-center no-wrap q-gutter-xs">
                <q-btn
                  id="verDetalle"
                  icon="visibility"
                  color="amber-8"
                  dense
                  flat
                  round
                  size="sm"
                  @click="verDetalle(props.row)"
                >
                  <q-tooltip>{{ $t('ui.ver-comprobante-91511a') }}</q-tooltip>
                </q-btn>

                <div v-if="Number(props.row.autorizacion) === 2" class="row no-wrap q-gutter-xs">
                  <q-btn
                    id="editRecord"
                    icon="edit"
                    color="primary"
                    dense
                    flat
                    round
                    size="sm"
                    @click="$emit('editRecord', props.row)"
                  >
                    <q-tooltip>{{ $t('ui.editar-movimiento-f73291') }}</q-tooltip>
                  </q-btn>

                  <q-btn
                    id="deleteRecord"
                    icon="delete"
                    color="negative"
                    dense
                    flat
                    round
                    size="sm"
                    @click="$emit('deleteRecord', props.row)"
                  >
                    <q-tooltip>{{ $t('ui.eliminar-movimiento-74a30c') }}</q-tooltip>
                  </q-btn>

                  <q-btn
                    id="toggleStatus"
                    icon="toggle_off"
                    dense
                    flat
                    round
                    size="sm"
                    color="grey-7"
                    @click="$emit('toggleStatus', props.row)"
                  >
                    <q-tooltip>{{ $t('ui.activar-movimiento-65c521') }}</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- PDF Modal -->
    <q-dialog v-model="mostrarModal" full-width full-height>
      <q-card class="column full-height">
        <q-card-section class="row items-center q-pb-none bg-grey-2">
          <div class="text-h6 cm-text">{{ $t('ui.vista-previa-de-pdf-978f4e') }}</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup color="negative" />
        </q-card-section>

        <q-separator />

        <q-card-section class="col q-pa-none relative-position">
          <iframe
            v-if="pdfData"
            :src="pdfData"
            class="full-width full-height"
            style="border: none"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>

    <pedidosMovimiento
      v-if="isModalOpen"
      :title="modalTitle"
      @ok="handleModalOk"
      @hide="handleModalHide"
      @orders-processed="$emit('refresh')"
    />

    <RegistrarAlmacenDialog
      v-model="ShowWarningDialog"
      :title="$t('ui.advertencia-0ef76a')"
      :message="$t('ui.no-tienes-un-almacen-asignado-debes-asignarte-uno-o-2b40f1')"
      @accepted="redirectToAssignment"
      @closed="redirectToAssignment"
    />
  </div>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useMovementStore } from 'src/stores/movement-store'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { api } from 'src/boot/axios'
import pedidosMovimiento from './pedidosMovimiento.vue'
import RegistrarAlmacenDialog from 'src/components/RegistrarAlmacenDialog.vue'
import { useRouter } from 'vue-router'
import { PDF_LISTA_MOVIMIENTOS } from 'src/utils/pdfReportGenerator'
import { useAlmacenStore } from 'src/composables/movimiento/useAlmacenStore'
import { PDFComprobanteMovimiento } from 'src/utils/pdfs/Movimiento/detalleMovimiento.js'

//import { URL_APIE } from 'src/composables/services'
const mostrarModal = ref(false)
const pdfData = ref(null)
// Define props coming from the parent component
const props = defineProps({
  movimientos: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()
const ShowWarningDialog = ref(false)

// Initialize Quasar and Pinia store
const $q = useQuasar()
const movementStore = useMovementStore()
const { selectedAlmacen, setSelectedAlmacen } = useAlmacenStore()

// Define emits for clarity and validation
defineEmits([
  'addRecord', // Renamed from 'cancelRecord' to match the "Agregar" button
  'generateReport',
  'viewProductDetails',
  'editRecord',
  'deleteRecord',
  'deleteRecord',
  'toggleStatus',
  'refresh',
])

const searchQuery = ref('')
const selectedFilterStore = ref('') // Replaced by selectedAlmacen
const rows = ref([]) // Data for the QTable

const pagination = ref({
  rowsPerPage: 10,
})

// filterStores now comes directly from the Pinia store
// This computed property will react to changes in movementStore.originStores
const filterStores = computed(() => {
  // Add a default "Seleccione un Almacén" option
  return [...movementStore.originStores]
})

// Watch for changes in movementStore.originStores and automatically select the first valid option
// if nothing is selected and stores become available.
watch(
  () => movementStore.originStores,
  (newStores) => {
    if (newStores.length > 0 && !selectedAlmacen.value) {
      // Find the first store that has a valid value and set it
      const firstValidStore = newStores.find((store) => store.value !== null && store.value !== '')
      if (firstValidStore) {
        setSelectedAlmacen(firstValidStore)
      }
    }
  },
  { immediate: true }, // Run the watcher immediately on component mount
)

// Watch for changes in the 'movimientos' prop and update 'rows' accordingly
watch(
  () => props.movimientos,
  (newMovimientos) => {
    rows.value = newMovimientos
    console.log(rows.value)
    // No need for a setTimeout here as data is passed directly via prop
  },
  { immediate: true }, // Run the watcher immediately on component mount
)

// Define table columns
const columns = [
  { name: 'indice', label: i18nT('cotizacion.table.number'), align: 'left', field: 'indice', sortable: true },
  { name: 'Fecha', label: i18nT('cotizacion.table.date'), align: 'center', field: 'fecha', sortable: true },
  {
    name: 'Almacén origen',
    label: i18nT('ui.almacen-origen-3ef997'),
    align: 'left',
    field: 'almacenOrigenName',
    sortable: true,
  },
  {
    name: 'Almacén destino',
    label: i18nT('ui.almacen-destino-80fb1d'),
    align: 'left',
    field: 'almacenDestinoName',
    sortable: true,
  },
  {
    name: 'Descripción',
    label: i18nT('configuracion.servicios.table.descripcion'),
    align: 'left',
    field: 'descripcion',
    sortable: true,
  },
  {
    name: 'Autorizacion',
    label: i18nT('ui.autorizacion-077400'),
    align: 'center',
    field: 'autorizacionStatus',
    sortable: true,
  },
  { name: 'Detalle', label: i18nT('ui.detalle-be605b'), align: 'center', field: 'id', sortable: false },
  { name: 'Opciones', label: i18nT('configGeneral.divisas.table.options'), align: 'center', field: 'id', sortable: false },
]

// Filter table rows based on selectedFilterStore
const filteredRows = computed(() => {
  if (!selectedFilterStore.value) {
    return rows.value.map((item, indice) => ({
      ...item,
      indice: indice + 1,
    }))
  }

  // Access the ID safely from selectedFilterStore which comes from filterStores (value/label pair)
  const storeId = selectedFilterStore.value.value || selectedFilterStore.value.id

  const filtrado = rows.value.filter(
    (row) =>
      Number(row.idalmacenorigen) === Number(storeId) ||
      Number(row.idalmacendestino) === Number(storeId),
  )
  return filtrado.map((item, indice) => ({
    indice: indice + 1,
    ...item,
  }))
})

// --- Component-specific methods ---

const printFilteredTable = () => {
  $q.notify({
    message: `Imprimiendo tabla para el almacén: ${selectedAlmacen.value?.label || 'N/A'}`,
    color: 'blue-7',
    icon: 'print',
  })

  try {
    const contenidousuario = validarUsuario()
    const usuario = contenidousuario[0]

    const datosFormulario = {
      almacen: selectedAlmacen.value?.label,
      nombreEncargado: usuario.nombre,
      cargoEncargado: usuario.cargo,
    }

    const doc = PDF_LISTA_MOVIMIENTOS(filteredRows.value, datosFormulario)
    pdfData.value = doc.output('dataurlstring')
    mostrarModal.value = true
  } catch (error) {
    console.error('Error al generar el PDF:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.error-al-generar-el-pdf-de-movimientos-17bfed'),
    })
  }
}

const showOrderList = () => {
  $q.notify({
    message: i18nT('ui.mostrando-lista-de-pedidos-356fdd'),
    color: 'purple-7',
  })
  isModalOpen.value = true
  // Logic to navigate to or display the order list for the selected store
}

/*
// Not needed if AlmacenSelector handles store updates directly
const onAlmacenChange = (val) => {
   // Already handled by AlmacenSelector component updating the store
}
*/

const verDetalle = async (row) => {
  try {
    console.log(row.id)
    const contenidousuario = validarUsuario()
    const usuario = contenidousuario[0]
    const idempresa = usuario.empresa.idempresa

    // Obtener los detalles del movimiento
    const detallePedido = await api.get(`comprobanteMovimiento/${row.id}/${idempresa}`)
    console.log('a qui que esta llegando', detallePedido)
    console.log(
      'ruta donde sea hace la peticion',
      `${api}/comprobanteMovimiento/${row.id}/${idempresa}`,
    )

    if (detallePedido.data) {
      const { doc, mobileBlobUrl } = await PDFComprobanteMovimiento(detallePedido.data)
      pdfData.value = mobileBlobUrl ?? doc.output('dataurlstring')

      mostrarModal.value = true
    } else {
      $q.notify({
        type: 'warning',
        message: i18nT('ui.no-se-encontraron-detalles-para-este-movimiento-534667'),
      })
    }
  } catch (error) {
    console.error('Error al obtener el movimiento:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.error-en-la-comunicacion-al-obtener-el-detalle-del-m-6788be'),
    })
  }
}

// ========================= MODAL ============================

const isModalOpen = ref(false)
const modalTitle = computed(() => {
  return selectedAlmacen.value?.label || i18nT('ui.todos-los-almacenes-949f2c')
})

const handleModalOk = () => {
  console.log('Modal OK button clicked!')
  // Perform actions when OK is clicked
}

const handleModalHide = () => {
  console.log('Modal closed or cancelled!')
  isModalOpen.value = false
}

// --- Lifecycle Hook ---
onMounted(async () => {
  // `rows.value` is now updated via the watch on `props.movimientos`,
  // so `fetchTableData()` (which was dummy data) is no longer explicitly needed here.
  // We rely on the parent component to provide `movimientos` prop.

  try {
    await movementStore.fetchOriginStores() // Dispatch Pinia action to load filter options
    // If there was an error in the store action, catch it here to show user feedback
    if (movementStore.errorOriginStores) {
      $q.notify({ type: 'negative', message: i18nT('ui.no-se-pudieron-cargar-los-almacenes-de-origen-7b39d3') })
    }

    console.log('Almacenes de origen cargados:', movementStore.originStores)
    if (movementStore.originStores.length === 0) {
      ShowWarningDialog.value = true
    }
  } catch (error) {
    // This catches errors re-thrown from the store (e.g., network errors)
    console.error('Error al cargar los almacenes:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.error-en-la-comunicacion-al-cargar-almacenes-de-orig-9216a1'),
    })
  }
})

const redirectToAssignment = () => {
  router.push('/asignaralmacen')
}
</script>

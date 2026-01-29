<template>
  <div class="q-pa-md">
    <q-card flat bordered class="shadow-1">
      <!-- Header Section -->
      <q-card-section class="q-pb-none">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6 text-primary row items-center">
            <q-icon name="inventory_2" class="q-mr-sm" />
            Movimientos de Almacén
          </div>
          <div>
            <q-btn
              color="primary"
              label="Agregar Nuevo"
              icon="add"
              unelevated
              @click="$emit('addRecord')"
              class="btn-res"
            />
          </div>
        </div>
      </q-card-section>

      <!-- Filters and Actions Toolbar -->
      <q-card-section class="q-pt-none">
        <div class="row q-col-gutter-md items-center">
          <!-- Almacen Select -->
          <div class="col-12 col-md-4">
            <!-- <q-select
              v-model="selectedFilterStore"
              :options="filterStores"
              id="almacen"
              label="Seleccione un Almacén"
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
            </q-select> -->
            <AlmacenSelector />
          </div>

          <!-- Search Input -->
          <div class="col-12 col-md-4">
            <q-input
              v-model="searchQuery"
              placeholder="Buscar por descripción..."
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
              label="Reporte"
              id="reportedepreciosbase"
              to="/reportedemovimientos"
              outline
              no-caps
              dense
            >
              <q-tooltip>Ir al Reporte de Movimientos</q-tooltip>
            </q-btn>

            <q-btn
              color="secondary"
              icon="list_alt"
              label="Pedidos"
              id="listaPedidosMOV"
              @click="showOrderList"
              outline
              no-caps
              dense
            >
              <q-tooltip>Ver Lista de Pedidos</q-tooltip>
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
              <q-tooltip>Vista Previa PDF</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Table -->
      <q-card-section class="q-pa-none">
        <q-table
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
            <q-td :props="props" class="text-center">
              <q-btn
                icon="shopping_cart"
                color="blue"
                dense
                flat
                round
                size="sm"
                @click="$emit('viewProductDetails', props.row)"
              >
                <q-tooltip>Añadir Productos Carrito</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:body-cell-Opciones="props">
            <q-td :props="props" class="text-center">
              <div class="row justify-center no-wrap q-gutter-xs">
                <q-btn
                  icon="visibility"
                  color="amber-8"
                  dense
                  flat
                  round
                  size="sm"
                  @click="verDetalle(props.row)"
                >
                  <q-tooltip>Ver comprobante</q-tooltip>
                </q-btn>

                <div v-if="Number(props.row.autorizacion) === 2" class="row no-wrap q-gutter-xs">
                  <q-btn
                    icon="edit"
                    color="primary"
                    dense
                    flat
                    round
                    size="sm"
                    @click="$emit('editRecord', props.row)"
                  >
                    <q-tooltip>Editar movimiento</q-tooltip>
                  </q-btn>

                  <q-btn
                    icon="delete"
                    color="negative"
                    dense
                    flat
                    round
                    size="sm"
                    @click="$emit('deleteRecord', props.row)"
                  >
                    <q-tooltip>Eliminar movimiento</q-tooltip>
                  </q-btn>

                  <q-btn
                    icon="toggle_off"
                    dense
                    flat
                    round
                    size="sm"
                    color="grey-7"
                    @click="$emit('toggleStatus', props.row)"
                  >
                    <q-tooltip>Activar movimiento</q-tooltip>
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
          <div class="text-h6 text-grey-9">Vista previa de PDF</div>
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
      title="¡Advertencia!"
      message="No tienes un almacén asignado. Debes asignarte uno o asignar un almacén a otros usuarios para desbloquear las funcionalidades del sistema."
      @accepted="redirectToAssignment"
      @closed="redirectToAssignment"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useMovementStore } from 'src/stores/movement-store'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { api } from 'src/boot/axios'
import pedidosMovimiento from './pedidosMovimiento.vue'
import AlmacenSelector from './AlmacenSelector.vue'
import RegistrarAlmacenDialog from 'src/components/RegistrarAlmacenDialog.vue'
import { useRouter } from 'vue-router'
import { PDF_LISTA_MOVIMIENTOS, PDFComprobanteMovimiento } from 'src/utils/pdfReportGenerator'
import { useAlmacenStore } from 'src/composables/movimiento/useAlmacenStore'

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
// const selectedFilterStore = ref('') // Replaced by selectedAlmacen
const rows = ref([]) // Data for the QTable

const pagination = ref({
  rowsPerPage: 10,
})

// filterStores now comes directly from the Pinia store
// This computed property will react to changes in movementStore.originStores
// const filterStores = computed(() => {
//   // Add a default "Seleccione un Almacén" option
//   return [...movementStore.originStores]
// })

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
  { name: 'indice', label: 'N°', align: 'left', field: 'indice', sortable: true },
  { name: 'Fecha', label: 'Fecha', align: 'center', field: 'fecha', sortable: true },
  {
    name: 'Almacén origen',
    label: 'Almacén origen',
    align: 'left',
    field: 'almacenOrigenName',
    sortable: true,
  },
  {
    name: 'Almacén destino',
    label: 'Almacén destino',
    align: 'left',
    field: 'almacenDestinoName',
    sortable: true,
  },
  {
    name: 'Descripción',
    label: 'Descripción',
    align: 'left',
    field: 'descripcion',
    sortable: true,
  },
  {
    name: 'Autorizacion',
    label: 'Autorización',
    align: 'center',
    field: 'autorizacionStatus',
    sortable: true,
  },
  { name: 'Detalle', label: 'Detalle', align: 'center', field: 'id', sortable: false },
  { name: 'Opciones', label: 'Opciones', align: 'center', field: 'id', sortable: false },
]

// Filter table rows based on selectedAlmacen
const filteredRows = computed(() => {
  if (!selectedAlmacen.value) {
    return []
  }
  // Access the ID safely
  const storeId = selectedAlmacen.value.value || selectedAlmacen.value.id

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
      message: 'Error al generar el PDF de movimientos.',
    })
  }
}

const showOrderList = () => {
  $q.notify({
    message: 'Mostrando Lista de Pedidos...',
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
    console.log('a qui que esta llegando',detallePedido)
  console.log('ruta donde sea hace la peticion', `${api}/comprobanteMovimiento/${row.id}/${idempresa}`)
    if (detallePedido.data) {
      // Generar el PDF usando la función centralizada
      const doc = PDFComprobanteMovimiento(detallePedido.data)
      pdfData.value = doc.output('dataurlstring')
      mostrarModal.value = true
    } else {
      $q.notify({
        type: 'warning',
        message: 'No se encontraron detalles para este movimiento.',
      })
    }

  } catch (error) {
    // This catches errors re-thrown from the store (e.g., network errors)
    console.error('Error al obtener el movimiento:', error)
    $q.notify({
      type: 'negative',
      message: 'Error en la comunicación al obtener el detalle del movimiento.',
    })
  }
}

// ========================= MODAL ============================

const isModalOpen = ref(false)
const modalTitle = computed(() => {
  return selectedAlmacen.value?.label || 'Todos los almacenes'
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
      $q.notify({ type: 'negative', message: 'No se pudieron cargar los almacenes de origen.' })
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
      message: 'Error en la comunicación al cargar almacenes de origen.',
    })
  }
})

const redirectToAssignment = () => {
  router.push('/asignaralmacen')
}
</script>

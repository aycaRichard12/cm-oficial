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
             <q-select
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
            </q-select>
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
      :initial-data="selectedFilterStore"
      @ok="handleModalOk"
      @hide="handleModalHide"
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
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { api } from 'src/boot/axios'
import { decimas } from 'src/composables/FuncionesG'
import pedidosMovimiento from './pedidosMovimiento.vue'
import RegistrarAlmacenDialog from 'src/components/RegistrarAlmacenDialog.vue'
import { useRouter } from 'vue-router'
import { PDF_LISTA_MOVIMIENTOS } from 'src/utils/pdfReportGenerator'
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

// Define emits for clarity and validation
defineEmits([
  'addRecord', // Renamed from 'cancelRecord' to match the "Agregar" button
  'generateReport',
  'viewProductDetails',
  'editRecord',
  'deleteRecord',
  'toggleStatus',
])

const searchQuery = ref('')
const selectedFilterStore = ref('')
// 'loading' ref removed, now using props.loading for table data loading
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
    if (newStores.length > 0 && !selectedFilterStore.value?.value) {
      // Find the first store that has a valid value and set it
      const firstValidStore = newStores.find((store) => store.value !== null && store.value !== '')
      if (firstValidStore) {
        selectedFilterStore.value = firstValidStore
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

// Filter table rows based on selectedFilterStore
const filteredRows = computed(() => {
  if (!selectedFilterStore.value?.value) {
    return []
  }
  const filtrado = rows.value.filter(
    (row) =>
      Number(row.idalmacenorigen) === Number(selectedFilterStore.value?.value) ||
      Number(row.idalmacendestino) === Number(selectedFilterStore.value?.value),
  )
  return filtrado.map((item, indice) => ({
    indice: indice + 1,
    ...item,
  }))
})

// --- Component-specific methods ---

const printFilteredTable = () => {
  $q.notify({
    message: `Imprimiendo tabla para el almacén: ${
      filterStores.value.find((s) => s.value === selectedFilterStore.value?.value)?.label || 'N/A'
    }`,
    color: 'blue-7',
    icon: 'print',
  })

  try {
    const contenidousuario = validarUsuario()
    const usuario = contenidousuario[0]

    const datosFormulario = {
      almacen: selectedFilterStore.value?.label,
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
    message: 'Mostrando Lista de Pedidos (función pendiente)...',
    color: 'purple-7',
  })
  isModalOpen.value = true
  // Logic to navigate to or display the order list for the selected store
}

const verDetalle = async (row) => {
  try {
    console.log(row.id)
    const contenidousuario = validarUsuario()
    const doc = new jsPDF({ orientation: 'portrait' })

    const usuario = contenidousuario[0]
    const idempresa = usuario.empresa.idempresa
    const nombreEmpresa = usuario.empresa.nombre
    const direccionEmpresa = usuario.empresa.direccion
    const telefonoEmpresa = usuario.empresa.telefono
    const logoEmpresa = usuario.empresa.logo
    const nombre = usuario.nombre
    const cargo = usuario.cargo
    const detallePedido = await api.get(`comprobanteMovimiento/${row.id}/${idempresa}`) // Dispatch Pinia action to load filter options
    console.log(detallePedido)

    const columns = [
      { header: 'N°', dataKey: 'indice' },
      { header: 'Descripción', dataKey: 'descripcion' },
      { header: 'Cantidad', dataKey: 'cantidad' },
    ]

    const detallePlano = JSON.parse(JSON.stringify(detallePedido.data))
    console.log(detallePlano.datos.detalle)
    const datos = detallePlano.datos.detalle.map((item, indice) => ({
      indice: indice + 1,
      descripcion: item.descripcion,
      cantidad: decimas(item.cantidad),
    }))
    const cantidadTotal = datos.reduce((sum, u) => {
      return sum + Number(u.cantidad)
    }, 0)
    const pieReporte = {
      descripcion: 'Total:',
      cantidad: cantidadTotal.toFixed(2),
    }
    console.log(pieReporte)
    datos.push(pieReporte)
    autoTable(doc, {
      columns,
      body: datos,
      styles: {
        overflow: 'linebreak',
        fontSize: 5,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: 255,
        halign: 'center',
      },
      columnStyles: {
        indice: { cellWidth: 15, halign: 'center' },
        descripcion: { cellWidth: 100, halign: 'left' },
        cantidad: { cellWidth: 80, halign: 'right' },
      },
      didParseCell: function (data) {
        if (data.row.index >= datos.length - 1) {
          data.cell.styles.halign = 'left'
          if (data.column.index === 1) {
            // If the current cell is in the first column
            data.cell.styles.halign = 'right' // Align that specific cell to the right
          }
        }
      },
      startY: 50,
      margin: { horizontal: 5 },
      theme: 'striped',
      didDrawPage: () => {
        if (doc.internal.getNumberOfPages() === 1) {
          if (logoEmpresa) {
            //doc.addImage(`${URL_APIE}/${logoEmpresa}`, 'PNG', 180, 8, 20, 20)
          }

          doc.setFontSize(7)
          doc.setFont(undefined, 'bold')
          doc.text(nombreEmpresa, 5, 10)

          doc.setFontSize(6)
          doc.setFont(undefined, 'normal')
          doc.text(direccionEmpresa, 5, 13)
          doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

          doc.setFontSize(10)
          doc.setFont(undefined, 'bold')
          doc.text('ORDEN PEDIDO', doc.internal.pageSize.getWidth() / 2, 15, {
            align: 'center',
          })

          doc.setDrawColor(0)
          doc.setLineWidth(0.2)
          doc.line(5, 30, 200, 30)

          doc.setFontSize(7)
          doc.setFont(undefined, 'bold')
          doc.text('DATOS ORDEN:', 5, 35)

          doc.setFontSize(6)
          doc.setFont(undefined, 'normal')
          const cliente = `${detallePlano.datos.almacenorigen} a ${detallePlano.datos.almacendestino}`
          doc.text(cliente, 5, 38)

          doc.text(detallePlano.datos.descripcion, 5, 41)

          doc.text('Fecha de Orden: ' + cambiarFormatoFecha(detallePlano.datos.fecha), 5, 47)

          doc.setFontSize(7)
          doc.setFont(undefined, 'bold')
          doc.text('DATOS DEL USUARIO:', 200, 35, { align: 'right' })

          doc.setFontSize(6)
          doc.setFont(undefined, 'normal')
          doc.text(nombre, 200, 38, { align: 'right' })
          doc.text(cargo, 200, 41, { align: 'right' })
        }
      },
    })

    pdfData.value = doc.output('dataurlstring')
    mostrarModal.value = true
  } catch (error) {
    // This catches errors re-thrown from the store (e.g., network errors)
    console.error('Error al obtener el movimiento:', error)
    $q.notify({
      type: 'negative',
      message: 'Error en la comunicación al cargar almacenes de origen.',
    })
  }
}

// ========================= MODAL ============================

const isModalOpen = ref(false)
const modalTitle = computed(() => {
  return selectedFilterStore.value?.label || 'Todos los almacenes'
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



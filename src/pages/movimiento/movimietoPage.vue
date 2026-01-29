<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <!-- <div class="text-h5 text-weight-medium text-primary">Movimientos</div> -->
    </div>
    <q-dialog v-model="showMovimientoFormDialog" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-h6 text-white flex justify-between">
          <div>{{ formDialogTitle }}</div>
          <q-btn icon="close" @click="showMovimientoFormDialog = false" flat round dense />
        </q-card-section>
        <q-card-section>
          <FormMovimiento
            :editing="formMode === 'edit'"
            :modal-value="currentMovement"
            @submit="handleFormSubmit"
            @cancel="handleFormCancel"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <table-movimiento
      :movimientos="movimientosData"
      :loading="isLoadingMovimientos"
      @addRecord="handleAddRecord"
      @generateReport="handleGenerateReport"
      @viewProductDetails="handleViewProductDetails"
      @editRecord="handleEditRecord"
      @deleteRecord="handleDeleteRecord"
      @toggleStatus="handleToggleStatus"
      @refresh="fetchMovimientos"
    />
    <q-dialog v-model="showDetalleMovimiento" persistent>
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-h6 text-white flex justify-between">
          <div>Detalle Movimiento</div>
          <q-btn icon="close" @click="cancelarDetalle" flat dense round />
        </q-card-section>
        <q-card-section>
          <DetalleMovimiento :model-value="selectedMovimiento" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue' // Import computed for formDialogTitle viewProductDetails
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales' // Ensure idusuario_md5 is imported if used
import FormMovimiento from 'src/components/movimiento/FormMovimiento.vue'
import TableMovimiento from 'src/components/movimiento/TableMovimiento.vue'
import DetalleMovimiento from 'src/components/movimiento/DetalleMovimiento.vue'
import { useMovementStore } from 'src/stores/movement-store'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
const $q = useQuasar()
const idempresa = idempresa_md5() // Needed for API calls
const idusuario = idusuario_md5() // Needed for some default values or specific logic

const movementStore = useMovementStore()

// --- States for the Table ---
const movimientosData = ref([])
const isLoadingMovimientos = ref(false)

// --- States for the Form Dialog ---
const showMovimientoFormDialog = ref(false) // Consistent with template
const formMode = ref('add') // 'add' or 'edit'
const currentMovement = ref({
  // Initial structure for new movements
  id: null,
  idusuario: idusuario, // Pass idusuario here or let FormMovimiento handle it
  ver: 'registrarMovimiento',
  fecha: '',
  descripcion: '',
  almacenorigen: null,
  almacendestino: null,
})

// Computed property for dialog title
const formDialogTitle = computed(() =>
  formMode.value === 'add' ? 'Registrar Nuevo Movimiento' : 'Editar Movimiento',
)

// --- API Methods for Movimientos --- productosDisponibles
async function fetchMovimientos() {
  isLoadingMovimientos.value = true
  try {
    const response = await api.get(`listaMovimiento/${idempresa}`) // Adjust API path if needed
    console.log('API response for movements:', response.data)

    // Ensure originStores and destinationStores are available before mapping
    // They should ideally be loaded by onMounted in the parent before this is called
    // or you could add a wait here if fetchMovimientos might be called before stores are ready.
    // However, best practice is to ensure pre-loading in onMounted.

    movimientosData.value = response.data.map((mov) => ({
      ...mov,
      // Map foreign key IDs to names from Pinia store.
      // Use '==' for loose comparison if IDs might be string vs number,
      // or ensure type consistency. '===' is generally safer.
      almacenOrigenName:
        movementStore.originStores.find((s) => s.value == mov.idalmacenorigen)?.label ||
        'Desconocido',
      almacenDestinoName:
        movementStore.destinationStores.find((s) => s.value == mov.idalmacendestino)?.label ||
        'Desconocido',
      autorizacionStatus: mov.autorizacion == 1 ? 'Autorizado' : 'Pendiente', // Assuming 1 means authorized
    }))
    console.log('Mapped movimientosData for table:', movimientosData.value)
  } catch (error) {
    console.error('Error al cargar los movimientos:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los movimientos.' })
  } finally {
    isLoadingMovimientos.value = false
  }
}

// --- Handlers for TableMovimiento Events ---

const handleAddRecord = () => {
  formMode.value = 'add'
  // Reset form data for a new record
  currentMovement.value = {
    id: null,
    ver: 'registrarMovimiento',
    idusuario: idusuario_md5(), // Assign current user
    fecha: new Date().toISOString().slice(0, 10), // Current date
    descripcion: '',
    almacenorigen: null, // Reset to null or default
    almacendestino: null, // Reset to null or default
  }
  showMovimientoFormDialog.value = true // Open the dialog
}

const handleGenerateReport = () => {
  $q.notify({
    message: 'Generando Reporte General de Movimientos...',
    color: 'green-7',
    icon: 'picture_as_pdf',
  })
  // Add your report generation logic here
}

const handleViewProductDetails = (row) => {
  showDetalleMovimiento.value = true
  selectedMovimiento.value = {
    ...row,
  }
  $q.notify({
    message: `Ver detalles de productos para el movimiento ID: ${row.id} (Lógica pendiente)`,
    color: 'info',
  })
  // Implement logic to show product details for the given movement
}

const handleEditRecord = (row) => {
  formMode.value = 'edit'
  // Deep clone the row data to avoid direct mutation issues
  //   const a = {
  //     id: '1881',
  //     fecha: '2025-06-09',
  //     idalmacenorigen: '93',
  //     almacenorigen: 'prueba_para_eliminar',
  //     idalmacendestino: '18',
  //     almacendestino: 'Almacén Fábrica',
  //     descripcion: 'ejemplow2',
  //     autorizacion: '2',
  //     codigo: '0',
  //     idusuario: '117',
  //     almacenOrigenName: 'prueba_para_eliminar',
  //     almacenDestinoName: 'Almacén Fábrica',
  //     autorizacionStatus: 'Pendiente',
  //   }

  currentMovement.value = {
    ver: 'editarMovimiento',
    idusuario: idusuario,
    fecha: row.fecha,
    descripcion: row.descripcion,
    almacenorigen: row.idalmacenorigen,
    almacendestino: row.idalmacendestino,
    id: row.id,
  }

  // Adjust field names from table row to match form data if they differ
  // Example: if table has 'idalmacenorigen' but form expects 'almacenorigen'
  if (row.idalmacenorigen && !row.almacenorigen) {
    currentMovement.value.almacenorigen = row.idalmacenorigen
  }
  if (row.idalmacendestino && !row.almacendestino) {
    currentMovement.value.almacendestino = row.idalmacendestino
  }

  showMovimientoFormDialog.value = true // Open the dialog
}

const handleDeleteRecord = async (row) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Está seguro de que desea eliminar el movimiento con N°: ${row.id}?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await api.get(`eliminarMovimiento/${row.id}`) // Replace with your actual API endpoint
      $q.notify({ message: `Movimiento N°: ${row.id} eliminado correctamente.`, color: 'positive' })
      await fetchMovimientos() // Refresh the table data
    } catch (error) {
      console.error('Error al eliminar movimiento:', error)
      $q.notify({ type: 'negative', message: 'Error al eliminar el movimiento.' })
    }
  })
}

const handleToggleStatus = async (row) => {
  console.log(row)

  $q.dialog({
    title: 'Confirmar',
    message: '¿Deseas Confirmar Este Movimiento?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    $q.notify({
      message: `Cambiando estado de autorización para el movimiento N°: ${row.id} (Lógica pendiente)`,
      color: 'grey',
    })

    try {
      const point = `actualizarEstadoMovimiento/${row.id}/1/${row.idalmacenorigen}/${row.idalmacendestino}`
      const response = await api.get(point)
      console.log(response)
      const resultado = response.data

      if (resultado.codigo == 100) {
        fetchMovimientos()
        mostrarAlertaInformacion(resultado.mensaje, resultado.estado, 'positive')
      }

      if (resultado.codigo == 99) {
        const { repetidos, diferentes } = resultado

        if (diferentes.productos?.length) {
          const descripciones = diferentes.productos.map((p) => p.descripcion).join(', ')
          mostrarAlertaInformacion(diferentes.mensaje, descripciones, 'info')
        }

        if (repetidos.productos?.length) {
          const descripciones = repetidos.productos.map((p) => p.descripcion).join(', ')
          mostrarAlertaInformacion(repetidos.mensaje, descripciones, 'info')
        }
      }

      if (resultado.codigo == 96) {
        const { debug } = resultado

        mostrarAlertaInformacion(debug.mensaje, resultado.mensaje, 'negative')
      }
      if (resultado.codigo == 97) {
        mostrarAlertaInformacion(resultado.mensaje)
      }
      if (resultado.codigo == 98) {
        const { productosfaltantes, stockfaltante } = resultado

        if (productosfaltantes.productos?.length) {
          const descripciones = productosfaltantes.productos.map((p) => p.descripcion).join(', ')
          console.log(descripciones, productosfaltantes.mensaje)
          mostrarAlertaInformacion(productosfaltantes.mensaje, descripciones, 'info')
        }

        if (stockfaltante.productos?.length) {
          const descripciones = stockfaltante.productos.map((p) => p.descripcion).join(', ')
          console.log(descripciones, stockfaltante.mensaje)

          mostrarAlertaInformacion(stockfaltante.mensaje, descripciones, 'info')
          // $q.notify({
          //   type: 'info', // 'info', 'positive', 'negative', 'warning'
          //   message: stockfaltante.mensaje,
          //   caption: descripciones, // texto secundario
          //   position: 'top', // o 'bottom', 'left', 'right'
          //   timeout: 4000,
          //   color: 'info',
          //   icon: 'info',
          // })
        }
      }
    } catch (error) {
      console.error('Error al ejecutar accion:', error)
      $q.notify({ type: 'negative', message: 'No se pudieron autorizar el pedido' })
    } finally {
      isLoadingMovimientos.value = false
    }
  })
}

// --- Handlers for FormMovimiento Events ---

const handleFormSubmit = async (formDataFromChild) => {
  const formData = objectToFormData(formDataFromChild)

  for (let [k, v] of formData.entries()) {
    console.log(`${k}:${v}`)
  }
  console.log('Form submitted with data:', formDataFromChild)
  try {
    if (formDataFromChild.isEditing) {
      // It's an edit operation
      await api.post(``, formData) // Replace with your actual API endpoint
      $q.notify({ type: 'positive', message: 'Movimiento actualizado correctamente.' })
    } else {
      // It's an add operation
      await api.post('', formData) // Replace with your actual API endpoint
      $q.notify({ type: 'positive', message: 'Movimiento registrado correctamente.' })
    }
    showMovimientoFormDialog.value = false // Close the dialog
    await fetchMovimientos() // Refresh the table data
  } catch (error) {
    console.error('Error al guardar el movimiento:', error)
    $q.notify({ type: 'negative', message: 'Error al guardar el movimiento.' })
  }
}

const handleFormCancel = () => {
  console.log('Form cancelled by user.')
  showMovimientoFormDialog.value = false // Close the dialog
}
const selectedMovimiento = ref(null) // Usaremos esta ref para pasar el objeto completo del pedido
const showDetalleMovimiento = ref(false)

function cancelarDetalle() {
  showDetalleMovimiento.value = false
  selectedMovimiento.value = null // Limpiar el pedido seleccionado si es necesario
}
const mostrarAlertaInformacion = (mensaje, detalle, tipo = 'info') => {
  $q.notify({
    type: tipo, // 'info', 'positive', 'negative', 'warning'
    message: mensaje,
    caption: detalle, // texto secundario
    position: 'top', // o 'bottom', 'left', 'right'
    timeout: 4000,
    color: tipo === 'info' ? 'blue' : tipo,
    icon: tipo === 'info' ? 'info' : tipo === 'negative' ? 'error' : 'check_circle',
  })
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    showMovimientoFormDialog.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
// --- Lifecycle Hook ---
onMounted(async () => {
  // First, load origin and destination stores into the Pinia store.
  // These are needed by both the table (for display names) and the form (for select options).
  try {
    await movementStore.fetchOriginStores()
    await movementStore.fetchDestinationStores()
  } catch (error) {
    // Errors are already notified within the store actions, but a general message here is fine.
    console.error('Error durante la carga inicial de almacenes:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar las opciones de almacenes.',
    })
  }

  // Then, fetch the main movement data for the table.
  await fetchMovimientos()
})
</script>

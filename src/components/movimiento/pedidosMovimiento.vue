<template>
  <q-dialog v-model="showDialog" @hide="onDialogHide" :maximized="true">
    <q-card
      class="q-dialog-plugin"
      :style="{ maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto' }"
    >
      <q-card-section class="bg-primary text-white row items-center no-wrap">
        <div class="text-h6">
          <strong>{{ title }}</strong>
        </div>
        <q-space />
        <q-btn icon="close" flat round dense @click="onDialogHide" />
      </q-card-section>

      <q-card-section class="q-ma-lg">
        <div class="table-responsive-container">
          <q-table
            :rows="dataRows"
            :columns="columns"
            row-key="id"
            flat
            bordered
            hide-pagination
            :rows-per-page-options="[0]"
            class="my-sticky-header-table"
          >
            <template v-slot:header-cell-indice="props">
              <q-th :props="props" class="text-nowrap">
                {{ props.col.label }}
              </q-th>
            </template>
            <template v-slot:header-cell-fecha="props">
              <q-th :props="props" class="text-nowrap">
                {{ props.col.label }}
              </q-th>
            </template>
            <template v-slot:header-cell-destino="props">
              <q-th :props="props" class="text-nowrap">
                {{ props.col.label }}
              </q-th>
            </template>
            <template v-slot:header-cell-observacion="props">
              <q-th :props="props" class="text-nowrap">
                {{ props.col.label }}
              </q-th>
            </template>
            <template v-slot:header-cell-opciones="props">
              <q-th :props="props" class="text-nowrap">
                {{ props.col.label }}
              </q-th>
            </template>

            <template v-slot:body-cell-opciones="props">
              <q-td :props="props" class="text-nowrap">
                <q-btn
                  icon="visibility"
                  color="info"
                  size="sm"
                  class="q-mr-xs"
                  title="VER PEDIDO"
                  @click="emitAction('view', props.row)"
                />
                <q-btn
                  icon="cancel"
                  color="negative"
                  size="sm"
                  class="q-mr-xs"
                  title="DESCARTAR PEDIDO"
                  @click="emitAction('discard', props.row)"
                />
                <q-btn
                  icon="check_circle_outline"
                  color="positive"
                  size="sm"
                  title="PROCESAR PEDIDO"
                  @click="emitAction('process', props.row)"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-indice="props">
              <q-td :props="props" class="text-nowrap">
                {{ props.value }}
              </q-td>
            </template>
            <template v-slot:body-cell-fecha="props">
              <q-td :props="props" class="text-nowrap">
                {{ props.value }}
              </q-td>
            </template>
            <template v-slot:body-cell-destino="props">
              <q-td :props="props" class="text-nowrap">
                {{ props.value }}
              </q-td>
            </template>
            <template v-slot:body-cell-observacion="props">
              <q-td :props="props" class="text-nowrap">
                {{ props.value }}
              </q-td>
            </template>
          </q-table>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="text-primary q-pt-none">
        <q-btn flat label="OK" @click="onDialogOK" />
        <q-btn flat @click="onDialogHide"> <q-icon class="q-mr-xs" />Cerrar </q-btn>
      </q-card-actions>
    </q-card>
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
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed, onMounted } from 'vue' // Import computed and watch
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
// import { validarUsuario } from 'src/composables/FuncionesG'
// import jsPDF from 'jspdf'
// import autoTable from 'jspdf-autotable'
// import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
// //import { URL_APIE } from 'src/composables/services'
// import { decimas } from 'src/composables/FuncionesG'
import imprimirReporte from 'src/utils/pdfReportGenerator'
const idusuario = idusuario_md5()
//import { generatePdfReport } from 'src/utils/pdfReportGenerator'
const idempresa = idempresa_md5()
const $q = useQuasar()
const pdfData = ref(null)
const mostrarModal = ref(false)
// const tipo = { 1: 'Pedido Compra', 2: 'Pedido Movimiento' }

// Define Props
const props = defineProps({
  title: {
    type: String,
    default: 'Tabla de Datos',
  },
  initialData: {
    type: Object,
  },
})

// Define Emits
const emit = defineEmits(['ok', 'hide'])

// Reactive state
const showDialog = ref(true) // Controls the visibility of the dialog
const detallePedido = ref([])
// Define table columns
const columns = [
  { name: 'indice', required: true, label: 'N°', align: 'left', field: 'indice', sortable: true },
  { name: 'fecha', required: true, label: 'Fecha', align: 'left', field: 'fecha', sortable: true },
  {
    name: 'destino',
    required: true,
    label: 'Destino',
    align: 'left',
    field: 'destino',
    sortable: true,
  },
  {
    name: 'observacion',
    required: true,
    label: 'Observación',
    align: 'left',
    field: 'observacion',
    sortable: true,
  },
  { name: 'opciones', label: 'Opciones', align: 'center', field: 'opciones' },
]
const tableData = ref([])
const almacen = props.initialData
const getPedidos = async () => {
  // Add a guard clause: only proceed if selectedFilterStore.value is valid
  if (!almacen.value) {
    console.warn('selectedFilterStore is not yet defined, skipping API call.')
    tableData.value = [] // Clear table data if filter is not ready
    return
  }
  try {
    const response = await api.get(`listaPedido/${idempresa}`)
    console.log('Raw API response:', response.data)
    console.log('selectedFilterStore.value.value for filter:', almacen.value)
    const filtrado = response.data.filter((u) => {
      const x = Number(u.idalmacenorigen) === Number(almacen.value) // No need for ?. after guard clause
      const y = Number(u.estado) === 2
      const z = Number(u.autorizacion) === 1
      return x && y && z
    })
    tableData.value = filtrado
    console.log('Filtered data:', tableData.value)
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
// --- SOLUTION: Use a computed property for dataRows ---
const dataRows = computed(() => {
  console.log('Re-mapping dataRows from initialData:', props.initialData) // For debugging
  return tableData.value.map((item, index) => ({
    id: item.id,
    indice: index + 1,
    fecha: item.fecha,
    destino: item.almacen, // Make sure 'almacen' exists on item, if not use a fallback
    observacion: item.observacion,
    estado: item.estado,
    autorizacion: item.autorizacion,
    codigo: item.codigo,
    idalmacen: item.idalmacen,
    tipopedido: item.tipopedido,
    idalmacenorigen: item.idalmacenorigen,
    almacenorigen: item.almacenorigen,
    idusuario: item.idusuario,
    nropedido: item.nropedido,
    ruta: item.ruta,
  }))
})

const onDialogHide = () => {
  showDialog.value = false
  emit('hide')
}

const onDialogOK = () => {
  emit('ok')
  onDialogHide() // Close the dialog after OK
}

const emitAction = (actionType, row) => {
  if (actionType === 'view') {
    // Implement view logic
    verDetalle(row)
  } else if (actionType === 'discard') {
    // Implement discard logic
    console.log('Discarding item:', row.id)
    discarding(row)
  } else if (actionType === 'process') {
    processing(row)
    console.log('Processing item:', row.id)
  }
}
async function processing(row) {
  console.log(row)
  $q.dialog({
    title: '¿Estás seguro de que deseas realizar esta acción? Es irreversible.', // Title of the dialog
    message: 'Esto creara un nuevo registro de movimiento con los datos del pedido', // The main message
    persistent: true, // User must explicitly choose OK or Cancel, cannot dismiss by clicking outside
    color: 'positive', // Sets the color of the OK button (and some other elements depending on theme)
    // Optional: You can add other Quasar button properties to the OK/Cancel buttons
    ok: {
      label: 'Sí, continuar',
      color: 'positive',
      flat: false, // Make it a filled button
    },
    cancel: {
      label: 'No, cancelar',
      color: 'negative',
      flat: true, // Make it a flat button
    },
  })
    .onOk(async () => {
      // This code runs if the user clicks "Sí, continuar" (OK)
      const endpoint = `cambiarEstadoPedido/${row.id}/1/${idusuario}`

      const result = await api.get(endpoint) // Using api.get as per your original code
      const resultado = result.data
      console.log(result)
      $q.dialog({
        title: 'Pedido Registrado', // Use title here for a dialog
        message: resultado.detalles.lista || 'El pedido ha sido descartado exitosamente.',
        color: 'positive', // Sets button color
        ok: true, // Just show a single 'OK' button
        persistent: false, // User can dismiss it
      })

      // Call your actual action function here, e.g., performDeletion();
    })
    .onCancel(() => {
      // This code runs if the user clicks "No, cancelar" (Cancel)
      // or presses Escape, or clicks outside if `persistent` is false
      $q.notify({
        type: 'info',
        message: 'Acción cancelada.',
        icon: 'cancel',
      })
    })
    .onDismiss(() => {
      // This code runs regardless of how the dialog was dismissed (OK, Cancel, Escape, outside click)
      console.log('Dialog dismissed')
    })
}
async function discarding(row) {
  console.log(row)
  $q.dialog({
    title: '¿Estás seguro de que deseas realizar esta acción? Es irreversible.', // Title of the dialog
    message: 'No podra usar este pedido al descartarlo', // The main message
    persistent: true, // User must explicitly choose OK or Cancel, cannot dismiss by clicking outside
    color: 'negative', // Sets the color of the OK button (and some other elements depending on theme)
    // Optional: You can add other Quasar button properties to the OK/Cancel buttons
    ok: {
      label: 'Sí, continuar',
      color: 'positive',
      flat: false, // Make it a filled button
    },
    cancel: {
      label: 'No, cancelar',
      color: 'negative',
      flat: true, // Make it a flat button
    },
  })
    .onOk(async () => {
      // This code runs if the user clicks "Sí, continuar" (OK)
      const endpoint = `cambiarEstadoPedido/${row.id}/3/${idusuario}`

      const result = await api.get(endpoint) // Using api.get as per your original code
      const resultado = result.data
      console.log(result)
      $q.dialog({
        title: 'Pedido Descartado', // Use title here for a dialog
        message: resultado.detalles || 'El pedido ha sido descartado exitosamente.',
        color: 'positive', // Sets button color
        ok: true, // Just show a single 'OK' button
        persistent: false, // User can dismiss it
      })

      // Call your actual action function here, e.g., performDeletion();
    })
    .onCancel(() => {
      // This code runs if the user clicks "No, cancelar" (Cancel)
      // or presses Escape, or clicks outside if `persistent` is false
      $q.notify({
        type: 'info',
        message: 'Acción cancelada.',
        icon: 'cancel',
      })
    })
    .onDismiss(() => {
      // This code runs regardless of how the dialog was dismissed (OK, Cancel, Escape, outside click)
      console.log('Dialog dismissed')
    })
}
const verDetalle = async (row) => {
  console.log(row)
  await getDatallePedido(row.id)
  if (detallePedido.value) {
    const doc = imprimirReporte(detallePedido)
    pdfData.value = doc.output('dataurlstring')
    mostrarModal.value = true
  } else {
    $q.notify({
      type: 'negative',
      message: 'Pedido  sin items',
    })
  }
}

const getDatallePedido = async (id) => {
  try {
    const response = await api.get(`getPedido_/${id}/${idempresa}`) // Cambia a tu ruta real
    console.log(response.data)
    detallePedido.value = response.data
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los datos',
    })
  }
}
onMounted(() => {
  getPedidos()
  console.log(props.initialData)
})
</script>

<style lang="scss" scoped>
.q-dialog-plugin {
  // Max-width from your swal2-popup
  max-width: 1824px;
  // Margin from your swal2-popup, adjust as needed or let Quasar handle it
  margin-left: 656px;
  margin-right: auto;
}

.table-responsive-container {
  max-height: calc(100vh - 200px); /* Adjust based on dialog height */
  overflow-y: auto;
  width: 100%;
}

// For text-nowrap on table cells
.text-nowrap {
  white-space: nowrap;
}

// Apply background to thead similar to .thead-dark
// Quasar's QTable handles thead styling implicitly, but you can override
.q-table__container {
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th {
    /* bg-dark equivalent for thead */
    //background-color: var(--q-primary); // Or a specific dark color like #343a40
    color: rgb(0, 0, 0);
  }
}
</style>

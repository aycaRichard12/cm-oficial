<template>
  <div class="q-gutter-md">
    <div class="row items-center justify-between q-mt-lg">
      <div class="col-auto flex flex-col gap-3">
        <div class="col-12 col-md-4 q-mt-lg">
          <q-btn color="primary" @click="$emit('addRecord')" class="btn-res">
            <q-icon name="add" class="icono" />
            <span class="texto">Agregar</span>
          </q-btn>
        </div>

        <q-btn
          color="secondary"
          class="btn-res q-mt-lg"
          id="reportedepreciosbase"
          to="/reportedemovimientos"
          icon="assessment"
          label="Reporte de Movimientos"
          no-caps
        />
      </div>

      <div class="col-8 col-md-3">
        <label for="almacen">Seleccione un Almacén</label>
        <q-select
          v-model="selectedFilterStore"
          :options="filterStores"
          id="almacen"
          map-options
          class="q-mr-sm"
          dense
          outlined
          clearable
        />
      </div>

      <q-btn
        color="info"
        @click="printFilteredTable"
        id="generarReporteMOV"
        title="Imprimir tabla del almacén seleccionado"
        class="btn-res"
      >
        <q-icon name="picture_as_pdf" class="icono" />
        <span class="texto">Vista Previa PDF</span>
      </q-btn>
    </div>

    <div class="row flex justify-between">
      <div>
        <q-btn
          color="secondary"
          label="Lista de Pedidos"
          @click="showOrderList"
          id="listaPedidosMOV"
          title="Lista de Pedidos del almacén seleccionado"
          class="q-mt-lg"
        />
      </div>

      <div>
        <label for="buscar">Buscar...</label>
        <q-input
          v-model="searchQuery"
          placeholder="Buscar..."
          dense
          outlined
          debounce="300"
          class="q-mb-md"
          style="background-color: white"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <q-table
      :rows="filteredRows"
      :columns="columns"
      row-key="id"
      :loading="props.loading || movementStore.isLoadingOriginStores"
      :filter="searchQuery"
      v-model:pagination="pagination"
      flat
      bordered
      title="Movimientos Almacén"
    >
      <template v-slot:top-right> </template>
      <template v-slot:body-cell-Autorizacion="props">
        <q-td :props="props">
          <q-badge :color="props.row.autorizacionStatus === 'Autorizado' ? 'green' : 'red'">{{
            props.row.autorizacionStatus
          }}</q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-Detalle="props">
        <q-td :props="props">
          <q-btn
            icon="shopping_cart"
            color="blue"
            dense
            flat
            title="Añadir Productos Carrito"
            @click="$emit('viewProductDetails', props.row)"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-Opciones="props">
        <q-td :props="props">
          <div v-if="Number(props.row.autorizacion) === 2">
            <q-btn
              title="Ver comprobante"
              size="sm"
              icon="visibility"
              color="amber-11"
              flat
              @click="verDetalle(props.row)"
            />

            <q-btn
              icon="edit"
              color="primary"
              dense
              flat
              @click="$emit('editRecord', props.row)"
              title="Editar movimiento"
            />

            <q-btn
              icon="delete"
              color="negative"
              dense
              flat
              @click="$emit('deleteRecord', props.row)"
              title="Eliminar movimiento"
            />

            <q-btn
              icon="toggle_off"
              dense
              flat
              color="grey"
              @click="$emit('toggleStatus', props.row)"
              title="Activar movimiento"
            />
          </div>
          <div v-else>
            <q-btn
              size="sm"
              title="Ver comprobante"
              icon="visibility"
              flat
              @click="verDetalle(props.row)"
            />
          </div>
        </q-td>
      </template>
    </q-table>
  </div>
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
  <pedidosMovimiento
    v-if="isModalOpen"
    :title="modalTitle"
    :initial-data="selectedFilterStore"
    @ok="handleModalOk"
    @hide="handleModalHide"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useMovementStore } from 'src/stores/movement-store'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { validarUsuario } from 'src/composables/FuncionesGenerales'
import { cambiarFormatoFecha, obtenerFechaActualDato } from 'src/composables/FuncionesG'
import { api } from 'src/boot/axios'
import { decimas } from 'src/composables/FuncionesG'
import pedidosMovimiento from './pedidosMovimiento.vue'
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
      // Find the first store that is not the placeholder and set it
      const firstValidStore = newStores.find((store) => store.value !== '')
      if (firstValidStore.value) {
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
  console.log(selectedFilterStore.value)
  if (!selectedFilterStore.value?.value) {
    return rows.value
  }
  const filtrado = rows.value.filter(
    (row) =>
      row.idalmacenorigen == selectedFilterStore.value?.value ||
      row.idalmacendestino == selectedFilterStore.value?.value,
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
  const contenidousuario = validarUsuario()
  const doc = new jsPDF({ orientation: 'portrait' })

  const idempresa = contenidousuario[0]
  const nombreEmpresa = idempresa.empresa.nombre
  const direccionEmpresa = idempresa.empresa.direccion
  const telefonoEmpresa = idempresa.empresa.telefono
  const logoEmpresa = idempresa.empresa.logo // Ruta relativa o base64
  const nombre = idempresa.nombre
  const cargo = idempresa.cargo
  const columns = [
    { header: 'N', dataKey: 'indice' },
    { header: 'Fecha', dataKey: 'fecha' },
    { header: 'Almacén Origen', dataKey: 'almacenOrigenName' },

    { header: 'Almacén Destino', dataKey: 'almacenDestinoName' },
    { header: 'Descripción', dataKey: 'descripcion' },

    { header: 'Esatado', dataKey: 'estado' },
  ]

  const datos = filteredRows.value.map((item, indice) => ({
    indice: indice + 1,
    fecha: item.fecha,
    almacenOrigenName: item.almacenOrigenName,
    almacenDestinoName: item.almacenDestinoName,
    descripcion: item.descripcion,
    estado: item.autorizacion == 2 ? 'No Autorizado' : 'Autorizado',
  }))

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
      indice: { cellWidth: 10, halign: 'center' },
      fecha: { cellWidth: 15, halign: 'center' },
      almacenOrigenName: { cellWidth: 50, halign: 'left' },
      almacenDestinoName: { cellWidth: 50, halign: 'left' },
      descripcion: { cellWidth: 50, halign: 'left' },

      estado: { cellWidth: 20, halign: 'center' },
    },
    //20 + 15 + 20 + 25 + 30 + 20 + 20 + 25 + 20 + 15 + 20 + 15 + 20 = 265 mm

    startY: 45,
    margin: { horizontal: 5 },
    theme: 'striped',
    didDrawPage: () => {
      if (doc.internal.getNumberOfPages() === 1) {
        // Logo (requiere base64 o ruta absoluta en servidor si usas Node)
        if (logoEmpresa) {
          //doc.addImage(`${URL_APIE}${logoEmpresa}`, 'PNG', 180, 8, 20, 20)
        }

        // Nombre y datos de empresa
        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text(nombreEmpresa, 5, 10)

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(direccionEmpresa, 5, 13)
        doc.text(`Tel: ${telefonoEmpresa}`, 5, 16)

        // Título centrado
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('MOVIMIENTOS', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' })

        doc.setDrawColor(0) // Color negro
        doc.setLineWidth(0.2) // Grosor de la línea
        doc.line(5, 30, 200, 30) // De (x1=5, y1=25) a (x2=200, y2=25)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL REPORTE', 5, 35)
        console.log(selectedFilterStore.value)
        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(
          'Nombre del Almacen: ' + (selectedFilterStore.value?.label || 'Todos los Almacenes'),
          5,
          38,
        )

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text('Fecha de Impresion: ' + cambiarFormatoFecha(obtenerFechaActualDato()), 5, 41)

        doc.setFontSize(7)
        doc.setFont(undefined, 'bold')
        doc.text('DATOS DEL ENCARGADO:', 200, 35, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(nombre, 200, 38, { align: 'right' })

        doc.setFontSize(6)
        doc.setFont(undefined, 'normal')
        doc.text(cargo, 200, 41, { align: 'right' })
      }
    },
  })

  // doc.save('proveedores.pdf') ← comenta o elimina esta línea
  //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
  pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
  mostrarModal.value = true
  // Logic to print the filtered table (e.g., generate PDF of current table data)
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
  } catch (error) {
    // This catches errors re-thrown from the store (e.g., network errors)
    console.error('Error al cargar los almacenes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error en la comunicación al cargar almacenes de origen.',
    })
  }
})
</script>

<style lang="sass">
.my-sticky-header-table
  height: 500px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    background-color: #fff

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  &.q-table--loading thead tr:last-child th
    top: 48px
</style>

<template>
  <div class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="col-auto row q-gutter-x-md items-center">
        <q-select
          filled
          v-model="filtroAlmacen"
          :options="almacenes"
          label="Almacén"
          emit-value
          map-options
          class="q-ml-md"
          style="min-width: 200px"
          clearable
          id="filtroAlmacenMOV"
        />
        <q-select
          filled
          v-model="filtroEstado"
          :options="estados"
          label="Estado"
          emit-value
          map-options
          class="q-ml-md"
          style="min-width: 200px"
          clearable
          id="filtroEstadoMOV"
        />
      </div>

      <div class="col-auto row items-center">
        <q-btn
          color="info"
          label="Imprimir"
          icon="print"
          @click="printFilteredTable"
          id="generarReporteMOV"
          class="q-mr-lg"
          title="Imprimir tabla del almacén seleccionado"
        />
        <q-select
          filled
          v-model="filtroColumna"
          :options="columnas"
          label="Filtrar por"
          emit-value
          map-options
          style="min-width: 200px"
          clearable
          id="filtroColumnaMOV"
        />

        <q-input
          filled
          v-model="busqueda"
          placeholder="Buscar"
          debounce="300"
          style="min-width: 250px"
        >
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <q-table
      :rows="filteredAndSearchedRows"
      :columns="columnasTabla"
      row-key="id"
      flat
      bordered
      :loading="loading"
      no-data-label="No hay datos disponibles"
      loading-label="Cargando datos..."
    >
      <template #body-cell-opciones="props">
        <q-td :props="props">
          <q-btn
            color="info"
            size="sm"
            icon="bookmark_add"
            title="VER LISTADO DE COBROS"
            @click="verPagos(props.row)"
          />
          <q-btn
            v-if="props.row.estado === 1 || props.row.estado === 3"
            color="primary"
            size="sm"
            icon="add_circle"
            title="REGISTRAR COBRO DE CREDITO"
            class="q-ml-sm"
            @click="registrarCobro(props.row)"
          />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { decimas } from 'src/composables/FuncionesG'
import { redondear } from 'src/composables/FuncionesG'
const $q = useQuasar()

// Reactive variables for filters and data
const filtroAlmacen = ref(0)
const filtroEstado = ref(0)
const filtroColumna = ref(0)
const busqueda = ref('')
const rows = ref([]) // Data for the q-table
const loading = ref(false) // Loading state for the table

// Options for filters (already defined in your original code)
const almacenes = [
  { label: 'Todos los almacenes', value: 0 },
  { label: 'Almacén Fábrica', value: 18 },
  { label: 'ALMACEN_1', value: 103 },
  { label: 'Real', value: 97 },
  { label: 'prueba_para_eliminar', value: 93 },
]

const estados = [
  { label: 'Todos', value: 0 },
  { label: 'Activos', value: 1 },
  { label: 'Finalizados', value: 2 },
  { label: 'Atrasados', value: 3 },
  { label: 'Anulados', value: 4 },
]

const columnas = [
  { label: 'Todo', value: 0 },
  { label: 'Cliente', value: 1 },
  { label: 'N° factura', value: 2 },
  { label: 'Fecha crédito', value: 3 },
  { label: 'Vencimiento', value: 4 },
  { label: 'N° cuotas', value: 5 },
  { label: 'N° cuotas Procesadas', value: 6 },
  { label: 'Total venta', value: 7 },
  { label: 'Total cobrado', value: 8 },
  { label: 'Saldo', value: 9 },
  { label: 'Estado', value: 10 },
]

// Column definitions for q-table (already defined in your original code)
const columnasTabla = [
  { name: 'index', label: 'N°', align: 'center', field: (row, index) => index + 1 },
  { name: 'cliente', label: 'Cliente', align: 'left', field: 'cliente' },
  { name: 'factura', label: 'N° factura', align: 'right', field: 'nfactura' }, // Changed to nfactura as per API response
  {
    name: 'fechaCredito',
    label: 'Fecha crédito',
    align: 'right',
    field: (row) => cambiarFormatoFecha(row.fechaventa),
  }, // Mapped with formatting function
  {
    name: 'vencimiento',
    label: 'Vencimiento',
    align: 'right',
    field: (row) => cambiarFormatoFecha(row.fechalimite),
  }, // Mapped with formatting function
  { name: 'cuotas', label: 'N° cuotas', align: 'right', field: 'ncuotas' },
  {
    name: 'cuotasProcesadas',
    label: 'N° cuotas procesadas',
    align: 'right',
    field: (row) => (row.cuotaspagas == null ? 0 : row.cuotaspagas), // Handle null
  },
  {
    name: 'totalVenta',
    label: 'Total venta',
    align: 'right',
    field: (row) => decimas(redondear(parseFloat(row.ventatotal))),
  },
  {
    name: 'totalCobrado',
    label: 'Total cobrado',
    align: 'right',
    field: (row) =>
      row.totalcobrado == null ? '0.00' : decimas(redondear(parseFloat(row.totalcobrado))),
  },
  {
    name: 'saldo',
    label: 'Saldo',
    align: 'right',
    field: (row) => decimas(redondear(parseFloat(row.saldo))),
  },
  {
    name: 'estado',
    label: 'Estado',
    align: 'center',
    field: 'estado',
    format: (val) => {
      const estadosMap = { 1: 'Activo', 2: 'Finalizado', 3: 'Atrasado', 4: 'Anulado' }
      return estadosMap[val] || 'Desconocido'
    },
  },
  { name: 'opciones', label: 'Opciones', align: 'center' },
]

// Function to fetch and process data

// Filtered and searched data for the q-table
const filteredAndSearchedRows = computed(() => {
  let dataToFilter = rows.value

  // Apply search filter
  if (busqueda.value) {
    const term = busqueda.value.toLowerCase()
    dataToFilter = dataToFilter.filter((row) => {
      if (filtroColumna.value === 0) {
        // Search all fields if no specific column is selected
        return Object.values(row).some((val) => String(val).toLowerCase().includes(term))
      } else {
        // Search only the selected column
        const campos = [
          'cliente',
          'nfactura', // Use nfactura as per API
          'fechaventa', // Use fechaventa as per API
          'fechalimite', // Use fechalimite as per API
          'ncuotas',
          'cuotaspagas', // Use cuotaspagas as per API
          'ventatotal', // Use ventatotal as per API
          'totalcobrado', // Use totalcobrado as per API
          'saldo',
          'estado',
        ]
        const campoSeleccionado = campos[filtroColumna.value - 1]

        // Handle potential null/undefined values and string conversion for search
        const valueToSearch = row[campoSeleccionado]
        return valueToSearch !== undefined && valueToSearch !== null
          ? String(valueToSearch).toLowerCase().includes(term)
          : false
      }
    })
  }
  return dataToFilter
})

// Functions for actions
const verPagos = (row) => {
  console.log('Ver pagos de:', row)
  // Implement navigation or dialog to show payments for the selected row
  $q.notify({
    type: 'info',
    message: `Ver pagos para la factura N° ${row.nfactura} del cliente ${row.cliente}.`,
  })
}

const registrarCobro = (row) => {
  console.log('Registrar cobro para:', row)
  // Implement logic to open a form or dialog for registering a payment
  $q.notify({
    type: 'positive',
    message: `Registrar cobro para la factura N° ${row.nfactura}.`,
  })
}

const printFilteredTable = () => {
  // Logic to print the filtered table. You might use a library like 'html2pdf' or similar.
  console.log('Imprimir tabla filtrada:', filteredAndSearchedRows.value)
  $q.notify({
    type: 'info',
    message: 'Funcionalidad de impresión no implementada en este ejemplo.',
  })
}

// Lifecycle hook to fetch data on component mount

// Watchers for filter changes to refetch data

// You can add a watcher for `busqueda` and `filtroColumna` if you want searching to trigger a re-fetch from the API,
// but currently, searching is done on the client-side using `filteredAndSearchedRows` computed property.
// If your dataset is very large, consider implementing server-side searching.
</script>

<style scoped>
/* Add any component-specific styles here if needed */
</style>

<template>
  <div v-if="vistaTransacciones">
    <div class="row q-col-gutter-x-md">
      <q-btn
        icon="arrow_back_ios"
        color="primary"
        label="Volver"
        dense
        text-color="white"
        @click="vistaTransacciones = false"
      />
    </div>
    <transaccionesPague :pago="pago" />
  </div>
  <div v-else>
    <div class="titulo">Reporte de Pagos</div>
    <q-form>
      <div class="row q-col-gutter-md" style="display: flex; justify-content: center">
        <div class="col-12 col-md-4">
          <label for="fechaIni">Fecha Inicial*</label>
          <q-input v-model="fechaIni" type="date" class="col-md-4" dense outlined />
        </div>
        <div class="col-12 col-md-4">
          <label for="fechafin">Fecha Final*</label>
          <q-input v-model="fechafin" type="date" dense outlined="" class="col-md-4" />
        </div>
      </div>
      <div class="q-mt-md" style="display: flex; justify-content: center">
        <q-btn color="primary" label="Generar reporte" @click="generarReporte" class="q-mr-sm" />
        <q-btn color="secondary" label="Exportar a Excel" @click="exportarExcel" />
      </div>
    </q-form>
    <!-- Sección de Filtros -->

    <div class="row q-col-gutter-md q-mb-md">
      <!-- Filtro por Almacén -->
      <div class="col-12 col-md-4">
        <label for="almacen">Almacén</label>
        <q-select
          outlined
          dense
          v-model="filterAlmacen"
          :options="almacenOptions"
          id="almacen"
          clearable
          emit-value
          map-options
        />
      </div>
      <!-- Filtro por Proveedor -->
      <div class="col-12 col-md-4">
        <label for="pro">Proveedor</label>
        <q-select
          outlined
          dense
          v-model="filterProveedor"
          :options="proveedorOptions"
          id="pro"
          clearable
          emit-value
          map-options
        />
      </div>
      <!-- Filtro por Estado -->
      <div class="col-12 col-md-4">
        <label for="estado">Estado</label>
        <q-select
          outlined
          dense
          v-model="filterEstado"
          :options="estadoOptions"
          id="estado"
          clearable
          emit-value
          map-options
        />
      </div>
    </div>

    <!-- Tabla de Datos -->
    <q-table
      :rows="filteredRows"
      :columns="columns"
      row-key="id_pago"
      :loading="loading"
      :rows-per-page-options="[10, 25, 50]"
      flat
      bordered
    >
      <!-- Slot para personalizar la celda de Estado -->
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-chip
            :color="props.row.estado_pago === 1 ? 'green' : 'orange'"
            text-color="white"
            dense
            class="text-weight-bold"
          >
            {{ props.row.estado_pago === 1 ? 'Concluido' : 'En Proceso' }}
          </q-chip>
        </q-td>
      </template>

      <!-- Slot para personalizar la celda de Acción -->
      <template v-slot:body-cell-accion="props">
        <q-td :props="props">
          <q-btn color="primary" icon="add" dense round @click="realizarPago(props.row)" />
          <q-btn
            color="blue"
            icon="list_alt"
            dense
            round=""
            @click="mostrardetalleCredito(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:no-data>
        <div class="full-width row flex-center text-primary q-gutter-sm text-body1">
          <span> No se encontraron resultados para los filtros seleccionados. </span>
        </div>
      </template>
    </q-table>
  </div>

  <q-dialog v-model="mdpagarCueota">
    <q-card class="responsive-dialog">
      <div class="bg-primary text-white text-h6 flex justify-end">
        <q-btn icon="close" dense flat rounded @click="mdpagarCueota = false" />
      </div>
      <CuotasPage :pago="pago" @actualizar="fetchData" />
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { obtenerFechaActualDato } from 'src/composables/FuncionesG'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import CuotasPage from './CuotasPage.vue'
import transaccionesPague from './transaccionesPague.vue'
const idempresa = idempresa_md5()
const fechaIni = ref(obtenerFechaActualDato())
const fechafin = ref(obtenerFechaActualDato())
const vistaTransacciones = ref(false)
// --- Estado y Notificaciones ---
const $q = useQuasar()
const loading = ref(false)
const mdpagarCueota = ref(false)
// --- Datos y Columnas de la Tabla ---
const allRows = ref([]) // Almacena todos los datos originales de la API
const pago = ref({})
const columns = [
  { name: 'nrofactura', label: 'Factura', align: 'left', field: 'nrofactura', sortable: true },
  { name: 'almacen', label: 'Almacén', align: 'left', field: 'almacen', sortable: true },
  { name: 'proveedor', label: 'Proveedor', align: 'left', field: 'proveedor', sortable: true },
  { name: 'fecha', label: 'Fecha', align: 'center', field: 'fecha', sortable: true },
  { name: 'codigo', label: 'Código', align: 'left', field: 'codigo', sortable: true },
  { name: 'nro_cuotas', label: 'Cuotas', align: 'center', field: 'nro_cuotas', sortable: true },
  {
    name: 'monto_total',
    label: 'Monto Total',
    align: 'right',
    field: 'monto_total',
    sortable: true,
    format: (val) => `${parseFloat(val).toFixed(2)}`,
  },
  {
    name: 'saldo_actual',
    label: 'Saldo',
    align: 'right',
    field: 'saldo_actual',
    sortable: true,
    format: (val) => `${parseFloat(val).toFixed(2)}`,
  },
  { name: 'estado', label: 'Estado', align: 'center', field: 'estado_pago', sortable: true },
  { name: 'accion', label: 'Acción', align: 'center', field: 'accion' },
]

// --- Modelos para los Filtros ---
const filterAlmacen = ref(null)
const filterProveedor = ref(null)
const filterEstado = ref(null)

// --- Opciones para los Selects de Filtro ---

// Opciones de estado (estáticas)
const estadoOptions = [
  { label: 'Concluido', value: 1 },
  { label: 'En Proceso', value: 2 },
]

// Opciones de almacén (dinámicas)
const almacenOptions = computed(() => {
  const almacenes = [...new Set(allRows.value.map((item) => item.almacen))]
  return almacenes.map((almacen) => ({ label: almacen, value: almacen }))
})

// Opciones de proveedor (dinámicas)
const proveedorOptions = computed(() => {
  const proveedores = [...new Set(allRows.value.map((item) => item.proveedor))]
  return proveedores.map((prov) => ({ label: prov, value: prov }))
})

// --- Lógica de Carga de Datos ---
onMounted(() => {
  fetchData()
})
async function generarReporte() {
  fetchData()
}

async function fetchData() {
  loading.value = true
  const apiUrl = `generarReportePagos/${fechaIni.value}/${fechafin.value}/${idempresa}`
  try {
    const response = await api.get(apiUrl)
    console.log(response.data)
    allRows.value = response.data
  } catch (error) {
    console.error('Error al obtener los datos de la API:', error)
    $q.notify({
      color: 'negative',
      position: 'top',
      message: 'No se pudieron cargar los datos. Por favor, intente más tarde.',
      icon: 'report_problem',
    })
  } finally {
    loading.value = false
  }
}

// --- Lógica de Filtrado ---
const filteredRows = computed(() => {
  let data = allRows.value

  // Filtrar por almacén
  if (filterAlmacen.value) {
    data = data.filter((row) => row.almacen === filterAlmacen.value)
  }

  // Filtrar por proveedor
  if (filterProveedor.value) {
    data = data.filter((row) => row.proveedor === filterProveedor.value)
  }

  // Filtrar por estado
  if (filterEstado.value !== null && filterEstado.value !== undefined) {
    data = data.filter((row) => row.estado_pago === filterEstado.value)
  }

  return data
})
function mostrardetalleCredito(item) {
  console.log(item)
  pago.value = item
  vistaTransacciones.value = true
}
// --- Acciones de la Tabla ---
function realizarPago(item) {
  pago.value = item
  console.log('Realizando pago para:', item)
  $q.notify({
    color: 'positive',
    position: 'bottom',
    message: `Iniciando proceso de pago para la factura #${item.nrofactura} del proveedor ${item.proveedor}.`,
    icon: 'payment',
  })
  mdpagarCueota.value = !mdpagarCueota.value
}
</script>

<style>
/* Estilos para asegurar que la página ocupe todo el espacio disponible */
.q-page {
  display: flex;
  flex-direction: column;
}
</style>

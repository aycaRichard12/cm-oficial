<template>
  <div v-if="vistaTransacciones">
    <div class="row q-col-gutter-x-md q-mb-md">
      <q-btn
        icon="arrow_back_ios"
        color="primary"
        :label="$t('ui.volver-84a715')"
        dense
        text-color="white"
        @click="vistaTransacciones = false"
      />
      <q-btn
        icon="refresh"
        color="primary"
        :label="$t('ui.recargar-9d2c9d')"
        dense
        text-color="white"
        @click="transaccionesRef?.fetchData?.()"
      />
    </div>
    <transaccionesPague ref="transaccionesRef" :pago="pago" />
  </div>
  <div v-else>
    
    <div class="row items-center justify-between q-mb-md q-ml-sm titulo">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-primary text-weight-bold flex items-center">
          <q-icon name="assessment" size="md" class="q-mr-sm" />
          {{ $t('ui.reporte-de-pagos-1cec1c') }}
        </div>
        <div class="text-subtitle2 cm-text-muted q-mt-xs">
          {{ $t('ui.administracion-de-reporte-de-pagos-e15e3c') }}
        </div>
      </div>
    </div>
    <q-form>
      <div
        class="row q-col-gutter-md"
        style="display: flex; justify-content: center"
        id="filtroFechasPagar"
      >
        <div class="col-12 col-md-4" id="filtroFechaIniPagar">
          <label for="fechaIni">{{ $t('ui.fecha-inicial-2b461a') }}</label>
          <q-input v-model="fechaIni" type="date" class="col-md-4" dense outlined />
        </div>
        <div class="col-12 col-md-4" id="filtroFechaFinPagar">
          <label for="fechafin">{{ $t('ui.fecha-final-33d0e8') }}</label>
          <q-input v-model="fechafin" type="date" dense outlined="" class="col-md-4" />
        </div>
      </div>
      <div class="q-mt-md" style="display: flex; justify-content: center">
        <q-btn
          color="primary"
          :label="$t('ui.generar-reporte-eeafce')"
          @click="generarReporte"
          class="q-mr-sm"
          id="reporteGenerar"
        />
        <q-btn
          color="secondary"
          :label="$t('ui.exportar-a-excel-1569c7')"
          @click="exportarExcel"
          id="reporteExportar"
        />
        <q-btn
          color="primary"
          outline
          icon="refresh"
          :label="$t('ui.recargar-9d2c9d')"
          @click="fetchData"
          :loading="loading"
          id="reporteRecargar"
        >
          <q-tooltip>{{ $t('ui.recargar-reporte-ac6537') }}</q-tooltip>
        </q-btn>
      </div>
    </q-form>
    <!-- Sección de Filtros -->

    <div class="row q-col-gutter-md q-mb-md">
      <!-- Filtro por Almacén -->
      <div class="col-12 col-md-4" id="filtroAlmacenCuentas">
        <label for="almacen">{{ $t('inventario.warehouse') }}</label>
        <q-select
          outlined
          dense
          v-model="filterAlmacen"
          :options="almacenOptions"
          clearable
          emit-value
          map-options
        />
      </div>
      <!-- Filtro por Proveedor -->
      <div class="col-12 col-md-4" id="filtroProveedor">
        <label for="pro">{{ $t('compras.supplier') }}</label>
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
      <div class="col-12 col-md-4" id="filtroEstado">
        <label for="estado">{{ $t('cotizacion.table.status') }}</label>
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
      id="tablaDatos"
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
            {{ props.row.estado_pago === 1 ? $t('ui.concluido-123dfa') : $t('ui.en-proceso-875ad4') }}
          </q-chip>
        </q-td>
      </template>

      <!-- Slot para personalizar la celda de Acción -->
      <template v-slot:body-cell-accion="props">
        <q-td :props="props">
          <q-btn
            color="primary"
            icon="add"
            dense
            round
            @click="realizarPago(props.row)"
            id="agregarPago"
          />
          <q-btn
            color="blue"
            icon="list_alt"
            dense
            round=""
            @click="mostrardetalleCredito(props.row)"
            id="verDetallePago"
          />
        </q-td>
      </template>
      <template v-slot:no-data>
        <div class="full-width row flex-center text-primary q-gutter-sm text-body1">
          <span> {{ $t('ui.no-se-encontraron-resultados-para-los-filtros-selecc-512c0a') }} </span>
        </div>
      </template>
    </q-table>
  </div>

  <q-dialog v-model="mdpagarCueota">
    <q-card class="responsive-dialog">
      <div class="bg-primary text-white text-h6 flex justify-end q-gutter-x-xs q-pr-sm">
        <q-btn
          icon="refresh"
          dense
          flat
          rounded
          @click="cuotasRef?.fetchData?.()"
        >
          <q-tooltip>{{ $t('ui.recargar-cuotas-928e19') }}</q-tooltip>
        </q-btn>
        <q-btn icon="close" dense flat rounded @click="mdpagarCueota = false" />
      </div>
      <CuotasPage ref="cuotasRef" :pago="pago" @actualizar="fetchData" />
    </q-card>
  </q-dialog>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
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
const cuotasRef = ref(null)
const transaccionesRef = ref(null)
// --- Datos y Columnas de la Tabla ---
const allRows = ref([]) // Almacena todos los datos originales de la API
const pago = ref({})
const columns = [
  { name: 'nrofactura', label: i18nT('ui.factura-2e3485'), align: 'left', field: 'nrofactura', sortable: true },
  { name: 'almacen', label: i18nT('inventario.warehouse'), align: 'left', field: 'almacen', sortable: true },
  { name: 'proveedor', label: i18nT('compras.supplier'), align: 'left', field: 'proveedor', sortable: true },
  { name: 'fecha', label: i18nT('cotizacion.table.date'), align: 'center', field: 'fecha', sortable: true },
  { name: 'codigo', label: i18nT('ui.codigo-c35510'), align: 'left', field: 'codigo', sortable: true },
  { name: 'nro_cuotas', label: i18nT('ui.cuotas-a5d3d4'), align: 'center', field: 'nro_cuotas', sortable: true },
  {
    name: 'monto_total',
    label: i18nT('ui.monto-total-f935bf'),
    align: 'right',
    field: 'monto_total',
    sortable: true,
    format: (val) => `${parseFloat(val).toFixed(2)}`,
  },
  {
    name: 'saldo_actual',
    label: i18nT('ui.saldo-8b0fcd'),
    align: 'right',
    field: 'saldo_actual',
    sortable: true,
    format: (val) => `${parseFloat(val).toFixed(2)}`,
  },
  { name: 'estado', label: i18nT('cotizacion.table.status'), align: 'center', field: 'estado_pago', sortable: true },
  { name: 'accion', label: i18nT('ui.accion-d7927a'), align: 'center', field: 'accion' },
]

// --- Modelos para los Filtros ---
const filterAlmacen = ref(null)
const filterProveedor = ref(null)
const filterEstado = ref(null)

// --- Opciones para los Selects de Filtro ---

// Opciones de estado (estáticas)
const estadoOptions = [
  { label: i18nT('ui.concluido-123dfa'), value: 1 },
  { label: i18nT('ui.en-proceso-875ad4'), value: 2 },
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
      message: i18nT('ui.no-se-pudieron-cargar-los-datos-por-favor-intente-ma-e60bf9'),
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

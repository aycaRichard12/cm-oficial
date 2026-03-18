<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h4 text-weight-bold">
          <q-icon name="analytics" class="q-mr-sm" />
          Análisis de Clientes
        </div>
        <div class="text-subtitle2 text-grey-6">Dashboard de comportamiento y ventas</div>
      </div>
      <div class="col-auto row q-gutter-sm items-center">
        <!-- Date Pickers -->
        <q-input 
          v-model="fechaInicio" 
          dense 
          outlined 
          label="Inicio" 
          mask="##/##/####"
          class="date-input"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="fechaInicio" mask="DD/MM/YYYY">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Cerrar" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <q-input 
          v-model="fechaFin" 
          dense 
          outlined 
          label="Fin" 
          mask="##/##/####"
          class="date-input"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="fechaFin" mask="DD/MM/YYYY">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Cerrar" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <q-separator vertical inset class="q-mx-sm" />

        <q-btn 
          color="primary" 
          icon="search" 
          label="Consultar" 
          unelevated 
          :loading="loading"
          @click="consultar"
          class="q-ml-sm"
        />
      </div>
    </div>

    <!-- KPI Cards Section -->
    <ClientKPIs :kpis="kpis" />

    <!-- Charts Grid Section -->
    <ClientChartsGrid
      :top-clientes-por-volumen="topClientesPorVolumen"
      :top-clientes-por-frecuencia="topClientesPorFrecuencia"
      :mejores-clientes-historicos="mejoresClientesHistoricos"
      :distribucion-por-estado="distribucionPorEstado"
      :ventas-por-fecha="ventasPorFecha"
      :fecha-inicio="fechaInicioActiva"
      :fecha-fin="fechaFinActiva"
    />

    <!-- Tables Grid Section -->
    <ClientTablesGrid
      v-model:dias-inactivos-tabla="diasInactivosTabla"
      :tabla-clientes-activos="tablaClientesActivos"
      :tabla-clientes-inactivos="tablaClientesInactivos"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { api } from 'src/boot/axios'
import { useClientAnalytics } from 'src/composables/useClientAnalytics'

// Sub-components
import ClientKPIs from './client_analytics/ClientKPIs.vue'
import ClientChartsGrid from './client_analytics/ClientChartsGrid.vue'
import ClientTablesGrid from './client_analytics/ClientTablesGrid.vue'

const idEmpresa = idempresa_md5()
const idUsuario = idusuario_md5()
const ventas = ref([])
const diasInactivosTabla = ref(30)

// Fechas para filtro manual
import { date } from 'quasar'
const timeStamp = Date.now()
const fechaFin = ref(date.formatDate(timeStamp, 'DD/MM/YYYY'))
const fechaInicio = ref(date.formatDate(date.subtractFromDate(timeStamp, { days: 60 }), 'DD/MM/YYYY'))

// Analytics data orchestration
// Usamos refs para los valores 'activos' que recibe el composable
const fechaInicioActiva = ref(null)
const fechaFinActiva = ref(null)

const {
  clientesProcesados,
  topClientesPorVolumen,
  topClientesPorFrecuencia,
  mejoresClientesHistoricos,
  distribucionPorEstado,
  clientesInactivos,
  ventasPorFecha,
  kpis,
} = useClientAnalytics(ventas, null, fechaInicioActiva, fechaFinActiva)

const loading = ref(false)

// Función para aplicar los filtros y obtener datos
const consultar = async () => {
  loading.value = true
  try {
    // 1. Sincronizar los filtros seleccionados en la UI con los activos del composable
    fechaInicioActiva.value = fechaInicio.value
    fechaFinActiva.value = fechaFin.value

    // 2. Re-obtener ventas desde la API (opcional, pero útil para datos frescos)
    ventas.value = await obtenerVentasPorCliente()
  } finally {
    loading.value = false
  }
}

// Data fetching
const obtenerVentasPorCliente = async () => {
  try {
    const response = await api.get(`/fechas_venta_cliente/${idEmpresa}/${idUsuario}`)
    return response.data
  } catch (error) {
    console.error('Error al obtener ventas:', error)
    return []
  }
}

// Table data computed properties (logic specific to state orchestration)
const tablaClientesInactivos = computed(() => {
  return clientesInactivos(diasInactivosTabla.value).value
})

const tablaClientesActivos = computed(() => {
  return clientesProcesados.value
    .filter((c) => c.estado === 'active')
    .sort((a, b) => {
      if (a.proxima_compra_prediccion && !b.proxima_compra_prediccion) return -1
      if (!a.proxima_compra_prediccion && b.proxima_compra_prediccion) return 1
      if (a.dias_hasta_proxima_compra && b.dias_hasta_proxima_compra) {
        return a.dias_hasta_proxima_compra - b.dias_hasta_proxima_compra
      }
      return b.total_compras - a.total_compras
    })
})

onMounted(async () => {
  // Inicializar con la consulta por defecto al cargar
  await consultar()
})
</script>

<style scoped>
.date-input {
  max-width: 160px;
}
</style>

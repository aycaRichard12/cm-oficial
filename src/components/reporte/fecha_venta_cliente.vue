<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row justify-between items-center q-mb-lg q-col-gutter-y-md">
      <!-- Título de la vista -->
      <div class="col-12 col-md-auto">
        <div class="text-weight-bold flex items-center q-mb-xs">
          <q-icon name="analytics" class="q-mr-sm text-h4" />
          <span class="text-h5 text-md-h4">Análisis de Clientes</span>
        </div>
        <div class="text-subtitle2 text-grey-6 text-caption text-sm-subtitle2">Dashboard de comportamiento y ventas</div>
      </div>
      
      <!-- Controles de Filtro -->
      <div class="col-12 col-md-auto">
        <div class="row q-col-gutter-sm items-center">
          <div class="col-6 col-sm-auto">
            <!-- Date Pickers -->
            <q-input 
              v-model="fechaInicio" 
              dense 
              outlined 
              label="Inicio" 
              mask="##/##/####"
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
          </div>

          <div class="col-6 col-sm-auto">
            <q-input 
              v-model="fechaFin" 
              dense 
              outlined 
              label="Fin" 
              mask="##/##/####"
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
          </div>

          <div class="col-12 col-sm-auto flex items-center">
            <q-btn 
              color="primary" 
              icon="search" 
              label="Consultar" 
              unelevated 
              :loading="loading"
              @click="consultar"
              class="full-width"
            />
          </div>
        </div>
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
/* Responsive layout handling directly in template via Quasar classes */
</style>

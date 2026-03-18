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
      <div class="col-auto">
        <q-btn-toggle
          v-model="diasAnalisis"
          toggle-color="primary"
          :options="[
            { label: '30 días', value: 30 },
            { label: '60 días', value: 60 },
            { label: '90 días', value: 90 },
          ]"
          unelevated
        />
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="kpi-card bg-primary">
          <q-card-section>
            <div class="text-h6 text-white">
              <q-icon name="check_circle" size="sm" class="q-mr-xs" />
              Clientes Activos
            </div>
            <div class="text-h3 text-white text-weight-bold q-mt-sm">
              {{ kpis.clientesActivos }}
            </div>
            <div class="text-caption text-white opacity-80">Compraron en últimos 30 días</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="kpi-card bg-warning">
          <q-card-section>
            <div class="text-h6 text-white">
              <q-icon name="warning" size="sm" class="q-mr-xs" />
              En Riesgo
            </div>
            <div class="text-h3 text-white text-weight-bold q-mt-sm">
              {{ kpis.clientesEnRiesgo }}
            </div>
            <div class="text-caption text-white opacity-80">Sin compra 30-90 días</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="kpi-card bg-negative">
          <q-card-section>
            <div class="text-h6 text-white">
              <q-icon name="cancel" size="sm" class="q-mr-xs" />
              Inactivos
            </div>
            <div class="text-h3 text-white text-weight-bold q-mt-sm">
              {{ kpis.clientesInactivos }}
            </div>
            <div class="text-caption text-white opacity-80">Más de 90 días sin compra</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="kpi-card bg-cyan">
          <q-card-section>
            <div class="text-h6 text-white">
              <q-icon name="shopping_cart" size="sm" class="q-mr-xs" />
              Ventas {{ new Date().getFullYear() }}
            </div>
            <div class="text-h3 text-white text-weight-bold q-mt-sm">
              {{ kpis.totalVentasAño }}
            </div>
            <div class="text-caption text-white opacity-80">Total del año actual</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="row q-col-gutter-md">
      <!-- Top Clientes por Volumen -->
      <div class="col-12 col-lg-6">
        <q-card>
          <!-- <q-card-section>
            <div class="text-h6">
              <q-icon name="emoji_events" class="q-mr-sm" color="amber" />
              Top Clientes con más compras
            </div>
            <div class="text-caption text-grey-6">Últimos {{ diasAnalisis }} días</div>
          </q-card-section> -->
          <q-card-section>
            <VueApexCharts
              type="bar"
              height="350"
              :options="chartTopVolumen"
              :series="seriesTopVolumen"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Top Clientes por Frecuencia -->
      <div class="col-12 col-lg-6">
        <q-card>
          <!-- <q-card-section>
            <div class="text-h6">
              <q-icon name="flash_on" class="q-mr-sm" color="orange" />
              Top Clientes por Frecuencia
            </div>
            <div class="text-caption text-grey-6">Últimos {{ diasAnalisis }} días</div>
          </q-card-section> -->
          <q-card-section>
            <VueApexCharts
              type="bar"
              height="350"
              :options="chartTopFrecuencia"
              :series="seriesTopFrecuencia"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Mejores Clientes Históricos -->
      <div class="col-12 col-lg-6">
        <q-card>
          <!-- <q-card-section>
            <div class="text-h6">
              <q-icon name="workspace_premium" class="q-mr-sm" color="purple" />
              Mejores Clientes (Histórico)
            </div>
            <div class="text-caption text-grey-6">Total de compras acumuladas</div>
          </q-card-section> -->
          <q-card-section>
            <VueApexCharts
              type="bar"
              height="350"
              :options="chartMejoresHistoricos"
              :series="seriesMejoresHistoricos"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Distribución por Estado -->
      <div class="col-12 col-lg-6">
        <q-card>
          <!-- <q-card-section>
            <div class="text-h6">
              <q-icon name="pie_chart" class="q-mr-sm" color="primary" />
              Distribución por Estado
            </div>
            <div class="text-caption text-grey-6">Clasificación de clientes</div>
          </q-card-section> -->
          <q-card-section>
            <VueApexCharts
              type="donut"
              height="350"
              :options="chartDistribucion"
              :series="seriesDistribucion"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Timeline de Ventas -->
      <div class="col-12">
        <q-card>
          <!-- <q-card-section>
            <div class="text-h6">
              <q-icon name="show_chart" class="q-mr-sm" color="deep-purple" />
              Evolución de Ventas {{ new Date().getFullYear() }}
            </div>
            <div class="text-caption text-grey-6">Ventas por día del año actual</div>
          </q-card-section> -->
          <q-card-section>
            <VueApexCharts
              type="line"
              height="350"
              :options="chartTimeline"
              :series="seriesTimeline"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Tabla de Clientes Activos con Predicción -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6">
              <q-icon name="check_circle" class="q-mr-sm" color="positive" />
              Clientes Activos - Predicción de Próxima Compra
            </div>
            <div class="text-caption text-grey-6">
              Clientes que compraron en los últimos 30 días
            </div>
          </q-card-section>
          <q-card-section>
            <q-table
              :rows="tablaClientesActivos"
              :columns="columnasActivos"
              row-key="id_cliente"
              :pagination="{ rowsPerPage: 10 }"
              flat
              bordered
              dense
            >
              <template v-slot:body-cell-estado="props">
                <q-td :props="props">
                  <q-badge :color="props.row.estadoColor" :label="props.row.estadoLabel" />
                </q-td>
              </template>
              <template v-slot:body-cell-prediccion="props">
                <q-td :props="props">
                  <q-badge
                    v-if="props.row.proxima_compra_prediccion"
                    color="positive"
                    :label="`${props.row.proxima_compra_prediccion} (en ${props.row.dias_hasta_proxima_compra} días)`"
                  >
                    <q-tooltip> Basado en promedio de intervalos entre compras </q-tooltip>
                  </q-badge>
                  <q-badge v-else color="grey-5" label="Requiere 2+ compras">
                    <q-tooltip>
                      Se necesitan al menos 2 compras para calcular predicción
                    </q-tooltip>
                  </q-badge>
                </q-td>
              </template>
              <template v-slot:body-cell-frecuencia_compra="props">
                <q-td :props="props">
                  {{ props.row.frecuencia_compra.toFixed(3) }}
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- Tabla de Clientes Inactivos -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h6">
                  <q-icon name="person_off" class="q-mr-sm" color="negative" />
                  Clientes Inactivos
                </div>
                <div class="text-caption text-grey-6">
                  Clientes sin compra en {{ diasInactivosTabla }} días o más
                </div>
              </div>
              <div class="col-auto">
                <q-select
                  v-model="diasInactivosTabla"
                  :options="[30, 60, 90, 120, 180]"
                  label="Días sin compra"
                  dense
                  outlined
                  style="min-width: 150px"
                />
              </div>
            </div>
          </q-card-section>
          <q-card-section>
            <q-table
              :rows="tablaClientesInactivos"
              :columns="columnasInactivos"
              row-key="id_cliente"
              :pagination="{ rowsPerPage: 10 }"
              flat
              bordered
              dense
            >
              <template v-slot:body-cell-estado="props">
                <q-td :props="props">
                  <q-badge :color="props.row.estadoColor" :label="props.row.estadoLabel" />
                </q-td>
              </template>
              <template v-slot:body-cell-prediccion="props">
                <q-td :props="props">
                  <q-badge
                    v-if="props.row.proxima_compra_prediccion"
                    color="positive"
                    :label="`${props.row.proxima_compra_prediccion} (${props.row.dias_hasta_proxima_compra}d)`"
                  />
                  <q-badge v-else color="grey-5" label="N/A" />
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { api } from 'src/boot/axios'
import VueApexCharts from 'vue3-apexcharts'
import { useClientAnalytics } from 'src/composables/useClientAnalytics'

const idEmpresa = idempresa_md5()
const idUsuario = idusuario_md5()
const ventas = ref([])
const diasAnalisis = ref(60)
const diasInactivosTabla = ref(30)

// Obtener datos de la API
const obtenerVentasPorCliente = async () => {
  try {
    const response = await api.get(`/fechas_venta_cliente/${idEmpresa}/${idUsuario}`)
    return response.data
  } catch (error) {
    console.error('Error al obtener ventas:', error)
    return []
  }
}

// Usar el composable de analytics
const {
  clientesProcesados,
  topClientesPorVolumen,
  topClientesPorFrecuencia,
  mejoresClientesHistoricos,
  distribucionPorEstado,
  clientesInactivos,
  ventasPorFecha,
  kpis,
} = useClientAnalytics(ventas, diasAnalisis)

// Columnas para tabla de inactivos
const columnasInactivos = [
  { name: 'nombre', label: 'Cliente', field: 'nombre', align: 'left', sortable: true },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left', sortable: true },
  {
    name: 'ultima_compra_formatted',
    label: 'Última Compra',
    field: 'ultima_compra_formatted',
    align: 'center',
    sortable: true,
  },
  {
    name: 'dias_sin_compra',
    label: 'Días sin Compra',
    field: 'dias_sin_compra',
    align: 'center',
    sortable: true,
  },
  {
    name: 'total_compras',
    label: 'Total Compras',
    field: 'total_compras',
    align: 'center',
    sortable: true,
  },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
  {
    name: 'prediccion',
    label: 'Próxima Compra',
    field: 'proxima_compra_prediccion',
    align: 'center',
    sortable: false,
  },
]

const tablaClientesInactivos = computed(() => {
  return clientesInactivos(diasInactivosTabla.value).value
})

// Columnas para tabla de activos
const columnasActivos = [
  { name: 'nombre', label: 'Cliente', field: 'nombre', align: 'left', sortable: true },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left', sortable: true },
  {
    name: 'ultima_compra_formatted',
    label: 'Última Compra',
    field: 'ultima_compra_formatted',
    align: 'center',
    sortable: true,
  },
  {
    name: 'total_compras',
    label: 'Total Compras',
    field: 'total_compras',
    align: 'center',
    sortable: true,
  },
  {
    name: 'frecuencia_compra',
    label: 'Frecuencia',
    field: 'frecuencia_compra',
    align: 'center',
    sortable: true,
  },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center', sortable: true },
  {
    name: 'prediccion',
    label: 'Próxima Compra Estimada',
    field: 'proxima_compra_prediccion',
    align: 'center',
    sortable: true,
  },
]

const tablaClientesActivos = computed(() => {
  return clientesProcesados.value
    .filter((c) => c.estado === 'active')
    .sort((a, b) => {
      // Priorizar clientes con predicción
      if (a.proxima_compra_prediccion && !b.proxima_compra_prediccion) return -1
      if (!a.proxima_compra_prediccion && b.proxima_compra_prediccion) return 1
      // Luego ordenar por días hasta próxima compra
      if (a.dias_hasta_proxima_compra && b.dias_hasta_proxima_compra) {
        return a.dias_hasta_proxima_compra - b.dias_hasta_proxima_compra
      }
      return b.total_compras - a.total_compras
    })
})

// ============================================
// CHART 1: Top Clientes por Volumen
// ============================================
const chartTopVolumen = computed(() => ({
  chart: {
    type: 'bar',
    height: 350,
    toolbar: { show: true },
  },
  title: {
    text: 'Top Clientes con más compras',
    align: 'center',
    style: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#263238'
    }
  },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 4,
      dataLabels: { position: 'top' },
    },
  },
  dataLabels: {
    enabled: true,
    offsetX: 30,
    style: { fontSize: '12px', colors: ['#333'] },
  },
  xaxis: {
    categories: topClientesPorVolumen.value.map((c) => c.nombre),
    title: { text: 'Compras' },
  },
  yaxis: {
    labels: {
      formatter: (value) => (value.length > 25 ? value.substring(0, 25) + '...' : value),
    },
  },
  tooltip: {
    custom: ({ dataPointIndex }) => {
      const cliente = topClientesPorVolumen.value[dataPointIndex]
      if (!cliente) return ''
      let html = `
        <div class="custom-tooltip">
          <div class="tooltip-header">${cliente.nombre}</div>
          <div class="tooltip-row"><strong>Teléfono:</strong> ${cliente.telefono}</div>
          <div class="tooltip-row"><strong>Compras (${diasAnalisis.value} días):</strong> ${cliente.compras_ultimos_X_dias}</div>
          <div class="tooltip-row"><strong>Total Histórico:</strong> ${cliente.total_compras}</div>
          <div class="tooltip-row"><strong>Última Compra:</strong> ${cliente.ultima_compra_formatted}</div>
      `
      if (cliente.estado === 'active' && cliente.proxima_compra_prediccion) {
        html += `
          <div class="tooltip-divider"></div>
          <div class="tooltip-prediction">
            <strong>Próxima compra estimada:</strong><br>
            ${cliente.proxima_compra_prediccion} (en ${cliente.dias_hasta_proxima_compra} días)
          </div>
        `
      }
      html += '</div>'
      return html
    },
  },
  colors: ['#3b82f6'],
  subtitle: {
    text: `Últimos ${diasAnalisis.value} días`,
    align: 'center',
    style: { fontSize: '12px', color: '#666' }
  }
}))

const seriesTopVolumen = computed(() => [
  {
    name: 'Compras',
    data: topClientesPorVolumen.value.map((c) => c.compras_ultimos_X_dias),
  },
])

// ============================================
// CHART 2: Top Clientes por Frecuencia
// ============================================
const chartTopFrecuencia = computed(() => ({
  chart: {
    type: 'bar',
    height: 350,
    toolbar: { show: true },
  },
  title: {
    text: 'Top Clientes por Frecuencia',
    align: 'center',
    style: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#263238'
    }
  },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 4,
      dataLabels: { position: 'top' },
    },
  },
  dataLabels: {
    enabled: true,
    offsetX: 30,
    style: { fontSize: '12px', colors: ['#333'] },
  },
  xaxis: {
    categories: topClientesPorFrecuencia.value.map((c) => c.nombre),
    title: { text: 'Número de Compras' },
  },
  yaxis: {
    labels: {
      formatter: (value) => (value.length > 25 ? value.substring(0, 25) + '...' : value),
    },
  },
  tooltip: {
    custom: ({ dataPointIndex }) => {
      const cliente = topClientesPorFrecuencia.value[dataPointIndex]
      if (!cliente) return ''
      let html = `
        <div class="custom-tooltip">
          <div class="tooltip-header">${cliente.nombre}</div>
          <div class="tooltip-row"><strong>Teléfono:</strong> ${cliente.telefono}</div>
          <div class="tooltip-row"><strong>Compras en ${diasAnalisis.value} días:</strong> ${cliente.compras_ultimos_X_dias}</div>
          <div class="tooltip-row"><strong>Total Compras:</strong> ${cliente.total_compras}</div>
          <div class="tooltip-row"><strong>Última Compra:</strong> ${cliente.ultima_compra_formatted}</div>
      `
      if (cliente.estado === 'active' && cliente.proxima_compra_prediccion) {
        html += `
          <div class="tooltip-divider"></div>
          <div class="tooltip-prediction">
            <strong>Próxima compra estimada:</strong><br>
            ${cliente.proxima_compra_prediccion} (en ${cliente.dias_hasta_proxima_compra} días)
          </div>
        `
      }
      html += '</div>'
      return html
    },
  },
  colors: ['#10b981'],
  subtitle: {
    text: `Últimos ${diasAnalisis.value} días`,
    align: 'center',
    style: { fontSize: '12px', color: '#666' }
  }
}))

const seriesTopFrecuencia = computed(() => [
  {
    name: 'Compras',
    data: topClientesPorFrecuencia.value.map((c) => c.compras_ultimos_X_dias),
  },
])

// ============================================
// CHART 3: Mejores Clientes Históricos
// ============================================
const chartMejoresHistoricos = computed(() => ({
  chart: {
    type: 'bar',
    height: 350,
    toolbar: { show: true },
  },
  title: {
    text: 'Mejores Clientes (Histórico)',
    align: 'center',
    style: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#263238'
    }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 4,
      columnWidth: '70%',
      dataLabels: { position: 'top' },
    },
  },
  dataLabels: {
    enabled: true,
    offsetY: -20,
    style: { fontSize: '12px', colors: ['#333'] },
  },
  xaxis: {
    categories: mejoresClientesHistoricos.value.map((c) => c.nombre),
    labels: {
      rotate: -45,
      style: { fontSize: '11px' },
      formatter: (value) => (value.length > 20 ? value.substring(0, 20) + '...' : value),
    },
  },
  yaxis: {
    title: { text: 'Total Compras' },
  },
  tooltip: {
    custom: ({ dataPointIndex }) => {
      const cliente = mejoresClientesHistoricos.value[dataPointIndex]
      if (!cliente) return ''
      let html = `
        <div class="custom-tooltip">
          <div class="tooltip-header">${cliente.nombre}</div>
          <div class="tooltip-row"><strong>Teléfono:</strong> ${cliente.telefono}</div>
          <div class="tooltip-row"><strong>Total Compras:</strong> ${cliente.total_compras}</div>
          <div class="tooltip-row"><strong>Frecuencia:</strong> ${cliente.frecuencia_compra.toFixed(3)} compras/día</div>
          <div class="tooltip-row"><strong>Última Compra:</strong> ${cliente.ultima_compra_formatted}</div>
          <div class="tooltip-row"><strong>Estado:</strong> ${cliente.estadoLabel}</div>
      `
      if (cliente.estado === 'active' && cliente.proxima_compra_prediccion) {
        html += `
          <div class="tooltip-divider"></div>
          <div class="tooltip-prediction">
            <strong>📅 Próxima compra estimada:</strong><br>
            ${cliente.proxima_compra_prediccion} (en ${cliente.dias_hasta_proxima_compra} días)
          </div>
        `
      }
      html += '</div>'
      return html
    },
  },
  colors: ['#f59e0b'],
}))

const seriesMejoresHistoricos = computed(() => [
  {
    name: 'Compras',
    data: mejoresClientesHistoricos.value.map((c) => c.total_compras),
  },
])

// ============================================
// CHART 4: Distribución por Estado
// ============================================
const chartDistribucion = computed(() => ({
  chart: {
    type: 'donut',
    height: 350,
  },
  title: {
    text: 'Distribución por Estado',
    align: 'center',
    style: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#263238'
    }
  },
  labels: ['Activos', 'En Riesgo', 'Discontinuados'],
  colors: ['#10b981', '#f59e0b', '#ef4444'],
  legend: {
    position: 'bottom',
  },
  dataLabels: {
    enabled: true,
    formatter: (val, opts) => {
      return opts.w.config.series[opts.seriesIndex]
    },
  },
  tooltip: {
    custom: ({ dataPointIndex }) => {
      const estados = ['active', 'risk', 'discontinued']
      const estadoKey = estados[dataPointIndex]
      const dist = distribucionPorEstado.value[estadoKey]

      const criterios = {
        active: 'Compró en los últimos 30 días',
        risk: 'Sin compra entre 30-90 días',
        discontinued: 'Más de 90 días sin compra',
      }

      let html = `
        <div class="custom-tooltip">
          <div class="tooltip-header">${dist.label}</div>
          <div class="tooltip-row"><strong>Total:</strong> ${dist.count} clientes</div>
          <div class="tooltip-row"><strong>Criterio:</strong> ${criterios[estadoKey]}</div>
      `

      if (dist.clientes.length > 0) {
        html +=
          '<div class="tooltip-divider"></div><div class="tooltip-subheader">Top Clientes:</div>'
        dist.clientes.slice(0, 3).forEach((c) => {
          html += `<div class="tooltip-row-small">• ${c.nombre} (${c.total_compras} compras)</div>`
        })
      }

      html += '</div>'
      return html
    },
  },
}))

const seriesDistribucion = computed(() => {
  const dist = distribucionPorEstado.value
  return [dist.active.count, dist.risk.count, dist.discontinued.count]
})

// ============================================
// CHART 5: Timeline de Ventas
// ============================================
const chartTimeline = computed(() => ({
  chart: {
    type: 'line',
    height: 350,
    zoom: { enabled: true },
    toolbar: { show: true },
  },
  title: {
    text: 'Evolución de Ventas',
    align: 'center',
    style: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#263238'
    }
  },
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: ventasPorFecha.value.map((v) => v.fechaFormatted),
    labels: {
      rotate: -45,
      style: { fontSize: '10px' },
    },
  },
  yaxis: {
    title: { text: 'Número de Ventas' },
  },
  tooltip: {
    x: {
      formatter: (val, opts) => {
        const fecha = ventasPorFecha.value[opts.dataPointIndex]?.fechaFormatted
        return fecha
          ? new Date(fecha).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : val
      },
    },
    y: {
      formatter: (val) => `${val} ventas`,
    },
  },
  colors: ['#8b5cf6'],
  markers: {
    size: 4,
    hover: { size: 6 },
  },
}))

const seriesTimeline = computed(() => [
  {
    name: 'Ventas',
    data: ventasPorFecha.value.map((v) => v.cantidad),
  },
])

// Cargar datos al montar
import { onMounted } from 'vue'

onMounted(async () => {
  ventas.value = await obtenerVentasPorCliente()
})

// Recargar cuando cambia el rango de análisis
watch(diasAnalisis, async () => {
  // Los computed se actualizarán automáticamente
})
</script>

<style scoped>
.kpi-card {
  border-radius: 12px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.opacity-80 {
  opacity: 0.8;
}

/* Custom Tooltip Styles */
:deep(.custom-tooltip) {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 250px;
}

:deep(.tooltip-header) {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 2px solid #3b82f6;
}

:deep(.tooltip-subheader) {
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
  margin-top: 4px;
  margin-bottom: 4px;
}

:deep(.tooltip-row) {
  font-size: 12px;
  color: #4b5563;
  margin: 4px 0;
  line-height: 1.5;
}

:deep(.tooltip-row-small) {
  font-size: 11px;
  color: #6b7280;
  margin: 2px 0;
  line-height: 1.4;
}

:deep(.tooltip-divider) {
  height: 1px;
  background: #e5e7eb;
  margin: 8px 0;
}

:deep(.tooltip-row strong) {
  color: #1f2937;
  font-weight: 600;
}

:deep(.tooltip-prediction) {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-left: 3px solid #10b981;
  padding: 8px;
  margin-top: 4px;
  border-radius: 4px;
  font-size: 12px;
  color: #065f46;
}

:deep(.tooltip-prediction strong) {
  color: #047857;
}
</style>

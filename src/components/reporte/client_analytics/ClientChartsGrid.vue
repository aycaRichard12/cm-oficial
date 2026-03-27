<template>
  <div class="row q-col-gutter-md">
    <!-- Top Clientes por Volumen -->
    <!-- <div class="col-12 col-lg-6">
      <q-card>
        <q-card-section>
          <VueApexCharts
            type="bar"
            height="350"
            :options="chartTopVolumen"
            :series="seriesTopVolumen"
          />
        </q-card-section>
      </q-card>
    </div> -->

    <!-- Top Clientes por Frecuencia -->
    <!-- <div class="col-12 col-lg-6">
      <q-card>
        <q-card-section>
          <VueApexCharts
            type="bar"
            height="350"
            :options="chartTopFrecuencia"
            :series="seriesTopFrecuencia"
          />
        </q-card-section>
      </q-card>
    </div> -->

    <!-- Mejores Clientes Históricos -->
    <div class="col-12 col-lg-6">
      <q-card>
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps({
  topClientesPorVolumen: Array,
  topClientesPorFrecuencia: Array,
  mejoresClientesHistoricos: Array,
  distribucionPorEstado: Object,
  ventasPorFecha: Array,
  fechaInicio: String,
  fechaFin: String,
})

// const subtitleText = computed(() => {
//   if (props.fechaInicio || props.fechaFin) {
//     return `Periodo: ${props.fechaInicio || '...'} al ${props.fechaFin || '...'}`
//   }
//   return 'Análisis General'
// })

// ============================================
// CHART 1: Top Clientes por Volumen
// ============================================
// const chartTopVolumen = computed(() => ({
//   chart: {
//     type: 'bar',
//     height: 350,
//     toolbar: { show: true },
//   },
//   title: {
//     text: 'Top Clientes con más compras',
//     align: 'center',
//     style: { fontSize: '16px', fontWeight: 'bold', color: '#263238' }
//   },
//   plotOptions: {
//     bar: {
//       horizontal: true,
//       borderRadius: 4,
//       dataLabels: { position: 'top' },
//     },
//   },
//   dataLabels: {
//     enabled: true,
//     offsetX: 30,
//     style: { fontSize: '12px', colors: ['#333'] },
//   },
//   xaxis: {
//     categories: props.topClientesPorVolumen.map((c) => c.nombre),
//     title: { text: 'Compras' },
//   },
//   yaxis: {
//     labels: {
//       formatter: (value) => (value.length > 25 ? value.substring(0, 25) + '...' : value),
//     },
//   },
//   tooltip: {
//     custom: ({ dataPointIndex }) => {
//       const cliente = props.topClientesPorVolumen[dataPointIndex]
//       if (!cliente) return ''
//       let html = `
//         <div class="custom-tooltip">
//           <div class="tooltip-header">${cliente.nombre}</div>
//           <div class="tooltip-row"><strong>Teléfono:</strong> ${cliente.telefono}</div>
//           <div class="tooltip-row"><strong>Compras (${subtitleText.value}):</strong> ${cliente.compras_ultimos_X_dias}</div>
//           <div class="tooltip-row"><strong>Total Histórico:</strong> ${cliente.total_compras}</div>
//           <div class="tooltip-row"><strong>Última Compra:</strong> ${cliente.ultima_compra_formatted}</div>
//       `
//       if (cliente.estado === 'active' && cliente.proxima_compra_prediccion) {
//         html += `
//           <div class="tooltip-divider"></div>
//           <div class="tooltip-prediction">
//             <strong>Próxima compra estimada:</strong><br>
//             ${cliente.proxima_compra_prediccion} (en ${cliente.dias_hasta_proxima_compra} días)
//           </div>
//         `
//       }
//       html += '</div>'
//       return html
//     },
//   },
//   colors: ['#3b82f6'],
//   subtitle: {
//     text: subtitleText.value,
//     align: 'center',
//     style: { fontSize: '12px', color: '#666' }
//   }
// }))

// const seriesTopVolumen = computed(() => [
//   {
//     name: 'Compras',
//     data: props.topClientesPorVolumen.map((c) => c.compras_ultimos_X_dias),
//   },
// ])

// ============================================
// CHART 2: Top Clientes por Frecuencia
// ============================================
// const chartTopFrecuencia = computed(() => ({
//   chart: {
//     type: 'bar',
//     height: 350,
//     toolbar: { show: true },
//   },
//   title: {
//     text: 'Top Clientes por Frecuencia',
//     align: 'center',
//     style: { fontSize: '16px', fontWeight: 'bold', color: '#263238' }
//   },
//   plotOptions: {
//     bar: {
//       horizontal: true,
//       borderRadius: 4,
//       dataLabels: { position: 'top' },
//     },
//   },
//   dataLabels: {
//     enabled: true,
//     offsetX: 30,
//     style: { fontSize: '12px', colors: ['#333'] },
//   },
//   xaxis: {
//     categories: props.topClientesPorFrecuencia.map((c) => c.nombre),
//     title: { text: 'Número de Compras' },
//   },
//   yaxis: {
//     labels: {
//       formatter: (value) => (value.length > 25 ? value.substring(0, 25) + '...' : value),
//     },
//   },
//   tooltip: {
//     custom: ({ dataPointIndex }) => {
//       const cliente = props.topClientesPorFrecuencia[dataPointIndex]
//       if (!cliente) return ''
//       let html = `
//         <div class="custom-tooltip">
//           <div class="tooltip-header">${cliente.nombre}</div>
//           <div class="tooltip-row"><strong>Teléfono:</strong> ${cliente.telefono}</div>
//           <div class="tooltip-row"><strong>Compras en el periodo:</strong> ${cliente.compras_ultimos_X_dias}</div>
//           <div class="tooltip-row"><strong>Total Compras:</strong> ${cliente.total_compras}</div>
//           <div class="tooltip-row"><strong>Última Compra:</strong> ${cliente.ultima_compra_formatted}</div>
//       `
//       if (cliente.estado === 'active' && cliente.proxima_compra_prediccion) {
//         html += `
//           <div class="tooltip-divider"></div>
//           <div class="tooltip-prediction">
//             <strong>Próxima compra estimada:</strong><br>
//             ${cliente.proxima_compra_prediccion} (en ${cliente.dias_hasta_proxima_compra} días)
//           </div>
//         `
//       }
//       html += '</div>'
//       return html
//     },
//   },
//   colors: ['#10b981'],
//   subtitle: {
//     text: subtitleText.value,
//     align: 'center',
//     style: { fontSize: '12px', color: '#666' }
//   }
// }))

// const seriesTopFrecuencia = computed(() => [
//   {
//     name: 'Compras',
//     data: props.topClientesPorFrecuencia.map((c) => c.compras_ultimos_X_dias),
//   },
// ])

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
    style: { fontSize: '16px', fontWeight: 'bold', color: '#263238' },
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
    categories: props.mejoresClientesHistoricos.map((c) => c.nombre),
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
      const cliente = props.mejoresClientesHistoricos[dataPointIndex]
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
            <strong> Próxima compra estimada:</strong><br>
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
    data: props.mejoresClientesHistoricos.map((c) => c.total_compras),
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
    style: { fontSize: '16px', fontWeight: 'bold', color: '#263238' },
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
      const dist = props.distribucionPorEstado[estadoKey]

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
  const dist = props.distribucionPorEstado
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
    style: { fontSize: '16px', fontWeight: 'bold', color: '#263238' },
  },
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: props.ventasPorFecha.map((v) => v.fechaFormatted),
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
        const fecha = props.ventasPorFecha[opts.dataPointIndex]?.fechaFormatted
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
    data: props.ventasPorFecha.map((v) => v.cantidad),
  },
])
</script>

<style scoped>
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

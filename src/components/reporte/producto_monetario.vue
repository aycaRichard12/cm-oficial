<template>
  <div>
    <!-- Debug: Verificar datos -->
    <!-- <pre v-if="debug">{{ { chartOptions, series, rawData: chartData } }}</pre> -->

    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h6">Productos más Vendidos</div>
      </q-card-section>
      <q-card-section>
        <VueApexCharts type="bar" height="350" :options="chartOptions" :series="series" />
      </q-card-section>
    </q-card>

    <!-- Debug temporal -->
    <!-- <pre>{{ chartData }}</pre> -->
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFetchList } from 'src/composables/useFetchList'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import VueApexCharts from 'vue3-apexcharts'

const empresa = idempresa_md5()
// const debug = ref(true) // Activa para ver datos de depuración

const { items: pPreferido } = useFetchList(`/productos_mayor_venta_monetario/${empresa || null}`)

const chartData = computed(() => {
  const rawData = pPreferido.value?._value || pPreferido.value || []
  return rawData.map((item) => ({
    ...item,
    nombre_producto: `${item.codigo?.trim() ?? ''} ${item.nombre?.trim() ?? ''}`.trim(),
    total_vendido: Number(item.precio) || 0,
  }))
})

const chartOptions = ref({
  chart: {
    type: 'bar',
    height: 350,
    stacked: false,
    toolbar: { show: true },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 4,
      columnWidth: '70%',
      dataLabels: {
        position: 'top',
        hideOverflowingLabels: false,
      },
    },
  },
  dataLabels: {
    enabled: true,
    formatter: function (val) {
      return val > 0 ? val : ''
    },
    style: {
      fontSize: '12px',
      colors: ['#333'],
    },
  },
  xaxis: {
    categories: [],
    labels: {
      rotate: -45,
      style: {
        fontSize: '12px',
      },
      formatter: function (value) {
        return value.length > 20 ? value.substring(0, 20) + '...' : value
      },
    },
  },
  yaxis: {
    title: { text: 'Ingresos por Ventas' },
    labels: {
      formatter: function (val) {
        return Math.floor(val) === val ? val : ''
      },
    },
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return `${val} costo`
      },
    },
  },
  colors: [
    '#008FFB',
    '#00E396',
    '#FEB019',
    '#FF4560',
    '#775DD0',
    '#008FFB',
    '#00E396',
    '#FEB019',
    '#FF4560',
    '#775DD0',
  ],
  noData: {
    text: 'Cargando datos...',
    align: 'center',
    verticalAlign: 'middle',
  },
})

const series = ref([
  {
    name: 'Ventas',
    data: [],
  },
])

watch(
  chartData,
  (newData) => {
    if (!newData || newData.length === 0) {
      chartOptions.value.noData.text = 'No hay datos disponibles'
      return
    }

    // ✅ Declaramos primero los arreglos
    const categories = []
    const seriesData = []

    // ✅ Luego los llenamos
    newData.forEach((item) => {
      categories.push(item.nombre_producto)
      seriesData.push(item.total_vendido)
    })

    // ✅ Y actualizamos la configuración del gráfico
    chartOptions.value = {
      ...chartOptions.value,
      xaxis: {
        ...chartOptions.value.xaxis,
        categories: categories,
      },
    }

    series.value = [
      {
        name: 'Ventas',
        data: seriesData,
      },
    ]
  },
  { immediate: true, deep: true },
)
</script>

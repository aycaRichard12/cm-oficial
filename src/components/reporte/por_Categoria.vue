<template>
  <div>
    <!-- Debug: Verificar datos -->
    <!-- <pre v-if="debug">{{ { chartOptions, series, rawData: chartData } }}</pre> -->

    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h6">Ventas por Categoría</div>
      </q-card-section>
      <q-card-section>
        <VueApexCharts
          type="bar"
          height="350"
          :options="chartOptions"
          :series="series"
        ></VueApexCharts>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFetchList } from 'src/composables/useFetchList'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import VueApexCharts from 'vue3-apexcharts'

const empresa = idempresa_md5()
// Configuración
// const debug = ref(true) // Cambiar a false en producción
const { items: vCategorias } = useFetchList(`/ventas_porCategoria/${empresa || null}`)

// Extraemos los datos limpios
const chartData = computed(() => {
  const rawData = vCategorias.value?._value || vCategorias.value || []
  return rawData.map((item) => ({
    ...item,
    // Normalizamos nombres
    categoria: item.categoria?.trim(),
    subcategoria: item.subcategoria?.trim() || null,
    // Aseguramos que total_ventas es número
    total_ventas: Number(item.total_ventas) || 0,
  }))
})

// Configuración del gráfico
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
    title: { text: 'Total de Ventas' },
    labels: {
      formatter: function (val) {
        return Math.floor(val) === val ? val : ''
      },
    },
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return `${val} unidades`
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

// Procesamos los datos cuando cambian
watch(
  chartData,
  (newData) => {
    if (!newData || newData.length === 0) {
      chartOptions.value.noData.text = 'No hay datos disponibles'
      return
    }

    // Creamos estructura jerárquica
    const categoriesMap = {}

    newData.forEach((item) => {
      if (!categoriesMap[item.categoria]) {
        categoriesMap[item.categoria] = {
          name: item.categoria,
          subcategories: [],
        }
      }

      if (item.subcategoria) {
        categoriesMap[item.categoria].subcategories.push({
          name: item.subcategoria,
          value: item.total_ventas,
        })
      } else {
        categoriesMap[item.categoria].subcategories.push({
          name: item.categoria,
          value: item.total_ventas,
        })
      }
    })

    // Preparamos datos para el gráfico
    const categories = []
    const seriesData = []

    Object.values(categoriesMap).forEach((category) => {
      category.subcategories.forEach((subcat) => {
        categories.push(
          subcat.name === category.name ? category.name : `${category.name} - ${subcat.name}`,
        )
        seriesData.push(subcat.value)
      })
    })

    // Actualizamos el gráfico
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

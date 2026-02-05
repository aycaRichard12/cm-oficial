<template>
  <div class="full-width full-height">
    <q-card flat class="shadow-2 rounded-borders full-height">
      <q-card-section class="q-pb-none">
        <div class="row items-center">
          <q-icon name="bar_chart" color="primary" size="1.5rem" class="q-mr-sm" />
          <div class="text-h6 text-weight-medium">Ventas por Categoría</div>
        </div>
      </q-card-section>
      <q-card-section class="full-height">
        <div 
          class="full-width" 
          :style="{ 
            minHeight: $q.screen.lt.md ? '300px' : $q.screen.lt.lg ? '350px' : '400px',
            height: $q.screen.lt.md ? '45vh' : $q.screen.lt.lg ? '50vh' : '60vh',
            maxHeight: '600px'
          }"
        >
          <VueApexCharts
            type="bar"
            height="100%"
            :options="chartOptions"
            :series="series"
          ></VueApexCharts>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFetchList } from 'src/composables/useFetchList'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import VueApexCharts from 'vue3-apexcharts'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const empresa = idempresa_md5()
const { items: vCategorias } = useFetchList(`/ventas_porCategoria/${empresa || null}`)

// Extraemos los datos limpios
const chartData = computed(() => {
  const rawData = vCategorias.value?._value || vCategorias.value || []
  return rawData.map((item) => ({
    ...item,
    categoria: item.categoria?.trim(),
    subcategoria: item.subcategoria?.trim() || null,
    total_ventas: Number(item.total_ventas) || 0,
  }))
})

// Configuración del gráfico con responsividad mejorada
const chartOptions = ref({
  chart: {
    type: 'bar',
    height: '100%',
    stacked: false,
    toolbar: { 
      show: true,
      tools: {
        download: true,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true
      }
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 6,
      columnWidth: '60%',
      dataLabels: {
        position: 'top',
      },
    },
  },
  dataLabels: {
    enabled: true,
    formatter: function (val) {
      return val > 0 ? val.toFixed(0) : ''
    },
    offsetY: -20,
    style: {
      fontSize: '11px',
      fontWeight: 'bold',
      colors: ['#304758'],
    },
  },
  xaxis: {
    categories: [],
    labels: {
      rotate: -45,
      rotateAlways: false,
      hideOverlappingLabels: true,
      trim: true,
      style: {
        fontSize: '11px',
        fontWeight: 500,
      },
      formatter: function (value) {
        if (!value) return ''
        return value.length > 25 ? value.substring(0, 25) + '...' : value
      },
    },
    tickPlacement: 'on',
  },
  yaxis: {
    title: { 
      text: 'Total de Ventas',
      style: {
        fontSize: '12px',
        fontWeight: 600,
      }
    },
    labels: {
      formatter: function (val) {
        return val ? val.toFixed(0) : '0'
      },
      style: {
        fontSize: '11px',
      }
    },
  },
  tooltip: {
    enabled: true,
    shared: false,
    followCursor: true,
    y: {
      formatter: function (val) {
        return `${val.toFixed(2)} unidades`
      },
    },
  },
  colors: ['#1976D2', '#00897B', '#FB8C00', '#E53935', '#8E24AA'],
  grid: {
    borderColor: '#e7e7e7',
    strokeDashArray: 4,
    xaxis: {
      lines: {
        show: false
      }
    },
    yaxis: {
      lines: {
        show: true
      }
    },
    padding: {
      top: 0,
      right: 10,
      bottom: 0,
      left: 10
    }
  },
  responsive: [
    {
      breakpoint: 1024,
      options: {
        plotOptions: {
          bar: {
            columnWidth: '70%',
          },
        },
        xaxis: {
          labels: {
            rotate: -45,
            style: {
              fontSize: '10px',
            },
          },
        },
      },
    },
    {
      breakpoint: 768,
      options: {
        plotOptions: {
          bar: {
            columnWidth: '80%',
          },
        },
        xaxis: {
          labels: {
            rotate: -90,
            style: {
              fontSize: '9px',
            },
          },
        },
        dataLabels: {
          enabled: false,
        },
      },
    },
  ],
  noData: {
    text: 'Cargando datos...',
    align: 'center',
    verticalAlign: 'middle',
    style: {
      fontSize: '14px',
    }
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
      series.value = [{ name: 'Ventas', data: [] }]
      return
    }

    // Agrupamos por subcategoría (ya que cada fila es una subcategoría)
    const categories = []
    const seriesData = []

    newData.forEach((item) => {
      // Usamos solo el nombre de la subcategoría para etiquetas más limpias
      const label = item.subcategoria || item.categoria
      categories.push(label)
      seriesData.push(item.total_ventas)
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
        name: 'Ventas por Subcategoría',
        data: seriesData,
      },
    ]
  },
  { immediate: true, deep: true },
)
</script>

<template>
  <div class="full-width full-height">
    <q-card flat class="shadow-2 rounded-borders full-height">
      <q-card-section class="q-pb-none">
        <div class="row items-center">
          <q-icon name="trending_up" color="primary" size="1.5rem" class="q-mr-sm" />
          <div class="text-h6 text-weight-medium">Productos más Vendidos</div>
        </div>
        <div class="text-caption text-grey-7 q-mt-xs">
          Ranking de productos por ingresos generados
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
          />
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
      distributed: true, // Cada barra con un color diferente
    },
  },
  dataLabels: {
    enabled: true,
    formatter: function (val) {
      return val > 0 ? val.toFixed(2) + ' Bs' : ''
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
        return value.length > 30 ? value.substring(0, 30) + '...' : value
      },
    },
    tickPlacement: 'on',
  },
  yaxis: {
    title: { 
      text: 'Ingresos (Bs)',
      style: {
        fontSize: '12px',
        fontWeight: 600,
      }
    },
    labels: {
      formatter: function (val) {
        return val ? val.toFixed(2) : '0.00'
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
        return `${val.toFixed(2)} Bs`
      },
      title: {
        formatter: () => 'Ingresos:'
      }
    },
  },
  colors: ['#1976D2', '#00897B', '#FB8C00', '#E53935', '#8E24AA', '#5E35B1', '#00ACC1', '#43A047', '#F4511E', '#6D4C41'],
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
  legend: {
    show: false // Ocultamos la leyenda ya que usamos distributed colors
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
    name: 'Ingresos',
    data: [],
  },
])

watch(
  chartData,
  (newData) => {
    if (!newData || newData.length === 0) {
      chartOptions.value.noData.text = 'No hay datos disponibles'
      series.value = [{ name: 'Ingresos', data: [] }]
      return
    }

    const categories = []
    const seriesData = []

    newData.forEach((item) => {
      categories.push(item.nombre_producto)
      seriesData.push(item.total_vendido)
    })

    chartOptions.value = {
      ...chartOptions.value,
      xaxis: {
        ...chartOptions.value.xaxis,
        categories: categories,
      },
    }

    series.value = [
      {
        name: 'Ingresos por Producto',
        data: seriesData,
      },
    ]
  },
  { immediate: true, deep: true },
)
</script>

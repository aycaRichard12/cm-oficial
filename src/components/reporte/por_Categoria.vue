<template>
  <div class="full-width full-height">
    <q-card flat class="shadow-2 rounded-borders full-height">
      <q-card-section class="q-pb-none">
        <div class="row items-center justify-between">
          <div class="row items-center">
            <q-icon name="bar_chart" color="primary" size="1.5rem" class="q-mr-sm" />
            <div class="text-h6 text-weight-medium">Ventas por Categoría</div>
          </div>
          <div class="text-caption text-grey-7 bg-grey-2 q-px-sm q-py-xs rounded-borders" v-if="periodoInfo">
            <q-icon name="event" class="q-mr-xs" />
            <span class="text-weight-bold">Periodo:</span> {{ periodoInfo }}
          </div>
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

// Extraemos los datos limpios y agregamos total_ventas por etiqueta para evitar duplicados
const chartData = computed(() => {
  const rawData = vCategorias.value?._value || vCategorias.value || []
  
  const agrupado = {}
  rawData.forEach((item) => {
    const categoria = item.categoria?.trim()
    const subcategoria = item.subcategoria?.trim() || null
    const label = subcategoria || categoria || 'Sin categoría'
    const ventas = Number(item.total_ventas) || 0

    if (!agrupado[label]) {
      agrupado[label] = {
        categoria,
        subcategoria,
        total_ventas: 0
      }
    }
    agrupado[label].total_ventas += ventas
  })

  // Retornamos un array filtrando montos 0
  return Object.values(agrupado).filter(item => item.total_ventas > 0)
})

const periodoInfo = computed(() => {
  const rawData = vCategorias.value?._value || vCategorias.value || []
  if (rawData.length === 0) return null

  // Recolectamos todas las fechas válidas (solo de categorías con ventas > 0)
  const fechasInicio = []
  const fechasFin = []

  rawData.forEach((item) => {
    if (item.total_ventas > 0) {
      if (item.fecha_inicio_conteo) fechasInicio.push(new Date(item.fecha_inicio_conteo))
      if (item.fecha_final_conteo) fechasFin.push(new Date(item.fecha_final_conteo))
    }
  })

  if (fechasInicio.length > 0 && fechasFin.length > 0) {
    const minFecha = new Date(Math.min(...fechasInicio))
    const maxFecha = new Date(Math.max(...fechasFin))
    const formato = (d) =>
      d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
    return `Del ${formato(minFecha)} al ${formato(maxFecha)}`
  }

  // Fallbacks si la API en el futuro trae otros campos de fecha
  const item = rawData[0]
  if (item.fecha_inicio && item.fecha_fin) return `Del ${item.fecha_inicio} al ${item.fecha_fin}`
  if (item.gestion && item.mes) return `Gestión: ${item.gestion} - Mes: ${item.mes}`
  if (item.gestion) return `Gestión: ${item.gestion}`
  if (item.periodo) return item.periodo

  // Sin fechas válidas → no mostrar nada
  return null
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
      return val > 0 ? val.toFixed(2) : ''
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
    title: {
      text: 'Categorías',
      style: {
        fontSize: '12px',
        fontWeight: 600,
        color: '#263238'
      }
    },
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
      text: 'Número de Ventas',
      style: {
        fontSize: '12px',
        fontWeight: 600,
      }
    },
    labels: {
      formatter: function (val) {
        return val ? val.toFixed(2) : '0'
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
        return `${val.toFixed(2)}`
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

    const categories = []
    const seriesData = []

    newData.forEach((item) => {
      // Usamos solo el nombre de la subcategoría para etiquetas más limpias
      const label = item.subcategoria || item.categoria || 'Sin categoría'
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
        name: 'Ventas',
        data: seriesData,
      },
    ]
  },
  { immediate: true, deep: true },
)
</script>

<template>
  <div class="full-width full-height">
    <q-card flat class="shadow-2 rounded-borders full-height column">
      <!-- Sección Superior: Título y Filtros -->
      <q-card-section class="q-pb-sm">
        <div class="row justify-between items-center q-col-gutter-y-md">
          <!-- Título -->
          <div class="col-12 col-md-auto">
            <div class="row items-center">
              <q-icon name="star" color="primary" size="1.5rem" class="q-mr-sm" />
              <div class="text-h6 text-weight-medium">Productos Preferidos</div>
            </div>
            <div class="text-caption text-grey-7 bg-grey-2 q-px-sm q-py-xs rounded-borders q-mt-xs inline-block">
              <q-icon name="event" class="q-mr-xs" />
              <span class="text-weight-bold">Periodo:</span> {{ periodoInfo }}
            </div>
          </div>
          
          <!-- Filtros de Fecha -->
          <div class="col-12 col-md-auto">
            <div class="row q-col-gutter-sm items-center">
              <div class="col-6 col-sm-auto">
                <q-input v-model="fechaInicio" dense outlined label="Inicio" mask="##/##/####">
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
                <q-input v-model="fechaFin" dense outlined label="Fin" mask="##/##/####">
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
                  @click="consultarFechas"
                  class="full-width"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Sección Gráfico -->
      <q-card-section class="col-grow q-pt-none">
        <div 
          class="full-width" 
          :style="{ 
            minHeight: $q.screen.lt.md ? '350px' : '400px',
            height: '100%'
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
import { ref, computed, watch, onMounted } from 'vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import VueApexCharts from 'vue3-apexcharts'
import { useQuasar, date } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()
const empresa = idempresa_md5()

// Estado Fechas
const timeStamp = Date.now()
const fechaFin = ref(date.formatDate(timeStamp, 'DD/MM/YYYY'))
const fechaInicio = ref(date.formatDate(date.subtractFromDate(timeStamp, { days: 30 }), 'DD/MM/YYYY'))

const loading = ref(false)
const rawDataAPI = ref([])

// Función de consulta a la API con fechas
const consultarFechas = async () => {
  loading.value = true
  try {
    // Transformar DD/MM/YYYY a YYYY-MM-DD
    const [diaIni, mesIni, anioIni] = fechaInicio.value.split('/')
    const inicioStr = `${anioIni}-${mesIni}-${diaIni}`

    const [diaFin, mesFin, anioFin] = fechaFin.value.split('/')
    const finStr = `${anioFin}-${mesFin}-${diaFin}`

    const endpoint = `/productos_preferidos/${empresa}/${inicioStr}/${finStr}`
    const { data } = await api.get(endpoint)
    
    // Asignación segura de respuesta
    if (Array.isArray(data)) {
      rawDataAPI.value = data
    } else if (data && Array.isArray(data.datos)) {
      rawDataAPI.value = data.datos
    } else {
      rawDataAPI.value = []
    }
  } catch (error) {
    console.error('Error al cargar reporte de productos:', error)
    $q.notify({ type: 'negative', message: 'Error cargando datos de productos' })
    rawDataAPI.value = []
  } finally {
    loading.value = false
  }
}

const chartData = computed(() => {
  const rawData = rawDataAPI.value || []
  return rawData.map((item) => ({
    ...item,
    nombre_producto: `${item.codigo?.trim() ?? ''} ${item.nombre?.trim() ?? ''}`.trim(),
    total_vendido: Number(item.total_vendido) || 0,
  }))
})

const periodoInfo = computed(() => {
  return `Del ${fechaInicio.value} al ${fechaFin.value}`
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
  title: {
    text: '', // Movido al layout superior HTML
    align: 'center'
  },
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 4,
      columnWidth: '60%',
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
      text: 'Productos',
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
        return value.length > 20 ? value.substring(0, 20) + '...' : value
      },
    },
    tickPlacement: 'on',
  },
  yaxis: {
    title: { 
      text: 'Unidades Vendidas',
      style: {
        fontSize: '12px',
        fontWeight: 600,
      }
    },
    labels: {
      formatter: function (val) {
        return Math.floor(val) === val ? val : ''
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
        return `${val} unidades`
      },
    },
  },
  colors: [
    '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0',
    '#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0',
  ],
  grid: {
    borderColor: '#e7e7e7',
    strokeDashArray: 4,
    xaxis: {
      lines: { show: false }
    },
    yaxis: {
      lines: { show: true }
    },
    padding: {
      top: 0, right: 10, bottom: 0, left: 10
    }
  },
  responsive: [
    {
      breakpoint: 1024,
      options: {
        plotOptions: {
          bar: { columnWidth: '70%' },
        },
        xaxis: {
          labels: {
            rotate: -45,
            style: { fontSize: '10px' },
          },
        },
      },
    },
    {
      breakpoint: 768,
      options: {
        plotOptions: {
          bar: { columnWidth: '80%' },
        },
        xaxis: {
          labels: {
            rotate: -90,
            style: { fontSize: '9px' },
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
      categories.push(item.nombre_producto)
      seriesData.push(item.total_vendido)
    })

    chartOptions.value = {
      ...chartOptions.value,
      xaxis: {
        ...chartOptions.value.xaxis,
        categories: categories,
      },
      subtitle: {
        text: '', // Movido al layout superior HTML
      }
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

onMounted(() => {
  consultarFechas()
})
</script>

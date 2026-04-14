<template>
  <div class="full-width full-height">
    <q-card flat class="shadow-2 rounded-borders full-height column">
      <!-- Sección Superior: Título y Filtros -->
      <q-card-section class="q-pb-sm">
        <div class="row justify-between items-center q-col-gutter-y-md">
          <!-- Título -->
          <div class="col-12 col-md-auto">
            <div class="row items-center">
              <q-icon name="bar_chart" color="primary" size="1.5rem" class="q-mr-sm" />
              <div class="text-h6 text-weight-medium">Ventas por Categoría</div>
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

    const endpoint = `/ventas_porCategoria/${empresa}/${inicioStr}/${finStr}`
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
    console.error('Error al cargar reporte de categorías:', error)
    $q.notify({ type: 'negative', message: 'Error cargando datos de categoría' })
    rawDataAPI.value = []
  } finally {
    loading.value = false
  }
}

// Extraemos los datos limpios y agregamos total_ventas por etiqueta para evitar duplicados
const chartData = computed(() => {
  const rawData = rawDataAPI.value
  
  const agrupado = {}
  rawData.forEach((item) => {
    const categoria = item.categoria?.trim() || 'Sin categoría'
    const subcategoria = item.subcategoria?.trim() || null
    const label = subcategoria || categoria
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
  // Calculamos fechas exactas si las trae, sino retornamos los strings escogidos
  return `Del ${fechaInicio.value} al ${fechaFin.value}`
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
  title: {
    text: '', // Movido al layout HTML superior
    align: 'center'
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

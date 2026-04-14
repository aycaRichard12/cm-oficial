<template>
  <div class="full-width full-height">
    <q-card flat class="shadow-2 rounded-borders full-height column">
      <!-- Sección Superior: Título y Filtros -->
      <q-card-section class="q-pb-sm">
        <div class="row justify-between items-center q-col-gutter-y-md">
          <!-- Título -->
          <div class="col-12 col-md-auto">
            <div class="row items-center">
              <q-icon name="timeline" color="teal" size="1.5rem" class="q-mr-sm" />
              <div class="text-h6 text-weight-medium">Evolución de Ventas Propias</div>
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
            type="line" 
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
import { ref, computed, watch, onMounted } from 'vue'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import VueApexCharts from 'vue3-apexcharts'
import { useQuasar, date as qDate } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()
const empresa = idempresa_md5()
const idusuario = idusuario_md5()

const timeStamp = Date.now()
const fechaFin = ref(qDate.formatDate(timeStamp, 'DD/MM/YYYY'))
const fechaInicio = ref(qDate.formatDate(qDate.subtractFromDate(timeStamp, { days: 30 }), 'DD/MM/YYYY'))

const loading = ref(false)
const rawDataAPI = ref([])

const consultarFechas = async () => {
  loading.value = true
  try {
    const [diaIni, mesIni, anioIni] = fechaInicio.value.split('/')
    const inicioStr = `${anioIni}-${mesIni}-${diaIni}`
    const [diaFin, mesFin, anioFin] = fechaFin.value.split('/')
    const finStr = `${anioFin}-${mesFin}-${diaFin}`

    const endMayorVenta = `/mayor_venta/${empresa}/${idusuario}/${inicioStr}/${finStr}`
    const { data } = await api.get(endMayorVenta)
    
    if (Array.isArray(data)) rawDataAPI.value = data
    else if (data && Array.isArray(data.datos)) rawDataAPI.value = data.datos
    else rawDataAPI.value = []

  } catch (error) {
    console.error('Error al cargar reporte:', error)
    $q.notify({ type: 'negative', message: 'Error cargando datos de indicadores' })
    rawDataAPI.value = []
  } finally {
    loading.value = false
  }
}

const periodoInfo = computed(() => `Del ${fechaInicio.value} al ${fechaFin.value}`)

const chartData = computed(() => {
  let rawData = Array.isArray(rawDataAPI.value) ? [...rawDataAPI.value] : []
  rawData.sort((a, b) => new Date(a.fecha_venta) - new Date(b.fecha_venta))
  return rawData
})

const chartOptions = ref({
  chart: {
    type: 'line', 
    height: '100%',
    toolbar: { show: true, tools: { download: true, selection: true, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true } },
    animations: { enabled: true, easing: 'easeinout', speed: 800 },
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: [3, 4] },
  fill: {
    type: ['gradient', 'solid'], 
    gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.1, stops: [0, 90, 100] }
  },
  title: { text: '', align: 'center' },
  xaxis: {
    categories: [], 
    type: 'category', 
    labels: { rotate: -45, style: { fontSize: '11px', fontWeight: 500, color: '#546E7A' } },
  },
  yaxis: [
    { title: { text: 'Total Facturado', style: { color: '#00897B', fontWeight: 600 } }, labels: { formatter: (val) => val ? val.toFixed(2) : '0', style: { colors: '#00897B' } } },
    { opposite: true, title: { text: 'Transacciones / Cantidad', style: { color: '#FB8C00', fontWeight: 600 } }, labels: { formatter: (val) => val ? Math.round(val) : '0', style: { colors: '#FB8C00' } } }
  ],
  colors: ['#00897B', '#FB8C00'],
  tooltip: {
    shared: true, intersect: false,
    y: {
      formatter: function (y, { seriesIndex }) {
        if(typeof y !== "undefined") {
          return seriesIndex === 0 ? `Bs. ${y.toFixed(2)}` : `${y} items`
        }
        return y
      }
    }
  },
  grid: { borderColor: '#e7e7e7', strokeDashArray: 4, padding: { top: 0, right: 10, bottom: 0, left: 10 } },
  legend: { 
    position: 'bottom', 
    horizontalAlign: 'center',
    itemMargin: { horizontal: 10, vertical: 8 }
  },
  noData: { text: 'Cargando datos...', align: 'center', verticalAlign: 'middle', style: { fontSize: '14px', color: '#888' } },
})

const series = ref([
  { name: 'Total Recaudado', type: 'area', data: [] },
  { name: 'Ventas', type: 'line', data: [] }
])

watch(chartData, (newData) => {
  if (!newData || newData.length === 0) {
    chartOptions.value.noData.text = 'No hay compras registradas en este periodo'
    series.value = [
      { name: 'Total Recaudado', type: 'area', data: [] },
      { name: 'Ventas', type: 'line', data: [] }
    ]
    return
  }

  const categoriesDates = []
  const dataTotals = []
  const dataQuantities = []

  newData.forEach((item) => {
    const [year, month, day] = item.fecha_venta.split('-')
    categoriesDates.push(`${day}/${month}/${year}`)
    dataTotals.push(item.total)
    dataQuantities.push(item.cantidad)
  })

  chartOptions.value = { ...chartOptions.value, xaxis: { ...chartOptions.value.xaxis, categories: categoriesDates } }
  series.value = [
    { name: 'Total Recaudado', type: 'area', data: dataTotals },
    { name: 'Ventas', type: 'line', data: dataQuantities }
  ]
}, { immediate: true, deep: true })

onMounted(() => {
  consultarFechas()
})
</script>

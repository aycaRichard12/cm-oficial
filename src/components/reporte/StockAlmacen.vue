<template>
  <div class="full-width full-height">
    <q-card flat class="shadow-2 rounded-borders full-height">
      <!-- Header -->
      <q-card-section class="q-pb-none">
        <div class="row items-center q-mb-sm">
          <q-icon name="inventory_2" color="primary" size="1.5rem" class="q-mr-sm" />
          <div class="text-h6 text-weight-medium">Stock por Almacén</div>
        </div>
        <div class="text-caption text-grey-7">Distribución de inventario por producto</div>
      </q-card-section>

      <!-- Selector de Almacén -->
      <q-card-section class="q-pt-md">
        <q-select
          v-model="almacenSeleccionado"
          :options="opcionesAlmacenes"
          label="Seleccionar almacén"
          outlined
          emit-value
          map-options
          :loading="!opcionesAlmacenes.length"
          @update:model-value="actualizarGrafico"
          class="q-mb-md"
        >
          <template v-slot:prepend>
            <q-icon name="warehouse" color="primary" />
          </template>
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> No hay almacenes disponibles </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>

      <!-- Gráfico -->
      <q-card-section v-if="mostrarGrafico">
        <div
          class="full-width"
          :style="{
            minHeight: $q.screen.lt.md ? '300px' : '400px',
            height: $q.screen.lt.md ? '40vh' : '50vh',
            maxHeight: '500px',
          }"
        >
          <VueApexCharts type="donut" height="100%" :options="chartOptions" :series="series" />
        </div>
      </q-card-section>

      <!-- Mensaje cuando no hay datos -->
      <q-card-section v-if="!mostrarGrafico">
        <div class="text-center q-py-xl">
          <q-icon
            :name="hayProductosConStockCero ? 'inventory' : 'info'"
            size="4rem"
            :color="hayProductosConStockCero ? 'warning' : 'grey-5'"
            class="q-mb-md"
          />
          <div class="text-h6 text-grey-7">
            {{
              hayProductosConStockCero
                ? 'Todos los productos tienen stock cero'
                : 'No hay productos en este almacén'
            }}
          </div>
          <div class="text-caption text-grey-6 q-mt-sm">
            {{ almacenSeleccionado || 'Seleccione un almacén para ver el stock' }}
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import VueApexCharts from 'vue3-apexcharts'
import * as funGeneral from 'src/composables/FuncionesG'

const $q = useQuasar()

// Datos reactivos
const Lista_stock = ref([])
const almacenSeleccionado = ref(null)
const opcionesAlmacenes = ref([])
const mostrarGrafico = ref(false)
const hayProductosConStockCero = ref(false)

// Computed properties
const stockPorAlmacen = computed(() => {
  return Lista_stock.value.reduce((acc, item) => {
    const almacen = item.almacen?.trim() || 'Sin Almacén'
    if (!acc[almacen]) acc[almacen] = []
    acc[almacen].push({
      producto: item.producto?.trim() || 'Sin nombre',
      stock: Number(item.stock) || 0,
      codigo: item.codigo?.trim() || 'S/C',
    })
    return acc
  }, {})
})

const productosConStock = computed(() => {
  if (!almacenSeleccionado.value || !stockPorAlmacen.value[almacenSeleccionado.value]) {
    return []
  }
  return stockPorAlmacen.value[almacenSeleccionado.value]
    .filter((item) => item.stock > 0)
    .sort((a, b) => b.stock - a.stock)
})

const totalStock = computed(() => {
  return productosConStock.value.reduce((sum, item) => sum + item.stock, 0)
})

// Configuración del gráfico mejorada
const chartOptions = ref({
  chart: {
    type: 'donut',
    height: '100%',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
    },
    toolbar: {
      show: true,
      tools: {
        download: true,
      },
    },
  },
  labels: [],
  colors: [
    '#1976D2',
    '#00897B',
    '#FB8C00',
    '#E53935',
    '#8E24AA',
    '#5E35B1',
    '#00ACC1',
    '#43A047',
    '#F4511E',
    '#6D4C41',
    '#039BE5',
    '#00897B',
    '#FFB300',
    '#E53935',
    '#8E24AA',
  ],
  legend: {
    position: $q.screen.lt.md ? 'bottom' : 'right',
    horizontalAlign: 'center',
    markers: {
      width: 12,
      height: 12,
      radius: 12,
    },
    itemMargin: {
      horizontal: 8,
      vertical: 4,
    },
    fontSize: '12px',
    fontWeight: 500,
  },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '14px',
            fontWeight: 600,
          },
          value: {
            show: true,
            fontSize: '20px',
            fontWeight: 'bold',
            formatter: (val) => val,
          },
          total: {
            show: true,
            label: 'Total Stock',
            fontSize: '14px',
            fontWeight: 600,
            color: '#304758',
            formatter: () => totalStock.value.toString(),
          },
        },
      },
    },
  },
  dataLabels: {
    enabled: true,
    formatter: function (val) {
      return val.toFixed(1) + '%'
    },
    style: {
      fontSize: '11px',
      fontWeight: 'bold',
      colors: ['#fff'],
    },
    dropShadow: {
      enabled: true,
      blur: 3,
      opacity: 0.8,
    },
  },
  tooltip: {
    enabled: true,
    y: {
      formatter: (value) => `${value} unidades`,
      title: {
        formatter: (seriesName) => seriesName,
      },
    },
  },
  responsive: [
    {
      breakpoint: 768,
      options: {
        legend: {
          position: 'bottom',
        },
        plotOptions: {
          pie: {
            donut: {
              size: '65%',
            },
          },
        },
      },
    },
  ],
})

const series = ref([])

// Función para cargar los datos
async function cargarDatos() {
  try {
    const contenidousuario = funGeneral.validarUsuario()
    const idEmpresa = contenidousuario[0]?.empresa?.idempresa
    const idusuario = contenidousuario[0]?.idusuario

    if (!idEmpresa) {
      console.error('ID de empresa no encontrado.')
      $q.notify({
        type: 'negative',
        message: 'No se pudo obtener la información de la empresa',
      })
      return
    }

    Lista_stock.value = await funGeneral.consultar_api(
      'stock_productos_dashboard',
      `${idEmpresa}/${idusuario}`,
    )

    if (Lista_stock.value?.length > 0) {
      opcionesAlmacenes.value = Object.keys(stockPorAlmacen.value)
      if (opcionesAlmacenes.value.length > 0) {
        almacenSeleccionado.value = opcionesAlmacenes.value[0]
        actualizarGrafico()
      }
    } else {
      $q.notify({
        type: 'info',
        message: 'No hay datos de stock disponibles',
      })
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los datos de stock',
    })
  }
}

// Función para actualizar el gráfico
function actualizarGrafico() {
  if (!almacenSeleccionado.value || !stockPorAlmacen.value[almacenSeleccionado.value]) {
    mostrarGrafico.value = false
    hayProductosConStockCero.value = false
    return
  }

  const productos = stockPorAlmacen.value[almacenSeleccionado.value]
  const tieneStockCero = productos.some((item) => item.stock === 0)

  if (productosConStock.value.length > 0) {
    // Mostrar gráfico con productos que tienen stock
    chartOptions.value = {
      ...chartOptions.value,
      labels: productosConStock.value.map((p) => `${p.codigo} - ${p.producto}`),
    }
    series.value = productosConStock.value.map((p) => p.stock)
    mostrarGrafico.value = true
    hayProductosConStockCero.value = false
  } else if (tieneStockCero) {
    // Mostrar mensaje para stock cero
    mostrarGrafico.value = false
    hayProductosConStockCero.value = true
  } else {
    // No hay productos
    mostrarGrafico.value = false
    hayProductosConStockCero.value = false
  }
}

onMounted(() => {
  cargarDatos()
})
</script>

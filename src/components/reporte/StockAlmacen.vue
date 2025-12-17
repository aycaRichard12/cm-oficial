<template>
  <div class="stock-almacen-container">
    <!-- Selector de almacén -->
    <q-select
      v-model="almacenSeleccionado"
      :options="opcionesAlmacenes"
      label="Seleccionar almacén"
      outlined
      dense
      class="q-mb-md"
      @update:model-value="actualizarGrafico"
    />

    <!-- Título del gráfico -->
    <h4 class="text-center q-mb-md">Stock {{ almacenSeleccionado || '' }}</h4>

    <!-- Gráfico -->
    <div v-if="mostrarGrafico">
      <apexchart type="donut" :options="chartOptions" :series="series" height="350"></apexchart>
    </div>

    <!-- Mensaje cuando no hay datos -->
    <div v-if="!mostrarGrafico" class="text-center q-mt-lg">
      <div v-if="hayProductosConStockCero">
        Todos los productos en este almacén tienen stock cero
      </div>
      <div v-else>No hay productos en este almacén</div>
    </div>

    <!-- Depuración -->
    <div class="q-mt-md" v-if="debugMode">
      <pre>Productos con stock: {{ productosConStock.length }}</pre>
      <pre>Total stock: {{ totalStock }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import * as funGeneral from 'src/composables/FuncionesG'

const debugMode = ref(true) // Cambiar a false en producción

// Datos reactivos
const Lista_stock = ref([])
const almacenSeleccionado = ref(null)
const opcionesAlmacenes = ref([])
const mostrarGrafico = ref(false)
const hayProductosConStockCero = ref(false)

// Computed properties
const stockPorAlmacen = computed(() => {
  return Lista_stock.value.reduce((acc, item) => {
    if (!acc[item.almacen]) acc[item.almacen] = []
    acc[item.almacen].push({
      producto: item.producto.trim(),
      stock: Number(item.stock),
      codigo: item.codigo,
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

// Configuración del gráfico
const chartOptions = ref({
  chart: {
    type: 'donut',
    animations: {
      enabled: true,
    },
  },
  labels: [],
  colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0'],
  legend: {
    position: 'right',
    markers: {
      width: 10,
      height: 10,
      radius: 10,
    },
    itemMargin: {
      horizontal: 5,
      vertical: 5,
    },
    fontSize: '12px',
  },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total Stock',
            formatter: () => totalStock.value.toString(),
          },
        },
      },
    },
  },
  dataLabels: {
    enabled: true,
    formatter: function (val, { seriesIndex, w }) {
      return `${w.config.labels[seriesIndex]}: ${val}`
    },
    style: {
      fontSize: '12px',
      fontWeight: 'bold',
    },
  },
  tooltip: {
    y: {
      formatter: (value) => `${value} unidades`,
    },
  },
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
    }
  } catch (error) {
    console.error('Error al cargar datos:', error)
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
      labels: productosConStock.value.map((p) => `${p.producto} (${p.codigo})`),
      title: {
        text: `Stock en ${almacenSeleccionado.value}`,
        align: 'center',
      },
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

<style scoped>
.stock-almacen-container {
  width: 100%;
  height: 100%;
  padding: 16px;
}
</style>

<template>
  <q-page padding>
    
    <div class="row items-center justify-between q-mb-md q-ml-sm titulo">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-primary text-weight-bold flex items-center">
          <q-icon name="point_of_sale" size="md" class="q-mr-sm" />
          {{ $t('ui.ventas-pendientes-3e0afc') }}
        </div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">
          {{ $t('ui.administracion-de-ventas-pendientes-f82be9') }}
        </div>
      </div>
    </div>
    <!-- Filtros -->
    <q-card-section class="row q-col-gutter-md">
      <div class="col-xs-12 col-sm-4" id="filtrosAlmacen">
        <label for="almacen">{{ $t('ui.selecciona-un-almacen-ba685d') }}</label>
        <q-select
          v-model="almacenSeleccionado"
          :options="almacenOptions"
          id="almacen"
          emit-value
          map-options
          @update:model-value="cargarProductos"
          dense
          outlined
          bg-color="white"
        />
      </div>

      <div class="col-xs-12 col-sm-4" id="filtrosProducto">
        <label for="producto">{{ $t('ui.producto-814df9') }}</label>
        <q-select
          v-if="!loading && !error"
          v-model="productoSeleccionado"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
          id="producto"
          outlined
          :options="filteredProductos"
          @filter="filtrarProductos"
          clearable
          dense
          bg-color="white"
        />
      </div>
      <div class="col-xs-12 col-sm-4" id="filtrosEstado">
        <label for="estado">{{ $t('ui.filtrar-por-estado-e18f86') }}</label>
        <q-select
          v-model="filterStatus"
          :options="statusOptions"
          id="estado"
          emit-value
          map-options
          dense
          outlined
          bg-color="white"
        />
      </div>
    </q-card-section>

    <!-- Spinner de carga -->
    <q-card-section v-if="loading" class="flex flex-center">
      <q-spinner color="primary" size="3em" />
      <div class="q-ml-md">{{ $t('ui.cargando-ventas-pendientes-fd3043') }}</div>
    </q-card-section>

    <!-- Tabla de ventas -->
    <q-card-section v-else>
      <q-table
        id="tablaVentasPendientes"    
        :rows="filteredSales"
        :columns="columns"
        row-key="id_ventas_no_despachadas"
        :no-data-label="noDataMessage"
        flat
        :title="$t('ui.ventas-pendientes-017dc2')"
      >
        <!-- Slot para la columna 'estado' -->
        <template v-slot:body-cell-estado="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.estado === 2 ? 'orange' : 'green'"
              :label="props.row.estado === 2 ? $t('ui.en-proceso-850b53') : $t('ui.finalizado-8deb18')"
            />
          </q-td>
        </template>

        <!-- Slot para la columna 'accion' -->
        <template v-slot:body-cell-accion="props">
          <q-td :props="props">
            <q-btn
              id="procesarVenta"
              v-if="props.row.estado === 2"
              :label="$t('ui.procesar-15761a')"
              color="primary"
              @click="confirmProcess(props.row)"
              size="sm"
              rounded
              no-caps
            />
          </q-td>
        </template>
      </q-table>
    </q-card-section>

    <!-- Diálogo de confirmación para procesar venta -->
    <q-dialog v-model="showConfirmDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span class="q-ml-sm">{{ $t('ui.esta-seguro-de-que-desea-procesar-esta-venta-9a216b') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" @click="showConfirmDialog = false" />
          <q-btn flat :label="$t('ui.procesar-15761a')" color="primary" @click="processConfirmedSale" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
import { useProductosDisponibleAlmacen } from 'src/stores/productosDisponibles'
import { useAlmacenStore } from 'src/stores/listaResponsableAlmacen'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { storeToRefs } from 'pinia'
import { api } from 'src/boot/axios'
import emitter from 'src/event-bus'
import { verificarexistenciapagina } from 'src/composables/FuncionesG'
import { useCompraStore } from 'src/stores/compras'

const idmd5 = ref('')
const productosStore = useProductosDisponibleAlmacen()
const almacenes = useAlmacenStore()
const compraStore = useCompraStore()
const filteredProductos = ref([])
const productoSeleccionado = ref(null)
const almacenSeleccionado = ref(null)
const almacenOptions = computed(() => {
  const options = []
  almacenes.almacenes.forEach((almacen) => {
    options.push({ label: almacen.almacen, value: Number(almacen.idalmacen) })
  })
  return options
})
async function cargarProductos(idAlmacen) {
  if (!idAlmacen) return
  await productosStore.listaProductos(idAlmacen)
}
const { productos, loading, error } = storeToRefs(productosStore)

function filtrarProductos(val, update) {
  if (val === '') {
    update(() => {
      filteredProductos.value = productos.value
    })
    return
  }
  console.log(productos.value)
  update(() => {
    const filtro = val.toLowerCase()
    filteredProductos.value = productos.value.filter((prod) =>
      prod.label.toLowerCase().includes(filtro),
    )
  })
}
// Instancia de Quasar para notificaciones
const $q = useQuasar()

// --- Estados reactivos ---
const sales = ref([]) // Almacena todas las ventas obtenidas de la API
const filterStatus = ref('all') // Filtro por estado (todos, 2: en proceso, 1: finalizado)
const successMessage = ref('') // Mensaje de éxito para banners
const errorMessage = ref('') // Mensaje de error para banners
const showConfirmDialog = ref(false) // Controla la visibilidad del diálogo de confirmación
const saleToProcess = ref(null) // Almacena la venta seleccionada para procesar

// --- Opciones para los filtros ---
const statusOptions = [
  { label: i18nT('ui.todos-a4114a'), value: 'all' },
  { label: i18nT('ui.en-proceso-850b53'), value: 2 },
  { label: i18nT('ui.finalizado-8deb18'), value: 1 },
]

// --- Columnas de la q-table ---
const columns = [
  {
    name: 'fecha_venta',
    label: i18nT('ui.fecha-venta-b43c55'),
    field: 'fecha_venta',
    align: 'left',
    sortable: true,
    cambiarFormatoFecha: (val) => (val ? cambiarFormatoFecha(val) : ''),
  },
  { name: 'producto', label: i18nT('inventario.product'), field: 'producto', align: 'left', sortable: true },
  { name: 'almacen', label: i18nT('inventario.warehouse'), field: 'almacen', align: 'left', sortable: true },
  {
    name: 'cantidad_pendiente',
    label: i18nT('ui.cantidad-pendiente-453b75'),
    field: 'cantidad_pendiente',
    align: 'left',
    sortable: true,
  },
  {
    name: 'precio_unitario',
    label: i18nT('ui.precio-unitario-fd8ab0'),
    field: 'precio_unitario',
    align: 'left',
    sortable: true,
  },

  { name: 'estado', label: i18nT('cotizacion.table.status'), field: 'estado', align: 'center', sortable: true },
  { name: 'accion', label: i18nT('ui.accion-d7927a'), field: 'accion', align: 'center' },
]

// --- Propiedades computadas para filtros ---

// Obtiene los almacenes únicos para el filtro

// Filtra las ventas según los criterios seleccionados
const filteredSales = computed(() => {
  if (!almacenSeleccionado.value) return []
  let tempSales = sales.value

  // Filtrar por estado
  if (filterStatus.value !== 'all') {
    tempSales = tempSales.filter((sale) => sale.estado === filterStatus.value)
  }

  // Filtrar por almacén
  if (almacenSeleccionado.value) {
    tempSales = tempSales.filter((sale) => sale.id_almacen === almacenSeleccionado.value)
  }

  console.log(productoSeleccionado.value?.value)
  // Filtrar por nombre de producto
  if (productoSeleccionado.value) {
    console.log(tempSales)

    tempSales = tempSales.filter((sale) => {
      return (
        Number(sale?.productos_almacen_id_productos_almacen) ===
        Number(productoSeleccionado.value?.value)
      )
    })
  }

  return tempSales
})

// Mensaje a mostrar si no hay datos después de aplicar filtros
const noDataMessage = computed(() => {
  if (loading.value) {
    return 'Cargando datos...'
  }
  if (sales.value.length === 0) {
    return 'No hay ventas pendientes de despacho.'
  }
  if (filteredSales.value.length === 0) {
    return 'No se encontraron resultados con los filtros aplicados.'
  }
  return 'No hay datos disponibles.' // Fallback
})

// --- Funciones de API y lógica de negocio ---

// Función para cargar las ventas desde la API
const fetchSales = async () => {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  try {
    const response = await api.get(`listar_ventas_no_despachadas/${idempresa_md5()}`)
    console.log('listado de ventas no despachadas', response)
    if (response.data.status === 'ok') {
      sales.value = response.data.ventas
    } else {
      errorMessage.value =
        'Error al obtener las ventas: ' + (response.data.message || i18nT('ui.respuesta-inesperada-c4b450'))
      sales.value = []
    }
  } catch (error) {
    console.error('Error fetching sales:', error)
    errorMessage.value = 'No se pudo conectar con la API para obtener las ventas.'
    sales.value = []
  } finally {
    loading.value = false
  }
}

// Abre el diálogo de confirmación antes de procesar una venta
const confirmProcess = (sale) => {
  saleToProcess.value = sale
  showConfirmDialog.value = true
}

// Procesa la venta confirmada
const processConfirmedSale = async () => {
  showConfirmDialog.value = false // Cierra el diálogo
  if (!saleToProcess.value) return

  const { id_ventas_no_despachadas, productos_almacen_id_productos_almacen, cantidad_pendiente } =
    saleToProcess.value
  const apiUrl = `procesar_ventas_pendientes/${id_ventas_no_despachadas}/${productos_almacen_id_productos_almacen}/${cantidad_pendiente}`

  $q.notify({
    message: i18nT('ui.procesando-venta-98a5be'),
    color: 'info',
    icon: 'hourglass_empty',
    timeout: 5000, // No se cierra automáticamente
    spinner: true,
  })

  try {
    const response = await api.get(apiUrl) // Asumiendo que es un GET, si es POST, cambiar a axios.post
    console.log(response)
    if (response.data.estado === 'ok') {
      $q.notify({
        message: i18nT('ui.venta-procesada-exitosamente-0974d1'),
        color: 'positive',
        icon: 'check_circle',
      })
      successMessage.value = 'Venta procesada exitosamente.'
      // Recargar la tabla después de procesar la venta
      await fetchSales()
    } else {
      const datosCompra = {
        idproducto: productos_almacen_id_productos_almacen,
        cantidad: cantidad_pendiente,
      }
      const compra = verificarexistenciapagina('registrarcompra')
      compraStore.registrarCompra(datosCompra)
      emitter.emit('abrir-submenu', compra)

      $q.notify({
        message:
          i18nT('ui.error-al-procesar-la-venta-6ba15f') + (response.data.mensaje || i18nT('ui.respuesta-inesperada-c4b450')),
        color: 'negative',
        icon: 'error',
      })
      errorMessage.value =
        'Error al procesar la venta: ' + (response.data.mensaje || i18nT('ui.respuesta-inesperada-c4b450'))
    }
  } catch (error) {
    console.error('Error processing sale:', error)
    $q.notify({
      message: i18nT('ui.no-se-pudo-conectar-con-la-api-para-procesar-la-vent-d102b1'),
      color: 'negative',
      icon: 'error',
    })
    errorMessage.value = 'No se pudo conectar con la API para procesar la venta.'
  } finally {
    $q.notify({ timeout: 1 }) // Cierra la notificación de "Procesando"
    saleToProcess.value = null // Limpiar la venta a procesar
  }
}

// --- Ciclo de vida del componente ---
onMounted(() => {
  fetchSales()
  const storedMd5 = idusuario_md5()

  if (storedMd5) {
    idmd5.value = storedMd5
    almacenes.listaAlmacenes()
  } else {
    $q.notify({
      type: 'negative',
      message: i18nT('ui.id-md5-no-encontrado-asegurate-de-iniciar-sesion-cor-e2a61f'),
      timeout: 5000,
    })
  }

  if (almacenSeleccionado.value) {
    cargarProductos(almacenSeleccionado.value)
  }
})

watch(
  () => almacenOptions.value,
  (newOptions) => {
    if (newOptions.length > 0 && !almacenSeleccionado.value) {
      almacenSeleccionado.value = newOptions[0].value
      cargarProductos(almacenSeleccionado.value)
    }
  },
  { immediate: true },
)
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>

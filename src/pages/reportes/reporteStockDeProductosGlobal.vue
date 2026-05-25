<template>
  <q-page class="q-pa-md">
    <!-- Título mejorado -->
    <div class="titulo flex items-center q-mb-md">
      <q-icon name="inventory_2" size="32px" color="primary" class="q-mr-sm" />
      <div class="text-h4 text-weight-bold text-primary">Stock Productos Global</div>
    </div>
    <q-separator class="q-mb-lg" />

    <!-- Almacén seleccionado como chip moderno -->
    <div v-if="nombreAlmacenSeleccionado" class="row justify-center q-mb-lg">
      <q-chip outline color="primary" icon="warehouse" class="q-px-md">
        Almacén: {{ nombreAlmacenSeleccionado }}
      </q-chip>
    </div>

    <!-- Filtros unificados - Card mejorada -->
    <q-card class="q-mb-md rounded-borders shadow-2" bordered flat>
      <q-card-section class="q-pa-md">
        <div class="row q-col-gutter-md items-end">
          <!-- Fecha Final -->
          <div class="col-12 col-md-2" id="fechaFinal">
            <q-input
              v-model="fechaFin"
              label="Fecha Final*"
              type="date"
              stack-label
              outlined
              dense
              class="rounded-borders"
              @update:model-value="generarReporte"
            >
              <template v-slot:prepend>
                <q-icon name="event" color="primary" />
              </template>
            </q-input>
          </div>

          <!-- Almacén -->
          <div class="col-12 col-md-2" id="almacen">
            <q-select
              v-model="almacenSeleccionado"
              :options="opcionesAlmacenes"
              option-label="nombre"
              option-value="id"
              emit-value
              map-options
              label="Almacén*"
              dense
              outlined
              class="rounded-borders"
              @update:model-value="cargarCategoriasPrecio"
            >
              <template v-slot:prepend>
                <q-icon name="store" color="primary" />
              </template>
            </q-select>
          </div>

          <!-- Categoría de precio -->
          <div class="col-12 col-md-3" id="categoriaPrecio">
            <div class="text-caption text-weight-medium text-grey-7 q-mb-xs">
              Categoría de precio
            </div>
            <q-select
              v-model="categoriaPrecioSeleccionada"
              :options="categoriasPrecio"
              id="categoria"
              emit-value
              map-options
              :loading="cargandoCategorias"
              :disable="!almacenSeleccionado"
              outlined
              dense
              class="rounded-borders"
              @update:model-value="generarReporte"
            >
              <template v-slot:prepend>
                <q-icon name="category" color="primary" />
              </template>
            </q-select>
          </div>

          <!-- Estado -->
          <div class="col-12 col-md-2" id="estado">
            <q-select
              v-model="filtroEstado"
              :options="opcionesEstado"
              label="Estado"
              dense
              outlined
              emit-value
              map-options
              class="rounded-borders"
              @update:model-value="filtrarYOrdenarDatos"
            >
              <template v-slot:prepend>
                <q-icon name="check_circle" color="primary" />
              </template>
            </q-select>
          </div>

          <!-- Ordenar Stock -->
          <div class="col-12 col-md-2" id="ordenStock">
            <q-select
              v-model="ordenStock"
              :options="opcionesOrden"
              label="Ordenar Stock"
              dense
              outlined
              emit-value
              map-options
              class="rounded-borders"
              @update:model-value="filtrarYOrdenarDatos"
            >
              <template v-slot:prepend>
                <q-icon name="swap_vert" color="primary" />
              </template>
            </q-select>
          </div>
        </div>

        <!-- Botón de acción -->
        <div class="row justify-end q-mt-lg">
          <q-btn
            color="primary"
            label="Vista previa del Reporte"
            icon="picture_as_pdf"
            icon-right="chevron_right"
            class="rounded-borders shadow-1 q-px-md"
            no-caps
            unelevated
            @click="mostrarVistaPrevia"
            id="vistaPrevia"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla de resultados con separación visual -->
    <div class="q-mt-md">
      <StockGlobalTable
        ref="stockTableRef"
        id="tablaResultados"
        :rows="datosFiltrados"
        :columns="columnas"
        :sumatoriaStock="sumatoriaStock"
        :sumatoriaCostoTotal="sumatoriaCostoTotal"
      />
    </div>

    <!-- Modal de vista previa PDF -->
    <StockGlobalPdfModal v-model:modelValue="mostrarModal" :pdfData="pdfData" />
  </q-page>
</template>

<style scoped>
/* Mejoras visuales adicionales manteniendo compatibilidad */
.titulo {
  position: relative;
}

/* Transición suave para botones */
.q-btn {
  transition: all 0.2s ease-in-out;
}

.q-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

/* Enfoque más visible en inputs */
.q-field--outlined .q-field__control:focus,
.q-field--outlined .q-field__control--focused {
  border-width: 2px;
  border-color: var(--q-primary) !important;
  box-shadow: 0 0 0 2px rgba(var(--q-primary-rgb), 0.1);
}

/* Mejor espaciado en móvil */
@media (max-width: 767px) {
  .q-page {
    padding: 12px !important;
  }
  .q-chip {
    font-size: 0.9rem;
  }
}

/* Separador sutil */
.q-separator {
  background: linear-gradient(90deg, transparent, var(--q-primary), transparent);
  height: 2px;
}

/* Estilo para labels personalizados */
.text-caption {
  letter-spacing: 0.3px;
  font-weight: 500;
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { obtenerFechaActualDato } from 'src/composables/FuncionesG'
import { PDFreporteStockProductosIndividual } from 'src/utils/pdfs/StockProductoGlobal/reporte'

// Importar componentes refactorizados
// import StockGlobalParams from 'src/components/reporte/stockGlobal/StockGlobalParams.vue'
// import StockGlobalFilters from 'src/components/reporte/stockGlobal/StockGlobalFilters.vue'
import StockGlobalTable from 'src/components/reporte/stockGlobal/StockGlobalTable.vue'
import StockGlobalPdfModal from 'src/components/reporte/stockGlobal/StockGlobalPdfModal.vue'

const stockTableRef = ref(null)
import { useCurrencyStore } from 'src/stores/currencyStore'

const divisaActiva = useCurrencyStore().simbolo
const categoriasPrecio = ref([])
const pdfData = ref(null)
const mostrarModal = ref(false)
const fechaFin = ref(obtenerFechaActualDato())
const $q = useQuasar()
const almacenSeleccionado = ref(null)
const categoriaPrecioSeleccionada = ref(null)
const cargandoCategorias = ref(false)
const opcionesAlmacenes = ref([])
const datosOriginales = ref([])
const datosFiltrados = ref([])
const filtroEstado = ref(0)
const ordenStock = ref(1)
const nombreAlmacenSeleccionado = ref('')
const idempresa = idempresa_md5()

const opcionesEstado = [
  { label: 'Todos', value: 0 },
  { label: 'Activos', value: 1 },
  { label: 'Inactivos', value: 2 },
]

const opcionesOrden = [
  { label: 'Descendente', value: 1 },
  { label: 'Ascendente', value: 2 },
]

const columnas = [
  {
    name: 'numero',
    label: 'N°',
    align: 'center',
    field: 'numero',
    datatype: 'text',
  },
  {
    name: 'codigo',
    label: 'Código',
    field: 'codigo',
    align: 'left',
    datatype: 'text',
  },
  {
    name: 'producto',
    label: 'Producto',
    field: 'producto',
    align: 'left',
    datatype: 'text',
  },
  {
    name: 'categoria',
    label: 'Categoría',
    field: 'categoria',
    align: 'left',
    datatype: 'text',
  },
  {
    name: 'subcategoria',
    label: 'Subcategoría',
    field: 'subcategoria',
    align: 'left',
    datatype: 'text',
  },
  {
    name: 'descripcion',
    label: 'Descripción',
    field: 'descripcion',
    align: 'left',
    datatype: 'text',
  },
  {
    name: 'unidad',
    label: 'Unidad de Medida',
    field: 'unidad',
    align: 'left',
    datatype: 'text',
  },
  {
    name: 'pais',
    label: 'País de Origen',
    field: 'pais',
    align: 'left',
    datatype: 'text',
  },
  {
    name: 'stock',
    label: 'Stock Disponible',
    field: 'stock',
    align: 'right',
    datatype: 'number',
    format: (val) => new Intl.NumberFormat('es-ES').format(val),
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'left',
    datatype: 'text',
  },
  {
    name: 'costounitario',
    label: `Costo Unitario (${divisaActiva})`,
    field: 'costounitario',
    format: (val) => formatearDecimal(val),
    align: 'right',
    datatype: 'number',
  },
  {
    name: 'precioSugerido',
    label: `Precio de Venta (${divisaActiva})`,
    field: 'precioSugerido',
    format: (val) => formatearDecimal(val),
    align: 'right',
    datatype: 'number',
  },
  {
    name: 'costototal',
    label: `Costo Total Inventario (${divisaActiva})`,
    align: 'right',
    field: 'costototal',
    datatype: 'number',
    format: (val) => formatearDecimal(val),
  },
  {
    name: 'costototalventa',
    label: `Valor Total Venta (${divisaActiva})`,
    align: 'right',
    field: 'costototalventa',
    datatype: 'number',
    format: (val) => formatearDecimal(val),
  },
]

const sumatoriaStock = computed(() => {
  return formatearDecimal(
    datosFiltrados.value.reduce((sum, dato) => sum + parseFloat(dato.stock || 0), 0),
  )
})

const sumatoriaCostoTotal = computed(() => {
  return formatearDecimal(
    datosFiltrados.value.reduce(
      (sum, dato) => sum + parseFloat(dato.costounitario || 0) * parseFloat(dato.stock || 0),
      0,
    ),
  )
})

onMounted(async () => {
  await cargarAlmacenes()
  // await generarReporte()
})
async function cargarCategoriasPrecio() {
  if (almacenSeleccionado.value) {
    const idalmacen = Number(almacenSeleccionado.value)

    try {
      cargandoCategorias.value = true
      categoriaPrecioSeleccionada.value = null

      const endpoint = `listarCategoriaPrecioVenta/${idempresa}`
      const { data } = await api.get(endpoint)
      console.log('categoriasPrecio', data)

      if (data[0] === 'error') throw new Error(data.error || 'Error al cargar categorías')

      categoriasPrecio.value = data
        .filter((item) => item.estado == 1 && item.idalmacen == idalmacen)
        .map((item) => ({
          label: item.nombre,
          value: item.id,
        }))

      if (categoriasPrecio.value.length > 0) {
        categoriaPrecioSeleccionada.value = categoriasPrecio.value[0].value

        // Generar el reporte con los filtros por defecto
        await generarReporte()
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error)
      $q.notify({
        type: 'negative',
        message: 'Error al cargar las categorías de precio',
      })
    } finally {
      cargandoCategorias.value = false
    }
  } else {
    console.error('Almacén seleccionado es nulo, no se pueden cargar categorías.')
  }
}
async function cargarAlmacenes() {
  try {
    const response = await api.get(`listaAlmacen/${idempresa}`)
    console.log(response)
    if (Array.isArray(response.data)) {
      opcionesAlmacenes.value = response.data
        .filter((almacen) => Number(almacen.estado) === 1)
        .map((almacen) => ({
          ...almacen,
          label: almacen.nombre,
          value: almacen.id,
        }))
    }

    // Seleccionar el primer almacén por defecto
    if (opcionesAlmacenes.value.length > 0) {
      almacenSeleccionado.value = opcionesAlmacenes.value[0].id

      // Cargar categorías para ese almacén (esto antes no se hacía automáticamente)
      await cargarCategoriasPrecio()

      // Una vez cargadas las categorías, seleccionar la primera
      if (categoriasPrecio.value.length > 0) {
        categoriaPrecioSeleccionada.value = categoriasPrecio.value[0].value

        // Generar el reporte con los filtros por defecto
        await generarReporte()
      }
    }
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la lista de almacenes',
    })
  }
}

async function generarReporte() {
  if (!almacenSeleccionado.value) {
    datosOriginales.value = []
    datosFiltrados.value = []
    // $q.notify({
    //   type: 'warning',
    //   message: 'Seleccione un almacén',
    // })
    return
  }

  try {
    const point = `reporteproductoalmacen/${almacenSeleccionado.value}/${idempresa}/${fechaFin.value}`
    const response = await api.get(`${point}`)
    console.log('reporteStockDeProductosGlobal', response.data)

    if (!Array.isArray(response.data)) {
      datosOriginales.value = []
    } else {
      const data = response.data.filter((item) => {
        console.log(categoriaPrecioSeleccionada.value)
        console.log(item.idCategoriaPrecio)
        if (categoriaPrecioSeleccionada.value) {
          return Number(item.idCategoriaPrecio) === Number(categoriaPrecioSeleccionada.value)
        }
        return true
      })
      datosOriginales.value = data.map((item, index) => ({
        id: item.id,
        almacen: item.almacen,
        codigo: item.codigo,
        codigobarra: item.codigobarra,
        precioSugerido: item.precioSugerido,
        idCategoriaPrecio: item.idCategoriaPrecio,
        CategoriaPrecio: item.CategoriaPrecio,
        producto: item.producto,
        descripcion: item.descripcion,
        detalle: item.detalle,
        unidad: item.unidad,
        caracteristica: item.caracteristica,
        stockminimo: item.stockminimo,
        stock: item.stock,
        fecha: item.fecha,
        idalmacen: item.idalmacen,
        medida: item.medida,
        idproducto: item.idproducto,
        estadoproducto: item.estadoproducto,
        stockmaximo: item.stockmaximo,
        idcategoria: item.idcategoria,
        idsubcategoria: item.idsubcategoria,
        categoria: item.categoria,
        subcategoria: item.subcategoria,
        costounitario: item.costounitario,
        pais: item.pais,
        numero: index + 1,
        idstock: item.idstock ?? 0, // reemplaza null por 0
        imagen: item.imagen && item.imagen !== 'undefined' ? item.imagen : '', // reemplaza 'undefined'
        costototal: parseFloat(item.costounitario || 0) * parseFloat(item.stock || 0),
        costototalventa: parseFloat(item.precioSugerido || 0) * parseFloat(item.stock || 0),
        estado: estadoTexto(item.estado),
        estadoOriginal: item.estado, // Guardar el estado original para filtrado posterior
      }))
    }

    filtrarYOrdenarDatos()

    // Guardar nombre del almacén seleccionado
    const almacen = opcionesAlmacenes.value.find((a) => a.id === almacenSeleccionado.value)
    nombreAlmacenSeleccionado.value = almacen ? almacen.nombre : ''
  } catch (error) {
    console.error('Error al generar reporte:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar el reporte',
    })
  }
}

function filtrarYOrdenarDatos() {
  // Aplicar filtro
  let datos = [...datosOriginales.value]

  if (filtroEstado.value !== 0) {
    if (Number(filtroEstado.value) === 1) {
      datos = datos.filter((item) => {
        //console.log('Filtrando por estado activo, item.estado:', item.estadoOriginal)
        return Number(item.estadoOriginal) === 1
      })
    } else {
      datos = datos.filter((item) => Number(item.estadoOriginal) !== 1)
    }
  }

  // Aplicar orden por stock
  // 1: Descendente, 2: Ascendente
  if (Number(ordenStock.value) === 2) {
    datos.sort((a, b) => parseFloat(a.stock || 0) - parseFloat(b.stock || 0))
  } else {
    datos.sort((a, b) => parseFloat(b.stock || 0) - parseFloat(a.stock || 0))
  }

  datosFiltrados.value = datos
}

async function mostrarVistaPrevia() {
  if (!almacenSeleccionado.value) {
    $q.notify({
      type: 'warning',
      message: 'Seleccione un almacén',
    })
    return
  }
  await generarReporte()
  if (!datosFiltrados.value.length) {
    $q.notify({
      type: 'warning',
      message: 'No hay datos para mostrar',
    })
    return
  }

  // Obtener el estado actual de la tabla (datos filtrados + columnas visibles)
  const datosDeLaTabla = stockTableRef.value?.obtenerDatosFiltrados() ?? datosFiltrados.value
  const columnasDeLaTabla = stockTableRef.value?.obtenerColumnasVisibles() ?? []

  const doc = PDFreporteStockProductosIndividual(datosDeLaTabla, columnasDeLaTabla)
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}

// Funciones de utilidad
// function formatearFecha(fecha) {
//   return date.formatDate(fecha, 'DD/MM/YYYY')
// }

function formatearDecimal(valor) {
  return parseFloat(valor || 0).toFixed(2)
}

// function calcularCostoTotal(item) {
//   return parseFloat(item.costounitario || 0) * parseFloat(item.stock || 0)
// }

function estadoTexto(estado) {
  //console.log('estadoTexto', estado)
  const estadoOriginal = Number(estado) === 1 ? 'Activo' : 'Inactivo'
  //console.log('estadoTexto - estadoOriginal', estadoOriginal)
  return estadoOriginal
}
</script>

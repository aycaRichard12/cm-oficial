<template>
  <q-form @submit="handleFormSubmit" ref="form" v-if="localData.autorizacion == 2">
    <div class="row q-col-gutter-x-md">
      <!-- Selector de producto -->
      <div class="col-12 col-md-6">
        <div v-if="isEditing">
          <label for="producto">{{ $t('ui.producto-814df9') }}</label>
          <q-input
            v-model="localData.descripcion"
            id="producto"
            dense
            outlined
            class="full-width"
            disable
          />
        </div>
        <div v-if="!isEditing">
          <label for="producto">{{ $t('ui.producto-a10475') }}</label>
          <div class="row items-center no-wrap">
            <q-select
              use-input
              hide-dropdown-icon
              v-model="localData.idproductoalmacen"
              :options="productosFiltrados"
              @filter="filtrarProductos"
              id="producto"
              outlined
              emit-value
              map-options
              option-label="label"
              option-value="value"
              :rules="[(val) => !!val || $t('common.required')]"
              dense
              clearable
              class="col"
            />
            <q-btn
              icon="refresh"
              color="primary"
              flat
              dense
              class="q-ml-sm"
              @click="getProductosDisponibles(props.modelValue)"
            >
              <q-tooltip>{{ $t('ui.recargar-productos-894528') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>

      <div class="col-md-2 col-12">
        <label for="stock">{{ $t('ui.stock-origen-2ef57d') }}</label>
        <q-input id="stock" v-model="localData.stockOrigen" disable dense outlined />
      </div>
      <div class="col-md-2 col-12">
        <label for="stock_destino">{{ $t('ui.stock-destino-085628') }}</label>
        <q-input id="stock_destino" v-model="localData.stockDestino" disable dense outlined />
      </div>

      <div v-if="!ConfiguracionProductoVariante" class="col-md-2 col-6">
        <label for="cantidad">{{ $t('ui.cantidad-b5b6f8') }}</label>
        <q-input
          id="cantidad"
          v-model.number="localData.cantidad"
          type="number"
          :rules="[
            (val) => !!val || $t('common.required'), 
            (val) => val > 0 || $t('ui.debe-ser-mayor-a-0-48dea0'),
            (val) => val <= (localData.stockOrigen ?? 0) || $t('ui.stock-insuficiente-84eaef')
          ]"
          :disable="(localData.stockOrigen ?? 0) <= 0"
          dense
          outlined
          clearable
          class="full-width"
        />
      </div>
    </div>

    <!-- Tabla de variantes -->
    <div
      v-if="ConfiguracionProductoVariante && localData.idproductoalmacen"
      class="q-mt-md"
    >
      <div class="row items-center q-mb-sm">
        <div class="text-subtitle2 text-weight-bold">{{ $t('ui.variantes-del-producto-2a93f9') }}</div>
        <q-btn
          v-if="!loadingVariantes"
          icon="refresh"
          color="primary"
          flat
          dense
          class="q-ml-sm"
          @click="cargarVariantesProducto(localData.idproductoalmacen)"
        >
          <q-tooltip>{{ $t('ui.recargar-variantes-08e5d3') }}</q-tooltip>
        </q-btn>
      </div>
      <BaseFilterableTable
        v-if="variantesDelProducto.length > 0"
        :rows="variantesDelProducto"
        :columns="columnasVariantes"
        :array-headers="columnasVariantesFiltrables"
        row-key="id_Producto_Variante"
        flat
        bordered
        dense
        :loading="loadingVariantes"
      >
        <!-- Columna Serie -->
        <template v-slot:body-cell-serie="props">
          <q-td :props="props">
            <q-chip v-if="props.row.serie" outline color="primary" dense size="sm">
              {{ props.row.serie }}
            </q-chip>
            <span v-else class="text-grey-6">-</span>
          </q-td>
        </template>

        <!-- Columna SKU -->
        <template v-slot:body-cell-sku="props">
          <q-td :props="props">
            <span class="text-weight-medium">{{ props.row.sku }}</span>
          </q-td>
        </template>

        <!-- Columna Atributos -->
        <template v-slot:body-cell-atributos="props">
          <q-td :props="props">
            <div v-for="attr in props.row.atributos" :key="attr.id_Valor_Atributo">
              <q-badge outline color="primary" class="q-mr-xs">
                {{ attr.atributo }}: {{ attr.valor }}
              </q-badge>
            </div>
          </q-td>
        </template>

        <!-- Columna Stock -->
        <template v-slot:body-cell-stock="props">
          <q-td :props="props" class="text-center">
            <q-badge :color="props.row.cantidad > 0 ? 'green' : 'red'">
              {{ props.row.cantidad ?? 0 }}
            </q-badge>
          </q-td>
        </template>

        <!-- Columna Cantidad -->
        <template v-slot:body-cell-cantidad="props">
          <q-td :props="props">
            <q-input
              v-model.number="cantidadesVariantes[props.row.id_Producto_Variante]"
              type="number"
              dense
              outlined
              :label="$t('ui.cantidad-b5b6f8')"
              min="0"
              :max="props.row.cantidad ?? 0"
              :disable="(props.row.cantidad ?? 0) <= 0"
              :rules="[
                val => !val || val <= (props.row.cantidad ?? 0) || $t('ui.stock-insuficiente-84eaef')
              ]"
              hide-bottom-space
              style="min-width: 120px"
            />
          </q-td>
        </template>
      </BaseFilterableTable>
    </div>

    <div class="col-md-2 col-12 flex justify-end items-center q-gutter-sm q-mt-md">
      <q-btn :label="isEditing ? $t('configuracion.servicios.dialog.update') : $t('ui.anadir-41261d')" color="primary" type="submit" />
      <q-btn v-if="isEditing" :label="$t('ui.cancelar-edicion-fca2ff')" color="grey" @click="resetForm" />
    </div>
  </q-form>

  <q-table class="q-mt-lg" :rows="processedRows" :columns="columnas" row-key="id" flat bordered>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="numero" :props="props">{{ props.row.numero }}</q-td>
        <q-td key="codigo" :props="props">{{ props.row.codigo }}</q-td>
        <q-td key="descripcion" :props="props">
          <div class="text-weight-bold">{{ props.row.descripcion }}</div>
          <!-- Atributos de variante si existen -->
          <div v-if="props.row.variante?.atributos?.length" class="q-mt-xs flex gap-1">
            <q-badge
              v-for="attr in props.row.variante.atributos"
              :key="attr.id_Valor_Atributo"
              outline
              color="secondary"
              class="q-mr-xs"
            >
              {{ attr.atributo }}: {{ attr.valor }}
            </q-badge>
            <q-badge v-if="props.row.variante.sku" outline color="grey-7" class="q-mr-xs">
              SKU: {{ props.row.variante.sku }}
            </q-badge>
          </div>
        </q-td>
        <q-td key="cantidad" :props="props" class="text-right">
          <q-badge color="grey-8">{{ props.row.cantidad }}</q-badge>
        </q-td>
        <q-td key="opciones" align="center" v-if="localData.autorizacion == 2">
          <q-btn dense icon="edit" color="primary" flat @click="editDetalle(props.row)" />
          <q-btn dense icon="delete" color="negative" flat @click="deleteDetalle(props.row)" />
        </q-td>
        <q-td v-else />
      </q-tr>
    </template>
  </q-table>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import BaseFilterableTable from 'src/components/componentesGenerales/filtradoTabla/BaseFilterableTable.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
})

defineEmits(['close'])

const $q = useQuasar()
const idempresa = idempresa_md5()

// --- ESTADO REACTIVO ---
const form = ref(null)
const ConfiguracionProductoVariante = ref(false)
const variantesDelProducto = ref([])
const loadingVariantes = ref(false)
const cantidadesVariantes = ref({}) // { [idVariante]: cantidad }

const localData = ref({
  idproductoalmacen: null,
  cantidad: null,
  idmovimiento: props.modelValue.id,
  autorizacion: props.modelValue.autorizacion,
  idalmacenorigen: props.modelValue.idalmacenorigen,
})

const detalleMovimiento = ref([])
const productosDisponibles = ref([])
const productosFiltrados = ref([])

const isEditing = computed(() => !!localData.value.id)

// --- COLUMNAS ---
const columnas = [
  { name: 'numero', label: i18nT('cotizacion.table.number'), field: 'numero', align: 'center' },
  { name: 'codigo', label: i18nT('ui.codigo-c35510'), field: 'codigo', align: 'center' },
  { name: 'descripcion', label: i18nT('configuracion.servicios.table.descripcion'), field: 'descripcion', align: 'left' },
  { name: 'cantidad', label: i18nT('ui.cantidad-b5b6f8'), field: 'cantidad', align: 'right' },
  { name: 'opciones', label: i18nT('configGeneral.divisas.table.options'), field: 'id', align: 'center' },
]

const columnasVariantes = [
  { name: 'serie', label: i18nT('ui.serie-986812'), field: 'serie', align: 'left', sortable: true, dataType: 'text' },
  { name: 'sku', label: 'SKU', field: 'sku', align: 'left', sortable: true, dataType: 'text' },
  {
    name: 'atributos',
    label: i18nT('ui.atributos-bd9731'),
    field: 'atributos_str',
    align: 'left',
    sortable: true,
    dataType: 'text',
  },
  {
    name: 'stock',
    label: i18nT('ui.stock-disponible-4b5080'),
    field: 'cantidad',
    align: 'center',
    sortable: true,
    dataType: 'number',
  },
  { name: 'cantidad', label: i18nT('ui.cantidad-a-mover-0367fc'), field: 'cantidad', align: 'left', sortable: false },
]

const columnasVariantesFiltrables = ['serie', 'sku', 'atributos', 'stock']

const processedRows = computed(() =>
  detalleMovimiento.value.map((row, index) => ({
    ...row,
    numero: index + 1,
  })),
)

// --- WATCHERS ---
watch(
  () => props.modelValue,
  (newVal) => {
    localData.value = {
      idproductoalmacen: null,
      cantidad: null,
      idmovimiento: newVal.id,
      autorizacion: newVal.autorizacion,
      idalmacenorigen: newVal.idalmacenorigen,
    }
    loadAllData(newVal)
  },
  { deep: true },
)

// Actualiza stock al seleccionar producto
watch(
  () => localData.value.idproductoalmacen,
  async (nuevoValor) => {
    if (!isEditing.value) {
      const productoSeleccionado = productosDisponibles.value.find((p) => p.value === nuevoValor)
      localData.value.stockOrigen = productoSeleccionado ? productoSeleccionado.stocko : 0
      localData.value.stockDestino = productoSeleccionado ? productoSeleccionado.stockd : 0
    }
    // Cargar variantes si está habilitada la configuración
    if (nuevoValor && ConfiguracionProductoVariante.value) {
      await cargarVariantesProducto(nuevoValor)
    } else {
      variantesDelProducto.value = []
      cantidadesVariantes.value = {}
    }
  },
)

// --- API: Configuración variantes ---
async function fetchEstadoActual() {
  try {
    const { data } = await api.get(`configuracionProductoVarianteEstadoActual/${idempresa}`)
    ConfiguracionProductoVariante.value = data.ProductoVariante ?? data ?? false
  } catch (error) {
    console.log(error)
  }
}

function safeJsonParse(str) {
  if (typeof str !== 'string') return str
  const text = str.trim()
  try {
    return JSON.parse(text)
  } catch (e) {
    const firstBrace = text.indexOf('{')
    const firstBracket = text.indexOf('[')
    let start = -1
    if (firstBrace !== -1 && firstBracket !== -1) {
      start = Math.min(firstBrace, firstBracket)
    } else if (firstBrace !== -1) {
      start = firstBrace
    } else if (firstBracket !== -1) {
      start = firstBracket
    }

    if (start === -1) {
      console.error('[DetalleMovimiento] No se encontró estructura JSON:', e)
      return null
    }

    let end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'))
    while (end > start) {
      try {
        const candidate = text.substring(start, end + 1)
        return JSON.parse(candidate)
      } catch {
        end = Math.max(text.lastIndexOf('}', end - 1), text.lastIndexOf(']', end - 1))
      }
    }
    console.error('[DetalleMovimiento] Error al extraer JSON limpio:', e)
    return null
  }
}

// --- API: Cargar variantes del producto ---
async function cargarVariantesProducto(idproductoalmacen) {
  loadingVariantes.value = true
  try {
    const response = await api.get(`obtenerProductoConAtributos/${idproductoalmacen}`)
    const raw = safeJsonParse(response.data)

    // Soporta respuestas directas, anidadas en .data o devueltas en arreglo
    const payload = Array.isArray(raw)
      ? raw[0]
      : raw?.data && (raw.data.producto || raw.data.variantes)
        ? raw.data
        : raw

    const vars = payload?.variantes || raw?.variantes || (Array.isArray(payload) ? payload : [])

    if (vars?.length) {
      variantesDelProducto.value = vars.map((v) => ({
        ...v,
        id_Producto_Variante: v.id_producto_variante,
        serie: v.serie || '',
        idserie: v.idserie || null,
        sku: v.sku,
        precio_base: v.precio_base ?? null,
        codigo_barras: v.codigo_barras || '',
        cantidad: Number(v.cantidad ?? v.stock ?? 0),
        atributos: v.atributos || [],
        atributos_str: (v.atributos || [])
          .map((a) => `${a.atributo || a.nombre || ''}: ${a.valor || ''}`)
          .join(', '),
      }))
      variantesDelProducto.value.forEach((variante) => {
        cantidadesVariantes.value[variante.id_Producto_Variante] = 0
      })
    } else {
      variantesDelProducto.value = []
    }
  } catch (error) {
    console.error('Error al cargar variantes:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.no-se-pudieron-cargar-las-variantes-del-producto-7d8d61'),
      position: 'top',
    })
  } finally {
    loadingVariantes.value = false
  }
}

// --- API: Detalle movimiento ---
async function getDetalleMovimiento(id_movimiento) {
  try {
    const response = await api.get(`listaDetalleMovimiento/${id_movimiento}`)
    detalleMovimiento.value = response.data
  } catch (error) {
    console.error('Error al cargar detalles de movimiento:', error)
    $q.notify({ type: 'negative', message: i18nT('ui.no-se-pudieron-cargar-los-detalles-del-movimiento-dcd90c') })
  }
}

async function getProductosDisponibles(movimiento) {
  try {
    const response = await api.get(
      `productosDisponibles/${movimiento.id}/${movimiento.idalmacenorigen}/${movimiento.idalmacendestino}`,
    )
    productosDisponibles.value = response.data.map((item) => ({
      label: `${item.codigo} - ${item.descripcion}`,
      value: item.idproductoalmaceno,
      descripcion: item.descripcion,
      codigo: item.codigo,
      stocko: item.stocko,
      stockd: item.stockd,
    }))
    productosFiltrados.value = [...productosDisponibles.value]
  } catch (error) {
    console.error('Error al cargar productos disponibles:', error)
    $q.notify({ type: 'negative', message: i18nT('ui.no-se-pudieron-cargar-los-productos-4c41c2') })
  }
}

async function loadAllData(movimiento) {
  await Promise.all([getDetalleMovimiento(movimiento.id), getProductosDisponibles(movimiento)])
}

// --- CRUD ---
async function handleFormSubmit() {
  // Si hay variantes seleccionadas, registrar por variante
  if (ConfiguracionProductoVariante.value && variantesDelProducto.value.length > 0) {
    const variantesConCantidad = variantesDelProducto.value.filter(
      (v) => Number(cantidadesVariantes.value[v.id_Producto_Variante] || 0) > 0,
    )

    if (variantesConCantidad.length === 0) {
      $q.notify({
        type: 'warning',
        message: i18nT('ui.debe-ingresar-al-menos-una-cantidad-mayor-a-0-para-l-7b3cd4'),
        position: 'top',
      })
      return
    }

    const variantesExcedidas = variantesConCantidad.filter(
      (v) => Number(cantidadesVariantes.value[v.id_Producto_Variante]) > (v.cantidad ?? 0)
    )

    if (variantesExcedidas.length > 0) {
      $q.notify({
        type: 'negative',
        message: i18nT('ui.una-o-mas-variantes-exceden-el-stock-disponible-85c057'),
        position: 'top',
      })
      return
    }

    $q.loading.show({ message: i18nT('ui.guardando-variantes-9e10d1') })
    try {
      for (const variante of variantesConCantidad) {
        const cantidad = Number(cantidadesVariantes.value[variante.id_Producto_Variante])
        const formData = new FormData()
        formData.append('ver', 'registrarDetalleMovimiento')
        formData.append('idmovimiento', localData.value.idmovimiento)
        formData.append('idproductoalmacen', localData.value.idproductoalmacen)
        formData.append('idProductoVariante', variante.id_Producto_Variante)
        formData.append('cantidad', cantidad)

        const response = await api.post('', formData)
        if (response.data.estado !== 'exito') {
          throw new Error(response.data.mensaje || i18nT('ui.error-al-registrar-variante-6841bb'))
        }
      }

      $q.notify({
        type: 'positive',
        message: i18nT('ui.variantes-registradas-con-exito-d9549c'),
        position: 'top',
      })
      await loadAllData(props.modelValue)
      resetForm()
    } catch (error) {
      console.error('Error al guardar variantes:', error)
      $q.notify({
        type: 'negative',
        message: error.message || i18nT('ui.error-al-guardar-variantes-c32d0d'),
        position: 'top',
      })
    } finally {
      $q.loading.hide()
    }
    return
  }

  // Flujo normal sin variantes
  if (isEditing.value) {
    await updateDetalle()
  } else {
    await addDetalle()
  }
  resetForm()
}

function objectToFormData(obj) {
  const formData = new FormData()
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      formData.append(key, obj[key])
    }
  }
  return formData
}

async function sendApiRequest(endpoint, data, successMessage, errorMessage) {
  try {
    let response
    if (endpoint.startsWith('eliminarDetalleMovimiento/')) {
      response = await api.get(endpoint)
    } else {
      const formData = objectToFormData(data)
      if (endpoint === 'registrarDetalleMovimiento') {
        formData.append('ver', 'registrarDetalleMovimiento')
      } else if (endpoint === 'editarDetalleMovimiento') {
        formData.append('ver', 'editarDetalleMovimiento')
      }
      response = await api.post('', formData)
    }

    if (response.data.estado === 'exito') {
      $q.notify({ type: 'positive', message: response.data.mensaje || successMessage })
      return response.data
    } else {
      $q.notify({ type: 'negative', message: response.data.mensaje || errorMessage })
      return null
    }
  } catch (error) {
    console.error(`Error en la solicitud a ${endpoint}:`, error)
    $q.notify({ type: 'negative', message: `Error en la solicitud al servidor: ${error.message}` })
    return null
  }
}

async function addDetalle() {
  const result = await sendApiRequest(
    'registrarDetalleMovimiento',
    { ...localData.value },
    'Detalle guardado correctamente',
    'Hubo un problema al guardar el detalle',
  )
  if (result) await loadAllData(props.modelValue)
}

async function updateDetalle() {
  const result = await sendApiRequest(
    'editarDetalleMovimiento',
    { ...localData.value },
    'Detalle actualizado correctamente',
    'Hubo un problema al actualizar el detalle',
  )
  if (result) await loadAllData(props.modelValue)
}

async function editDetalle(row) {
  try {
    const response = await api.get(`verificarExistenciaDetalleMovimiento/${row.id}`)
    const datos = response.data.datos
    localData.value = {
      id: row.id,
      idproductoalmacen: datos.idproductoalmacen,
      descripcion: row.descripcion,
      cantidad: row.cantidad,
      idmovimiento: row.idpedido,
      autorizacion: props.modelValue.autorizacion,
      idalmacenorigen: props.modelValue.idalmacenorigen,
      stockOrigen: datos.stocko,
      stockDestino: datos.stockd,
    }
  } catch (error) {
    console.error('Error al verificar Detalle Movimiento:', error)
    $q.notify({ type: 'negative', message: i18nT('ui.no-se-pudieron-cargar-los-productos-4c41c2') })
  }
}

function deleteDetalle(row) {
  $q.dialog({
    title: i18nT('configGeneral.divisas.messages.deleteTitle'),
    message: `¿Está seguro de eliminar el detalle del producto "${row.descripcion}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const result = await sendApiRequest(
      `eliminarDetalleMovimiento/${row.id}`,
      {},
      'Detalle eliminado correctamente',
      'Hubo un problema al eliminar el detalle',
    )
    if (result) await loadAllData(props.modelValue)
  })
}

function resetForm() {
  localData.value = {
    idproductoalmacen: null,
    cantidad: null,
    idmovimiento: props.modelValue.id,
    autorizacion: props.modelValue.autorizacion,
    idalmacenorigen: props.modelValue.idalmacenorigen,
  }
  variantesDelProducto.value = []
  cantidadesVariantes.value = {}
  form.value?.resetValidation()
}

function filtrarProductos(val, update) {
  const needle = val.toLowerCase()
  update(() => {
    productosFiltrados.value = productosDisponibles.value.filter((p) =>
      p.label.toLowerCase().includes(needle),
    )
  })
}

// --- LIFECYCLE ---
onMounted(async () => {
  await fetchEstadoActual()
  loadAllData(props.modelValue)
})
</script>

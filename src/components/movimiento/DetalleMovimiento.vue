<template>
  <q-form @submit="handleFormSubmit" ref="form" v-if="localData.autorizacion == 2">
    <div class="row q-col-gutter-x-md">
      <!-- Selector de producto -->
      <div class="col-12 col-md-6">
        <div v-if="isEditing">
          <label for="producto">Producto *</label>
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
          <label for="producto">Producto*</label>
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
              :rules="[(val) => !!val || 'Requerido']"
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
              <q-tooltip>Recargar productos</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>

      <div class="col-md-2 col-12">
        <label for="stock">Stock origen*</label>
        <q-input id="stock" v-model="localData.stockOrigen" disable dense outlined />
      </div>
      <div class="col-md-2 col-12">
        <label for="stock_destino">Stock destino*</label>
        <q-input id="stock_destino" v-model="localData.stockDestino" disable dense outlined />
      </div>

      <div v-if="!ConfiguracionProductoVariante" class="col-md-2 col-6">
        <label for="cantidad">Cantidad</label>
        <q-input
          id="cantidad"
          v-model.number="localData.cantidad"
          type="number"
          :rules="[
            (val) => !!val || 'Requerido', 
            (val) => val > 0 || 'Debe ser mayor a 0',
            (val) => val <= (localData.stockOrigen ?? 0) || 'Stock insuficiente'
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
        <div class="text-subtitle2 text-weight-bold">Variantes del Producto</div>
        <q-btn
          v-if="!loadingVariantes"
          icon="refresh"
          color="primary"
          flat
          dense
          class="q-ml-sm"
          @click="cargarVariantesProducto(localData.idproductoalmacen)"
        >
          <q-tooltip>Recargar variantes</q-tooltip>
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
              label="Cantidad"
              min="0"
              :max="props.row.cantidad ?? 0"
              :disable="(props.row.cantidad ?? 0) <= 0"
              :rules="[
                val => !val || val <= (props.row.cantidad ?? 0) || 'Stock insuficiente'
              ]"
              hide-bottom-space
              style="min-width: 120px"
            />
          </q-td>
        </template>
      </BaseFilterableTable>
    </div>

    <div class="col-md-2 col-12 flex justify-end items-center q-gutter-sm q-mt-md">
      <q-btn :label="isEditing ? 'Actualizar' : 'Añadir'" color="primary" type="submit" />
      <q-btn v-if="isEditing" label="Cancelar Edición" color="grey" @click="resetForm" />
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
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'center' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right' },
  { name: 'opciones', label: 'Opciones', field: 'id', align: 'center' },
]

const columnasVariantes = [
  { name: 'serie', label: 'Serie', field: 'serie', align: 'left', sortable: true, dataType: 'text' },
  { name: 'sku', label: 'SKU', field: 'sku', align: 'left', sortable: true, dataType: 'text' },
  {
    name: 'atributos',
    label: 'Atributos',
    field: 'atributos_str',
    align: 'left',
    sortable: true,
    dataType: 'text',
  },
  {
    name: 'stock',
    label: 'Stock disponible',
    field: 'cantidad',
    align: 'center',
    sortable: true,
    dataType: 'number',
  },
  { name: 'cantidad', label: 'Cantidad a mover', field: 'cantidad', align: 'left', sortable: false },
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
      message: 'No se pudieron cargar las variantes del producto.',
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
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los detalles del movimiento' })
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
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los productos' })
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
        message: 'Debe ingresar al menos una cantidad mayor a 0 para las variantes.',
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
        message: 'Una o más variantes exceden el stock disponible.',
        position: 'top',
      })
      return
    }

    $q.loading.show({ message: 'Guardando variantes...' })
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
          throw new Error(response.data.mensaje || 'Error al registrar variante')
        }
      }

      $q.notify({
        type: 'positive',
        message: 'Variantes registradas con éxito',
        position: 'top',
      })
      await loadAllData(props.modelValue)
      resetForm()
    } catch (error) {
      console.error('Error al guardar variantes:', error)
      $q.notify({
        type: 'negative',
        message: error.message || 'Error al guardar variantes',
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
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los productos' })
  }
}

function deleteDetalle(row) {
  $q.dialog({
    title: 'Confirmar',
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

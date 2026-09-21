<template>
  <q-form @submit="handleFormSubmit" ref="formRef" v-if="localData.autorizacion == 2">
    <div class="row q-col-gutter-x-md">
      <div class="col-12 col-md-4" v-if="isEditing">
        <label for="producto">Producto*</label>
        <q-input
          v-model="localData.descripcion"
          use-input
          fill-input
          hide-dropdown-icon
          id="producto"
          dense
          outlined
          clearable
          class="full-width"
          disable
        />
      </div>
      <div class="col-12 col-md-6" v-if="!isEditing">
        <label for="producto">Producto*</label>
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
          class="full-width"
        >
          <template v-slot:append>
            <q-btn
              round
              dense
              flat
              size="sm"
              color="primary"
              icon="refresh"
              :loading="recargandoProductos"
              @click.stop.prevent="recargarProductos"
            >
              <q-tooltip>Recargar productos</q-tooltip>
            </q-btn>
          </template>
        </q-select>
      </div>

      <div class="col-12 col-md-2">
        <label for="stockactual">Stock actual*</label>
        <q-input id="stockactual" v-model="localData.stock" disable dense outlined />
      </div>

      <div class="col-md-2 col-6" v-if="!ConfiguracionProductoVariante || variantesDelProducto.length === 0">
        <label for="cantidad">Cantidad*</label>

        <q-input
          id="cantidad"
          v-model.number="localData.cantidad"
          type="number"
          :rules="[(val) => !!val || 'Requerido', (val) => val > 0 || 'Debe ser mayor a 0']"
          dense
          clearable
          outlined
          class="full-width"
        />
      </div>

      <div class="col-12 col-md-2 flex justify-end items-center q-gutter-sm">
        <q-btn :label="isEditing ? 'Actualizar' : 'Añadir'" color="primary" type="submit" />
        <q-btn v-if="isEditing" label="Cancelar Edición" color="grey" @click="resetForm" />
      </div>
    </div>

    <!-- Sección de Atributos del Producto (solo si NO hay variantes activas) -->
    <div
      v-if="!ConfiguracionProductoVariante && atributosProducto.length > 0 && localData.idproductoalmacen"
      class="row q-col-gutter-md q-mt-sm"
    >
      <div class="col-12">
        <q-card flat bordered class="bg-grey-50">
          <q-card-section>
            <div class="text-subtitle2 text-weight-bold text-grey-8 q-mb-sm flex items-center">
              <q-icon name="tune" size="xs" class="q-mr-sm" color="primary" />
              Atributos del Producto
            </div>
            <div class="row q-col-gutter-md">
              <div
                v-for="attr in atributosProducto"
                :key="attr.id_Atributo_producto"
                class="col-12 col-sm-6 col-md-4"
              >
                <q-select
                  v-model="selectedAttributes[attr.id_Atributo_producto]"
                  :options="
                    (valoresPorAtributo[attr.id_Atributo_producto] || []).map((v) => ({
                      label: v.valor,
                      value: v.id_Valor_Atributo,
                    }))
                  "
                  :label="attr.nombre"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                  :rules="[(val) => !!val || 'Seleccione un valor']"
                  bg-color="white"
                >
                  <template v-slot:prepend>
                    <q-icon :name="attr.tipo_dato === 'numero' ? 'tag' : 'palette'" size="xs" />
                  </template>
                </q-select>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Sección de Variantes del Producto -->
    <div
      v-if="ConfiguracionProductoVariante && variantesDelProducto.length > 0 && !isEditing"
      class="q-mt-md"
    >
      <div class="text-subtitle2 text-weight-bold q-mb-sm flex items-center">
        <q-icon name="style" size="xs" class="q-mr-sm" color="primary" />
        Variantes del Producto
      </div>
      <BaseFilterableTable
        title="Variantes del Producto"
        :rows="variantesDelProducto"
        :columns="columnasVariantes"
        row-key="id_Producto_Variante"
        :arrayHeaders="['sku', 'serie']"
        :loading="loadingVariantes"
        filterMode="client"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="sku" :props="props">{{ props.row.sku }}</q-td>
            <q-td key="serie" :props="props">
              <q-badge v-if="props.row.serie" color="teal" outline>
                {{ props.row.serie }}
              </q-badge>
              <span v-else class="text-grey text-caption">Sin serie</span>
            </q-td>
            <q-td key="atributos" :props="props">
              <div v-for="attr in props.row.atributos" :key="attr.id_Valor_Atributo">
                <q-badge outline color="primary" class="q-mr-xs">
                  {{ attr.atributo }}: {{ attr.valor }}
                </q-badge>
              </div>
            </q-td>
            <q-td key="cantidad" :props="props">
              <q-input
                v-model.number="cantidadesVariantes[props.row.id_Producto_Variante]"
                type="number"
                dense
                outlined
                label="Cantidad"
                min="0"
                style="min-width: 120px"
              />
            </q-td>
          </q-tr>
        </template>
      </BaseFilterableTable>
    </div>
  </q-form>

  <div class="row justify-end q-mb-sm">
    <q-btn
      color="primary"
      icon="refresh"
      label="Recargar Detalle"
      outline
      no-caps
      id="btnRecargarDetallePedido"
      :loading="recargandoDetalle"
      @click.stop.prevent="recargarDetalle"
    >
      <q-tooltip>Volver a cargar los detalles del pedido</q-tooltip>
    </q-btn>
  </div>
  <q-table class="q-mt-lg" :rows="processedRows" :columns="columnas" row-key="id" flat bordered>
    <template v-slot:body-cell-descripcion="props">
      <q-td :props="props">
        <div class="text-body2">{{ props.row.descripcion }}</div>

        <!-- Variante (SKU/Serie/Atributos provenientes de Producto_Variante) -->
        <div
          v-if="props.row.variante"
          class="q-mt-xs row q-gutter-xs items-center"
        >
          <q-badge v-if="props.row.variante.sku" outline color="grey-7">
            SKU: {{ props.row.variante.sku }}
          </q-badge>
          <q-badge v-if="props.row.variante.serie" outline color="teal">
            Serie: {{ props.row.variante.serie }}
          </q-badge>
          <q-badge
            v-for="attr in (props.row.variante.atributos || [])"
            :key="attr.id_Valor_Atributo"
            outline
            color="secondary"
          >
            {{ attr.atributo }}: {{ attr.valor }}
          </q-badge>
        </div>

        <!-- Atributos (idvalores) — flujo antiguo, se conserva -->
        <div
          v-else-if="props.row.atributos && props.row.atributos.length"
          class="q-mt-xs row q-gutter-xs items-center"
        >
          <q-badge
            v-for="attr in props.row.atributos"
            :key="attr.atributo"
            outline
            color="grey-7"
            :label="`${attr.atributo}: ${attr.valor}`"
            class="q-px-xs"
          />
        </div>
      </q-td>
    </template>
    <template v-slot:body-cell-opciones="props" v-if="localData.autorizacion == 2">
      <q-td align="center">
        <q-btn dense icon="edit" color="primary" flat @click="editDetalle(props.row)" />
        <q-btn dense icon="delete" color="negative" flat @click="deleteDetalle(props.row)" />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api, apiP } from 'src/boot/axios'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import BaseFilterableTable from '../componentesGenerales/filtradoTabla/BaseFilterableTable.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
})

const formRef = ref(null)
defineEmits(['close'])

const $q = useQuasar()
const idempresa = idempresa_md5()

// --- Estados del formulario ---
const localData = ref({
  idproductoalmacen: null,
  cantidad: null,
  stock: 0,
  idpedido: props.modelValue.id,
  id: null, // para edición
  autorizacion: props.modelValue.autorizacion,
  idalmacen: props.modelValue.idalmacen,
  idalmacenorigen: props.modelValue.idalmacenorigen,
  idProductoVariante: 0, // se calculará antes de enviar
  descripcion: '', // para edición
})

const detallePedido = ref([])
const productosDisponibles = ref([])
const productosFiltrados = ref([])

// --- Estados para atributos (flujo antiguo) ---
const atributosProducto = ref([])
const valoresPorAtributo = reactive({}) // { id_Producto_Atributo: array }
const selectedAttributes = reactive({}) // { id_Producto_Atributo: id_Valor_Atributo }

// --- Estados para variantes ---
const ConfiguracionProductoVariante = ref(false)
const variantesDelProducto = ref([])
const loadingVariantes = ref(false)
const cantidadesVariantes = ref({}) // { [idVariante]: cantidad }
const preciosVariantes = ref({}) // { [idVariante]: precio }
const recargandoProductos = ref(false)
const recargandoDetalle = ref(false)

const isEditing = computed(() => !!localData.value.id)

// --- Columnas de variantes ---
const columnasVariantes = computed(() => [
  { name: 'sku', label: 'SKU', field: 'sku', align: 'left', sortable: true },
  { name: 'serie', label: 'Serie', field: 'serie', align: 'left', sortable: true },
  { name: 'atributos', label: 'Atributos', align: 'left' },
  { name: 'cantidad', label: 'Cantidad', align: 'left' },
])

// --- Watchers ---
watch(
  () => props.modelValue,
  (newVal) => {
    resetForm()
    loadAllData(newVal)
  },
  { deep: true },
)

watch(
  () => localData.value.idproductoalmacen,
  async (nuevoValor) => {
    // Actualizar stock y descripción
    const productoSeleccionado = productosDisponibles.value.find((p) => p.value === nuevoValor)
    if (productoSeleccionado) {
      localData.value.stock = productoSeleccionado.stock
      localData.value.descripcion = productoSeleccionado.descripcion || ''
    }

    // Flujo atributos (antiguo)
    cargarAtributosProducto(productoSeleccionado)

    // Flujo variantes (nuevo)
    if (nuevoValor && ConfiguracionProductoVariante.value) {
      await cargarVariantesProducto(nuevoValor)
    } else {
      limpiarVariantes()
    }
  },
)

// --- Funciones de carga de datos ---
async function getDetallePedidoInternal(pedidoId) {
  try {
    const response = await api.get(`listaDetallePedido/${pedidoId}`)
    detallePedido.value = response.data
  } catch (error) {
    console.error('Error al cargar detalles de pedido:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los detalles del pedido' })
  }
}

async function getProductosDisponiblesInternal(pedido) {
  if (!pedido?.id) {
    console.warn('Pedido sin id, se omite carga de productos')
    return
  }
  console.log(pedido)

  // Normaliza: acepta varias convenciones de nombre
  const idAlmacen        = pedido.idalmacen        ?? pedido.idAlmacen        ?? null
  const idAlmacenOrigen  = pedido.idalmacenorigen  ?? pedido.idAlmacenOrigen  ?? null

  // Regla: si origen es 0 (o null/undefined) usar idalmacen; si no, usar origen
  const almacenId = (idAlmacenOrigen === 0 || idAlmacenOrigen == null)
    ? idAlmacen
    : idAlmacenOrigen

  if (almacenId == null) {
    console.error('No hay idalmacen ni idalmacenorigen válido en el pedido:', pedido)
    $q.notify({
      type: 'negative',
      message: 'El pedido no tiene almacén asignado, no se pueden listar productos',
    })
    productosDisponibles.value = []
    productosFiltrados.value = []
    return
  }

  try {
    const endpoint = `ListaProductosPedido/${pedido.id}/${almacenId}`
    const response = await api.get(endpoint)
    productosDisponibles.value = response.data.map((item) => ({
      label: `${item.codigo} - ${item.descripcion}`,
      value: item.idproductoalmacen,
      stock: item.stock,
      descripcion: item.descripcion,
      codigo: item.codigo,
      idproducto: item.idproducto,
    }))
    productosFiltrados.value = [...productosDisponibles.value]
  } catch (error) {
    console.error('Error al cargar productos disponibles:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los productos' })
  }
}

async function loadAllData(pedido) {
  await Promise.all([getDetallePedidoInternal(pedido.id), getProductosDisponiblesInternal(pedido)])
}

// --- Funciones de atributos (antiguo) ---
async function cargarAtributosProducto(productoDisponible) {
  atributosProducto.value = []
  Object.keys(valoresPorAtributo).forEach((key) => delete valoresPorAtributo[key])
  Object.keys(selectedAttributes).forEach((key) => delete selectedAttributes[key])

  if (!productoDisponible || !productoDisponible.idproducto) {
    return
  }

  const idproducto = productoDisponible.idproducto

  try {
    const { data: atributos } = await apiP.get(`listar_atributos_producto/${idproducto}`)
    atributosProducto.value = atributos

    for (const attr of atributos) {
      const { data: valores } = await apiP.get(`listar_valores/${attr.id_Atributo_producto}`)
      valoresPorAtributo[attr.id_Atributo_producto] = valores
    }
  } catch (error) {
    console.error('Error al cargar atributos:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar atributos del producto' })
  }
}

// --- Funciones de variantes (nuevo) ---
async function fetchConfiguracionProductoVariante() {
  try {
    const { data } = await api.get(`configuracionProductoVarianteEstadoActual/${idempresa}`)
    ConfiguracionProductoVariante.value = data.ProductoVariante ?? data ?? false
  } catch (error) {
    console.log('No se pudo obtener configuración de variantes:', error)
    ConfiguracionProductoVariante.value = false
  }
}

async function cargarVariantesProducto(idproductoalmacen) {
  loadingVariantes.value = true
  try {
    const response = await api.get(`listar_producto_variantes_por_almacen/${idproductoalmacen}`)
    const data = response.data
    if (data?.Productos_variantes?.length) {
      variantesDelProducto.value = data.Productos_variantes
      variantesDelProducto.value.forEach((variante) => {
        cantidadesVariantes.value[variante.id_Producto_Variante] = 0
        preciosVariantes.value[variante.id_Producto_Variante] = variante.precio_base || 0
      })
    } else {
      variantesDelProducto.value = []
    }
  } catch (error) {
    console.error('Error al cargar variantes:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar las variantes del producto.',
    })
    variantesDelProducto.value = []
  } finally {
    loadingVariantes.value = false
  }
}

function limpiarVariantes() {
  variantesDelProducto.value = []
  cantidadesVariantes.value = {}
  preciosVariantes.value = {}
}

// --- CRUD ---
async function handleFormSubmit() {
  // === Rama variantes: si la config está activa y hay variantes cargadas ===
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

    $q.loading.show({ message: 'Guardando variantes...' })
    try {
      for (const variante of variantesConCantidad) {
        const cantidad = Number(cantidadesVariantes.value[variante.id_Producto_Variante])

        const formData = objectToFormData({
          idpedido: props.modelValue.id,
          cantidad,
          idproductoalmacen: localData.value.idproductoalmacen,
          idProductoVariante: variante.id_Producto_Variante,
          idsvalores: '',
          ver: 'registrarDetallePedido',
        })

        const response = await api.post('registrarDetallePedido', formData)
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

  // === Rama atributos / flujo normal (comportamiento existente) ===
  if (atributosProducto.value.length > 0) {
    for (const attr of atributosProducto.value) {
      if (!selectedAttributes[attr.id_Atributo_producto]) {
        $q.notify({
          type: 'warning',
          message: `Debe seleccionar un valor para "${attr.nombre}"`,
        })
        return
      }
    }
  }

  const valoresSeleccionados = Object.values(selectedAttributes).filter((v) => v != null)
  localData.value.idvalores = valoresSeleccionados.length > 0 ? valoresSeleccionados.join(',') : ''

  if (isEditing.value) {
    await updateDetalle()
  } else {
    await addDetalle()
  }
  resetForm()
}

async function addDetalle() {
  const dataToSend = { ...localData.value }
  const result = await sendApiRequest('registrarDetallePedido', dataToSend)
  if (result) await loadAllData(props.modelValue)
}

async function updateDetalle() {
  const dataToSend = { ...localData.value }
  const result = await sendApiRequest('editardetallepedido', dataToSend)
  if (result) await loadAllData(props.modelValue)
}

async function editDetalle(row) {
  localData.value = {
    id: row.id,
    idproductoalmacen: row.idproductoalmacen,
    descripcion: row.descripcion,
    cantidad: row.cantidad,
    stock: 0,
    idpedido: row.idpedido,
    autorizacion: props.modelValue.autorizacion,
    idalmacen: props.modelValue.idalmacen,
    idalmacenorigen: props.modelValue.idalmacenorigen,
    idvalores: row.idvalores,
  }

  const producto = productosDisponibles.value.find((p) => p.value === row.idproductoalmacen)
  if (producto) {
    localData.value.stock = producto.stock
  }

  await cargarAtributosProducto(producto)

  if (row.idvalores) {
    const idsArray = row.idvalores.split(',').map((id) => parseInt(id.trim()))
    atributosProducto.value.forEach((attr) => {
      const valores = valoresPorAtributo[attr.id_Atributo_producto] || []
      const encontrado = valores.find((v) => idsArray.includes(v.id_Valor_Atributo))
      if (encontrado) {
        selectedAttributes[attr.id_Atributo_producto] = encontrado.id_Valor_Atributo
      }
    })
  }
}

function deleteDetalle(row) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de eliminar el detalle del producto "${row.descripcion}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const result = await sendApiRequest(`eliminarDetallePedido/${row.id}`, {})
    if (result) await loadAllData(props.modelValue)
  })
}

// --- Utilidades de API ---
async function sendApiRequest(endpoint, data, successMessage, errorMessage) {
  try {
    let response
    if (endpoint.startsWith('eliminarDetallePedido/')) {
      response = await api.get(endpoint)
    } else {
      const formData = objectToFormData(data)
      formData.append(
        'ver',
        endpoint === 'registrarDetallePedido' ? 'registrarDetallePedido' : 'editardetallepedido',
      )
      response = await api.post(endpoint, formData)
    }

    if (response.data.estado === 'exito') {
      $q.notify({ type: 'positive', message: response.data.mensaje || successMessage })
      return response.data
    } else {
      $q.notify({ type: 'negative', message: response.data.mensaje || errorMessage })
      return null
    }
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error de comunicación con el servidor' })
    return null
  }
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

// --- Reset y filtrado ---
function resetForm() {
  localData.value = {
    idproductoalmacen: null,
    cantidad: null,
    stock: 0,
    idpedido: props.modelValue.id,
    id: null,
    autorizacion: props.modelValue.autorizacion,
    idalmacen: props.modelValue.idalmacen,
    idalmacenorigen: props.modelValue.idalmacenorigen,
    idvalores: '',
    descripcion: '',
  }
  formRef.value?.reset()
  formRef.value?.resetValidation()

  atributosProducto.value = []
  Object.keys(valoresPorAtributo).forEach((k) => delete valoresPorAtributo[k])
  Object.keys(selectedAttributes).forEach((k) => delete selectedAttributes[k])

  limpiarVariantes()
}

function filtrarProductos(val, update) {
  const needle = val.toLowerCase()
  update(() => {
    productosFiltrados.value = productosDisponibles.value.filter((p) =>
      p.label.toLowerCase().includes(needle),
    )
  })
}

// --- Columnas de la tabla de detalle ---
const columnas = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'center' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right' },
  { name: 'opciones', label: 'Opciones', field: 'id', align: 'center' },
]

const processedRows = computed(() =>
  detallePedido.value.map((row, index) => ({
    ...row,
    numero: index + 1,
  })),
)

const recargarProductos = async () => {
  if (recargandoProductos.value) return
  recargandoProductos.value = true
  try {
    await getProductosDisponiblesInternal(props.modelValue)
    $q.notify({ type: 'positive', message: 'Productos recargados', position: 'top', timeout: 1200 })
  } catch (err) {
    console.error('Error al recargar productos:', err)
  } finally {
    recargandoProductos.value = false
  }
}

const recargarDetalle = async () => {
  if (recargandoDetalle.value) return
  recargandoDetalle.value = true
  try {
    await getDetallePedidoInternal(props.modelValue.id)
    $q.notify({ type: 'positive', message: 'Detalle recargado', position: 'top', timeout: 1200 })
  } catch (err) {
    console.error('Error al recargar detalle:', err)
  } finally {
    recargandoDetalle.value = false
  }
}

onMounted(async () => {
  await fetchConfiguracionProductoVariante()
  await loadAllData(props.modelValue)
})
</script>

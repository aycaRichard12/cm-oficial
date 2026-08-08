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
        />
      </div>

      <div class="col-12 col-md-2">
        <label for="stockactual">Stock actual*</label>
        <q-input id="stockactual" v-model="localData.stock" disable dense outlined />
      </div>

      <div class="col-md-2 col-6">
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

    <!-- Sección de Atributos del Producto -->
    <div
      v-if="atributosProducto.length > 0 && localData.idproductoalmacen"
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
                :key="attr.id_Producto_Atributo"
                class="col-12 col-sm-6 col-md-4"
              >
                <q-select
                  v-model="selectedAttributes[attr.id_Producto_Atributo]"
                  :options="
                    (valoresPorAtributo[attr.id_Producto_Atributo] || []).map((v) => ({
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
  </q-form>

  <q-table class="q-mt-lg" :rows="processedRows" :columns="columnas" row-key="id" flat bordered>
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
import { api, apiP } from 'src/boot/axios' // Ajusta la ruta según tu proyecto

const props = defineProps({
  modelValue: { type: Object, required: true },
})

const formRef = ref(null)
defineEmits(['close'])

const $q = useQuasar()

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
  idvalores: '', // se calculará antes de enviar
  descripcion: '', // para edición
})

const detallePedido = ref([])
const productosDisponibles = ref([])
const productosFiltrados = ref([])

// --- Estados para atributos ---
const atributosProducto = ref([])
const valoresPorAtributo = reactive({}) // { id_Producto_Atributo: array }
const selectedAttributes = reactive({}) // { id_Producto_Atributo: id_Valor_Atributo }

const isEditing = computed(() => !!localData.value.id)

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
  (nuevoValor) => {
    // Actualizar stock
    const productoSeleccionado = productosDisponibles.value.find((p) => p.value === nuevoValor)
    if (productoSeleccionado) {
      localData.value.stock = productoSeleccionado.stock
      localData.value.descripcion = productoSeleccionado.descripcion || ''
    }
    // Cargar atributos del producto
    cargarAtributosProducto(nuevoValor)
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
  try {
    let endpoint = ''
    if (pedido.idalmacenorigen == 0) {
      endpoint = `ListaProductosPedido/${pedido.id}/${pedido.idalmacen}`
    } else {
      endpoint = `ListaProductosPedido/${pedido.id}/${pedido.idalmacenorigen}`
    }
    const response = await api.get(endpoint)
    productosDisponibles.value = response.data.map((item) => ({
      label: `${item.codigo} - ${item.descripcion}`,
      value: item.idproductoalmacen,
      stock: item.stock,
      descripcion: item.descripcion,
      codigo: item.codigo,
      idproducto: item.idproducto, // necesario para atributos
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

// --- Funciones de atributos ---
async function cargarAtributosProducto(idproductoalmacen) {
  // Limpiar estados previos
  atributosProducto.value = []
  Object.keys(valoresPorAtributo).forEach((key) => delete valoresPorAtributo[key])
  Object.keys(selectedAttributes).forEach((key) => delete selectedAttributes[key])

  if (!idproductoalmacen) return

  const producto = productosDisponibles.value.find((p) => p.value === idproductoalmacen)
  if (!producto?.idproducto) return

  try {
    const { data: atributos } = await apiP.get(`listar_atributos_producto/${producto.idproducto}`)
    atributosProducto.value = atributos

    // Cargar valores para cada atributo
    for (const attr of atributos) {
      const { data: valores } = await apiP.get(`listar_valores/${attr.id_Producto_Atributo}`)
      valoresPorAtributo[attr.id_Producto_Atributo] = valores
    }
  } catch (error) {
    console.error('Error al cargar atributos:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar atributos del producto' })
  }
}

// --- CRUD ---
async function handleFormSubmit() {
  // Validar atributos si existen
  if (atributosProducto.value.length > 0) {
    for (const attr of atributosProducto.value) {
      if (!selectedAttributes[attr.id_Producto_Atributo]) {
        $q.notify({
          type: 'warning',
          message: `Debe seleccionar un valor para "${attr.nombre}"`,
        })
        return
      }
    }
  }

  // Construir idvalores
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
  // Llenar formulario con los datos del row
  localData.value = {
    id: row.id,
    idproductoalmacen: row.idproductoalmacen,
    descripcion: row.descripcion,
    cantidad: row.cantidad,
    stock: 0, // se actualizará con el watcher
    idpedido: row.idpedido,
    autorizacion: props.modelValue.autorizacion,
    idalmacen: props.modelValue.idalmacen,
    idalmacenorigen: props.modelValue.idalmacenorigen,
    idvalores: '', // se reasignará después de cargar atributos
  }

  // Actualizar stock (puede ser diferente al del row si cambió)
  const producto = productosDisponibles.value.find((p) => p.value === row.idproductoalmacen)
  if (producto) {
    localData.value.stock = producto.stock
  }

  // Cargar atributos y preseleccionar valores si existen
  await cargarAtributosProducto(localData.value.idproductoalmacen)

  if (row.idvalores) {
    const idsArray = row.idvalores.split(',').map((id) => parseInt(id.trim()))
    atributosProducto.value.forEach((attr) => {
      const valores = valoresPorAtributo[attr.id_Producto_Atributo] || []
      const encontrado = valores.find((v) => idsArray.includes(v.id_Valor_Atributo))
      if (encontrado) {
        selectedAttributes[attr.id_Producto_Atributo] = encontrado.id_Valor_Atributo
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

  // Limpiar atributos
  atributosProducto.value = []
  Object.keys(valoresPorAtributo).forEach((k) => delete valoresPorAtributo[k])
  Object.keys(selectedAttributes).forEach((k) => delete selectedAttributes[k])
}

function filtrarProductos(val, update) {
  const needle = val.toLowerCase()
  update(() => {
    productosFiltrados.value = productosDisponibles.value.filter((p) =>
      p.label.toLowerCase().includes(needle),
    )
  })
}

// --- Columnas de la tabla ---
const columnas = [
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'center' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'center' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right' },
  { name: 'opciones', label: 'Opciones', field: 'id', align: 'center' },
]

const processedRows = computed(() =>
  detallePedido.value.map((row, index) => ({
    ...row,
    numero: index + 1,
  })),
)

onMounted(() => {
  loadAllData(props.modelValue)
})
</script>

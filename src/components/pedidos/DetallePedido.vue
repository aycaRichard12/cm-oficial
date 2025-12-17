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
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
// Asegúrate de que 'api' esté correctamente importado de tu configuración de Axios
// Por ejemplo:
import { api } from 'src/boot/axios' // Ajusta la ruta según tu proyecto Quasar

const props = defineProps({
  // modelValue ahora contendrá el objeto del pedido completo para la inicialización
  // De aquí se extraerán idpedido, autorizacion, idalmacen, idalmacenorigen
  modelValue: { type: Object, required: true },
})
const formRef = ref(null)

defineEmits(['close']) // Solo emitimos 'close' al padre

const $q = useQuasar()

// --- Estados internos del componente ---
const localData = ref({
  // Estado para el formulario de añadir/editar detalle
  idproductoalmacen: null,
  cantidad: null,
  stock: 0,
  idpedido: props.modelValue.id, // ID del pedido principal
  id: null, // Para edición: id del detalle a editar
  autorizacion: props.modelValue.autorizacion,
  idalmacen: props.modelValue.idalmacen,
  idalmacenorigen: props.modelValue.idalmacenorigen,
})

const detallePedido = ref([]) // Lista de ítems del pedido (rows de la tabla)
const productosDisponibles = ref([]) // Lista de productos para el q-select
const productosFiltrados = ref([]) // Para la búsqueda en el q-select

const isEditing = computed(() => !!localData.value.id) // Determina si estamos editando un detalle existente

// --- Watchers ---

// Watch para resetear localData cuando el modelValue del padre cambie (ej. al abrir un nuevo pedido)
watch(
  () => props.modelValue,
  (newVal) => {
    localData.value = {
      idproductoalmacen: null,
      cantidad: null,
      stock: 0,
      idpedido: newVal.id,
      id: null,
      autorizacion: newVal.autorizacion,
      idalmacen: newVal.idalmacen,
      idalmacenorigen: newVal.idalmacenorigen,
    }
    // Re-cargar datos para el nuevo pedido
    loadAllData(newVal)
  },
  { deep: true },
)

// Watch para actualizar el stock automáticamente al seleccionar un producto
watch(
  () => localData.value.idproductoalmacen,
  (nuevoValor) => {
    const productoSeleccionado = productosDisponibles.value.find((p) => p.value === nuevoValor)
    localData.value.stock = productoSeleccionado ? productoSeleccionado.stock : 0
  },
)

// --- Funciones de utilidad ---

// Convierte un objeto plano a FormData
function objectToFormData(obj) {
  const formData = new FormData()
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      formData.append(key, obj[key])
    }
  }
  return formData
}

// Función genérica para enviar datos a la API
async function sendApiRequest(endpoint, data, successMessage, errorMessage) {
  try {
    let response

    // Handle DELETE requests (which often use GET on the client side with IDs in URL)
    // The previous implementation for 'eliminarDetallePedido' was trying to use FormData
    // with api.get, which doesn't make sense. It should just be api.get(endpoint).
    if (endpoint.startsWith('eliminarDetallePedido/')) {
      // Check for the delete endpoint pattern
      response = await api.get(endpoint) // Send a GET request for deletion
    } else {
      const formData = objectToFormData(data)

      // Differentiate 'ver' based on whether it's an edit or add operation
      if (endpoint === 'registrarDetallePedido') {
        formData.append('ver', 'registrarDetallePedido')
      } else if (endpoint === 'editardetallepedido') {
        formData.append('ver', 'editardetallepedido')
      }

      for (let [k, v] of formData.entries()) {
        console.log(`${k}:${v}`)
      }
      response = await api.post(endpoint, formData)
    }

    console.log(`Respuesta de ${endpoint}:`, response.data)

    if (response.data.estado === 'exito') {
      $q.notify({ type: 'positive', message: response.data.mensaje || successMessage })
      return response.data
    } else {
      $q.notify({ type: 'negative', message: response.data.mensaje || errorMessage })
      return null
    }
  } catch (error) {
    console.error(`Error en la solicitud a ${endpoint}:`, error)
    $q.notify({
      type: 'negative',
      message: `Error en la solicitud al servidor: ${error.message || 'Error desconocido'}`,
    })
    return null
  }
}

// --- Funciones de carga de datos ---

// Carga los detalles del pedido (antes 'getDetallePedido' del padre)
async function getDetallePedidoInternal(pedidoId) {
  try {
    const response = await api.get(`listaDetallePedido/${pedidoId}`)
    detallePedido.value = response.data
  } catch (error) {
    console.error('Error al cargar detalles de pedido:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los detalles del pedido' })
  }
}

// Carga los productos disponibles (antes 'listaProductosDisponibles' del padre)
async function getProductosDisponiblesInternal(pedido) {
  try {
    let response
    // La lógica de `idalmacenorigen` se mantiene
    if (pedido.idalmacenorigen == 0) {
      response = await api.get(`ListaProductosPedido/${pedido.id}/${pedido.idalmacen}`)
    } else {
      response = await api.get(`ListaProductosPedido/${pedido.id}/${pedido.idalmacenorigen}`)
    }
    productosDisponibles.value = response.data.map((item) => ({
      label: `${item.codigo} - ${item.descripcion}`,
      value: item.idproductoalmacen,
      stock: item.stock,
      descripcion: item.descripcion,
      codigo: item.codigo, // Añadir código para la tabla si es necesario stock
    }))
    productosFiltrados.value = [...productosDisponibles.value] // Inicializa los filtrados
  } catch (error) {
    console.error('Error al cargar productos disponibles:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los productos' })
  }
}

// Función para cargar todos los datos necesarios al inicializar o cambiar de pedido
async function loadAllData(pedido) {
  await Promise.all([getDetallePedidoInternal(pedido.id), getProductosDisponiblesInternal(pedido)])
}

// --- Funciones de CRUD para detalles del pedido ---

// Maneja el envío del formulario (antes 'onSubmit' en el template que llamaba a 'agregarDetalle' del padre)
async function handleFormSubmit() {
  if (isEditing.value) {
    await updateDetalle()
  } else {
    await addDetalle()
  }
  resetForm() // Limpiar el formulario después de añadir/editar
}

// Agrega un nuevo detalle (antes 'agregarDetalle' del padre)
async function addDetalle() {
  const dataToSend = { ...localData.value } // Copia los datos del formulario

  const result = await sendApiRequest(
    'registrarDetallePedido', // Endpoint para registrar
    dataToSend,
    'Detalle guardado correctamente',
    'Hubo un problema al guardar el detalle',
  )

  if (result) {
    await loadAllData(props.modelValue) // Recargar todos los datos después de una operación exitosa
  }
}

// Edita un detalle existente
// Edita un detalle existente
async function updateDetalle() {
  const dataToSend = { ...localData.value } // This correctly includes localData.value.id

  const result = await sendApiRequest(
    'editardetallepedido', // Ensure this endpoint correctly handles updates
    dataToSend,
    'Detalle actualizado correctamente',
    'Hubo un problema al actualizar el detalle',
  )

  if (result) {
    await loadAllData(props.modelValue) // Reload all data to reflect the change
  }
}

// Prepara el formulario para editar un detalle (antes 'editarDetalle' del padre)
function editDetalle(row) {
  localData.value = {
    // Copia los campos del row en el formulario
    id: row.id, // ID del detalle a editar
    idproductoalmacen: row.idproductoalmacen,
    descripcion: row.descripcion,
    cantidad: row.cantidad,
    stock: row.stock, // Si el stock está en el row, úsalo; de lo contrario, cárgalo
    idpedido: row.idpedido,
    autorizacion: props.modelValue.autorizacion, // Mantener la autorización del pedido
    idalmacen: props.modelValue.idalmacen,
    idalmacenorigen: props.modelValue.idalmacenorigen,
  }
  // Si el stock no se actualiza automáticamente al cargar el formulario,
  // asegúrate de que el watcher de idproductoalmacen lo haga.
  // O, si necesitas el stock del producto actual, búscalo en productosDisponibles
  const productInfo = productosDisponibles.value.find((p) => p.value === row.idproductoalmacen)

  console.log(row, productInfo, productosDisponibles.value)
  if (productInfo) {
    localData.value.stock = productInfo.stock
  }
}

// Elimina un detalle (antes 'eliminarDetalle' del padre)
function deleteDetalle(row) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Está seguro de eliminar el detalle del producto "${row.descripcion}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const result = await sendApiRequest(
      `eliminarDetallePedido/${row.id}`, // Endpoint de eliminación
      {}, // No se necesita FormData para GET/DELETE por URL
      'Detalle eliminado correctamente',
      'Hubo un problema al eliminar el detalle',
    )

    if (result) {
      await loadAllData(props.modelValue) // Recargar datos para reflejar la eliminación
    }
  })
}

// Reinicia el formulario a su estado inicial
function resetForm() {
  localData.value = {
    idproductoalmacen: null,
    cantidad: null,
    stock: 0,
    idpedido: props.modelValue.id,
    id: null, // Importante para salir del modo edición
    autorizacion: props.modelValue.autorizacion,
    idalmacen: props.modelValue.idalmacen,
    idalmacenorigen: props.modelValue.idalmacenorigen,
  }
  formRef.value.reset() // limpia campos
  formRef.value.resetValidation() // limpia mensajes de error
  // Opcional: Reiniciar la validación del formulario
  // form.value?.resetValidation();
}

// --- Funciones de filtrado para q-select ---
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
  { name: 'numero', label: 'N°', field: 'numero', align: 'center' }, // Corregido para usar 'numero'
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'center' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'center' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right' },
  { name: 'opciones', label: 'Opciones', field: 'id', align: 'center' },
]

const processedRows = computed(() =>
  detallePedido.value.map((row, index) => ({
    ...row,
    numero: index + 1, // Añade el número de fila
  })),
)

// --- Lifecycle Hook ---
onMounted(() => {
  // Cargar los datos iniciales cuando el componente se monta
  loadAllData(props.modelValue)
})
</script>

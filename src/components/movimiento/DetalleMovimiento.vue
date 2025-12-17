<template>
  <q-form @submit="handleFormSubmit" ref="form" v-if="localData.autorizacion == 2">
    <div class="row q-col-gutter-x-md">
      <div class="col-12 col-md-6">
        <div v-if="isEditing">
          <label for="producto">Producto *</label>
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
        <div v-if="!isEditing">
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
      </div>

      <div class="col-md-2 col-12">
        <label for="stock">Stock origen*</label>
        <q-input id="stock" v-model="localData.stockOrigen" disable dense outlined />
      </div>
      <div class="col-md-2 col-12">
        <label for="stock_destino">Stock destino*</label>
        <q-input id="stock_destino" v-model="localData.stockDestino" disable dense outlined />
      </div>

      <div class="col-md-2 col-6">
        <label for="cantidad">Cantidad</label>
        <q-input
          id="cantidad"
          v-model.number="localData.cantidad"
          type="number"
          :rules="[(val) => !!val || 'Requerido', (val) => val > 0 || 'Debe ser mayor a 0']"
          dense
          outlined
          clearable
          class="full-width"
        />
      </div>
    </div>
    <div class="col-md-2 col-12 flex justify-end items-center q-gutter-sm">
      <q-btn :label="isEditing ? 'Actualizar' : 'Añadir'" color="primary" type="submit" />
      <q-btn v-if="isEditing" label="Cancelar Edición" color="grey" @click="resetForm" />
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
  // modelValue ahora contendrá el objeto del movimiento completo para la inicialización
  // De aquí se extraerán idpedido, autorizacion, idalmacen, idalmacenorigen
  modelValue: { type: Object, required: true },
})

defineEmits(['close']) // Solo emitimos 'close' al padre

const $q = useQuasar()

// --- Estados internos del componente ---
const localData = ref({
  // Estado para el formulario de añadir/editar detalle
  idproductoalmacen: null,
  cantidad: null,
  idmovimiento: props.modelValue.id, // ID del movimiento principal
  autorizacion: props.modelValue.autorizacion,
  idalmacenorigen: props.modelValue.idalmacenorigen,
})

const detalleMovimiento = ref([]) // Lista de ítems del movimiento (rows de la tabla)
const productosDisponibles = ref([]) // Lista de productos para el q-select
const productosFiltrados = ref([]) // Para la búsqueda en el q-select

const isEditing = computed(() => !!localData.value.id) // Determina si estamos editando un detalle existente

// --- Watchers ---

// Watch para resetear localData cuando el modelValue del padre cambie (ej. al abrir un nuevo movimiento)
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
    // Re-cargar datos para el nuevo movimiento
    loadAllData(newVal)
  },
  { deep: true },
)

// Watch para actualizar el stock automáticamente al seleccionar un producto
watch(
  () => localData.value.idproductoalmacen,
  (nuevoValor) => {
    if (!isEditing.value) {
      const productoSeleccionado = productosDisponibles.value.find((p) => p.value === nuevoValor)
      localData.value.stockOrigen = productoSeleccionado ? productoSeleccionado.stocko : 0
      localData.value.stockDestino = productoSeleccionado ? productoSeleccionado.stockd : 0
    }
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
    // The previous implementation for 'eliminarDetalleMovimiento' was trying to use FormData
    // with api.get, which doesn't make sense. It should just be api.get(endpoint).
    if (endpoint.startsWith('eliminarDetalleMovimiento/')) {
      // Check for the delete endpoint pattern
      response = await api.get(endpoint) // Send a GET request for deletion
    } else {
      const formData = objectToFormData(data)

      // Differentiate 'ver' based on whether it's an edit or add operation
      if (endpoint === 'registrarDetalleMovimiento') {
        formData.append('ver', 'registrarDetalleMovimiento')
      } else if (endpoint === 'editarDetalleMovimiento') {
        formData.append('ver', 'editarDetalleMovimiento')
      }

      for (let [k, v] of formData.entries()) {
        console.log(`${k}:${v}`)
      }
      response = await api.post('', formData)
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

// Carga los detalles del movimiento (antes 'getDetallePedido' del padre)
async function getDetalleMovimiento(id_movimiento) {
  try {
    const response = await api.get(`listaDetalleMovimiento/${id_movimiento}`)
    console.log(response.data)
    detalleMovimiento.value = response.data
  } catch (error) {
    console.error('Error al cargar detalles de movimiento:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los detalles del movimiento' })
  }
}

// Carga los productos disponibles (antes 'listaProductosDisponibles' del padre) registrarDetalleMovimiento
async function getProductosDisponibles(movimiento) {
  try {
    const response = await api.get(
      `productosDisponibles/${movimiento.id}/${movimiento.idalmacenorigen}/${movimiento.idalmacendestino}`,
    )

    console.log(response.data)
    productosDisponibles.value = response.data.map((item) => ({
      label: `${item.codigo} - ${item.descripcion}`,
      value: item.idproductoalmaceno,
      descripcion: item.descripcion,
      codigo: item.codigo, // Añadir código para la tabla si es necesario stock
      stocko: item.stocko,
      stockd: item.stockd,
    }))
    productosFiltrados.value = [...productosDisponibles.value] // Inicializa los filtrados
  } catch (error) {
    console.error('Error al cargar productos disponibles:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los productos' })
  }
}

// Función para cargar todos los datos necesarios al inicializar o cambiar de movimiento
async function loadAllData(movimiento) {
  await Promise.all([getDetalleMovimiento(movimiento.id), getProductosDisponibles(movimiento)])
}

// --- Funciones de CRUD para detalles del movimiento ---

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
    'registrarDetalleMovimiento', // Endpoint para registrar
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
    'editarDetalleMovimiento', // Ensure this endpoint correctly handles updates
    dataToSend,
    'Detalle actualizado correctamente',
    'Hubo un problema al actualizar el detalle',
  )

  if (result) {
    await loadAllData(props.modelValue) // Reload all data to reflect the change
  }
}

// Prepara el formulario para editar un detalle (antes 'editarDetalle' del padre)
async function editDetalle(row) {
  console.log(row)

  try {
    const response = await api.get(`verificarExistenciaDetalleMovimiento/${row.id}`)

    console.log(response.data)

    const datos = response.data.datos
    localData.value = {
      // Copia los campos del row en el formulario
      id: row.id, // ID del detalle a editar
      idproductoalmacen: datos.idproductoalmacen,
      descripcion: row.descripcion,
      cantidad: row.cantidad,
      idmovimiento: row.idpedido,
      autorizacion: props.modelValue.autorizacion, // Mantener la autorización del movimiento
      idalmacenorigen: props.modelValue.idalmacenorigen,
      stockOrigen: datos.stocko,
      stockDestino: datos.stockd,
    }
  } catch (error) {
    console.error('Error al cargar verificar Detalle Movimiento :', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los productos' })
  }

  // Si el stock no se actualiza automáticamente al cargar el formulario,
  // asegúrate de que el watcher de idproductoalmacen lo haga.
  // O, si necesitas el stock del producto actual, búscalo en productosDisponibles
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
      `eliminarDetalleMovimiento/${row.id}`, // Endpoint de eliminación
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
    idmovimiento: props.modelValue.id, // ID del movimiento principal
    autorizacion: props.modelValue.autorizacion,
    idalmacenorigen: props.modelValue.idalmacenorigen,
  }
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
  detalleMovimiento.value.map((row, index) => ({
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

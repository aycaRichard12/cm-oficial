<template>
  <q-card-section v-if="compra.autorizacion == 2">
    <q-form @submit="onSubmit" ref="formRef">
      <div class="row q-col-gutter-x-md">
        <div class="col-12 col-md-8" v-if="esModoEdicion">
          <label for="producto">Producto o Servicio*</label>
          <q-input
            v-model="detalleForm.descripcion"
            use-input
            fill-input
            hide-dropdown-icon
            label=""
            dense
            outlined
            clearable
            class="full-width"
            disable
          />
        </div>
        <div class="col-12 col-md-8" v-if="!esModoEdicion">
          <label for="producto">Producto o Servicio*</label>
          <q-select
            use-input
            hide-dropdown-icon
            v-model="detalleForm.idproductoalmacen"
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
            :disable="esModoEdicion"
          />
        </div>

        <div class="col-12 col-md-4">
          <label for="stockactual">Stock actual</label>
          <q-input
            id="stockactual"
            v-model="detalleForm.stockActual"
            readonly
            dense
            outlined
            type="number"
          />
        </div>

        <div class="col-12 col-md-4">
          <label for="precio">Precio*</label>
          <q-input
            id="precio"
            v-model.number="detalleForm.precio"
            type="number"
            step="0.01"
            :rules="[(val) => val > 0 || 'El precio debe ser mayor a 0']"
            :suffix="divisaActiva.simbolo"
            dense
            outlined
            clearable
            class="full-width"
          />
        </div>

        <div class="col-12 col-md-4">
          <label for="cantidad">Cantidad*</label>
          <q-input
            id="cantidad"
            v-model.number="detalleForm.cantidad"
            type="number"
            :rules="[(val) => val > 0 || 'La cantidad debe ser mayor a 0']"
            dense
            outlined
            clearable
            class="full-width"
          />
        </div>
        <div class="col-12 col-md-2">
          <label for="unidad">Unidad*</label>
          <q-input
            id="unidad"
            v-model="detalleForm.unidad"
            type="text"
            dense
            outlined
            clearable
            readonly
            class="full-width"
          />
        </div>

        <div class="col-md-2 col-12 flex justify-end items-center q-gutter-sm">
          <q-btn :label="esModoEdicion ? 'Guardar' : 'Añadir'" color="primary" type="submit" />
          <q-btn label="Cancelar" color="grey" flat @click="onResetForm" v-if="esModoEdicion" />
        </div>
      </div>
    </q-form>
  </q-card-section>

  <q-card-section>
    <q-table
      class="q-mt-lg"
      :rows="detalleItems"
      :columns="columnas"
      row-key="id"
      flat
      bordered
      no-data-label="Aún no se han añadido productos a esta compra."
    >
      <template v-slot:body-cell-precio="props">
        <q-td :props="props"> {{ decimas(props.row.precio) }} </q-td>
      </template>

      <template v-slot:body-cell-subtotal="props">
        <q-td :props="props">
          {{ (props.row.precio * props.row.cantidad).toFixed(2) }}
        </q-td>
      </template>

      <template v-slot:body-cell-opciones="props" v-if="compra.autorizacion == 2">
        <q-td align="center">
          <q-btn
            dense
            icon="edit"
            color="primary"
            flat
            @click="iniciarEdicion(props.row)"
            aria-label="Editar"
          />
          <q-btn
            dense
            icon="delete"
            color="negative"
            flat
            @click="confirmarEliminar(props.row)"
            aria-label="Eliminar"
          />
        </q-td>
      </template>
      <template v-slot:bottom-row>
        <q-tr>
          <q-td colspan="4" class="text-right text-weight-bold text-grey-8">
            Total {{ '(' + divisaActiva.simbolo + ')' }}.:
          </q-td>
          <q-td class="text-center text-weight-bold text-h6"> {{ total.toFixed(2) }}</q-td>
        </q-tr>
      </template>
    </q-table>
  </q-card-section>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { decimas } from 'src/composables/FuncionesG'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import { useCurrencyStore } from 'src/stores/currencyStore'
const divisaActiva = useCurrencyStore()

const $q = useQuasar()

const props = defineProps({
  compra: { type: Object, required: true },
})
console.log(props.compra)
const emit = defineEmits(['close', 'update', 'submit'])

// --- ESTADO REACTIVO ---
const formRef = ref(null) // Referencia al QForm
const detalleItems = ref([]) // Almacena los productos YA AÑADIDOS a la compra
const productosDisponibles = ref([]) // Almacena TODOS los productos que se pueden añadir
const productosFiltrados = ref([]) // Para el QSelect
const esModoEdicion = ref(false)

// Estado para el formulario de añadir/editar un nuevo detalle

const detalleForm = ref({
  id: null,
  idproductoalmacen: null,
  precio: null,
  cantidad: null,
})

// --- COMPUTED PROPERTIES ---

const columnas = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  {
    name: 'descripcion',
    label: 'Descripción',
    field: 'descripcion',
    align: 'left',
    sortable: true,
  },
  {
    name: 'precio',
    label: `Precio Unit. (${divisaActiva.simbolo})`,
    field: 'precio',
    align: 'right',
    sortable: true,
  },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right', sortable: true },
  {
    name: 'subtotal',
    label: `Sub Total (${divisaActiva.simbolo})`,
    align: 'right',
    sortable: true,
  },
  { name: 'opciones', label: 'Opciones', align: 'center' },
]

const total = computed(() => {
  return detalleItems.value.reduce(
    (sum, item) => sum + Number(item.precio) * Number(item.cantidad),
    0,
  )
})
// --- WATCHERS ---
// Recargar datos si el objeto `compra` cambia
watch(
  () => props.compra.id,
  (newId) => {
    if (newId) {
      cargarDatos()
    }
  },
  { immediate: true }, // Se ejecuta inmediatamente al montar el componente
)

// --- MÉTODOS DE CICLO DE VIDA ---
onMounted(() => {
  // `watch` con `immediate: true` ya llama a cargarDatos()
})

// --- MÉTODOS DE DATOS (API) ---
async function cargarDatos() {
  // Usamos Promise.all para cargar ambos listados en paralelo
  $q.loading.show()
  try {
    await Promise.all([getDetalleCompra(), listaProductosDisponibles()])
  } catch (error) {
    console.log(error)

    $q.notify({ type: 'negative', message: 'Error al cargar los datos iniciales.' })
  } finally {
    $q.loading.hide()
  }
}

async function getDetalleCompra() {
  try {
    const response = await api.get(`listaDetalleCompra/${props.compra.id}`)
    console.log(response)
    detalleItems.value = response.data
  } catch (error) {
    console.error('Error al cargar detalles de compra:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los detalles de la compra' })
  }
}

async function listaProductosDisponibles() {
  try {
    const point = `ListaProductosCompra/${props.compra.id}/${props.compra.idalmacen}`
    const response = await api.get(point)
    productosDisponibles.value = response.data.map((item) => ({
      label: `${item.codigo} - ${item.descripcion}`,
      value: item.idproductoalmacen,
      stock: item.stock,
      unidad: item.unidad,
    }))
    console.log(response.data)
    productosFiltrados.value = [...productosDisponibles.value]
  } catch (error) {
    console.error('Error al cargar productos disponibles:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los productos' })
  }
}

// --- MÉTODOS DEL FORMULARIO ---
function filtrarProductos(val, update) {
  const needle = val.toLowerCase()
  update(() => {
    productosFiltrados.value = productosDisponibles.value.filter((p) =>
      p.label.toLowerCase().includes(needle),
    )
  })
}

watch(
  () => detalleForm.value.idproductoalmacen,
  (nuevoValor) => {
    const productoSeleccionado = productosDisponibles.value.find((p) => p.value === nuevoValor)
    detalleForm.value.stockActual = productoSeleccionado ? productoSeleccionado.stock : 0
    detalleForm.value.unidad = productoSeleccionado ? productoSeleccionado.unidad : ''
  },
)

async function onSubmit() {
  const formData = objectToFormData(detalleForm.value)

  formData.append('idingreso', props.compra.id)
  // Determinar la URL y el método (crear vs actualizar)
  const isUpdate = esModoEdicion.value
  isUpdate
    ? formData.append('ver', 'editarDetalleCompra')
    : formData.append('ver', 'registrarDetalleCompra') // Asumiendo endpoints
  for (let [k, v] of formData.entries()) {
    console.log(`${k}: ${v}`)
  }
  try {
    $q.loading.show({ message: 'Guardando...' })
    // Suponiendo que tu API usa POST para crear y PUT/PATCH para actualizar
    // Ajusta esto a tu implementación real (usaré `api.post` para ambos por simplicidad)
    const response = await api.post('', formData)

    if (response.data.estado === 'exito') {
      $q.notify({ type: 'positive', message: response.data.mensaje || 'Guardado con éxito' })
      await getDetalleCompra() // Recargar la tabla
      listaProductosDisponibles()
      onResetForm()
      emit('update') // Notificar al padre que hubo cambios
    } else {
      $q.notify({ type: 'negative', message: response.data.mensaje || 'Error al guardar' })
    }
  } catch (error) {
    console.error('Error en onSubmit:', error)
    $q.notify({ type: 'negative', message: 'Hubo un problema de comunicación con el servidor.' })
  } finally {
    $q.loading.hide()
  }
}

function onResetForm() {
  detalleForm.value = {
    id: null,
    idproductoalmacen: null,
    precio: null,
    cantidad: null,
  }
  formRef.value.reset()
  formRef.value.resetValidation() // limpia mensajes de error

  esModoEdicion.value = false
}

// --- MÉTODOS DE LA TABLA ---
async function iniciarEdicion(row) {
  try {
    const point = `verificarIDdetallecompra/${row.id}`
    const response = api.get(point)
    console.log((await response).data)
    const res = (await response).data
    if (res.estado == 'exito') {
      esModoEdicion.value = true
      detalleForm.value = {
        id: res.datos.id,
        idproductoalmacen: res.datos.idproductoalmacen,
        precio: res.datos.precio,
        cantidad: res.datos.cantidad,
        descripcion: res.datos.descripcion,
        stockActual: Number(res.datos.stock),
      }
    } else {
      $q.notify({ type: 'negative', message: response.data.mensaje || 'Error al Editar' })
    }
  } catch (error) {
    console.log(error)
  }

  // Podrías enfocar el primer campo del formulario para mejor UX
}

function confirmarEliminar(row) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Estás seguro de que quieres eliminar el producto "${row.descripcion}"?`,
    cancel: true,
    persistent: true,
    ok: {
      color: 'negative',
      label: 'Eliminar',
    },
  }).onOk(async () => {
    await eliminarDetalle(row)
  })
}

async function eliminarDetalle(row) {
  try {
    console.log(row)
    $q.loading.show({ message: 'Eliminando...' })
    const response = await api.get(`eliminarDetalleCompra/${row.id}`) // Usando DELETE
    if (response.data.estado === 'exito') {
      $q.notify({ type: 'positive', message: response.data.mensaje })
      await getDetalleCompra() // Recargar la tabla
      emit('update') // Notificar al padre que hubo cambios
    } else {
      $q.notify({ type: 'negative', message: response.data.mensaje })
    }
  } catch (error) {
    console.error('Error al eliminar detalle:', error)
    $q.notify({ type: 'negative', message: 'No se pudo eliminar el producto.' })
  } finally {
    $q.loading.hide()
  }
}
</script>

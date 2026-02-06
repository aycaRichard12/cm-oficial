<template>
  <!-- Form Section -->
  <q-card-section v-if="compra.autorizacion == 2" class="q-pb-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h6 text-grey-8">
          <q-icon name="add_shopping_cart" size="sm" class="q-mr-sm" />
          {{ esModoEdicion ? 'Editar Producto' : 'Añadir Producto' }}
        </div>
      </div>
      <div class="col-auto" v-if="esModoEdicion">
        <q-chip color="primary" text-color="white" icon="edit"> Modo Edición </q-chip>
      </div>
    </div>

    <q-separator class="q-mb-md" />

    <q-form @submit="onSubmit" ref="formRef">
      <div class="row q-col-gutter-md">
        <!-- Producto en modo edición -->
        <div class="col-12 col-md-6" v-if="esModoEdicion">
          <label class="text-weight-medium text-grey-8 q-mb-xs block">
            Producto o Servicio
          </label>
          <q-input
            v-model="detalleForm.descripcion"
            dense
            outlined
            readonly
            bg-color="grey-2"
            class="full-width"
          >
            <template v-slot:prepend>
              <q-icon name="lock" size="xs" color="grey-6" />
            </template>
          </q-input>
        </div>

        <!-- Producto en modo añadir -->
        <div class="col-12 col-md-6" v-if="!esModoEdicion">
          <label class="text-weight-medium text-grey-8 q-mb-xs block">
            Producto o Servicio*
          </label>
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
            placeholder="Buscar producto..."
          >
            <template v-slot:prepend>
              <q-icon name="search" size="xs" />
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No se encontraron productos </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- Stock actual - solo en modo añadir -->
        <div class="col-6 col-md-3" v-if="!esModoEdicion">
          <label class="text-weight-medium text-grey-8 q-mb-xs block">
            Stock Actual
          </label>
          <q-input
            v-model="detalleForm.stockActual"
            readonly
            dense
            outlined
            type="number"
            bg-color="grey-1"
          />
        </div>

        <!-- Unidad - solo en modo añadir -->
        <div class="col-6 col-md-3" v-if="!esModoEdicion">
          <label class="text-weight-medium text-grey-8 q-mb-xs block">
            Unidad
          </label>
          <q-input
            v-model="detalleForm.unidad"
            type="text"
            dense
            outlined
            readonly
            bg-color="grey-1"
          />
        </div>

        <!-- Precio -->
        <div class="col-6 col-md-4">
          <label class="text-weight-medium text-grey-8 q-mb-xs block">
            Precio Unitario*
          </label>
          <q-input
            v-model.number="detalleForm.precio"
            type="number"
            step="0.01"
            :rules="[(val) => val > 0 || 'El precio debe ser mayor a 0']"
            :suffix="divisaActiva.simbolo"
            dense
            outlined
            clearable
            class="full-width"
            placeholder="0.00"
          />
        </div>

        <!-- Cantidad -->
        <div class="col-6 col-md-4">
          <label class="text-weight-medium text-grey-8 q-mb-xs block">
            Cantidad*
          </label>
          <q-input
            v-model.number="detalleForm.cantidad"
            type="number"
            :rules="[(val) => val > 0 || 'La cantidad debe ser mayor a 0']"
            dense
            outlined
            clearable
            class="full-width"
            placeholder="0"
          />
        </div>

        <!-- Botones de acción -->
        <div class="col-12 col-md-4 flex items-end justify-end q-gutter-sm">
          <q-btn
            :label="esModoEdicion ? 'Guardar' : 'Añadir'"
            :icon="esModoEdicion ? 'save' : 'add'"
            color="primary"
            type="submit"
            unelevated
            no-caps
            class="q-px-lg"
          >
            <q-tooltip>{{
              esModoEdicion ? 'Guardar cambios' : 'Añadir producto a la compra'
            }}</q-tooltip>
          </q-btn>
          <q-btn
            v-if="esModoEdicion"
            label="Cancelar"
            icon="close"
            color="grey-7"
            flat
            @click="onResetForm"
            no-caps
          >
            <q-tooltip>Cancelar edición</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-form>
  </q-card-section>

  <!-- Table Section -->
  <q-card-section>
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h6 text-grey-8">
          <q-icon name="list_alt" size="sm" class="q-mr-sm" />
          Productos en la Compra
        </div>
      </div>
      <div class="col-auto">
        <q-badge
          color="primary"
          :label="`${detalleItems.length} producto${detalleItems.length !== 1 ? 's' : ''}`"
        />
      </div>
    </div>

    <q-separator class="q-mb-md" />

    <q-table
      :rows="detalleItems"
      :columns="columnas"
      row-key="id"
      flat
      bordered
      :rows-per-page-options="[10, 25, 50]"
      class="shadow-1"
    >
      <template v-slot:no-data>
        <div class="full-width row flex-center q-gutter-sm q-py-xl">
          <q-icon name="shopping_cart" size="3em" color="grey-5" />
          <div class="text-center">
            <div class="text-h6 text-grey-6">No hay productos añadidos</div>
            <div class="text-grey-5">
              Añade productos a esta compra usando el formulario superior
            </div>
          </div>
        </div>
      </template>

      <template v-slot:body-cell-codigo="props">
        <q-td :props="props">
          <q-badge color="grey-3" text-color="grey-8" :label="props.row.codigo" />
        </q-td>
      </template>

      <template v-slot:body-cell-descripcion="props">
        <q-td :props="props">
          <div class="text-weight-medium">{{ props.row.descripcion }}</div>
        </q-td>
      </template>

      <template v-slot:body-cell-precio="props">
        <q-td :props="props" class="text-weight-medium">
          {{ divisaActiva.simbolo }} {{ decimas(props.row.precio) }}
        </q-td>
      </template>

      <template v-slot:body-cell-cantidad="props">
        <q-td :props="props">
          <q-chip color="blue-1" text-color="blue-9" dense>
            {{ props.row.cantidad }}
          </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-subtotal="props">
        <q-td :props="props" class="text-weight-bold text-primary">
          {{ divisaActiva.simbolo }} {{ (props.row.precio * props.row.cantidad).toFixed(2) }}
        </q-td>
      </template>

      <template v-slot:body-cell-opciones="props" v-if="compra.autorizacion == 2">
        <q-td align="center">
          <q-btn
            dense
            round
            flat
            icon="edit"
            color="primary"
            size="sm"
            @click="iniciarEdicion(props.row)"
          >
            <q-tooltip>Editar producto</q-tooltip>
          </q-btn>
          <q-btn
            dense
            round
            flat
            icon="delete"
            color="negative"
            size="sm"
            @click="confirmarEliminar(props.row)"
          >
            <q-tooltip>Eliminar producto</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template v-slot:bottom-row>
        <q-tr class="bg-grey-2">
          <q-td colspan="4" class="text-right text-weight-bold text-grey-9 text-h6">
            <q-icon name="calculate" class="q-mr-sm" />
            Total:
          </q-td>
          <q-td class="text-weight-bold text-h5 text-primary">
            {{ divisaActiva.simbolo }} {{ total.toFixed(2) }}
          </q-td>
          <q-td v-if="compra.autorizacion == 2"></q-td>
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
  descripcion: '',
  stockActual: 0,
  unidad: '',
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
    descripcion: '',
    stockActual: 0,
    unidad: '',
  }
  formRef.value.reset()
  formRef.value.resetValidation()

  esModoEdicion.value = false
}

// --- MÉTODOS DE LA TABLA ---
async function iniciarEdicion(row) {
  try {
    const point = `verificarIDdetallecompra/${row.id}`
    const response = await api.get(point)
    
    if (response.data.estado == 'exito') {
      esModoEdicion.value = true
      
      // Usar datos directamente de la API
      detalleForm.value = {
        id: response.data.datos.id,
        idproductoalmacen: response.data.datos.idproductoalmacen,
        precio: response.data.datos.precio,
        cantidad: response.data.datos.cantidad,
        descripcion: response.data.datos.descripcion,
        stockActual: Number(response.data.datos.stock) || 0,
        unidad: response.data.datos.unidad || '',
      }
    } else {
      $q.notify({ type: 'negative', message: response.data.mensaje || 'Error al Editar' })
    }
  } catch (error) {
    console.error('Error al iniciar edición:', error)
    $q.notify({ type: 'negative', message: 'No se pudo cargar la información del producto.' })
  }
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

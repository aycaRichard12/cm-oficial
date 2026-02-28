<template>
  <!-- Form Section -->
  <q-card-section v-if="compra.autorizacion == 2" class="q-pa-md q-pb-none">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-subtitle1 text-weight-bold text-primary flex items-center">
        <q-icon name="add_shopping_cart" size="sm" class="q-mr-sm" />
        {{ esModoEdicion ? 'Editar Producto' : 'Añadir Producto' }}
      </div>
      <q-chip 
        v-if="esModoEdicion" 
        color="warning" 
        text-color="white" 
        icon="edit" 
        size="sm" 
        class="text-weight-medium"
        removable
        @remove="onResetForm"
      />
    </div>

    <q-form @submit="onSubmit" ref="formRef" class="q-mb-md">
      <div class="row q-col-gutter-md items-start">
        <!-- Producto en modo edición -->
        <div class="col-xs-12 col-sm-12 col-md-5" v-if="esModoEdicion">
          <q-input
            v-model="detalleForm.descripcion"
            dense
            filled
            readonly
            bg-color="grey-2"
            label="Producto o Servicio"
            class="full-width"
            stack-label
          >
            <template v-slot:prepend>
              <q-icon name="lock" size="xs" color="grey-6" />
            </template>
          </q-input>
        </div>

        <!-- Producto en modo añadir -->
        <div class="col-xs-12 col-sm-12 col-md-5" v-if="!esModoEdicion">
          <q-select
            use-input
            hide-selected
            fill-input
            v-model="detalleForm.idproductoalmacen"
            :options="productosFiltrados"
            @filter="filtrarProductos"
            id="producto"
            filled
            emit-value
            map-options
            option-label="label"
            option-value="value"
            :rules="[(val) => !!val || 'Requerido']"
            dense
            clearable
            class="full-width"
            label="Buscar Producto o Servicio *"
            behavior="menu"
            input-debounce="500"
            bg-color="grey-2"
          >
            <template v-slot:prepend>
              <q-icon name="search" size="xs" color="primary" />
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey text-italic"> No se encontraron productos </q-item-section>
              </q-item>
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon name="inventory" color="primary" size="xs" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>
                    Stock: {{ productosDisponibles.find(p => p.value === scope.opt.value)?.stock || 0 }} 
                    {{ productosDisponibles.find(p => p.value === scope.opt.value)?.unidad || '' }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <!-- Detalles de Stock y Unidad -->
        <div class="col-xs-12 col-sm-12 col-md-7" v-if="!esModoEdicion">
          <div class="row q-col-gutter-md">
            <div class="col-xs-6 col-md-6">
              <q-input
                v-model="detalleForm.stockActual"
                readonly
                dense
                filled
                type="number"
                bg-color="grey-2"
                label="Stock Actual"
                class="full-width"
                stack-label
                text-color="grey-9"
              >
                <template v-slot:prepend>
                   <q-icon name="inventory_2" size="xs" color="grey-7" />
                </template>
              </q-input>
            </div>
            <div class="col-xs-6 col-md-6">
              <q-input
                v-model="detalleForm.unidad"
                type="text"
                dense
                filled
                readonly
                bg-color="grey-2"
                label="Unidad"
                class="full-width"
                stack-label
                text-color="grey-9"
              >
               <template v-slot:prepend>
                   <q-icon name="straighten" size="xs" color="grey-7" />
                </template>
              </q-input>
            </div>
          </div>
        </div>

        <!-- Precios y Cantidades -->
        <div class="col-xs-12 col-sm-12 col-md-8">
          <div class="row q-col-gutter-md">
            <div class="col-xs-12 col-sm-6">
<q-input
  v-model="detalleForm.precio"
  type="text"
  inputmode="decimal"
  :rules="[(val) => val > 0 || 'Mayor a 0']"
  dense
  filled
  label="Precio Unit. *"
  placeholder="0.00"
  class="full-width"
  stack-label
  bg-color="grey-2"
  text-color="grey-9"
  @update:model-value="(val) => detalleForm.precio = parseFloat(val) || null"
>
  <template v-slot:prepend>
    <q-icon name="payments" size="xs" color="grey-7" />
  </template>
  <template v-slot:append>
    <span class="text-grey-9 text-weight-bold">{{ divisaActiva.simbolo }}</span>
  </template>
</q-input>
            </div>
            <div class="col-xs-12 col-sm-6">
              <q-input
                v-model.number="detalleForm.cantidad"
                type="text"
                inputmode="decimal"
                :rules="[(val) => val > 0 || 'Mayor a 0']"
                dense
                filled
                clearable
                label="Cantidad *"
                placeholder="0"
                class="full-width"
                stack-label
                bg-color="grey-2"
                text-color="grey-9"
                @update:model-value="(val) => detalleForm.cantidad = parseFloat(val) || null"
                >
                <template v-slot:prepend>
                  <q-icon name="numbers" size="xs" color="grey-7" />
                </template>
                <template v-slot:append>
                  <span class="text-grey-9 text-weight-bold" size="xs">{{ detalleForm.unidad || 'und' }}</span>
                </template>
              </q-input>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="col-xs-12 col-md-4 flex items-start justify-center justify-md-end q-gutter-sm q-pb-md">
          <q-btn
            v-if="esModoEdicion"
            label="Cancelar"
            color="grey-7"
            flat
            rounded
            @click="onResetForm"
            no-caps
            icon="close"
            :class="$q.screen.lt.md ? 'full-width q-mb-xs' : ''"
          />
          <q-btn
            :label="esModoEdicion ? 'Guardar Cambios' : 'Añadir a la Compra'"
            :icon="esModoEdicion ? 'save' : 'add'"
            color="primary"
            type="submit"
            unelevated
            rounded
            no-caps
            :disable="!detalleForm.idproductoalmacen && !esModoEdicion"
            :class="$q.screen.lt.md ? 'full-width' : 'q-px-lg'"
          />
        </div>
      </div>
    </q-form>
  </q-card-section>

  <!-- Table Section -->
  <q-card-section class="q-pt-none bg-grey-1">
    <div class="row items-center justify-between q-py-sm">
      <div class="text-subtitle1 text-weight-bold text-grey-8 flex items-center">
        <q-icon name="list_alt" size="sm" class="q-mr-sm text-primary" />
        Detalle de Productos
      </div>
      <q-badge
        color="primary"
        rounded
        class="q-pa-sm text-caption text-weight-bold"
        :label="`${detalleItems.length} producto${detalleItems.length !== 1 ? 's' : ''}`"
      />
    </div>

    <q-table
      :rows="detalleItems"
      :columns="columnas"
      row-key="id"
      flat
      bordered
      table-header-class="bg-primary-2 text-grey-9 text-weight-bold"
      :grid="$q.screen.lt.sm"
      :rows-per-page-options="[5, 10, 25, 50]"
      class="rounded-borders"
      :loading="loadingTable"
      binary-state-sort
      separator="cell"
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center q-gutter-sm q-py-xl text-grey-5">
          <q-icon name="shopping_cart" size="4em" />
          <div class="text-center">
            <div class="text-h6 text-grey-6">La lista está vacía</div>
            <div class="text-caption">
              Añade productos usando el formulario superior
            </div>
          </div>
        </div>
      </template>

      <!-- CUSTOM GRID CARDS ON MOBILE -->
      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6">
          <q-card flat bordered class="bg-white full-width rounded-borders">
            <!-- Header Card (Description + Options) -->
            <q-item class="q-py-sm">
              <q-item-section>
                <q-item-label class="text-weight-bold text-subtitle2 text-grey-9">
                  <q-badge color="primary" text-color="white" :label="props.row.codigo" class="q-mr-sm" />
                  {{ props.row.descripcion }}
                </q-item-label>
              </q-item-section>
              <q-item-section side v-if="compra.autorizacion == 2" class="q-pl-none">
                <div class="row q-gutter-x-xs">
                  <q-btn dense round flat icon="edit" color="primary" size="sm" @click="iniciarEdicion(props.row)">
                    <q-tooltip>Editar producto</q-tooltip>
                  </q-btn>
                  <q-btn dense round flat icon="delete" color="negative" size="sm" @click="confirmarEliminar(props.row)">
                    <q-tooltip>Eliminar producto</q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
            
            <q-separator />
            
            <!-- Body Card (Quantities & Prices) -->
            <q-card-section class="q-py-sm">
              <div class="row items-center">
                <div class="col-4">
                  <div class="text-caption text-grey-7 text-weight-medium">Precio</div>
                  <div class="text-weight-bold text-positive">
                    <q-icon name="payments" size="xs" class="q-mr-xs" />
                    {{ divisaActiva.simbolo }} {{ decimas(props.row.precio) }}
                  </div>
                </div>
                <div class="col-3 text-center">
                  <div class="text-caption text-grey-7 text-weight-medium">Cant.</div>
                  <q-badge color="info" text-color="white" class="q-ma-none text-weight-bold">
                    <q-icon name="numbers" size="xs" class="q-mr-xs" />
                    {{ props.row.cantidad }}
                  </q-badge>
                </div>
                <div class="col-5 text-right">
                  <div class="text-caption text-grey-7 text-weight-medium">Sub Total</div>
                  <div class="text-weight-bold text-primary text-subtitle1">
                    {{ divisaActiva.simbolo }} {{ (props.row.precio * props.row.cantidad).toFixed(2) }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>

      <template v-slot:body-cell-codigo="props">
        <q-td :props="props">
          <q-badge color="primary" text-color="white" :label="props.row.codigo" />
        </q-td>
      </template>

      <template v-slot:body-cell-descripcion="props">
        <q-td :props="props">
          <div class="text-weight-medium">{{ props.row.descripcion }}</div>
        </q-td>
      </template>

      <template v-slot:body-cell-precio="props">
        <q-td :props="props" class="text-weight-medium text-right">
          <div class="text-positive">
            <q-icon name="payments" size="xs" class="q-mr-xs" />
            {{ decimas(props.row.precio) }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-cantidad="props">
        <q-td :props="props">
          <q-badge color="info" text-color="white">
            <q-icon name="numbers" size="xs" class="q-mr-xs" />
            {{ props.row.cantidad }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-subtotal="props">
        <q-td :props="props" class="text-weight-bold text-primary text-right">
          {{ (props.row.precio * props.row.cantidad).toFixed(2) }}
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
            class="q-mr-xs"
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
        <q-tr class="bg-primary-1">
          <q-td colspan="4" class="text-right text-weight-bold text-grey-9 text-subtitle1">
            <div class="row items-center justify-end q-gutter-x-sm">
              <span>TOTAL GENERAL:</span>
            </div>
          </q-td>
          <q-td class="text-weight-bold text-h6 text-primary text-right">
            {{ divisaActiva.simbolo }} {{ total.toFixed(2) }}
          </q-td>
          <q-td v-if="compra.autorizacion == 2"></q-td>
        </q-tr>
      </template>
    </q-table>
  </q-card-section>

  <q-separator />

  <!-- Boton Cerrar Inferior -->
  <q-card-actions align="right" class="q-py-sm q-px-md bg-transparent">
    <q-btn
      label="Cerrar Panel"
      color="grey-9"
      icon="close"
      outline
      no-caps
      @click="emit('close')"
      class="text-weight-medium full-width-sm q-px-lg"
    />
  </q-card-actions>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
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
const emit = defineEmits(['close', 'update', 'submit'])

// --- ESTADO REACTIVO ---
const formRef = ref(null)
const detalleItems = ref([])
const productosDisponibles = ref([])
const productosFiltrados = ref([])
const esModoEdicion = ref(false)
const loadingTable = ref(false)

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
const columnas = computed(() => [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left', sortable: true },
  { name: 'precio', label: `Precio Unit. (${divisaActiva.simbolo})`, field: 'precio', align: 'right', sortable: true },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right', sortable: true },
  { name: 'subtotal', label: `Sub Total (${divisaActiva.simbolo})`, align: 'right', sortable: true },
  { name: 'opciones', label: 'Opciones', align: 'center' },
])

const total = computed(() => {
  return detalleItems.value.reduce((sum, item) => sum + Number(item.precio) * Number(item.cantidad), 0)
})

// --- WATCHERS ---
watch(
  () => props.compra.id,
  (newId) => {
    if (newId) {
      cargarDatos()
    }
  },
  { immediate: true }
)

watch(
  () => detalleForm.value.idproductoalmacen,
  (nuevoValor) => {
    const productoSeleccionado = productosDisponibles.value.find((p) => p.value === nuevoValor)
    if (productoSeleccionado) {
      detalleForm.value.stockActual = productoSeleccionado.stock
      detalleForm.value.unidad = productoSeleccionado.unidad
      detalleForm.value.precio = productoSeleccionado.precio || null
    }
  },
)

// --- MÉTODOS DE DATOS (API) ---
async function cargarDatos() {
  $q.loading.show({ message: 'Cargando datos...' })
  try {
    await Promise.all([getDetalleCompra(), listaProductosDisponibles()])
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({ 
      type: 'negative', 
      message: 'Error al cargar los datos iniciales.',
      position: 'top'
    })
  } finally {
    $q.loading.hide()
  }
}

async function getDetalleCompra() {
  loadingTable.value = true
  try {
    const response = await api.get(`listaDetalleCompra/${props.compra.id}`)
    detalleItems.value = response.data
  } catch (error) {
    console.error('Error al cargar detalles de compra:', error)
    $q.notify({ 
      type: 'negative', 
      message: 'No se pudieron cargar los detalles de la compra',
      position: 'top'
    })
  } finally {
    loadingTable.value = false
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
      precio: item.precio
    }))
    productosFiltrados.value = [...productosDisponibles.value]
  } catch (error) {
    console.error('Error al cargar productos disponibles:', error)
    $q.notify({ 
      type: 'negative', 
      message: 'No se pudieron cargar los productos',
      position: 'top'
    })
  }
}

// --- MÉTODOS DEL FORMULARIO ---
function filtrarProductos(val, update) {
  const needle = val.toLowerCase()
  update(() => {
    productosFiltrados.value = productosDisponibles.value.filter((p) =>
      p.label.toLowerCase().includes(needle)
    )
  })
}

async function onSubmit() {
  if (!formRef.value.validate()) return

  const formData = objectToFormData(detalleForm.value)
  formData.append('idingreso', props.compra.id)
  
  const isUpdate = esModoEdicion.value
  isUpdate ? formData.append('ver', 'editarDetalleCompra') : formData.append('ver', 'registrarDetalleCompra')

  try {
    $q.loading.show({ message: 'Guardando...' })
    const response = await api.post('', formData)

    if (response.data.estado === 'exito') {
      $q.notify({ 
        type: 'positive', 
        message: response.data.mensaje || 'Guardado con éxito',
        position: 'top'
      })
      await getDetalleCompra()
      await listaProductosDisponibles()
      onResetForm()
      emit('update')
    } else {
      $q.notify({ 
        type: 'negative', 
        message: response.data.mensaje || 'Error al guardar',
        position: 'top'
      })
    }
  } catch (error) {
    console.error('Error en onSubmit:', error)
    $q.notify({ 
      type: 'negative', 
      message: 'Hubo un problema de comunicación con el servidor.',
      position: 'top'
    })
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
  formRef.value?.reset()
  formRef.value?.resetValidation()
  esModoEdicion.value = false
}

// --- MÉTODOS DE LA TABLA ---
async function iniciarEdicion(row) {
  try {
    $q.loading.show({ message: 'Cargando datos...' })
    const point = `verificarIDdetallecompra/${row.id}`
    const response = await api.get(point)
    
    if (response.data.estado == 'exito') {
      esModoEdicion.value = true
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
      $q.notify({ 
        type: 'negative', 
        message: response.data.mensaje || 'Error al Editar',
        position: 'top'
      })
    }
  } catch (error) {
    console.error('Error al iniciar edición:', error)
    $q.notify({ 
      type: 'negative', 
      message: 'No se pudo cargar la información del producto.',
      position: 'top'
    })
  } finally {
    $q.loading.hide()
  }
}

function confirmarEliminar(row) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Estás seguro de que quieres eliminar el producto "${row.descripcion}"?`,
    cancel: true,
    persistent: true,
    ok: { color: 'negative', label: 'Eliminar' },
  }).onOk(async () => {
    await eliminarDetalle(row)
  })
}

async function eliminarDetalle(row) {
  try {
    $q.loading.show({ message: 'Eliminando...' })
    const response = await api.get(`eliminarDetalleCompra/${row.id}`)
    if (response.data.estado === 'exito') {
      $q.notify({ 
        type: 'positive', 
        message: response.data.mensaje,
        position: 'top'
      })
      await getDetalleCompra()
      emit('update')
    } else {
      $q.notify({ 
        type: 'negative', 
        message: response.data.mensaje,
        position: 'top'
      })
    }
  } catch (error) {
    console.error('Error al eliminar detalle:', error)
    $q.notify({ 
      type: 'negative', 
      message: 'No se pudo eliminar el producto.',
      position: 'top'
    })
  } finally {
    $q.loading.hide()
  }
}
</script>
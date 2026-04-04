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
                <q-item-section class="text-grey text-italic">
                  No se encontraron productos
                </q-item-section>
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
                    Stock:
                    {{ productosDisponibles.find((p) => p.value === scope.opt.value)?.stock || 0 }}
                    {{
                      productosDisponibles.find((p) => p.value === scope.opt.value)?.unidad || ''
                    }}
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
                @update:model-value="(val) => (detalleForm.precio = parseFloat(val) || null)"
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
                @update:model-value="(val) => (detalleForm.cantidad = parseFloat(val) || null)"
              >
                <template v-slot:prepend>
                  <q-icon name="numbers" size="xs" color="grey-7" />
                </template>
                <template v-slot:append>
                  <span class="text-grey-9 text-weight-bold" size="xs">{{
                    detalleForm.unidad || 'und'
                  }}</span>
                </template>
              </q-input>
            </div>
          </div>
        </div>

        <!-- Botones de acción -->
        <div
          class="col-xs-12 col-md-4 flex items-start justify-center justify-md-end q-gutter-sm q-pb-md"
        >
          <q-checkbox
            v-if="productoUnico"
            v-model="detalleForm.productoUnico"
            label="Producto Único"
            color="primary"
            class="q-mr-md"
            :disable="esModoEdicion"
          >
            <q-tooltip v-if="esModoEdicion">
              No se puede cambiar el tipo de producto en edición
            </q-tooltip>
          </q-checkbox>
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
      separator="cell"
      :loading="loadingTable"
      class="rounded-borders"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-btn
              v-if="props.row.productos_detallados && props.row.productos_detallados.length > 0"
              size="sm"
              color="primary"
              round
              dense
              @click="props.expand = !props.expand"
              :icon="props.expand ? 'expand_less' : 'expand_more'"
            />
          </q-td>
          <q-td key="codigo" :props="props">
            <q-badge color="primary" :label="props.row.codigo" />
          </q-td>
          <q-td key="descripcion" :props="props">
            <div class="text-weight-medium">{{ props.row.descripcion }}</div>
          </q-td>
          <q-td key="precio" :props="props" class="text-right">
            <div class="text-positive">{{ decimas(props.row.precio) }}</div>
          </q-td>
          <q-td key="cantidad" :props="props" class="text-right">
            <q-badge color="info">{{ props.row.cantidad }}</q-badge>
          </q-td>
          <q-td key="subtotal" :props="props" class="text-right text-weight-bold text-primary">
            {{ (props.row.precio * props.row.cantidad).toFixed(2) }}
          </q-td>
          <q-td key="opciones" :props="props" align="center">
            <q-btn
              dense
              round
              flat
              icon="edit"
              color="primary"
              size="sm"
              @click="iniciarEdicion(props.row)"
            />
            <q-btn
              dense
              round
              flat
              icon="delete"
              color="negative"
              size="sm"
              @click="confirmarEliminar(props.row)"
            />
          </q-td>
        </q-tr>

        <q-tr v-show="props.expand" :props="props" class="bg-grey-2">
          <q-td colspan="100%">
            <div class="q-pa-sm">
              <div class="text-caption text-weight-bold q-mb-xs">ASIGNACIÓN DE CÓDIGOS ÚNICOS:</div>
              <div class="row q-col-gutter-sm">
                <div
                  v-for="(sub, index) in props.row.productos_detallados"
                  :key="sub.id"
                  class="col-xs-12 col-sm-6 col-md-4"
                >
                  <q-input
                    v-model="sub.codigo"
                    dense
                    filled
                    bg-color="white"
                    label-slot
                    @blur="actualizarCodigoIndividual(sub)"
                  >
                    <template v-slot:label> Código #{{ index + 1 }} </template>
                    <template v-slot:append>
                      <q-btn
                        round
                        dense
                        flat
                        icon="close"
                        color="negative"
                        size="xs"
                        @click="eliminarSubCodigo(props.row, sub)"
                      />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:bottom-row>
        <q-tr class="bg-primary-1">
          <q-td colspan="5" class="text-right text-weight-bold text-subtitle1">TOTAL GENERAL:</q-td>
          <q-td class="text-weight-bold text-h6 text-primary text-right">
            {{ divisaActiva.simbolo }} {{ total.toFixed(2) }}
          </q-td>
          <q-td></q-td>
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
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { useProductoConfig } from 'src/composables/productoUnico/useProductoConfig'
const productoUnico = ref(false)
const idempresa = idempresa_md5()

const { config } = useProductoConfig(idempresa)
watch(
  () => config.value.idempresa,
  (nuevoValor) => {
    if (nuevoValor) {
      productoUnico.value = Boolean(config.value.productounico)
      console.log('Configuración actualizada:', config.value)
      console.log(productoUnico.value)
    }
  },
  { deep: true },
)
console.log('Producto Único Activado:', productoUnico.value)
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
  productoUnico: false,
})

// --- COMPUTED PROPERTIES ---
const columnas = computed(() => [
  { name: 'exp', label: '', align: 'left' }, // Espacio para el botón +
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  // ... el resto de tus columnas
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
])

const total = computed(() => {
  return detalleItems.value.reduce(
    (sum, item) => sum + Number(item.precio) * Number(item.cantidad),
    0,
  )
})

// --- WATCHERS ---
watch(
  () => props.compra.id,
  (newId) => {
    if (newId) {
      cargarDatos()
    }
  },
  { immediate: true },
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
      position: 'top',
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
    console.log('Detalle de compra cargado:', detalleItems.value)
  } catch (error) {
    console.error('Error al cargar detalles de compra:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los detalles de la compra',
      position: 'top',
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
      precio: item.precio,
    }))
    productosFiltrados.value = [...productosDisponibles.value]
  } catch (error) {
    console.error('Error al cargar productos disponibles:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los productos',
      position: 'top',
    })
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
function confirmarCantidadEspecial() {
  return new Promise((resolve) => {
    $q.dialog({
      title: '<span class="text-primary">Atención: Producto Único</span>',
      message: `
        <div class="text-center">
          <p>Vas a registrar una cantidad de:</p>
          <div class="text-h2 text-bold text-primary q-my-md">
            ${detalleForm.value.cantidad}
          </div>
          <p>Se generarán <b>${detalleForm.value.cantidad}</b> registros individuales con códigos únicos. <br>¿Confirmas que la cantidad es correcta?</p>
        </div>
      `,
      html: true,
      persistent: true,
      ok: { label: 'Sí, Correcto', color: 'primary', unelevated: true },
      cancel: { label: 'Corregir', color: 'grey', flat: true },
    })
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false))
      .onDismiss(() => resolve(false))
  })
}
async function onSubmit() {
  if (!formRef.value.validate()) return
  if (!esModoEdicion.value && detalleForm.value.productoUnico) {
    const confirmado = await confirmarCantidadEspecial()
    if (!confirmado) return
  }
  const formData = objectToFormData(detalleForm.value)
  formData.append('idingreso', props.compra.id)

  const isUpdate = esModoEdicion.value
  isUpdate
    ? formData.append('ver', 'editarDetalleCompra')
    : formData.append('ver', 'registrarDetalleCompra')

  try {
    $q.loading.show({ message: 'Guardando...' })
    const response = await api.post('', formData)
    console.log('Respuesta API al guardar detalle:', response.data)
    if (response.data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: response.data.mensaje || 'Guardado con éxito',
        position: 'top',
      })
      await getDetalleCompra()
      await listaProductosDisponibles()
      onResetForm()
      emit('update')
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.mensaje || 'Error al guardar',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Error en onSubmit:', error)
    $q.notify({
      type: 'negative',
      message: 'Hubo un problema de comunicación con el servidor.',
      position: 'top',
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
    productoUnico: false,
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
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Error al iniciar edición:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo cargar la información del producto.',
      position: 'top',
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

// Actualizar un código individual al salir del input (blur)
async function actualizarCodigoIndividual(subProducto) {
  try {
    // Aquí deberías llamar a tu API que actualice solo el código del producto detallado
    // Ejemplo:
    const formData = new FormData()
    formData.append('id', subProducto.id)
    formData.append('codigo', subProducto.codigo)
    formData.append('ver', 'actualizarCodigoUnico') // Ajusta según tu API

    const response = await api.post('', formData)
    console.log('Respuesta al actualizar código individual:', response.data)
    if (response.data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: 'Código actualizado',
        position: 'bottom-right',
        timeout: 800,
      })
    }
  } catch (error) {
    console.error('Error al actualizar sub-código', error)
  }
}

// Eliminar un sub-código y actualizar la cantidad del padre
async function eliminarSubCodigo(padre, sub) {
  console.log('Intentando eliminar sub-código:', sub)
  $q.dialog({
    title: 'Eliminar Código Único',
    message: `¿Deseas eliminar el código ${sub.codigo}? Esto reducirá la cantidad del producto principal.`,
    cancel: true,
    ok: { color: 'negative', label: 'Eliminar' },
  }).onOk(async () => {
    try {
      $q.loading.show()
      // Llamada a la API para eliminar el sub-registro
      const response = await api.get(`eliminarProductoUnico/${sub.id}`) // Ajusta la ruta
      console.log('Respuesta al eliminar sub-código:', response.data)
      if (response.data.estado === 'exito') {
        // Actualizamos localmente para no recargar toda la tabla
        padre.productos_detallados = padre.productos_detallados.filter((i) => i.id !== sub.id)
        padre.cantidad = padre.productos_detallados.length

        $q.notify({ type: 'positive', message: 'Eliminado correctamente' })
        emit('update') // Para refrescar totales si es necesario
      }
    } catch (error) {
      $q.notify({ type: 'negative', message: 'No se pudo eliminar' })
      console.error('Error al eliminar sub-código', error)
    } finally {
      $q.loading.hide()
    }
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
        position: 'top',
      })
      await getDetalleCompra()
      emit('update')
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.mensaje,
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Error al eliminar detalle:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudo eliminar el producto.',
      position: 'top',
    })
  } finally {
    $q.loading.hide()
  }
}
</script>

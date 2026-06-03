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

    <q-form @submit="onSubmit" ref="formRef" class="purchase-form">
      <div class="row q-col-gutter-xl items-start">
        <!-- Columna principal del producto -->
        <div class="col-12 col-md-12">
          <!-- Tarjeta de selección de producto -->
          <q-card flat class="product-card q-mb-lg">
            <q-card-section class="q-pa-lg">
              <!-- Encabezado de sección -->
              <div class="row q-col-gutter-md items-center">
                <div class="col-xs-12 col-md-6">
                  <div class="section-header flex items-center">
                    <div class="section-indicator bg-primary"></div>
                    <q-icon name="shopping_bag" size="sm" color="primary" class="q-mr-sm" />
                    <h3 class="section-title text-h6 text-grey-9 q-ma-none text-weight-medium">
                      {{ esModoEdicion ? 'Editar Producto' : 'Seleccionar Producto' }}
                    </h3>
                    <q-badge
                      v-if="esModoEdicion"
                      color="orange-7"
                      rounded
                      class="q-ml-sm q-px-md"
                      outline
                    >
                      Modo Edición
                    </q-badge>
                  </div>
                </div>

                <div class="col-xs-12 col-md-6">
                  <div v-if="productoUnico" class="unique-product-section q-mb-sm">
                    <q-checkbox
                      v-model="detalleForm.productoUnico"
                      label="Producto Único"
                      color="primary"
                      class="custom-checkbox text-weight-medium"
                      :disable="esModoEdicion"
                    >
                      <template v-slot:label>
                        <span class="text-grey-800">Producto Único</span>
                      </template>
                    </q-checkbox>

                    <q-tooltip v-if="esModoEdicion" class="bg-grey-800">
                      No se puede cambiar el tipo de producto en modo edición
                    </q-tooltip>
                  </div>
                </div>
              </div>

              <!-- Producto en modo edición -->
              <div v-if="esModoEdicion">
                <q-input
                  v-model="detalleForm.descripcion"
                  dense
                  outlined
                  readonly
                  bg-color="grey-50"
                  label="Producto o Servicio"
                  class="readonly-input full-width"
                  stack-label
                >
                  <template v-slot:prepend>
                    <q-icon name="inventory_2" size="xs" color="primary" />
                  </template>
                  <template v-slot:append>
                    <q-icon name="lock" size="xs" color="grey-400" />
                  </template>
                </q-input>
              </div>

              <!-- Producto en modo añadir -->
              <div v-if="!esModoEdicion">
                <q-select
                  use-input
                  hide-selected
                  fill-input
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
                  class="product-select full-width"
                  behavior="menu"
                  input-debounce=""
                  bg-color="white"
                  placeholder="Escribe para buscar..."
                >
                  <template v-slot:prepend>
                    <q-icon name="search" size="xs" color="primary" />
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey-500 text-center q-py-md">
                        <q-icon name="inbox" size="md" class="q-mb-sm" />
                        <div>No se encontraron productos</div>
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps" class="product-option">
                      <q-item-section avatar>
                        <q-avatar
                          rounded
                          color="primary-50"
                          text-color="primary"
                          icon="inventory"
                          size="36px"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium">{{
                          scope.opt.label
                        }}</q-item-label>
                        <div class="stock-info text-caption text-grey-600 q-mt-xs">
                          <q-icon name="inventory_2" size="xs" />
                          <span
                            >Stock:
                            {{
                              productosDisponibles.find((p) => p.value === scope.opt.value)
                                ?.stock || 0
                            }}</span
                          >
                          <span class="q-mx-xs">•</span>
                          <q-icon name="straighten" size="xs" />
                          <span>{{
                            productosDisponibles.find((p) => p.value === scope.opt.value)?.unidad ||
                            ''
                          }}</span>
                        </div>
                      </q-item-section>
                      <q-item-section side>
                        <q-icon name="chevron_right" size="xs" color="grey-400" />
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>

                <div
                  v-if="detalleForm.idproductoalmacen"
                  class="stock-indicators row q-col-gutter-md"
                >
                  <div class="col-6">
                    <div class="flex items-center q-px-md q-py-sm bg-blue-1 rounded-borders">
                      <q-icon name="inventory_2" size="sm" color="primary" class="q-mr-sm" />
                      <div class="column">
                        <span class="text-caption text-primary text-weight-bold">STOCK ACTUAL</span>
                        <span class="text-subtitle1 text-blue-10 text-weight-bolder">{{
                          detalleForm.stockActual
                        }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="col-6">
                    <div class="flex items-center q-px-md q-py-sm bg-orange-1 rounded-borders">
                      <q-icon name="straighten" size="sm" color="orange-8" class="q-mr-sm" />
                      <div class="column">
                        <span class="text-caption text-orange-9 text-weight-bold">UNIDAD</span>
                        <span class="text-subtitle1 text-orange-10 text-weight-bolder">{{
                          detalleForm.unidad || '---'
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Tarjeta de precios y cantidades -->
          <q-card flat class="product-card">
            <q-card-section class="q-pa-lg">
              <div class="section-header flex items-center q-mb-md">
                <div class="section-indicator bg-primary"></div>
                <q-icon name="price_change" size="sm" color="primary" class="q-mr-sm" />
                <h3 class="section-title text-h6 text-grey-9 q-ma-none text-weight-medium">
                  Precio y Cantidad
                </h3>
              </div>

              <div class="row q-col-gutter-lg items-end">
                <div class="col-12 col-sm-6 col-md-4">
                  <div class="q-mb-sm">
                    <q-checkbox
                      v-model="detalleForm.sinPrecio"
                      label="Registrar Sin Precio"
                      color="orange-7"
                      dense
                      class="custom-checkbox"
                      icon="check_box_outline_blank"
                      checked-icon="check_box"
                      @update:model-value="
                        (val) => {
                          if (val) {
                            detalleForm.precio = '0'
                            formRef?.validate()
                          }
                        }
                      "
                    />
                  </div>

                  <q-input
                    v-if="!detalleForm.sinPrecio"
                    v-model="detalleForm.precio"
                    type="text"
                    inputmode="decimal"
                    :rules="[
                      (val) => (val !== null && val !== '') || 'Requerido',
                      (val) => parseFloat(val) > 0 || 'Mayor a 0',
                    ]"
                    dense
                    outlined
                    label="Precio Unitario *"
                    placeholder="0.00"
                    class="price-input full-width"
                    stack-label
                    bg-color="white"
                  >
                    <template v-slot:prepend>
                      <q-icon name="attach_money" size="xs" color="grey-6" />
                    </template>
                    <template v-slot:append>
                      <q-badge outline color="primary" class="currency-badge text-body2">
                        {{ divisaActiva.simbolo }}
                      </q-badge>
                    </template>
                  </q-input>

                  <q-input
                    v-else
                    dense
                    outlined
                    readonly
                    bg-color="grey-2"
                    label="Precio Unitario"
                    placeholder="0.00"
                    class="full-width q-mb-md"
                    stack-label
                  >
                    <template v-slot:prepend>
                      <q-icon name="lock" size="xs" color="orange-7" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-sm-6 col-md-4">
                  <q-input
                    v-model.number="detalleForm.cantidad"
                    type="text"
                    inputmode="decimal"
                    :rules="[(val) => val > 0 || 'Mayor a 0']"
                    dense
                    outlined
                    clearable
                    label="Cantidad *"
                    placeholder="0"
                    class="quantity-input full-width"
                    stack-label
                    bg-color="white"
                    @update:model-value="(val) => (detalleForm.cantidad = parseFloat(val) || null)"
                  >
                    <template v-slot:prepend>
                      <q-icon name="production_quantity_limits" size="xs" color="grey-6" />
                    </template>
                    <template v-slot:append>
                      <q-badge outline color="primary" class="unit-badge text-body2">
                        {{ detalleForm.unidad || 'und' }}
                      </q-badge>
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-sm-12 col-md-4">
                  <div class="action-buttons column q-gutter-y-sm q-pb-md">
                    <q-btn
                      v-if="esModoEdicion"
                      label="Cancelar Edición"
                      color="grey-7"
                      flat
                      rounded
                      outline
                      dense
                      @click="onResetForm"
                      no-caps
                      icon="close"
                      class="full-width"
                    />

                    <q-btn
                      :label="esModoEdicion ? 'Actualizar Producto' : 'Agregar a la Compra'"
                      :icon="esModoEdicion ? 'update' : 'add_shopping_cart'"
                      color="primary"
                      type="submit"
                      unelevated
                      rounded
                      no-caps
                      :disable="!detalleForm.idproductoalmacen && !esModoEdicion"
                      class="full-width submit-btn text-weight-medium"
                      style="min-height: 40px"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Columna de acciones -->
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
      class="my-custom-table shadow-1"
      :loading="loadingTable"
    >
      <template v-slot:body="props">
        <q-tr :props="props" :class="props.expand ? 'bg-blue-1' : ''">
          <q-td auto-width>
            <q-btn
              v-if="props.row.productos_detallados?.length > 0"
              size="sm"
              color="primary"
              flat
              round
              @click="props.expand = !props.expand"
              :icon="props.expand ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
            >
              <q-tooltip>Ver detalles de códigos</q-tooltip>
            </q-btn>
          </q-td>

          <q-td key="codigo" :props="props">
            <q-chip outline color="primary" label-slot dense>
              <q-icon name="qr_code" size="xs" class="q-mr-xs" />
              {{ props.row.codigo }}
            </q-chip>
          </q-td>

          <q-td key="descripcion" :props="props">
            <div class="text-weight-bold">{{ props.row.descripcion }}</div>
          </q-td>

          <q-td key="precio" :props="props" class="text-right">
            <template v-if="Number(props.row.precio) > 0">
              {{ decimas(props.row.precio) }}
            </template>
            <q-badge v-else color="orange-9" label="0" />
          </q-td>

          <q-td key="cantidad" :props="props" class="text-right">
            <q-badge color="grey-8">{{ props.row.cantidad }}</q-badge>
          </q-td>

          <q-td key="subtotal" :props="props" class="text-right text-weight-bolder text-primary">
            {{ (props.row.precio * props.row.cantidad).toFixed(2) }}
          </q-td>

          <q-td key="opciones" :props="props" align="center" v-if="compra.autorizacion == 2">
            <q-btn
              flat
              round
              dense
              icon="edit"
              color="primary"
              size="sm"
              @click="iniciarEdicion(props.row)"
            />
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              size="sm"
              @click="confirmarEliminar(props.row)"
            />
          </q-td>
          <q-td v-else />
        </q-tr>

        <q-tr v-show="props.expand" :props="props" class="expanded-row-premium">
          <q-td colspan="100%" class="q-pa-lg">
            <TableCodigosUnicos
              v-model="props.row.productos_detallados"
              :parent-row="props.row"
              :can-delete="compra.autorizacion == 2"
              :can-edit="true"
              :api-mode="true"
              @update-parent-quantity="
                (nuevaCant) => {
                  props.row.cantidad = nuevaCant
                }
              "
            />
          </q-td>
        </q-tr>
      </template>

      <template v-slot:bottom-row>
        <q-tr class="bg-primary text-white">
          <q-td colspan="5" class="text-right text-weight-bold">TOTAL GENERAL:</q-td>
          <q-td class="text-right text-weight-bolder text-subtitle1">
            {{ divisaActiva.simbolo }} {{ total.toFixed(2) }}
          </q-td>
          <q-td />
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
import TableCodigosUnicos from '../cotizacion/TableCodigosUnicos.vue'
const productoUnico = ref(false)
const idempresa = idempresa_md5()

const { config } = useProductoConfig(idempresa)
watch(
  () => config.value.idempresa,
  (nuevoValor) => {
    if (nuevoValor) {
      productoUnico.value = Boolean(config.value.productounico)
    }
  },
  { deep: true },
)
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
  precio: '',
  cantidad: '',
  descripcion: '',
  stockActual: 0,
  unidad: '',
  productoUnico: false,
  sinPrecio: false,
})

// --- COMPUTED PROPERTIES ---
const columnas = computed(() => [
  { name: 'exp', label: '', align: 'left' },
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
      detalleForm.value.precio = productoSeleccionado.precio?.toString() || ''
    }
  },
)

watch(
  () => detalleForm.value.sinPrecio,
  (val) => {
    if (val) {
      detalleForm.value.precio = '0'
    } else if (detalleForm.value.precio === '0') {
      detalleForm.value.precio = ''
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

  // Convertir valores string a números con decimales antes de enviar
  const formData = objectToFormData({
    ...detalleForm.value,
    precio: parseFloat(detalleForm.value.precio) || 0,
    cantidad: parseFloat(detalleForm.value.cantidad) || 0,
  })
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
    precio: '',
    cantidad: '',
    descripcion: '',
    stockActual: 0,
    unidad: '',
    productoUnico: false,
    sinPrecio: false,
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
        precio: response.data.datos.precio?.toString() || '',
        cantidad: response.data.datos.cantidad?.toString() || '',
        descripcion: response.data.datos.descripcion,
        stockActual: Number(response.data.datos.stock) || 0,
        unidad: response.data.datos.unidad || '',
        sinPrecio: parseFloat(response.data.datos.precio) === 0,
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
<style scoped>
.my-custom-table {
  border-radius: 8px;
}

.sub-table-container {
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid #e0e0e0;
}

/* Estilo para que el input parezca texto normal hasta que se hace focus */
.input-edicion-activa {
  transition: all 0.3s ease;
  box-shadow: 0 0 5px rgba(25, 118, 210, 0.3); /* Un suave resplandor azul */
}

/* Efecto hover para el botón de check */
.icon-hover-positive:hover {
  background-color: #e8f5e9; /* green-1 */
  transform: scale(1.2);
  color: #2e7d32 !important;
}

/* Efecto hover para el botón de cerrar */
.icon-hover-negative:hover {
  background-color: #ffebee; /* red-1 */
  transform: scale(1.2);
  color: #c62828 !important;
}

/* Animación simple de entrada */
.input-edicion-activa {
  animation: fadeIn 0.2s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Estilos personalizados para mejorar la UI */
.purchase-form {
  max-width: 1400px;
  margin: 0 auto;
}

.product-card {
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  background: white;
}

.product-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.actions-card {
  border: 1px solid #e5e7eb;
  background: white;
}

.section-header {
  position: relative;
  padding-bottom: 4px;
}

.section-indicator {
  width: 4px;
  height: 24px;
  border-radius: 2px;
  margin-right: 12px;
}

.section-title {
  letter-spacing: -0.01em;
}

.product-select :deep(.q-field__control) {
  border-radius: 12px;
}

.product-select :deep(.q-field__native) {
  padding: 12px 0;
}

.readonly-input :deep(.q-field__control) {
  background-color: #f9fafb;
  border-radius: 12px;
}

.price-input :deep(.q-field__control),
.quantity-input :deep(.q-field__control) {
  border-radius: 12px;
  transition: all 0.2s ease;
}

.price-input :deep(.q-field__control:hover),
.quantity-input :deep(.q-field__control:hover) {
  border-color: #9ca3af;
}

.info-chip {
  border: 1px solid #f3f4f6;
  transition: all 0.2s ease;
}

.info-chip:hover {
  background-color: #f9fafb !important;
  border-color: #e5e7eb;
}

.currency-badge,
.unit-badge {
  background: white;
  padding: 4px 8px;
  font-weight: 600;
  border: 1px solid #e5e7eb;
  color: #4b5563;
}

.custom-checkbox :deep(.q-checkbox__label) {
  font-weight: 500;
  color: #374151;
}

.submit-btn {
  background: linear-gradient(135deg, #2c3e50 0%, #1a252f 100%);
  transition: transform 0.1s ease;
}

.submit-btn:active {
  transform: scale(0.98);
}

.sticky-actions {
  position: sticky;
  top: 90px;
}

/* Estilo para la opción del producto */
.product-option {
  border-radius: 8px;
  margin: 2px 8px;
}

.product-option:hover {
  background-color: #f9fafb;
}

/* Mejoras para dispositivos móviles */
@media (max-width: 768px) {
  .sticky-actions {
    position: static;
    top: auto;
  }

  .section-title {
    font-size: 1rem;
  }

  .product-card .q-pa-lg {
    padding: 16px;
  }

  .checkbox-hint {
    margin-left: 28px;
  }
}

/* Animaciones suaves */
.product-card,
.actions-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Mejora de accesibilidad */
:deep(.q-field__native:focus) {
  border-color: #2c3e50;
}

:deep(.q-btn:focus-visible) {
  outline: 2px solid #2c3e50;
  outline-offset: 2px;
}
</style>

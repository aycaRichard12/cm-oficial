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
            {{ decimas(props.row.precio) }}
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
            <div class="premium-card">
              <!-- Header Premium con Gradiente -->
              <div class="premium-header">
                <div class="row items-center full-width">
                  <div class="header-icon-wrapper">
                    <q-icon name="qr_code_scanner" size="22px" color="white" />
                  </div>
                  <div class="header-content">
                    <h3 class="header-title">Desglose de Identificadores Únicos</h3>
                    <p class="header-subtitle">Gestión avanzada de códigos serializados</p>
                  </div>
                  <q-space />
                  <div class="header-stats">
                    <div class="stat-badge">
                      <q-icon name="inventory_2" size="16px" class="q-mr-xs" />
                      <span class="stat-value">{{ props.row.productos_detallados.length }}</span>
                      <span class="stat-label">Registros</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Barra de Herramientas Superior -->
              <div class="toolbar-section">
                <div class="row items-center q-px-md q-py-sm">
                  <div class="search-indicator">
                    <q-icon name="info" size="14px" color="primary" class="q-mr-xs" />
                    <span class="text-caption text-grey-7">
                      Doble clic en cualquier código para editarlo
                    </span>
                  </div>
                  <q-space />
                  <div class="keyboard-shortcuts">
                    <q-badge outline color="grey-6" class="q-mr-xs">
                      <q-icon name="keyboard_return" size="12px" class="q-mr-xs" />
                      Enter
                    </q-badge>
                    <q-badge outline color="grey-6">
                      <q-icon name="keyboard_esc" size="12px" class="q-mr-xs" />
                      ESC
                    </q-badge>
                  </div>
                </div>
              </div>

              <!-- Tabla de Datos Premium -->
              <div class="table-wrapper">
                <q-markup-table flat bordered separator="none" class="premium-table">
                  <thead>
                    <tr class="premium-table-header">
                      <th style="width: 70px">
                        <div class="header-cell-content">
                          <q-icon name="tag" size="14px" class="q-mr-xs" />
                          <span>#</span>
                        </div>
                      </th>
                      <th>
                        <div class="header-cell-content">
                          <q-icon name="fingerprint" size="14px" class="q-mr-xs" />
                          <span>Código de Identificación</span>
                        </div>
                      </th>
                      <th style="width: 120px" class="text-center">
                        <div class="header-cell-content justify-center">
                          <q-icon name="settings" size="14px" class="q-mr-xs" />
                          <span>Acciones</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(sub, index) in props.row.productos_detallados"
                      :key="sub.id"
                      class="premium-table-row"
                      :class="{ 'row-editing': editandoId === sub.id }"
                    >
                      <!-- Índice con Diseño Premium -->
                      <td class="index-cell">
                        <div class="index-badge" :class="{ 'index-badge-assigned': sub.codigo }">
                          <span class="index-number">{{ String(index + 1).padStart(2, '0') }}</span>
                          <q-icon
                            v-if="sub.codigo"
                            name="check_circle"
                            size="12px"
                            class="index-icon"
                          />
                        </div>
                      </td>

                      <!-- Código Editable Premium -->
                      <td class="code-cell">
                        <!-- Modo Visualización -->
                        <div
                          v-if="editandoId !== sub.id"
                          class="code-viewer"
                          @dblclick="habilitarEdicion(sub)"
                        >
                          <div class="code-content">
                            <q-icon
                              :name="sub.codigo ? 'verified' : 'pending_actions'"
                              :color="sub.codigo ? 'positive' : 'warning'"
                              size="18px"
                              class="code-status-icon"
                            />
                            <div class="code-text-wrapper">
                              <span class="code-text" :class="{ 'code-text-empty': !sub.codigo }">
                                {{ sub.codigo || 'Sin asignar' }}
                              </span>
                              <span v-if="!sub.codigo" class="code-placeholder">
                                Haga doble clic para asignar
                              </span>
                            </div>
                          </div>
                          <div class="code-hover-indicator">
                            <q-icon name="edit_note" size="16px" color="primary" />
                            <span class="hover-text">Editar</span>
                          </div>
                        </div>

                        <!-- Modo Edición Premium -->
                        <div v-else class="code-editor">
                          <q-input
                            v-model="sub.codigo"
                            dense
                            borderless
                            autofocus
                            bg-color="white"
                            class="premium-input"
                            @keyup.enter="guardarEdicion(sub)"
                            @keyup.esc="cancelarEdicion(sub)"
                            @blur="guardarEdicion(sub)"
                            placeholder="Ingrese el código único..."
                          >
                            <template v-slot:prepend>
                              <q-icon name="edit" color="primary" size="18px" />
                            </template>
                            <template v-slot:append>
                              <div class="editor-actions">
                                <q-btn
                                  flat
                                  round
                                  dense
                                  size="10px"
                                  icon="check"
                                  color="positive"
                                  @click.stop="guardarEdicion(sub)"
                                  class="editor-action-btn"
                                >
                                  <q-tooltip>Guardar (Enter)</q-tooltip>
                                </q-btn>
                                <q-btn
                                  flat
                                  round
                                  dense
                                  size="10px"
                                  icon="close"
                                  color="negative"
                                  @click.stop="cancelarEdicion(sub)"
                                  class="editor-action-btn"
                                >
                                  <q-tooltip>Cancelar (Esc)</q-tooltip>
                                </q-btn>
                              </div>
                            </template>
                          </q-input>
                        </div>
                      </td>

                      <!-- Acciones Premium -->
                      <td class="actions-cell">
                        <div class="actions-wrapper">
                          <q-btn
                            v-if="compra.autorizacion == 2"
                            flat
                            round
                            dense
                            icon="delete_outline"
                            color="grey-7"
                            size="12px"
                            class="action-btn"
                            @click="eliminarSubCodigo(props.row, sub)"
                          >
                            <q-tooltip class="premium-tooltip">
                              <div class="tooltip-content">
                                <q-icon name="delete" size="14px" class="q-mr-xs" />
                                Eliminar código
                              </div>
                            </q-tooltip>
                          </q-btn>
                          <div v-else class="action-placeholder"></div>
                        </div>
                      </td>
                    </tr>

                    <!-- Estado Vacío Premium -->
                    <tr v-if="props.row.productos_detallados.length === 0">
                      <td colspan="3" class="empty-state-cell">
                        <div class="empty-state-premium">
                          <div class="empty-icon-wrapper">
                            <q-icon name="qr_code" size="48px" color="grey-5" />
                          </div>
                          <h4 class="empty-title">Sin identificadores registrados</h4>
                          <p class="empty-description">
                            No hay códigos únicos asociados a este producto
                          </p>
                          <q-badge outline color="primary" class="empty-badge">
                            <q-icon name="info" size="12px" class="q-mr-xs" />
                            Doble clic para agregar
                          </q-badge>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
              </div>

              <!-- Footer Premium -->
              <div class="premium-footer">
                <div class="footer-content">
                  <div class="footer-info">
                    <q-icon name="schedule" size="14px" color="grey-6" class="q-mr-xs" />
                    <span class="text-caption text-grey-6">
                      Última actualización: {{ new Date().toLocaleString() }}
                    </span>
                  </div>
                  <div class="footer-stats">
                    <div class="stat-item">
                      <q-icon name="check_circle" size="14px" color="positive" class="q-mr-xs" />
                      <span class="text-caption">
                        {{
                          props.row.productos_detallados.filter((s) => s.codigo).length
                        }}
                        asignados
                      </span>
                    </div>
                    <div class="stat-item">
                      <q-icon name="pending" size="14px" color="warning" class="q-mr-xs" />
                      <span class="text-caption">
                        {{
                          props.row.productos_detallados.filter((s) => !s.codigo).length
                        }}
                        pendientes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
  precio: null,
  cantidad: null,
  descripcion: '',
  stockActual: 0,
  unidad: '',
  productoUnico: false,
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

// Dentro de tu setup o data
const editandoId = ref(null) // ID del sub-código en edición
const copiaRespaldo = ref('') // Para restaurar si presiona ESC

const habilitarEdicion = (sub) => {
  editandoId.value = sub.id
  copiaRespaldo.value = sub.codigo // Guardamos el valor original
}

const guardarEdicion = (sub) => {
  if (editandoId.value === sub.id) {
    editandoId.value = null
    actualizarCodigoIndividual(sub) // Tu función existente
  }
}

const cancelarEdicion = (sub) => {
  sub.codigo = copiaRespaldo.value // Restauramos el valor
  editandoId.value = null
}

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
</style>

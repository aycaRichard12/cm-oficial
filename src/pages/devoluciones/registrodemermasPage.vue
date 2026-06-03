<template>
  <q-page>
    <div class="row items-center justify-between q-mb-md q-ml-sm">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-primary text-weight-bold flex items-center">
          <q-icon name="recycling" size="md" class="q-mr-sm" />
          Registrar Merma
        </div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">
          Administración y registro de productos perdidos o dañados
        </div>
      </div>
    </div>
    <!-- Formulario Principal -->
    <div>
      <q-card-section>
        <!-- Filtros -->
        <div class="row">
          <q-btn
            id="btnnuevamerma"
            color="primary"
            :label="collapseVisible ? 'Cancelar Registro' : 'Nuevo'"
            @click="toggleCollapse"
          />
        </div>
        <div class="row q-col-gutter-x-md q-mb-md">
          <div class="col-12 col-md-3" id="filtroalmacenmerma">
            <label for="almacen">Seleccione un Almacén</label>
            <q-select
              v-model="selectedWarehouse"
              :options="almacenOptions"
              id="almacen"
              dense
              outlined
              emit-value
              map-options
            />
          </div>
          <div class="col-6 col-md-4 flex justify-start">
            <q-btn
              id="btnpdfmerma"
              color="info"
              @click="generatePDF"
              :disable="!tableData.length"
              class="btn-res q-mt-lg"
            >
              <q-icon name="picture_as_pdf" class="icono" />
              <span class="texto">Vista Previa PDF</span>
            </q-btn>
          </div>
          <div class="col-6 col-md-5 flex justify-end">
            <div id="buscarfiltromerma">
              <label for="buscar">Buscar...</label>
              <q-input v-model="filter" dense debounce="300" placeholder="Buscar" class="q-mr-sm">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </div>
        </div>

        <!-- Tabla de Mermas -->
        <q-table
          id="tablamermas"
          title="Registro de Mermas"
          :rows="filteredTableData"
          :columns="columns"
          row-key="id"
          :filter="filter"
          :loading="loading"
          dense
        >
          <template v-slot:top-right> </template>
          <template v-slot:body-cell-autorizacion="props">
            <q-td :props="props">
              <q-badge
                color="green"
                v-if="Number(props.row.autorizacion) === 1"
                label="Autorizado"
                outline
              />
              <q-badge color="red" v-else label="No Autorizado" outline />
            </q-td>
          </template>
          <template v-slot:body-cell-detalle="props">
            <q-td :props="props">
              <q-btn
                id="btnverdetallemerma"
                dense
                color="primary"
                icon="shopping_cart"
                flat
                size="10px"
                @click="showDetails(props.row.id, props.row.idalmacen, props.row.autorizacion)"
              />
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                id="btneditarmerma"
                v-if="Number(props.row.autorizacion) === 2 && editar"
                dense
                color="primary"
                icon="edit"
                class="q-mr-xs"
                flat=""
                @click="editItem(props.row.id)"
              />
              <q-btn
                id="btneliminarmerma"
                v-if="Number(props.row.autorizacion) === 2 && eliminar"
                dense
                color="negative"
                icon="delete"
                class="q-mr-xs"
                flat
                @click="deleteItem(props.row.id)"
              />

              <q-btn
                id="btncomprobantemerma"
                v-if="Number(props.row.autorizacion) === 1"
                dense
                color="red"
                icon="picture_as_pdf"
                flat
                @click="showComprobante(props.row)"
              />
              <q-btn
                id="btncambiarestadomerma"
                v-if="Number(props.row.autorizacion) === 2 && editar"
                :icon="Number(props.row.autorizacion) === 1 ? 'toggle_on' : 'toggle_off'"
                dense
                flat
                :color="Number(props.row.autorizacion) === 1 ? 'green' : 'grey'"
                @click="togglestatus(props.row)"
              />
            </q-td>
          </template>
        </q-table>
        <q-dialog v-model="collapseVisible" persistent>
          <q-card class="responsive-dialog">
            <q-card-section class="bg-primary text-h6 text-white flex justify-between">
              <div>{{ editMode ? 'Editar Registro' : 'Nuevo Registro' }}</div>
              <q-btn icon="close" @click="collapseVisible = false" flat dense round />
            </q-card-section>
            <q-card-section>
              <q-form @submit="submitForm" class="row q-col-gutter-x-md">
                <input type="hidden" name="id" v-model="formData.id" />
                <input
                  type="hidden"
                  name="ver"
                  :value="editMode ? 'editarmerma' : 'registrarmerma'"
                />
                <div class="col-12 col-md-4" id="fechaformmerma">
                  <label for="fecha">Fecha</label>
                  <q-input
                    v-model="formData.fecha"
                    id="fecha"
                    name="fecha"
                    type="date"
                    outlined
                    dense
                  />
                </div>

                <div class="col-12 col-md-4" id="almacenformmerma">
                  <label for="almacen">Almacén</label>

                  <q-select
                    v-model="formData.almacen"
                    :options="almacenOptions"
                    dense
                    outlined
                    id="almacen"
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-12 col-md-4" id="descripcionformmerma">
                  <label for="descripcion">Descripción</label>
                  <q-input v-model="formData.descripcion" dense outlined id="descripcion" />
                </div>
                <div
                  class="col-12 col-md-6 animate__animated animate__zoomIn"
                  v-if="listaCajaBancos && listaCajaBancos.length > 0"
                >
                  <label
                    for="cajaBanco"
                    class="text-weight-bold text-grey-9 q-mb-sm block"
                    style="font-size: 12px; text-transform: uppercase"
                    >Seleccione Caja o Banco <span class="text-negative">*</span></label
                  >
                  <q-select
                    v-model="formData.idcaja_banco"
                    :options="listaCajaBancos"
                    id="cajaBanco"
                    dense
                    outlined
                    emit-value
                    map-options
                    class="premium-input"
                    :rules="[(val) => !!val || 'Campo requerido']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="account_balance" color="positive" />
                    </template>

                    <template v-slot:selected-item="scope">
                      <div v-if="scope.opt" class="q-py-xs">
                        <span class="text-weight-bold text-primary">{{ scope.opt.codigo }}</span>
                        <span class="q-ml-xs">- {{ scope.opt.nombre }}</span>
                      </div>
                    </template>

                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section>
                          <q-item-label>
                            <span class="text-weight-bolder text-grey-9">{{
                              scope.opt.codigo
                            }}</span>
                          </q-item-label>
                          <q-item-label caption>
                            {{ scope.opt.nombre }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <div class="col-12 q-mt-md">
                  <q-btn
                    id="btnguardarformmerma"
                    type="submit"
                    color="primary"
                    :label="editMode ? 'Actualizar' : 'Guardar'"
                  />
                  <q-btn
                    type="reset"
                    color="negative"
                    label="Cancelar"
                    class="q-ml-sm"
                    @click="resetForm"
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>

        <!-- Formulario Colapsable -->
      </q-card-section>
    </div>

    <!-- Formulario de Detalle -->

    <q-dialog v-model="showMainForm">
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-h6 text-white flex justify-between">
          <div>Detalle Mermas</div>
          <q-btn dense round flat icon="close" @click="showMainForm = false" />
        </q-card-section>
        <q-card-section v-if="Number(currentDetailStatus) === 2 && eliminar">
          <q-btn color="negative" icon="delete_sweep" label="Eliminar" @click="backToMainForm" />
        </q-card-section>
        <q-card-section>
          <q-form @submit="submitDetailForm" v-if="Number(currentDetailStatus) === 2 && escritura">
            <div class="row q-col-gutter-x-md">
              <div class="col-12 col-md-8" id="productodetallemerma">
                <div class="row items-center">
                  <div class="col-auto">
                    <label for="producto" class="q-mr-md">Producto</label>
                  </div>
                  <div class="col-auto">
                    <div v-if="esProductoUnico" class="unique-product-section">
                      <q-checkbox
                        v-model="registrarComoProductoUnico"
                        label="Producto Único"
                        color="primary"
                        class="custom-checkbox text-weight-medium"
                      >
                        <template v-slot:label>
                          <span class="text-grey-800">Producto Único</span>
                        </template>
                      </q-checkbox>
                    </div>
                  </div>
                  <div class="col-12" id="productodetallemerma">
                    <label for="producto">Producto</label>

                    <q-select
                      v-model="detailForm.idproductoalmacen"
                      :options="availableProducts"
                      dense
                      outlined
                      id="producto"
                      option-value="idproductoalmacen"
                      option-label="label"
                      emit-value
                      map-options
                      use-input
                      clearable
                      @update:model-value="selectProduct"
                      @filter="filtrarProductos"
                    >
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            No hay productos disponibles
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                </div>
              </div>

              <div class="col-6 col-md-3" id="stockdetallemerma">
                <label for="stock">Stock</label>
                <q-input
                  v-model.number="detailForm.stock"
                  type="number"
                  id="stock"
                  dense
                  outlined
                  readonly
                />
              </div>
              <div class="col-6 col-md-3" id="cantidaddetallemerma">
                <label for="cantidad">Cantidad</label>
                <q-input
                  v-model.number="detailForm.cantidad"
                  id="cantidad"
                  type="number"
                  min="0"
                  dense
                  outlined
                  required
                  @update:model-value="validateQuantity"
                  :rules="[(val) => val <= detailForm.stock || 'Cantidad excede stock']"
                />
              </div>

              <UniqueProductSelector
                :product-id="detailForm.idproductoalmacen"
                :is-unique="esProductoUnico && registrarComoProductoUnico"
                :cantidad-requerida="detailForm.cantidad"
                @update:selection="(codigos) => guardarCodigosEnVenta(codigos)"
                class="q-mt-md"
              />
              <div class="col-12" id="btntogglelotedetallemerma">
                <q-btn
                  :icon="lote ? 'toggle_on' : 'toggle_off'"
                  dense
                  flat
                  label="Lote"
                  :color="lote ? 'green' : 'grey'"
                  @click="lote = !lote"
                  title="CAMBIAR TIPO REPORTE"
                />
              </div>
              <div class="col-12 col-md-3" v-if="lote" id="proveedordetallemerma">
                <label for="provedor">Filtrar por proveedor:</label>
                <q-select
                  v-model="detailForm.proveedor"
                  :options="filteredProveedores"
                  id="provedor"
                  dense
                  outlined
                  emit-value
                  map-options
                  use-input
                  fill-input
                  hide-selected
                  input-debounce="0"
                  clearable
                  @clear="limpiarComprasFiltradas"
                  @filter="filterFn"
                  @update:model-value="filtrarComprasxProveedor"
                />
              </div>
              <div class="col-12 col-md-9" v-if="lote" id="compradetallemerma">
                <label for="compras">Seleccionar Lote de Compra/Producción:</label>
                <q-select
                  v-model="detailForm.compra"
                  :options="filterCompras"
                  id="compras"
                  dense
                  outlined
                  emit-value
                  map-options
                  use-input
                  fill-input
                  hide-selected
                  input-debounce="0"
                  clearable
                  @filter="filterlotes"
                />
              </div>

              <div class="col-md-2">
                <q-btn
                  id="btnanadirdetallemerma"
                  type="submit"
                  color="primary"
                  class="btn-res q-mt-lg"
                >
                  <q-icon name="save" class="icono" />
                  <span class="texto">{{ detailEditMode ? 'Actualizar' : 'Cargar' }}</span>
                </q-btn>
              </div>
            </div>
          </q-form>
          <q-table
            id="tabladetallemermaproductos"
            :rows="detailData"
            :columns="detailColumns"
            row-key="id"
            class="q-mt-md"
            :loading="detailLoading"
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

                <q-td key="numero" :props="props">
                  {{ props.row.numero }}
                </q-td>
                <q-td key="codigolote" :props="props">
                  <q-chip outline color="primary" label-slot dense>
                    <q-icon name="qr_code" size="xs" class="q-mr-xs" />
                    {{ props.row.codigolote }}
                  </q-chip>
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

                <q-td key="cantidad" :props="props" class="text-right">
                  <q-badge color="grey-8">{{ props.row.cantidad }}</q-badge>
                </q-td>

                <q-td key="actions" :props="props" align="center">
                  <q-btn
                    id="btneditardetallemerma"
                    v-if="Number(currentDetailStatus) === 2 && editar"
                    dense
                    color="primary"
                    icon="edit"
                    class="q-mr-xs"
                    @click="editDetailItem(props.row.id)"
                  />

                  <q-btn
                    id="btneliminardetallemerma"
                    v-if="Number(currentDetailStatus) === 2 && eliminar"
                    dense
                    color="negative"
                    icon="delete"
                    @click="deleteDetailItem(props.row)"
                  />
                </q-td>
              </q-tr>

              <q-tr v-show="props.expand" :props="props" class="expanded-row-premium">
                <q-td colspan="100%" class="q-pa-lg">
                  <TableCodigosUnicosMerma
                    v-model="props.row.productos_detallados"
                    :parent-row="props.row"
                    :can-delete="Number(currentDetailStatus) === 2 && eliminar"
                    :can-edit="false"
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
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Modal de PDF -->
    <q-dialog v-model="mostrarModal" full-width full-height>
      <q-card class="q-pa-md" style="height: 100%; max-width: 100%">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Vista previa de PDF</div>
          <q-space />
          <q-btn flat round icon="close" @click="mostrarModal = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-none" style="height: calc(100% - 60px)">
          <iframe
            v-if="pdfData"
            :src="pdfData"
            style="width: 100%; height: 100%; border: none"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api, apiCt } from 'boot/axios'
// import { useMenuStore } from 'src/layouts/permitidos'
import {
  cambiarFormatoFecha,
  obtenerFechaActualDato,
  obtenerPermisosPagina,
} from 'src/composables/FuncionesG'
import { idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
import { useAlmacenStore } from 'src/stores/listaResponsableAlmacen'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import { PDFreporteMermas } from 'src/utils/pdfReportGenerator'
import { PDFComprovanteMerma } from 'src/utils/pdfReportGenerator'
import { useProductoConfig } from 'src/composables/productoUnico/useProductoConfig'
import UniqueProductSelector from 'src/components/venta/UniqueProductSelector.vue'
import TableCodigosUnicosMerma from './TableCodigosUnicosMerma.vue'

const registrarComoProductoUnico = ref(false)
const esProductoUnico = ref(false)
//const idproductoalmacenCO = ref('')
const CodigosUnicosSeleccionados = ref([])

const idempresa = idempresa_md5()

const { config } = useProductoConfig(idempresa)
watch(
  () => config.value.idempresa,
  (nuevoValor) => {
    if (nuevoValor) {
      esProductoUnico.value = Boolean(config.value.productounico)
    }
  },
  { deep: true },
)
const guardarCodigosEnVenta = (codigos) => {
  CodigosUnicosSeleccionados.value = codigos
  detailForm.value.cantidad = codigos.length
}
const lote = ref(true)
const listaCajaBancos = ref([])
const [lectura, escritura, editar, eliminar] = obtenerPermisosPagina()
console.log(lectura)
const pdfData = ref(null)
const mostrarModal = ref(false)
const warehouses = useAlmacenStore()
const productosDisponibles = ref([])
const idusuario = idusuario_md5()
const $q = useQuasar()

// Estado del componente78
const showMainForm = ref(false)
const collapseVisible = ref(false)
const editMode = ref(false)
const detailEditMode = ref(false)
const loading = ref(false)
const detailLoading = ref(false)
const idmd5 = ref('')

const filteredProveedores = ref([])
const Proveedores = ref([])
const ComprasOriginales = ref([])
const Compras = ref([])
const filterCompras = ref([])
// Datos del usuario
const userData = ref({})

// Datos de formularios
const formData = ref({
  id: '',
  fecha: obtenerFechaActualDato(),
  almacen: '',
  descripcion: '',
})

const detailForm = ref({
  id: '',
  idmerma: '',
  idproductoalmacen: '',
  cantidad: 0,
  stock: 0,
  idalmacen: 0,
  proveedor: null,
  compra: null,
})

// Datos de tablas
const tableData = ref([])
const detailData = ref([])
const comprobanteDetails = ref([])
const currentDetailStatus = ref(0)
const currentComprobante = ref({})

// Filtros y selecciones
const filter = ref('')
const selectedWarehouse = ref('')
const availableProducts = ref([])

// Configuración de tablas
const columns = [
  {
    name: 'numero',
    label: 'N°',
    field: (row) => tableData.value.indexOf(row) + 1,
    align: 'right',
  },
  {
    name: 'fecha',
    label: 'Fecha',
    field: (row) => cambiarFormatoFecha(row.fecha),
    align: 'center',
  },
  { name: 'almacen', label: 'Almacén', field: 'almacen', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  {
    name: 'autorizacion',
    label: 'Estado',
    field: 'autorizacion',
    align: 'left',
  },
  {
    name: 'detalle',
    label: 'Detalle',
    field: 'detalle',
    align: 'center',
  },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

const detailColumns = [
  { name: 'exp', label: '', align: 'left' },
  {
    name: 'numero',
    label: 'N°',
    field: (row) => detailData.value.indexOf(row) + 1,
    align: 'right',
  },
  { name: 'codigolote', label: 'Código Lote', field: 'codigolote', align: 'left' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'right' },
  { name: 'actions', label: 'Acciones', align: 'center' },
]

// Computed properties
const filteredTableData = computed(() => {
  if (!selectedWarehouse.value) return tableData.value
  console.log(selectedWarehouse.value)
  const almacen = selectedWarehouse.value
  console.log(almacen)
  if (almacen) {
    if (almacen.value == 0) {
      console.log(almacen)
      return tableData.value.filter((camp) => camp.idalmacen == 0)
    } else {
      return tableData.value.filter((camp) => camp.idalmacen == almacen)
    }
  } else {
    return []
  }
})

// Métodos
const loadUserData = async () => {
  try {
    const response = await api.get('userData')
    userData.value = response.data
  } catch (error) {
    console.error('Error al cargar datos del usuario:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos del usuario',
    })
  }
}

const almacenOptions = computed(() => {
  const lista = warehouses.almacenesResponsable || []

  // Mapeamos los almacenes a su formato de opción { label, value }
  const opcionesMapeadas = lista.map((almacen) => ({
    label: almacen.almacen,
    value: Number(almacen.idalmacen),
  }))

  // Si hay más de uno, añadimos la opción "Todos" al principio
  if (opcionesMapeadas.length > 1) {
    return [{ label: 'Todos los almacenes', value: 0 }, ...opcionesMapeadas]
  }

  return opcionesMapeadas
})

watch(
  almacenOptions,
  (nuevasOpciones) => {
    console.log(nuevasOpciones)
    if (nuevasOpciones.length > 0 && !selectedWarehouse.value) {
      selectedWarehouse.value = nuevasOpciones[0].value
    }
  },
  { immediate: true },
)
const loadTableData = async () => {
  loading.value = true
  try {
    const response = await api.get(`listamerma/${idempresa}/${idusuario}`)
    tableData.value = response.data
    console.log(response.data)
  } catch (error) {
    console.error('Error al cargar datos de mermas:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos de mermas',
    })
  } finally {
    loading.value = false
  }
}

const loadDetailData = async (idMerma) => {
  detailLoading.value = true
  try {
    const response = await api.get(`listaDetallemerma/${idMerma}`)
    console.log(response.data)
    detailData.value = response.data
  } catch (error) {
    console.error('Error al cargar detalles de merma:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar detalles de merma',
    })
  } finally {
    detailLoading.value = false
  }
}

const loadAvailableProducts = async (idMerma, idAlmacen) => {
  console.log(idMerma, idAlmacen)
  try {
    const response = await api.get(`ListaProductosmerma/${idMerma}/${idAlmacen}`)
    availableProducts.value = response.data.map((product, index) => ({
      ...product,
      idproductoalmacen: Number(product.idproductoalmacen),
      label: `${product.codigo} - ${product.descripcion}`,
      stock: product.stock,
      numero: index + 1,
    }))

    productosDisponibles.value = [...availableProducts.value]
  } catch (error) {
    console.error('Error al cargar productos disponibles:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar productos disponibles',
    })
  }
}

async function cargarProveedores() {
  try {
    const response = await api.get(`listaProveedor/${idempresa}`)
    console.log(response)
    Proveedores.value = response.data.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
  } catch (error) {
    console.error('Error al cargar proveedores:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar los proveedores' })
  }
}
async function cargarComprasLotes() {
  const d = detailForm.value
  console.log(d)
  try {
    const response = await api.get(`listaLotesxProductoProveedor/${idempresa}`)
    const res = response.data
    const respuesta = res.data.filter(
      (item) => Number(item.idproducto) === Number(d.idproductoalmacen),
    )

    const filtrado = respuesta.map((item) => ({
      label:
        'Nro Fac: ' +
        item.nfactura +
        ' Com: ' +
        item.lote +
        ' Cod: ' +
        item.codigo +
        ' Prov.: ' +
        item.proveedor,
      value: item.idingreso,
      idproveedor: item.idproveedor,
      idproducto: item.idproducto,
    }))
    ComprasOriginales.value = filtrado
    Compras.value = filtrado
  } catch (error) {
    console.error('Error al cargar compras:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar las compras' })
  }
}
const filtrarProductos = (val, update) => {
  update(() => {
    if (val === '') {
      availableProducts.value = productosDisponibles.value
    } else {
      const needle = val.toLowerCase()
      availableProducts.value = availableProducts.value.filter(
        (p) => p.label.toLowerCase().indexOf(needle) > -1,
      )
    }
  })
}
const toggleCollapse = () => {
  collapseVisible.value = !collapseVisible.value

  resetForm()
}

const resetForm = () => {
  formData.value = {
    id: '',
    fecha: obtenerFechaActualDato(),
    almacen: '',
    descripcion: '',
  }
  editMode.value = false
}

const resetDetailForm = () => {
  detailForm.value = {
    id: '',
    idmerma: '',
    idproductoalmacen: '',
    cantidad: 0,
    stock: 0,
    idalmacen: 0,
  }
  detailEditMode.value = false
}

const submitForm = async () => {
  try {
    //const endpoint = editMode.value ? 'actualizarmerma' : 'registrarmerma'
    formData.value.nombrealmacen =
      almacenOptions.value.find((a) => a.value === formData.value.almacen)?.label || ''
    formData.value.idempresa = idempresa
    const formulario = objectToFormData(formData.value)
    if (editMode.value) {
      formulario.append('ver', 'actualizarmerma')
    } else {
      formulario.append('ver', 'registrarmerma')
      formulario.append('idusuario', idusuario)
    }

    const response = await api.post('', formulario)
    console.log(response.data)
    const data = response.data[0]
    if (data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: data.mensaje,
      })
    } else {
      $q.notify({
        type: 'negative',
        message: data.mensaje || 'Error desconocido',
      })
    }

    selectedWarehouse.value = response.data.almacenorigen
    loadTableData()
    resetForm()
    collapseVisible.value = false
  } catch (error) {
    console.error('Error al guardar merma:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.mensaje || 'Error al guardar merma',
    })
  }
}

const submitDetailForm = async () => {
  console.log(CodigosUnicosSeleccionados.value)
  try {
    const jsonData = {
      id: detailForm.value.id,
      idmerma: detailForm.value.idmerma,
      idproductoalmacen: detailForm.value.idproductoalmacen,
      cantidad: detailForm.value.cantidad,
      compra: detailForm.value.compra,
      CodigosUnicosSeleccionados: registrarComoProductoUnico.value
        ? CodigosUnicosSeleccionados.value
        : [],
    }
    if (detailEditMode.value) {
      jsonData['ver'] = 'editarDetallemerma'
    } else {
      jsonData['ver'] = 'registrarDetallemerma'
    }

    console.log(jsonData)
    const response = await api.post('', jsonData)
    console.log(response.data)

    $q.notify({
      type: 'positive',
      message: response.data.mensaje,
    })
    console.log(detailForm.value.idmerma, detailForm.value.idalmacen)

    loadAvailableProducts(detailForm.value.idmerma, detailForm.value.idalmacen)
    loadDetailData(detailForm.value.idmerma)
    resetDetailForm()
  } catch (error) {
    console.error('Error al guardar detalle:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.mensaje || 'Error al guardar detalle',
    })
  }
}

const editItem = async (id) => {
  try {
    const response = await api.get(`verificarExistenciamerma/${id}`)
    console.log(response.data)

    if (response.data.estado === 'exito') {
      formData.value = {
        id: response.data.datos.id,
        fecha: response.data.datos.fecha,
        almacen: Number(response.data.datos.idalmacen),
        descripcion: response.data.datos.descripcion,
      }
      console.log(formData.value)
      editMode.value = true
      if (!collapseVisible.value) {
        collapseVisible.value = true
      }
    }
  } catch (error) {
    console.error('Error al cargar merma para editar:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar merma para editar',
    })
  }
}

const deleteItem = (id) => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro que desea eliminar este registro? No podrá recuperarlo.',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.get(`eliminarmerma/${id}`)

      $q.notify({
        type: 'positive',
        message: response.data.mensaje,
      })

      loadTableData()
    } catch (error) {
      console.error('Error al eliminar merma:', error)
      $q.notify({
        type: 'negative',
        message: error.response?.data?.mensaje || 'Error al eliminar merma',
      })
    }
  })
}

// const changeStatus = (id, estado) => {
//   $q.dialog({
//     title: 'Confirmar',
//     message: '¿Está seguro que desea cambiar el estado? No podrá revertir esta acción.',
//     cancel: true,
//     persistent: true,
//   }).onOk(async () => {
//     try {
//       const response = await api.get(`actualizarEstadomerma/${id}/${estado}`)

//       $q.notify({
//         type: 'positive',
//         message: response.data.mensaje,
//       })

//       loadTableData()
//     } catch (error) {
//       console.error('Error al cambiar estado:', error)
//       $q.notify({
//         type: 'negative',
//         message: error.response?.data?.mensaje || 'Error al cambiar estado',
//       })
//     }
//   })
// }

const limpiarComprasFiltradas = () => {
  Compras.value = ComprasOriginales.value
}
const filtrarComprasxProveedor = () => {
  const d = detailForm.value

  Compras.value = ComprasOriginales.value.filter(
    (v) => Number(v.idproveedor) === Number(d.proveedor),
  )
  d.compra = null
}
const filterFn = (val, update) => {
  update(() => {
    if (val === '') {
      filteredProveedores.value = Proveedores.value
    } else {
      const needle = val.toLowerCase()
      const paraFiltrar = filteredProveedores.value
      filteredProveedores.value = paraFiltrar.filter((v) => v.label.toLowerCase().includes(needle))
    }
  })
}
const filterlotes = (val, update) => {
  update(() => {
    if (val === '') {
      filterCompras.value = Compras.value
      console.log(filterCompras.value)
    } else {
      const fc = filterCompras.value
      const needle = val.toLowerCase()

      filterCompras.value = fc.filter((v) => v.label.toLowerCase().includes(needle))
    }
  })
}
const showDetails = async (id, idAlmacen, estado) => {
  currentDetailStatus.value = estado
  console.log(id, idAlmacen, estado)
  detailForm.value.idmerma = id
  detailForm.value.idalmacen = idAlmacen

  if (estado === 1) {
    // Deshabilitar botones si está autorizado
  }

  loadDetailData(id)
  loadAvailableProducts(id, idAlmacen)
  await cargarProveedores()

  showMainForm.value = true
}

const backToMainForm = () => {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Está seguro? Esta acción eliminará todos los productos añadidos en la merma.',
    cancel: true,
    persistent: true,
  })
    .onOk(async () => {
      try {
        const response = await api.get(`cancelarMerma/${detailForm.value.idmerma}`)

        if (response.data.estado !== 101) {
          $q.notify({
            type: 'info',
            message: response.data.mensaje,
          })
        }

        showMainForm.value = false
        resetDetailForm()
        detailData.value = []
      } catch (error) {
        console.error('Error al cancelar merma:', error)
        $q.notify({
          type: 'negative',
          message: 'Error al cancelar merma',
        })
      }
    })
    .onCancel(() => {
      // El usuario canceló la acción
    })
}

const selectProduct = (id) => {
  const product = availableProducts.value.find((p) => p.idproductoalmacen == id)
  if (product) {
    detailForm.value.stock = product.stock
  }
  cargarComprasLotes()
}

const validateQuantity = () => {
  if (detailForm.value.cantidad > detailForm.value.stock) {
    $q.notify({
      type: 'warning',
      message: 'La cantidad ingresada sobrepasa al stock actual',
    })
    detailForm.value.cantidad = 0
  }
}

const editDetailItem = async (id) => {
  try {
    const response = await api.get(`verificarExistenciaDetalleMerma/${id}`)

    if (response.data.estado === 'exito') {
      detailForm.value = {
        id: response.data.datos.id,
        idmerma: detailForm.value.idmerma,
        idproductoalmacen: {
          idproductoalmacen: response.data.datos.idproductoalmacen,
          label: `${response.data.datos.codigo} - ${response.data.datos.descripcion}`,
        },
        cantidad: response.data.datos.cantidad,
        stock: response.data.datos.stock,
      }

      // Buscar el producto seleccionado para mostrarlo en el select

      //  idproductoalmacen: Number(product.idproductoalmacen),
      // label: `${product.codigo} - ${product.descripcion}`,
      // stock: product.stock,
      const product = availableProducts.value.find(
        (p) => p.idproductoalmacen == response.data.datos.idproductoalmacen,
      )

      if (product) {
        detailForm.value.productLabel = product.label
      }

      detailEditMode.value = true
    }
  } catch (error) {
    console.error('Error al cargar detalle para editar:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar detalle para editar',
    })
  }
}

const deleteDetailItem = async (row) => {
  try {
    const response = await api.get(`eliminarDetallemerma/${row.id}`)

    $q.notify({
      type: 'positive',
      message: response.data.mensaje,
    })

    loadAvailableProducts(detailForm.value.idmerma, detailForm.value.idalmacen)
    loadDetailData(detailForm.value.idmerma)
  } catch (error) {
    console.error('Error al eliminar detalle:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.mensaje || 'Error al eliminar detalle',
    })
  }
}

const generatePDF = () => {
  console.log(filteredTableData.value)
  // const doc = PDFreporteMermas(filteredTableData)
  // console.log(doc)

  const almacen = almacenOptions.value.find((obj) => obj.value == selectedWarehouse.value)
  const doc = PDFreporteMermas(filteredTableData, almacen)
  pdfData.value = doc.output('dataurlstring')
  mostrarModal.value = true
}

const showComprobante = async (item) => {
  currentComprobante.value = item
  console.log(item)
  try {
    const response = await api.get(`listaDetallemerma/${item.id}`)
    comprobanteDetails.value = response.data
    console.log(response.data)
    const doc = PDFComprovanteMerma(response.data, item)
    pdfData.value = doc.output('dataurlstring')
    mostrarModal.value = true
  } catch (error) {
    console.error('Error al cargar comprobante:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar comprobante',
    })
  }
}

const togglestatus = (row) => {
  console.log(row)

  $q.dialog({
    title: 'Confirmar',
    message: '¿Esta Seguro? No podra revertir esta acción',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const point = `actualizarEstadomerma/${row.id}/1/${idusuario}`
      const response = await api.get(point) // Cambia a tu ruta real
      console.log(response)
      if (response.data.estado === 'exito ') {
        await loadTableData()

        $q.notify({
          type: 'positive',
          message: response.data.mensaje,
        })
      } else {
        $q.notify({
          type: 'negative',
          message: response.data.mensaje || 'Error desconocido',
        })
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      $q.notify({
        type: 'negative',
        message: 'No se pudieron cargar los datos',
      })
    }
  })
}
function handleKeydown(e) {
  if (e.key === 'Escape') {
    collapseVisible.value = false
  }
}
async function listarcajasbanco() {
  try {
    const response = await apiCt.get(`listar_caja_bancos/${idempresa}`)

    listaCajaBancos.value = response.data.map((item) => ({
      label: item.codigo + ' ' + item.tipo_cuenta, // Fallback
      value: item.idcaja_bancos,
      codigo: item.codigo, // Guardamos el código por separado
      nombre: item.tipo_cuenta, // Guardamos el nombre por separado
    }))
    console.log(listaCajaBancos.value)
  } catch (error) {
    console.error('Error al cargar caja bancos:', error)
    $q.notify({ type: 'negative', message: 'No se pudieron cargar caja Bancos' })
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
// Inicialización
onMounted(async () => {
  await loadUserData()
  await loadTableData()
  await listarcajasbanco()
  // Establecer fecha actual por defecto

  const storedMd5 = idusuario_md5()
  if (storedMd5) {
    idmd5.value = storedMd5
    warehouses.listaAlmacenes()
  } else {
    $q.notify({
      type: 'negative',
      message: 'ID MD5 no encontrado. Asegúrate de iniciar sesión correctamente.',
      timeout: 5000,
    })
  }
})
</script>

<style scoped>
/* Estilos personalizados pueden ir aquí */
.resaltar-fila {
  background-color: #ffeb3b;
  transition: background-color 1.5s;
}

.table-topper {
  margin-bottom: 20px;
}
</style>

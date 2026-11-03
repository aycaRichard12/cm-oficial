<template>
  <q-page>
    <div class="row items-center justify-between q-mb-md q-ml-sm titulo">
      <div class="col-12 col-md-auto">
        <div class="text-h5 text-primary text-weight-bold flex items-center">
          <q-icon name="recycling" size="md" class="q-mr-sm" />
          {{ $t('ui.registrar-merma-869f40') }}
        </div>
        <div class="text-subtitle2 text-grey-7 q-mt-xs">
          {{ $t('ui.administracion-y-registro-de-productos-perdidos-o-da-38be12') }}
        </div>
      </div>
    </div>
    <!-- Formulario Principal -->
    <div>
      <q-card-section>
        <!-- Filtros -->
        <div class="row">
          <q-btn
            color="primary"
            class="btn-res"
            @click="toggleCollapse"
            no-caps
            id="btnnuevamerma"
            :title="$t('ui.registrar-merma-869f40')"
          >
            <q-icon name="add" class="icono" />
            <span class="texto">
              <q-icon name="add" />{{ collapseVisible ? $t('ui.cancelar-registro-2dee20') : $t('common.new') }}</span
            >
          </q-btn>
        </div>
        <div class="row q-col-gutter-x-md q-mb-md">
          <div class="col-12 col-md-3" id="filtroalmacenmerma">
            <label for="almacen">{{ $t('ui.seleccione-un-almacen-fc2f9e') }}</label>
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
              color="negative"
              @click="generatePDF"
              :disable="!tableData.length"
              class="btn-res q-mt-lg"
              outline
            >
              <q-icon name="mdi-file-pdf-box" class="icono" />
              <span class="texto">{{ $t('ui.vista-previa-pdf-9db3ed') }}</span>
            </q-btn>
          </div>
          <div class="col-6 col-md-5 flex justify-end">
            <div id="buscarfiltromerma">
              <label for="buscar">{{ $t('common.search') }}</label>
              <q-input v-model="filter" dense debounce="300" :placeholder="$t('ui.buscar-a62405')" class="q-mr-sm">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </div>
        </div>

        <!-- Tabla de Mermas -->
        <div v-if="lectura">
          <q-table
            id="tablamermas"
            :title="$t('ui.registro-de-mermas-5da574')"
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
                  :label="$t('ui.autorizado-b4fb49')"
                  outline
                />
                <q-badge color="red" v-else :label="$t('ui.no-autorizado-988c4e')" outline />
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
        </div>

        <q-dialog v-model="collapseVisible" persistent>
          <q-card class="responsive-dialog">
            <q-card-section class="bg-primary text-h6 text-white flex justify-between">
              <div>{{ editMode ? $t('ui.editar-registro-8a96de') : $t('ui.nuevo-registro-02abe0') }}</div>
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
                  <label for="fecha">{{ $t('cotizacion.table.date') }}</label>
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
                  <label for="almacen">{{ $t('inventario.warehouse') }}</label>

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
                  <label for="descripcion">{{ $t('configuracion.servicios.table.descripcion') }}</label>
                  <q-input v-model="formData.descripcion" dense outlined id="descripcion" />
                </div>
                <div
                  class="col-12 col-md-6 animate__animated animate__zoomIn"
                  v-if="listaCajaBancos && listaCajaBancos.length > 0"
                >
                  <label
                    for="cajaBanco"
                    class="text-weight-bold cm-text q-mb-sm block"
                    style="font-size: 12px; text-transform: uppercase"
                    >{{ $t('ui.seleccione-caja-o-banco-b3521c') }} <span class="text-negative">*</span></label
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
                    :rules="[(val) => !!val || $t('configProducto.estadoProducto.form.required')]"
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
                            <span class="text-weight-bolder cm-text">{{
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
                    :label="editMode ? $t('configuracion.servicios.dialog.update') : $t('common.save')"
                  />
                  <q-btn
                    type="reset"
                    color="negative"
                    :label="$t('common.cancel')"
                    class="q-ml-sm"
                    @click="toggleCollapse"
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
          <div>{{ $t('ui.detalle-mermas-fe4f7c') }}</div>
          <q-btn dense round flat icon="close" @click="showMainForm = false" />
        </q-card-section>
        <q-card-section v-if="Number(currentDetailStatus) === 2 && eliminar">
          <q-btn color="negative" icon="delete_sweep" :label="$t('common.delete')" @click="backToMainForm" />
        </q-card-section>
        <q-card-section>
          <q-form @submit="submitDetailForm" v-if="Number(currentDetailStatus) === 2 && escritura">
            <div class="row q-col-gutter-x-md">
              <div class="col-12 col-md-8" id="productodetallemerma">
                <div class="row items-center">
                  <div class="col-auto">
                    <div v-if="esProductoUnico" class="unique-product-section">
                      <q-checkbox
                        v-model="registrarComoProductoUnico"
                        :label="$t('ui.producto-unico-b16503')"
                        color="primary"
                        class="custom-checkbox text-weight-medium"
                      >
                        <template v-slot:label>
                          <span class="cm-text">{{ $t('ui.producto-unico-b16503') }}</span>
                        </template>
                      </q-checkbox>
                    </div>
                  </div>
                  <div class="col-12" id="productodetallemerma">
                    <label for="producto">{{ $t('inventario.product') }}</label>

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
                            {{ $t('ui.no-hay-productos-disponibles-249511') }}
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>
                </div>
              </div>

              <div class="col-6 col-md-3" id="stockdetallemerma">
                <label for="stock">{{ $t('inventario.stock') }}</label>
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
                <label for="cantidad">{{ $t('ui.cantidad-b5b6f8') }}</label>
                <q-input
                  v-model.number="detailForm.cantidad"
                  id="cantidad"
                  type="number"
                  min="1"
                  dense
                  outlined
                  required
                  @update:model-value="validateQuantity"
                  :rules="[
                    (val) => Number(val) > 0 || $t('ui.la-cantidad-debe-ser-mayor-a-0-eb7edc'),
                    (val) => val <= detailForm.stock || $t('ui.cantidad-excede-stock-cae0f5'),
                  ]"
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
                  :label="$t('ui.lote-7530a3')"
                  :color="lote ? 'green' : 'grey'"
                  @click="lote = !lote"
                  :title="$t('ui.cambiar-tipo-reporte-8a29ad')"
                />
              </div>
              <div class="col-12 col-md-12" v-if="lote" id="compradetallemerma">
                <label for="compras">{{ $t('ui.seleccionar-lote-de-compra-produccion-2eb467') }}</label>
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

              <div class="col-12 col-md-2 flex items-end justify-end">
                <q-btn
                  id="btnanadirdetallemerma"
                  type="submit"
                  color="primary"
                  class="btn-res q-mt-md full-width"
                >
                  <q-icon name="save" class="icono q-mr-xs" />
                  <span class="texto">{{ detailEditMode ? $t('configuracion.servicios.dialog.update') : $t('ui.cargar-e97b1c') }}</span>
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
            :rows-per-page-options="[0]"
          >
            <template v-slot:no-data>
              <div class="full-width row flex-center text-grey-6 q-pa-md">
                <q-icon name="inbox" size="sm" class="q-mr-sm" />
                {{ $t('ui.no-hay-productos-en-el-detalle-3a40b0') }}
              </div>
            </template>
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
                    <q-tooltip>{{ $t('ui.ver-detalles-de-codigos-9e0689') }}</q-tooltip>
                  </q-btn>
                </q-td>

                <q-td key="numero" :props="props">
                  <q-badge color="primary" outline>
                    {{ detailData.indexOf(props.row) + 1 }}
                  </q-badge>
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
          <div class="text-h6">{{ $t('ui.vista-previa-de-pdf-978f4e') }}</div>
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
import { t as i18nT } from 'src/i18n/runtime'
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
  compra: null,
  id_detalle_ingreso: null,
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
    label: i18nT('cotizacion.table.number'),
    field: (row) => tableData.value.indexOf(row) + 1,
    align: 'right',
  },
  {
    name: 'fecha',
    label: i18nT('cotizacion.table.date'),
    field: (row) => cambiarFormatoFecha(row.fecha),
    align: 'center',
  },
  { name: 'almacen', label: i18nT('inventario.warehouse'), field: 'almacen', align: 'left' },
  { name: 'descripcion', label: i18nT('configuracion.servicios.table.descripcion'), field: 'descripcion', align: 'left' },
  {
    name: 'autorizacion',
    label: i18nT('cotizacion.table.status'),
    field: 'autorizacion',
    align: 'left',
  },
  {
    name: 'detalle',
    label: i18nT('ui.detalle-be605b'),
    field: 'detalle',
    align: 'center',
  },
  { name: 'actions', label: i18nT('common.actions'), align: 'center' },
]

const detailColumns = [
  { name: 'exp', label: '', align: 'left' },
  {
    name: 'numero',
    label: i18nT('cotizacion.table.number'),
    field: (row) => detailData.value.indexOf(row) + 1,
    align: 'right',
  },
  { name: 'codigolote', label: i18nT('ui.codigo-lote-04fcf6'), field: 'codigolote', align: 'left' },
  { name: 'codigo', label: i18nT('ui.codigo-c35510'), field: 'codigo', align: 'left' },
  { name: 'descripcion', label: i18nT('configuracion.servicios.table.descripcion'), field: 'descripcion', align: 'left' },
  { name: 'cantidad', label: i18nT('ui.cantidad-b5b6f8'), field: 'cantidad', align: 'right' },
  { name: 'actions', label: i18nT('common.actions'), align: 'center' },
]

// Computed properties
const filteredTableData = computed(() => {
  if (selectedWarehouse.value === null || selectedWarehouse.value === undefined) {
    return tableData.value
  }
  const almacen = selectedWarehouse.value
  if (Number(almacen) === 0) {
    return tableData.value.filter((camp) => Number(camp.idalmacen) === 0)
  }
  return tableData.value.filter((camp) => Number(camp.idalmacen) === Number(almacen))
})
watch(lote, (activo) => {
  if (!activo) {
    detailForm.value.compra = null
  } else if (detailForm.value.idproductoalmacen) {
    // Si se reactiva y hay producto seleccionado, recargar/auto-seleccionar lote PEPS
    cargarLotesPorProducto(detailForm.value.idproductoalmacen)
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
      message: i18nT('ui.error-al-cargar-datos-del-usuario-c008fc'),
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
    return [{ label: i18nT('ui.todos-los-almacenes-949f2c'), value: 0 }, ...opcionesMapeadas]
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
      message: i18nT('ui.error-al-cargar-datos-de-mermas-eb66f9'),
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
      message: i18nT('ui.error-al-cargar-detalles-de-merma-006597'),
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
      message: i18nT('ui.error-al-cargar-productos-disponibles-71531c'),
    })
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
    compra: null,
  }
  // Limpiar lotes cargados para evitar enviar un id_lote de otro producto
  ComprasOriginales.value = []
  Compras.value = []
  filterCompras.value = []
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
    const data = response.data
    if (data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: data.mensaje,
      })
    } else {
      $q.notify({
        type: 'negative',
        message: data.mensaje || i18nT('ui.error-desconocido-9c256e'),
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
      message: error.response?.data?.mensaje || i18nT('ui.error-al-guardar-merma-a73faf'),
    })
  }
}

const submitDetailForm = async () => {
  // No permitir registrar merma con cantidad 0 o invalida
  if (!detailForm.value.cantidad || Number(detailForm.value.cantidad) <= 0) {
    $q.notify({
      type: 'negative',
      message: i18nT('ui.la-cantidad-debe-ser-mayor-a-0-eb7edc'),
    })
    return
  }

  // Si el toggle Lote está activo, se requiere seleccionar un lote
  if (lote.value && !detailForm.value.compra) {
    $q.notify({
      type: 'negative',
      message: i18nT('ui.debe-seleccionar-un-lote-b1d298'),
    })
    return
  }

  try {
    const jsonData = {
      id: detailForm.value.id,
      idmerma: detailForm.value.idmerma,
      idproductoalmacen: detailForm.value.idproductoalmacen,
      cantidad: detailForm.value.cantidad,
      // compra legacy: null para no confundir idcompra con id_lote
      compra: detailForm.value.id_detalle_ingreso,
      CodigosUnicosSeleccionados: registrarComoProductoUnico.value
        ? CodigosUnicosSeleccionados.value
        : [],
    }

    // Solo enviar id_lote si el toggle Lote está activo
    if (lote.value) {
      jsonData.id_lote = detailForm.value.compra
    } else {
      jsonData.id_lote = null
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

    loadAvailableProducts(detailForm.value.idmerma, detailForm.value.idalmacen)
    loadDetailData(detailForm.value.idmerma)
    resetDetailForm()
  } catch (error) {
    console.error('Error al guardar detalle:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.mensaje || i18nT('ui.error-al-guardar-detalle-04b164'),
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
      message: i18nT('ui.error-al-cargar-merma-para-editar-8f305d'),
    })
  }
}

const deleteItem = (id) => {
  $q.dialog({
    title: i18nT('configGeneral.divisas.messages.deleteTitle'),
    message: i18nT('ui.esta-seguro-que-desea-eliminar-este-registro-no-podr-4175d5'),
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
        message: error.response?.data?.mensaje || i18nT('ui.error-al-eliminar-merma-0f0075'),
      })
    }
  })
}

// const changeStatus = (id, estado) => {
//   $q.dialog({
//     title: Confirmar,
//     message: ¿Está seguro que desea cambiar el estado? No podrá revertir esta acción.,
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
//         message: error.response?.data?.mensaje || Error al cambiar estado,
//       })
//     }
//   })
// }

const filterlotes = (val, update) => {
  update(() => {
    if (val === '') {
      filterCompras.value = Compras.value
    } else {
      const needle = val.toLowerCase()
      filterCompras.value = Compras.value.filter((v) => v.label.toLowerCase().includes(needle))
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

  showMainForm.value = true
}

const backToMainForm = () => {
  $q.dialog({
    title: i18nT('configGeneral.divisas.messages.deleteTitle'),
    message: i18nT('ui.esta-seguro-esta-accion-eliminara-todos-los-producto-a22357'),
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
          message: i18nT('ui.error-al-cancelar-merma-6e6a66'),
        })
      }
    })
    .onCancel(() => {
      // El usuario canceló la acción
    })
}

const selectProduct = async (id) => {
  const product = availableProducts.value.find((p) => p.idproductoalmacen == id)
  if (product) {
    detailForm.value.stock = product.stock
  }
  // Al cambiar de producto se limpia el lote seleccionado
  detailForm.value.compra = null
  ComprasOriginales.value = []
  Compras.value = []
  filterCompras.value = []
  if (id) {
    await cargarLotesPorProducto(id)
  }
}

const cargarLotesPorProducto = async (idproductoalmacen) => {
  if (!idproductoalmacen) return
  try {
    const response = await api.get(`listarLotesPorProductoAlmacen/${idproductoalmacen}`)
    const res = response.data
    if (!res || res.estado !== 'exito') {
      throw new Error((res && res.mensaje) || i18nT('ui.error-al-cargar-lotes-32004d'))
    }
    const lotes = Array.isArray(res.data) ? res.data : []
    const mapped = lotes.map((l) => ({
      label:
        i18nT('ui.lote-3388a7') +
        l.id_lote +
        i18nT('ui.fact-94daed') +
        (l.nfactura || '-') +
        i18nT('ui.prov-fbb0c6') +
        (l.proveedor_nombre || '-') +
        i18nT('ui.disp-1acc6f') +
        l.cantidad_disponible,
      value: Number(l.id_lote),
      id_lote: Number(l.id_lote),
      idproveedor: null,
      cantidad_disponible: Number(l.cantidad_disponible),
      costo_unitario: Number(l.costo_unitario),
      fecha_entrada: l.fecha_entrada,
      id_detalle_ingreso: Number(l.id_detalle_ingreso),
    }))
    ComprasOriginales.value = mapped
    Compras.value = mapped
    filterCompras.value = [...mapped]
    // Auto-seleccion PEPS: el backend ordena por fecha_entrada ASC
    if (mapped.length > 0) {
      detailForm.value.compra = mapped[0].value
      detailForm.value.id_detalle_ingreso = mapped[0].id_detalle_ingreso
    }
  } catch (error) {
    console.error('Error al cargar lotes:', error)
    $q.notify({
      type: 'negative',
      message:
        (error.response && error.response.data && error.response.data.mensaje) ||
        i18nT('ui.no-se-pudieron-cargar-los-lotes-2ade23'),
    })
  }
}

const validateQuantity = () => {
  if (detailForm.value.cantidad > detailForm.value.stock) {
    $q.notify({
      type: 'warning',
      message: i18nT('ui.la-cantidad-ingresada-sobrepasa-al-stock-actual-be26be'),
    })
    detailForm.value.cantidad = 0
  }
}

const editDetailItem = async (id) => {
  try {
    const response = await api.get(`verificarExistenciaDetalleMerma/${id}`)

    if (response.data.estado === 'exito') {
      const datos = response.data.datos
      // Cargar lotes del producto para poder preseleccionar el lote existente
      await cargarLotesPorProducto(Number(datos.idproductoalmacen))

      detailForm.value = {
        id: datos.id,
        idmerma: detailForm.value.idmerma,
        // Numero, no objeto, para que el q-select lo resuelva con option-value
        idproductoalmacen: Number(datos.idproductoalmacen),
        cantidad: datos.cantidad,
        stock: datos.stock,
        idalmacen: detailForm.value.idalmacen,
        // Preseleccionar lote si el backend lo expone
        compra: datos.id_lote ?? Compras.value[0]?.value ?? null,
      }

      detailEditMode.value = true
    }
  } catch (error) {
    console.error('Error al cargar detalle para editar:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('ui.error-al-cargar-detalle-para-editar-fa4e55'),
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
      message: error.response?.data?.mensaje || i18nT('ui.error-al-eliminar-detalle-0de80c'),
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
      message: i18nT('ui.error-al-cargar-comprobante-7d80b6'),
    })
  }
}

const togglestatus = (row) => {
  console.log(row)

  $q.dialog({
    title: i18nT('configGeneral.divisas.messages.deleteTitle'),
    message: i18nT('ui.esta-seguro-no-podra-revertir-esta-accion-6dc7d4'),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      const point = `actualizarEstadomerma/${row.id}/1/${idusuario}`
      const response = await api.get(point) // Cambia a tu ruta real
      //console.log(response)
      const data = response.data
      //console.log(data.estado)
      if (data.estado === 'exito') {
        await loadTableData()

        $q.notify({
          type: 'positive',
          message: data.mensaje,
        })
      } else {
        $q.notify({
          type: 'negative',
          message: data.mensaje || i18nT('ui.error-desconocido-9c256e'),
        })
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      $q.notify({
        type: 'negative',
        message: i18nT('configGeneral.divisas.messages.loadError'),
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
    $q.notify({ type: 'negative', message: i18nT('ui.no-se-pudieron-cargar-caja-bancos-8c4a52') })
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
      message: i18nT('ui.id-md5-no-encontrado-asegurate-de-iniciar-sesion-cor-e2a61f'),
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

<template>
  <q-page padding>
    <!-- Sección: Datos del cliente -->
    <q-form ref="formClientes">
      <div class="row q-col-gutter-x-md">
        <div class="col-12 col-md-3">
          <label for="tipooperacion">Tipo de Operación*</label>
          <q-select
            v-model="tipoOperacion"
            :options="optionOperacion"
            id="tipooperacion"
            map-options
            :rules="[(val) => !!val || 'Campo requerido']"
            @update:model-value="handleTipoOperacionChange"
            outlined
            dense
          />
        </div>
      </div>
      <div class="row q-col-gutter-x-md">
        <div class="col-12 col-md-5">
          <label for="cliente">Cliente*</label>
          <q-select
            v-model="selectedClient"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            id="cliente"
            :options="filteredClients"
            @filter="filterClient"
            @input-value="setClientInputValue"
            @update:model-value="elegirUnCliente"
            option-value="id"
            option-label="display"
            :rules="[(val) => !!val || 'Campo requerido']"
            outlined
            dense
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No hay resultados </q-item-section>
              </q-item>
            </template>
          </q-select>
          <input type="hidden" v-model="idclienteCO" name="idcliente" />
        </div>

        <div class="col-9 col-md-5">
          <label for="sucursal">Sucursal*</label>
          <q-select
            v-model="selectedSucursal"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            id="sucursal"
            :options="filteredSucursales"
            @filter="filterSucursal"
            @input-value="setSucursalInputValue"
            @update:model-value="elegirUnaSucursal"
            option-value="id"
            option-label="nombre"
            :rules="[(val) => !!val || 'Campo requerido']"
            outlined
            dense
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No hay resultados </q-item-section>
              </q-item>
            </template>
          </q-select>
          <input type="hidden" v-model="idsucursalCOS" name="idsucursal" />
        </div>
        <div class="">
          <q-btn color="blue q-mt-lg" icon="person_add" @click="RegistrarCliente" />
        </div>
      </div>
    </q-form>

    <!-- Sección: Configuración inicial -->
    <q-form ref="cotizacionFormRef" class="q-gutter-y-md">
      <div class="row q-col-gutter-x-md">
        <div class="col-12 col-md-3">
          <label for="almacen">Almacén origen *</label>
          <q-select
            v-model="filtroAlmacenCO"
            :options="almacenesOptions"
            id="almacen"
            emit-value
            map-options
            option-value="idalmacen"
            option-label="almacen"
            :rules="[(val) => !!val || 'Campo requerido']"
            @update:model-value="listaCategoria"
            outlined
            dense
          />
        </div>

        <div class="col-12 col-md-3">
          <label for="categoria">Categoría de precio *</label>
          <q-select
            v-model="filtroCategoriaCO"
            :options="categoriasOptions"
            id="categoria"
            emit-value
            map-options
            option-value="id"
            option-label="nombre"
            :rules="[(val) => !!val || 'Campo requerido']"
            outlined
            dense
          />
        </div>
      </div>
    </q-form>

    <!-- Sección: Selección de productos -->

    <div class="row q-col-gutter-x-md">
      <div class="col-12 col-md-5">
        <label for="producto">Producto *</label>
        <q-select
          v-model="selectedProduct"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
          id="producto"
          :options="filteredProducts"
          @filter="filterProduct"
          @input-value="setProductInputValue"
          @update:model-value="elegirUnProducto"
          option-value="id"
          option-label="display"
          outlined
          dense
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> No hay resultados </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <div class="col-12 col-md-2">
        <label for="stockdisponible">Stock disponible</label>
        <q-input v-model="cantidaddisponibleCO" id="stockdisponible" disable outlined dense />
      </div>

      <div class="col-12 col-md-2">
        <label for="cantidad">Canidad *</label>
        <q-input
          v-model.number="cantidadCO"
          id="cantidad"
          type="number"
          :rules="[(val) => val > 0 || 'Debe ser mayor a 0']"
          required
          outlined
          dense
        />
      </div>

      <div class="col-12 col-md-2">
        <label for="precio">Precio unitario *</label>
        <q-input
          v-model.number="precioCO"
          id="precio"
          type="number"
          :rules="[(val) => val > 0 || 'Debe ser mayor a 0']"
          required
          outlined
          dense
        >
          <template v-slot:append>
            <span class="text-caption text-grey-7">{{ divisaActiva.tipo }}</span>
          </template>
        </q-input>
      </div>

      <div class="col-12 col-md-1 q-mt-lg">
        <q-btn
          icon="add"
          color="primary"
          round
          @click="anadirProductoACarrito"
          :disable="!canAddProduct"
          outlined
          dense
        />
      </div>
    </div>
    <div class="row items-center q-gutter-sm">
      <q-label class="text-subtitle2">Venta sin stock</q-label>
      <q-btn
        :icon="permitirStock ? 'toggle_on' : 'toggle_off'"
        dense
        flat
        :color="permitirStock ? 'green' : 'grey'"
        :title="permitirStock ? 'Desactivar venta sin stock' : 'Activar venta sin stock'"
        @click="permitirStockvacio()"
      />
    </div>
    <!-- Sección: Resumen de cotización -->
    <q-card flat bordered>
      <q-table
        :rows="carritoCO.listaProductos"
        :columns="carritoColumns"
        row-key="idproductoalmacen"
        flat
        bordered
        hide-bottom
        :pagination="{ rowsPerPage: 0 }"
        title="Resumen de cotización"
      >
        <template v-slot:body-cell-descripcion="props">
          <q-td :props="props" style="background-color: #f9f9f9; vertical-align: top">
            <!-- Descripción principal -->
            <div>{{ props.row.descripcion }}</div>

            <!-- Descripción adicional editable debajo -->
            <div
              style="
                margin-top: 4px;
                font-size: 0.9em;
                color: #555;
                display: flex;
                align-items: center;
                justify-content: space-between;
              "
            >
              <q-popup-edit v-model="props.row.descripcionAdicional" v-slot="scope">
                <label for="desAdicional">Añadir Descripción Adicional</label>
                <q-input
                  v-model="scope.value"
                  outlined
                  dense
                  id="desAdicional"
                  autofocus
                  type="text"
                  @keyup.enter="validarDescripcion(scope, props.row)"
                  @keyup.esc="scope.cancel"
                />
              </q-popup-edit>
              <span style="margin-left: 4px">{{ props.row.descripcionAdicional }}</span>
              <q-icon name="edit" size="16px" color="primary" class="q-ml-xs" />
            </div>
          </q-td>
        </template>
        <template v-slot:body-cell-cantidad="props">
          <q-td :props="props" class="text-right">
            {{ props.row.cantidad }}
          </q-td>
        </template>

        <template v-slot:body-cell-precio="props">
          <q-td :props="props" class="text-right">
            {{ decimas(props.row.precio) }}{{ ' ' + divisaActiva.tipo }}
          </q-td>
        </template>

        <template v-slot:body-cell-total="props">
          <q-td :props="props" class="text-right">
            {{ decimas(props.row.cantidad * props.row.precio) }} {{ ' ' + divisaActiva.tipo }}
          </q-td>
        </template>

        <template v-slot:body-cell-options="props">
          <q-td :props="props" class="text-center">
            <q-btn
              icon="delete"
              color="negative"
              flat
              round
              size="sm"
              @click="eliminarProductoCarrito(props.row.idproductoalmacen)"
            />
          </q-td>
        </template>

        <template v-slot:bottom-row>
          <q-tr>
            <q-td colspan="5" class="text-right text-weight-bold">Sub Total:</q-td>
            <q-td class="text-right"
              >{{ decimas(carritoCO.subtotal) }} {{ ' ' + divisaActiva.tipo }}</q-td
            >
            <q-td></q-td>
          </q-tr>
          <q-tr>
            <q-td colspan="5" class="text-right text-weight-bold">Descuento:</q-td>
            <q-td class="text-right">
              <q-input
                v-model.number="carritoCO.descuento"
                type="number"
                min="0"
                :max="carritoCO.subtotal"
                @change="aplicarDescuento"
                style="width: 100px"
                class="text-right"
              >
                <template v-slot:append>
                  <span class="text-caption text-grey-7">{{ divisaActiva.tipo }}</span>
                </template>
              </q-input>
            </q-td>
            <q-td></q-td>
          </q-tr>
          <q-tr>
            <q-td colspan="5" class="text-right text-weight-bold">Total:</q-td>
            <q-td class="text-right text-weight-bold text-primary">
              {{ decimas(carritoCO.ventatotal) }} {{ ' ' + divisaActiva.tipo }}
            </q-td>
            <q-td></q-td>
          </q-tr>
        </template>
      </q-table>

      <div class="row justify-end q-mt-md">
        <q-btn
          label="Registrar Cotización"
          color="primary"
          icon="save"
          :disable="carritoCO.listaProductos.length === 0"
          @click="cotizacion_proforma"
        />
      </div>
    </q-card>
    <!-- Diálogo: metodo de pago -->

    <q-dialog v-model="modalmetodopago">
      <q-card class="responsive-dialog">
        <q-card-section class="bg-primary text-white text-h6 flex justify-between">
          <div>Metodo pago</div>
          <q-btn icon="close" @click="modalmetodopago = false" flat round dense />
        </q-card-section>
        <q-card-section>
          <div class="">
            <div class="q-gutter-sm q-mb-md">
              <q-radio v-model="variablePago" val="directo" color="green" label="Pago Único">
                <template v-slot:prepend>
                  <q-icon name="attach_money" color="green" />
                </template>
              </q-radio>
              <q-radio v-model="variablePago" val="dividido" label="Método de Pago Dividido">
                <template v-slot:prepend>
                  <q-icon name="money_off" color="orange" />
                </template>
              </q-radio>
            </div>

            <div v-if="variablePago === 'directo'" class="row q-col-gutter-md q-pt-md">
              <div class="col-12 col-md-4">
                <label for="metodopago">Método de pago*</label>
                <q-select
                  v-model="metodoPago"
                  id="metodopago"
                  dense
                  outlined
                  :options="metodosPagos"
                  option-label="label"
                  option-value="value"
                  :rules="[(val) => !!val || 'Seleccione un canal']"
                >
                </q-select>
              </div>
            </div>
            <div v-else-if="variablePago === 'dividido'" class="q-pt-md">
              <div
                v-for="(payment, index) in pagosDivididos"
                :key="index"
                class="row q-col-gutter-md q-mb-sm items-center"
              >
                <div class="col-12 col-md-4">
                  <label for="metodopago">Método de pago*</label>
                  <q-select
                    v-model="payment.metodoPago"
                    id="metodopago"
                    dense
                    outlined
                    :options="metodosPagos"
                    option-label="label"
                    option-value="value"
                    :rules="[(val) => !!val || 'Seleccione un metodoPago']"
                  >
                  </q-select>
                </div>
                <div class="col-12 col-md-3">
                  <label for="monto">{{ 'Monto' + ' (' + divisaActiva.tipo + ')' }}</label>
                  <q-input
                    v-model="payment.monto"
                    id="monto"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    dense
                    outlined
                    @update:model-value="calculateRemainingAmount(index)"
                    :rules="[(val) => !!val || 'Campo Obligatorio']"
                  >
                  </q-input>
                </div>
                <div class="col-12 col-md-3">
                  <label for="porcentaje">Porcentaje (%)</label>
                  <q-input
                    v-model="payment.porcentaje"
                    id="porcentaje"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    dense
                    outlined
                    @update:model-value="calculateAmountFromPercentage(index)"
                    :rules="[(val) => !!val || 'Campo Obligatorio']"
                  >
                  </q-input>
                </div>
                <div class="col-12 col-md-2 text-right">
                  <q-btn
                    v-if="pagosDivididos.length > 1"
                    icon="delete"
                    color="negative"
                    flat
                    round
                    @click="removePaymentMethod(index)"
                  />
                </div>
              </div>
              <q-btn
                label="Agregar Método de Pago"
                icon="add"
                color="green"
                @click="addPaymentMethod"
                class="q-mt-md"
              />
              <div class="q-mt-lg" style="font-size: 15px">
                <p class="">
                  <q-icon name="calculate" color="primary" class="q-mr-sm" />
                  <strong>Total Pagado:</strong> {{ totalPaidAmount.toFixed(2) }}
                  {{ divisaActiva.tipo }}
                </p>
                <p class="">
                  <q-icon name="pending_actions" color="orange" class="q-mr-sm" />
                  <strong>Restante por Pagar:</strong> {{ remainingAmount.toFixed(2) }}
                  {{ divisaActiva.tipo }}
                </p>
                <q-banner
                  v-if="remainingAmount !== 0"
                  dense
                  rounded
                  class="bg-warning text-white q-mt-sm"
                >
                  <template v-slot:avatar>
                    <q-icon name="warning" color="white" />
                  </template>
                  El monto total pagado no coincide con la venta total.
                </q-banner>
              </div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" @click="enviarDatos" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- Diálogo: Comprobante de cotización enviarDatos -->

    <!-- Diálogo: Vista previa PDF -->
    <q-dialog v-model="mostrarModal" persistent full-width full-height>
      <q-card class="q-pa-none" style="height: 100%; max-width: 100%">
        <q-card-section class="row items-center q-pb-none bg-primary text-white">
          <div class="text-h6">Vista previa de PDF</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-none" style="height: calc(100% - 50px)">
          <iframe
            v-if="pdfData"
            :src="pdfData"
            style="width: 100%; height: 100%; border: none"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
    <div class="q-pa-md q-gutter-sm">
      <q-dialog v-model="dialog" :position="position" :id="idcliente" :data="detallesCotizacion">
        <q-card class="dialog-card">
          <q-card-section class="header-gradient q-pa-md text-white flex items-center">
            <q-icon name="check_circle" size="md" class="q-mr-sm" />
            <div class="text-h6 text-weight-bold">Confirmación de Envío</div>
          </q-card-section>

          <q-card-section class="q-pt-lg q-pb-md">
            <div class="text-body1 text-grey-8 q-mb-sm">
              El comprobante ha sido generado correctamente.
            </div>
            <div class="text-body1 text-grey-8">
              ¿Desea enviarlo al correo electrónico del cliente?
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn flat label="Cancelar" color="grey-7" @click="cancelar()" class="q-px-md" />
            <q-btn
              unelevated
              label="Enviar Comprobante"
              class="button-primary q-px-md"
              @click="confirmar(idcliente, detallesCotizacion)"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="showAddModal">
        <MyRegistrationForm @recordCreated="handleRecordCreated" />
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { generarPdfCotizacion } from 'src/utils/pdfReportGenerator'
import { redondear, normalizeText, decimas, validarUsuario } from 'src/composables/FuncionesG'
import MyRegistrationForm from 'src/components/clientes/admin/modalClienteForm.vue'
import { idempresa_md5 } from 'src/composables/FuncionesGenerales'
const showAddModal = ref(false)

import { PDFenviarComprobanteCorreo } from 'src/utils/pdfReportGenerator'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
const variablePago = ref('directo')
const modalmetodopago = ref(false)
const pdfData = ref(null)
const mostrarModal = ref(false)
const $q = useQuasar()
const dialog = ref(false)
const position = ref('top')
const idcliente = ref('')
let resolver = null
const detallesCotizacion = ref([])
// --- Estados reactivos ---
const cotizacionFormRef = ref(null) // Para el q-form
const formClientes = ref(null) // Para el q-form
const idalmacenfiltro = ref(0)
const idporcentajeventa = ref(0)
const divisaActiva = reactive({ id: 0, nombre: '', tipo: '', codigosin: 0 })
const leyendaFacturaActiva = reactive({ id: 0, codigosin: 0 }) // Aunque no se usa en este formulario, se mantiene por original
const leyendasCotizacion = ref([]) // Para el aviso en el comprobante

// Tipo de operación: cotizacion o venta
const tipoOperacion = ref({ value: 2, label: 'Cotización Normal' })
const optionOperacion = ref([
  { value: 2, label: 'Cotización Normal' },
  { value: 1, label: 'Cotización Preferencial' },
])
// Datos del formulario
const filtroAlmacenCO = ref(null)
const almacenesOptions = ref([])

const filtroCategoriaCO = ref(null)
const categoriasOptions = ref([])

const idclienteCO = ref('')
const selectedClient = ref(null) // Objeto del cliente seleccionado
const clientesOptions = ref([])
const filteredClients = ref([])

const idsucursalCOS = ref('')
const selectedSucursal = ref(null) // Objeto de la sucursal seleccionada
const sucursalesOptions = ref([])
const filteredSucursales = ref([])

const selectedProduct = ref(null) // Objeto del producto seleccionado
const cantidaddisponibleCO = ref('')
const cantidadCO = ref(0)
const precioCO = ref(0)
const idstockCO = ref('')
const idporcentajeCO = ref('')
const idproductoalmacenCO = ref('')
const productosDisponibles = ref([])
const filteredProducts = ref([])
const pagosDivididos = ref([{ metodoPago: null, monto: 0, porcentaje: 0 }])
const metodosPagos = ref([])
const metodoPago = ref(null)
const permitirStock = ref(false)
const carritoCO = reactive({
  ventatotal: 0,
  subtotal: 0,
  descuento: 0,
  divisa: divisaActiva.id,
  idusuario: 0, // Se llenará al validar el usuario
  listaProductos: [],
  pagosDivididos: [],
  metodoPago: 0,
  variablePago: '',
})
const emit = defineEmits(['reiniciar'])

// premitir stock
const permitirStockvacio = () => {
  permitirStock.value = !permitirStock.value

  if (!permitirStock.value) {
    const datos = JSON.parse(localStorage.getItem('carritoCO')) || {}

    console.log(datos)
    const productos = Array.isArray(datos.listaProductos) && datos.listaProductos.length > 0
    console.log(productos)

    const carrito = Array.isArray(carritoCO.value) && carritoCO.value.length > 0
    console.log(carrito)

    if (carrito || productos) {
      emit('reiniciar')
    }
  }
}
// Columnas para la tabla del carrito
const carritoColumns = [
  { name: 'num', label: 'N°', align: 'left', field: 'num' },
  { name: 'codigo', label: 'Código', align: 'center', field: 'codigo' },
  { name: 'descripcion', label: 'Descripción', align: 'left', field: 'descripcion' },
  {
    name: 'cantidad',
    label: 'Cantidad',
    align: 'center',
    field: (row) => decimas(row.cantidad),
  },
  {
    name: 'precio',
    label: 'Precio unitario',
    align: 'center',
    field: (row) => decimas(row.precio),
  },
  {
    name: 'total',
    label: 'Total',
    align: 'center',
    field: (row) => decimas(redondear(parseFloat(row.cantidad) * parseFloat(row.precio))),
  },
  { name: 'options', label: 'Opciones', align: 'center', field: 'options' },
]

// Columnas para la tabla del comprobante

// --- Computed Properties ---
const canAddProduct = computed(() => {
  if (permitirStock.value && precioCO.value > 0 && Number(tipoOperacion.value?.value) === 1) {
    return true
  }
  if (!selectedProduct.value || cantidadCO.value <= 0 || precioCO.value <= 0) {
    return false
  }
  console.log('tipo operacion: ' + tipoOperacion.value?.value)
  if (tipoOperacion.value?.value === 1) {
    return cantidadCO.value <= cantidaddisponibleCO.value
  }

  return true // Para cotización, no se valida stock venta Proforma La cantidad solicitada excede el stock disponible
})

// --- Watchers ---

// Sincronizar carrito con localStorage
watch(
  carritoCO,
  (newVal) => {
    localStorage.setItem('carritoCO', JSON.stringify(newVal))
  },
  { deep: true },
)
const handleTipoOperacionChange = () => {
  cotizacionFormRef.value.resetValidation() // Resetear validación

  resetFormulario()
  console.log(tipoOperacion.value)
}
// Cargar carrito desde localStorage al inicio

onMounted(() => {
  localStorage.removeItem('carritoCO') // Limpiar localStorage al inicio
  const storedCarrito = localStorage.getItem('carritoCO')
  if (storedCarrito) {
    Object.assign(carritoCO, JSON.parse(storedCarrito))
  }
})

// Watcher para el filtro de almacén para recargar categorías
watch(filtroAlmacenCO, (newVal) => {
  idalmacenfiltro.value = newVal
  listaCategoria()
})

// Watcher para el filtro de categoría para recargar productos
watch(filtroCategoriaCO, (newVal) => {
  idporcentajeventa.value = newVal
  listaProductosDisponibles()
})

// Watcher para resetear campos de producto cuando se selecciona otro producto o se borra el input
watch(selectedProduct, (newVal) => {
  if (!newVal) {
    cantidaddisponibleCO.value = ''
    cantidadCO.value = 0
    precioCO.value = 0
    idstockCO.value = ''
    idporcentajeCO.value = ''
    idproductoalmacenCO.value = ''
  }
})

const cotizacion_proforma = async () => {
  console.log(tipoOperacion.value)
  const tipo_cotz = tipoOperacion.value
  if (Number(tipo_cotz.value) == 2) {
    await enviarDatos()
  } else {
    modalmetodopago.value = true
  }
}

// ======================== TIpo de pago combinado =================

const totalSaleAmount = computed(() => {
  const cartData = JSON.parse(localStorage.getItem('carritoCO') || '{}')
  if (cartData && cartData.ventatotal) {
    return parseFloat(cartData.ventatotal)
  }
  return 0
})

const totalPaidAmount = computed(() => {
  if (variablePago.value === 'dividido') {
    return pagosDivididos.value.reduce((sum, payment) => sum + parseFloat(payment.monto || 0), 0)
  }
  return 0 // Not applicable for direct payment or credit for this specific calculation
})

const remainingAmount = computed(() => {
  // Only calculate remaining if it's a divided payment type
  if (variablePago.value === 'dividido') {
    return totalSaleAmount.value - totalPaidAmount.value
  }
  return 0 // Not relevant for direct or credit payment types
})

const addPaymentMethod = () => {
  pagosDivididos.value.push({ metodoPago: null, monto: 0, porcentaje: 0 })
}

const removePaymentMethod = (index) => {
  pagosDivididos.value.splice(index, 1)
}
const calculateAmountFromPercentage = (index) => {
  console.log(index)
  const payment = pagosDivididos.value[index]
  console.log(payment)
  // Ensure percentage is treated as a number and within valid range
  const percentage = parseFloat(payment.porcentaje) || 0
  if (percentage >= 0 && percentage <= 100 && totalSaleAmount.value > 0) {
    payment.monto = (totalSaleAmount.value * (percentage / 100)).toFixed(2)
  } else {
    payment.monto = 0
  }
}
const calculateRemainingAmount = (index) => {
  console.log(index)
  const payment = pagosDivididos.value[index]
  console.log(payment)
  const monto = parseFloat(payment.monto) || 0
  if (monto >= 0 && monto <= totalSaleAmount.value && totalSaleAmount.value > 0) {
    payment.porcentaje = ((monto * 100) / totalSaleAmount.value).toFixed(2)
  } else {
    payment.porcentaje = 0
  }
}
// --- Funciones de Lógica de Negocio y Peticiones ---

async function getUserData() {
  const contenidousuario = validarUsuario()
  return contenidousuario[0]
}

const cargarMetodoPagoFactura = async () => {
  try {
    const respuesta = await validarUsuario()
    const token = respuesta[0]?.factura?.access_token
    const tipo = respuesta[0]?.factura?.tipo
    const idempresa = respuesta[0]?.empresa?.idempresa
    const response = await api.get(`listaMetodopagoFactura/${idempresa}/${token}/${tipo}`)
    const filtrado = response.data.filter((u) => u.estado == 1)
    console.log(response.data)
    metodosPagos.value = filtrado.map((item) => ({
      label: item.nombre,
      value: item.id,
    }))
  } catch (error) {
    console.error('Error cargando canales:', error)
  }
}
async function leyendaActiva() {
  const contenidousuario = await getUserData()
  const idempresa = contenidousuario?.empresa?.idempresa
  const token = contenidousuario?.factura?.access_token
  const tipo = contenidousuario?.factura?.tipo
  const endpoint = `listaLeyendaFactura/${idempresa}/${token}/${tipo}`
  try {
    const response = await api.get(endpoint)
    const resultado = response.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
    } else {
      let use = resultado.filter((u) => u.estado === 1)
      if (use.length > 0) {
        leyendaFacturaActiva.id = use[0].id
        leyendaFacturaActiva.codigosin = use[0].leyendasin.codigo
      }
    }
  } catch (error) {
    console.error('Error al cargar leyenda activa:', error)
  }
}

async function divisaEmonedaActiva() {
  const contenidousuario = await getUserData()
  const idempresa = contenidousuario?.empresa?.idempresa
  const token = contenidousuario?.factura?.access_token
  const tipo = contenidousuario?.factura?.tipo
  const endpoint = `listaDivisa/${idempresa}/${token}/${tipo}`
  try {
    const response = await api.get(endpoint)
    const resultado = response.data
    console.log(resultado)
    if (resultado[0] === 'error') {
      console.error(resultado.error)
    } else {
      let use = resultado.filter((u) => Number(u.estado) === 1)
      if (use.length > 0) {
        divisaActiva.id = use[0].id
        divisaActiva.nombre = use[0].nombre
        divisaActiva.tipo = use[0].tipo
        divisaActiva.codigosin = use[0].monedasin.codigo
      }
      console.log(divisaActiva)
    }
  } catch (error) {
    console.error('Error al cargar divisa activa:', error)
  }
}

async function listaAlmacenes() {
  const contenidousuario = await getUserData()
  const idempresa = contenidousuario?.empresa?.idempresa
  const idusuario = contenidousuario?.idusuario
  const endpoint = `listaResponsableAlmacen/${idempresa}`
  try {
    const response = await api.get(endpoint)
    const resultado = response.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
    } else {
      almacenesOptions.value = resultado.filter((u) => u.idusuario === idusuario)
      if (almacenesOptions.value.length > 0) {
        filtroAlmacenCO.value = almacenesOptions.value[0].idalmacen // Seleccionar el primero por defecto
      }
    }
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
  }
}
watch(filtroAlmacenCO, (newVal) => {
  console.log('filtroAlmacenCO ha cambiado a:', newVal) // <--- AÑADIR ESTO num
  idalmacenfiltro.value = newVal
  listaCategoria()
})
async function listaCategoria() {
  const contenidousuario = await getUserData()
  const idempresa = contenidousuario?.empresa?.idempresa
  const endpoint = `listaCategoriaPrecio/${idempresa}`
  try {
    const response = await api.get(endpoint)
    const resultado = response.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
    } else {
      // Filtrado por el idalmacenfiltro.value que se actualiza desde el watcher
      categoriasOptions.value = resultado.filter((u) => {
        return Number(u.estado) === 1 && Number(u.idalmacen) === Number(idalmacenfiltro.value)
      })
      if (categoriasOptions.value.length > 0) {
        filtroCategoriaCO.value = categoriasOptions.value[0].id // Seleccionar el primero por defecto
      } else {
        filtroCategoriaCO.value = null // Resetear si no hay categorías
      }
    }
  } catch (error) {
    console.error('Error al cargar categorías:', error)
  }
}

async function listaProductosDisponibles() {
  const contenidousuario = await getUserData()
  const idempresa = contenidousuario?.empresa?.idempresa
  if (!idempresa) {
    $q.notify({ type: 'negative', message: 'Error: No se pudo obtener la empresa.' })
    return
  }
  if (!idporcentajeventa.value) {
    productosDisponibles.value = []
    return
  }

  const endpoint = `listaProductosDisponiblesVenta/${idempresa}`
  try {
    const response = await api.get(endpoint)
    const resultado = response.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
      productosDisponibles.value = []
    } else {
      let use = resultado.datos.filter((u) => u.idporcentaje === idporcentajeventa.value)
      // Filtrar productos que ya están en el carrito
      if (carritoCO.listaProductos.length > 0) {
        use = use.filter(
          (u) => !carritoCO.listaProductos.some((cp) => cp.idproductoalmacen === u.id),
        )
      }
      productosDisponibles.value = use.map((p) => ({
        ...p,
        display: `${p.codigo} - ${p.descripcion}`,
      }))
    }
  } catch (error) {
    console.error('Error al cargar productos disponibles:', error)
    productosDisponibles.value = []
  }
}

async function listaCLientes() {
  const contenidousuario = await getUserData()
  const idempresa = contenidousuario?.empresa?.idempresa
  if (!idempresa) {
    $q.notify({ type: 'negative', message: 'Error: No se pudo obtener la empresa.' })
    return
  }
  const endpoint = `listaCliente/${idempresa}`
  try {
    const response = await api.get(endpoint)
    const resultado = response.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
    } else {
      clientesOptions.value = resultado.map((c) => ({
        ...c,
        display: `${c.codigo} - ${c.nombre} - ${c.nombrecomercial} - ${c.ciudad} - ${c.nit}`,
      }))
    }
  } catch (error) {
    console.error('Error al cargar clientes:', error)
  }
}

async function selectSucursal(clientId) {
  if (!clientId) {
    sucursalesOptions.value = []
    selectedSucursal.value = null
    idsucursalCOS.value = ''
    return
  }
  try {
    const endpoint = `listaSucursal/${clientId}`
    const response = await api.get(endpoint)
    const data = response.data
    if (data.length === 0) {
      $q.notify({
        type: 'info',
        message: 'No existen sucursales registradas del cliente seleccionado.',
      })
      sucursalesOptions.value = []
      selectedSucursal.value = null
      idsucursalCOS.value = ''
    } else {
      sucursalesOptions.value = data
      // Seleccionar la primera sucursal por defecto
      selectedSucursal.value = data[0]
      idsucursalCOS.value = data[0].id
    }
  } catch (error) {
    console.error('Error al cargar sucursales:', error)
    sucursalesOptions.value = []
    selectedSucursal.value = null
    idsucursalCOS.value = ''
  }
}

async function cargarLeyendasCotizacion() {
  const contenidousuario = await getUserData()
  const idempresa = contenidousuario?.empresa?.idempresa
  if (!idempresa) {
    leyendasCotizacion.value = []
    return
  }
  const endpoint = `listaLeyendaCotizacion/${idempresa}`

  try {
    const response = await api.get(endpoint)
    const resultado = response.data
    if (resultado[0] === 'error') {
      console.error(resultado.error)
      leyendasCotizacion.value = []
    } else {
      leyendasCotizacion.value = resultado.filter((u) => u.estado === 1)
    }
  } catch (error) {
    console.error('Error al cargar leyendas de cotización:', error)
    leyendasCotizacion.value = []
  }
}

// --- Lógica de filtrado para Quasar Select ---

function filterClient(val, update) {
  if (val === '') {
    update(() => {
      filteredClients.value = clientesOptions.value
    })
    return
  }
  update(() => {
    const needle = normalizeText(val).toLowerCase()
    filteredClients.value = clientesOptions.value.filter(
      (v) => normalizeText(v.display).toLowerCase().indexOf(needle) > -1,
    )
  })
}

function setClientInputValue(val) {
  // Esta función se dispara cuando el usuario escribe en el input
  // Si el valor no coincide con un cliente seleccionado, resetea la selección
  if (!clientesOptions.value.some((c) => c.display === val)) {
    selectedClient.value = null
    idclienteCO.value = ''
    selectedSucursal.value = null
    idsucursalCOS.value = ''
  }
}

function elegirUnCliente(client) {
  if (client) {
    idclienteCO.value = client.id
    selectSucursal(client.id)
  } else {
    idclienteCO.value = ''
    selectedSucursal.value = null
    idsucursalCOS.value = ''
  }
}

function filterSucursal(val, update) {
  if (val === '') {
    update(() => {
      filteredSucursales.value = sucursalesOptions.value
    })
    return
  }
  update(() => {
    const needle = normalizeText(val).toLowerCase()
    filteredSucursales.value = sucursalesOptions.value.filter(
      (v) => normalizeText(v.nombre).toLowerCase().indexOf(needle) > -1,
    )
  })
}

function setSucursalInputValue(val) {
  if (!sucursalesOptions.value.some((s) => s.nombre === val)) {
    selectedSucursal.value = null
    idsucursalCOS.value = ''
  }
}

function elegirUnaSucursal(sucursal) {
  if (sucursal) {
    idsucursalCOS.value = sucursal.id
  } else {
    idsucursalCOS.value = ''
  }
}

function filterProduct(val, update) {
  if (val === '') {
    update(() => {
      filteredProducts.value = productosDisponibles.value
    })
    return
  }
  update(() => {
    const needle = normalizeText(val).toLowerCase()
    filteredProducts.value = productosDisponibles.value.filter(
      (v) => normalizeText(v.display).toLowerCase().indexOf(needle) > -1,
    )
  })
}

function setProductInputValue(val) {
  if (!productosDisponibles.value.some((p) => p.display === val)) {
    selectedProduct.value = null
  }
}

function elegirUnProducto(product) {
  if (product) {
    cantidaddisponibleCO.value = product.stock
    precioCO.value = product.precio
    idstockCO.value = product.idstock
    idporcentajeCO.value = product.idporcentaje
    idproductoalmacenCO.value = product.id
    cantidadCO.value = 1 // Set default quantity to 1
  } else {
    cantidaddisponibleCO.value = ''
    precioCO.value = 0
    idstockCO.value = ''
    idporcentajeCO.value = ''
    idproductoalmacenCO.value = ''
    cantidadCO.value = 0
  }
}

// --- Lógica del Carrito ---

async function anadirProductoACarrito() {
  console.log(pagosDivididos.value)
  if (!selectedProduct.value || cantidadCO.value <= 0 || precioCO.value <= 0) {
    $q.notify({
      type: 'info',
      message: 'Llene todos los campos para poder cargar productos a la lista.',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
    return
  }

  console.log(tipoOperacion.value?.value)
  if (Number(tipoOperacion.value?.value) === 1) {
    if (cantidadCO.value > cantidaddisponibleCO.value && !permitirStock.value) {
      $q.notify({
        type: 'warning',
        message: 'La cantidad solicitada excede el stock disponible.',
        actions: [{ icon: 'close', color: 'white', round: true }],
      })
      return
    } else {
      if (cantidadCO.value > cantidaddisponibleCO.value && permitirStock.value) {
        $q.notify({
          type: 'warning',
          message: 'La cantidad solicitada excede el stock disponible.',
          actions: [{ icon: 'close', color: 'white', round: true }],
        })
      }
    }
  } else {
    if (Number(tipoOperacion.value?.value) === 2 && cantidadCO.value > cantidaddisponibleCO.value) {
      $q.notify({
        type: 'warning',
        message: 'La cantidad solicitada excede el stock disponible.',
        actions: [{ icon: 'close', color: 'white', round: true }],
      })
    }
  }
  console.log(selectedProduct.value, cantidadCO.value)

  const contenidousuario = await getUserData()
  const idusuario = contenidousuario?.idusuario
  console.log(selectedProduct.value.stock)
  const nuevoProducto = {
    num: carritoCO.listaProductos.length + 1,
    idproductoalmacen: idproductoalmacenCO.value,
    cantidad: cantidadCO.value,
    precio: precioCO.value,
    idstock: idstockCO.value,
    idporcentaje: idporcentajeCO.value,
    candiponible: cantidaddisponibleCO.value,
    descripcion: selectedProduct.value.descripcion,
    descripcionAdicional: '',
    codigo: selectedProduct.value.codigo,
    despachado:
      Number(selectedProduct.value.stock) == 0 ||
      Number(selectedProduct.value.stock) < Number(cantidadCO.value)
        ? 2
        : 1,
  }
  console.log(carritoCO.listaProductos.length)
  carritoCO.idusuario = idusuario
  carritoCO.idempresa = idempresa_md5()
  carritoCO.divisa = divisaActiva.id // Asegúrate de que la divisa activa esté cargada
  carritoCO.listaProductos.push(nuevoProducto)

  calcularTotalesCarrito()
  listaProductosDisponibles() // Recargar la lista de productos disponibles para excluir el añadido
  resetProductoInputs()
}

function eliminarProductoCarrito(idProductoAlmacen) {
  carritoCO.listaProductos = carritoCO.listaProductos.filter(
    (p) => p.idproductoalmacen !== idProductoAlmacen,
  )
  calcularTotalesCarrito()
  listaProductosDisponibles() // Recargar la lista de productos disponibles
}
const validarDescripcion = async (scope, row) => {
  console.log(scope.value)

  if (carritoCO && carritoCO.listaProductos) {
    carritoCO.listaProductos = carritoCO.listaProductos.map((prod) => {
      // Agregar o editar la descripción adicional
      if (Number(prod.id) == Number(row.idproductoalmacen)) {
        prod.descripcionAdicional = scope.value
      }
      return prod
    })

    console.log('Descripción adicional actualizada correctamente ')
  } else {
    console.warn('No se encontró la lista de productos en el localStorage')
  }

  scope.set()
}
function calcularTotalesCarrito() {
  carritoCO.subtotal = carritoCO.listaProductos.reduce((sub, producto) => {
    const precio = parseFloat(producto.precio)
    const cantidad = parseFloat(producto.cantidad)
    return sub + precio * cantidad
  }, 0)

  if (carritoCO.subtotal === 0) {
    carritoCO.descuento = 0
  }
  carritoCO.ventatotal = carritoCO.subtotal - carritoCO.descuento

  // Asegurar dos decimales
  carritoCO.subtotal = redondear(carritoCO.subtotal)
  carritoCO.ventatotal = redondear(carritoCO.ventatotal)
  carritoCO.descuento = redondear(carritoCO.descuento)
}

function aplicarDescuento() {
  if (carritoCO.descuento > carritoCO.subtotal) {
    $q.notify({
      type: 'warning',
      message: 'El descuento sobrepasa el subtotal.',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
    carritoCO.descuento = carritoCO.subtotal // Ajustar descuento al subtotal máximo divisa Proforma
  }
  calcularTotalesCarrito()
}

function resetProductoInputs() {
  selectedProduct.value = null
  cantidaddisponibleCO.value = ''
  cantidadCO.value = 1
  precioCO.value = 1
  idstockCO.value = ''
  idporcentajeCO.value = ''
  idproductoalmacenCO.value = ''
}

// --- Envío de Datos ---

async function enviarDatos() {
  modalmetodopago.value = false
  const isValid = await cotizacionFormRef.value.validate()
  if (!isValid) {
    $q.notify({
      type: 'info',
      message: 'Por favor, complete todos los campos requeridos.',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
    return
  }
  //localStorage
  const isValidCliente = await formClientes.value.validate()
  if (!isValidCliente) {
    $q.notify({
      type: 'info',
      message: 'Por favor, complete todos los campos requeridos.',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
    return
  }

  if (carritoCO.listaProductos.length === 0) {
    $q.notify({
      type: 'info',
      message: 'Debe añadir al menos un producto a la cotización.',
      actions: [{ icon: 'close', color: 'white', round: true }],
    })
    return
  }

  carritoCO.tipoOperacion = tipoOperacion.value?.value

  console.log(carritoCO)
  console.log(pagosDivididos.value)
  if (pagosDivididos.value.length > 0) {
    console.log('entro')
    carritoCO.pagosDivididos = pagosDivididos.value
    carritoCO.variablePago = 'dividido'
  } else {
    console.log('entro')
    carritoCO.variablePago = 'dividido'
    const pago = {
      metodoPago: metodoPago.value,
      monto: carritoCO.ventatotal,
      porcentaje: 100,
    }
    carritoCO.pagosDivididos.push(pago)
  }
  // ref([{ metodoPago: null, monto: 0, porcentaje: 0 }])
  const datosFormulario = new FormData()
  datosFormulario.append('ver', 'registrarCotizacion')
  datosFormulario.append('filtroALmacen', filtroAlmacenCO.value)
  datosFormulario.append('filtroCategoria', filtroCategoriaCO.value)
  datosFormulario.append('idcliente', idclienteCO.value)
  datosFormulario.append('idsucursal', idsucursalCOS.value)
  datosFormulario.append('listaProductos', JSON.stringify(carritoCO)) // Enviar el objeto completo del carrito
  datosFormulario.append('tipo_operacion', tipoOperacion.value?.value) // Añadir el tipo de operación

  $q.loading.show({
    message: 'Registrando cotización...',
  })
  try {
    // Asumo que tu backend espera 'listaProductos' como un JSON string.
    datosFormulario.forEach((valor, clave) => console.log(`${clave}: ${valor}`))
    const datosJson = {}
    datosFormulario.forEach((valor, clave) => {
      datosJson[clave] = valor
    })
    console.log(JSON.stringify(datosJson, null, 2))
    const response = await api.post(``, datosFormulario)
    const data = response.data
    console.log('Datos recibidos:', response.data)

    if (data.estado === 'exito') {
      resetFormulario()
      $q.notify({
        type: 'positive',
        message: 'Cotización realizada exitosamente.',
      })
      cotizacionFormRef.value.resetValidation() // Resetear validación

      $q.dialog({
        title: 'Cotización Exitosa',
        message: 'Su comprobante está listo. ¿Desea verlo?',
        cancel: true,
        persistent: true,
      }).onOk(() => {
        generarComprobante(data.id)
      })
    } else {
      $q.notify({
        type: 'negative',
        message: data.mensaje || 'Error al registrar la cotización.',
      })
    }
  } catch (error) {
    console.error('Error al realizar la solicitud:', error)
    $q.notify({
      type: 'negative',
      message: 'Hubo un error de conexión o en el servidor.',
    })
  } finally {
    $q.loading.hide()
  }
}

function resetFormulario() {
  // Limpiar campos del formulario
  filtroAlmacenCO.value = null // Se reestablecerá por la lógica de listaAlmacenes
  filtroCategoriaCO.value = null
  idclienteCO.value = ''
  selectedClient.value = null
  idsucursalCOS.value = ''
  selectedSucursal.value = null
  resetProductoInputs()

  // Limpiar carrito
  carritoCO.ventatotal = 0
  carritoCO.subtotal = 0
  carritoCO.descuento = 0
  carritoCO.listaProductos = []
  localStorage.removeItem('carritoCO')
  carritoCO.metodoPago = 0
  carritoCO.pagosDivididos = []
  pagosDivididos.value = []

  // Recargar listas dependientes si es necesario
  listaAlmacenes()
  listaCLientes()
}

// --- Comprobante ---
// async function enviarCorreo(id) {
//   console.log(id)
// }
function open(pos, idcot, data) {
  position.value = pos
  dialog.value = true
  idcliente.value = idcot
  detallesCotizacion.value = data
  console.log(idcliente.value, detallesCotizacion.value)

  return new Promise((resolve) => {
    resolver = resolve
  })
}
async function generarComprobante(id) {
  // Después que el usuario confirma el primer diálogo

  const contenidousuario = await getUserData()
  const idempresa = contenidousuario?.empresa?.idempresa
  console.log(idempresa)
  if (!idempresa) {
    $q.notify({
      type: 'negative',
      message: 'Error: No se pudo obtener la empresa para el comprobante.',
    })
    return
  }

  $q.loading.show({
    message: 'Generando comprobante...',
  })

  try {
    const response = await api.get(`detallesCotizacion/${id}/${idempresa}`)
    const data = response.data
    console.log('Comprobante Data:', response)

    if (data[0] === 'error') {
      console.error(data.error)
      $q.notify({ type: 'negative', message: 'Error al cargar los detalles del comprobante.' })
    } else {
      // Cargar leyendas si no están cargadas
      if (leyendasCotizacion.value.length === 0) {
        await cargarLeyendasCotizacion()
      }
      const doc = generarPdfCotizacion(data)
      pdfData.value = doc.output('dataurlstring')
      mostrarModal.value = true
      console.log(data[0]?.cliente.idcliente, data)
      open('right', data[0]?.cliente.idcliente, data)
    }
  } catch (error) {
    console.error('Error al generar comprobante:', error)
    $q.notify({ type: 'negative', message: 'Hubo un error al generar el comprobante.' })
  } finally {
    $q.loading.hide()
  }
}
const confirmar = (idcliente, data) => {
  resolver?.(true)
  //JSON.parse(JSON.stringify(detalleVenta.value))
  const detalle = JSON.parse(JSON.stringify(data))
  console.log('Confirmado', idcliente, detalle)
  PDFenviarComprobanteCorreo(idcliente, detalle, $q)
  dialog.value = false
}

const cancelar = () => {
  resolver?.(false)
  dialog.value = false
  console.log('Cancelado')
}

// --- registrar Cliente ---

const RegistrarCliente = () => {
  console.log(variablePago.value)
  showAddModal.value = !showAddModal.value
}
const handleRecordCreated = async (newRecordData) => {
  // newRecordData is already the plain object, not a ref, so no .value here
  const formData = objectToFormData(newRecordData) // Use newRecordData directly

  for (let [k, v] of formData.entries()) {
    // Good practice to disable eslint for console.log in production
    console.log(`${k}: ${v}`)
  }

  try {
    const response = await api.post(``, formData) // Replace `/your-api-endpoint` with your actual API endpoint

    // Access response.data directly, not response.value
    console.log(response.data)

    if (response.data.estado === 'exito') {
      listaCLientes()
      RegistrarCliente()
      $q.notify({
        type: 'positive',
        message: response.data.mensaje || 'Cliente guardado correctamente',
      })
      // Optionally, refresh your data or add the new client to your list
      // For example, if you have a method to fetch clients:
      // fetchClients();
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.mensaje || 'Hubo un problema al guardar el cliente',
      })
    }
  } catch (error) {
    console.error('Error submitting form:', error)

    $q.notify({
      color: 'negative',
      message:
        'Error al registrar: ' +
        (error.response?.data?.mensaje || error.message || 'Error desconocido'),
      icon: 'error',
    })
  }
}

watch(
  () => variablePago.value,
  (nuevoValor) => {
    console.log(nuevoValor)
    if (nuevoValor === 'directo') {
      // Limpiar los datos de pago dividido
      pagosDivididos.value = []
      remainingAmount.value = 0
      totalPaidAmount.value = 0
    } else if (nuevoValor === 'dividido') {
      // Limpiar el método de pago único
      metodoPago.value = null
    }
  },
)

// --- Inicialización ---
onMounted(async () => {
  localStorage.removeItem('carritoCO') // Limpiar localStorage al inicio
  // Cargar datos iniciales
  await divisaEmonedaActiva()
  await leyendaActiva() // Aunque no se use directamente, la lógica original la carga.
  await listaAlmacenes()
  await listaCLientes()
  await listaProductosDisponibles() // Cargar productos inicialmente
  await cargarLeyendasCotizacion() // Cargar leyendas para el comprobante
  await cargarMetodoPagoFactura()
  calcularTotalesCarrito() // Recalcular si hay carrito guardado en localStorage
})
</script>

<style lang="scss" scoped>
/* Puedes mover tus estilos relacionados con el comprobante y otros aquí */
.invoice {
  font-family: 'Arial', sans-serif;
  font-size: 12px;
  color: #333;

  header {
    padding: 10px 0;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;

    .company-details {
      text-align: left;
    }

    .name p {
      font-weight: bold;
      margin-bottom: 5px;
    }

    .col {
      display: inline-block;
      vertical-align: top;
      width: 32%; /* Adjust as needed */
    }

    .col:nth-child(2) {
      text-align: center;
    }

    .col:nth-child(3) {
      text-align: right;
    }
  }

  main {
    padding-bottom: 50px;

    .contacts {
      margin-bottom: 20px;

      .invoice-to,
      .invoice-details {
        display: inline-block;
        vertical-align: top;
        width: 49%;
      }

      .invoice-to {
        text-align: left;
      }

      .invoice-details {
        text-align: right;
      }

      .text-gray-light {
        color: #777;
      }

      .to {
        font-weight: bold;
      }
    }

    .q-table {
      width: 100%;
      border-collapse: collapse;
      thead {
        background-color: #e0e0e0;
        th {
          padding: 8px;
          border: 1px solid #ddd;
          text-align: left;
        }
      }
      tbody {
        td {
          padding: 8px;
          border: 1px solid #ddd;
        }
      }
      tfoot {
        td {
          padding: 8px;
          border: 1px solid #ddd;
          font-weight: bold;
        }
      }
    }

    .notices {
      margin-top: 20px;
      font-size: 0.9em;
      color: #555;
    }
  }
}
</style>

<style scoped>
.dialog-card {
  width: 400px; /* Un poco más de ancho para mejor legibilidad */
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* Asegura que el gradiente se vea bien en los bordes */
}

.header-gradient {
  background: linear-gradient(to right, #219286, #044e49);
}

.text-h6 {
  font-family: 'Roboto', sans-serif;
  letter-spacing: 0.5px;
}

.text-body1 {
  font-family: 'Open Sans', sans-serif;
  line-height: 1.6;
}

.button-primary {
  background: linear-gradient(to right, #219286, #044e49);
  color: white;
  font-weight: 500;
  letter-spacing: 0.5px;
  padding: 8px 20px;
  border-radius: 6px;
}

.q-btn:hover:not(.disabled) {
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

/* Color de acento para el icono de confirmación */
.q-icon[name='check_circle'] {
  color: #f2c037; /* Color de acento */
}

/* Quitar el q-linear-progress si no es funcional aquí, o darle un propósito */
/* .q-linear-progress { display: none; } */
</style>

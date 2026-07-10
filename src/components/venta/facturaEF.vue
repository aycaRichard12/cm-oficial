<template>
  <q-page class="q-ma-lg">
    <div class="forms">
      <div style="display: flex; justify-content: space-between">
        <div class="col-12 col-sm-4">
          <q-btn
            label="Volver"
            icon="arrow_back"
            color="primary"
            size="sm"
            @click="$emit('volver')"
            class="q-mr-sm"
          />
          <!-- <q-btn label="Inicio" icon="home" color="primary" size="sm" @click="handleContinue" /> -->
        </div>
        <div class="col-12 col-sm-8 text-center">
          <h4 class="q-ma-none" style="font-size: 20px">
            <q-icon name="receipt" color="primary" class="q-mr-sm" />
            FACTURA ENTIDADES-FINANCIERAS
          </h4>
        </div>
        <div></div>
      </div>

      <q-form @submit="onSubmit" class="q-gutter-md">
        <q-card class="q-mb-md">
          <q-card-section>
            <h5 class="q-my-sm text-primary" style="font-size: 15px">
              <q-icon name="person" color="primary" class="q-mr-sm" />
              Datos del Cliente y Fecha
            </h5>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <label for="cliente">Cliente*</label>
                <q-select
                  v-model="formData.cliente"
                  id="cliente"
                  :options="filteredClients"
                  option-label="label"
                  option-value="value"
                  use-input
                  emit-value
                  map-options
                  dense
                  outlined
                  @filter="filterClientes"
                  @update:model-value="actualizarSucursales"
                  :rules="[(val) => !!val || 'Seleccione un cliente']"
                  clearable
                >
                  <template v-slot:prepend>
                    <q-icon name="person_search" color="blue" />
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey"> No hay resultados </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <div class="col-12 col-md-4">
                <label for="sucursal">Sucursal*</label>
                <q-select
                  v-model="formData.sucursal"
                  id="sucursal"
                  :options="branchOptions"
                  option-label="label"
                  option-value="value"
                  dense
                  outlined
                  :disable="!formData.cliente"
                  required
                >
                  <template v-slot:prepend>
                    <q-icon name="location_on" color="blue" />
                  </template>
                </q-select>
              </div>

              <div class="col-12 col-md-4">
                <label for="puntoventa">Punto de venta*</label>
                <q-select
                  v-model="formData.puntoventa"
                  id="puntoventa"
                  dense
                  outlined
                  :options="puntosVenta"
                  option-label="label"
                  option-value="value"
                  :rules="[(val) => !!val || 'Seleccione un canal']"
                >
                  <template v-slot:prepend>
                    <q-icon name="store" color="blue" />
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-4">
                <label for="canalVenta">Canal de venta*</label>
                <q-select
                  v-model="formData.canal"
                  id="canalVenta"
                  dense
                  outlined
                  :options="salesChannels"
                  option-label="label"
                  option-value="value"
                  required
                  :rules="[(val) => !!val || 'Seleccione un canal']"
                >
                  <template v-slot:prepend>
                    <q-icon name="point_of_sale" color="blue" />
                  </template>
                </q-select>
              </div>

              <div class="col-12 col-md-4 q-mt-lg">
                <q-btn color="blue" icon="person_add" @click="RegistrarCliente"> </q-btn>
              </div>
            </div>

            <!-- Sección de Datos Automáticos (No Editables) -->
            <div class="q-mt-md q-pa-md bg-grey-2 rounded-borders border-blue-grey-2 shadow-1">
              <div class="text-subtitle2 text-primary q-mb-sm flex items-center">
                <q-icon name="auto_fix_high" class="q-mr-sm" />
                Información de Facturación (Automática)
              </div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <div class="text-caption text-grey-8">Tipo de documento tributario*</div>
                  <div class="text-subtitle2 text-weight-bold flex items-center font-size-10">
                    <q-icon name="description" color="blue" class="q-mr-sm" size="20px" />
                    {{ formData.tipodoc?.label || '---' }}
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="text-caption text-grey-8">Nro. documento tributario*</div>
                  <div class="text-subtitle2 text-weight-bold flex items-center">
                    <q-icon name="numbers" color="blue" class="q-mr-sm" size="20px" />
                    {{ formData.nroDoc || '---' }}
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="text-caption text-grey-8">Fecha*</div>
                  <div class="text-subtitle2 text-weight-bold flex items-center">
                    <q-icon name="event" color="blue" class="q-mr-sm" size="20px" />
                    {{ cambiarFormatoFecha(formData.fecha) || '---' }}
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="q-mb-md">
          <q-card-section>
            <h5 class="q-my-sm text-primary" style="font-size: 15px">
              <q-icon name="credit_card" color="primary" class="q-mr-sm" />
              Método de Pago
            </h5>
            <div class="q-gutter-sm q-mb-md">
              <q-radio
                v-model="formData.variablePago"
                val="directo"
                color="green"
                label="Pago Único"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_money" color="green" />
                </template>
              </q-radio>
              <q-radio
                v-model="formData.variablePago"
                val="dividido"
                label="Método de Pago Dividido"
              >
                <template v-slot:prepend>
                  <q-icon name="money_off" color="orange" />
                </template>
              </q-radio>
            </div>

            <q-separator spaced="md" />

            <div v-if="formData.variablePago === 'directo'" class="row q-col-gutter-md q-pt-md">
              <div class="col-12 col-md-4">
                <label for="metodopago">Método de pago*</label>
                <q-select
                  v-model="formData.metodoPago"
                  id="metodopago"
                  dense
                  outlined
                  :options="metodoPago"
                  option-label="label"
                  option-value="value"
                  :rules="[(val) => !!val || 'Seleccione un canal']"
                >
                  <template v-slot:prepend>
                    <q-icon name="payments" color="green" />
                  </template>
                </q-select>
              </div>
            </div>

            <div v-else-if="formData.variablePago === 'dividido'" class="q-pt-md">
              <div
                v-for="(payment, index) in formData.pagosDivididos"
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
                    :options="metodoPago"
                    option-label="label"
                    option-value="value"
                    :rules="[(val) => !!val || 'Seleccione un metodoPago']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="payments" color="green" />
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-md-3">
                  <label for="monto">{{ 'Monto' + ' (' + divisaActiva.simbolo + ')' }}</label>
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
                    <template v-slot:prepend>
                      <q-icon name="monetization_on" color="green" />
                    </template>
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
                    <template v-slot:prepend>
                      <q-icon name="percent" color="green" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-2 text-right">
                  <q-btn
                    v-if="formData.pagosDivididos.length > 1"
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
              <div class="q-mt-lg">
                <p class="text-subtitle1">
                  <q-icon name="calculate" color="primary" class="q-mr-sm" />
                  <strong>Total Pagado:</strong> {{ totalPaidAmount.toFixed(2) }}
                  {{ divisaActiva.simbolo }}
                </p>
                <p class="text-subtitle1">
                  <q-icon name="pending_actions" color="orange" class="q-mr-sm" />
                  <strong>Restante por Pagar:</strong> {{ remainingAmount.toFixed(2) }}
                  {{ divisaActiva.simbolo }}
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
          </q-card-section>
        </q-card>

        <q-card class="q-mb-md">
          <q-card-section>
            <h5 class="q-my-sm text-primary" style="font-size: 15px">
              <q-icon name="schedule" color="purple" class="q-mr-sm" />
              Condiciones de Crédito
            </h5>
            <div class="col-12 q-mb-md">
              <q-toggle
                v-model="formData.credito"
                label="¿A crédito?"
                left-label
                @update:model-value="toggleCredit"
              >
                <template v-slot:prepend>
                  <q-icon name="credit_score" color="purple" />
                </template>
              </q-toggle>
            </div>

            <div v-if="formData.credito" class="row q-col-gutter-md q-pt-md">
              <div class="col-12 col-md-4">
                <label for="cantidadpagos">Cantidad de pagos*</label>
                <q-input
                  v-model="formData.cantidadPagos"
                  id="cantidadpagos"
                  type="number"
                  min="0"
                  required
                  dense
                  outlined
                  @update:model-value="calculatePayments"
                  :rules="[(val) => !!val || 'Campo Obligatorio']"
                >
                  <template v-slot:prepend>
                    <q-icon name="format_list_numbered" color="purple" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <label for="montopago">Monto de pagos*</label>
                <q-input
                  v-model="formData.montoPagos"
                  id="montopago"
                  dense
                  outlined
                  :disable="!formData.credito"
                >
                  <template v-slot:prepend>
                    <q-icon name="paid" color="purple" />
                  </template>
                  <template v-slot:append>
                    <q-btn flat :label="divisaActiva.simbolo" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <label for="periodo">Período establecido*</label>
                <q-select
                  v-model="formData.periodo"
                  id="periodo"
                  dense
                  outlined
                  :options="periodOptions"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  required
                  @update:model-value="calculateDueDate"
                >
                  <template v-slot:prepend>
                    <q-icon name="calendar_today" color="purple" />
                  </template>
                </q-select>
              </div>

              <div v-if="formData.periodo === 0" class="col-12 col-md-4">
                <label for="plazopersonalizada">Plazo total (días)*</label>
                <q-input
                  v-model="formData.plazoPersonalizado"
                  id="plazopersonalizada"
                  type="number"
                  min="0"
                  dense
                  outlined
                  required
                  @update:model-value="calculateDueDate"
                  :rules="[(val) => !!val || 'Campo Obligatorio']"
                >
                  <template v-slot:prepend>
                    <q-icon name="edit_calendar" color="purple" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <div class="text-caption text-grey-8">Fecha límite*</div>
                <div class="text-subtitle2 text-weight-bold flex items-center">
                  <q-icon name="event_available" color="purple" class="q-mr-sm" size="20px" />
                  {{ formData.fechaLimite ? cambiarFormatoFecha(formData.fechaLimite) : '---' }}
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <div class="row q-col-gutter-md">
          <div class="col-12 text-right">
            <q-btn label="Registrar" type="submit" color="primary" icon="save" />
          </div>
        </div>
      </q-form>
    </div>
  </q-page>
  <q-dialog v-model="showAddModal">
    <MyRegistrationForm @recordCreated="handleRecordCreated" />
  </q-dialog>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { defineEmits } from 'vue'
import { useCurrencyStore, useCurrencyLeyenda } from 'src/stores/currencyStore'
import MyRegistrationForm from '../clientes/admin/modalClienteForm.vue'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import { obtenerHoraISO8601, decimas } from 'src/composables/FuncionesG'
import { cambiarFormatoFecha } from 'src/composables/FuncionesG'
const divisaActiva = useCurrencyStore()
const leyendaActiva = useCurrencyLeyenda()
const tipoCambio = ref(1)
leyendaActiva.cargarLeyendaActivo()

// console.log(divisaActiva)
// console.log(leyendaActiva)
// ====================== CONSTANTES Y UTILIDADES ======================
const ERROR_TYPES = {
  QUASAR: 'QUASAR_NOT_AVAILABLE',
  API: 'API_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTH_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
}

const docunmentTypesMap = {
  1: 'CI - CÉDULA DE IDENTIDAD',
  2: 'CEX - CÉDULA DE IDENTIDAD DE EXTRANJERO',
  3: 'PAS - PASAPORTE',
  4: 'OD - OTRO DOCUMENTO DE IDENTIDAD',
  5: 'NIT - NÚMERO DE IDENTIFICACIÓN TRIBUTARIA',
}
const correoPredeterminado = 'factura@yofinanciero.com'

const CONSTANTES = {
  ver: 'registroVenta',
  idusuario: idusuario_md5(),
  idempresa: idempresa_md5(),
  tipoventa: 15,
  tipopago: 'contado',
}
const showAddModal = ref(false)
// ====================== QUASAR ======================
const $q = useQuasar()
if (!$q) {
  console.error('Error: Quasar no está disponible')
  throw new Error('Quasar instance not found')
}

// ====================== ESTADO REACTIVO ======================
const errorLog = ref([])
const formData = ref({
  variablePago: 'directo',
  cliente: null,
  sucursal: null,
  fecha: new Date().toISOString().slice(0, 10),
  canal: null,
  credito: false,
  tipopago: 'contado',
  metodoPago: null,
  puntoventa: null,
  cantidadPagos: 0,
  montoPagos: 0,
  periodo: null,
  plazoPersonalizado: 0,
  fechaLimite: '',
  nroDoc: '',
  idcanal: null,
  tipodoc: null,
  // tipoDocumento: null,
  // numeroDocumento: '',
  pagosDivididos: [
    { metodoPago: null, monto: 0, porcentaje: 0 }, // Initial split payment method credito numeroDocumento
  ],
})
const formatear = (valor) => Number(parseFloat(valor).toFixed(2))
async function crearFormularioFacturaCompraVenta() {
  try {
    const contenidousuario = validarUsuario()
    const usuario = contenidousuario[0]?.usuario
    const datos = JSON.parse(localStorage.getItem('carrito'))
    console.log(divisaActiva.divisa)
    const formulario = {
      numeroFactura: '',
      codigoTipoDocumentoIdentidad: 0,
      numeroDocumento: 0,
      nombreRazonSocial: '',
      codigoCliente: '',
      codigoMetodoPago: 0,
      montoTotal: formatear(datos.ventatotal),
      montoTotalSujetoIva: formatear(datos.ventatotal),
      codigoMoneda: divisaActiva.divisa.codigosin,
      montoTotalMoneda: formatear(datos.ventatotal),
      tipoCambio: tipoCambio.value,
      montoTotalArrendamientoFinanciero: 0,
      usuario: usuario,
      emailCliente: correoPredeterminado,
      descuentoAdicional: formatear(datos.descuento),
      extras: {
        uniqueCode: '',
        facturaTicket: '',
      },
      detalles: datos.listaProductosFactura,
      codigoPuntoVenta: 0,
      fechaEmision: '',
      cafc: '',
      codigoExcepcion: '',
      montoGiftCard: 0,

      complemento: '',
      periodoFacturado: '',
      codigoLeyenda: leyendaActiva.leyenda.codigosin,

      numeroTarjeta: '',

      telefonoCliente: 0,
    }
    datos.listaFactura = formulario

    localStorage.setItem('carrito', JSON.stringify(datos))
  } catch (error) {
    console.error('Error al obtener datos:', error)
  }
}
const clients = ref([])
const branches = ref([])
const salesChannels = ref([])
const metodoPago = ref([])
const puntosVenta = ref([])
const typeDoc = ref([])
const periodOptions = [
  { label: 'Personalizado', value: 0 },
  { label: '15 días', value: 15 },
  { label: '30 días', value: 30 },
  { label: '60 días', value: 60 },
  { label: '90 días', value: 90 },
]
const filteredClients = ref([]) // This will hold the clients currently displayed in the q-select (this is the one that gets updated by filterClientes)

// ====================== COMPUTED ======================
const filterClientes = (val, update) => {
  // <--- Needs 'update' argument!
  // val: The current text typed in the q-select input
  // update: The function to call to update the q-select's options

  // Always call update. The filtering logic goes inside its callback api
  update(() => {
    const needle = val ? val.toLowerCase().trim() : ''

    if (val === '') {
      // If input is empty, show all clients from the original list
      filteredClients.value = clients.value
    } else {
      // Filter the original `clients.value` array based on the needle
      filteredClients.value = clients.value.filter((client) => {
        const clientLabel = (client.label ?? '').toLowerCase().trim()
        const clientNombreComercial = (client.nombrecomercial ?? '').toLowerCase().trim()

        return clientLabel.includes(needle) || clientNombreComercial.includes(needle)
      })
    }
  })
}

const branchOptions = computed(() => {
  return formData.value.cliente ? branches.value : []
})
const typeDocOptions = computed(() => {
  return typeDoc.value || []
})
console.log(typeDocOptions.value)
// ======================== TIpo de pago combinado =================
const totalSaleAmount = computed(() => {
  const cartData = JSON.parse(localStorage.getItem('carrito') || '{}')
  if (cartData && cartData.ventatotal) {
    return parseFloat(cartData.ventatotal)
  }
  return 0
})

const totalPaidAmount = computed(() => {
  if (formData.value.variablePago === 'dividido') {
    return formData.value.pagosDivididos.reduce(
      (sum, payment) => sum + parseFloat(payment.monto || 0),
      0,
    )
  }
  return 0 // Not applicable for direct payment or credit for this specific calculation
})

const remainingAmount = computed(() => {
  // Only calculate remaining if it's a divided payment type
  if (formData.value.variablePago === 'dividido') {
    return totalSaleAmount.value - totalPaidAmount.value
  }
  return 0 // Not relevant for direct or credit payment types
})

// ====================== FUNCIONES ======================

const validarUsuario = () => {
  const user = JSON.parse(localStorage.getItem('mistersofts-cm'))
  return user || (window.location.href = '../app')
}

const cargarCanales = async () => {
  try {
    const respuesta = await validarUsuario()
    const idempresa = respuesta[0]?.empresa?.idempresa
    const response = await api.get(`listaCanalVentaActivos/${idempresa}`)
    salesChannels.value = response.data.map((item) => ({
      label: item.canal,
      value: item.id,
    }))
  } catch (error) {
    console.error('Error cargando canales:', error)
  }
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
    metodoPago.value = filtrado.map((item) => ({
      label: item.nombre,
      id: item.metodopagosin.codigo,
      value: item.id,
    }))
    formData.value.metodoPago = metodoPago.value[0] || null
  } catch (error) {
    console.error('Error cargando canales:', error)
  }
}

const listaCLientes = async () => {
  try {
    const response = await validarUsuario()
    const idempresa = response[0]?.empresa?.idempresa

    if (idempresa) {
      const { data } = await api.get(`listaCliente/${idempresa}`)
      clients.value = data.map((cliente) => ({
        label: `${cliente.codigo} - ${cliente.nombre} - ${cliente.nit}`,
        value: cliente.id,
        originalData: cliente,
      }))

      console.log(data)
    }
  } catch (error) {
    showError('Error al cargar clientes', error)
  }
}
const cargarPuntoVentas = async () => {
  try {
    const response = await validarUsuario()
    const idusuario = response[0]?.idusuario

    if (idusuario) {
      const { data } = await api.get(`listaPuntoVentaFactura/${idusuario}`)
      console.log(data)
      const idalmacen = JSON.parse(localStorage.getItem('carrito')).idalmacen
      console.log()
      if (data.estado == 'error') {
        console.log(data.error)
      } else {
        const filtrados = data.datos.filter((u) => u.idalmacen == idalmacen)
        console.log(filtrados)
        puntosVenta.value = filtrados.map((item) => ({
          label: item.nombre,
          value: item.codigosin,
          Data: item,
        }))
        formData.value.puntoventa = puntosVenta.value[0]
        console.log(puntosVenta.value)
      }
    }
  } catch (error) {
    showError('Error al cargar clientes', error)
  }
}
const actualizarSucursales = async (clientId) => {
  console.log('actualizarSucursales clientId:', clientId)
  if (!clientId) {
    branches.value = []
    formData.value.sucursal = null
    return
  }
  try {
    const { data } = await api.get(`listaSucursal/${clientId}`)
    branches.value = data.map((sucursal) => ({
      label: sucursal.nombre,
      value: sucursal.id,
      clientId: clientId,
    }))

    // Buscar el objeto cliente completo para cargar sus datos
    const clientObj = clients.value.find((c) => c.value == clientId)
    if (clientObj) {
      cargarDatosCliente(clientObj)
    }

    formData.value.sucursal = branches.value[0] || null
  } catch (error) {
    showError('Error al cargar sucursales', error)
  }
}
const cargarDatosCliente = (client) => {
  console.log('cargarDatosCliente client:', client)
  const datos = JSON.parse(localStorage.getItem('carrito'))
  if (!client || !client.originalData) return

  formData.value.nroDoc = client.originalData.nit
  formData.value.canal = salesChannels.value.find(
    (u) => Number(u.value) === Number(client.originalData.idcanal),
  )

  typeDoc.value = [
    {
      value: client.originalData.tipodocumento,
      label: docunmentTypesMap[client.originalData.tipodocumento] || 'Desconocido',
    },
  ]
  formData.value.tipodoc = typeDoc.value[0] || null

  if (datos) {
    datos.listaFactura.nombreRazonSocial = client.originalData.nombre
    datos.listaFactura.codigoCliente = client.originalData.codigo
    datos.listaFactura.numeroDocumento = client.originalData.nit
    datos.listaFactura.codigoTipoDocumentoIdentidad = client.originalData.tipodocumento
    datos.listaFactura.telefonoCliente = client.originalData.telefono
    datos.listaFactura.codigoPuntoVenta = formData.value.puntoventa?.value || 0
    datos.listaFactura.codigoMetodoPago = formData.value.metodoPago?.id || 0
    localStorage.setItem('carrito', JSON.stringify(datos))
  }
}
const toggleCredit = (value) => {
  if (!value) {
    formData.value.cantidadPagos = 0
    formData.value.montoPagos = 0
    formData.value.periodo = null
    formData.value.plazoPersonalizado = 0
    formData.value.fechaLimite = ''
  }
}

const calculatePayments = () => {
  // This calculates payment amount per installment for credit sales
  if (formData.value.credito && formData.value.cantidadPagos > 0 && totalSaleAmount.value > 0) {
    formData.value.montoPagos = (totalSaleAmount.value / formData.value.cantidadPagos).toFixed(2)
  } else {
    formData.value.montoPagos = 0
  }
}

const calculateDueDate = () => {
  if (!formData.value.credito || !formData.value.fecha) return

  const fecha = new Date(formData.value.fecha)
  let daysToAdd = 0

  // Ensure periodo is a number for comparison
  const selectedPeriod = Number(formData.value.periodo)

  if (selectedPeriod === 0) {
    // Personalizado
    daysToAdd = Number(formData.value.plazoPersonalizado) || 0
  } else if (selectedPeriod > 0) {
    daysToAdd = selectedPeriod * formData.value.cantidadPagos // e.g., 15 days * num payments canal
  }

  if (daysToAdd > 0) {
    fecha.setDate(fecha.getDate() + daysToAdd)
    formData.value.fechaLimite = fecha.toISOString().slice(0, 10)
  } else {
    formData.value.fechaLimite = ''
  }
}
const emit = defineEmits(['venta-registrada'])

const addPaymentMethod = () => {
  formData.value.pagosDivididos.push({ metodoPago: null, monto: 0, porcentaje: 0 })
}

const removePaymentMethod = (index) => {
  formData.value.pagosDivididos.splice(index, 1)
}

const calculateAmountFromPercentage = (index) => {
  console.log(index)
  const payment = formData.value.pagosDivididos[index]
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
  const payment = formData.value.pagosDivididos[index]
  console.log(payment)
  const monto = parseFloat(payment.monto) || 0
  if (monto >= 0 && monto <= totalSaleAmount.value && totalSaleAmount.value > 0) {
    payment.porcentaje = ((monto * 100) / totalSaleAmount.value).toFixed(2)
  } else {
    payment.porcentaje = 0
  }
}
console.log('periodOptions:', periodOptions)

// Inside your component methods or setup()
// You can add a watcher for debugging:
watch(
  () => formData.value.periodo,
  (newVal, oldVal) => {
    console.log('formData.periodo changed from', oldVal, 'to', newVal)
    console.log('Type of formData.periodo:', typeof newVal)
    console.log('Condition `formData.periodo === 0` is:', newVal === 0)
  },
)

// Or inside your calculateDueDate method:

watch(
  () => formData.value.variablePago,
  (newVal) => {
    if (newVal === 'directo') {
      formData.value.pagosDivididos = [{ metodoPago: null, monto: 0, porcentaje: 0 }]
    } else if (newVal === 'dividido') {
      // Clear direct payment data when 'dividido' is selected canal
      formData.value.metodoPago = null
    }
  },
)
const onSubmit = async () => {
  let loadingShown = false
  try {
    console.log('Submitting form with data:', formData.value)
    const cartData = JSON.parse(localStorage.getItem('carrito') || '{}')
    const {
      cliente,
      nroDoc,
      tipodoc,
      puntoventa,
      metodoPago,
      sucursal,
      fecha,
      canal,
      pagosDivididos = [],
      credito,
      variablePago,
      cantidadPagos,
      fechaLimite,
      montoPagos,
      periodo,
      plazoPersonalizado,
    } = formData.value

    if (!cliente) throw { message: 'Debe seleccionar un cliente' }
    if (!sucursal || !sucursal.value) throw { message: 'Debe seleccionar una sucursal válida' }
    if (!fecha) throw { message: 'Debe seleccionar una fecha válida' }
    if ((!metodoPago || !metodoPago.value) && pagosDivididos.length === 0)
      throw { message: 'Debe seleccionar un metodoPago de venta válido' }
    if (!cartData.listaProductos || !cartData.listaProductos.length) {
      throw { message: 'El carrito está vacío' }
    }

    const suma_pagos_divididos = decimas(
      pagosDivididos.reduce((sum, dato) => {
        return sum + parseFloat(dato.monto)
      }, 0),
    )

    if (
      decimas(suma_pagos_divididos) !== decimas(cartData.ventatotal) &&
      variablePago !== 'directo'
    ) {
      throw { message: 'Los pagos no coinciden con el monto total' }
    }
    $q.loading.show({ message: 'Procesando venta...', timeout: 30000 })
    loadingShown = true
    console.log(puntoventa)
    //Preparar formulario para envío
    variablePago !== 'directo'
      ? (cartData.pagosDivididos = pagosDivididos)
      : (cartData.pagosDivididos = [
          { metodoPago: metodoPago, monto: cartData.ventatotal, porcentaje: 100 },
        ])
    cartData.variablePago = 'dividido'
    cartData.nropagos = cantidadPagos
    cartData.fechalimite = fechaLimite
    cartData.valorpagos = montoPagos
    cartData.dias = periodo

    cartData.puntoVenta = Number(puntoventa.Data.idpuntoventa)
    cartData.puntoVentaSin = puntoventa.value
    cartData.idleyenda = leyendaActiva.leyenda.id
    cartData.listaFactura.fechaEmision = obtenerHoraISO8601()
    console.log(metodoPago?.id)
    cartData.listaFactura.codigoMetodoPago = metodoPago?.id
    const form = new FormData()
    form.append('ver', CONSTANTES.ver)
    form.append('tipoventa', CONSTANTES.tipoventa)
    form.append('idusuario', CONSTANTES.idusuario)
    form.append('idempresa', CONSTANTES.idempresa)
    form.append('idcliente', cliente)
    form.append('sucursal', sucursal.value)
    form.append('tipodoc', tipodoc.value)
    form.append('nrodoc', nroDoc)
    form.append('fecha', fecha)
    form.append('puntoventa', puntoventa.value)
    if ((!metodoPago || metodoPago.value == null) && pagosDivididos.length > 0) {
      form.append('metodoPago', 0)
    } else {
      form.append('metodoPago', metodoPago?.id)
    }
    form.append('canal', canal.value)
    form.append('tipopago', credito ? 'credito' : CONSTANTES.tipopago)
    form.append('periodopersonalizado', plazoPersonalizado)
    form.append('jsonDetalles', JSON.stringify(cartData))

    const jsonObject = Object.fromEntries(form.entries())

    jsonObject['jsonDetalles'] = cartData
    const json = Object.fromEntries(form.entries())
    json.jsonDetalles = cartData
    //  Enviar al backend
    console.log('Datos enviados al backend:', jsonObject)

    const response = await api.post('', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    // const response = {
    //   data: {
    //     estado: 'exito',
    //     datosFactura: {
    //       urlEmizor: 'https://example.com/factura.pdf',
    //     },
    //   },
    // }

    console.log('Respuesta de la API:', response)
    if (!response.data || response.data.estado !== 'exito') {
      throw { message: response.data?.mensaje || 'Error al procesar la venta', response }
    }

    //  Éxito
    if (
      response &&
      response.data &&
      response.data.datosFactura &&
      response.data.datosFactura.urlEmizor
    ) {
      // Si la URL existe, procede con el diálogo
      $q.dialog({
        title: 'Venta Exitosa',
        message: 'Su Factura está listo. ¿Desea verlo?',
        cancel: true,
        persistent: true,
      }).onOk(() => {
        // La URL es segura de usar aquí
        window.open(response.data.datosFactura.urlEmizor, '_blank', 'noopener,noreferrer')
      })
    } else {
      $q.dialog({
        title: 'Venta Exitosa',
        message: 'La factura se generó correctamente.',
      })
    }
    emit('venta-registrada')
    resetForm()
  } catch (error) {
    // 🧠 Registro de errores variablPeago
    const errorType = error.type || ERROR_TYPES.API
    const loggedError = logError(errorType, error, {
      formData: JSON.parse(JSON.stringify(formData.value)),
      action: 'onSubmit',
      timestamp: new Date().toISOString(),
    })

    // 🚨 Notificación al usuario
    $q.notify({
      type: 'negative',
      message: getEnhancedErrorMessage(loggedError),
      timeout: 10000,
      actions: [
        {
          label: 'Detalles',
          handler: () => showDetailedErrorDialog(loggedError),
        },
      ],
    })

    // 🔎 También mostrar en consola para debugging
    console.error('Error en onSubmit:', loggedError)
  } finally {
    if (loadingShown) $q.loading.hide()
  }
}

// ====================== MANEJO DE ERRORES ======================
const getEnhancedErrorMessage = (error) => {
  return error.details
    ? `${error.message}: ${JSON.stringify(error.details)}`
    : error.message || 'Ocurrió un error al procesar la venta'
}

const showDetailedErrorDialog = (error) => {
  if (!$q.dialog) {
    console.warn('Dialog plugin no está disponible')
    console.log(error)
    return
  }
  console.log(resetForm())

  $q.dialog({
    title: 'Detalles del error',
    message: `
      <div>
        <p><strong>Tipo:</strong> ${error.type}</p>
        <p><strong>Mensaje:</strong> ${error.message}</p>
        ${error.details ? `<p><strong>Detalles:</strong> ${JSON.stringify(error.details)}</p>` : ''}
        ${error.code ? `<p><strong>Código:</strong> ${error.code}</p>` : ''}
      </div>
    `,
    html: true,
    persistent: true,
  })
}

const showError = (message, error) => {
  console.error(message, error)
  $q.notify({
    type: 'negative',
    message: `${message}: ${error.message || 'Error desconocido'}`,
  })
}

const logError = (type, error, context = {}) => {
  const errorEntry = {
    timestamp: new Date().toISOString(),
    type,
    message: error.message || 'Error desconocido',
    stack: error.stack,
    context,
    code: error.code || error.response?.status,
  }

  errorLog.value.push(errorEntry)
  console.error(`[${type}]`, errorEntry)
  return errorEntry
}

// ====================== UTILIDADES ======================
const resetForm = () => {
  formData.value = {
    variablePago: 'directo',
    cliente: null,
    sucursal: null,
    fecha: new Date().toISOString().slice(0, 10),
    canal: null,
    credito: false,
    tipopago: 'contado',
    metodoPago: null,
    puntoventa: null,
    cantidadPagos: 0,
    montoPagos: 0,
    periodo: null,
    plazoPersonalizado: 0,
    fechaLimite: '',
    nroDoc: '',
    idcanal: null,
    tipodoc: null,
    pagosDivididos: [{ metodoPago: null, monto: 0, porcentaje: 0 }],
  }
  localStorage.removeItem('carrito')
}

// const handleContinue = () => {
//   emit('continuar') // Esto activará el toggle en el padre
// }
//=======================Cliente ====================
const RegistrarCliente = () => {
  showAddModal.value = !showAddModal.value
}
const handleRecordCreated = async (newRecordData) => {
  // newRecordData is already the plain object, not a ref, so no .value here
  const formData = objectToFormData(newRecordData) // Use newRecordData directly

  for (let [k, v] of formData.entries()) {
    // Good practice to disable eslint for console.log in production emailCliente
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
// ====================== HOOKS ====================== formData despachado

onMounted(() => {
  listaCLientes()
  cargarCanales()
  cargarMetodoPagoFactura()
  cargarPuntoVentas()
  crearFormularioFacturaCompraVenta()
})
</script>

<style scoped>
/* Estilo para el fallback de loading */
.quasar-loading-fallback {
  position: relative;
  pointer-events: none;
}

.quasar-loading-fallback::after {
  content: 'Procesando...';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1.5rem;
  z-index: 9999;
}
</style>

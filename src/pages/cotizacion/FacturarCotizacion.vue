<template>
  <q-page class="q-pa-lg bg-white">
    <q-form @submit="onSubmit" class="q-gutter-y-lg">
      <q-card-section>
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
              map-options
              @filter="filterClientes"
              @update:model-value="actualizarSucursales"
              :rules="[(val) => !!val || 'Campo obligatorio']"
              clearable
              outlined
              dense
              bg-color="white"
              color="accent-color"
              label-color="grey-7"
            >
              <template v-slot:prepend>
                <q-icon name="person_search" color="accent-color" />
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
              :disable="!formData.cliente"
              outlined
              dense
              bg-color="white"
              color="accent-color"
              label-color="grey-7"
            >
              <template v-slot:prepend>
                <q-icon name="location_on" color="accent-color" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-4">
            <q-btn
              outline
              color="accent-color"
              text-color="dark"
              icon="person_add"
              label="Nuevo Cliente"
              @click="RegistrarCliente"
              class="full-width q-py-sm"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <label for="tipodoc">Tipo de documento*</label>
            <q-select
              v-model="formData.tipodoc"
              id="tipodoc"
              :options="typeDocOptions"
              option-label="label"
              option-value="value"
              :disable="!formData.cliente"
              outlined
              dense
              bg-color="white"
              color="accent-color"
              label-color="grey-7"
            />
          </div>
          <div class="col-12 col-md-4">
            <label for="numDoc">Número de documento*</label>
            <q-input
              v-model="formData.nroDoc"
              id="numDoc"
              type="number"
              :rules="[(val) => !!val || 'Campo obligatorio']"
              :disable="!formData.cliente"
              outlined
              dense
              bg-color="white"
              color="accent-color"
              label-color="grey-7"
            />
          </div>
          <div class="col-12 col-md-4">
            <label for="fecha">Fecha*</label>
            <q-input
              v-model="formData.fecha"
              id="fecha"
              type="date"
              outlined
              dense
              bg-color="white"
              color="accent-color"
              label-color="grey-7"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <label for="puntoventa">Punto de venta*</label>
            <q-select
              v-model="formData.puntoventa"
              id="puntoventa"
              :options="puntosVenta"
              option-label="label"
              option-value="value"
              outlined
              dense
              bg-color="white"
              color="accent-color"
              label-color="grey-7"
            />
          </div>
          <div class="col-12 col-md-6">
            <label for="canalventa">Canal de venta*</label>
            <q-select
              v-model="formData.canal"
              id="canalventa"
              :options="salesChannels"
              option-label="label"
              option-value="value"
              outlined
              dense
              bg-color="white"
              color="accent-color"
              label-color="grey-7"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="q-gutter-sm q-mb-md">
          <q-radio
            v-model="formData.variablePago"
            val="directo"
            color="primary-green"
            label="Pago Único"
          />
          <q-radio
            v-model="formData.variablePago"
            val="dividido"
            label="Pago Dividido"
            color="primary-green"
          />
        </div>

        <div v-if="formData.variablePago === 'directo'">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <label for="metodopago">Método de pago*</label>
              <q-select
                v-model="formData.metodoPago"
                id="metodopago"
                :options="metodoPago"
                option-label="label"
                option-value="value"
                outlined
                dense
                color="accent-color"
                label-color="grey-7"
              />
            </div>
          </div>
        </div>

        <div v-else-if="formData.variablePago === 'dividido'">
          <div
            v-for="(payment, index) in formData.pagosDivididos"
            :key="index"
            class="row q-col-gutter-md q-mb-sm items-center"
          >
            <div class="col-12 col-md-5">
              <label for="metodopagouno">Método de pago*</label>
              <q-select
                v-model="payment.metodoPago"
                label="metodopagouno"
                :options="metodoPago"
                option-label="label"
                option-value="value"
                outlined
                dense
                bg-color="white"
                color="accent-color"
                label-color="grey-7"
              />
            </div>
            <div class="col-12 col-md-3">
              <label for="monto">Monto ( {{ divisaActiva.simbolo }} )</label>
              <q-input
                id="monto"
                v-model="payment.monto"
                type="number"
                min="0"
                step="0.01"
                outlined
                dense
                bg-color="white"
                color="accent-color"
                label-color="grey-7"
                @update:model-value="calculateRemainingAmount(index)"
              />
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
                outlined
                dense
                bg-color="white"
                color="accent-color"
                label-color="grey-7"
                @update:model-value="calculateAmountFromPercentage(index)"
              />
            </div>
            <div class="col-12 col-md-1 text-right">
              <q-btn
                v-if="formData.pagosDivididos.length > 1"
                icon="delete"
                color="negative"
                flat
                round
                dense
                @click="removePaymentMethod(index)"
              />
            </div>
          </div>

          <q-btn
            outline
            color="accent-color"
            text-color="dark"
            icon="add"
            label="Agregar Método"
            @click="addPaymentMethod"
            class="q-mt-sm"
          />

          <div class="q-mt-lg bg-grey-1 q-pa-md rounded-borders border-grey">
            <div class="row items-center">
              <div class="col-6 text-subtitle1 text-grey-8">Total Pagado:</div>
              <div class="col-6 text-right text-subtitle1 text-weight-medium text-primary-dark">
                {{ totalPaidAmount.toFixed(2) }} {{ divisaActiva.simbolo }}
              </div>
            </div>
            <div class="row items-center">
              <div class="col-6 text-subtitle1 text-grey-8">Restante por Pagar:</div>
              <div
                class="col-6 text-right text-subtitle1"
                :class="remainingAmount !== 0 ? 'text-negative' : 'text-primary-green'"
              >
                {{ remainingAmount.toFixed(2) }} {{ divisaActiva.simbolo }}
              </div>
            </div>

            <q-banner v-if="remainingAmount !== 0" dense class="bg-warning text-white q-mt-sm">
              El monto total pagado no coincide con la venta total.
            </q-banner>
          </div>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row items-center q-mb-md">
          <q-toggle
            v-model="formData.credito"
            label="¿A crédito?"
            color="primary-green"
            left-label
            @update:model-value="toggleCredit"
          />
        </div>

        <div v-if="formData.credito" class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <label for="cuota">Cuotas*</label>
            <q-input
              v-model="formData.cantidadPagos"
              id="cuota"
              type="number"
              min="0"
              outlined
              dense
              bg-color="white"
              color="accent-color"
              label-color="grey-7"
              @update:model-value="calculatePayments"
            />
          </div>

          <div class="col-12 col-md-4">
            <label for="montocuota">Monto por cuota*</label>
            <q-input
              v-model="formData.montoPagos"
              id="montocuota"
              :disable="!formData.credito"
              outlined
              dense
              bg-color="white"
              color="accent-color"
              label-color="grey-7"
            >
              <template v-slot:append>
                <div class="text-caption text-grey-8">
                  {{ divisaActiva.simbolo }}
                </div>
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-4">
            <label for="periodicidad">Periodicidad*</label>
            <q-select
              v-model="formData.periodo"
              id="periodicidad"
              :options="periodOptions"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              outlined
              dense
              bg-color="white"
              color="accent-color"
              label-color="grey-7"
              @update:model-value="calculateDueDate"
            />
          </div>

          <div v-if="formData.periodo === 0" class="col-12 col-md-4">
            <label for="plazodias">Plazo (días)*</label>
            <q-input
              v-model="formData.plazoPersonalizado"
              id="plazodias"
              type="number"
              min="0"
              outlined
              dense
              bg-color="white"
              color="accent-color"
              label-color="grey-7"
              @update:model-value="calculateDueDate"
            />
          </div>

          <div class="col-12 col-md-4">
            <label for="fechalimite">Fecha Límite*</label>
            <q-input
              v-model="formData.fechaLimite"
              label="fechalimite"
              type="date"
              outlined
              dense
              bg-color="white"
              color="accent-color"
              label-color="grey-7"
              readonly
            />
          </div>
        </div>
      </q-card-section>

      <div class="row justify-end q-mt-lg q-col-gutter-md">
        <div class="col-auto">
          <q-btn
            label="Registrar Factura"
            type="submit"
            class="button-primary q-px-lg"
            icon="save"
            unelevated
          />
        </div>
      </div>
    </q-form>

    <q-dialog v-model="showAddModal">
      <MyRegistrationForm @recordCreated="handleRecordCreated" />
    </q-dialog>
  </q-page>
</template>

<style scoped>
/* Fuentes */
.q-page {
  font-family: 'Roboto', sans-serif;
  color: #333;
}

/* Colores personalizados */
.header-gradient {
  background: linear-gradient(to right, #219286, #044e49);
}

.text-primary-dark {
  color: #044e49;
}

.primary-green {
  color: #219286;
}

.accent-color {
  color: #f2c037;
}

.button-primary {
  background: linear-gradient(to right, #219286, #044e49);
  color: white;
  font-weight: 500;
}

/* Estilos de la tarjeta */
.card-section {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.text-subtitle1 {
  letter-spacing: 0.5px;
}

/* Estilos de los inputs */
.q-field--outlined.q-field--focused .q-field__control {
  border-color: #219286 !important;
}

/* Efecto hover para botones */
.q-btn:hover:not(.disabled) {
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

/* Ajustes responsivos */
@media (max-width: 600px) {
  .q-card {
    margin-left: 0px;
    margin-right: 0px;
    border-radius: 0;
  }

  .header-gradient {
    border-radius: 0;
    text-align: center !important;
  }
}
</style>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { defineEmits } from 'vue'
import { useCurrencyStore, useCurrencyLeyenda } from 'src/stores/currencyStore'
import MyRegistrationForm from 'src/components/clientes/admin/modalClienteForm.vue'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import { obtenerHoraISO8601, decimas, redondear } from 'src/composables/FuncionesG'

const divisaActiva = useCurrencyStore()
const leyendaActiva = useCurrencyLeyenda()
leyendaActiva.cargarLeyendaActivo()
const props = defineProps({
  cotizacion: Object,
})

const cotizacion = props?.cotizacion
console.log(cotizacion)
const codigosinsucursal = ref([])
// ====================== CONSTANTES Y UTILIDADES ======================
const ERROR_TYPES = {
  QUASAR: 'QUASAR_NOT_AVAILABLE',
  API: 'API_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTH_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
}
const correoPredeterminado = 'factura@yofinanciero.com'

const CONSTANTES = {
  ver: 'facturar',
  idusuario: idusuario_md5(),
  idempresa: idempresa_md5(),
  tipoventa: 1,
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
  pagosDivididos: [
    { metodoPago: null, monto: 0, porcentaje: 0 }, // Initial split payment method
  ],
})

async function crearFormularioFacturaCompraVenta() {
  try {
    const contenidousuario = validarUsuario()
    const usuario = contenidousuario[0]?.usuario

    const datos = JSON.parse(localStorage.getItem('carrito'))
    const formulario = {
      numeroFactura: '',
      nombreRazonSocial: '',
      codigoPuntoVenta: 0,
      fechaEmision: '',
      cafc: '',
      codigoExcepcion: '',
      descuentoAdicional: datos.descuento,
      montoGiftCard: 0,
      codigoTipoDocumentoIdentidad: 0,
      numeroDocumento: 0,
      complemento: '',
      codigoCliente: '',
      periodoFacturado: '',
      codigoMetodoPago: 0,
      numeroTarjeta: '',
      montoTotal: datos.ventatotal,
      codigoMoneda: divisaActiva.divisa.codigosin,
      montoTotalMoneda: datos.ventatotal,
      usuario: usuario,
      emailCliente: correoPredeterminado,
      telefonoCliente: 0,
      extras: {
        facturaTicket: '',
      },
      montoTotalSujetoIva: datos.ventatotal,
      tipoCambio: 1,
      detalles: datos.listaProductosFactura,
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
const filteredClients = ref([])

// ====================== COMPUTED ======================
const filterClientes = (val, update) => {
  update(() => {
    const needle = val ? val.toLowerCase().trim() : ''

    if (val === '') {
      filteredClients.value = clients.value
    } else {
      filteredClients.value = clients.value.filter((client) => {
        const clientLabel = (client.label ?? '').toLowerCase().trim()
        const clientNombreComercial = (client.nombrecomercial ?? '').toLowerCase().trim()

        return clientLabel.includes(needle) || clientNombreComercial.includes(needle)
      })
    }
  })
}

const branchOptions = computed(() => {
  return formData.value.cliente
    ? branches.value.filter((b) => b.clientId === formData.value.cliente.value)
    : []
})
const typeDocOptions = computed(() => {
  return typeDoc.value || []
})

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
  return 0
})

const remainingAmount = computed(() => {
  if (formData.value.variablePago === 'dividido') {
    return totalSaleAmount.value - totalPaidAmount.value
  }
  return 0
})

// ====================== FUNCIONES ======================
const validarUsuario = () => {
  const user = JSON.parse(localStorage.getItem('yofinanciero'))
  return user || (window.location.href = '../app')
}

const cargarCanales = async () => {
  try {
    const respuesta = await validarUsuario()
    const idempresa = respuesta[0]?.empresa?.idempresa
    const response = await api.get(`listaCanalVenta/${idempresa}`)
    console.log(response)
    salesChannels.value = response.data.map((item) => ({
      label: item.canal,
      value: item.id,
    }))
  } catch (error) {
    console.error('Error cargando canales:', error)
  }
}
async function cargarAlmacenes(cotizacion) {
  console.log(cotizacion)
  const idalmacenCotizacion = cotizacion[0].almacen.idalmacen
  try {
    const endpoint = `/listaResponsableAlmacen/${CONSTANTES.idempresa}`
    const { data } = await api.get(endpoint)

    if (data[0] === 'error') throw new Error(data.error || 'Error al cargar almacenes')
    console.log(data)
    codigosinsucursal.value = data.find(
      (item) =>
        item.idusuario == CONSTANTES.idusuario &&
        Number(item.idalmacen) === Number(idalmacenCotizacion),
    )
    console.log(codigosinsucursal.value)
  } catch (error) {
    console.error('Error al cargar almacenes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar los almacenes disponibles',
    })
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
    metodoPago.value = filtrado.map((item) => ({
      label: item.nombre,
      value: item.metodopagosin.codigo,
    }))
    formData.value.metodoPago = metodoPago.value[0] || null
  } catch (error) {
    console.error('Error cargando métodos de pago:', error)
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
      const idcliente = cotizacion[0].cliente.idcliente
      const clienteSeleccionado = clients.value.find((c) => Number(c.value) === Number(idcliente))
      console.log(clienteSeleccionado)
      if (clienteSeleccionado) {
        formData.value.cliente = clienteSeleccionado
        // Opcional: actualizar sucursales si es parte del flujo
        actualizarSucursales(clienteSeleccionado)
      }
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
      const response = await api.get(`listaPuntoVentaFactura/${idusuario}`)
      const data = response.data
      console.log(data)
      const idalmacen = cotizacion[0].almacen.idalmacen
      console.log(cotizacion[0].cotizacion)
      if (data.estado == 'error') {
        console.log(data.error)
      } else {
        const filtrados = data.datos.filter((u) => Number(u.idalmacen) === Number(idalmacen))
        puntosVenta.value = filtrados.map((item) => ({
          label: item.nombre,
          value: item.codigosin,
          Data: item,
        }))
        formData.value.puntoventa = puntosVenta.value[0]
      }
    }
  } catch (error) {
    showError('Error al cargar puntos de venta', error)
  }
}

const actualizarSucursales = async (cliente) => {
  console.log(cliente)
  if (!cliente) return
  try {
    const { data } = await api.get(`listaSucursal/${cliente.value}`)
    branches.value = data.map((sucursal) => ({
      label: sucursal.nombre,
      value: sucursal.id,
      clientId: cliente.value,
    }))

    const sucursalSeleccionado = branches.value.find(
      (c) => Number(c.clientId) === Number(cliente.value),
    )
    if (sucursalSeleccionado) {
      formData.value.sucursal = sucursalSeleccionado
      // Opcional: actualizar sucursales si es parte del flujo
    }
    cargarDatosCliente(cliente)
  } catch (error) {
    showError('Error al cargar sucursales', error)
  }
}

const cargarDatosCliente = (client) => {
  console.log(client)
  const datos = JSON.parse(localStorage.getItem('carrito'))
  console.log(datos)
  console.log(formData.value)
  formData.value.nroDoc = client.originalData.nit
  formData.value.canal = salesChannels.value.filter(
    (u) => u.value == Number(client.originalData.idcanal),
  )[0]
  console.log(formData.value.canal)

  typeDoc.value = [
    {
      value: client.originalData.tipodocumento,
      label: client.originalData.textotipodocumento,
    },
  ]
  formData.value.tipodoc = typeDoc.value[0] || null
  console.log(typeDoc.value)
  console.log(client.originalData.nombre)
  console.log(client.originalData.codigo)
  console.log(client.originalData.nit)
  console.log(client.originalData.tipodocumento)
  console.log(client.originalData.telefono)
  console.log(datos)
  if (datos) {
    console.log(datos)
    datos.listaFactura.nombreRazonSocial = client.originalData.nombre
    console.log(datos.listaFactura.nombreRazonSocial)
    datos.listaFactura.codigoCliente = client.originalData.codigo
    console.log(datos.listaFactura.codigoCliente)

    datos.listaFactura.numeroDocumento = client.originalData.nit
    console.log(datos.listaFactura.numeroDocumento)

    datos.listaFactura.codigoTipoDocumentoIdentidad = client.originalData.tipodocumento
    console.log(datos.listaFactura.codigoTipoDocumentoIdentidad)

    datos.listaFactura.telefonoCliente = client.originalData.telefono
    console.log(datos.listaFactura.telefonoCliente)

    datos.listaFactura.codigoPuntoVenta = formData.value.puntoventa.value
    console.log(datos.listaFactura.codigoPuntoVenta)

    console.log(formData.value.metodoPago.value)

    datos.listaFactura.codigoMetodoPago = formData.value.metodoPago.value
    console.log(formData.value)
    console.log(datos.listaFactura.codigoMetodoPago)

    console.log(datos.listaFactura.codigoCliente)
    localStorage.setItem('carrito', JSON.stringify(datos))
  }
  console.log(datos.listaFactura)
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

  const selectedPeriod = Number(formData.value.periodo)

  if (selectedPeriod === 0) {
    daysToAdd = Number(formData.value.plazoPersonalizado) || 0
  } else if (selectedPeriod > 0) {
    daysToAdd = selectedPeriod * formData.value.cantidadPagos
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
  const payment = formData.value.pagosDivididos[index]
  const percentage = parseFloat(payment.porcentaje) || 0
  if (percentage >= 0 && percentage <= 100 && totalSaleAmount.value > 0) {
    payment.monto = (totalSaleAmount.value * (percentage / 100)).toFixed(2)
  } else {
    payment.monto = 0
  }
}

const calculateRemainingAmount = (index) => {
  const payment = formData.value.pagosDivididos[index]
  const monto = parseFloat(payment.monto) || 0
  if (monto >= 0 && monto <= totalSaleAmount.value && totalSaleAmount.value > 0) {
    payment.porcentaje = ((monto * 100) / totalSaleAmount.value).toFixed(2)
  } else {
    payment.porcentaje = 0
  }
}

watch(
  () => formData.value.variablePago,
  (newVal) => {
    if (newVal === 'directo') {
      formData.value.pagosDivididos = [{ metodoPago: null, monto: 0, porcentaje: 0 }]
    } else if (newVal === 'dividido') {
      formData.value.metodoPago = null
    }
  },
)

const onSubmit = async () => {
  let loadingShown = false
  const almacen = codigosinsucursal.value
  const sucursales = almacen ? almacen.sucursales : []
  const codigoSin = sucursales.length > 0 ? sucursales[0].codigosin : null
  console.log(codigoSin)
  try {
    const cartData = JSON.parse(localStorage.getItem('carrito') || '{}')
    console.log(cartData)
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

    //Validaciones previas
    if (!cliente) throw { message: 'Debe seleccionar un cliente' }
    if (!sucursal || !sucursal.value) throw { message: 'Debe seleccionar una sucursal válida' }
    if (!fecha) throw { message: 'Debe seleccionar una fecha válida' }
    if ((!metodoPago || !metodoPago.value) && pagosDivididos.length === 0)
      throw { message: 'Debe seleccionar un metodo de pago válido' }
    if (!cartData.listaProductos || !cartData.listaProductos.length) {
      throw { message: 'El carrito está vacío' }
    }
    console.log(metodoPago)

    $q.loading.show({ message: 'Procesando venta...', timeout: 30000 })
    loadingShown = true

    //     elseif ($ver == "registroCotizacion_enVenta") {
    //     $controlador = new UseCotizacion();
    //     $controlador->registroCotizacion_enVenta($_POST['idcotizacion'],$_POST['fecha'], $_POST['tipoventa'], $_POST['tipopago'],$_POST['idcliente'], $_POST['idsucursal'],$_POST['canalventa'],$_POST['idempresa'],$_POST['idusuario'],$_POST['jsonDetalle']);
    // }
    //Preparar formulario para envío
    variablePago !== 'directo'
      ? (cartData.pagosDivididos = pagosDivididos)
      : (cartData.pagosDivididos = [])

    cartData.variablePago = variablePago
    cartData.nropagos = cantidadPagos
    cartData.fechalimite = fechaLimite
    cartData.valorpagos = montoPagos
    cartData.dias = periodo
    console.log(puntoventa)
    cartData.puntoVenta = Number(puntoventa.Data.idpuntoventa)
    cartData.puntoVentaSin = puntoventa.value
    cartData.listaFactura.fechaEmision = obtenerHoraISO8601()
    cartData.listaFactura.codigoMetodoPago = metodoPago.value
    cartData.codigosinsucursal = codigoSin

    const form = new FormData()
    form.append('ver', CONSTANTES.ver)
    form.append('idcotizacion', cotizacion[0].cotizacion.id)
    form.append('tipoventa', CONSTANTES.tipoventa)
    form.append('idusuario', CONSTANTES.idusuario)
    form.append('idempresa', CONSTANTES.idempresa)
    form.append('idcliente', cliente.value)
    form.append('idsucursal', sucursal.value)
    form.append('tipodoc', tipodoc.value)
    form.append('nrodoc', nroDoc)
    form.append('fecha', fecha)
    form.append('puntoventa', puntoventa.value)
    if ((!metodoPago || metodoPago.value == null) && pagosDivididos.length > 0) {
      form.append('metodoPago', 0)
      form.append('pagosDivididos', JSON.stringify(pagosDivididos))
    } else {
      form.append('metodoPago', metodoPago?.value || 0)
    }
    console.log(canal.value)
    form.append('canalventa', canal.value)
    form.append('tipopago', credito ? 'credito' : CONSTANTES.tipopago)
    form.append('periodopersonalizado', plazoPersonalizado)
    form.append('jsonDetalle', JSON.stringify(cartData))
    const jsonObject = Object.fromEntries(form.entries())

    jsonObject['jsonDetalles'] = cartData
    const json = Object.fromEntries(form.entries())
    json.jsonDetalles = cartData
    console.log('Datos a enviar al API:', jsonObject)
    //  Enviar al backend
    const response = await api.post('', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    console.log('Respuesta del API:', response.data)
    window.open(response.data.datosFactura.urlEmizor, '_blank', 'noopener,noreferrer')

    if (!response.data || response.data.estado !== 'exito') {
      throw { message: response.data?.mensaje || 'Error al procesar la venta', response }
    }

    //  Éxito
    $q.notify({ type: 'positive', message: 'Venta registrada con éxito' })
    emit('venta-registrada')
    resetForm()
  } catch (error) {
    const errorType = error.type || ERROR_TYPES.API
    const loggedError = logError(errorType, error, {
      formData: JSON.parse(JSON.stringify(formData.value)),
      action: 'onSubmit',
      timestamp: new Date().toISOString(),
    })

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
    return
  }

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
    cliente: null,
    sucursal: null,
    fecha: new Date().toISOString().slice(0, 10),
    canal: null,
    credito: false,
    cantidadPagos: 0,
    montoPagos: 0,
    periodo: null,
    plazoPersonalizado: 0,
    fechaLimite: '',
    tipoDocumento: null,
    nroDoc: '',
    variablePago: 'directo',
    metodoPago: null,
    puntoventa: null,
    idcanal: null,
    tipodoc: null,
    pagosDivididos: [{ metodoPago: null, monto: 0, porcentaje: 0 }],
  }
  localStorage.removeItem('carrito')
}

//=======================Cliente ====================
const RegistrarCliente = () => {
  showAddModal.value = !showAddModal.value
}

const handleRecordCreated = async (newRecordData) => {
  const formData = objectToFormData(newRecordData)

  try {
    const response = await api.post(``, formData)

    if (response.data.estado === 'exito') {
      listaCLientes()
      RegistrarCliente()
      $q.notify({
        type: 'positive',
        message: response.data.mensaje || 'Cliente guardado correctamente',
      })
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

async function crearCarritoVenta() {
  try {
    const contenidousuario = validarUsuario()
    const token = contenidousuario[0]?.factura?.access_token
    const tipo = contenidousuario[0]?.factura?.tipo

    // Verificar que currencyStore.divisa esté cargado
    if (!divisaActiva.divisa) {
      console.error('Divisa no está definida en currencyStore')
      return
    }

    // Obtener datos existentes o crear estructura inicial
    const carritoExistente = JSON.parse(localStorage.getItem('carrito')) || {
      listaProductos: [],
      listaProductosFactura: [],
      listaFactura: {},
    }

    const datos = {
      ...carritoExistente,
      idalmacen: '',
      codigosinsucursal: null,
      token: token,
      tipo,
      iddivisa: divisaActiva.divisa.id || null, // Eliminado computed()
      idcampana: '',
      ventatotal: cotizacion[0].cotizacion.montototal,
      subtotal: '',
      descuento: cotizacion[0].cotizacion.descuento,
      nropagos: 0,
      valorpagos: 0,
      dias: 0,
      fechalimite: 0,
      pagosDivididos: [],
      variablePago: 'directo',
    }

    console.log('Guardando carritoDos:', datos)
    localStorage.setItem('carrito', JSON.stringify(datos))
    return true
  } catch (error) {
    console.error('Error al crear carritoDos:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al preparar datos de venta',
    })
    return false
  }
}

function cargarProductos(cotizacion) {
  console.log(cotizacion)
  const datos = JSON.parse(localStorage.getItem('carrito'))

  datos.idalmacen = cotizacion[0].almacen.idalmacen
  const producto = ''
  console.log(producto)
  cotizacion[0].detalle.map((producto) => {
    const nuevoProducto = {
      idproductoalmacen: producto.idproductoalmacen,
      cantidad: producto.cantidad,
      precio: producto.precio,
      idstock: producto.idstock,
      idporcentaje: producto.categoria,
      candiponible: producto.disponible,
      descripcion: producto.descripcion,
      codigo: producto.codigoProducto,
      id: producto.idproductoalmacen,
      subtotal: decimas(redondear(parseFloat(producto.cantidad) * parseFloat(producto.precio))),
      datosAdicionales: '',
      despachado: '',
    }
    datos.listaProductos.push(nuevoProducto)

    const nuevoProductoFactura = {
      codigoProducto: producto.codigoProducto,
      codigoActividadSin: producto.codigoActividadSin,
      codigoProductoSin: producto.codigoProductoSin,
      descripcion: producto.descripcion,
      unidadMedida: producto.unidadMedida,
      precioUnitario: producto.precio,
      subTotal: decimas(redondear(parseFloat(producto.cantidad) * parseFloat(producto.precio))),
      cantidad: producto.cantidad,
      numeroSerie: '',
      montoDescuento: 0,
      numeroImei: '',
      codigoNandina: producto.codigoNandina,
    }
    datos.listaProductosFactura.push(nuevoProductoFactura)
    datos.listaFactura.detalles.push(nuevoProductoFactura)
    // Actualiza el subtotal sumando los nuevos productos
    datos.subtotal = datos.listaProductos
      .reduce((subtotal, producto) => {
        const precio = parseFloat(producto.precio)
        const cantidad = parseFloat(producto.cantidad)
        return subtotal + precio * cantidad
      }, 0)
      .toFixed(2)

    // Calcula la ventatotal restando el descuento del subtotal
    datos.ventatotal = (
      parseFloat(datos.subtotal) - parseFloat(cotizacion[0].cotizacion.descuento)
    ).toFixed(2)
  })
  localStorage.setItem('carrito', JSON.stringify(datos))

  // Guarda los datos actualizados en el localStorage
  $q.notify({
    type: 'positive',
    message: 'Producto agregado al carrito',
  })
}
function eliminarCarrito() {
  // Elimina del localStorage
  localStorage.removeItem('carrito')
  // Notifica al usuario
}
// ====================== HOOKS ======================
onMounted(async () => {
  await eliminarCarrito()
  await crearCarritoVenta()
  await crearFormularioFacturaCompraVenta()
  await cargarCanales()
  await cargarMetodoPagoFactura()
  await cargarPuntoVentas()
  await listaCLientes()
  await cargarProductos(cotizacion)
  await cargarAlmacenes(cotizacion)
})
</script>

<template>
  <q-page class="q-ma-lg">
    <div class="forms">
      <div style="display: flex; justify-content: space-between" class="q-mb-md">
        <div class="col-12 col-sm-4">
          <q-btn
            :label="$t('ui.volver-84a715')"
            icon="arrow_back"
            color="primary"
            size="sm"
            @click="$emit('volver')"
            class="q-mr-sm"
          />
          <q-btn :label="$t('ui.inicio-4f70d8')" icon="home" color="primary" size="sm" @click="handleContinue" />
        </div>
        <div class="col-12 col-sm-8 text-center">
          <h4 class="q-ma-none text-primary" style="font-size: 20px">
            <q-icon name="receipt" color="primary" size="28px" class="q-mr-sm" />
            {{ $t('ui.comprobante-de-venta-1bda58') }}
          </h4>
        </div>
        <div></div>
      </div>

      <q-form @submit="onSubmit" class="q-gutter-md">
        <!-- Sección Cliente -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="section-header">
              <q-icon name="people" color="blue" size="24px" class="q-mr-sm" />
              <h5 class="q-my-sm text-primary" style="font-size: 15px">
                {{ $t('ui.datos-del-cliente-y-fecha-4d7fa0') }}
              </h5>
            </div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-select
                  v-model="formData.cliente"
                  :label="$t('ui.cliente-39ec2b')"
                  :options="filteredClients"
                  option-label="label"
                  option-value="value"
                  use-input
                  emit-value
                  map-options
                  @filter="filterClientes"
                  @update:model-value="actualizarSucursales"
                  :rules="[(val) => !!val || $t('ui.seleccione-un-cliente-f08b74')]"
                  clearable
                >
                  <template v-slot:prepend>
                    <q-icon name="person" color="blue" />
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey"> {{ $t('ui.no-hay-resultados-c83a44') }} </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:append>
                    <q-btn
                      icon="refresh"
                      flat
                      round
                      dense
                      color="primary"
                      @click.stop="listaCLientes"
                    >
                      <q-tooltip>{{ $t('ui.recargar-datos-3840f2') }}</q-tooltip>
                    </q-btn>
                  </template>
                </q-select>
              </div>

              <div class="col-12 col-md-4">
                <q-select
                  v-model="formData.sucursal"
                  :label="$t('ui.sucursal-80e67a')"
                  :options="branchOptions"
                  option-label="label"
                  option-value="value"
                  :disable="!formData.cliente"
                  required
                >
                  <template v-slot:prepend>
                    <q-icon name="location_on" color="blue" />
                  </template>
                </q-select>
              </div>

              <div class="col-12 col-md-4">
                <q-input v-model="formData.fecha" :label="$t('ui.fecha-659648')" type="date" required>
                  <template v-slot:prepend>
                    <q-icon name="event" color="blue" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-btn color="blue" icon="person_add" @click="RegistrarCliente" />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Sección Pago -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="section-header">
              <q-icon name="payments" color="green" size="24px" class="q-mr-sm" />
              <h5 class="q-my-sm text-primary" style="font-size: 15px">{{ $t('ui.metodo-de-pago-112f5f') }}</h5>
            </div>
            <div class="q-gutter-sm q-mb-md">
              <q-radio v-model="formData.variablePago" val="directo" :label="$t('ui.pago-unico-fc784b')">
                <template v-slot:default>
                  <div class="radio-with-icon">
                    <q-icon name="attach_money" color="green" class="q-mr-sm" />
                    <span>{{ $t('ui.pago-unico-fc784b') }}</span>
                  </div>
                </template>
              </q-radio>
              <q-radio
                v-model="formData.variablePago"
                val="dividido"
                :label="$t('ui.metodo-de-pago-dividido-71be36')"
              >
                <template v-slot:default>
                  <div class="radio-with-icon">
                    <q-icon name="splitscreen" color="green" class="q-mr-sm" />
                    <span>{{ $t('ui.pago-dividido-1f5506') }}</span>
                  </div>
                </template>
              </q-radio>
            </div>

            <q-separator spaced="md" />

            <div v-if="formData.variablePago === 'directo'" class="row q-col-gutter-md q-pt-md">
              <div class="col-12 col-md-4">
                <q-select
                  v-model="formData.canal"
                  :label="$t('ui.canal-de-venta-05df83')"
                  :options="salesChannels"
                  option-label="label"
                  option-value="value"
                  required
                  :rules="[(val) => !!val || $t('ui.seleccione-un-canal-ce32e2')]"
                >
                  <template v-slot:prepend>
                    <q-icon name="point_of_sale" color="green" />
                  </template>
                  <template v-slot:append>
                    <q-btn
                      icon="refresh"
                      flat
                      round
                      dense
                      color="primary"
                      @click.stop="cargarCanales"
                    >
                      <q-tooltip>{{ $t('ui.recargar-datos-3840f2') }}</q-tooltip>
                    </q-btn>
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
                  <q-select
                    v-model="payment.canal"
                    :label="$t('ui.canal-de-venta-5eeada')"
                    :options="salesChannels"
                    option-label="label"
                    option-value="value"
                    :rules="[(val) => !!val || $t('ui.seleccione-un-canal-ce32e2')]"
                  >
                    <template v-slot:prepend>
                      <q-icon name="payments" color="green" />
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-md-3">
                  <q-input
                    v-model="payment.monto"
                    :label="$t('ui.monto-835dcd') + ' (' + currencyStore.simbolo + ')'"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    @update:model-value="calculateRemainingAmount(index)"
                    :rules="[(val) => !!val || $t('ui.campo-obligatorio-f2e737')]"
                  >
                    <template v-slot:prepend>
                      <q-icon name="monetization_on" color="green" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-3">
                  <q-input
                    v-model="payment.porcentaje"
                    :label="$t('ui.porcentaje-452cef')"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    @update:model-value="calculateAmountFromPercentage(index)"
                    :rules="[(val) => !!val || $t('ui.campo-obligatorio-f2e737')]"
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
                :label="$t('ui.agregar-metodo-de-pago-ed8874')"
                icon="add"
                color="secondary"
                @click="addPaymentMethod"
                class="q-mt-md"
              />
              <div class="q-mt-lg payment-summary">
                <p class="text-subtitle1">
                  <q-icon name="summarize" color="green" class="q-mr-sm" />
                  <strong>{{ $t('ui.total-pagado-77d3ef') }}</strong> {{ totalPaidAmount.toFixed(2) }}
                  {{ currencyStore.simbolo }}
                </p>
                <p class="text-subtitle1">
                  <q-icon name="pending_actions" color="orange" class="q-mr-sm" />
                  <strong>{{ $t('ui.restante-por-pagar-a4c5d1') }}</strong> {{ remainingAmount.toFixed(2) }}
                  {{ currencyStore.simbolo }}
                </p>
                <q-banner
                  v-if="remainingAmount !== 0"
                  dense
                  rounded
                  class="bg-warning text-white q-mt-sm"
                  icon="warning"
                >
                  {{ $t('ui.el-monto-total-pagado-no-coincide-con-la-venta-total-e6063a') }}
                </q-banner>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Sección Caja / Banco (solo pagos al contado) -->
        <q-card v-if="!formData.credito" class="q-mb-md">
          <q-card-section>
            <h5 class="q-my-sm text-primary" style="font-size: 15px">
              <q-icon name="account_balance" color="positive" class="q-mr-sm" />
              {{ $t('ui.caja-banco-20adca') }}
            </h5>
            <div class="row q-col-gutter-md q-pt-sm">
              <div class="col-12 col-md-6">
                <label for="cajabanco">{{ $t('ui.caja-banco-de-cobro-abc4cf') }}</label>
                <q-select
                  v-model="formData.cajabanco"
                  id="cajabanco"
                  :options="listaCajaBancos"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  dense
                  outlined
                  :rules="[(val) => !!val || $t('ui.seleccione-una-caja-o-banco-venta-al-contado-7cd593')]"
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
                          <span class="text-weight-bolder cm-text">{{ scope.opt.codigo }}</span>
                        </q-item-label>
                        <q-item-label caption>{{ scope.opt.nombre }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:append>
                    <q-btn
                      round
                      dense
                      flat
                      icon="refresh"
                      color="primary"
                      @click.stop.prevent="cargarCajaBancos"
                    >
                      <q-tooltip>{{ $t('ui.recargar-caja-bancos-0e0534') }}</q-tooltip>
                    </q-btn>
                  </template>
                </q-select>
                <q-banner
                  v-if="!listaCajaBancos.length"
                  dense
                  rounded
                  class="bg-warning text-white q-mt-sm"
                >
                  {{ $t('ui.no-hay-cajas-bancos-disponibles-registre-una-o-pulse-ae7f5b') }}
                </q-banner>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Sección Crédito -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="section-header">
              <q-icon name="credit_card" color="purple" size="24px" class="q-mr-sm" />
              <h5 class="q-my-sm text-primary" style="font-size: 15px">{{ $t('ui.condiciones-de-credito-a7732e') }}</h5>
            </div>
            <div class="col-12 q-mb-md">
              <q-toggle
                v-model="formData.credito"
                :label="$t('ui.a-credito-8f24aa')"
                left-label
                @update:model-value="toggleCredit"
              >
                <template v-slot:default>
                  <div class="toggle-with-icon">
                    <q-icon name="credit_score" color="purple" class="q-mr-sm" />
                    <span>{{ $t('ui.a-credito-8f24aa') }}</span>
                  </div>
                </template>
              </q-toggle>
            </div>

            <div v-if="formData.credito" class="row q-col-gutter-md q-pt-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.cantidadPagos"
                  :label="$t('ui.cantidad-de-pagos-818e5b')"
                  type="number"
                  min="0"
                  required
                  @update:model-value="calculatePayments"
                  :rules="[(val) => !!val || $t('ui.campo-obligatorio-f2e737')]"
                >
                  <template v-slot:prepend>
                    <q-icon name="format_list_numbered" color="purple" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.montoPagos"
                  :label="$t('ui.monto-de-pagos-ecccae')"
                  :disable="!formData.credito"
                >
                  <template v-slot:prepend>
                    <q-icon name="paid" color="purple" />
                  </template>
                  <template v-slot:append>
                    <q-btn flat :label="currencyStore.simbolo" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <q-select
                  v-model="formData.periodo"
                  :label="$t('ui.periodo-establecido-9ac193')"
                  :options="periodOptions"
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  required
                  @update:model-value="calculateDueDate"
                  :rules="[(val) => !!val || $t('ui.campo-obligatorio-f2e737')]"
                >
                  <template v-slot:prepend>
                    <q-icon name="calendar_today" color="purple" />
                  </template>
                </q-select>
              </div>

              <div v-if="formData.periodo === 0" class="col-12 col-md-4">
                <q-input
                  v-model="formData.plazoPersonalizado"
                  :label="$t('ui.plazo-total-dias-e2bd00')"
                  type="number"
                  min="0"
                  required
                  @update:model-value="calculateDueDate"
                  :rules="[(val) => !!val || $t('ui.campo-obligatorio-f2e737')]"
                >
                  <template v-slot:prepend>
                    <q-icon name="edit_calendar" color="purple" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.fechaLimite"
                  :label="$t('ui.fecha-limite-b12a3b')"
                  type="date"
                  :disable="true"
                >
                  <template v-slot:prepend>
                    <q-icon name="event_available" color="purple" />
                  </template>
                </q-input>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <div class="row q-col-gutter-md">
          <div class="col-12 text-right">
            <q-btn :label="$t('ui.registrar-caacc6')" type="submit" color="primary" icon="save" />
          </div>
        </div>
      </q-form>
    </div>
    <q-dialog v-model="showAddModal">
      <MyRegistrationForm @recordCreated="handleRecordCreated" />
    </q-dialog>

    <modal-r v-model="mostrar" :title="$t('ui.factura-venta-7de2bf')" @close="cerrarModal">
      <iframe
        v-if="pdfData"
        :src="pdfData"
        style="width: 100%; height: 100%; border: none"
      ></iframe>
    </modal-r>
  </q-page>
  <div class="q-pa-md q-gutter-sm">
    <q-dialog v-model="dialog" :position="position" :id="idcliente" :data="detalleVenta">
      <q-card class="dialog-card">
        <q-card-section class="header-gradient q-pa-md text-white flex items-center"> <!-- theme-allow -->
          <q-icon name="check_circle" size="md" class="q-mr-sm" />
          <div class="text-h6 text-weight-bold">{{ $t('ui.confirmacion-de-envio-1c38ab') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-lg q-pb-md">
          <div class="text-body1 cm-text q-mb-sm">
            {{ $t('ui.la-factura-ha-sido-generado-correctamente-8e3c75') }}
          </div>
          <div class="text-body1 cm-text">
            {{ $t('ui.desea-enviarlo-al-correo-electronico-del-cliente-c7e49d') }}
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat :label="$t('common.cancel')" color="grey-7" @click="cancelar()" class="q-px-md" />
          <q-btn
            unelevated
            :label="$t('ui.enviar-comprobante-257989')"
            class="button-primary q-px-md"
            @click="confirmar(idcliente, detalleVenta)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { t as i18nT } from 'src/i18n/runtime'
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api, apiCt } from 'boot/axios'
import { idempresa_md5, idusuario_md5 } from 'src/composables/FuncionesGenerales'
import { defineEmits } from 'vue'
import { useCurrencyStore } from 'src/stores/currencyStore'
import MyRegistrationForm from '../clientes/admin/modalClienteForm.vue'
import { objectToFormData } from 'src/composables/FuncionesGenerales'
import ModalR from 'src/components/ModalR.vue'
import { PDFdetalleVentaInicio } from 'src/utils/pdfReportGenerator'
import { PDFenviarFacturaCorreoAlInicio } from 'src/utils/pdfReportGenerator'
const dialog = ref(false)
const position = ref('top')
const idcliente = ref('')
let resolver = null
const pdfData = ref(null)
const detalleVenta = ref([])
const currencyStore = useCurrencyStore()
// ====================== CONSTANTES Y UTILIDADES ======================
const ERROR_TYPES = {
  QUASAR: 'QUASAR_NOT_AVAILABLE',
  API: 'API_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTH_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
}

const CONSTANTES = {
  ver: 'registroVenta',
  idusuario: idusuario_md5(),
  idempresa: idempresa_md5(),
  tipoventa: 0,
  tipopago: 'contado',
}
const showAddModal = ref(false)
console.log(CONSTANTES)
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
  cajabanco: null,
  tipopago: 'contado',

  cantidadPagos: 0,
  montoPagos: 0,
  periodo: null,
  plazoPersonalizado: 0,
  fechaLimite: '',
  // tipoDocumento: null,
  // numeroDocumento: '',
  pagosDivididos: [
    { canal: null, monto: 0, porcentaje: 0 }, // Initial split payment method credito
  ],
})

const clients = ref([])
const branches = ref([])
const salesChannels = ref([])
const listaCajaBancos = ref([])

const periodOptions = [
  { label: i18nT('ui.personalizado-738665'), value: 0 },
  { label: i18nT('ui.15-dias-977c82'), value: 15 },
  { label: i18nT('ui.30-dias-7f2d58'), value: 30 },
  { label: i18nT('ui.60-dias-376f5a'), value: 60 },
  { label: i18nT('ui.90-dias-a64b09'), value: 90 },
]
const filteredClients = ref([]) // This will hold the clients currently displayed in the q-select (this is the one that gets updated by filterClientes)
const mostrar = ref(false)

// ====================== COMPUTED ======================
const filterClientes = (val, update) => {
  // <--- Needs 'update' argument!
  // val: The current text typed in the q-select input
  // update: The function to call to update the q-select's options

  // Always call update. The filtering logic goes inside its callback.
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
  return formData.value.cliente
    ? branches.value.filter((b) => b.clientId === formData.value.cliente.value)
    : []
})
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
  return user || (window.location.href = '/login')
}

const cargarCanales = async () => {
  try {
    const respuesta = await validarUsuario()
    const idempresa = respuesta[0]?.empresa?.idempresa
    const response = await api.get(`listaCanalVenta/${idempresa}`)
    salesChannels.value = response.data.map((item) => ({
      label: item.canal,
      value: item.id,
    }))
  } catch (error) {
    console.error('Error cargando canales:', error)
  }
}

const listaCLientes = async () => {
  try {
    const response = await validarUsuario()
    const idempresa = response[0]?.empresa?.idempresa

    if (idempresa) {
      const response = await api.get(`listaCliente/${idempresa}`)
      const data = response.data
      console.log(data)
      clients.value = data.map((cliente) => ({
        label: `${cliente.codigo} - ${cliente.nombre} - ${cliente.nit}`,
        value: cliente.id,
        originalData: cliente,
      }))
    }
  } catch (error) {
    showError(i18nT('ui.error-al-cargar-clientes-3c0d3b'), error)
  }
}

const actualizarSucursales = async (cliente) => {
  console.log(cliente)
  if (!cliente) return

  try {
    const { data } = await api.get(`listaSucursal/${cliente}`)
    branches.value = data.map((sucursal) => ({
      label: sucursal.nombre,
      value: sucursal.id,
      clientId: cliente.value,
    }))

    formData.value.sucursal = branches.value[0] || null
  } catch (error) {
    showError(i18nT('ui.error-al-cargar-sucursales-a6a650'), error)
  }
}

const cargarCajaBancos = async () => {
  try {
    const response = await apiCt.get(`listar_caja_bancos/${CONSTANTES.idempresa}`)
    listaCajaBancos.value = (response.data || []).map((item) => ({
      label: item.codigo + ' ' + item.tipo_cuenta,
      value: item.idcaja_bancos,
      codigo: item.codigo,
      nombre: item.tipo_cuenta,
    }))
  } catch (error) {
    console.error('Error al cargar caja bancos:', error)
    $q.notify({ type: 'negative', message: i18nT('ui.no-se-pudieron-cargar-caja-bancos-70bba1') })
  }
}

const toggleCredit = (value) => {
  if (value) {
    // Crédito: no se permite caja/banco
    formData.value.cajabanco = null
  }
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
    daysToAdd = selectedPeriod * formData.value.cantidadPagos // e.g., 15 days * num payments
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
  formData.value.pagosDivididos.push({ canal: null, monto: 0, porcentaje: 0 })
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
      formData.value.pagosDivididos = [{ canal: null, monto: 0, porcentaje: 0 }]
    } else if (newVal === 'dividido') {
      // Clear direct payment data when 'dividido' is selected
      formData.value.canal = null
    }
  },
)
const onSubmit = async () => {
  let loadingShown = false
  try {
    console.log('Datos del formulario:', formData.value)

    const cartData = JSON.parse(localStorage.getItem('carrito') || '{}')
    const {
      cliente,
      sucursal,
      fecha,
      canal,
      pagosDivididos = [],
      credito,
      tipopago,
      variablePago,
      cantidadPagos,
      fechaLimite,
      montoPagos,
      periodo,
      cajabanco,
    } = formData.value
    console.log(credito)
    console.log(tipopago)
    //Validaciones previas
    if (!cliente) throw { message: i18nT('ui.debe-seleccionar-un-cliente-03eec0') }
    if (!sucursal || !sucursal.value) throw { message: i18nT('ui.debe-seleccionar-una-sucursal-valida-1c7250') }
    if (!fecha) throw { message: i18nT('ui.debe-seleccionar-una-fecha-valida-bc2da8') }
    if (!credito && !cajabanco)
      throw { message: i18nT('ui.debe-seleccionar-una-caja-o-banco-para-ventas-al-con-a15c2c') }
    if ((!canal || !canal.value) && pagosDivididos.length === 0)
      throw { message: i18nT('ui.debe-seleccionar-un-canal-de-venta-valido-a968fc') }
    if (!cartData.listaProductos || !cartData.listaProductos.length) {
      throw { message: i18nT('ventas.emptyCart') }
    }

    console.log('Datos del carrito:', cartData)

    $q.loading.show({ message: i18nT('ui.procesando-venta-98a5be'), timeout: 30000 })
    loadingShown = true

    //Preparar formulario para envío tipoventa
    tipopago !== 'contado'
      ? (cartData.pagosDivididos = pagosDivididos)
      : (cartData.pagosDivididos = [])
    cartData.variablePago = variablePago
    // Caja/Banco solo para contado; crédito siempre null
    cartData.cajabanco = credito ? null : cajabanco
    cartData.nropagos = cantidadPagos
    cartData.fechalimite = fechaLimite
    cartData.valorpagos = montoPagos
    cartData.dias = periodo
    // Leer y parsear la configuracion contable guardada por LoginPage
    // Estructura esperada: [{ frecuencia_registro, nombre_operacion }, ...]
    let confiConta = []
    try {
      const rawConfi = localStorage.getItem('mistersofts-cm-confi-conta')
      const parsedConfi = rawConfi ? JSON.parse(rawConfi) : []
      confiConta = Array.isArray(parsedConfi) ? parsedConfi : []
    } catch (e) {
      console.error('[confi-conta] Error parseando configuracion:', e)
      confiConta = []
    }

    if (credito) {
      const tieneConfigCredito = confiConta.some(
        (item) => item?.nombre_operacion === 'Ventas con factura Credito',
      )
      cartData.mistersofts_cm_confi_conta = tieneConfigCredito ? 2 : 3
    } else {
      const tieneConfigContado = confiConta.some(
        (item) => item?.nombre_operacion === 'Ventas con factura Contado',
      )
      cartData.mistersofts_cm_confi_conta = tieneConfigContado ? 2 : 3
    }

    const form = new FormData()
    form.append('ver', CONSTANTES.ver)
    form.append('tipoventa', CONSTANTES.tipoventa)
    form.append('idusuario', CONSTANTES.idusuario)
    form.append('idempresa', CONSTANTES.idempresa)
    form.append('idcliente', cliente)
    form.append('sucursal', sucursal.value)
    form.append('fecha', fecha)
    if ((!canal || canal.value == null) && pagosDivididos.length > 0) {
      form.append('canal', 0)
      form.append('pagosDivididos', JSON.stringify(pagosDivididos))
    } else {
      form.append('canal', canal?.value || 0)
    }
    form.append('tipopago', credito ? 'credito' : CONSTANTES.tipopago)
    console.log(cartData.pagosDivididos, pagosDivididos)
    form.append('jsonDetalles', JSON.stringify(cartData))

    console.log('Formulario enviado:')
    form.forEach((valor, clave) => console.log(`${clave}: ${valor}`))

    //  Enviar al backend
    const response = await api.post('', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    console.log('Respuesta de la API:', response)
    const data = response.data

    if (data.estado === 'exito') {
      $q.notify({
        type: 'positive',
        message: i18nT('ui.venta-realizada-exitosamente-9332b6'),
      })
      resetForm()
      $q.dialog({
        title: i18nT('ui.venta-exitosa-19220d'),
        message: i18nT('ui.su-comprobante-esta-listo-desea-verlo-1cf7a9'),
        cancel: true,
        persistent: true,
      })
        .onOk(() => {
          generarFactura(data.idcliente, data.idventa)
        })
        .onCancel(() => {
          emit('venta-registrada')
        })
    } else {
      $q.notify({
        type: 'negative',
        message: data.mensaje || i18nT('ui.error-al-registrar-la-cotizacion-113093'),
      })
    }
  } catch (error) {
    // 🧠 Registro de errores
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
          label: i18nT('ui.detalles-b1bb8e'),
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

const generarFactura = async (idcliente, idventa) => {
  mostrar.value = true
  try {
    const response = await api.get(`detallesVenta/${idventa}/${CONSTANTES.idempresa}`) // Cambia a tu ruta real
    console.log(response.data)
    detalleVenta.value = response.data
    const doc = await PDFdetalleVentaInicio(detalleVenta.value)
    // doc.save('proveedores.pdf') ← comenta o elimina esta línea
    //doc.output('dataurlnewwindow') // ← muestra el PDF en una nueva ventana del navegador
    pdfData.value = doc.output('dataurlstring') // muestra el pdf en un modal
    open('right', idcliente, detalleVenta.value)
  } catch (error) {
    console.error('Error al cargar datos:', error)
    $q.notify({
      type: 'negative',
      message: i18nT('configGeneral.divisas.messages.loadError'),
    })
  }
  console.log(idcliente, idventa)
}
const cerrarModal = () => {
  emit('venta-registrada')
}
function open(pos, idcot, data) {
  position.value = pos
  dialog.value = true
  idcliente.value = idcot
  detalleVenta.value = data
  console.log(idcliente.value, detalleVenta.value)

  return new Promise((resolve) => {
    resolver = resolve
  })
}
const confirmar = (idcliente, data) => {
  resolver?.(true)
  //JSON.parse(JSON.stringify(detalleVenta.value))
  console.log(idcliente, data)
  PDFenviarFacturaCorreoAlInicio(idcliente, data, $q)
  dialog.value = false
}

const cancelar = () => {
  resolver?.(false)
  dialog.value = false
  console.log('Cancelado')
}
// ====================== MANEJO DE ERRORES ======================
const getEnhancedErrorMessage = (error) => {
  return error.details
    ? `${error.message}: ${JSON.stringify(error.details)}`
    : error.message || i18nT('ui.ocurrio-un-error-al-procesar-la-venta-9c48e1')
}

const showDetailedErrorDialog = (error) => {
  if (!$q.dialog) {
    console.warn('Dialog plugin no está disponible')
    console.log(error)
    return
  }
  console.log(resetForm())

  $q.dialog({
    title: i18nT('ui.detalles-del-error-be59f6'),
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
    message: `${message}: ${error.message || i18nT('ui.error-desconocido-9c256e')}`,
  })
}

const logError = (type, error, context = {}) => {
  const errorEntry = {
    timestamp: new Date().toISOString(),
    type,
    message: error.message || i18nT('ui.error-desconocido-9c256e'),
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
    cajabanco: null,
    cantidadPagos: 0,
    montoPagos: 0,
    periodo: null,
    plazoPersonalizado: 0,
    fechaLimite: '',
    tipoDocumento: null,
    numeroDocumento: '',
  }
  localStorage.removeItem('carrito')
}

const handleContinue = () => {
  emit('continuar') // Esto activará el toggle en el padre
}
//=======================Cliente ====================
const RegistrarCliente = () => {
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
        message: response.data.mensaje || i18nT('ui.cliente-guardado-correctamente-d0df06'),
      })
      // Optionally, refresh your data or add the new client to your list
      // For example, if you have a method to fetch clients:
      // fetchClients();
    } else {
      $q.notify({
        type: 'negative',
        message: response.data.mensaje || i18nT('ui.hubo-un-problema-al-guardar-el-cliente-a235d2'),
      })
    }
  } catch (error) {
    console.error('Error submitting form:', error)

    $q.notify({
      color: 'negative',
      message:
        i18nT('ui.error-al-registrar-c13a59') +
        (error.response?.data?.mensaje || error.message || i18nT('ui.error-desconocido-9c256e')),
      icon: 'error',
    })
  }
}
// ====================== HOOKS ======================

onMounted(() => {
  listaCLientes()
  cargarCajaBancos()
  cargarCanales()
})
</script>
<style scoped>
.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.radio-with-icon {
  display: flex;
  align-items: center;
}

.toggle-with-icon {
  display: flex;
  align-items: center;
}

.payment-summary p {
  display: flex;
  align-items: center;
}

.forms {
  margin: 0 auto;
}

.q-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.q-input,
.q-select {
  margin-bottom: 8px;
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
  color: white; /* theme-allow */
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

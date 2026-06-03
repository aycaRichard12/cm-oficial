<template>
  <q-dialog v-model="modalmetodopago" backdrop-filter="blur(4px)" persistent>
    <q-card
      class="responsive-dialog shadow-24 column no-wrap"
      style="
        min-width: 550px;
        max-width: 800px;
        max-height: 90vh;
        border-radius: 20px;
        overflow: hidden;
      "
    >
      <!-- Header del Diálogo -->
      <q-card-section
        class="bg-primary text-white q-py-lg flex justify-between items-center shrink-0"
        style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); z-index: 10"
      >
        <div class="flex items-center">
          <div
            class="bg-white/20 q-pa-sm rounded-borders q-mr-md shadow-inner"
            style="backdrop-filter: blur(8px); border-radius: 12px"
          >
            <q-icon name="account_balance_wallet" class="text-white" size="28px" />
          </div>
          <div>
            <div
              class="text-h6 text-weight-bolder"
              style="font-family: 'Inter', sans-serif; line-height: 1.2"
            >
              Método de Pago
            </div>
            <div class="text-caption text-white/80 text-weight-medium">
              Configure la modalidad y detalles del pago
            </div>
          </div>
        </div>
        <q-btn
          icon="close"
          v-close-popup
          flat
          round
          dense
          class="text-white/80 hover:text-white transition-all"
          size="md"
        />
      </q-card-section>

      <q-card-section class="col scroll q-pa-xl bg-grey-1">
        <!-- Selector de Modalidad Principal -->
        <div class="row justify-center" style="margin-bottom: 100px">
          <q-btn-toggle
            v-model="carritoCO.credito"
            toggle-color="primary"
            toggle-text-color="white"
            color="grey-1"
            text-color="grey-7"
            unelevated
            rounded
            no-caps
            class="custom-premium-toggle border-grey-3 shadow-2"
            @update:model-value="handleTipoPagoGeneralChange"
            :options="[
              { value: false, slot: 'efectivo' },
              { value: true, slot: 'credito' },
            ]"
          >
            <!-- Custom Slots for perfect flex control -->
            <template v-slot:efectivo>
              <div class="row no-wrap text-weight-bold" style="width: 100px">
                <q-icon name="payments" size="20px" class="" />
                <span>Efectivo</span>
              </div>
            </template>

            <template v-slot:credito>
              <div class="row no-wrap text-weight-bold" style="width: 100px">
                <q-icon name="credit_score" size="20px" class="" />
                <span>Crédito</span>
              </div>
            </template>
          </q-btn-toggle>
        </div>

        <!-- SECCIÓN: PAGO EFECTIVO -->
        <div v-if="!carritoCO.credito" class="animate__animated animate__fadeIn">
          <div class="flex items-center justify-between q-mb-lg">
            <div
              class="text-subtitle1 text-weight-bold text-primary flex items-center q-px-md bg-blue-50 q-py-sm rounded-borders shadow-sm"
              style="border-left: 4px solid #1976d2"
            >
              <q-icon name="payments" class="q-mr-sm" />
              MODALIDAD: EFECTIVO
            </div>

            <div class="bg-primary/10 text-primary q-px-md q-py-xs rounded-pill text-weight-bold">
              Total: {{ decimas(carritoCO.ventatotal) }} {{ divisaActiva.tipo }}
            </div>
          </div>

          <!-- Selector de tipo de pago en efectivo -->
          <div class="q-gutter-x-xl q-mb-xl row justify-center">
            <q-radio
              v-model="carritoCO.variablePago"
              val="directo"
              color="positive"
              label="Pago Único"
              class="text-weight-bolder text-subtitle2"
            />
            <q-radio
              v-model="carritoCO.variablePago"
              val="dividido"
              color="orange-8"
              label="Pago Dividido"
              class="text-weight-bolder text-subtitle2"
            />
          </div>

          <!-- Caso: Pago Único -->
          <div
            v-if="carritoCO.variablePago === 'directo'"
            class="row q-col-gutter-lg justify-center q-pt-sm"
          >
            <div class="col-12 col-md-10">
              <label
                class="text-weight-bold text-grey-9 q-mb-sm block text-uppercase ls-1"
                style="font-size: 12px"
              >
                Método de pago principal <span class="text-negative">*</span>
              </label>
              <q-select
                v-model="carritoCO.metodoPago"
                dense
                outlined
                bg-color="white"
                :options="metodosPagos"
                emit-value
                map-options
                option-label="label"
                option-value="value"
                :rules="[(val) => !!val || 'Seleccione un método de pago']"
                class="premium-input"
                style="border-radius: 8px"
              >
                <template v-slot:prepend>
                  <q-icon name="account_balance_wallet" color="primary" />
                </template>
              </q-select>
            </div>
          </div>

          <!-- Caso: Pago Dividido -->
          <div v-else-if="carritoCO.variablePago === 'dividido'" class="q-pt-sm">
            <div class="text-caption text-grey-7 q-mb-md flex items-center">
              <q-icon name="info" size="xs" class="q-mr-xs" />
              Distribuya el monto total entre diferentes métodos de pago.
            </div>

            <div
              v-for="(payment, index) in carritoCO.pagosDivididos"
              :key="index"
              class="row q-col-gutter-md q-mb-md items-start bg-white q-pa-md shadow-sm rounded-borders border-grey-2 hover-shadow-md transition-all"
            >
              <div class="col-12 col-md-5">
                <label
                  class="text-weight-bold text-grey-8 q-mb-xs block text-caption text-uppercase ls-1"
                  >Método de Pago *</label
                >
                <q-select
                  v-model="payment.metodoPago"
                  dense
                  outlined
                  bg-color="grey-1"
                  :options="metodosPagos"
                  emit-value
                  map-options
                  option-label="label"
                  option-value="value"
                  :rules="[(val) => !!val || 'Requerido']"
                  hide-bottom-space
                  class="rounded-borders"
                />
              </div>
              <div class="col-12 col-md-3">
                <label
                  class="text-weight-bold text-grey-8 q-mb-xs block text-caption text-uppercase ls-1"
                  >Monto ({{ divisaActiva.tipo }})</label
                >
                <q-input
                  v-model="payment.monto"
                  type="number"
                  dense
                  outlined
                  bg-color="grey-1"
                  @update:model-value="calculateRemainingAmount(index)"
                  :rules="[(val) => !!val || 'Requerido']"
                  hide-bottom-space
                  class="rounded-borders"
                />
              </div>
              <div class="col-12 col-md-3">
                <label
                  class="text-weight-bold text-grey-8 q-mb-xs block text-caption text-uppercase ls-1"
                  >Porcentaje (%)</label
                >
                <q-input
                  v-model="payment.porcentaje"
                  type="number"
                  dense
                  outlined
                  bg-color="grey-1"
                  @update:model-value="calculateAmountFromPercentage(index)"
                  :rules="[(val) => !!val || 'Requerido']"
                  hide-bottom-space
                  class="rounded-borders"
                />
              </div>
              <div class="col-12 col-md-1 flex flex-center" style="padding-top: 24px">
                <q-btn
                  v-if="carritoCO.pagosDivididos.length > 1"
                  icon="delete_outline"
                  color="negative"
                  flat
                  round
                  size="md"
                  class="bg-red-1"
                  @click="removePaymentMethod(index)"
                />
              </div>
            </div>

            <div class="flex justify-end q-mt-md">
              <q-btn
                label="Añadir Método"
                icon="add"
                color="primary"
                outline
                class="q-px-lg bg-white shadow-1 text-weight-bold"
                style="border-radius: 10px"
                @click="addPaymentMethod"
              />
            </div>

            <!-- Banner de estado del pago dividido -->
            <div
              v-if="remainingAmount !== 0 || totalPaidAmount !== 0"
              class="q-mt-xl q-pa-lg rounded-borders shadow-2"
              :class="
                remainingAmount === 0 ? 'bg-green-50 border-green' : 'bg-orange-50 border-orange'
              "
              style="border-left: 6px solid"
            >
              <div class="row items-center justify-between">
                <div class="row q-gutter-x-xl">
                  <div class="column">
                    <span class="text-caption text-grey-7 text-uppercase ls-1 font-bold"
                      >Total Pagado</span
                    >
                    <span
                      class="text-h6 text-weight-bolder"
                      :class="remainingAmount === 0 ? 'text-positive' : 'text-orange-9'"
                    >
                      {{ totalPaidAmount.toFixed(2) }} {{ divisaActiva.tipo }}
                    </span>
                  </div>
                  <div class="column">
                    <span class="text-caption text-grey-7 text-uppercase ls-1 font-bold"
                      >Monto Pendiente</span
                    >
                    <span
                      class="text-h6 text-weight-bolder"
                      :class="remainingAmount === 0 ? 'text-positive' : 'text-negative'"
                    >
                      {{ remainingAmount.toFixed(2) }} {{ divisaActiva.tipo }}
                    </span>
                  </div>
                </div>
                <q-icon
                  :name="remainingAmount === 0 ? 'check_circle' : 'warning'"
                  :color="remainingAmount === 0 ? 'positive' : 'warning'"
                  size="44px"
                />
              </div>
            </div>
          </div>

          <!-- Selección de Caja/Banco para Efectivo -->
          <div
            class="col-12 q-mt-xl animate__animated animate__fadeInUp"
            v-if="listaCajaBancos.length > 0"
          >
            <q-separator class="q-mb-xl" />

            <label
              class="text-weight-bold text-grey-9 q-mb-sm block text-uppercase ls-1"
              style="font-size: 12px"
            >
              Asignar a Caja o Banco <span class="text-negative">*</span>
            </label>

            <q-select
              v-model="idcajaBancoSeleccionada"
              :options="listaCajaBancos"
              dense
              outlined
              emit-value
              map-options
              class="premium-input bg-white"
              :rules="[(val) => !!val || 'Campo requerido']"
              style="border-radius: 8px"
            >
              <template v-slot:prepend>
                <q-icon name="account_balance" color="positive" />
              </template>

              <template v-slot:selected-item="scope">
                <div v-if="scope.opt" class="q-py-xs">
                  <span class="text-weight-bold text-primary">{{ scope.opt.codigo }}</span>
                  <span class="q-ml-xs text-grey-8">- {{ scope.opt.nombre }}</span>
                </div>
              </template>

              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" class="q-py-md">
                  <q-item-section avatar>
                    <q-icon name="account_balance" color="grey-6" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bolder text-primary">
                      {{ scope.opt.codigo }}
                    </q-item-label>
                    <q-item-label caption class="text-weight-medium">
                      {{ scope.opt.nombre }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>

        <!-- SECCIÓN: PAGO A CRÉDITO -->
        <div v-else class="animate__animated animate__fadeIn">
          <div class="flex items-center justify-between q-mb-lg">
            <div
              class="text-subtitle1 text-weight-bold text-primary flex items-center q-px-md bg-blue-50 q-py-sm rounded-borders shadow-sm"
              style="border-left: 4px solid #1976d2"
            >
              <q-icon name="credit_score" class="q-mr-sm" />
              MODALIDAD: CRÉDITO
            </div>

            <div class="bg-primary/10 text-primary q-px-md q-py-xs rounded-pill text-weight-bold">
              Monto Total: {{ decimas(carritoCO.ventatotal) }} {{ divisaActiva.tipo }}
            </div>
          </div>

          <div class="row q-col-gutter-xl q-pt-md">
            <div class="col-12 col-md-6">
              <label
                class="text-weight-bold text-grey-8 q-mb-sm block text-uppercase ls-1"
                style="font-size: 11px"
                >Número de Cuotas *</label
              >
              <q-input
                v-model="carritoCO.cantidadPagos"
                type="number"
                min="1"
                dense
                outlined
                bg-color="white"
                @update:model-value="(calculatePayments(), calculateDueDate())"
                :rules="[(val) => (!!val && val > 0) || 'Requerido']"
                class="rounded-borders"
              >
                <template v-slot:prepend
                  ><q-icon name="format_list_numbered" color="primary"
                /></template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <label
                class="text-weight-bold text-grey-8 q-mb-sm block text-uppercase ls-1"
                style="font-size: 11px"
                >Monto por Cuota</label
              >
              <q-input
                v-model="carritoCO.montoPagos"
                dense
                outlined
                readonly
                class="bg-grey-2"
                input-class="text-weight-bolder text-primary text-subtitle1"
              >
                <template v-slot:prepend><q-icon name="paid" color="grey-6" /></template>
                <template v-slot:append>
                  <span class="text-subtitle2 text-grey-7">{{ divisaActiva.tipo }}</span>
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <label
                class="text-weight-bold text-grey-8 q-mb-sm block text-uppercase ls-1"
                style="font-size: 11px"
                >Frecuencia de Pago *</label
              >
              <q-select
                v-model="carritoCO.periodo"
                dense
                outlined
                bg-color="white"
                :options="periodOptions"
                emit-value
                map-options
                @update:model-value="calculateDueDate"
                class="rounded-borders"
              >
                <template v-slot:prepend><q-icon name="event_repeat" color="primary" /></template>
              </q-select>
            </div>

            <div
              v-if="carritoCO.periodo === 0"
              class="col-12 col-md-6 animate__animated animate__zoomIn"
            >
              <label
                class="text-weight-bold text-grey-8 q-mb-sm block text-uppercase ls-1"
                style="font-size: 11px"
                >Plazo Total (Días) *</label
              >
              <q-input
                v-model="carritoCO.plazoPersonalizado"
                type="number"
                dense
                outlined
                bg-color="white"
                @update:model-value="calculateDueDate"
                :rules="[(val) => !!val || 'Requerido']"
                class="rounded-borders"
              >
                <template v-slot:prepend><q-icon name="edit_calendar" color="primary" /></template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <label
                class="text-weight-bold text-grey-8 q-mb-sm block text-uppercase ls-1"
                style="font-size: 11px"
                >Fecha de Vencimiento Estimada</label
              >
              <q-input
                v-model="carritoCO.fechaLimite"
                dense
                outlined
                type="date"
                readonly
                class="bg-grey-2"
              >
                <template v-slot:prepend><q-icon name="event_available" color="grey-6" /></template>
              </q-input>
            </div>
          </div>

          <div class="q-mt-xl q-pa-md bg-blue-50 rounded-borders border-blue flex items-center">
            <q-icon name="info" color="primary" size="sm" class="q-mr-md" />
            <div class="text-caption text-blue-9 text-weight-medium">
              La fecha de vencimiento se calcula automáticamente según la frecuencia y el número de
              cuotas desde la fecha de emisión.
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Acciones del Diálogo -->
      <q-card-actions align="right" class="q-pa-lg bg-white shrink-0 shadow-up-1">
        <q-btn
          flat
          label="Regresar"
          color="grey-8"
          v-close-popup
          class="q-px-lg text-weight-bold rounded-pill"
        />
        <q-btn
          unelevated
          label="Confirmar Cotización"
          color="primary"
          icon="task_alt"
          class="q-px-xl text-weight-bolder shadow-3 transition-all transform hover:scale-105"
          style="
            border-radius: 50px;
            height: 48px;
            background: linear-gradient(45deg, #1976d2, #42a5f5);
          "
          @click="enviarDatos"
          :disable="carritoCO.variablePago === 'dividido' && remainingAmount !== 0"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { api } from 'src/boot/axios'
import { decimas, validarUsuario } from 'src/composables/FuncionesG'

import { obtenerFechaActualDato } from 'src/composables/FuncionesG'

const divisaActiva = reactive({ id: 0, nombre: '', tipo: '', codigosin: 0 })
const metodosPagos = ref([])
const puntoVenta = ref(null)
const fecha = ref(obtenerFechaActualDato())
const modalmetodopago = ref(false)
const carritoCO = reactive({
  ventatotal: 0,
  subtotal: 0,
  descuento: 0,
  idalmacen: 0,
  divisa: divisaActiva.id,
  ipv: puntoVenta.value,
  idusuario: 0,
  listaProductos: [],
  pagosDivididos: [{ metodoPago: null, monto: 0, porcentaje: 0 }],
  metodoPago: 0,
  variablePago: 'directo',
  fecha: fecha.value,
  credito: false,
  idfirma: null,
  codigosUnicos: [], // Para productos únicos
  cajabanco: null,
  // Campos de crédito persistentes
  cantidadPagos: 1,
  montoPagos: 0,
  periodo: 30,
  plazoPersonalizado: 0,
  fechaLimite: '',
})
const emit = defineEmits(['submit', 'cancel'])

const calculatePayments = () => {
  if (carritoCO.credito && carritoCO.cantidadPagos > 0 && totalSaleAmount.value > 0) {
    carritoCO.montoPagos = (totalSaleAmount.value / carritoCO.cantidadPagos).toFixed(2)
  } else {
    carritoCO.montoPagos = 0
  }
}
const totalSaleAmount = computed(() => {
  return parseFloat(carritoCO.ventatotal) || 0
})

const handleTipoPagoGeneralChange = (val) => {
  if (val) {
    // Al activar crédito, recalculamos valores basados en el estado actual
    calculatePayments()
    calculateDueDate()
  }
  // No reseteamos los datos de crédito al cambiar a efectivo para permitir la persistencia entre pestañas
}
const calculateDueDate = () => {
  if (!carritoCO.credito || !carritoCO.fecha) return // Corregido

  const fecha = new Date(carritoCO.fecha) // Corregido
  let daysToAdd = 0

  const selectedPeriod = Number(carritoCO.periodo) // Corregido

  if (selectedPeriod === 0) {
    daysToAdd = Number(carritoCO.plazoPersonalizado) || 0 // Corregido (usando carritoCO)
  } else if (selectedPeriod > 0) {
    daysToAdd = selectedPeriod * carritoCO.cantidadPagos // Corregido
  }

  if (daysToAdd > 0) {
    fecha.setDate(fecha.getDate() + daysToAdd)
    carritoCO.fechaLimite = fecha.toISOString().slice(0, 10) // Corregido
  } else {
    carritoCO.fechaLimite = '' // Corregido
  }
}
const calculateRemainingAmount = (index) => {
  console.log(index)
  const payment = carritoCO.pagosDivididos[index]
  console.log(payment)
  const monto = parseFloat(payment.monto) || 0
  if (monto >= 0 && monto <= totalSaleAmount.value && totalSaleAmount.value > 0) {
    payment.porcentaje = ((monto * 100) / totalSaleAmount.value).toFixed(2)
  } else {
    payment.porcentaje = 0
  }
}

const calculateAmountFromPercentage = (index) => {
  console.log(index)
  const payment = carritoCO.pagosDivididos[index]
  console.log(payment)
  // Ensure percentage is treated as a number and within valid range
  const percentage = parseFloat(payment.porcentaje) || 0
  if (percentage >= 0 && percentage <= 100 && totalSaleAmount.value > 0) {
    payment.monto = (totalSaleAmount.value * (percentage / 100)).toFixed(2)
  } else {
    payment.monto = 0
  }
}
const removePaymentMethod = (index) => {
  carritoCO.pagosDivididos.splice(index, 1)
}
const addPaymentMethod = () => {
  carritoCO.pagosDivididos.push({ metodoPago: null, monto: 0, porcentaje: 0 })
}
async function enviarDatos() {
  emit('submit', carritoCO.value)
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
watch(
  carritoCO,
  (newVal) => {
    localStorage.setItem('carritoCO', JSON.stringify(newVal))
  },
  { deep: true },
)
onMounted(() => {
  cargarMetodoPagoFactura()
})
</script>

<style lang="scss" scoped>
.gradient-btn {
  background: linear-gradient(135deg, #1976d2, #1565c0);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}
.gradient-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(25, 118, 210, 0.4);
}
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
\n
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.premium-input:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

.hover-row:hover {
  background-color: #f5f9ff !important;
}

.hover-shake:hover {
  transform: scale(1.1) rotate(3deg);
  transition: transform 0.2s ease;
}

/* Enhancing inputs */
.q-field--outlined .q-field__control {
  border-radius: 8px !important;
}

.q-card {
  transition: all 0.3s ease;
}

.q-btn {
  text-transform: none;
  letter-spacing: 0.3px;
}
.responsive-dialog {
  display: flex;
  flex-direction: column;
}

.premium-input :deep(.q-field__control) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

/* Estilo para que la barra de scroll sea más discreta en navegadores webkit */
.scroll::-webkit-scrollbar {
  width: 6px;
}
.scroll::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}
.scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
}
/* Add this to your style block (scoped or global depending on your setup) */
.custom-premium-toggle {
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.3px;
  overflow: hidden; /* Ensures the rounded borders clip perfectly */
}

/* Force standard line-heights inside the button to prevent font-specific shifting */
.custom-premium-toggle .q-btn {
  line-height: 1 !important;
  min-height: 100px; /* Guarantees matching, explicit heights */
}
</style>

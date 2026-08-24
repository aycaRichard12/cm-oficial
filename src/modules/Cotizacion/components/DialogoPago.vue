<template>
  <q-dialog
    :model-value="mostrar"
    @update:model-value="$emit('update:mostrar', $event)"
    backdrop-filter="blur(4px)"
    persistent
  >
    <q-card class="responsive-dialog shadow-24 column no-wrap">
      <q-card-section
        class="bg-primary text-white q-py-md q-px-md q-px-sm-md flex justify-between items-center shrink-0"
        style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); z-index: 10"
      >
        <div class="flex items-center">
          <div
            class="bg-white/20 q-pa-sm rounded-borders q-mr-sm shadow-inner"
            style="backdrop-filter: blur(8px); border-radius: 12px"
          >
            <q-icon name="account_balance_wallet" class="text-white" size="24px" />
          </div>
          <div>
            <div
              class="text-h6 text-weight-bolder"
              style="font-family: 'Inter', sans-serif; line-height: 1.2"
            >
              Método de Pago
            </div>
            <div class="text-caption text-white/80 text-weight-medium gt-xs">
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

      <q-card-section class="col scroll q-pa-lg q-pa-sm-md bg-grey-1 content-section">
        <div class="row justify-center q-mb-xl q-mb-md-sm">
          <q-btn-toggle
            v-model="carritoLocal.credito"
            @update:model-value="onTipoPagoChange"
            toggle-color="primary"
            toggle-text-color="white"
            color="grey-1"
            text-color="grey-7"
            unelevated
            rounded
            no-caps
            class="custom-premium-toggle border-grey-3 shadow-2"
            :options="[
              { value: false, slot: 'efectivo' },
              { value: true, slot: 'credito' },
            ]"
          >
            <template v-slot:efectivo>
              <div
                class="row no-wrap text-weight-bold items-center q-gutter-x-xs"
                style="padding: 4px 12px"
              >
                <q-icon name="payments" size="18px" />
                <span>Efectivo</span>
              </div>
            </template>

            <template v-slot:credito>
              <div
                class="row no-wrap text-weight-bold items-center q-gutter-x-xs"
                style="padding: 4px 12px"
              >
                <q-icon name="credit_score" size="18px" />
                <span>Crédito</span>
              </div>
            </template>
          </q-btn-toggle>
        </div>

        <div v-if="!carritoLocal.credito" class="animate__animated animate__fadeIn">
          <div class="flex items-center justify-between q-mb-lg">
            <div
              class="text-subtitle1 text-weight-bold text-primary flex items-center q-px-md bg-blue-50 q-py-sm rounded-borders shadow-sm"
              style="border-left: 4px solid #1976d2"
            >
              <q-icon name="payments" class="q-mr-sm" />
              MODALIDAD: EFECTIVO
            </div>

            <div class="bg-primary/10 text-primary q-px-md q-py-xs rounded-pill text-weight-bold">
              Total: {{ decimas(carritoLocal.ventatotal) }} {{ divisaActiva.tipo }}
            </div>
          </div>

          <div class="q-gutter-x-xl q-mb-xl row justify-center">
            <q-radio
              v-model="carritoLocal.variablePago"
              val="directo"
              color="positive"
              label="Pago Único"
              class="text-weight-bolder text-subtitle2"
            />
            <q-radio
              v-model="carritoLocal.variablePago"
              val="dividido"
              color="orange-8"
              label="Pago Dividido"
              class="text-weight-bolder text-subtitle2"
            />
          </div>

          <div
            v-if="carritoLocal.variablePago === 'directo'"
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
                v-model="carritoLocal.metodoPago"
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

          <div v-else-if="carritoLocal.variablePago === 'dividido'" class="q-pt-sm">
            <div class="text-caption text-grey-7 q-mb-md flex items-center">
              <q-icon name="info" size="xs" class="q-mr-xs" />
              Distribuya el monto total entre diferentes métodos de pago.
            </div>

            <div
              v-for="(payment, index) in carritoLocal.pagosDivididos"
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
                  v-if="carritoLocal.pagosDivididos.length > 1"
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
              v-model="idcajaBancoSeleccionadaLocal"
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
              Monto Total: {{ decimas(carritoLocal.ventatotal) }} {{ divisaActiva.tipo }}
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
                v-model="carritoLocal.cantidadPagos"
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
                v-model="carritoLocal.montoPagos"
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
                v-model="carritoLocal.periodo"
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
              v-if="carritoLocal.periodo === 0"
              class="col-12 col-md-6 animate__animated animate__zoomIn"
            >
              <label
                class="text-weight-bold text-grey-8 q-mb-sm block text-uppercase ls-1"
                style="font-size: 11px"
                >Plazo Total (Días) *</label
              >
              <q-input
                v-model="carritoLocal.plazoPersonalizado"
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
                v-model="carritoLocal.fechaLimite"
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

      <q-card-actions align="right" class="q-pa-md q-pa-sm-sm bg-white shrink-0 shadow-up-1">
        <q-btn
          flat
          label="Regresar"
          color="grey-8"
          v-close-popup
          class="q-px-md text-weight-bold rounded-pill"
        />
        <q-btn
          unelevated
          label="Confirmar Cotización"
          color="primary"
          icon="task_alt"
          class="q-px-lg text-weight-bolder shadow-3 transition-all transform hover:scale-105 full-width-xs"
          style="
            border-radius: 50px;
            height: 48px;
            background: linear-gradient(45deg, #1976d2, #42a5f5);
          "
          @click="$emit('confirmar-pago')"
          :disable="carritoLocal.variablePago === 'dividido' && remainingAmount !== 0"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { decimas } from 'src/composables/FuncionesG'
import { usePago } from '../composables/usePago'

const props = defineProps({
  mostrar: Boolean,
  carrito: Object,
  metodosPagos: Array,
  listaCajaBancos: Array,
  divisaActiva: Object,
})
const emit = defineEmits(['update:mostrar', 'update:idcajaBancoSeleccionada', 'confirmar-pago'])

const carritoLocal = props.carrito

const pago = usePago(carritoLocal)
const {
  periodOptions,
  totalPaidAmount,
  remainingAmount,
  calculatePayments,
  calculateDueDate,
  calculateRemainingAmount,
  calculateAmountFromPercentage,
  addPaymentMethod,
  removePaymentMethod,
  handleTipoPagoGeneralChange,
} = pago

const idcajaBancoSeleccionadaLocal = computed({
  get: () => pago.idcajaBancoSeleccionada.value,
  set: (val) => {
    pago.idcajaBancoSeleccionada.value = val
    emit('update:idcajaBancoSeleccionada', val)
  },
})

const onTipoPagoChange = (val) => {
  handleTipoPagoGeneralChange(val)
}
</script>

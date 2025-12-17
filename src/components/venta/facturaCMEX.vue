<template>
  <q-page>
    <div class="row q-col-gutter-x-md">
      <div class="col-12 col-md-4">
        <q-btn
          label="Volver"
          icon="arrow_back"
          color="primary"
          size="sm"
          @click="$emit('volver')"
          class="q-mr-sm"
        />
        <q-btn label="Inicio" icon="home" color="primary" size="sm" @click="handleContinue" />
      </div>
      <div class="col-12 col-md-8">
        <h4 class="q-ma-none text-primary" style="font-size: 20px">
          <q-icon name="receipt_long" color="primary" size="28px" class="q-mr-sm" />
          FACTURA COMERCIAL DE EXPORTACIÓN
        </h4>
      </div>
      <div></div>
      <q-form @submit="onSubmit">
        <!-- Sección Cliente y Documentos -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row q-col-gutter-x-md">
              <div class="">
                <q-icon name="business" color="blue" size="24px" class="q-mr-sm" />
                <h5 class="q-my-sm text-primary" style="font-size: 15px">
                  Datos del Cliente y Documentos
                </h5>
              </div>
            </div>
            <div class="row q-col-gutter-x-md">
              <div class="col-12 col-md-5">
                <label for="cliente">Cliente*</label>
                <q-select
                  v-model="formData.cliente"
                  id="cliente"
                  dense
                  outlined
                  :options="filteredClients"
                  option-label="label"
                  option-value="value"
                  use-input
                  map-options
                  @filter="filterClientes"
                  @update:model-value="actualizarSucursales"
                  :rules="[(val) => !!val || 'Seleccione un cliente']"
                  clearable
                >
                  <template v-slot:prepend>
                    <q-icon name="person" color="blue" />
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey"> No hay resultados </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-1 q-mt-lg">
                <q-btn color="blue" icon="person_add" @click="RegistrarCliente" />
              </div>
              <div class="col-12 col-md-3">
                <label for="sucursal">Sucursal*</label>
                <q-select
                  v-model="formData.sucursal"
                  id="sucursal"
                  dense
                  outlined
                  :options="branchOptions"
                  option-label="label"
                  option-value="value"
                  :disable="!formData.cliente"
                  required
                >
                  <template v-slot:prepend>
                    <q-icon name="location_city" color="blue" />
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-3">
                <label for="tipodoc">Tipo de documento*</label>
                <q-select
                  v-model="formData.tipodoc"
                  id="tipodoc"
                  dense
                  outlined
                  :options="typeDocOptions"
                  option-label="label"
                  option-value="value"
                  :disable="!formData.cliente"
                >
                  <template v-slot:prepend>
                    <q-icon name="description" color="blue" />
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-3">
                <label for="nroDoc">Nro. documento*</label>
                <q-input
                  v-model="formData.nroDoc"
                  id="nroDoc"
                  dense
                  outlined
                  type="number"
                  :rules="[(val) => !!val || 'Campo Obligatorio']"
                  :disable="!formData.cliente"
                >
                  <template v-slot:prepend>
                    <q-icon name="numbers" color="blue" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-3">
                <label for="fecha">Fecha*</label>
                <q-input v-model="formData.fecha" id="fecha" dense outlined type="date" required>
                  <template v-slot:prepend>
                    <q-icon name="event" color="blue" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-3">
                <label for="canal">Canal de venta*</label>
                <q-select
                  v-model="formData.canal"
                  id="canal"
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
              <div class="col-12 col-md-3">
                <label for="direccion">Dirección comprador*</label>
                <q-input
                  v-model="formData.direccion"
                  id="direccion"
                  dense
                  outlined
                  type="text"
                  :rules="[(val) => !!val || 'Campo Obligatorio']"
                  :disable="!formData.cliente"
                >
                  <template v-slot:prepend>
                    <q-icon name="place" color="blue" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-3">
                <label for="puertoDestino">Puerto destino*</label>
                <q-input
                  v-model="formData.puertodestino"
                  id="puertoDestino"
                  dense
                  outlined
                  type="text"
                  :rules="[(val) => !!val || 'Campo Obligatorio']"
                  :disable="!formData.cliente"
                >
                  <template v-slot:prepend>
                    <q-icon name="local_shipping" color="blue" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-3">
                <label for="destino">Lugar destino*</label>
                <q-input
                  v-model="formData.lugardestino"
                  id="destino"
                  type="text"
                  dense
                  outlined
                  :rules="[(val) => !!val || 'Campo Obligatorio']"
                  :disable="!formData.cliente"
                >
                  <template v-slot:prepend>
                    <q-icon name="map" color="blue" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-3">
                <label for="incoterm">Incoterm*</label>
                <q-input
                  v-model="formData.incoterm"
                  label="incoterm"
                  dense
                  outlined
                  type="text"
                  :rules="[(val) => !!val || 'Campo Obligatorio']"
                  :disable="!formData.cliente"
                >
                  <template v-slot:prepend>
                    <q-icon name="gavel" color="blue" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-3">
                <label for="detalleicoterm">Detalle incoterm*</label>
                <q-input
                  v-model="formData.detalleincoterm"
                  id="detalleicoterm"
                  dense
                  outlined
                  type="text"
                  :rules="[(val) => !!val || 'Campo Obligatorio']"
                  :disable="!formData.cliente"
                >
                  <template v-slot:prepend>
                    <q-icon name="notes" color="blue" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-3">
                <label for="descripcionPaquete">Descripción paquetes*"</label>
                <q-input
                  v-model="formData.descripcionPB"
                  id="descripcionPaquete"
                  dense
                  outlined
                  type="text"
                  :rules="[(val) => !!val || 'Campo Obligatorio']"
                  :disable="!formData.cliente"
                >
                  <template v-slot:prepend>
                    <q-icon name="inventory" color="blue" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-3">
                <label for="infadic">Información adicional</label>
                <q-input
                  v-model="formData.infoadicional"
                  id="infadic"
                  type="text"
                  dense
                  outlined
                  :disable="!formData.cliente"
                >
                  <template v-slot:prepend>
                    <q-icon name="info" color="blue" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-3">
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
            </div>
          </q-card-section>
        </q-card>

        <!-- Sección Gastos -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row q-col-gutter-md q-mb-md">
              <!-- Gastos nacionales -->
              <div class="col-md-6">
                <div class="row q-col-gutter-x-md">
                  <div class="col-12 col-6">
                    <q-icon name="payments" color="green" size="24px" class="q-mr-sm" />
                    <label class="text-subtitle1">Gastos Nacionales</label>
                  </div>
                </div>
                <div class="row q-col-gutter-md q-mb-md">
                  <div class="col-md-4">
                    <label for="montonacVFE">Monto</label>
                    <q-input
                      id="montonacVFE"
                      name="montonac"
                      v-model="montoNacional"
                      dense
                      outlined
                      type="number"
                      step="0.01"
                    >
                      <template v-slot:append>
                        <span class="divisaVE">{{ divisaActiva.simbolo }}</span>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-md-5">
                    <label for="descnacVFE">Descripción</label>
                    <q-input id="descnacVFE" name="descnac" dense outlined v-model="descNacional">
                      <template v-slot:prepend>
                        <q-icon name="description" color="green" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-md-2 q-mb-sm">
                    <q-btn color="primary" @click="agregarGastoNacional" class="btn-res q-mt-lg">
                      <q-icon name="add" class="icono" />
                      <span class="texto">Agregar</span>
                    </q-btn>
                  </div>
                  <div class="col-12">
                    <q-table
                      :rows="gastosNacionales"
                      :columns="columnsGastos"
                      row-key="id"
                      flat
                      bordered
                    >
                      <template v-slot:body-cell-actions="props">
                        <q-td :props="props">
                          <q-btn
                            icon="delete"
                            color="negative"
                            flat
                            @click="eliminarGastoNacional(props.row)"
                          />
                        </q-td>
                      </template>
                      <template v-slot:bottom-row>
                        <q-tr>
                          <q-td colspan="2" class="text-right text-weight-bold">
                            <q-icon name="calculate" color="green" class="q-mr-sm" />
                            Total gastos
                          </q-td>
                          <q-td>{{ totalGastosNacionales }}</q-td>
                          <q-td></q-td>
                        </q-tr>
                      </template>
                    </q-table>
                  </div>
                </div>
              </div>

              <!-- Gastos internacionales -->
              <div class="col-md-6">
                <div class="row q-col-gutter-x-md">
                  <div class="col-12 col-md-6">
                    <q-icon name="flight" color="orange" size="24px" class="q-mr-sm" />
                    <label class="text-subtitle1">Gastos internacionales</label>
                  </div>
                </div>
                <div class="row q-col-gutter-md q-mb-md">
                  <div class="col-md-4">
                    <label for="montointerVFE">Monto</label>
                    <q-input
                      id="montointerVFE"
                      name="montointer"
                      dense
                      outlined
                      v-model="montoInternacional"
                      type="number"
                      step="0.01"
                    >
                      <template v-slot:append>
                        <span class="divisaVE">{{ divisaActiva.simbolo }}</span>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-md-5">
                    <label for="descinterVFE">Descripción</label>
                    <q-input
                      id="descinterVFE"
                      name="descinter"
                      dense
                      outlined
                      v-model="descInternacional"
                    >
                      <template v-slot:prepend>
                        <q-icon name="description" color="orange" />
                      </template>
                    </q-input>
                  </div>
                  <div class="col-md-2 q-mb-sm">
                    <q-btn
                      color="primary"
                      @click="agregarGastoInternacional"
                      class="btn-res q-mt-lg"
                    >
                      <q-icon name="add" class="icono" />
                      <span class="texto">Agregar</span>
                    </q-btn>
                  </div>
                  <div class="col-12">
                    <q-table
                      :rows="gastosInternacionales"
                      :columns="columnsGastos"
                      row-key="id"
                      flat
                      bordered
                    >
                      <template v-slot:body-cell-actions="props">
                        <q-td :props="props">
                          <q-btn
                            icon="delete"
                            color="negative"
                            flat
                            @click="eliminarGastoInternacional(props.row)"
                          />
                        </q-td>
                      </template>
                      <template v-slot:bottom-row>
                        <q-tr>
                          <q-td colspan="2" class="text-right text-weight-bold">
                            <q-icon name="calculate" color="orange" class="q-mr-sm" />
                            Total gastos
                          </q-td>
                          <q-td>{{ totalGastosInternacionales }}</q-td>
                          <q-td></q-td>
                        </q-tr>
                      </template>
                    </q-table>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row q-col-gutter-x-md">
              <div class="col-12 col-md-4">
                <label for="tipodecambio">Tipo de Cambio</label>

                <q-input
                  id="tipodecambio"
                  name="tipodecambio"
                  dense
                  outlined
                  v-model="tipoCambio"
                  type="number"
                  step="0.01"
                >
                  <template v-slot:append>
                    <span class="divisaVE">{{ divisaActiva.simbolo }}</span>
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <label for="">Monto Total de Venta</label>
                <q-field stack-label dense outlined readonly>
                  <template v-slot:control>
                    <div class="self-center full-width no-outline text-weight-bold" tabindex="0">
                      {{ montoTotalVenta }} {{ divisaActiva.simbolo }}
                    </div>
                  </template>
                </q-field>
              </div>
            </div>
          </q-card-section>
        </q-card>
        <!-- Sección Pago -->
        <q-card class="my-card">
          <q-card-section>
            <div class="section-header">
              <q-icon name="credit_card" color="purple" size="24px" class="q-mr-sm" />
              <h5 class="q-my-sm text-primary" style="font-size: 15px">Método de Pago</h5>
            </div>
            <div class="q-gutter-sm q-mb-md">
              <q-radio v-model="formData.variablePago" val="directo" label="Pago Único">
                <template v-slot:default>
                  <div class="radio-with-icon">
                    <q-icon name="payments" color="purple" class="q-mr-sm" />
                    <span>Pago Único</span>
                  </div>
                </template>
              </q-radio>
              <q-radio v-model="formData.variablePago" val="dividido" label="Pago Dividido">
                <template v-slot:default>
                  <div class="radio-with-icon">
                    <q-icon name="splitscreen" color="purple" class="q-mr-sm" />
                    <span>Pago Dividido</span>
                  </div>
                </template>
              </q-radio>
            </div>
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
                  :rules="[(val) => !!val || 'Seleccione un método']"
                >
                  <template v-slot:prepend>
                    <q-icon name="payment" color="purple" />
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
                    :rules="[(val) => !!val || 'Seleccione un método']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="credit_score" color="purple" />
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-md-3">
                  <label for="monto">{{ 'Monto (' + divisaActiva.simbolo + ')' }}</label>
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
                      <q-icon name="monetization_on" color="purple" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-3">
                  <label for="porcentaje">Porcentaje (%)</label>
                  <q-input
                    v-model="payment.porcentaje"
                    id="porcentaje"
                    dense
                    outlined
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    @update:model-value="calculateAmountFromPercentage(index)"
                    :rules="[(val) => !!val || 'Campo Obligatorio']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="percent" color="purple" />
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
                label="Agregar Método"
                icon="add"
                color="secondary"
                @click="addPaymentMethod"
                class="q-mt-md"
              />
              <div class="q-mt-lg payment-summary">
                <p class="text-subtitle1">
                  <q-icon name="summarize" color="purple" class="q-mr-sm" />
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
                  icon="warning"
                >
                  El monto total pagado no coincide con la venta total.
                </q-banner>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-separator spaced="md" />
        <q-card class="">
          <q-card-section>
            <div class="section-header">
              <q-icon name="schedule" color="red" size="24px" class="q-mr-sm" />
              <h5 class="q-my-sm text-primary" style="font-size: 15px">Condiciones de Crédito</h5>
            </div>
            <div class="col-12 q-mb-md">
              <q-toggle v-model="formData.credito" left-label @update:model-value="toggleCredit">
                <template v-slot:default>
                  <div class="toggle-with-icon">
                    <q-icon name="credit_score" color="red" class="q-mr-sm" />
                    <span>¿A crédito?</span>
                  </div>
                </template>
              </q-toggle>
            </div>

            <div v-if="formData.credito" class="row q-col-gutter-md q-pt-md">
              <div class="col-12 col-md-4">
                <label for="cantidadpagos">Cantidad de pagos*</label>
                <q-input
                  v-model="formData.cantidadPagos"
                  id="cantidadpagos"
                  dense
                  outlined
                  type="number"
                  min="0"
                  required
                  @update:model-value="calculatePayments"
                  :rules="[(val) => !!val || 'Campo Obligatorio']"
                >
                  <template v-slot:prepend>
                    <q-icon name="format_list_numbered" color="red" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <label for="montopago">Monto de pagos*</label>
                <q-input
                  v-model="formData.montoPagos"
                  id="montopago"
                  type="number"
                  dense
                  outlined
                  :disable="!formData.credito"
                >
                  <template v-slot:prepend>
                    <q-icon name="paid" color="red" />
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
                  :options="periodOptions"
                  dense
                  outlined
                  option-label="label"
                  option-value="value"
                  emit-value
                  map-options
                  required
                  @update:model-value="calculateDueDate"
                >
                  <template v-slot:prepend>
                    <q-icon name="calendar_today" color="red" />
                  </template>
                </q-select>
              </div>

              <div v-if="formData.periodo === 0" class="col-12 col-md-4">
                <label for="plazopersonalizado">Plazo total (días)*</label>
                <q-input
                  v-model="formData.plazoPersonalizado"
                  id="plazopersonalizado"
                  dense
                  outlined
                  type="number"
                  min="0"
                  required
                  @update:model-value="calculateDueDate"
                  :rules="[(val) => !!val || 'Campo Obligatorio']"
                >
                  <template v-slot:prepend>
                    <q-icon name="edit_calendar" color="red" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <label for="fechalimite">Fecha límite*</label>
                <q-input
                  v-model="formData.fechaLimite"
                  id="fechalimite"
                  type="date"
                  dense
                  outlined
                  :disable="true"
                >
                  <template v-slot:prepend>
                    <q-icon name="event_available" color="red" />
                  </template>
                </q-input>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <div class="row q-col-gutter-md q-ma-md">
          <div class="col-12 text-right">
            <q-btn label="Registrar" type="submit" color="primary" icon="save" />
          </div>
        </div>
      </q-form>
    </div>
    <q-dialog v-model="showAddModal">
      <MyRegistrationForm @recordCreated="handleRecordCreated" />
    </q-dialog>
  </q-page>
</template>

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

.divisaVE {
  font-weight: bold;
  color: var(--q-primary);
  font-size: 18px;
}
</style>
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
import { useNitValidator } from 'src/composables/useNitValidator'
const montoTotalVenta = ref(0)
const { validarNIT } = useNitValidator()
const divisaActiva = useCurrencyStore()
const leyendaActiva = useCurrencyLeyenda()
leyendaActiva.cargarLeyendaActivo()
const tipoCambio = ref(1)
console.log(divisaActiva)
console.log(leyendaActiva)
// ====================== CONSTANTES Y UTILIDADES ====================== canal
const ERROR_TYPES = {
  QUASAR: 'QUASAR_NOT_AVAILABLE',
  API: 'API_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTH_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
}
const correoPredeterminado = 'factura@yofinanciero.com'

const CONSTANTES = {
  ver: 'registroVenta',
  idusuario: idusuario_md5(),
  idempresa: idempresa_md5(),
  tipoventa: 3,
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
  tipopago: 'contado',
  metodoPago: null,
  puntoventa: null,
  cantidadPagos: 0,
  montoPagos: 0,
  periodo: { label: 'Personalizado', value: 0 },
  plazoPersonalizado: 0,
  fechaLimite: '',
  nroDoc: '',
  idcanal: null,
  tipodoc: null,
  // tipoDocumento: null,
  // numeroDocumento: '',
  pagosDivididos: [
    { metodoPago: null, monto: 0, porcentaje: 0 }, // Initial split payment method credito
  ],
})
async function crearFormularioFacturaExportacion() {
  try {
    const contenidousuario = validarUsuario()
    const usuario = contenidousuario[0]?.usuario
    const leyenda = leyendaActiva
    console.log('Objeto divisaActiva cargado:', divisaActiva.divisa)
    console.log('Objeto leyendaFacturaActiva cargado:', leyenda.leyenda)

    const datos = JSON.parse(localStorage.getItem('carrito'))
    console.log(datos.ventatotal)
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
      codigoLeyenda: leyendaActiva.leyenda.codigosin,
      tipoCambio: 6.96,
      direccionComprador: '',
      puertoDestino: '',
      lugarDestino: '',
      codigoPais: 22,
      incoterm: '',
      incotermDetalle: '',
      totalGastosNacionalesFob: datos.ventatotal,
      totalGastosInternacionales: 0,
      montoDetalle: datos.subtotal,
      costosGastosNacionales: [],
      costosGastosInternacionales: [],
      numeroDescripcionPaquetesBultos: '',
      informacionAdicional: '',
      detalles: datos.listaProductosFactura,
      pagosDivididos: [
        { metodoPago: null, monto: 0, porcentaje: 0 }, // Initial split payment method credito
      ],
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
  const user = JSON.parse(localStorage.getItem('yofinanciero'))
  return user || (window.location.href = '../app')
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
      console.log(idalmacen)
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
const actualizarSucursales = async (cliente) => {
  console.log(cliente)
  if (!cliente) return
  try {
    console.log(`listaSucursal/${cliente.value}`)
    const { data } = await api.get(`listaSucursal/${cliente.value}`)
    branches.value = data.map((sucursal) => ({
      label: sucursal.nombre,
      value: sucursal.id,
      clientId: cliente.value,
    }))
    cargarDatosCliente(cliente)
    formData.value.sucursal = branches.value[0] || null
  } catch (error) {
    showError('Error al cargar sucursales', error)
  }
}
const cargarDatosCliente = (client) => {
  console.log(client.originalData)
  const datos = JSON.parse(localStorage.getItem('carrito'))
  formData.value.nroDoc = client.originalData.nit
  formData.value.canal = salesChannels.value.filter(
    (u) => u.value == Number(client.originalData.idcanal),
  )[0]

  typeDoc.value = typeDoc.value = [
    {
      value: client.originalData.tipodocumento,
      label: client.originalData.textotipodocumento,
    },
  ]
  //elegirUnCliente(option.id, inputid, selectSuc, inputidS, listaS, classOptionsS, option.textotipodocumento, option.tipodocumento, option.nit, option.nombre, option.codigo, option.telefono, option.direccion, option.pais, option.idcanal, inputd,classOptions );

  formData.value.tipodoc = typeDoc.value[0] || null
  formData.value.direccion = client.originalData.direccion
  formData.value.lugardestino = client.originalData.pais

  if (datos) {
    // datos.listaFactura.nombreRazonSocial = nombre;
    // datos.listaFactura.codigoCliente = codigo;
    // datos.listaFactura.numeroDocumento = nrodoc;
    // datos.listaFactura.codigoTipoDocumentoIdentidad = idtipodoc;
    // datos.listaFactura.telefonoCliente = telefono;
    // datos.listaFactura.direccionComprador = direccion;
    // datos.listaFactura.lugarDestino = pais;
    // datos.listaFactura.codigoPuntoVenta = document.querySelector('#puntoventaVFE').value;
    // datos.listaFactura.codigoMetodoPago = document.querySelector('#metodopagoVFE').value;
    datos.listaFactura.nombreRazonSocial = client.originalData.nombre
    datos.listaFactura.codigoCliente = client.originalData.codigo
    datos.listaFactura.numeroDocumento = client.originalData.nit
    datos.listaFactura.codigoTipoDocumentoIdentidad = client.originalData.tipodocumento
    datos.listaFactura.telefonoCliente = client.originalData.telefono
    datos.listaFactura.direccionComprador = client.originalData.direccion
    datos.listaFactura.lugarDestino = client.originalData.pais

    datos.listaFactura.codigoPuntoVenta = formData.value.puntoventa.value
    datos.listaFactura.codigoMetodoPago = formData.value.metodoPago.value

    localStorage.setItem('carrito', JSON.stringify(datos))
    if (Number(client.originalData.tipodocumento) == 5) {
      validarNIT(client.originalData.nit)
    }
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
watch(
  () => tipoCambio.value,
  (newVal) => {
    actualizarMontoTotalVenta(newVal)
  },
)
const actualizarMontoTotalVenta = (newVal) => {
  const datos = JSON.parse(localStorage.getItem('carrito'))

  montoTotalVenta.value = Number(datos.listaFactura.montoTotal) * Number(newVal)
}
const onSubmit = async () => {
  let loadingShown = false
  try {
    console.log('Datos del formulario:', formData.value)

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
      direccion,
      puertodestino,
      lugardestino,
      incoterm,
      detalleincoterm,
      descripcionPB,
      infoadicional,

      pagosDivididos = [],
      credito,
      tipopago,
      variablePago,
      cantidadPagos,
      fechaLimite,
      montoPagos,
      periodo,
      plazoPersonalizado,
    } = formData.value
    console.log(credito)
    console.log(tipopago)
    console.log(cliente.value)
    //Validaciones previas
    if (!cliente) throw { message: 'Debe seleccionar un cliente' }
    if (!sucursal || !sucursal.value) throw { message: 'Debe seleccionar una sucursal válida' }
    if (!fecha) throw { message: 'Debe seleccionar una fecha válida' }
    if ((!canal || !canal.value) && pagosDivididos.length === 0)
      throw { message: 'Debe seleccionar un canal de venta válido' }
    if (!cartData.listaProductos || !cartData.listaProductos.length) {
      throw { message: 'El carrito está vacío' }
    }
    const suma_pagos_divididos = decimas(
      pagosDivididos.reduce((sum, dato) => {
        return sum + parseFloat(dato.monto)
      }, 0),
    )
    console.log(suma_pagos_divididos)
    console.log(cartData.ventatotal)
    console.log(variablePago)
    if (
      decimas(suma_pagos_divididos) !== decimas(cartData.ventatotal) &&
      variablePago !== 'directo'
    ) {
      throw { message: 'Los pagos no coinciden con el monto total' }
    }
    console.log('Datos del carrito:', cartData)

    $q.loading.show({ message: 'Procesando venta...', timeout: 30000 })
    loadingShown = true

    //Preparar formulario para envío tipoCambio
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
    cartData.listaFactura.fechaEmision = obtenerHoraISO8601()

    cartData.listaFactura.direccionComprador = direccion
    cartData.listaFactura.puertoDestino = puertodestino
    cartData.listaFactura.lugarDestino = lugardestino
    cartData.listaFactura.incoterm = incoterm
    cartData.listaFactura.tipoCambio = tipoCambio.value
    cartData.listaFactura.montoTotal *= tipoCambio.value
    cartData.listaFactura.montoTotalSujetoIva = cartData.listaFactura.montoTotal

    cartData.listaFactura.incotermDetalle = detalleincoterm
    cartData.listaFactura.numeroDescripcionPaquetesBultos = descripcionPB
    cartData.listaFactura.informacionAdicional = infoadicional
    cartData.puntoVenta = puntoventa.Data.idpuntoventa
    cartData.puntoVentaSin = puntoventa.value
    const form = new FormData()
    form.append('ver', CONSTANTES.ver)
    form.append('tipoventa', CONSTANTES.tipoventa)
    form.append('idusuario', CONSTANTES.idusuario)
    form.append('idempresa', CONSTANTES.idempresa)
    form.append('idcliente', cliente.value)
    form.append('sucursal', sucursal.value)
    form.append('tipodoc', tipodoc.value)
    form.append('nrodoc', nroDoc)
    form.append('fecha', fecha)
    form.append('direccion', direccion)

    form.append('puertodestino', puertodestino)
    form.append('lugardestino', lugardestino)
    form.append('incoterm', incoterm)
    form.append('detalleincoterm', detalleincoterm)
    form.append('descripcionPB', descripcionPB)
    form.append('infoadicional', infoadicional)

    form.append('puntoventa', puntoventa.value)
    if ((!metodoPago || metodoPago.value == null) && pagosDivididos.length > 0) {
      form.append('metodopago', 0)
    } else {
      form.append('metodopago', metodoPago?.id || 0)
    }
    form.append('canal', canal.value)
    form.append('tipopago', credito ? 'credito' : CONSTANTES.tipopago)
    form.append('periodopersonalizado', plazoPersonalizado)
    form.append('jsonDetalles', JSON.stringify(cartData))
    cartData.pagosDivididos = pagosDivididos
    console.log(cartData)
    console.log('Formulario enviado:')
    form.forEach((valor, clave) => console.log(`${clave}: ${valor}`))

    //  Enviar al backend montoTotalMoneda
    // const response = await api.post('', form, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //   },
    // })

    // console.log('Respuesta de la API:', response)

    // if (!response.data || response.data.estado !== 'exito') {
    //   throw { message: response.data?.mensaje || 'Error al procesar la venta', response }
    // }
    const jsonObject = Object.fromEntries(form.entries())

    jsonObject['jsonDetalles'] = cartData
    const json = Object.fromEntries(form.entries())
    json.jsonDetalles = cartData
    //Enviar al backend
    if (process.env.NODE_ENV === 'production') {
      console.log(json)
    }
    const response = await api.post('', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
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
// =======================Expense=======================

const montoNacional = ref(0)
const descNacional = ref('')
const montoInternacional = ref(0)
const descInternacional = ref('')

// Expenses
const gastosNacionales = ref([])
const gastosInternacionales = ref([])

const columnsGastos = [
  { name: 'id', label: 'N°', field: 'id', align: 'center' },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'center' },
  { name: 'monto', label: 'Monto', field: 'monto', align: 'center' },
  { name: 'actions', label: 'Opciones', align: 'center' },
]
const totalGastosNacionales = computed(() =>
  gastosNacionales.value.reduce((total, gasto) => total + parseFloat(gasto.monto), 0).toFixed(2),
)

const totalGastosInternacionales = computed(() =>
  gastosInternacionales.value
    .reduce((total, gasto) => total + parseFloat(gasto.monto), 0)
    .toFixed(2),
)
const agregarGastoNacional = () => {
  const datos = JSON.parse(localStorage.getItem('carrito'))

  if (!descNacional.value || montoNacional.value <= 0) return

  gastosNacionales.value.push({
    id: gastosNacionales.value.length + 1,
    descripcion: descNacional.value,
    monto: parseFloat(montoNacional.value).toFixed(2),
  })
  datos.listaFactura.costosGastosNacionales.push({
    campo: descNacional.value,
    valor: parseFloat(montoNacional.value).toFixed(2),
  })
  datos.listaFactura.totalGastosNacionalesFob = parseFloat(totalGastosNacionales.value).toFixed(2)

  datos.listaFactura.montoTotal =
    Number(parseFloat(totalGastosNacionales.value).toFixed(2)) +
    Number(parseFloat(totalGastosInternacionales.value).toFixed(2)) +
    Number(parseFloat(datos.ventatotal).toFixed(2))
  console.log(datos.listaFactura.montoTotal)
  datos.listaFactura.totalGastosNacionalesFob =
    Number(parseFloat(totalGastosNacionales.value).toFixed(2)) +
    Number(parseFloat(datos.ventatotal).toFixed(2))
  datos.listaFactura.montoTotal =
    Number(parseFloat(totalGastosNacionales.value).toFixed(2)) +
    Number(parseFloat(totalGastosInternacionales.value).toFixed(2)) +
    Number(parseFloat(datos.ventatotal).toFixed(2))
  montoTotalVenta.value = datos.listaFactura.montoTotal
  datos.listaFactura.montoTotalMoneda =
    Number(parseFloat(totalGastosNacionales.value).toFixed(2)) +
    Number(parseFloat(totalGastosInternacionales.value).toFixed(2)) +
    Number(parseFloat(datos.ventatotal).toFixed(2))
  localStorage.setItem('carrito', JSON.stringify(datos))
  // Reset form
  descNacional.value = ''
  montoNacional.value = 0
}

const eliminarGastoNacional = (id) => {
  gastosNacionales.value = gastosNacionales.value.filter((g) => g.id !== id)
  const datosActualizados = JSON.parse(localStorage.getItem('carrito'))

  // Eliminar el elemento del array
  datosActualizados.listaFactura.costosGastosNacionales.splice(id, 1)

  // Actualizar el objeto en el localStorage
  localStorage.setItem('carrito', JSON.stringify(datosActualizados))
}

const agregarGastoInternacional = () => {
  const datos = JSON.parse(localStorage.getItem('carrito'))

  if (!descInternacional.value || montoInternacional.value <= 0) return

  gastosInternacionales.value.push({
    id: gastosInternacionales.value.length + 1,
    descripcion: descInternacional.value,
    monto: parseFloat(montoInternacional.value).toFixed(2),
  })
  datos.listaFactura.costosGastosInternacionales.push({
    campo: descInternacional.value,
    valor: parseFloat(montoInternacional.value).toFixed(2),
  })
  datos.listaFactura.totalGastosInternacionales = parseFloat(
    totalGastosInternacionales.value,
  ).toFixed(2)

  datos.listaFactura.montoTotal =
    Number(parseFloat(totalGastosNacionales.value).toFixed(2)) +
    Number(parseFloat(totalGastosInternacionales.value).toFixed(2)) +
    Number(parseFloat(datos.ventatotal).toFixed(2))

  datos.listaFactura.montoTotal =
    Number(parseFloat(totalGastosNacionales.value).toFixed(2)) +
    Number(parseFloat(totalGastosInternacionales.value).toFixed(2)) +
    Number(parseFloat(datos.ventatotal).toFixed(2))

  datos.listaFactura.montoTotalMoneda =
    Number(parseFloat(totalGastosNacionales.value).toFixed(2)) +
    Number(parseFloat(totalGastosInternacionales.value).toFixed(2)) +
    Number(parseFloat(datos.ventatotal).toFixed(2))

  localStorage.setItem('carrito', JSON.stringify(datos))
  descInternacional.value = ''
  montoInternacional.value = 0
}

const eliminarGastoInternacional = (id) => {
  gastosInternacionales.value = gastosInternacionales.value.filter((g) => g.id !== id)
  const datosActualizados = JSON.parse(localStorage.getItem('carrito'))

  // Eliminar el elemento del array
  datosActualizados.listaFactura.costosGastosInternacionales.splice(id, 1)

  // Actualizar el objeto en el localStorage
  localStorage.setItem('carrito', JSON.stringify(datosActualizados))
}

// ====================== HOOKS ======================

onMounted(() => {
  listaCLientes()
  cargarCanales()
  cargarMetodoPagoFactura()
  cargarPuntoVentas()
  crearFormularioFacturaExportacion()
  actualizarMontoTotalVenta(1)
})
</script>

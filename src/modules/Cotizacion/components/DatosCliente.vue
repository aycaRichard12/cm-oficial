<template>
  <q-card-section class="q-pa-lg">
    <q-form ref="formClientes" class="q-mb-md">
      <div class="row q-col-gutter-lg q-mb-md">
        <div class="col-12 col-md-3">
          <label class="text-weight-bold text-grey-9 q-mb-sm block label-cotizacion">
            Tipo de Operación <span class="text-negative">*</span>
          </label>
          <q-select
            :model-value="tipoOperacion"
            :options="optionOperacion"
            map-options
            :rules="tipoOperacionRules"
            @update:model-value="$emit('update:tipoOperacion', $event)"
            outlined
            dense
            bg-color="white"
            hide-bottom-space
            class="premium-input"
          />
        </div>

        <div class="col-12 col-md-3">
          <label class="text-weight-bold text-grey-9 q-mb-sm block label-cotizacion">
            Fecha <span class="text-negative">*</span>
          </label>
          <q-input
            :model-value="fecha"
            type="date"
            :rules="fechaRules"
            @update:model-value="$emit('update:fecha', $event)"
            outlined
            dense
            bg-color="white"
            hide-bottom-space
            class="premium-input"
          />
        </div>

        <div class="col-12 col-md-6">
          <label class="text-weight-bold text-grey-9 q-mb-sm block label-cotizacion">
            Cliente <span class="text-negative">*</span>
          </label>
          <div class="row no-wrap">
            <q-select
              class="col premium-input"
              :model-value="selectedClient"
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              :options="filteredClients"
              @filter="filterClient"
              @input-value="setClientInputValue"
              @update:model-value="$emit('update:selectedClient', $event)"
              option-value="id"
              option-label="display"
              :rules="clienteRules"
              outlined
              dense
              bg-color="white"
              hide-bottom-space
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey"> No hay resultados </q-item-section>
                </q-item>
              </template>
            </q-select>
            <div class="q-ml-md">
              <q-btn
                color="primary"
                unelevated
                class="full-height shadow-2 btn-square-44"
                icon="person_add"
                @click="$emit('registrar-cliente')"
              >
                <q-tooltip class="bg-primary text-caption shadow-4">
                  Registrar Nuevo Cliente
                </q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-6">
          <label class="text-weight-bold text-grey-9 q-mb-sm block label-cotizacion">
            Sucursal <span class="text-negative">*</span>
          </label>
          <q-select
            :model-value="selectedSucursal"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            :options="filteredSucursales"
            @filter="filterSucursal"
            @input-value="setSucursalInputValue"
            @update:model-value="$emit('update:selectedSucursal', $event)"
            option-value="id"
            option-label="nombre"
            :rules="sucursalRules"
            outlined
            dense
            bg-color="white"
            hide-bottom-space
            class="premium-input"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No hay resultados </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <div class="col-8 col-md-6">
          <label for="canalVenta" class="label-cotizacion">Canal de venta*</label>
          <q-select
            :model-value="canalventa"
            @update:model-value="$emit('update:canalventa', $event)"
            dense
            outlined
            :options="salesChannels"
            option-label="label"
            option-value="value"
            :rules="canalVentaRules"
          >
            <template v-slot:prepend>
              <q-icon name="point_of_sale" color="blue" />
            </template>
          </q-select>
        </div>
      </div>

      <ModalfirmaPage
        :model-value="modalfirmaActivo"
        :id-entidad="selectedClient"
        tipo-operacion="CLIENTE"
        @onSuccess="alTerminarFirma"
        @onError="alFallarFirma"
        @update:model-value="$emit('update:modalfirmaActivo', $event)"
      />
    </q-form>
  </q-card-section>
</template>

<script setup>
import ModalfirmaPage from './ModalfirmaPage.vue'
import {
  tipoOperacionRules,
  fechaRules,
  sucursalRules,
  canalVentaRules,
  clienteRules,
} from 'src/validators/cotizacionValidators'

// Props
defineProps({
  tipoOperacion: Object,
  optionOperacion: Array,
  fecha: String,
  selectedClient: Object,
  filteredClients: Array,
  selectedSucursal: Object,
  filteredSucursales: Array,
  canalventa: [Object, null],
  salesChannels: Array,
  modalfirmaActivo: Boolean,
})

// Emits
const emit = defineEmits([
  'tipo-operacion-change',
  'fecha-change',
  'registrar-cliente',
  'filter-client',
  'set-client-input',
  'elegir-cliente',
  'filter-sucursal',
  'set-sucursal-input',
  'elegir-sucursal',
  'on-success-firma',
  'on-error-firma',
  'update:tipoOperacion',
  'update:fecha',
  'update:selectedClient',
  'update:selectedSucursal',
  'update:canalventa',
  'update:modalfirmaActivo',
])

// Local functions (delegate to parent)
function filterClient(val, update) {
  emit('filter-client', val, update)
}
function setClientInputValue(val) {
  emit('set-client-input', val)
}

function filterSucursal(val, update) {
  emit('filter-sucursal', val, update)
}
function setSucursalInputValue(val) {
  emit('set-sucursal-input', val)
}

function alTerminarFirma(respuesta) {
  emit('on-success-firma', respuesta)
}
function alFallarFirma(err) {
  emit('on-error-firma', err)
}
</script>
